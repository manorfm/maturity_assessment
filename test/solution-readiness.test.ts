import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assessSolutionReadiness } from '../src/modules/inference/domain/solution-readiness.js';
import type { GroupSignal } from '../src/modules/inference/domain/group-recommendation-engine.js';

const signal = (participantId: string, weight: number, layer: GroupSignal['layer'], profile = 'engineering'): GroupSignal => ({
  participantId, profile, detailCapability: 'continuous-integration', pattern: `evidence-${participantId}-${layer}`,
  weight, layer, constraint: 'none',
});

test('não confunde ausência de evidência com inexistência da capacidade de solução', () => {
  const readiness = assessSolutionReadiness([
    signal('a', -2, 'practice'), signal('b', -2, 'practice'), signal('c', -2, 'system'),
  ], 3);

  assert.equal(readiness.stage, 'not-demonstrated');
  assert.match(readiness.explanation, /não demonstram/i);
});

test('distingue capacidade declarada, local, operacional e adaptativa', () => {
  assert.equal(assessSolutionReadiness([
    signal('a', 1, 'knowledge'), signal('b', -1, 'practice'), signal('c', -1, 'practice'),
  ], 3).stage, 'declared');

  assert.equal(assessSolutionReadiness([
    signal('a', 1, 'practice'), signal('b', -1, 'practice'), signal('c', -1, 'practice'),
  ], 3).stage, 'local');

  assert.equal(assessSolutionReadiness([
    signal('a', 2, 'practice'), signal('b', 2, 'system', 'platform'), signal('c', -1, 'practice'),
  ], 3).stage, 'operational');

  assert.equal(assessSolutionReadiness([
    signal('a', 2, 'practice'), signal('b', 2, 'consistency', 'platform'), signal('c', 2, 'outcome', 'management'),
  ], 3).stage, 'adaptive');
});
