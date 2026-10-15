import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  advancedPracticeCatalog,
  bottleneckStatus,
  detectPrematureAdoptions,
  nextStepTowardPractice,
  projectPracticeReadiness,
} from '../src/modules/inference/domain/advanced-readiness.js';
import { projectFrontierBrief } from '../src/modules/inference/domain/learning-frontier.js';
import { projectReadinessSteps } from '../src/modules/inference/domain/diagnostic-report.js';
import { renderFrontierPage, renderReadinessPage } from '../src/modules/projects/diagnostic-report-view.js';
import type { StageDistribution } from '../src/modules/measurement/domain/measurement-params.js';
import type { SophisticationDistribution } from '../src/modules/inference/domain/sophistication-matrix.js';

const peaked = (stage: 0 | 1 | 2 | 3 | 4): StageDistribution => (
  [0, 1, 2, 3, 4].map((item) => (item === stage ? 1 : 0)) as unknown as StageDistribution
);
const phasePeaked = (phase: 0 | 1 | 2 | 3 | 4 | 5): SophisticationDistribution => (
  [0, 1, 2, 3, 4, 5].map((item) => (item === phase ? 1 : 0)) as unknown as SophisticationDistribution
);

const leaves = {
  'observability-practice': { distribution: peaked(1) },
  'incident-management': { distribution: peaked(2) },
  'continuous-integration': { distribution: peaked(3) },
  'release-feedback': { distribution: peaked(3) },
  'work-management': { distribution: peaked(1) },
  'leadership-management': { distribution: peaked(1) },
};

test('status da prontidão segue o pré-requisito mais fraco e a média não decide', () => {
  const assessment = projectPracticeReadiness([
    { id: 'a', label: 'Observabilidade', essential: true, probability: 0.9 },
    { id: 'b', label: 'Estado estável', essential: true, probability: 0.2 },
  ]);
  const status = bottleneckStatus(assessment);
  assert.equal(status.bottleneck, 'Estado estável');
  assert.equal(status.band, 'not-ready');
  assert.match(status.line, /mais fraco/);
  assert.match(status.line, /A média não decide/);
});

test('adoção prematura é risco do sistema, sem culpa de pessoa', () => {
  const findings = detectPrematureAdoptions({
    'observability-practice': { distribution: peaked(1), phaseDistribution: phasePeaked(4) },
    'reliability-practice': { distribution: peaked(1) },
    'incident-management': { distribution: peaked(1), phaseDistribution: phasePeaked(2) },
    'release-feedback': { distribution: peaked(1), phaseDistribution: phasePeaked(3) },
    'organizational-learning': { distribution: peaked(1) },
  });
  const chaos = findings.find((item) => item.practiceId === 'chaos-engineering');
  assert.match(chaos?.reading ?? '', /não culpa de uma pessoa/);
});

test('fronteira separa dominado, o que dá para aprender e o que segue bloqueado', () => {
  const brief = projectFrontierBrief(leaves);
  assert.ok(brief.mastered.some((item) => item.leafId === 'release-feedback'));
  assert.ok(brief.learnable.every((item) => item.leafId !== 'release-feedback'));
  assert.ok(brief.blocked.some((item) => item.leafId === 'incident-management'));
  assert.equal('gap' in brief.start, false);
  if (!('gap' in brief.start)) {
    const start = brief.start;
    assert.notEqual(start.leafId, 'incident-management');
    assert.ok(brief.learnable.some((item) => item.leafId === start.leafId));
  }
  assert.ok(brief.parallel.some((item) => /voz|segurança|erro/i.test(`${item.label} ${item.body}`)));
  assert.match(brief.advancedAside, /dois passos/);
});

test('próximo passo da prontidão não é um degrau bloqueado na fronteira', () => {
  const brief = projectFrontierBrief(leaves);
  const steps = projectReadinessSteps(leaves, brief);
  for (const [practiceId, step] of steps) {
    if (!step.next) continue;
    const practice = advancedPracticeCatalog.find((item) => item.id === practiceId);
    const raw = practice ? nextStepTowardPractice(practice, leaves) : undefined;
    if (!raw) continue;
    assert.equal(brief.blocked.some((item) => item.leafId === raw.leafId) && !brief.learnable.some((item) => item.leafId === raw.leafId), false);
  }
  const html = renderFrontierPage({ ...brief, readinessHref: '/report/readiness' });
  assert.match(html, /Dominado/);
  assert.match(html, /Pode aprender agora/);
  assert.match(html, /Ainda bloqueado/);
  assert.match(html, /Comece por/);
  assert.match(html, /Em paralelo/);
  assert.match(html, /Ver prontidão →/);
  assert.match(html, /href="\/report\/readiness"/);
  assert.doesNotMatch(html, /1%|12%|21%/);
  const blocked = brief.blocked.find((item) => item.leafId === 'incident-management');
  if (blocked && !('gap' in brief.start)) {
    assert.ok(html.indexOf('Comece por') < html.indexOf(brief.start.step) || html.includes(brief.start.step));
    assert.doesNotMatch(html.slice(html.indexOf('Comece por'), html.indexOf('Em paralelo')), new RegExp(blocked.label));
  }
});

test('cartão de prontidão lista p_k, o gargalo e omite o passo bloqueado', () => {
  const practice = advancedPracticeCatalog.find((item) => item.id === 'chaos-engineering')!;
  const assessment = projectPracticeReadiness([
    { id: 'obs', label: 'Observabilidade dos serviços críticos', essential: true, probability: 0.12 },
    { id: 'slo', label: 'Estado estável definido', essential: true, probability: 0.8 },
  ]);
  const html = renderReadinessPage([{
    id: practice.id,
    label: practice.label,
    assessment,
    verdict: bottleneckStatus(assessment),
    withheld: 'Observabilidade dos serviços críticos está bloqueado na fronteira e não é o próximo passo.',
    premature: true,
  }]);
  assert.match(html, /p_k 0\.12/);
  assert.match(html, /p_k 0\.80/);
  assert.match(html, /A média não decide/);
  assert.match(html, /não culpa de uma pessoa/);
  assert.match(html, /não é o próximo passo/);
  assert.match(html, /nunca passa a ser índice/);
});
