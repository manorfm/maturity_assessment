import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import { CatalogService } from '../src/modules/catalog/catalog-service.js';
import { ProjectService } from '../src/modules/projects/project-service.js';
import { InferenceService } from '../src/modules/inference/inference-service.js';
import { measureLeafFromBundles } from '../src/modules/measurement/domain/runtime-bridge.js';
import { defaultMeasurementParams } from '../src/modules/measurement/domain/measurement-params.js';
import type { RespondentBundle } from '../src/modules/measurement/domain/observation-model.js';
import { projectDiagnosticLaudo } from '../src/modules/inference/domain/diagnostic-report.js';
import { decideReportOutcome } from '../src/modules/inference/domain/report-outcome.js';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import { leafPublicationToIndex } from '../src/modules/inference/domain/measurement-adapter.js';

const opts = [0, 1, 2, 3, 4] as const;

function section51Bundles(): RespondentBundle[] {
  return [
    { perspective: 'eng', items: [{ chosen: 1, anchors: [...opts], discrimination: 'medium' }, { chosen: 1, anchors: [1, 2, 3], discrimination: 'high' }] },
    { perspective: 'eng', items: [{ chosen: 1, anchors: [...opts], discrimination: 'medium' }] },
    { perspective: 'eng', items: [{ chosen: 2, anchors: [...opts], discrimination: 'medium' }, { chosen: 1, anchors: [1, 2, 3], discrimination: 'high' }] },
    { perspective: 'eng', items: [{ chosen: 1, anchors: [...opts], discrimination: 'medium' }] },
    { perspective: 'mgmt', items: [{ chosen: 3, anchors: [...opts], discrimination: 'medium' }] },
    { perspective: 'mgmt', items: [{ chosen: 3, anchors: [...opts], discrimination: 'medium' }] },
    { perspective: 'plat', items: [{ chosen: 1, anchors: [...opts], discrimination: 'medium' }] },
  ];
}

test('projeto novo nasce em m2 e a coluna measurement_model existe', () => {
  const db = createDatabase(':memory:');
  new CatalogService(db);
  const projects = new ProjectService(db);
  const created = projects.create('Runtime m2', 'Org/Time');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  assert.equal(project.measurement_model, 'm2');
  const columns = [...db.prepare('PRAGMA table_info(projects)').all()] as Array<{ name: string }>;
  assert.ok(columns.some((column) => column.name === 'measurement_model'));
  assert.deepEqual(
    [...db.prepare('SELECT version FROM schema_migrations').all()].map((row) => Number((row as { version: number }).version)),
    [25],
  );
});

test('ponte m2 publica IndexPublication a partir de bundles §5.1', () => {
  const reading = measureLeafFromBundles({
    unit: 'alpha',
    leaf: 'continuous-integration',
    responses: section51Bundles(),
    params: defaultMeasurementParams(),
    deltas: { mgmt: 1 },
    applyGates: false,
    coverage: 0.8,
  });
  assert.equal(reading.publication.publishable, 'published');
  assert.ok(Math.abs(reading.publication.index - 26) <= 3);
  assert.equal(leafPublicationToIndex(reading.publication).published, true);
});

test('inference em m2 é o padrão; m1 permanece selecionável sem inventar índice', () => {
  const db = createDatabase(':memory:');
  new CatalogService(db);
  const projects = new ProjectService(db);
  const created = projects.create('Wire', 'Org/Time');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const projectId = String(project.id);

  const m2 = new InferenceService(db).report(projectId, 5);
  assert.equal(m2.measurementModel, 'm2');
  // Sem participações suficientes o índice continua não publicado — não inventa número.
  assert.ok(!m2.index || m2.index.published === false);

  projects.setMeasurementModel(projectId, 'm1');
  const m1 = new InferenceService(db).report(projectId, 5);
  assert.equal(m1.measurementModel, 'm1');
  assert.equal(m1.index?.published, undefined);
  const laudoM1 = projectDiagnosticLaudo({
    outcome: decideReportOutcome({ classification: null, branches: [], findings: [] }),
    findings: [],
    organizationalAreas: OrganizationalAreaProjector.empty(),
    ...(m1.index ? { index: m1.index } : {}),
    instrument: `Instrumento vigente · modelo ${m1.measurementModel}`,
  });
  assert.ok('gap' in laudoM1.reading);
  assert.match(laudoM1.footer.instrument, /m1/);
});
