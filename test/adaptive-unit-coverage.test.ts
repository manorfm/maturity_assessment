import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import { CatalogService } from '../src/modules/catalog/catalog-service.js';
import { ProjectService } from '../src/modules/projects/project-service.js';
import { AdaptiveJourneyService } from '../src/modules/assessments/adaptive-journey-service.js';
import { capabilityLeafIds } from '../src/modules/inference/domain/capability-taxonomy.js';
import { itemCatalog } from '../src/modules/catalog/item-catalog.js';
import {
  buildUnitLeafCoverage,
  nextVignetteInRotation,
} from '../src/modules/inference/domain/unit-leaf-coverage.js';

test('cobertura da unidade inicializa as 29 folhas e conta testlets/perspectivas', () => {
  const coverage = buildUnitLeafCoverage([
    { leafId: 'continuous-integration', testletId: 'integration-cadence', profile: 'engineering' },
    { leafId: 'continuous-integration', testletId: 'delivery-cause', profile: 'platform' },
    { leafId: 'work-management', testletId: 'iteration-purpose', profile: 'engineering' },
  ]);
  assert.equal(Object.keys(coverage).length, capabilityLeafIds.length);
  assert.equal(capabilityLeafIds.length, 29);
  assert.deepEqual(coverage['continuous-integration'], { testlets: 2, perspectives: 2 });
  assert.deepEqual(coverage['work-management'], { testlets: 1, perspectives: 1 });
  assert.deepEqual(coverage['organizational-learning'], { testlets: 0, perspectives: 0 });
});

test('rodízio de vinhetas escolhe a menos pedida na unidade', () => {
  const vignettes = itemCatalog.filter((item) => item.kind === 'vignette').map((item) => item.id);
  assert.ok(vignettes.length >= 1);
  const first = nextVignetteInRotation(vignettes, {});
  assert.equal(first, vignettes[0]);
  const second = nextVignetteInRotation(vignettes, { [vignettes[0]!]: 3, ...(vignettes[1] ? { [vignettes[1]]: 0 } : {}) });
  if (vignettes[1]) assert.equal(second, vignettes[1]);
  else assert.equal(second, vignettes[0]);
});

test('AdaptiveJourneyService prioriza folha escassa da unidade ao escolher probe', () => {
  const db = createDatabase(':memory:');
  new CatalogService(db);
  const projects = new ProjectService(db);
  const created = projects.create('Cobertura unidade', 'Org/Time');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const projectId = String(project.id);
  const unitId = projects.listUnits(projectId).find((unit) => unit.isLeaf)!.id;

  // Unidade já cobriu continuous-integration com 2 testlets e 2 perspectivas.
  for (const [index, profile] of ['engineering', 'platform'].entries()) {
    const participationId = `done-${index}`;
    db.prepare(`INSERT INTO participations (id, project_id, unit_id, profile, work_context_json, resume_hash, graph_version, status, current_node, created_at, completed_at)
      VALUES (?, ?, ?, ?, '{}', ?, 'evidence-anamnesis-pilot-v21', 'completed', 'done', datetime('now'), datetime('now'))`)
      .run(participationId, projectId, unitId, profile, `hash-done-${index}`);
    db.prepare('INSERT INTO responses (id, participation_id, node_id, option_id, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))')
      .run(`rd-${index}-a`, participationId, 'integration-cadence', 'isolated-days');
    db.prepare('INSERT INTO responses (id, participation_id, node_id, option_id, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))')
      .run(`rd-${index}-b`, participationId, 'shared-change', 'before-release');
  }

  const liveId = 'live-1';
  db.prepare(`INSERT INTO participations (id, project_id, unit_id, profile, work_context_json, resume_hash, graph_version, status, current_node, created_at)
    VALUES (?, ?, ?, 'engineering', '{}', 'hash-live', 'evidence-anamnesis-pilot-v21', 'in_progress', 'integration-cadence', datetime('now'))`)
    .run(liveId, projectId, unitId);
  db.prepare('INSERT INTO responses (id, participation_id, node_id, option_id, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))')
    .run('rl-a', liveId, 'integration-cadence', 'isolated-days');
  // Vinheta já pedida para o teste isolar a priorização de folhas.
  const vignetteId = itemCatalog.find((item) => item.kind === 'vignette')!.id;
  const vignetteOption = db.prepare('SELECT option_key FROM assessment_options WHERE node_key = ? LIMIT 1').get(vignetteId) as { option_key: string };
  db.prepare('INSERT INTO responses (id, participation_id, node_id, option_id, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))')
    .run('rl-v', liveId, vignetteId, vignetteOption.option_key);

  const journey = new AdaptiveJourneyService(db);
  const coverage = journey.unitLeafCoverage(projectId, unitId);
  assert.ok(coverage['continuous-integration']!.testlets >= 2);
  assert.ok(coverage['continuous-integration']!.perspectives >= 2);

  const selected = journey.selectWithUnitCoverage(liveId, 'engineering', 'evidence-anamnesis-pilot-v21');
  // Com CI já coberta, o seletor com cobertura não deve insistir só nela se houver folha escassa elegível.
  if (selected) {
    const leafRows = db.prepare(`
      SELECT detail_capabilities FROM assessment_signals WHERE graph_version = 'evidence-anamnesis-pilot-v21' AND node_key = ?
    `).all(selected) as Array<{ detail_capabilities: string }>;
    const leaves = leafRows.flatMap((row) => JSON.parse(row.detail_capabilities) as string[]);
    const allCi = leaves.length > 0 && leaves.every((leaf) => leaf === 'continuous-integration');
    assert.ok(!allCi || coverage['continuous-integration']!.testlets < 2, 'não deve preferir só CI quando a unidade já a cobre');
  }
});

test('catálogo semeia vinhetas e selectVignette respeita rodízio e teto de 2', () => {
  const db = createDatabase(':memory:');
  new CatalogService(db);
  const vignetteIds = itemCatalog.filter((item) => item.kind === 'vignette').map((item) => item.id);
  for (const vignetteId of vignetteIds) {
    const node = db.prepare('SELECT node_key, node_type FROM assessment_nodes WHERE node_key = ?').get(vignetteId) as { node_key: string; node_type: string } | undefined;
    assert.ok(node, `vinheta ${vignetteId} deve existir como nó`);
    assert.equal(node.node_type, 'probe');
  }

  const projects = new ProjectService(db);
  const created = projects.create('Vinheta rodizio', 'Org/Time');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const projectId = String(project.id);
  const unitId = projects.listUnits(projectId).find((unit) => unit.isLeaf)!.id;
  const liveId = 'live-v';
  db.prepare(`INSERT INTO participations (id, project_id, unit_id, profile, work_context_json, resume_hash, graph_version, status, current_node, created_at)
    VALUES (?, ?, ?, 'engineering', '{}', 'hash-v', 'evidence-anamnesis-pilot-v21', 'in_progress', 'done', datetime('now'))`)
    .run(liveId, projectId, unitId);

  const journey = new AdaptiveJourneyService(db);
  const first = journey.selectVignette(liveId);
  assert.ok(first && vignetteIds.includes(first));

  const option = db.prepare('SELECT option_key FROM assessment_options WHERE node_key = ? LIMIT 1').get(first!) as { option_key: string };
  db.prepare('INSERT INTO responses (id, participation_id, node_id, option_id, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))')
    .run('rv-0', liveId, first, option.option_key);

  // Única vinheta do catálogo já respondida: rodízio não a repete.
  assert.equal(journey.selectVignette(liveId), undefined);
});
