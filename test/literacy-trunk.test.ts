import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import { CatalogService } from '../src/modules/catalog/catalog-service.js';
import { ProjectService } from '../src/modules/projects/project-service.js';
import { InvitationService } from '../src/modules/assessments/invitation-service.js';
import { ParticipationService } from '../src/modules/assessments/participation-service.js';
import { edges, graph, GRAPH_VERSION } from '../src/modules/catalog/assessment-graph.js';
import { approvalChangeVignette, literacyWipChart } from '../src/modules/catalog/item-catalog.js';
import { aggregateLiteracy } from '../src/modules/inference/domain/literacy-aggregate.js';
import { InferenceService } from '../src/modules/inference/inference-service.js';
import { runOrganizationalSynthetic } from '../src/modules/inference/domain/organizational-synthetic.js';

test('item de leitura está no tronco após a vinheta', () => {
  assert.ok(graph.some((node) => node.id === literacyWipChart.id));
  assert.ok(edges.some((edge) => edge.from === approvalChangeVignette.id && edge.to === literacyWipChart.id));
  const fromLiteracy = edges.filter((edge) => edge.from === literacyWipChart.id);
  assert.ok(fromLiteracy.some((edge) => edge.to === 'urgent-change'));
  assert.ok(fromLiteracy.some((edge) => edge.to === 'ready-to-release'));
  const node = graph.find((item) => item.id === literacyWipChart.id)!;
  assert.match(node.scenario, /aguardando teste/i);
  assert.ok(node.options.every((option) => option.signals.length === 0));
});

test('jornada encontra leitura depois da vinheta', () => {
  const db = createDatabase(':memory:');
  const catalog = new CatalogService(db);
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const participations = new ParticipationService(db);
  const created = projects.create('Literacy tronco', 'Org/Time');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const unit = projects.listUnits(String(project.id)).at(-1)!;
  const [token] = invitations.createBatch(String(project.id), unit.id, 1).tokens;
  const claimed = invitations.claim(token!) as { resumeToken: string };

  participations.answer(claimed.resumeToken, 'engineering');
  participations.answer(claimed.resumeToken, 'build-and-operate');
  assert.equal(participations.find(claimed.resumeToken)?.current_node, approvalChangeVignette.id);
  participations.answer(claimed.resumeToken, 'ritual');
  assert.equal(participations.find(claimed.resumeToken)?.current_node, literacyWipChart.id);

  const node = catalog.getNode(GRAPH_VERSION, literacyWipChart.id, 'engineering')!;
  assert.equal(node.title, literacyWipChart.title);
  participations.answer(claimed.resumeToken, 'stop-starting');
  assert.notEqual(participations.find(claimed.resumeToken)?.current_node, literacyWipChart.id);
});

test('agrega letramento só acima do limiar e separa da prática', () => {
  const unpublished = aggregateLiteracy({
    answers: [
      { optionId: 'stop-starting' },
      { optionId: 'faster-dev' },
      { optionId: 'cannot-read' },
    ],
    minimum: 5,
    readings: literacyWipChart.readings,
  });
  assert.equal(unpublished.published, false);
  assert.equal(unpublished.n, 3);

  const published = aggregateLiteracy({
    answers: [
      { optionId: 'stop-starting' },
      { optionId: 'stop-starting' },
      { optionId: 'faster-dev' },
      { optionId: 'hire-devs' },
      { optionId: 'cannot-read' },
    ],
    minimum: 5,
    readings: literacyWipChart.readings,
  });
  assert.equal(published.published, true);
  assert.equal(published.n, 5);
  assert.equal(published.correctRate, 0.4);
  assert.equal(published.absentRate, 0.2);
  assert.equal(published.incorrectRate, 0.4);
});

test('relatório publica letramento agregado nos sintéticos', () => {
  const db = createDatabase(':memory:');
  const { projectId } = runOrganizationalSynthetic(db, { band: 'medium' });
  const report = new InferenceService(db).report(projectId, 5);
  assert.ok(report.literacy);
  assert.equal(report.literacy.published, true);
  assert.ok(report.literacy.n! >= 5);
});
