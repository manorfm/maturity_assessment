import assert from 'node:assert/strict';
import { test } from 'node:test';
import { frontierLeaves, projectFrontierBrief } from '../src/modules/inference/domain/learning-frontier.js';
import { renderFrontierPage } from '../src/modules/projects/diagnostic-report-view.js';
import type { StageDistribution } from '../src/modules/measurement/domain/measurement-params.js';
import type { SophisticationDistribution } from '../src/modules/inference/domain/sophistication-matrix.js';

const peaked = (stage: 0 | 1 | 2 | 3 | 4): StageDistribution => (
  [0, 1, 2, 3, 4].map((item) => (item === stage ? 1 : 0)) as unknown as StageDistribution
);
const phasePeaked = (phase: 0 | 1 | 2 | 3 | 4 | 5): SophisticationDistribution => (
  [0, 1, 2, 3, 4, 5].map((item) => (item === phase ? 1 : 0)) as unknown as SophisticationDistribution
);
const marks = ['F0', 'F1', 'F2', 'F3', 'F4', 'F5'] as const;

const places = (brief: ReturnType<typeof projectFrontierBrief>) => (
  [...brief.mastered, ...brief.learnable, ...brief.blocked]
);

test('fronteira marca F0–F5 só quando a folha tem posterior de sofisticação', () => {
  const brief = projectFrontierBrief({
    'observability-practice': { distribution: peaked(1) },
    'incident-management': { distribution: peaked(2) },
    'continuous-integration': { distribution: peaked(3) },
    'release-feedback': {
      distribution: peaked(3),
      phaseDistribution: phasePeaked(2),
      phase: 5,
    },
    'work-management': { distribution: peaked(1) },
    'leadership-management': { distribution: peaked(1) },
  });
  const marked = places(brief).filter((item) => item.leafId === 'release-feedback');
  assert.ok(marked.length > 0);
  for (const item of marked) assert.equal(item.mark, 'F2');
  const html = renderFrontierPage({ ...brief, readinessHref: '/report/readiness' });
  const published = new Set(places(brief).flatMap((item) => (item.mark ? [item.mark] : [])));
  for (const token of marks) {
    assert.equal(html.includes(token), published.has(token));
  }
  assert.equal(html.includes('Dominado'), true);
  assert.equal(html.includes('Pode aprender agora'), true);
  assert.equal(html.includes('Ainda bloqueado'), true);
  assert.equal(html.includes('13%'), false);
  assert.equal(html.includes('Orbital'), false);

  const levelOnly = projectFrontierBrief({
    'continuous-integration': { level: 4, coverage: 1 },
    'release-feedback': { level: 4, coverage: 1 },
  });
  assert.equal(places(levelOnly).length, 0, 'nível sem distribution não entra na fronteira');
  const plain = renderFrontierPage({ ...levelOnly, readinessHref: '/report/readiness' });
  for (const token of marks) assert.equal(plain.includes(token), false);
  assert.equal(plain.includes('Dominado'), true);
  assert.equal(plain.includes('Pode aprender agora'), true);
  assert.equal(plain.includes('Ainda bloqueado'), true);
  assert.equal(plain.includes('13%'), false);
  assert.equal(plain.includes('Orbital'), false);
});

test('a folha da fronteira recebe a posterior publicada e o nível 4 não vira F4', () => {
  const leaves = frontierLeaves({
    stages: [
      { id: 'release-feedback', respondents: 6, distribution: peaked(3) },
      { id: 'continuous-integration', respondents: 6, distribution: peaked(3) },
    ],
    phases: new Map([
      ['release-feedback', { distribution: phasePeaked(2), phase: 2 }],
      ['incident-management', { distribution: phasePeaked(0), phase: 0 }],
    ]),
  });
  assert.equal(leaves['continuous-integration']?.phaseDistribution, undefined);
  assert.equal(leaves['continuous-integration']?.distribution?.[3], 1);
  assert.equal(leaves['release-feedback']?.distribution?.[3], 1);
  assert.equal(leaves['release-feedback']?.phaseDistribution?.[2], 1);
  assert.equal(leaves['incident-management']?.distribution, undefined);
  assert.equal(leaves['incident-management']?.phaseDistribution?.[0], 1);
  const brief = projectFrontierBrief(leaves);
  const rows = places(brief);
  assert.ok(rows.some((item) => item.leafId === 'release-feedback'));
  assert.ok(rows.filter((item) => item.leafId === 'release-feedback').every((item) => item.mark === 'F2'));
  assert.ok(rows.filter((item) => item.leafId === 'continuous-integration').every((item) => item.mark === undefined));
  assert.equal(rows.some((item) => item.leafId === 'incident-management'), false, 'fase sem distribution de estágio não inventa faixa');
  const html = renderFrontierPage({ ...brief, readinessHref: '/report/readiness' });
  assert.equal(html.includes('F2'), true);
  assert.equal(html.includes('F4'), false);
  assert.equal(html.includes('Dominado'), true);
  assert.equal(html.includes('Pode aprender agora'), true);
  assert.equal(html.includes('Ainda bloqueado'), true);
});
