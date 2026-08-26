import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { Database } from '../../shared/database.js';
import { ResourceNotFoundError } from '../../shared/errors.js';
import { InvitationService } from '../assessments/invitation-service.js';
import { InferenceService } from '../inference/inference-service.js';
import { ProjectService } from './project-service.js';

type ProjectParams = { publicId: string };
type BatchParams = ProjectParams & { batchId: string };

export function registerProjectApiRoutes(app: FastifyInstance, db: Database): void {
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const inference = new InferenceService(db);

  app.post('/api/projects', async (request, reply) => {
    const body = (request.body ?? {}) as { name?: string; hierarchy?: unknown };
    const hierarchy = Array.isArray(body.hierarchy) && body.hierarchy.every((path) => typeof path === 'string')
      ? body.hierarchy.join('\n')
      : '';
    const created = projects.create(body.name ?? '', hierarchy);
    return reply.code(201).send({ publicId: created.publicId, adminToken: created.adminSecret, publicUrl: absoluteUrl(request, `/p/${created.publicId}`) });
  });

  app.get('/api/projects/:publicId', async (request) => {
    const context = authorize(request, projects);
    const projectId = String(context.project.id);
    const report = inference.report(projectId, Number(context.project.minimum_group_size));
    return {
      project: { publicId: context.params.publicId, name: context.project.name, minimumGroupSize: context.project.minimum_group_size },
      units: projects.listUnits(projectId),
      invitationBatches: invitations.listBatches(projectId),
      report: sanitizeReport(report),
    };
  });

  app.post('/api/projects/:publicId/invitation-batches', async (request, reply) => {
    const context = authorize(request, projects);
    const body = (request.body ?? {}) as { unitId?: string; quantity?: number };
    const batch = invitations.createBatch(String(context.project.id), body.unitId ?? '', Number(body.quantity));
    return reply.code(201).send({
      batchId: batch.batchId,
      invitationLinks: batch.tokens.map((token) => absoluteUrl(request, `/invite/${token}`)),
    });
  });

  app.post('/api/projects/:publicId/invitation-batches/:batchId/revoke', async (request) => {
    const context = authorize(request, projects);
    const { batchId } = request.params as BatchParams;
    return { revoked: invitations.revokeBatch(String(context.project.id), batchId) };
  });

  app.post('/api/projects/:publicId/invitation-batches/:batchId/reissue', async (request, reply) => {
    const context = authorize(request, projects);
    const { batchId } = request.params as BatchParams;
    const batch = invitations.reissueBatch(String(context.project.id), batchId);
    return reply.code(201).send({ batchId: batch.batchId, invitationLinks: batch.tokens.map((token) => absoluteUrl(request, `/invite/${token}`)) });
  });
}

function authorize(request: FastifyRequest, projects: ProjectService) {
  const params = request.params as ProjectParams;
  const authorization = request.headers.authorization;
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  const project = projects.authorize(params.publicId, token);
  if (!project) throw new ResourceNotFoundError();
  return { params, project };
}

function absoluteUrl(request: FastifyRequest, path: string): string {
  return `${request.protocol}://${request.host}${path}`;
}

function sanitizeReport(report: ReturnType<InferenceService['report']>) {
  const finding = (item: { pattern: string; title: string; intervention: string }) => ({ pattern: item.pattern, title: item.title, intervention: item.intervention });
  return {
    completed: report.completed,
    minimum: report.minimum,
    findings: report.findings.map(finding),
    capabilities: report.capabilities,
    perspectiveGaps: report.perspectiveGaps,
    scopes: report.scopes.map((scope) => ({ path: scope.path, findings: scope.findings.map(finding), capabilities: scope.capabilities, perspectiveGaps: scope.perspectiveGaps })),
  };
}
