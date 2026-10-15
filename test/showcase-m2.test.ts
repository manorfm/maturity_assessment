import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import { runOrganizationalSynthetic, runPocSyntheticSuite } from '../src/modules/inference/domain/organizational-synthetic.js';
import { ProjectService } from '../src/modules/projects/project-service.js';
import { InferenceService } from '../src/modules/inference/inference-service.js';

function reportUnderM2(band: 'low' | 'medium' | 'high') {
  const db = createDatabase(':memory:');
  const { projectId, report: baseline } = runOrganizationalSynthetic(db, { band });
  new ProjectService(db).setMeasurementModel(projectId, 'm2');
  const report = new InferenceService(db).report(projectId, 5);
  return { baseline, report };
}

test('m2 nos sintéticos do showcase publica índice e preserva a narrativa por banda', () => {
  const low = reportUnderM2('low');
  const medium = reportUnderM2('medium');
  const high = reportUnderM2('high');

  for (const entry of [low, medium, high]) {
    assert.equal(entry.report.measurementModel, 'm2');
    assert.ok(entry.report.index?.published, `índice m2 deveria publicar: ${JSON.stringify(entry.report.index)}`);
  }

  const indexes = [low, medium, high].map((entry) => {
    const index = entry.report.index;
    assert.ok(index, 'índice m2 deveria existir');
    return index.published ? index.index : -1;
  });
  assert.ok(indexes[0]! < indexes[1]!, `opaco (${indexes[0]}) abaixo de reativo (${indexes[1]})`);
  assert.ok(indexes[1]! < indexes[2]!, `reativo (${indexes[1]}) abaixo de adaptativo (${indexes[2]})`);
  assert.ok(indexes[0]! <= 40, `opaco deveria ficar baixo, got ${indexes[0]}`);
  assert.ok(indexes[2]! >= 55, `adaptativo deveria ficar alto, got ${indexes[2]}`);

  assert.equal(low.report.outcome.kind, low.baseline.outcome.kind);
  assert.equal(high.report.outcome.kind, 'evolve');
  assert.ok((low.report.classification?.level ?? 4) <= 1);
  assert.ok((high.report.classification?.level ?? 0) >= 3);
});

test('suite POC sob m2 mantém três leituras distintas', () => {
  const db = createDatabase(':memory:');
  const suite = runPocSyntheticSuite(db);
  const projects = new ProjectService(db);
  const inference = new InferenceService(db);
  const readings = suite.map((entry) => {
    projects.setMeasurementModel(entry.projectId, 'm2');
    const report = inference.report(entry.projectId, 5);
    assert.ok(report.index?.published, `${entry.band}: ${JSON.stringify(report.index)}`);
    return report.index!.published ? report.index.index : -1;
  });
  assert.equal(new Set(readings).size, 3, `índices m2 devem diferir: ${readings.join(',')}`);
});
