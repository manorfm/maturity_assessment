import type { FastifyInstance } from 'fastify';
import type { Database } from '../../shared/database.js';
import { layout } from '../../shared/html.js';
import { estimateRemainingMinutes } from '../catalog/assessment-graph.js';
import { CatalogService } from '../catalog/catalog-service.js';
import { InvitationService } from './invitation-service.js';
import { ParticipationService } from './participation-service.js';
import { ResourceNotFoundError } from '../../shared/errors.js';
import { orderAssessmentOptions } from './answer-order.js';
import {
  interviewProgressPercent,
  renderInterviewComplete,
  renderInterviewQuestion,
  renderInterviewStatus,
  renderInterviewWelcome,
} from './interview-view.js';
import { projectInterviewStep, projectInterviewWelcome } from './domain/interview-step.js';
import { itemCatalog } from '../catalog/item-catalog.js';

export function registerAssessmentRoutes(app: FastifyInstance, db: Database): void {
  const invitations = new InvitationService(db);
  const participations = new ParticipationService(db);
  const catalog = new CatalogService(db);

  app.get('/invite/:token', async (request, reply) => {
    const { token } = request.params as { token: string };
    const result = invitations.claim(token);
    if (result === 'used') {
      return reply.type('text/html').send(layout('Participação registrada', renderInterviewStatus({
        kicker: 'Convite utilizado',
        title: 'Esta participação já foi iniciada ou concluída',
        lead: 'Nenhuma resposta ou resultado é exibido ao reabrir o convite. Use o endereço de retomada recebido no primeiro acesso, se ainda não concluiu.',
      })));
    }
    if (result === 'invalid') {
      return reply.code(404).type('text/html').send(layout('Convite inválido', renderInterviewStatus({
        kicker: 'Convite',
        title: 'Convite inválido ou expirado',
        lead: 'Solicite um novo link ao responsável pelo projeto.',
      })));
    }
    return reply.redirect(`/respond/${result.resumeToken}`);
  });

  app.get('/respond/:resumeToken', async (request, reply) => {
    const { resumeToken } = request.params as { resumeToken: string };
    const participation = participations.find(resumeToken);
    if (!participation) throw new ResourceNotFoundError('Participação não encontrada.');
    if (participation.status === 'completed') {
      return reply.type('text/html').send(layout('Obrigado', renderInterviewComplete()));
    }
    if (participations.introPending(participation.id)) {
      const minutes = estimateRemainingMinutes(participation.current_node, participation.profile, participation.workContext?.interviewTrack);
      const welcome = projectInterviewWelcome(minutes);
      return reply.type('text/html').send(layout(welcome.title, renderInterviewWelcome({
        ...welcome,
        action: `/respond/${resumeToken}/intro`,
      })));
    }
    const node = catalog.getNode(participation.graph_version, participation.current_node, participation.profile);
    if (!node) throw new Error('Published assessment node was not found');
    const remainingMinutes = estimateRemainingMinutes(node.id, participation.profile, participation.workContext?.interviewTrack);
    const budgetMinutes = estimateRemainingMinutes('respondent-context', participation.profile);
    const progressLabel = node.type === 'probe'
      ? `aprofundamento · cerca de ${remainingMinutes} minuto${remainingMinutes === 1 ? '' : 's'} restante${remainingMinutes === 1 ? '' : 's'}`
      : `cerca de ${remainingMinutes} minuto${remainingMinutes === 1 ? '' : 's'} restante${remainingMinutes === 1 ? '' : 's'}`;
    const step = projectInterviewStep(node);
    const options = orderAssessmentOptions(node.options, resumeToken, node.id);
    const isFreeText = step.kind === 'example';
    const literacyItem = step.kind === 'reading'
      ? itemCatalog.find((item) => item.kind === 'literacy' && item.id === node.id)
      : undefined;
    const readingFigure = literacyItem?.kind === 'literacy' && literacyItem.series
      ? {
        ariaLabel: literacyItem.stimulus,
        stages: literacyItem.series.stages,
        values: literacyItem.series.values,
      }
      : undefined;
    return reply.type('text/html').send(layout(node.title, renderInterviewQuestion({
      kicker: step.kicker,
      title: node.title,
      lead: node.scenario,
      why: step.why,
      prompt: node.prompt,
      progressLabel,
      progressPercent: interviewProgressPercent(remainingMinutes, budgetMinutes),
      action: `/respond/${resumeToken}`,
      options: isFreeText ? options.filter((option) => option.id === 'skip' || (option.observation ?? 'practice') !== 'practice') : options,
      nodeId: node.id,
      ...(isFreeText && step.maxChars ? { freeText: { maxChars: step.maxChars, submitOptionId: 'submitted' } } : {}),
      ...(step.kind === 'reading' ? { kind: 'reading' as const, ...(readingFigure ? { readingFigure } : {}) } : {}),
    })));
  });

  app.post('/respond/:resumeToken/intro', async (request, reply) => {
    const { resumeToken } = request.params as { resumeToken: string };
    participations.acknowledgeIntro(resumeToken);
    return reply.redirect(`/respond/${resumeToken}`);
  });

  app.post('/respond/:resumeToken', async (request, reply) => {
    const { resumeToken } = request.params as { resumeToken: string };
    const body = (request.body ?? {}) as { optionId?: string; freeText?: string };
    if (!body.optionId) return reply.code(400).send('Escolha uma alternativa');
    const result = participations.answer(resumeToken, body.optionId, body.freeText ? { freeText: body.freeText } : undefined);
    if (result === 'invalid') return reply.redirect(`/respond/${resumeToken}`);
    return reply.redirect(`/respond/${resumeToken}`);
  });
}
