import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as learningFrontier from '../src/modules/inference/domain/learning-frontier.js';
import {
  projectFrontierBrief,
  type FrontierBrief,
  type FrontierPlace,
} from '../src/modules/inference/domain/learning-frontier.js';
import { renderFrontierPage } from '../src/modules/projects/diagnostic-report-view.js';
import type { StageDistribution } from '../src/modules/measurement/domain/measurement-params.js';
import { layout } from '../src/shared/html.js';

type FrontierLadder = {
  rungs: Array<{ phase: number; label: string; places: Array<FrontierPlace & { status: 'mastered' | 'learnable' | 'blocked' }> }>;
  unplaced: FrontierPlace[];
};

const projectFrontierLadder = (learningFrontier as {
  projectFrontierLadder?: (brief: FrontierBrief) => FrontierLadder;
}).projectFrontierLadder;

const RUNG_LABELS = [
  'Condições humanas',
  'Fluxo e decisão',
  'Práticas técnicas',
  'Entrega',
  'Operação confiável',
  'Práticas avançadas',
] as const;

const peaked = (stage: 0 | 1 | 2 | 3 | 4): StageDistribution => (
  [0, 1, 2, 3, 4].map((item) => (item === stage ? 1 : 0)) as unknown as StageDistribution
);

const place = (partial: Partial<FrontierPlace> & Pick<FrontierPlace, 'leafId' | 'label'>): FrontierPlace => ({
  blockedBy: [],
  unlocks: 'comportamento',
  probability: 0.8,
  ...partial,
});

const briefWith = (overrides: Partial<FrontierBrief>): FrontierBrief => ({
  mastered: [],
  learnable: [],
  blocked: [],
  start: { gap: 'Nada está desbloqueado para aprender agora.' },
  parallel: [],
  advancedAside: 'Práticas avançadas a dois passos não são o próximo passo.',
  ...overrides,
});

test('projectFrontierLadder agrupa places com mark por phase F0–F5', () => {
  assert.equal(typeof projectFrontierLadder, 'function', 'projectFrontierLadder deve existir no domínio');
  const brief = briefWith({
    mastered: [place({ leafId: 'release-feedback', label: 'Feedback de release', mark: 'F3', probability: 1 })],
    learnable: [place({ leafId: 'continuous-integration', label: 'Integração contínua', mark: 'F2', probability: 0.9 })],
    blocked: [
      place({
        leafId: 'incident-management',
        label: 'Gestão de incidentes',
        mark: 'F1',
        probability: 0.1,
        blockedBy: ['Observabilidade'],
      }),
      place({ leafId: 'work-management', label: 'Gestão do trabalho', probability: 0.2 }),
    ],
  });
  const ladder = projectFrontierLadder!(brief);
  assert.equal(ladder.rungs.length, 6);
  for (let phase = 0; phase <= 5; phase += 1) {
    assert.equal(ladder.rungs[phase]?.phase, phase);
    assert.equal(ladder.rungs[phase]?.label, RUNG_LABELS[phase]);
  }
  assert.ok(ladder.rungs[3]?.places.some((item) => item.leafId === 'release-feedback' && item.status === 'mastered'));
  assert.ok(ladder.rungs[2]?.places.some((item) => item.leafId === 'continuous-integration' && item.status === 'learnable'));
  assert.ok(ladder.rungs[1]?.places.some((item) => item.leafId === 'incident-management' && item.status === 'blocked'));
  assert.equal(ladder.rungs.every((rung) => !rung.places.some((item) => item.leafId === 'work-management')), true);
  assert.ok(ladder.unplaced.some((item) => item.leafId === 'work-management'));
});

test('com pelo menos um mark a view renderiza frontier-ladder com seis frontier-rung', () => {
  const brief = briefWith({
    mastered: [place({ leafId: 'release-feedback', label: 'Feedback de release', mark: 'F3' })],
    start: { step: 'Feedback de release', unlocks: 'Confiar no pipeline', leafId: 'release-feedback', mark: 'F3' },
  });
  const html = renderFrontierPage({ ...brief, readinessHref: '/report/readiness' });
  assert.match(html, /class="[^"]*\bfrontier-ladder\b/);
  for (let phase = 0; phase <= 5; phase += 1) {
    assert.match(html, new RegExp(`class="[^"]*\\bfrontier-rung\\b[^"]*"[^>]*data-phase="${phase}"|data-phase="${phase}"[^>]*class="[^"]*\\bfrontier-rung\\b`));
  }
  for (const label of RUNG_LABELS) {
    assert.equal(html.includes(label), true, `rótulo canônico ausente: ${label}`);
  }
  assert.doesNotMatch(html, /<h2>Dominado<\/h2>/);
  assert.doesNotMatch(html, /<h2>Pode aprender agora<\/h2>/);
  assert.doesNotMatch(html, /<h2>Ainda bloqueado<\/h2>/);
});

test('prática com mark vira frontier-practice no degrau e status da lista de origem', () => {
  const brief = briefWith({
    mastered: [place({ leafId: 'release-feedback', label: 'Feedback <b>x</b>', mark: 'F3' })],
    learnable: [place({ leafId: 'continuous-integration', label: 'Integração', mark: 'F2' })],
    blocked: [place({
      leafId: 'incident-management',
      label: 'Incidentes',
      mark: 'F1',
      blockedBy: ['Observabilidade'],
    })],
    start: { step: 'Integração', unlocks: 'Confiar', leafId: 'continuous-integration', mark: 'F2' },
  });
  const html = renderFrontierPage({ ...brief, readinessHref: '/report/readiness' });
  assert.match(html, /class="[^"]*\bfrontier-practice\b/);
  assert.match(html, /class="[^"]*\bfrontier-practice-mastered\b/);
  assert.match(html, /class="[^"]*\bfrontier-practice-learnable\b/);
  assert.match(html, /class="[^"]*\bfrontier-practice-blocked\b/);
  assert.match(html, /dominado/i);
  assert.match(html, /na fronteira:\s*pode aprender agora/i);
  assert.match(html, /bloqueado(?:[^<]*por Observabilidade)?/i);
  assert.equal(html.includes('F3'), true);
  assert.equal(html.includes('F2'), true);
  assert.equal(html.includes('F1'), true);
  assert.equal(html.includes('<b>x</b>'), false);
  assert.equal(html.includes('Feedback &lt;b&gt;x&lt;/b&gt;'), true);
});

test('sem mark nas places: fallback das três listas e sem frontier-ladder', () => {
  const brief = projectFrontierBrief({
    'observability-practice': { distribution: peaked(1) },
    'incident-management': { distribution: peaked(2) },
    'continuous-integration': { distribution: peaked(3) },
    'release-feedback': { distribution: peaked(3) },
    'work-management': { distribution: peaked(1) },
    'leadership-management': { distribution: peaked(1) },
  });
  const places = [...brief.mastered, ...brief.learnable, ...brief.blocked];
  assert.ok(places.length > 0);
  assert.equal(places.every((item) => !item.mark), true);
  const html = renderFrontierPage({ ...brief, readinessHref: '/report/readiness' });
  assert.equal(html.includes('Dominado'), true);
  assert.equal(html.includes('Pode aprender agora'), true);
  assert.equal(html.includes('Ainda bloqueado'), true);
  assert.doesNotMatch(html, /frontier-ladder/);
});

test('place sem mark com irmãos marcados fica em frontier-unplaced', () => {
  assert.equal(typeof projectFrontierLadder, 'function', 'projectFrontierLadder deve existir no domínio');
  const brief = briefWith({
    mastered: [place({ leafId: 'release-feedback', label: 'Feedback de release', mark: 'F3' })],
    learnable: [place({ leafId: 'continuous-integration', label: 'Integração contínua' })],
    start: { step: 'Integração contínua', unlocks: 'Confiar', leafId: 'continuous-integration' },
  });
  const ladder = projectFrontierLadder!(brief);
  assert.ok(ladder.unplaced.some((item) => item.leafId === 'continuous-integration'));
  assert.equal(ladder.rungs.some((rung) => rung.places.some((item) => item.leafId === 'continuous-integration')), false);
  const html = renderFrontierPage({ ...brief, readinessHref: '/report/readiness' });
  assert.match(html, /class="[^"]*\bfrontier-unplaced\b|class="[^"]*\breport-gap\b[^"]*"[^>]*>[\s\S]*Integração/);
  assert.doesNotMatch(html, /Integração contínua[^<]*F0|data-phase="0"[\s\S]*Integração contínua[\s\S]*F0/);
});

test('parallel vira frontier-human-conditions no rung 0; Comece por, aside e link permanecem', () => {
  const brief = briefWith({
    mastered: [place({ leafId: 'release-feedback', label: 'Feedback de release', mark: 'F2' })],
    parallel: [{ label: 'Voz <em>segura</em>', body: 'Contar o erro sem medo' }],
    start: { step: 'Feedback de release', unlocks: 'Confiar no pipeline', leafId: 'release-feedback', mark: 'F2' },
    advancedAside: 'Práticas avançadas a dois passos não são o próximo passo.',
  });
  const html = renderFrontierPage({ ...brief, readinessHref: '/report/readiness' });
  assert.match(html, /class="[^"]*\bfrontier-human-conditions\b/);
  assert.doesNotMatch(html, /frontier-human-stack/);
  const rung0 = html.match(/data-phase="0"[\s\S]*?(?=data-phase="1"|$)/)?.[0] ?? '';
  assert.match(rung0.length ? rung0 : html, /frontier-human-conditions/);
  assert.equal(html.includes('<em>segura</em>'), false);
  assert.equal(html.includes('◆'), false);
  assert.match(html, /Comece por/);
  assert.equal(html.includes(brief.advancedAside), true);
  assert.match(html, /Ver prontidão/);
  assert.match(html, /href="\/report\/readiness"/);
});

test('gap / brief vazio: report-gap; anti-Orbital/13%/24%', () => {
  const empty = briefWith({});
  const html = renderFrontierPage({ ...empty, readinessHref: '/report/readiness', gap: 'Lacuna de publicação da fronteira.' });
  assert.match(html, /class="[^"]*\breport-gap\b/);
  assert.equal(html.includes('Orbital'), false);
  assert.equal(html.includes('13%'), false);
  assert.equal(html.includes('24%'), false);
});

test('mark não nasce de level/cargo', () => {
  const brief = projectFrontierBrief({
    'continuous-integration': { level: 4, coverage: 1 },
    'release-feedback': { level: 4, coverage: 1 },
  });
  const places = [...brief.mastered, ...brief.learnable, ...brief.blocked];
  assert.equal(places.length, 0);
  const html = renderFrontierPage({ ...brief, readinessHref: '/report/readiness' });
  for (const token of ['F0', 'F1', 'F2', 'F3', 'F4', 'F5'] as const) {
    assert.equal(html.includes(token), false);
  }
  assert.doesNotMatch(html, /frontier-ladder/);
});

const markedBriefHtml = (): string => {
  const brief = briefWith({
    mastered: [place({ leafId: 'release-feedback', label: 'Feedback de release', mark: 'F3' })],
    start: { step: 'Feedback de release', unlocks: 'Confiar no pipeline', leafId: 'release-feedback', mark: 'F3' },
    advancedAside: 'Práticas avançadas a dois passos não são o próximo passo.',
  });
  return renderFrontierPage({ ...brief, readinessHref: '/report/readiness' });
};

test('assert 9: modo escada renderiza frontier-legend e anti Orbital/13%/24%', () => {
  const html = markedBriefHtml();
  assert.match(html, /class="[^"]*\bfrontier-legend\b/);
  assert.match(html, /dominado/i);
  assert.match(html, /na fronteira/i);
  assert.match(html, /bloqueado/i);
  assert.equal(html.includes('Orbital'), false);
  assert.equal(html.includes('13%'), false);
  assert.equal(html.includes('24%'), false);
});

test('assert 10: modo escada renderiza frontier-start-grid com Comece por / Em paralelo / Ainda não', () => {
  const html = markedBriefHtml();
  assert.match(html, /class="[^"]*\bfrontier-start-grid\b/);
  assert.match(html, /Comece por/);
  assert.match(html, /Em paralelo/);
  assert.match(html, /Ainda não/);
});

test('assert 11: CSS .frontier-ladder inclui column-reverse via layout()', () => {
  const served = layout('Fronteira', markedBriefHtml());
  const ladderRule = [...served.matchAll(/\.frontier-ladder\s*\{([^}]+)\}/g)][0]?.[1]?.replace(/\s+/g, ' ') ?? '';
  assert.match(ladderRule, /column-reverse/);
});
