import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  CAUSAL_CATALOG_VERSION,
  causalCatalog,
  lateIntegrationFamily,
} from '../src/modules/inference/domain/causal-catalog.js';
import { CausalInferenceEngine } from '../src/modules/inference/domain/causal-inference-engine.js';
import { CAUSAL_KNOWLEDGE_VERSION } from '../src/modules/inference/domain/causal-knowledge-graph.js';
import { createDatabase } from '../src/shared/database.js';
import { CatalogService } from '../src/modules/catalog/catalog-service.js';
import { ProjectService } from '../src/modules/projects/project-service.js';
import { InferenceService } from '../src/modules/inference/inference-service.js';

test('catálogo causal vigente é v11 e carrega a família de integração tardia', () => {
  assert.equal(CAUSAL_CATALOG_VERSION, 'causal-catalog-v11');
  assert.equal(CAUSAL_KNOWLEDGE_VERSION, 'causal-catalog-v11');
  assert.equal(lateIntegrationFamily.id, 'late-integration');
  assert.ok(lateIntegrationFamily.provenance.author);
  assert.ok(lateIntegrationFamily.provenance.rationale);
  assert.ok(causalCatalog.some((family) => family.id === 'late-integration'));
});

test('§8.4: explaining away pela CausalFamily do catálogo v11', () => {
  const engine = new CausalInferenceEngine();
  const onlyWait = engine.inferFamily(lateIntegrationFamily, {
    'pr-espera': { present: 6, total: 10 },
  });
  assert.deepEqual(onlyWait.posteriors, {
    'feedback-lento': 0.57,
    'aprovacao-externa': 0.47,
    'fronteira-de-times': 0.26,
  });

  const withApproval = engine.inferFamily(lateIntegrationFamily, {
    'pr-espera': { present: 6, total: 10 },
    'aprovacao-necessaria': { present: 7, total: 10 },
  });
  assert.deepEqual(withApproval.posteriors, {
    'feedback-lento': 0.45,
    'aprovacao-externa': 0.88,
    'fronteira-de-times': 0.26,
  });
  assert.ok(withApproval.posteriors['aprovacao-externa']! > onlyWait.posteriors['feedback-lento']!);
  assert.ok(withApproval.posteriors['feedback-lento']! < onlyWait.posteriors['feedback-lento']!);

  const withConflict = engine.inferFamily(lateIntegrationFamily, {
    'pr-espera': { present: 6, total: 10 },
    'aprovacao-necessaria': { present: 7, total: 10 },
    'conflito-mesmo-servico': { present: 1, total: 10 },
  });
  assert.deepEqual(withConflict.posteriors, {
    'feedback-lento': 0.45,
    'aprovacao-externa': 0.90,
    'fronteira-de-times': 0.11,
  });
});

test('motor causal usa todos os sintomas observados; não descarta por grupo', () => {
  const engine = new CausalInferenceEngine();
  const result = engine.inferFamily(lateIntegrationFamily, {
    'pr-espera': { present: 6, total: 10 },
    'aprovacao-necessaria': { present: 7, total: 10 },
  });
  assert.deepEqual(result.evidenceUsed.sort(), ['aprovacao-necessaria', 'pr-espera']);
  assert.deepEqual(result.ignoredEvidence, []);
  assert.equal(result.modelVersion, CAUSAL_CATALOG_VERSION);
  assert.ok(!result.hypotheses.some((item) => item.id === 'unknown'));
});

test('alias de padrão do grafo alimenta a mesma família §8.4', () => {
  const engine = new CausalInferenceEngine();
  const byAlias = engine.inferFromPatterns(lateIntegrationFamily, [
    { pattern: 'integracao-tardia', support: 6, applicablePopulation: 10 },
    { pattern: 'causa-processo-lote', support: 7, applicablePopulation: 10 },
  ]);
  assert.equal(byAlias.posteriors['aprovacao-externa'], 0.88);
  assert.equal(byAlias.posteriors['feedback-lento'], 0.45);
});

test('inference-service expõe posterior causal v11 quando há sintomas da família', () => {
  const db = createDatabase(':memory:');
  new CatalogService(db);
  const projects = new ProjectService(db);
  const created = projects.create('Causal v11', 'Org/Time');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const projectId = String(project.id);
  const unitId = projects.listUnits(projectId).find((unit) => unit.isLeaf)!.id;

  // 10 participações concluídas com sintomas da família late-integration.
  for (let index = 0; index < 10; index += 1) {
    const participationId = `p-${index}`;
    const profile = index < 6 ? 'engineering' : 'platform';
    db.prepare(`INSERT INTO participations (id, project_id, unit_id, profile, work_context_json, resume_hash, graph_version, status, current_node, created_at, completed_at)
      VALUES (?, ?, ?, ?, '{}', ?, 'evidence-anamnesis-pilot-v21', 'completed', 'done', datetime('now'), datetime('now'))`)
      .run(participationId, projectId, unitId, profile, `resume-${index}`);
    db.prepare('INSERT INTO responses (id, participation_id, node_id, option_id, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))')
      .run(`r-${index}-a`, participationId, 'integration-cadence', index < 6 ? 'isolated-days' : 'integrated-daily');
    if (index < 7) {
      db.prepare('INSERT INTO responses (id, participation_id, node_id, option_id, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))')
        .run(`r-${index}-b`, participationId, 'delivery-cause', 'process-policy');
    }
  }

  const report = new InferenceService(db).report(projectId, 5);
  const causal = report.hypotheses.find((item) => item.familyId === 'late-integration');
  assert.ok(causal, 'deve publicar a família late-integration do catálogo v11');
  assert.equal(causal.modelVersion, CAUSAL_CATALOG_VERSION);
  assert.ok(!causal.hypotheses.some((item) => item.id === 'unknown'));
  const approval = causal.hypotheses.find((item) => item.id === 'aprovacao-externa' || item.id === 'causa-processo-lote');
  const feedback = causal.hypotheses.find((item) => item.id === 'feedback-lento' || item.id === 'causa-ferramental-feedback');
  assert.ok(approval && feedback);
  assert.ok(approval.probability > feedback.probability);
});
