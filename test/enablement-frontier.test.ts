import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  enablementCatalog,
  evaluateEnablementEdges,
  learningFrontier,
  projectFrontierBrief,
  projectLearningFrontier,
} from '../src/modules/inference/domain/learning-frontier.js';
import type { StageDistribution } from '../src/modules/measurement/domain/measurement-params.js';
import { projectFrontierPage } from '../src/modules/inference/domain/diagnostic-report.js';
import { renderFrontierPage } from '../src/modules/projects/diagnostic-report-view.js';
import { nextPhaseStage } from '../src/modules/inference/domain/area-walkthrough.js';
import { nextPhaseWithinFrontier } from '../src/modules/inference/domain/learning-frontier.js';

const peaked = (stage: 0 | 1 | 2 | 3 | 4): StageDistribution => {
  const raw = [0, 1, 2, 3, 4].map((s) => (s === stage ? 1 : 0));
  return raw as unknown as StageDistribution;
};

test('catálogo inicial traz as arestas de 23 §3.3', () => {
  assert.ok(enablementCatalog.length >= 10);
  assert.ok(enablementCatalog.some((edge) => edge.fromLeafId === 'observability-practice' && edge.toLeafId === 'incident-management'));
  assert.ok(enablementCatalog.some((edge) => edge.fromLeafId === 'continuous-integration' && edge.toLeafId === 'release-feedback'));
});

test('P(desbloqueado) é o produto das arestas essenciais; bloqueio abaixo de 0,25', () => {
  const leaves = {
    'observability-practice': { distribution: peaked(1) },
    'incident-management': { distribution: peaked(2) },
    'team-ownership': { distribution: peaked(1) },
    'continuous-integration': { distribution: peaked(3) },
    'release-feedback': { distribution: peaked(2) },
    'sustainable-design': { distribution: peaked(2) },
    'quality-strategy': { distribution: peaked(1) },
    'organizational-learning': { distribution: peaked(2) },
    'leadership-management': { distribution: peaked(1) },
    'work-management': { distribution: peaked(1) },
    'reliability-practice': { distribution: peaked(2) },
    'enabling-governance': { distribution: peaked(1) },
    'discovery-validation': { distribution: peaked(2) },
    'product-direction': { distribution: peaked(2) },
    'collaboration': { distribution: peaked(2) },
    'planning-refinement': { distribution: peaked(2) },
  };
  const frontier = projectLearningFrontier(leaves);
  const incidentUnlock = frontier.nodes.find((node) => node.id.includes('incident-management') && node.id.includes('2→3'));
  assert.ok(incidentUnlock);
  assert.equal(incidentUnlock!.band, 'blocked');
  assert.ok(incidentUnlock!.blockedBy.some((item) => /observabilidade|observability/i.test(item)));

  const release = frontier.nodes.find((node) => node.id.includes('release-feedback'));
  assert.ok(release);
  // CI peaked(3) ≥ 3 → P=1, frontier
  assert.equal(release!.band, 'frontier');
  assert.equal(release!.learnable, true);

  const html = renderFrontierPage({ ...projectFrontierBrief(leaves), readinessHref: '/report/readiness' });
  assert.match(html, /pode aprender agora|bloqueado por|Perto/);
  assert.doesNotMatch(html, /ainda não foi elicitado/i);
});

test('próxima fase do walkthrough fica dentro da fronteira', () => {
  const leaves = {
    'observability-practice': { distribution: peaked(1) },
    'incident-management': { distribution: peaked(2) },
  };
  const edges = evaluateEnablementEdges(enablementCatalog, leaves);
  assert.equal(nextPhaseStage(2), 3);
  assert.equal(
    nextPhaseWithinFrontier({ leafId: 'incident-management', current: 2, edges }),
    2,
    'sem desbloqueio, não sobe o degrau',
  );
  const unlocked = evaluateEnablementEdges(enablementCatalog, {
    'observability-practice': { distribution: peaked(3) },
    'incident-management': { distribution: peaked(2) },
  });
  assert.equal(nextPhaseWithinFrontier({ leafId: 'incident-management', current: 2, edges: unlocked }), 3);
});

test('API sem folhas usa o catálogo; sem input explícito de arestas declara lacuna antiga', () => {
  assert.match(projectFrontierPage(undefined).gap ?? '', /ainda não foi elicitado/i);
  const fromLeaves = projectFrontierPage({ leaves: {} });
  assert.equal(fromLeaves.nodes.length, 0, 'sem distribution nas folhas, arestas do catálogo não inventam probabilidade');
  const nodes = learningFrontier(['fundacao', 'pratica'], [
    { from: 'fundacao', to: 'pratica', probability: 0.2, unlocks: 'pratica' },
  ]);
  assert.deepEqual(nodes.find((node) => node.id === 'pratica')?.blockedBy, ['fundacao']);
});
