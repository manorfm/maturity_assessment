import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  assessStageChange,
  probabilityOfStability,
} from '../src/modules/measurement/domain/change-detection.js';
import type { StageDistribution } from '../src/modules/measurement/domain/measurement-params.js';
import {
  projectEvolutionReport,
  resolveUnitCorrespondence,
} from '../src/modules/inference/domain/evolution-report.js';
import { renderHistoryPage } from '../src/modules/projects/diagnostic-report-view.js';

const peaked = (stage: 0 | 1 | 2 | 3 | 4): StageDistribution => {
  const raw = [0, 1, 2, 3, 4].map((s) => (s === stage ? 1 : 0));
  return raw as unknown as StageDistribution;
};

test('P(estável) é a massa na diagonal e publica estável com limiar 0,8', () => {
  assert.equal(probabilityOfStability(peaked(2), peaked(2)), 1);
  assert.equal(probabilityOfStability(peaked(1), peaked(3)), 0);
  assert.equal(assessStageChange(peaked(2), peaked(2)).change, 'stable');
  assert.ok((assessStageChange(peaked(2), peaked(2)).pStable ?? 0) >= 0.8);
});

test('relatório de evolução classifica nós e achados sem afirmar causalidade', () => {
  const report = projectEvolutionReport({
    nodes: [{
      leafId: 'incident-management',
      label: 'Incidentes',
      previous: peaked(1),
      current: peaked(2),
      appliedConduct: 'Plantão com rodízio',
    }, {
      leafId: 'work-management',
      label: 'Fluxo',
      previous: peaked(2),
      current: peaked(2),
    }],
    previousFindings: ['dependencia-de-heroi', 'war-room-como-gestao'],
    currentFindings: ['war-room-como-gestao', 'espera-normalizada'],
    previousLimiter: { id: 'incident-management', label: 'Incidentes' },
    currentLimiter: { id: 'work-management', label: 'Fluxo' },
    previousUnits: [{ id: 'u-a', label: 'Time A' }, { id: 'u-b', label: 'Time B' }],
    currentUnits: [{ id: 'u-a2', label: 'Time A Renomeado' }, { id: 'u-c', label: 'Time C' }],
    unitLinks: [
      { previousId: 'u-a', currentIds: ['u-a2'], kind: 'renamed' },
    ],
  });

  assert.equal(report.version, 'evolution-report-v1');
  const incidents = report.nodes.find((node) => node.leafId === 'incident-management')!;
  assert.equal(incidents.state, 'advanced');
  assert.match(incidents.reading, /após a conduta/i);
  assert.doesNotMatch(incidents.reading, /por causa de/i);
  assert.equal(report.nodes.find((node) => node.leafId === 'work-management')!.state, 'stable');
  assert.deepEqual(report.findings.closed, ['dependencia-de-heroi']);
  assert.deepEqual(report.findings.opened, ['espera-normalizada']);
  assert.equal(report.constraint.moved, true);
  assert.match(report.constraint.reading, /mudou|progresso/i);

  const renamed = report.units.find((row) => row.kind === 'renamed')!;
  assert.equal(renamed.publishesEvolution, true);
  assert.equal(report.units.find((row) => row.currentId === 'u-c')!.kind, 'new');
  assert.equal(report.units.find((row) => row.previousId === 'u-b')!.kind, 'extinct');
  assert.equal(report.units.find((row) => row.kind === 'new')!.publishesEvolution, false);

  const html = renderHistoryPage({
    change: 'improved',
    pImprove: 0.9,
    pRegress: 0.05,
    threshold: 0.8,
    evolution: report,
  });
  assert.match(html, /Avançou|Estável|Relatório de evolução/);
  assert.match(html, /Correspondência de unidades/);
  assert.match(html, /renomeada|Renomeado/i);
});

test('unidade sem correspondência não publica evolução', () => {
  const rows = resolveUnitCorrespondence({
    previous: [{ id: 'old', label: 'Antigo' }],
    current: [{ id: 'brand-new', label: 'Novo' }],
    links: [],
  });
  assert.equal(rows.find((row) => row.currentId === 'brand-new')!.kind, 'new');
  assert.equal(rows.find((row) => row.currentId === 'brand-new')!.publishesEvolution, false);
  assert.equal(rows.find((row) => row.previousId === 'old')!.kind, 'extinct');
});
