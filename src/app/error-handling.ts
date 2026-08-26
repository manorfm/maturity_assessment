import type { FastifyInstance } from 'fastify';
import { AppError } from '../shared/errors.js';
import { escapeHtml, layout } from '../shared/html.js';

export function configureErrorHandling(app: FastifyInstance): void {
  app.setErrorHandler(async (error, request, reply) => {
    const knownError = error instanceof AppError;
    const statusCode = knownError ? error.statusCode : 500;
    const message = knownError
      ? error.safeMessage
      : 'Ocorreu um problema inesperado. Tente novamente.';

    if (!knownError) request.log.error({ err: error, requestId: request.id }, 'unhandled application error');

    return reply.code(statusCode).type('text/html').send(errorPage(request.id, message));
  });

  app.setNotFoundHandler(async (request, reply) =>
    reply.code(404).type('text/html').send(errorPage(request.id, 'Confira o endereço ou volte ao início.', 'Página não encontrada')),
  );
}

function errorPage(requestId: string, message: string, title = 'Não foi possível continuar'): string {
  return layout(title, `<div class="card"><p class="eyebrow">Referência ${escapeHtml(requestId)}</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p><p><a class="button secondary" href="/">Voltar ao início</a></p></div>`);
}

