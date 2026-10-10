import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  approvalChangeVignette,
  estimateListTechniquePrevalence,
  estimatePerspectiveSeverity,
  freeTextPipeline,
  itemCatalog,
  literacyWipChart,
  stripPii,
} from '../src/modules/catalog/item-catalog.js';
import { auditItemCatalog } from '../src/modules/catalog/item-type-audit.js';
import { auditInstrument } from '../src/modules/catalog/instrument-audit.js';
import { graph } from '../src/modules/catalog/assessment-graph.js';
import { interventionCatalog, evolutionCatalog } from '../src/modules/inference/inference-service.js';
import { createDatabase } from '../src/shared/database.js';
import { CatalogService } from '../src/modules/catalog/catalog-service.js';
import { ProjectService } from '../src/modules/projects/project-service.js';

test('catálogo 07 publica vinheta, leitura, grupo, lista e texto livre', () => {
  const kinds = new Set(itemCatalog.map((item) => item.kind));
  assert.ok(kinds.has('vignette'));
  assert.ok(kinds.has('literacy'));
  assert.ok(kinds.has('group-referent'));
  assert.ok(kinds.has('list-technique'));
  assert.ok(kinds.has('free-text'));
});

test('vinheta de ancoragem tem estágio conhecido e estima severidade por perspectiva', () => {
  assert.equal(approvalChangeVignette.kind, 'vignette');
  assert.equal(approvalChangeVignette.authorAnchor, 1);
  const severity = estimatePerspectiveSeverity({
    vignette: approvalChangeVignette,
    choices: [
      { perspective: 'management', chosenAnchor: 3 },
      { perspective: 'management', chosenAnchor: 2 },
      { perspective: 'engineering', chosenAnchor: 1 },
      { perspective: 'engineering', chosenAnchor: 1 },
      { perspective: 'engineering', chosenAnchor: 0 },
    ],
  });
  assert.ok(severity.management! > 0.5);
  assert.ok(Math.abs(severity.engineering!) < 0.5);
});

test('item de leitura classifica correta, incorreta e letramento ausente', () => {
  assert.equal(literacyWipChart.kind, 'literacy');
  assert.equal(literacyWipChart.readings.find((item) => item.id === 'stop-starting')?.verdict, 'correct');
  assert.equal(literacyWipChart.readings.find((item) => item.id === 'cannot-read')?.verdict, 'literacy-absent');
  assert.ok(literacyWipChart.readings.some((item) => item.verdict === 'incorrect'));
});

test('técnica de lista só estima prevalência com n ≥ 40 e intervalo', () => {
  const small = estimateListTechniquePrevalence({
    controlMean: 2.1,
    treatmentMean: 2.6,
    controlN: 20,
    treatmentN: 20,
  });
  assert.equal(small.publishable, false);

  const large = estimateListTechniquePrevalence({
    controlMean: 2.1,
    treatmentMean: 2.6,
    controlN: 40,
    treatmentN: 40,
  });
  assert.equal(large.publishable, true);
  assert.ok(Math.abs(large.prevalence! - 0.5) < 1e-9);
  assert.ok(large.interval![0] < large.prevalence!);
  assert.ok(large.interval![1] > large.prevalence!);
});

test('texto livre remove PII e fica desligado por padrão no projeto', () => {
  const cleaned = stripPii('Falamos com Ana da equipe Pagamentos sobre o cliente ACME em 12/03/2026.');
  assert.doesNotMatch(cleaned, /Ana|Pagamentos|ACME|12\/03\/2026/);
  assert.equal(freeTextPipeline.enabledByDefault, false);
  assert.equal(freeTextPipeline.requiresHumanReview, true);
  assert.equal(freeTextPipeline.minCohenKappa, 0.7);

  const db = createDatabase(':memory:');
  new CatalogService(db);
  const projects = new ProjectService(db);
  const created = projects.create('Free text off', 'Org/Time');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  assert.equal(Number(project.free_text_enabled), 0);
});

test('auditoria dos tipos 07 não bloqueia o catálogo de referência', () => {
  const issues = auditItemCatalog(itemCatalog);
  assert.equal(issues.filter((item) => item.severity === 'error').length, 0);
});

test('auditoria do instrumento inclui checagens dos tipos novos quando presentes no grafo', () => {
  const issues = auditInstrument(graph, { ...interventionCatalog, ...evolutionCatalog });
  assert.ok(!issues.some((item) => item.code === 'item-type-unknown'));
});
