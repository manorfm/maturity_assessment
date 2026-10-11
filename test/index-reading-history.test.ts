import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import { InferenceService } from '../src/modules/inference/inference-service.js';
import { ProjectService } from '../src/modules/projects/project-service.js';
import { peakedDistribution } from '../src/modules/measurement/domain/hierarchical-pooling.js';
import { renderHistoryPage } from '../src/modules/projects/diagnostic-report-view.js';
import { projectHistoryPage } from '../src/modules/inference/domain/diagnostic-report.js';

test('schema 26 cria index_readings', () => {
  const db = createDatabase(':memory:');
  const row = db.prepare("SELECT MAX(version) version FROM schema_migrations").get() as { version: number };
  assert.equal(row.version, 26);
  const table = db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'index_readings'").get();
  assert.ok(table);
});

test('duas fotografias de índice publicam P(melhora) no histórico', () => {
  const db = createDatabase(':memory:');
  const projects = new ProjectService(db);
  const created = projects.create('Histórico', 'Org/Time');
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const projectId = String(project.id);
  const inference = new InferenceService(db);

  inference.captureIndexReading(projectId, {
    label: 'Leitura 1',
    index: 25,
    band: [0, 50],
    distribution: peakedDistribution(25),
    instrumentVersion: 'evidence-anamnesis-pilot-v21',
    modelVersion: 'm2',
    completed: 6,
  });
  inference.captureIndexReading(projectId, {
    label: 'Leitura 1',
    index: 25,
    band: [0, 50],
    distribution: peakedDistribution(25),
    instrumentVersion: 'evidence-anamnesis-pilot-v21',
    modelVersion: 'm2',
    completed: 6,
  });
  assert.equal(inference.listIndexReadings(projectId).length, 1, 'mesma amostra não duplica fotografia');

  inference.captureIndexReading(projectId, {
    label: 'Leitura 2',
    index: 75,
    band: [50, 100],
    distribution: peakedDistribution(75),
    instrumentVersion: 'evidence-anamnesis-pilot-v21',
    modelVersion: 'm2',
    completed: 12,
  });
  const readings = inference.listIndexReadings(projectId);
  assert.equal(readings.length, 2);

  const history = inference.projectIndexHistory(projectId);
  assert.equal(history.change, 'improved');
  assert.ok((history.pImprove ?? 0) >= 0.8);
  const html = renderHistoryPage(history);
  assert.match(html, /P\(melhora\)/);
  assert.doesNotMatch(html, /Ainda não há duas leituras/);
});

test('sem duas fotografias o projetor declara lacuna', () => {
  assert.match(projectHistoryPage({}).gap ?? '', /duas leituras/);
});
