import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  assessStageChange,
  probabilityOfImprovement,
  probabilityOfRegression,
} from '../src/modules/measurement/domain/change-detection.js';
import type { StageDistribution } from '../src/modules/measurement/domain/measurement-params.js';
import { compareReadings, projectHistoryAssessment } from '../src/modules/inference/domain/reading-history.js';

const peaked = (stage: 0 | 1 | 2 | 3 | 4): StageDistribution => {
  const raw = [0, 1, 2, 3, 4].map((s) => (s === stage ? 1 : 0));
  return raw as unknown as StageDistribution;
};

test('P(melhora) soma massa com a < b (05 §9)', () => {
  const low = peaked(1);
  const high = peaked(3);
  assert.equal(probabilityOfImprovement(low, high), 1);
  assert.equal(probabilityOfRegression(low, high), 0);
  assert.equal(probabilityOfImprovement(high, low), 0);
  assert.equal(probabilityOfRegression(high, low), 1);
});

test('publica melhora ou piora só com P ≥ 0,8', () => {
  assert.equal(assessStageChange(peaked(1), peaked(3)).change, 'improved');
  assert.equal(assessStageChange(peaked(3), peaked(1)).change, 'regressed');
  const overlapPrev: StageDistribution = [0.2, 0.2, 0.2, 0.2, 0.2];
  const overlapCurr: StageDistribution = [0.15, 0.2, 0.3, 0.2, 0.15];
  const uncertain = assessStageChange(overlapPrev, overlapCurr);
  assert.equal(uncertain.change, 'uncertain');
  assert.ok(uncertain.pImprove < 0.8);
  assert.ok(uncertain.pRegress < 0.8);
});

test('compareReadings usa P(melhora) quando há distribuições; senão faixa', () => {
  assert.equal(compareReadings(
    { id: 'a', label: 'antes', index: 25, band: [0, 50], distribution: peaked(1) },
    { id: 'b', label: 'depois', index: 75, band: [50, 100], distribution: peaked(3) },
  ), 'improved');
  assert.equal(compareReadings(
    { id: 'a', label: 'antes', index: 24, band: [18, 31] },
    { id: 'b', label: 'depois', index: 27, band: [20, 34] },
  ), 'uncertain');
});

test('projectHistoryAssessment publica probabilidades com limiar 0,8', () => {
  const assessment = projectHistoryAssessment({
    previous: { id: 't1', label: 't1', index: 25, band: [0, 50], distribution: peaked(1) },
    current: { id: 't2', label: 't2', index: 75, band: [50, 100], distribution: peaked(3) },
  });
  assert.equal(assessment.change, 'improved');
  assert.equal(assessment.pImprove, 1);
  assert.equal(assessment.threshold, 0.8);
  assert.equal(projectHistoryAssessment({}).gap?.includes('duas leituras'), true);
});
