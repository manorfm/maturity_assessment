import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  advancedPracticeCatalog,
  nextStepTowardPractice,
  probabilityStageAtLeast,
  projectPracticeReadiness,
  resolvePrerequisitePosteriors,
} from '../src/modules/inference/domain/advanced-readiness.js';
import type { StageDistribution } from '../src/modules/measurement/domain/measurement-params.js';
import type { SophisticationDistribution } from '../src/modules/inference/domain/sophistication-matrix.js';
import { projectReadinessPage } from '../src/modules/inference/domain/diagnostic-report.js';
import { renderReadinessPage } from '../src/modules/projects/diagnostic-report-view.js';

const peaked = (stage: 0 | 1 | 2 | 3 | 4): StageDistribution => {
  const raw = [0, 1, 2, 3, 4].map((s) => (s === stage ? 1 : 0));
  return raw as unknown as StageDistribution;
};

const phasePeaked = (phase: 0 | 1 | 2 | 3 | 4 | 5): SophisticationDistribution => (
  [0, 1, 2, 3, 4, 5].map((p) => (p === phase ? 1 : 0)) as unknown as SophisticationDistribution
);

test('p_k é P(S ≥ mínimo) na posterior da folha', () => {
  assert.equal(probabilityStageAtLeast(peaked(3), 3), 1);
  assert.equal(probabilityStageAtLeast(peaked(2), 3), 0);
  const spread: StageDistribution = [0.05, 0.1, 0.2, 0.4, 0.25];
  assert.equal(probabilityStageAtLeast(spread, 3), 0.65);
});

test('chaos engineering resolve p_k pelas folhas e publica P(pronto)', () => {
  const practice = advancedPracticeCatalog.find((item) => item.id === 'chaos-engineering')!;
  const posteriors = resolvePrerequisitePosteriors(practice, {
    'observability-practice': { distribution: peaked(1), phaseDistribution: phasePeaked(1) },
    'reliability-practice': { distribution: peaked(1) },
    'incident-management': { distribution: peaked(3), phaseDistribution: phasePeaked(2) },
    'release-feedback': { distribution: peaked(2), phaseDistribution: phasePeaked(2) },
    'organizational-learning': { distribution: peaked(2) },
    'reproducible-infrastructure': { distribution: peaked(3) },
    'integration-data': { distribution: peaked(2) },
  });
  assert.ok(posteriors);
  const readiness = projectPracticeReadiness(posteriors!);
  assert.equal(readiness.band, 'not-ready');
  assert.ok(readiness.probability < 0.25);
  assert.ok(readiness.bottleneckId);

  const strong = resolvePrerequisitePosteriors(practice, {
    'observability-practice': { distribution: peaked(3), phaseDistribution: phasePeaked(3) },
    'reliability-practice': { distribution: peaked(3) },
    'incident-management': { distribution: peaked(3), phaseDistribution: phasePeaked(2) },
    'release-feedback': { distribution: peaked(3), phaseDistribution: phasePeaked(3) },
    'organizational-learning': { distribution: peaked(3) },
    'reproducible-infrastructure': { distribution: peaked(3) },
    'integration-data': { distribution: peaked(2) },
  });
  assert.equal(projectPracticeReadiness(strong!).band, 'ready');
});

test('sem cobertura das folhas essenciais declara lacuna; não inventa índice', () => {
  const practice = advancedPracticeCatalog.find((item) => item.id === 'chaos-engineering')!;
  assert.equal(resolvePrerequisitePosteriors(practice, {}), undefined);
  const page = projectReadinessPage(
    advancedPracticeCatalog.map((item) => ({
      id: item.id,
      label: item.label,
      prerequisites: resolvePrerequisitePosteriors(item, {
        'observability-practice': { level: 1, coverage: 1 },
      }) ?? undefined,
    })),
  );
  assert.ok(page.every((item) => item.gap || item.assessment));
  assert.ok(page.find((item) => item.id === 'chaos-engineering')?.gap);
  const html = renderReadinessPage(page);
  assert.match(html, /Sem posterior|Ainda não há posterior|Prontidão não vira índice/i);
});

test('nível pontual vira distribuição provisória para p_k', () => {
  const practice = advancedPracticeCatalog.find((item) => item.id === 'ai-dlc')!;
  const posteriors = resolvePrerequisitePosteriors(practice, {
    'sdlc-automation': { level: 3, coverage: 1 },
    'continuous-integration': { level: 3, coverage: 1 },
    'planning-refinement': { level: 3, coverage: 1 },
    'cloud-security': { level: 2, coverage: 1 },
    'platform-autonomy': { level: 2, coverage: 1 },
  });
  assert.ok(posteriors);
  const assessment = projectPracticeReadiness(posteriors!);
  assert.ok(assessment.probability > 0);
  assert.equal(typeof assessment.band, 'string');
});

test('checklist de prontidão lista p_k de cada pré-requisito', () => {
  const assessment = projectPracticeReadiness(chaosEngineeringExample());
  assert.ok(assessment.checklist.length >= 5);
  assert.ok(assessment.checklist.every((item) => typeof item.probability === 'number' && item.label));
  const html = renderReadinessPage([{
    id: 'chaos-engineering',
    label: 'Chaos engineering',
    assessment,
  }]);
  assert.match(html, /p_k|pré-requisito/i);
  assert.match(html, /Observabilidade|Estado estável/i);
});

test('próximo degrau rumo à prática aponta o gargalo, um de cada vez', () => {
  const practice = advancedPracticeCatalog.find((item) => item.id === 'chaos-engineering')!;
  const leaves = {
    'observability-practice': { distribution: peaked(1), phaseDistribution: phasePeaked(1) },
    'reliability-practice': { distribution: peaked(1) },
    'incident-management': { distribution: peaked(3), phaseDistribution: phasePeaked(2) },
    'release-feedback': { distribution: peaked(2), phaseDistribution: phasePeaked(2) },
    'organizational-learning': { distribution: peaked(2) },
  };
  const step = nextStepTowardPractice(practice, leaves);
  assert.ok(step);
  assert.equal(step!.practiceId, 'chaos-engineering');
  assert.ok(step!.leafId);
  assert.match(step!.reading, /próximo degrau|gargalo|um degrau/i);
  assert.notEqual(step!.band, 'ready');
});

function chaosEngineeringExample() {
  return [
    { id: 'observability', label: 'Observabilidade', essential: true, probability: 0.35 },
    { id: 'steady-state', label: 'Estado estável', essential: true, probability: 0.2 },
    { id: 'incident-response', label: 'Resposta a incidentes', essential: true, probability: 0.7 },
    { id: 'rollback', label: 'Reversão', essential: true, probability: 0.5 },
    { id: 'learning', label: 'Aprendizado', essential: true, probability: 0.4 },
  ];
}
