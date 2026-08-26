import type { FastifyInstance } from 'fastify';
import { AppError } from '../shared/errors.js';
import { escapeHtml, layout } from '../shared/html.js';

export function configureErrorHandling(app: FastifyInstance): void {
  app.setErrorHandler(async (error, request, reply) => {
    const knownError = error instanceof AppError;
    const requestErrorStatus = knownError ? undefined : clientErrorStatus(error);
    const requestError = requestErrorStatus !== undefined;
    const statusCode = knownError ? error.statusCode : requestErrorStatus ?? 500;
    const message = knownError
      ? error.safeMessage
      : requestError
        ? 'Não foi possível processar a requisição.'
      : 'Ocorreu um problema inesperado. Tente novamente.';

    if (!knownError && !requestError) request.log.error({ err: error, requestId: request.id }, 'unhandled application error');

    if (isApiRequest(request.url)) {
      return reply.code(statusCode).type('application/json').send({
        error: {
          code: knownError ? error.code : requestError ? 'REQUEST_ERROR' : 'INTERNAL_ERROR',
          message,
          requestId: request.id,
        },
      });
    }
    return reply.code(statusCode).type('text/html').send(errorPage(request.id, message));
  });

  app.setNotFoundHandler(async (request, reply) => {
    if (isApiRequest(request.url)) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Recurso não encontrado.', requestId: request.id } });
    return reply.code(404).type('text/html').send(errorPage(request.id, 'Confira o endereço ou volte ao início.', 'Página não encontrada'));
  });
}

function errorPage(requestId: string, message: string, title = 'Não foi possível continuar'): string {
  return layout(title, `<div class="card"><p class="eyebrow">Referência ${escapeHtml(requestId)}</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p><p><a class="button secondary" href="/">Voltar ao início</a></p></div>`);
}

function isApiRequest(url: string): boolean {
  return url === '/api' || url.startsWith('/api/');
}

function clientErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('statusCode' in error)) return undefined;
  const statusCode = (error as { statusCode?: unknown }).statusCode;
  return typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500 ? statusCode : undefined;
}
