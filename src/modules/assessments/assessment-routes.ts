import type { FastifyInstance } from 'fastify';
import type { Database } from '../../shared/database.js';
import { escapeHtml, layout } from '../../shared/html.js';
import { graph, nodeById, profiles, type Profile } from '../catalog/assessment-graph.js';
import { InvitationService } from './invitation-service.js';
import { ParticipationService } from './participation-service.js';

export function registerAssessmentRoutes(app: FastifyInstance, db: Database): void {
  const invitations = new InvitationService(db);
  const participations = new ParticipationService(db);

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
    if (!participation) return reply.code(404).send('Participação não encontrada');
    if (participation.status === 'completed') return reply.type('text/html').send(layout('Obrigado', '<div class="card"><p class="eyebrow">Concluído</p><h1>Obrigado pela participação</h1><p>Suas respostas foram registradas anonimamente. Por segurança, elas e o percurso não são exibidos novamente.</p></div>'));
    const node = nodeById(participation.current_node);
    if (!node) return reply.code(500).send('Nó do assessment não encontrado');
    const index = graph.findIndex((item) => item.id === node.id);
    const progress = graph.map((_, itemIndex) => `<li class="${itemIndex <= index ? 'done' : ''}"></li>`).join('');
    const choices = node.options.map((option) => `<label class="choice"><input type="radio" name="optionId" value="${escapeHtml(option.id)}" required><span>${escapeHtml(option.label)}</span></label>`).join('');
    const profile = profiles[participation.profile as Profile] ?? 'Participante';
    return reply.type('text/html').send(layout(node.title, `<header><p class="eyebrow">${escapeHtml(profile)} · cenário ${index + 1} de ${graph.length}</p><ol class="progress">${progress}</ol><h1>${escapeHtml(node.title)}</h1><p class="lead">${escapeHtml(node.scenario)}</p></header><form class="card" method="post" action="/respond/${resumeToken}"><h2>${escapeHtml(node.prompt)}</h2>${choices}<button type="submit">Continuar</button></form><p class="muted"><small>Responda pelo que normalmente acontece, não pelo processo ideal. Não existe alternativa ligada a uma ferramenta específica.</small></p>`));
  });

  app.post('/respond/:resumeToken', async (request, reply) => {
    const { resumeToken } = request.params as { resumeToken: string };
    const body = request.body as { optionId?: string };
    if (!body.optionId) return reply.code(400).send('Escolha uma alternativa');
    const result = participations.answer(resumeToken, body.optionId);
    if (result === 'invalid') return reply.redirect(`/respond/${resumeToken}`);
    return reply.redirect(`/respond/${resumeToken}`);
  });
}

