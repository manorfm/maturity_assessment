import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  advancedPracticeCatalog,
  probabilityPhaseAtLeast,
  resolvePrerequisitePosteriors,
  projectPracticeReadiness,
} from '../src/modules/inference/domain/advanced-readiness.js';
import type { StageDistribution } from '../src/modules/measurement/domain/measurement-params.js';
import type { SophisticationDistribution } from '../src/modules/inference/domain/sophistication-matrix.js';

const expectedIds = [
  'chaos-engineering',
  'quality-automation',
  'ai-dlc',
  'continuous-delivery',
  'trunk-based',
  'slo-error-budget',
  'platform-as-product',
  'aiops-remediation',
  'cell-architecture',
  'data-mesh',
  'zero-trust',
  'service-mesh',
  'cost-optimization',
];

const peaked = (stage: 0 | 1 | 2 | 3 | 4): StageDistribution => (
  [0, 1, 2, 3, 4].map((s) => (s === stage ? 1 : 0)) as unknown as StageDistribution
);

const phasePeaked = (phase: 0 | 1 | 2 | 3 | 4 | 5): SophisticationDistribution => (
  [0, 1, 2, 3, 4, 5].map((p) => (p === phase ? 1 : 0)) as unknown as SophisticationDistribution
);

test('biblioteca 22 §5 cobre as 13 práticas com essenciais tipados', () => {
  assert.deepEqual(advancedPracticeCatalog.map((item) => item.id).sort(), [...expectedIds].sort());
  for (const practice of advancedPracticeCatalog) {
    assert.ok(practice.prerequisites.some((item) => item.essential), practice.id);
    assert.ok(practice.prerequisites.every((item) => item.leafId && item.minimumStage >= 0), practice.id);
  }
});

test('p_k combina estágio e fase F quando o pré-requisito exige os dois', () => {
  assert.equal(probabilityPhaseAtLeast(phasePeaked(4), 3), 1);
  assert.equal(probabilityPhaseAtLeast(phasePeaked(2), 3), 0);

  const practice = advancedPracticeCatalog.find((item) => item.id === 'chaos-engineering')!;
  const stageOnly = resolvePrerequisitePosteriors(practice, {
    'observability-practice': { distribution: peaked(3) },
    'reliability-practice': { distribution: peaked(3) },
    'incident-management': { distribution: peaked(3) },
    'release-feedback': { distribution: peaked(3) },
    'organizational-learning': { distribution: peaked(3) },
  });
  // Essenciais com minimumPhase sem evidência F → lacuna (não inventa).
  assert.equal(stageOnly, undefined);

  const withF = resolvePrerequisitePosteriors(practice, {
    'observability-practice': { distribution: peaked(3), phaseDistribution: phasePeaked(4) },
    'reliability-practice': { distribution: peaked(3) },
    'incident-management': { distribution: peaked(3), phaseDistribution: phasePeaked(2) },
    'release-feedback': { distribution: peaked(3), phaseDistribution: phasePeaked(3) },
    'organizational-learning': { distribution: peaked(3) },
  });
  assert.ok(withF);
  assert.equal(projectPracticeReadiness(practice, withF!).band, 'ready');

  const lowF = resolvePrerequisitePosteriors(practice, {
    'observability-practice': { distribution: peaked(3), phaseDistribution: phasePeaked(1) },
    'reliability-practice': { distribution: peaked(3) },
    'incident-management': { distribution: peaked(3), phaseDistribution: phasePeaked(2) },
    'release-feedback': { distribution: peaked(3), phaseDistribution: phasePeaked(3) },
    'organizational-learning': { distribution: peaked(3) },
  });
  const readiness = projectPracticeReadiness(practice, lowF!);
  assert.ok(readiness.probability < 0.6);
  assert.equal(readiness.bottleneckId, 'observability');
});
