import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import { advancedPracticeCatalog, bottleneckStatus } from '../src/modules/inference/domain/advanced-readiness.js';
import { leavesForReadinessPage, projectCatalogReadiness } from '../src/modules/inference/domain/diagnostic-report.js';
import { InferenceService } from '../src/modules/inference/inference-service.js';
import { runOrganizationalSynthetic } from '../src/modules/inference/domain/organizational-synthetic.js';
import { renderReadinessPage } from '../src/modules/projects/diagnostic-report-view.js';
import type { StageDistribution } from '../src/modules/measurement/domain/measurement-params.js';
import type { SophisticationDistribution } from '../src/modules/inference/domain/sophistication-matrix.js';

const peaked = (stage: 0 | 1 | 2 | 3 | 4): StageDistribution => (
  [0, 1, 2, 3, 4].map((item) => (item === stage ? 1 : 0)) as unknown as StageDistribution
);
const phasePeaked = (phase: 0 | 1 | 2 | 3 | 4 | 5): SophisticationDistribution => (
  [0, 1, 2, 3, 4, 5].map((item) => (item === phase ? 1 : 0)) as unknown as SophisticationDistribution
);

test('a legenda segue o essencial mais fraco e a conduta continua no cartão não pronto', () => {
  const conduct = 'Para Chaos engineering: próximo degrau é Observabilidade (gargalo · p_k 0.12); um degrau por vez até a prática.';
  const html = renderReadinessPage([{
    id: 'chaos-engineering',
    label: 'Chaos engineering',
    assessment: {
      probability: 0.1,
      comfort: 0.1,
      band: 'not-ready',
      premature: false,
      missing: ['Observabilidade'],
      checklist: [
        { id: 'obs', label: 'Observabilidade', essential: true, probability: 0.12 },
        { id: 'slo', label: 'Estado estável', essential: true, probability: 0.8 },
      ],
    },
    conduct,
  }]);
  assert.equal(html.includes('Não pronto'), true);
  assert.equal(html.includes(conduct), true);
  assert.equal(html.includes('sem conduta'), false);
  assert.equal(html.includes('um pré-requisito faltando'), false);
  assert.equal(html.includes('não é índice da organização'), true);
  assert.equal(html.includes('essencial mais fraco'), true);
  assert.equal(html.includes('linha à parte'), true);
});

test('prática com posterior publica p_k, o mais fraco e a conduta; nível sem posterior fica lacuna', () => {
  const page = projectCatalogReadiness({
    'observability-practice': { distribution: peaked(1), phaseDistribution: phasePeaked(1) },
    'reliability-practice': { distribution: peaked(1) },
    'incident-management': { distribution: peaked(3), phaseDistribution: phasePeaked(2) },
    'release-feedback': { distribution: peaked(2), phaseDistribution: phasePeaked(2) },
    'organizational-learning': { distribution: peaked(2) },
  });
  const chaos = page.find((item) => item.id === 'chaos-engineering');
  assert.ok(chaos?.assessment, 'a publicação deveria trazer a leitura de chaos engineering');
  assert.equal(chaos.weakest, bottleneckStatus(chaos.assessment).bottleneck);
  assert.match(chaos.conduct ?? '', /gargalo|próximo degrau/);
  assert.match(chaos.conduct ?? '', new RegExp(chaos.weakest));
  const html = renderReadinessPage(page);
  assert.equal(html.includes(chaos.weakest), true);
  assert.equal(html.includes(chaos.conduct!), true);
  for (const row of chaos.assessment.checklist) {
    assert.equal(html.includes(`p_k ${row.probability.toFixed(2)}`), true);
  }
  assert.equal(html.includes('não é índice da organização'), true);
  assert.equal(html.includes('Orbital'), false);
  assert.equal(html.includes('13%'), false);
  assert.equal(html.includes('45%'), false);
  assert.equal(html.includes('p_k 0.35'), false);

  const levelOnly = projectCatalogReadiness({
    'sdlc-automation': { level: 4, coverage: 1 },
    'continuous-integration': { level: 4, coverage: 1 },
    'planning-refinement': { level: 4, coverage: 1 },
    'cloud-security': { level: 4, coverage: 1 },
    'platform-autonomy': { level: 4, coverage: 1 },
    'observability-practice': { level: 4, coverage: 1 },
  });
  const ai = levelOnly.find((item) => item.id === 'ai-dlc');
  assert.equal(ai?.assessment, undefined);
  assert.match(ai?.gap ?? '', /posterior|lacuna|não vira índice/i);
  assert.ok(levelOnly.every((item) => item.gap && !item.assessment));
  const gapHtml = renderReadinessPage(levelOnly);
  assert.equal(gapHtml.includes('class="readiness-card"'), false);
  assert.equal(gapHtml.includes('readiness-checklist'), false);
  assert.equal(/p_k \d/.test(gapHtml), false);
  assert.equal(gapHtml.includes('P(pronto)'), false);
  assert.equal(gapHtml.includes('13%'), false);
  assert.equal(gapHtml.includes('45%'), false);
  assert.equal(gapHtml.includes('Orbital'), false);
  assert.equal(advancedPracticeCatalog.length, 13);
});

test('showcase maduro e menos maduro publicam conjuntos diferentes de práticas prontas ou perto', () => {
  const low = publishShowcaseReadiness('low');
  const high = publishShowcaseReadiness('high');
  const readyNear = (page: ReturnType<typeof projectCatalogReadiness>) => page
    .filter((item) => item.assessment && (item.assessment.band === 'ready' || item.assessment.band === 'near'))
    .map((item) => item.id)
    .sort();
  assert.notDeepEqual(readyNear(low), readyNear(high));
  const lowHtml = renderReadinessPage(low);
  const highHtml = renderReadinessPage(high);
  assert.notEqual(lowHtml, highHtml);
  for (const page of [low, high]) {
    const html = renderReadinessPage(page);
    assert.equal(html.includes('não é índice da organização'), true);
    assert.equal(html.includes('Orbital'), false);
    assert.equal(html.includes('13%'), false);
    assert.equal(html.includes('45%'), false);
    for (const item of page) {
      if (item.assessment) {
        assert.equal(typeof item.weakest, 'string');
        assert.equal(html.includes(item.weakest!), true);
        assert.equal(typeof item.conduct, 'string');
        assert.equal(html.includes(item.conduct!), true);
        continue;
      }
      assert.match(item.gap ?? '', /posterior/);
      assert.equal(item.weakest, undefined);
      assert.equal(item.conduct, undefined);
    }
  }
  assert.equal(lowHtml.includes('class="readiness-card"') || highHtml.includes('class="readiness-card"'), true);
});

function publishShowcaseReadiness(band: 'low' | 'high') {
  const db = createDatabase(':memory:');
  const { projectId } = runOrganizationalSynthetic(db, { band });
  const inference = new InferenceService(db);
  return projectCatalogReadiness(leavesForReadinessPage({
    stages: inference.projectLeafStages(projectId),
    phases: inference.projectSophisticationByLeaf(projectId),
    practicePhases: inference.projectAdvancedPracticePhases(projectId),
  }));
}
