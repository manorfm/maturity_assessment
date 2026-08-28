import type { FastifyInstance } from 'fastify';
import type { Database } from '../../shared/database.js';
import { escapeHtml, layout } from '../../shared/html.js';
import { profiles, type Profile, estimateRemainingMinutes } from '../catalog/assessment-graph.js';
import { CatalogService } from '../catalog/catalog-service.js';
import { InvitationService } from './invitation-service.js';
import { ParticipationService } from './participation-service.js';
import { ResourceNotFoundError } from '../../shared/errors.js';

export function registerAssessmentRoutes(app: FastifyInstance, db: Database): void {
  const invitations = new InvitationService(db);
  const participations = new ParticipationService(db);
  const catalog = new CatalogService(db);

  app.get('/invite/:token', async (request, reply) => {
    const { token } = request.params as { token: string };
    const result = invitations.claim(token);
    if (result === 'used') return reply.type('text/html').send(layout('Participação registrada', '<div class="card"><p class="eyebrow">Convite utilizado</p><h1>Esta participação já foi iniciada ou concluída</h1><p>Nenhuma resposta ou resultado é exibido ao reabrir o convite. Use o endereço de retomada recebido no primeiro acesso, se ainda não concluiu.</p></div>'));
    if (result === 'invalid') return reply.code(404).type('text/html').send(layout('Convite inválido', '<div class="card"><h1>Convite inválido ou expirado</h1><p>Solicite um novo link ao responsável pelo projeto.</p></div>'));
    return reply.redirect(`/respond/${result.resumeToken}`);
  });

  app.get('/respond/:resumeToken', async (request, reply) => {
    const { resumeToken } = request.params as { resumeToken: string };
    const participation = participations.find(resumeToken);
    if (!participation) throw new ResourceNotFoundError('Participação não encontrada.');
    if (participation.status === 'completed') return reply.type('text/html').send(layout('Obrigado', '<div class="card"><p class="eyebrow">Concluído</p><h1>Obrigado pela participação</h1><p>Suas respostas foram registradas anonimamente. Por segurança, elas e o percurso não são exibidos novamente.</p></div>'));
    const node = catalog.getNode(participation.graph_version, participation.current_node, participation.profile);
    if (!node) throw new Error('Published assessment node was not found');
    const answered = participations.answeredCount(participation.id);
    const remainingMinutes = estimateRemainingMinutes(node.id, participation.profile);
    const choices = node.options.map((option) => `<label class="choice"><input type="radio" name="optionId" value="${escapeHtml(option.id)}" required><span>${escapeHtml(option.label)}</span></label>`).join('');
    const profile = profiles[participation.profile as Profile] ?? 'Participante';
    const progress = node.type === 'probe'
      ? `aprofundamento após ${answered} cenários`
      : `etapa ${answered + 1} · cerca de ${remainingMinutes} minuto${remainingMinutes === 1 ? '' : 's'} restante${remainingMinutes === 1 ? '' : 's'}`;
    return reply.type('text/html').send(layout(node.title, `<header><p class="eyebrow">${escapeHtml(profile)} · ${progress}</p><h1>${escapeHtml(node.title)}</h1><p class="lead">${escapeHtml(node.scenario)}</p></header><form class="card" data-assessment-node="${escapeHtml(node.id)}" method="post" action="/respond/${resumeToken}"><h2>${escapeHtml(node.prompt)}</h2>${choices}<button type="submit">Continuar</button></form><p class="notice">Guarde este endereço para retomar se precisar pausar. O convite original não reabre a entrevista.</p><p class="muted"><small>Responda pelo que normalmente acontece, não pelo processo ideal. Não existe alternativa ligada a uma ferramenta específica. No fim podem aparecer até cinco perguntas extras para esclarecer uma causa.</small></p>`));
  });

  app.post('/respond/:resumeToken', async (request, reply) => {
    const { resumeToken } = request.params as { resumeToken: string };
    const body = (request.body ?? {}) as { optionId?: string };
    if (!body.optionId) return reply.code(400).send('Escolha uma alternativa');
    const result = participations.answer(resumeToken, body.optionId);
    if (result === 'invalid') return reply.redirect(`/respond/${resumeToken}`);
    return reply.redirect(`/respond/${resumeToken}`);
  });
}
