import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  CAUSAL_CATALOG_VERSION,
  causalCatalog,
  causalFamilyById,
} from '../src/modules/inference/domain/causal-catalog.js';
import { CausalInferenceEngine } from '../src/modules/inference/domain/causal-inference-engine.js';
import { diagnosticSystemCatalog } from '../src/modules/inference/domain/problem-system.js';
import { createDatabase } from '../src/shared/database.js';
import { CatalogService } from '../src/modules/catalog/catalog-service.js';
import { ProjectService } from '../src/modules/projects/project-service.js';
import { InferenceService } from '../src/modules/inference/inference-service.js';

const expectedMigratedIds = diagnosticSystemCatalog
  .map((system) => (system.id === 'integration-feedback' ? 'late-integration' : system.id));

test('catálogo v11 cobre todos os sistemas diagnósticos sem hipótese unknown', () => {
  assert.equal(CAUSAL_CATALOG_VERSION, 'causal-catalog-v11');
  for (const id of expectedMigratedIds) {
    const family = causalFamilyById(id);
    assert.ok(family, `falta família causal ${id}`);
    assert.ok(family.causes.length >= 2, `${id} precisa de causas concorrentes`);
    assert.ok(family.symptoms.length >= 2, `${id} precisa de sintomas discriminativos`);
    assert.ok(family.provenance.author);
    assert.ok(family.provenance.rationale.includes('provisório') || family.provenance.rationale.includes('provisórios') || family.id === 'late-integration');
    assert.ok(!family.causes.some((cause) => cause.id === 'unknown'));
  }
  assert.equal(causalCatalog.length, expectedMigratedIds.length);
  assert.equal(new Set(causalCatalog.map((family) => family.id)).size, causalCatalog.length);
});

test('learning-closure: explaining away sem unknown', () => {
  const family = causalFamilyById('learning-closure');
  assert.ok(family);
  const engine = new CausalInferenceEngine();

  const onlyActions = engine.inferFamily(family, {
    'acao-sem-fechamento': { present: 7, total: 10 },
  });
  assert.ok(!onlyActions.hypotheses.some((item) => item.id === 'unknown'));
  const focusBefore = onlyActions.posteriors['causa-acoes-sem-foco'] ?? onlyActions.posteriors['acoes-sem-foco'];
  const safetyBefore = onlyActions.posteriors['causa-baixa-seguranca-psicologica'] ?? onlyActions.posteriors['baixa-seguranca'];
  assert.ok(focusBefore !== undefined && safetyBefore !== undefined);
  assert.ok(focusBefore > safetyBefore);

  const withPostmortem = engine.inferFamily(family, {
    'acao-sem-fechamento': { present: 7, total: 10 },
    'postmortem-sem-efeito': { present: 8, total: 10 },
  });
  const focusAfter = withPostmortem.posteriors['causa-acoes-sem-foco'] ?? withPostmortem.posteriors['acoes-sem-foco'];
  const safetyAfter = withPostmortem.posteriors['causa-baixa-seguranca-psicologica'] ?? withPostmortem.posteriors['baixa-seguranca'];
  assert.ok(safetyAfter! > safetyBefore!);
  assert.ok(focusAfter! < focusBefore!);
  assert.ok(safetyAfter! > focusAfter!);
});

test('operational-response: sintomas do grafo alimentam a família migrada', () => {
  const family = causalFamilyById('operational-response');
  assert.ok(family);
  const engine = new CausalInferenceEngine();
  const result = engine.inferFromPatterns(family, [
    { pattern: 'deteccao-tardia', support: 6, applicablePopulation: 10 },
    { pattern: 'incidente-detectado-por-cliente', support: 5, applicablePopulation: 10 },
  ]);
  assert.ok(result.evidenceUsed.length >= 1);
  assert.ok(!result.hypotheses.some((item) => item.id === 'unknown'));
  assert.ok(result.hypotheses[0]!.probability > 0.3);
});

test('inference-service publica posterior de família migrada além de late-integration', () => {
  const db = createDatabase(':memory:');
  new CatalogService(db);
  const projects = new ProjectService(db);
  const created = projects.create('Causal migration', 'Org/Time');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const projectId = String(project.id);
  const unitId = projects.listUnits(projectId).find((unit) => unit.isLeaf)!.id;

  for (let index = 0; index < 10; index += 1) {
    const participationId = `m-${index}`;
    db.prepare(`INSERT INTO participations (id, project_id, unit_id, profile, work_context_json, resume_hash, graph_version, status, current_node, created_at, completed_at)
      VALUES (?, ?, ?, ?, '{}', ?, 'evidence-anamnesis-pilot-v21', 'completed', 'done', datetime('now'), datetime('now'))`)
      .run(participationId, projectId, unitId, 'engineering', `resume-m-${index}`);
    db.prepare('INSERT INTO responses (id, participation_id, node_id, option_id, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))')
      .run(`rm-${index}-a`, participationId, 'recurrence', index < 7 ? 'action-list' : 'system-change');
    if (index < 8) {
      db.prepare('INSERT INTO responses (id, participation_id, node_id, option_id, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))')
        .run(`rm-${index}-b`, participationId, 'improvement-loop', 'ceremony-report');
    }
  }

  const report = new InferenceService(db).report(projectId, 5);
  const causal = report.hypotheses.find((item) => item.familyId === 'learning-closure');
  assert.ok(causal, 'deve publicar learning-closure do catálogo v11');
  assert.equal(causal.modelVersion, CAUSAL_CATALOG_VERSION);
  assert.ok(!causal.hypotheses.some((item) => item.id === 'unknown'));
});
