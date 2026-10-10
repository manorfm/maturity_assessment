import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import { CatalogService } from '../src/modules/catalog/catalog-service.js';
import { ProjectService } from '../src/modules/projects/project-service.js';
import { InvitationService } from '../src/modules/assessments/invitation-service.js';
import { ParticipationService } from '../src/modules/assessments/participation-service.js';
import { edges, graph, GRAPH_VERSION } from '../src/modules/catalog/assessment-graph.js';
import { groupErrorReferent, literacyWipChart } from '../src/modules/catalog/item-catalog.js';
import { auditItemCatalog } from '../src/modules/catalog/item-type-audit.js';

test('referente de grupo está no tronco após a leitura e usa linguagem de grupo', () => {
  assert.ok(graph.some((node) => node.id === groupErrorReferent.id));
  assert.ok(edges.some((edge) => edge.from === literacyWipChart.id && edge.to === groupErrorReferent.id));
  const fromGroup = edges.filter((edge) => edge.from === groupErrorReferent.id);
  assert.ok(fromGroup.some((edge) => edge.to === 'urgent-change'));
  assert.ok(fromGroup.some((edge) => edge.to === 'ready-to-release'));

  const node = graph.find((item) => item.id === groupErrorReferent.id)!;
  assert.match(`${node.scenario} ${node.prompt}`, /neste time/i);
  assert.doesNotMatch(`${node.scenario} ${node.prompt}`, /\bquando eu\b/i);
  assert.ok(node.options.some((option) => option.signals.some((signal) => signal.details.includes('leadership-management'))));
  assert.equal(auditItemCatalog([groupErrorReferent]).filter((issue) => issue.severity === 'error').length, 0);
});

test('jornada encontra referente de grupo depois da leitura', () => {
  const db = createDatabase(':memory:');
  const catalog = new CatalogService(db);
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const participations = new ParticipationService(db);
  const created = projects.create('Grupo tronco', 'Org/Time');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const unit = projects.listUnits(String(project.id)).at(-1)!;
  const [token] = invitations.createBatch(String(project.id), unit.id, 1).tokens;
  const claimed = invitations.claim(token!) as { resumeToken: string };

  participations.answer(claimed.resumeToken, 'engineering');
  participations.answer(claimed.resumeToken, 'build-and-operate');
  participations.answer(claimed.resumeToken, 'ritual');
  participations.answer(claimed.resumeToken, 'stop-starting');
  assert.equal(participations.find(claimed.resumeToken)?.current_node, groupErrorReferent.id);

  const node = catalog.getNode(GRAPH_VERSION, groupErrorReferent.id, 'engineering')!;
  assert.equal(node.title, groupErrorReferent.title);
  participations.answer(claimed.resumeToken, 'learn');
  assert.notEqual(participations.find(claimed.resumeToken)?.current_node, groupErrorReferent.id);
});
