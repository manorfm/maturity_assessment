import assert from 'node:assert/strict';
import { test } from 'node:test';
import { defaultMeasurementParams } from '../src/modules/measurement/domain/measurement-params.js';
import type { RespondentBundle } from '../src/modules/measurement/domain/observation-model.js';
import { measureLeafAcrossUnits } from '../src/modules/measurement/domain/hierarchical-pooling.js';
import { unitPosterior } from '../src/modules/measurement/domain/unit-posterior.js';
import { createDatabase } from '../src/shared/database.js';
import { runOrganizationalSynthetic } from '../src/modules/inference/domain/organizational-synthetic.js';

const opts = [0, 1, 2, 3, 4] as const;

function lowBundles(n: number): RespondentBundle[] {
  return Array.from({ length: n }, () => ({
    perspective: 'eng',
    items: [
      { chosen: 0 as const, anchors: [...opts], discrimination: 'low' as const, testletId: 't1' },
      { chosen: 0 as const, anchors: [...opts], discrimination: 'low' as const, testletId: 't2' },
    ],
  }));
}

function highBundles(n: number): RespondentBundle[] {
  return Array.from({ length: n }, () => ({
    perspective: 'eng',
    items: [
      { chosen: 4 as const, anchors: [...opts], discrimination: 'medium' as const, testletId: 't1' },
      { chosen: 4 as const, anchors: [...opts], discrimination: 'high' as const, testletId: 't2' },
    ],
  }));
}

test('unidade filha com pooling se aproxima da irmã; sem mãe o prior é uniforme', () => {
  const params = defaultMeasurementParams();
  const child = lowBundles(1);
  const alone = unitPosterior({
    unit: 'alpha',
    leaf: 'continuous-integration',
    responses: child,
    params,
  });
  const measured = measureLeafAcrossUnits({
    leaf: 'continuous-integration',
    units: [
      { id: 'org', parentId: null },
      { id: 'alpha', parentId: 'org' },
      { id: 'beta', parentId: 'org' },
    ],
    responsesByUnit: {
      alpha: child,
      beta: highBundles(5),
    },
    omega: 0.9,
    params,
  });
  const alpha = measured.get('alpha')!;
  assert.ok(alpha.index > alone.index, `pooling deveria puxar alpha (${alpha.index}) acima de alone (${alone.index})`);
  assert.ok(alpha.index < 90, `alpha não deve colapsar no índice alto da irmã, got ${alpha.index}`);

  const single = measureLeafAcrossUnits({
    leaf: 'continuous-integration',
    units: [{ id: 'solo', parentId: null }],
    responsesByUnit: { solo: child },
    omega: 0.9,
    params,
  });
  assert.equal(single.get('solo')!.index, alone.index);
});

test('relatório m2 publica índice com pooling hierárquico no sintético', () => {
  const { report } = runOrganizationalSynthetic(createDatabase(':memory:'), { band: 'low' });
  assert.equal(report.measurementModel, 'm2');
  assert.ok(report.index?.published, JSON.stringify(report.index));
  assert.ok(report.index.published && report.index.index <= 45, JSON.stringify(report.index));
});
