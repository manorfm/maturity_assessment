import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import { InferenceService } from '../src/modules/inference/inference-service.js';
import { ProjectService } from '../src/modules/projects/project-service.js';
import { peakedDistribution } from '../src/modules/measurement/domain/hierarchical-pooling.js';
import { renderHistoryPage } from '../src/modules/projects/diagnostic-report-view.js';
import { projectHistoryPage } from '../src/modules/inference/domain/diagnostic-report.js';

test('schema 27 cria index_readings com context_json', () => {
  const db = createDatabase(':memory:');
  const row = db.prepare("SELECT MAX(version) version FROM schema_migrations").get() as { version: number };
  assert.equal(row.version, 27);
  const table = db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'index_readings'").get();
  assert.ok(table);
  const columns = [...db.prepare('PRAGMA table_info(index_readings)').all()] as Array<{ name: string }>;
  assert.ok(columns.some((column) => column.name === 'context_json'));
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
    context: {
      findingPatterns: ['dependencia-de-heroi'],
      limiterId: 'incident-management',
      limiterLabel: 'Incidentes',
      units: [{ id: 'u1', label: 'Org/Time' }],
    },
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
    context: {
      findingPatterns: ['espera-normalizada'],
      limiterId: 'work-management',
      limiterLabel: 'Fluxo',
      units: [{ id: 'u1', label: 'Org/Time' }],
      treatedConduct: 'Plantão com rodízio',
    },
    instrumentVersion: 'evidence-anamnesis-pilot-v21',
    modelVersion: 'm2',
    completed: 12,
  });
  const readings = inference.listIndexReadings(projectId);
  assert.equal(readings.length, 2);

  const history = inference.projectIndexHistory(projectId);
  assert.equal(history.change, 'improved');
  assert.ok((history.pImprove ?? 0) >= 0.8);
  assert.equal(history.evolution?.version, 'evolution-report-v1');
  assert.ok(history.evolution?.findings.closed.includes('dependencia-de-heroi'));
  assert.ok(history.evolution?.constraint.moved);
  const html = renderHistoryPage(history);
  assert.match(html, /P\(melhora\)/);
  assert.match(html, /Relatório de evolução/);
  assert.doesNotMatch(html, /Ainda não há duas leituras/);
});

test('sem duas fotografias o projetor declara lacuna', () => {
  assert.match(projectHistoryPage({}).gap ?? '', /duas leituras/);
});
