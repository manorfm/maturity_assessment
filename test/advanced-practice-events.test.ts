import assert from 'node:assert/strict';
import { test } from 'node:test';
import { graph } from '../src/modules/catalog/assessment-graph.js';
import { advancedPracticeEventPhases } from '../src/modules/catalog/advanced-practice-events.js';
import { declaredSophistication, normalizeOptionEvidence } from '../src/modules/catalog/evidence-contract.js';
import {
  advancedPracticePhasesById,
  detectPrematureAdoptions,
  technicalPhaseFor,
  advancedPracticeCatalog,
} from '../src/modules/inference/domain/advanced-readiness.js';
import type { ResponseObservation } from '../src/modules/measurement/domain/response-observation.js';
import type { StageDistribution } from '../src/modules/measurement/domain/measurement-params.js';

const peaked = (stage: 0 | 1 | 2 | 3 | 4): StageDistribution => (
  [0, 1, 2, 3, 4].map((s) => (s === stage ? 1 : 0)) as unknown as StageDistribution
);

test('pergunta de evento de chaos declara F0–F5 e não altera a âncora de apropriação', () => {
  const node = graph.find((item) => item.id === 'chaos-dependency-exercise');
  assert.ok(node);
  const phases = new Set<number>();
  for (const option of node!.options) {
    if (option.observation) continue;
    const link = normalizeOptionEvidence(option).evidence.find((item) => item.role === 'primary');
    assert.ok(link, option.id);
    const event = advancedPracticeEventPhases[link!.pattern];
    assert.ok(event, link!.pattern);
    assert.equal(event!.practiceId, 'chaos-engineering');
    assert.equal(declaredSophistication(link!.pattern), event!.phase);
    assert.equal(link!.sophistication, event!.phase);
    assert.equal(link!.capability, 'reliability-practice');
    phases.add(event!.phase);
  }
  assert.deepEqual([...phases].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5]);
});

test('resposta de chaos alimenta a fase técnica da prática e adoção prematura', () => {
  const observations: ResponseObservation[] = [
    { participantId: 'p1', unitId: 'u1', profile: 'platform', nodeId: 'chaos-dependency-exercise', optionId: 'chaos-prod-small' },
    { participantId: 'p2', unitId: 'u1', profile: 'engineering', nodeId: 'chaos-dependency-exercise', optionId: 'chaos-prod-small' },
  ];
  const byPractice = advancedPracticePhasesById(observations);
  const chaos = byPractice.get('chaos-engineering');
  assert.ok(chaos);
  assert.equal(chaos!.phase, 3);

  const practice = advancedPracticeCatalog.find((item) => item.id === 'chaos-engineering')!;
  const leaves = {
    'chaos-engineering': { phaseDistribution: chaos!.distribution, phase: chaos!.phase },
    'observability-practice': { distribution: peaked(1), phase: 1 },
    'reliability-practice': { distribution: peaked(1) },
    'incident-management': { distribution: peaked(1), phase: 1 },
    'release-feedback': { distribution: peaked(1), phase: 1 },
    'organizational-learning': { distribution: peaked(1) },
  };
  assert.equal(technicalPhaseFor(practice, leaves), 3);
  const premature = detectPrematureAdoptions(leaves);
  assert.ok(premature.some((item) => item.practiceId === 'chaos-engineering'));
});
