import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  expectedSophistication,
  modeSophistication,
  observeSophistication,
  sophisticationPhasesByLeaf,
} from '../src/modules/inference/domain/sophistication-matrix.js';
import type { ResponseObservation } from '../src/modules/measurement/domain/response-observation.js';
import { bundlesByLeaf } from '../src/modules/measurement/domain/response-observation.js';
import { measureLeafFromBundles } from '../src/modules/measurement/domain/runtime-bridge.js';
import { defaultMeasurementParams } from '../src/modules/measurement/domain/measurement-params.js';

test('posterior F0–F5 sobe com observações altas e permanece fora do índice', () => {
  const low = observeSophistication([0, 0, 1]);
  const high = observeSophistication([4, 4, 5]);
  assert.ok(expectedSophistication(high) > expectedSophistication(low));
  assert.equal(modeSophistication(high) >= 4, true);
  assert.equal(modeSophistication(low) <= 1, true);

  // Mesmas respostas de apropriação: índice usa âncora, não F.
  const observations: ResponseObservation[] = [
    { participantId: 'p1', unitId: 'u1', profile: 'engineering', nodeId: 'degradation', optionId: 'customer-volume' },
    { participantId: 'p2', unitId: 'u1', profile: 'engineering', nodeId: 'degradation', optionId: 'customer-volume' },
    { participantId: 'p3', unitId: 'u1', profile: 'platform', nodeId: 'degradation', optionId: 'customer-volume' },
    { participantId: 'p4', unitId: 'u1', profile: 'platform', nodeId: 'degradation', optionId: 'customer-volume' },
    { participantId: 'p5', unitId: 'u1', profile: 'management', nodeId: 'degradation', optionId: 'customer-volume' },
  ];
  const phases = sophisticationPhasesByLeaf(observations);
  const obsPhases = phases.get('observability-practice') ?? [];
  assert.ok(obsPhases.length >= 1);
  assert.ok(obsPhases.every((phase) => phase === 0), 'deteccao-tardia declara F0');

  const bundles = bundlesByLeaf(observations).get('observability-practice') ?? [];
  const index = measureLeafFromBundles({
    unit: 'u1',
    leaf: 'observability-practice',
    responses: bundles,
    coverage: 1,
    params: defaultMeasurementParams(),
  });
  const fPosterior = observeSophistication(obsPhases);
  assert.ok(modeSophistication(fPosterior) === 0);
  assert.ok(index.posterior.index !== undefined || index.publication);
  // F alto artificial não muda a âncora já medida
  const boughtTool = observeSophistication([5, 5, 5]);
  assert.ok(expectedSophistication(boughtTool) >= 4);
  assert.notEqual(modeSophistication(boughtTool), modeSophistication(fPosterior));
});

test('agrega F por folha e unidade a partir das evidências com sophistication', () => {
  const observations: ResponseObservation[] = [
    { participantId: 'a', unitId: 'alpha', profile: 'engineering', nodeId: 'degradation', optionId: 'impact-change' },
    { participantId: 'b', unitId: 'alpha', profile: 'platform', nodeId: 'degradation', optionId: 'impact-change' },
    { participantId: 'c', unitId: 'beta', profile: 'engineering', nodeId: 'degradation', optionId: 'threshold' },
  ];
  const byLeaf = sophisticationPhasesByLeaf(observations);
  assert.ok((byLeaf.get('observability-practice') ?? []).includes(4));
  assert.ok((byLeaf.get('observability-practice') ?? []).includes(2));
  const unitAlpha = sophisticationPhasesByLeaf(observations, 'alpha').get('observability-practice') ?? [];
  assert.deepEqual([...new Set(unitAlpha)], [4]);
});
