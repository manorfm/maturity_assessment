import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import { CatalogService } from '../src/modules/catalog/catalog-service.js';
import { ProjectService } from '../src/modules/projects/project-service.js';
import { InvitationService } from '../src/modules/assessments/invitation-service.js';
import { ParticipationService } from '../src/modules/assessments/participation-service.js';
import { edges, graph, GRAPH_VERSION } from '../src/modules/catalog/assessment-graph.js';
import {
  groupErrorReferent,
  listTechniqueNodeId,
  metricManipulationList,
} from '../src/modules/catalog/item-catalog.js';
import { aggregateListTechnique } from '../src/modules/inference/domain/list-technique-aggregate.js';
import { InferenceService } from '../src/modules/inference/inference-service.js';
import { runOrganizationalSynthetic } from '../src/modules/inference/domain/organizational-synthetic.js';
import { auditItemCatalog } from '../src/modules/catalog/item-type-audit.js';

const controlId = listTechniqueNodeId(metricManipulationList, 'control');
const treatmentId = listTechniqueNodeId(metricManipulationList, 'treatment');

test('técnica de lista está no tronco após o referente de grupo, com braços controle e tratamento', () => {
  assert.ok(graph.some((node) => node.id === controlId));
  assert.ok(graph.some((node) => node.id === treatmentId));
  assert.ok(edges.some((edge) => edge.from === groupErrorReferent.id && edge.to === controlId));
  const fromList = edges.filter((edge) => edge.from === controlId || edge.from === treatmentId);
  assert.ok(fromList.some((edge) => edge.to === 'urgent-change'));
  assert.ok(fromList.some((edge) => edge.to === 'ready-to-release'));

  const control = graph.find((item) => item.id === controlId)!;
  const treatment = graph.find((item) => item.id === treatmentId)!;
  assert.equal(control.options.filter((option) => option.id.startsWith('count-')).length, 5);
  assert.equal(treatment.options.filter((option) => option.id.startsWith('count-')).length, 6);
  assert.ok(control.options.every((option) => option.signals.length === 0));
  assert.ok(treatment.options.every((option) => option.signals.length === 0));
  assert.doesNotMatch(control.scenario, /ajustou a forma de contar/i);
  assert.match(treatment.scenario, /ajustou a forma de contar/i);
  assert.equal(auditItemCatalog([metricManipulationList]).filter((issue) => issue.severity === 'error').length, 0);
});

test('jornada atribui um braço da lista depois do clima de grupo', () => {
  const db = createDatabase(':memory:');
  const catalog = new CatalogService(db);
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const participations = new ParticipationService(db);
  const created = projects.create('Lista tronco', 'Org/Time');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const unit = projects.listUnits(String(project.id)).at(-1)!;
  const [token] = invitations.createBatch(String(project.id), unit.id, 1).tokens;
  const claimed = invitations.claim(token!) as { resumeToken: string };

  participations.answer(claimed.resumeToken, 'engineering');
  participations.answer(claimed.resumeToken, 'build-and-operate');
  participations.answer(claimed.resumeToken, 'ritual');
  participations.answer(claimed.resumeToken, 'stop-starting');
  participations.answer(claimed.resumeToken, 'learn');
  const current = participations.find(claimed.resumeToken)?.current_node;
  assert.ok(current === controlId || current === treatmentId, `expected list arm, got ${current}`);

  const node = catalog.getNode(GRAPH_VERSION, current!, 'engineering')!;
  assert.match(node.title, /métrica|práticas/i);
  participations.answer(claimed.resumeToken, 'count-2');
  assert.notEqual(participations.find(claimed.resumeToken)?.current_node, current);
});

test('agrega prevalência só com ≥ 40 por braço e intervalo', () => {
  const unpublished = aggregateListTechnique({
    answers: [
      ...Array.from({ length: 20 }, () => ({ arm: 'control' as const, count: 2 })),
      ...Array.from({ length: 20 }, () => ({ arm: 'treatment' as const, count: 3 })),
    ],
    minimumPerArm: 40,
  });
  assert.equal(unpublished.published, false);

  const published = aggregateListTechnique({
    answers: [
      ...Array.from({ length: 40 }, () => ({ arm: 'control' as const, count: 2 })),
      ...Array.from({ length: 40 }, () => ({ arm: 'treatment' as const, count: 3 })),
    ],
    minimumPerArm: 40,
  });
  assert.equal(published.published, true);
  assert.equal(published.controlN, 40);
  assert.equal(published.treatmentN, 40);
  assert.equal(published.prevalence, 1);
  assert.ok(published.interval);
  assert.ok(published.interval![0] < published.prevalence!);
  assert.ok(published.interval![1] > published.prevalence!);
});

test('relatório inclui técnica de lista sem publicar abaixo do limiar nos sintéticos', () => {
  const db = createDatabase(':memory:');
  const { projectId } = runOrganizationalSynthetic(db, { band: 'medium' });
  const report = new InferenceService(db).report(projectId, 5);
  assert.ok(report.listTechnique);
  assert.equal(report.listTechnique.published, false);
  assert.ok(report.listTechnique.controlN + report.listTechnique.treatmentN >= 5);
});
