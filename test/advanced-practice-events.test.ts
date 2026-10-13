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

test('pergunta de evento de QA declara F0–F5 na prática quality-automation', () => {
  const node = graph.find((item) => item.id === 'quality-break-detection');
  assert.ok(node);
  const phases = new Set<number>();
  for (const option of node!.options) {
    if (option.observation) continue;
    const link = normalizeOptionEvidence(option).evidence.find((item) => item.role === 'primary');
    assert.ok(link, option.id);
    const event = advancedPracticeEventPhases[link!.pattern];
    assert.ok(event, link!.pattern);
    assert.equal(event!.practiceId, 'quality-automation');
    assert.equal(link!.sophistication, event!.phase);
    assert.equal(link!.capability, 'quality-strategy');
    phases.add(event!.phase);
  }
  assert.deepEqual([...phases].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5]);

  const observations: ResponseObservation[] = [
    { participantId: 'a', unitId: 'u1', profile: 'engineering', nodeId: 'quality-break-detection', optionId: 'qa-risk-feedback' },
  ];
  const qa = advancedPracticePhasesById(observations).get('quality-automation');
  assert.ok(qa);
  assert.equal(qa!.phase, 4);
});

test('pressão de flaky declara gestão de instabilidade na prática quality-automation', () => {
  const node = graph.find((item) => item.id === 'quality-flaky-pressure');
  assert.ok(node);
  assert.equal(node!.pressure, true);
  const byPattern = new Map<string, number>();
  for (const option of node!.options) {
    if (option.observation) continue;
    const link = normalizeOptionEvidence(option).evidence.find((item) => item.role === 'primary');
    assert.ok(link, option.id);
    const event = advancedPracticeEventPhases[link!.pattern];
    assert.ok(event, link!.pattern);
    assert.equal(event!.practiceId, 'quality-automation');
    assert.equal(link!.sophistication, event!.phase);
    byPattern.set(link!.pattern, event!.phase);
  }
  assert.equal(byPattern.get('qa-flaky-desativado'), 0);
  assert.equal(byPattern.get('qa-flaky-rerun'), 1);
  assert.equal(byPattern.get('qa-flaky-investigado'), 3);
  assert.equal(byPattern.get('qa-flaky-processo'), 4);

  const observations: ResponseObservation[] = [
    { participantId: 'a', unitId: 'u1', profile: 'quality', nodeId: 'quality-flaky-pressure', optionId: 'flaky-process' },
  ];
  const qa = advancedPracticePhasesById(observations).get('quality-automation');
  assert.ok(qa);
  assert.equal(qa!.phase, 4);
});

test('pergunta de evento de AI-DLC declara F0–F5 e só aparece quando há assistência', () => {
  const node = graph.find((item) => item.id === 'ai-dlc-verification');
  assert.ok(node);
  const phases = new Set<number>();
  for (const option of node!.options) {
    if (option.observation) continue;
    const link = normalizeOptionEvidence(option).evidence.find((item) => item.role === 'primary');
    assert.ok(link, option.id);
    const event = advancedPracticeEventPhases[link!.pattern];
    assert.ok(event, link!.pattern);
    assert.equal(event!.practiceId, 'ai-dlc');
    assert.equal(link!.sophistication, event!.phase);
    phases.add(event!.phase);
  }
  assert.deepEqual([...phases].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5]);

  const observations: ResponseObservation[] = [
    { participantId: 'a', unitId: 'u1', profile: 'engineering', nodeId: 'ai-dlc-verification', optionId: 'ai-criteria-first' },
  ];
  const ai = advancedPracticePhasesById(observations).get('ai-dlc');
  assert.ok(ai);
  assert.equal(ai!.phase, 4);
});

test('generalização AI-DLC cobre infra e dados na mesma prática', () => {
  const node = graph.find((item) => item.id === 'ai-dlc-generalization');
  assert.ok(node);
  const phases = new Set<number>();
  for (const option of node!.options) {
    if (option.observation) continue;
    const link = normalizeOptionEvidence(option).evidence.find((item) => item.role === 'primary');
    assert.ok(link, option.id);
    const event = advancedPracticeEventPhases[link!.pattern];
    assert.ok(event, link!.pattern);
    assert.equal(event!.practiceId, 'ai-dlc');
    assert.equal(link!.layer, 'consistency');
    phases.add(event!.phase);
  }
  assert.ok(phases.has(1) && phases.has(2) && phases.has(4));

  const observations: ResponseObservation[] = [
    { participantId: 'a', unitId: 'u1', profile: 'platform', nodeId: 'ai-dlc-generalization', optionId: 'ai-gen-yes' },
  ];
  assert.equal(advancedPracticePhasesById(observations).get('ai-dlc')?.phase, 4);
});

test('pergunta de evento de Zero Trust declara F0–F5 na prática zero-trust', () => {
  const node = graph.find((item) => item.id === 'zero-trust-access');
  assert.ok(node);
  const phases = new Set<number>();
  for (const option of node!.options) {
    if (option.observation) continue;
    const link = normalizeOptionEvidence(option).evidence.find((item) => item.role === 'primary');
    assert.ok(link, option.id);
    const event = advancedPracticeEventPhases[link!.pattern];
    assert.ok(event, link!.pattern);
    assert.equal(event!.practiceId, 'zero-trust');
    assert.equal(declaredSophistication(link!.pattern), event!.phase);
    assert.equal(link!.sophistication, event!.phase);
    assert.equal(link!.capability, 'cloud-security');
    phases.add(event!.phase);
  }
  assert.deepEqual([...phases].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5]);

  const credential = graph.find((item) => item.id === 'credential-practice');
  assert.equal(credential?.next, 'zero-trust-access');
  assert.equal(node!.next, 'dependency-context');

  const observations: ResponseObservation[] = [
    { participantId: 'a', unitId: 'u1', profile: 'security', nodeId: 'zero-trust-access', optionId: 'zt-context' },
    { participantId: 'b', unitId: 'u1', profile: 'platform', nodeId: 'zero-trust-access', optionId: 'zt-context' },
  ];
  const practicePhase = advancedPracticePhasesById(observations).get('zero-trust');
  assert.ok(practicePhase);
  assert.equal(practicePhase!.phase, 4);

  const practice = advancedPracticeCatalog.find((item) => item.id === 'zero-trust')!;
  const leaves = {
    'zero-trust': { phaseDistribution: practicePhase!.distribution, phase: practicePhase!.phase },
    'cloud-security': { distribution: peaked(1), phase: 1 },
    'software-security': { distribution: peaked(1) },
    'observability-practice': { distribution: peaked(1) },
    'reproducible-infrastructure': { distribution: peaked(1) },
  };
  assert.equal(technicalPhaseFor(practice, leaves), 4);
  const premature = detectPrematureAdoptions(leaves);
  assert.ok(premature.some((item) => item.practiceId === 'zero-trust'));
});

test('pergunta de evento de data mesh declara F0–F5 na prática data-mesh', () => {
  const node = graph.find((item) => item.id === 'data-mesh-domain');
  assert.ok(node);
  const phases = new Set<number>();
  for (const option of node!.options) {
    if (option.observation) continue;
    const link = normalizeOptionEvidence(option).evidence.find((item) => item.role === 'primary');
    assert.ok(link, option.id);
    const event = advancedPracticeEventPhases[link!.pattern];
    assert.ok(event, link!.pattern);
    assert.equal(event!.practiceId, 'data-mesh');
    assert.equal(declaredSophistication(link!.pattern), event!.phase);
    assert.equal(link!.sophistication, event!.phase);
    assert.equal(link!.capability, 'integration-data');
    phases.add(event!.phase);
  }
  assert.deepEqual([...phases].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5]);

  const contract = graph.find((item) => item.id === 'data-contract-change');
  assert.equal(contract?.next, 'data-mesh-domain');
  assert.equal(node!.next, 'reliability-objective');

  const observations: ResponseObservation[] = [
    { participantId: 'a', unitId: 'u1', profile: 'data', nodeId: 'data-mesh-domain', optionId: 'mesh-federated' },
    { participantId: 'b', unitId: 'u1', profile: 'platform', nodeId: 'data-mesh-domain', optionId: 'mesh-federated' },
  ];
  const practicePhase = advancedPracticePhasesById(observations).get('data-mesh');
  assert.ok(practicePhase);
  assert.equal(practicePhase!.phase, 4);

  const practice = advancedPracticeCatalog.find((item) => item.id === 'data-mesh')!;
  const leaves = {
    'data-mesh': { phaseDistribution: practicePhase!.distribution, phase: practicePhase!.phase },
    'integration-data': { distribution: peaked(1) },
    'team-ownership': { distribution: peaked(1) },
    'enabling-governance': { distribution: peaked(1) },
    'technical-capability': { distribution: peaked(1) },
  };
  assert.equal(technicalPhaseFor(practice, leaves), 4);
  const premature = detectPrematureAdoptions(leaves);
  assert.ok(premature.some((item) => item.practiceId === 'data-mesh'));
});

test('pergunta de evento de arquitetura em células declara F0–F5 na prática cell-architecture', () => {
  const node = graph.find((item) => item.id === 'cell-architecture-boundary');
  assert.ok(node);
  const phases = new Set<number>();
  for (const option of node!.options) {
    if (option.observation) continue;
    const link = normalizeOptionEvidence(option).evidence.find((item) => item.role === 'primary');
    assert.ok(link, option.id);
    const event = advancedPracticeEventPhases[link!.pattern];
    assert.ok(event, link!.pattern);
    assert.equal(event!.practiceId, 'cell-architecture');
    assert.equal(declaredSophistication(link!.pattern), event!.phase);
    assert.equal(link!.sophistication, event!.phase);
    assert.equal(link!.capability, 'evolvability');
    phases.add(event!.phase);
  }
  assert.deepEqual([...phases].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5]);

  const accidental = graph.find((item) => item.id === 'accidental-complexity');
  assert.equal(accidental?.next, 'cell-architecture-boundary');
  assert.equal(node!.next, 'noisy-signal');

  const observations: ResponseObservation[] = [
    { participantId: 'a', unitId: 'u1', profile: 'architecture', nodeId: 'cell-architecture-boundary', optionId: 'cell-contained' },
    { participantId: 'b', unitId: 'u1', profile: 'engineering', nodeId: 'cell-architecture-boundary', optionId: 'cell-contained' },
  ];
  const practicePhase = advancedPracticePhasesById(observations).get('cell-architecture');
  assert.ok(practicePhase);
  assert.equal(practicePhase!.phase, 4);

  const practice = advancedPracticeCatalog.find((item) => item.id === 'cell-architecture')!;
  const leaves = {
    'cell-architecture': { phaseDistribution: practicePhase!.distribution, phase: practicePhase!.phase },
    'team-ownership': { distribution: peaked(1) },
    'observability-practice': { distribution: peaked(1), phase: 1 },
    'release-feedback': { distribution: peaked(1), phase: 1 },
    'integration-data': { distribution: peaked(1) },
  };
  assert.equal(technicalPhaseFor(practice, leaves), 4);
  const premature = detectPrematureAdoptions(leaves);
  assert.ok(premature.some((item) => item.practiceId === 'cell-architecture'));
});

test('pergunta de evento de remediação automática declara F0–F5 na prática aiops-remediation', () => {
  const node = graph.find((item) => item.id === 'aiops-auto-remediation');
  assert.ok(node);
  const phases = new Set<number>();
  for (const option of node!.options) {
    if (option.observation) continue;
    const link = normalizeOptionEvidence(option).evidence.find((item) => item.role === 'primary');
    assert.ok(link, option.id);
    const event = advancedPracticeEventPhases[link!.pattern];
    assert.ok(event, link!.pattern);
    assert.equal(event!.practiceId, 'aiops-remediation');
    assert.equal(declaredSophistication(link!.pattern), event!.phase);
    assert.equal(link!.sophistication, event!.phase);
    assert.equal(link!.capability, 'incident-management');
    phases.add(event!.phase);
  }
  assert.deepEqual([...phases].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5]);

  const remediation = graph.find((item) => item.id === 'incident-remediation');
  assert.equal(remediation?.next, 'aiops-auto-remediation');
  assert.equal(node!.next, 'chaos-dependency-exercise');

  const observations: ResponseObservation[] = [
    { participantId: 'a', unitId: 'u1', profile: 'platform', nodeId: 'aiops-auto-remediation', optionId: 'aiops-auto' },
    { participantId: 'b', unitId: 'u1', profile: 'engineering', nodeId: 'aiops-auto-remediation', optionId: 'aiops-auto' },
  ];
  const practicePhase = advancedPracticePhasesById(observations).get('aiops-remediation');
  assert.ok(practicePhase);
  assert.equal(practicePhase!.phase, 4);

  const practice = advancedPracticeCatalog.find((item) => item.id === 'aiops-remediation')!;
  const leaves = {
    'aiops-remediation': { phaseDistribution: practicePhase!.distribution, phase: practicePhase!.phase },
    'observability-practice': { distribution: peaked(1), phase: 1 },
    'incident-management': { distribution: peaked(1), phase: 1 },
    'release-feedback': { distribution: peaked(1), phase: 1 },
    'reliability-practice': { distribution: peaked(1) },
  };
  assert.equal(technicalPhaseFor(practice, leaves), 4);
  const premature = detectPrematureAdoptions(leaves);
  assert.ok(premature.some((item) => item.practiceId === 'aiops-remediation'));
});

test('pergunta de evento de plataforma como produto declara F0–F5 na prática platform-as-product', () => {
  const node = graph.find((item) => item.id === 'platform-as-product-offer');
  assert.ok(node);
  const phases = new Set<number>();
  for (const option of node!.options) {
    if (option.observation) continue;
    const link = normalizeOptionEvidence(option).evidence.find((item) => item.role === 'primary');
    assert.ok(link, option.id);
    const event = advancedPracticeEventPhases[link!.pattern];
    assert.ok(event, link!.pattern);
    assert.equal(event!.practiceId, 'platform-as-product');
    assert.equal(declaredSophistication(link!.pattern), event!.phase);
    assert.equal(link!.sophistication, event!.phase);
    assert.equal(link!.capability, 'platform-autonomy');
    phases.add(event!.phase);
  }
  assert.deepEqual([...phases].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5]);

  const learning = graph.find((item) => item.id === 'platform-path-learning');
  assert.equal(learning?.next, 'platform-as-product-offer');

  const observations: ResponseObservation[] = [
    { participantId: 'a', unitId: 'u1', profile: 'platform', nodeId: 'platform-as-product-offer', optionId: 'plat-product' },
    { participantId: 'b', unitId: 'u1', profile: 'engineering', nodeId: 'platform-as-product-offer', optionId: 'plat-product' },
  ];
  const practicePhase = advancedPracticePhasesById(observations).get('platform-as-product');
  assert.ok(practicePhase);
  assert.equal(practicePhase!.phase, 4);

  const practice = advancedPracticeCatalog.find((item) => item.id === 'platform-as-product')!;
  const leaves = {
    'platform-as-product': { phaseDistribution: practicePhase!.distribution, phase: practicePhase!.phase },
    'platform-autonomy': { distribution: peaked(1), phase: 1 },
    'product-direction': { distribution: peaked(1) },
    'team-ownership': { distribution: peaked(1) },
    'reproducible-infrastructure': { distribution: peaked(1), phase: 1 },
  };
  assert.equal(technicalPhaseFor(practice, leaves), 4);
  const premature = detectPrematureAdoptions(leaves);
  assert.ok(premature.some((item) => item.practiceId === 'platform-as-product'));
});

test('pergunta de evento de SLO com error budget declara F0–F5 na prática slo-error-budget', () => {
  const node = graph.find((item) => item.id === 'slo-error-budget-policy');
  assert.ok(node);
  const phases = new Set<number>();
  for (const option of node!.options) {
    if (option.observation) continue;
    const link = normalizeOptionEvidence(option).evidence.find((item) => item.role === 'primary');
    assert.ok(link, option.id);
    const event = advancedPracticeEventPhases[link!.pattern];
    assert.ok(event, link!.pattern);
    assert.equal(event!.practiceId, 'slo-error-budget');
    assert.equal(declaredSophistication(link!.pattern), event!.phase);
    assert.equal(link!.sophistication, event!.phase);
    assert.equal(link!.capability, 'reliability-practice');
    phases.add(event!.phase);
  }
  assert.deepEqual([...phases].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5]);

  const reliability = graph.find((item) => item.id === 'reliability-objective');
  assert.equal(reliability?.next, 'slo-error-budget-policy');
  assert.equal(node!.next, 'credential-context');

  const observations: ResponseObservation[] = [
    { participantId: 'a', unitId: 'u1', profile: 'platform', nodeId: 'slo-error-budget-policy', optionId: 'slo-pause' },
    { participantId: 'b', unitId: 'u1', profile: 'product', nodeId: 'slo-error-budget-policy', optionId: 'slo-pause' },
  ];
  const slo = advancedPracticePhasesById(observations).get('slo-error-budget');
  assert.ok(slo);
  assert.equal(slo!.phase, 4);

  const practice = advancedPracticeCatalog.find((item) => item.id === 'slo-error-budget')!;
  const leaves = {
    'slo-error-budget': { phaseDistribution: slo!.distribution, phase: slo!.phase },
    'observability-practice': { distribution: peaked(1), phase: 1 },
    'reliability-practice': { distribution: peaked(1), phase: 1 },
    'product-direction': { distribution: peaked(1) },
    'leadership-management': { distribution: peaked(1) },
  };
  assert.equal(technicalPhaseFor(practice, leaves), 4);
  const premature = detectPrematureAdoptions(leaves);
  assert.ok(premature.some((item) => item.practiceId === 'slo-error-budget'));
});

test('pergunta de evento de desenvolvimento no tronco declara F0–F5 na prática trunk-based', () => {
  const node = graph.find((item) => item.id === 'trunk-based-integration');
  assert.ok(node);
  const phases = new Set<number>();
  for (const option of node!.options) {
    if (option.observation) continue;
    const link = normalizeOptionEvidence(option).evidence.find((item) => item.role === 'primary');
    assert.ok(link, option.id);
    const event = advancedPracticeEventPhases[link!.pattern];
    assert.ok(event, link!.pattern);
    assert.equal(event!.practiceId, 'trunk-based');
    assert.equal(declaredSophistication(link!.pattern), event!.phase);
    assert.equal(link!.sophistication, event!.phase);
    assert.equal(link!.capability, 'continuous-integration');
    phases.add(event!.phase);
  }
  assert.deepEqual([...phases].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5]);

  assert.equal(node!.next, 'quality-break-detection');

  const observations: ResponseObservation[] = [
    { participantId: 'a', unitId: 'u1', profile: 'engineering', nodeId: 'trunk-based-integration', optionId: 'trunk-decoupled' },
    { participantId: 'b', unitId: 'u1', profile: 'platform', nodeId: 'trunk-based-integration', optionId: 'trunk-decoupled' },
  ];
  const trunk = advancedPracticePhasesById(observations).get('trunk-based');
  assert.ok(trunk);
  assert.equal(trunk!.phase, 4);

  const practice = advancedPracticeCatalog.find((item) => item.id === 'trunk-based')!;
  const leaves = {
    'trunk-based': { phaseDistribution: trunk!.distribution, phase: trunk!.phase },
    'continuous-integration': { distribution: peaked(1), phase: 1 },
    'release-feedback': { distribution: peaked(1), phase: 1 },
    'quality-strategy': { distribution: peaked(1), phase: 1 },
    'sdlc-automation': { distribution: peaked(1), phase: 1 },
  };
  assert.equal(technicalPhaseFor(practice, leaves), 4);
  const premature = detectPrematureAdoptions(leaves);
  assert.ok(premature.some((item) => item.practiceId === 'trunk-based'));
});

test('pergunta de evento de entrega contínua declara F0–F5 na prática continuous-delivery', () => {
  const node = graph.find((item) => item.id === 'continuous-delivery-cadence');
  assert.ok(node);
  const phases = new Set<number>();
  for (const option of node!.options) {
    if (option.observation) continue;
    const link = normalizeOptionEvidence(option).evidence.find((item) => item.role === 'primary');
    assert.ok(link, option.id);
    const event = advancedPracticeEventPhases[link!.pattern];
    assert.ok(event, link!.pattern);
    assert.equal(event!.practiceId, 'continuous-delivery');
    assert.equal(declaredSophistication(link!.pattern), event!.phase);
    assert.equal(link!.sophistication, event!.phase);
    assert.equal(link!.capability, 'release-feedback');
    phases.add(event!.phase);
  }
  assert.deepEqual([...phases].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5]);

  const releaseControl = graph.find((item) => item.id === 'release-control');
  assert.equal(releaseControl?.next, 'continuous-delivery-cadence');
  assert.equal(node!.next, 'release-validation');

  const observations: ResponseObservation[] = [
    { participantId: 'a', unitId: 'u1', profile: 'engineering', nodeId: 'continuous-delivery-cadence', optionId: 'cd-canary' },
    { participantId: 'b', unitId: 'u1', profile: 'platform', nodeId: 'continuous-delivery-cadence', optionId: 'cd-canary' },
  ];
  const cd = advancedPracticePhasesById(observations).get('continuous-delivery');
  assert.ok(cd);
  assert.equal(cd!.phase, 4);

  const practice = advancedPracticeCatalog.find((item) => item.id === 'continuous-delivery')!;
  const leaves = {
    'continuous-delivery': { phaseDistribution: cd!.distribution, phase: cd!.phase },
    'quality-strategy': { distribution: peaked(1), phase: 1 },
    'release-feedback': { distribution: peaked(1), phase: 1 },
    'observability-practice': { distribution: peaked(1), phase: 1 },
    'enabling-governance': { distribution: peaked(1) },
    'continuous-integration': { distribution: peaked(1), phase: 1 },
  };
  assert.equal(technicalPhaseFor(practice, leaves), 4);
  const premature = detectPrematureAdoptions(leaves);
  assert.ok(premature.some((item) => item.practiceId === 'continuous-delivery'));
});
