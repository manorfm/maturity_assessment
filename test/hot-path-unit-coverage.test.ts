import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import { CatalogService } from '../src/modules/catalog/catalog-service.js';
import { ProjectService } from '../src/modules/projects/project-service.js';
import { AdaptiveJourneyService } from '../src/modules/assessments/adaptive-journey-service.js';
import { AdaptiveQuestionSelector } from '../src/modules/inference/domain/adaptive-question-selector.js';
import { BayesianInferenceEngine } from '../src/modules/inference/domain/bayesian-inference-engine.js';
import { DiagnosticModel } from '../src/modules/inference/domain/diagnostic-model.js';
import { runOrganizationalSynthetic } from '../src/modules/inference/domain/organizational-synthetic.js';
import { InferenceService } from '../src/modules/inference/inference-service.js';

const model = DiagnosticModel.create({
  version: 'hot-path-coverage',
  families: [{
    id: 'delivery',
    capability: 'entrega',
    hypotheses: [
      { id: 'tooling', label: 'Ferramenta', prior: 0.3 },
      { id: 'process', label: 'Processo', prior: 0.3 },
      { id: 'unknown', label: 'Indeterminado', prior: 0.4 },
    ],
    evidence: [{
      pattern: 'slow-feedback',
      group: 'symptom',
      likelihoods: { tooling: 0.8, process: 0.2, unknown: 0.4 },
    }],
  }],
});

test('restrição de cobertura só ativa com folha já coberta na unidade', () => {
  const posterior = new BayesianInferenceEngine().infer(model, ['slow-feedback'])[0]!;
  const discriminating = [
    { probability: 0.5, likelihoods: { tooling: 0.9, process: 0.1, unknown: 0.4 } },
    { probability: 0.5, likelihoods: { tooling: 0.1, process: 0.9, unknown: 0.4 } },
  ];
  const candidates = [
    { id: 'covered', cost: 0.2, coverage: 0, validationNeed: 0.5, leafId: 'work-management', outcomes: discriminating, minutes: 1 },
    { id: 'sparse', cost: 0.2, coverage: 0, validationNeed: 0.5, leafId: 'continuous-integration', outcomes: discriminating, minutes: 1.2 },
  ];

  const beforeMatrix = new AdaptiveQuestionSelector().select(posterior, candidates, {
    leafCoverage: {
      'continuous-integration': { testlets: 0, perspectives: 0 },
      'work-management': { testlets: 1, perspectives: 1 },
    },
  });
  // Sem folha ≥2 testlets e ≥2 perspectivas, não restringe ao pool escasso.
  assert.equal(beforeMatrix?.id, 'covered');

  const afterMatrix = new AdaptiveQuestionSelector().select(posterior, candidates, {
    leafCoverage: {
      'continuous-integration': { testlets: 0, perspectives: 0 },
      'work-management': { testlets: 3, perspectives: 2 },
    },
  });
  assert.equal(afterMatrix?.id, 'sparse');
});

test('caminho quente selectAfterTerminal usa cobertura matricial da unidade', () => {
  const db = createDatabase(':memory:');
  new CatalogService(db);
  const projects = new ProjectService(db);
  const created = projects.create('Hot path cobertura', 'Org/Time');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const projectId = String(project.id);
  const unitId = projects.listUnits(projectId).find((unit) => unit.isLeaf)!.id;

  for (const [index, profile] of ['engineering', 'platform'].entries()) {
    const participationId = `done-hot-${index}`;
    db.prepare(`INSERT INTO participations (id, project_id, unit_id, profile, work_context_json, resume_hash, graph_version, status, current_node, created_at, completed_at)
      VALUES (?, ?, ?, ?, '{}', ?, 'evidence-anamnesis-pilot-v21', 'completed', 'done', datetime('now'), datetime('now'))`)
      .run(participationId, projectId, unitId, profile, `hash-hot-${index}`);
    db.prepare('INSERT INTO responses (id, participation_id, node_id, option_id, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))')
      .run(`rh-${index}-a`, participationId, 'integration-cadence', 'isolated-days');
    db.prepare('INSERT INTO responses (id, participation_id, node_id, option_id, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))')
      .run(`rh-${index}-b`, participationId, 'shared-change', 'before-release');
  }

  const liveId = 'live-hot';
  db.prepare(`INSERT INTO participations (id, project_id, unit_id, profile, work_context_json, resume_hash, graph_version, status, current_node, created_at)
    VALUES (?, ?, ?, 'engineering', '{}', 'hash-live-hot', 'evidence-anamnesis-pilot-v21', 'in_progress', 'integration-cadence', datetime('now'))`)
    .run(liveId, projectId, unitId);
  db.prepare('INSERT INTO responses (id, participation_id, node_id, option_id, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))')
    .run('rlh-a', liveId, 'integration-cadence', 'isolated-days');

  const journey = new AdaptiveJourneyService(db);
  const viaHotPath = journey.selectAfterTerminal(liveId, 'engineering', 'evidence-anamnesis-pilot-v21');
  const viaCoverage = journey.selectWithUnitCoverage(liveId, 'engineering', 'evidence-anamnesis-pilot-v21');
  // Ambos compartilham o mesmo seletor com cobertura no caminho quente.
  assert.equal(viaHotPath, viaCoverage);
});

test('sintéticos m2 continuam publicando índice após cobertura no caminho quente', () => {
  const db = createDatabase(':memory:');
  const { projectId } = runOrganizationalSynthetic(db, { band: 'medium' });
  const report = new InferenceService(db).report(projectId, 5);
  assert.equal(report.measurementModel, 'm2');
  assert.ok(report.index);
  assert.equal(report.index.published, true);
  assert.ok(report.findings.length >= 2);
});
