import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import { CatalogService } from '../src/modules/catalog/catalog-service.js';
import { ProjectService } from '../src/modules/projects/project-service.js';
import { InvitationService } from '../src/modules/assessments/invitation-service.js';
import { ParticipationService } from '../src/modules/assessments/participation-service.js';
import { edges, graph, GRAPH_VERSION } from '../src/modules/catalog/assessment-graph.js';
import { approvalChangeVignette } from '../src/modules/catalog/item-catalog.js';

test('vinheta de ancoragem está no tronco do grafo após work-context', () => {
  assert.ok(graph.some((node) => node.id === approvalChangeVignette.id));
  const fromWork = edges.filter((edge) => edge.from === 'work-context');
  assert.ok(fromWork.length > 0);
  assert.ok(fromWork.every((edge) => edge.to === approvalChangeVignette.id), 'todo o tronco passa pela vinheta');
  const fromVignette = edges.filter((edge) => edge.from === approvalChangeVignette.id);
  assert.ok(fromVignette.every((edge) => edge.to === 'literacy-wip-chart'));
});

test('jornada real encontra a vinheta depois do contexto de trabalho', () => {
  const db = createDatabase(':memory:');
  new CatalogService(db);
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const participations = new ParticipationService(db);
  const catalog = new CatalogService(db);
  const created = projects.create('Vinheta tronco', 'Org/Time');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const unit = projects.listUnits(String(project.id)).at(-1)!;
  const [token] = invitations.createBatch(String(project.id), unit.id, 1).tokens;
  const claimed = invitations.claim(token!) as { resumeToken: string };

  participations.answer(claimed.resumeToken, 'engineering');
  assert.equal(participations.find(claimed.resumeToken)?.current_node, 'work-context');
  participations.answer(claimed.resumeToken, 'build-and-operate');
  assert.equal(participations.find(claimed.resumeToken)?.current_node, approvalChangeVignette.id);

  const node = catalog.getNode(GRAPH_VERSION, approvalChangeVignette.id, 'engineering');
  assert.ok(node);
  assert.equal(node.title, approvalChangeVignette.title);
  const option = node.options.find((item) => item.id === 'ritual') ?? node.options[0]!;
  participations.answer(claimed.resumeToken, option.id);
  const after = participations.find(claimed.resumeToken)!;
  assert.equal(after.current_node, 'literacy-wip-chart');
});
