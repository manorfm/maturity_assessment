import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApp } from '../src/app/create-app.js';
import { createDatabase } from '../src/shared/database.js';
import { projectAreaWalkthrough } from '../src/modules/inference/domain/area-walkthrough.js';
import {
  projectAudienceReadings,
  projectCatalogReadiness,
  projectDiagnosticLaudo,
  projectTreatmentPlan,
} from '../src/modules/inference/domain/diagnostic-report.js';
import {
  leafStageDistribution,
  projectFichaClose,
  projectHowItIs,
  projectNodeDefinition,
  projectPreserve,
  projectReportedReadings,
} from '../src/modules/inference/domain/ficha-node.js';
import { frontierLeaves, projectFrontierBrief } from '../src/modules/inference/domain/learning-frontier.js';
import { projectHistoryComparison } from '../src/modules/inference/domain/reading-history.js';
import { runOrganizationalSynthetic } from '../src/modules/inference/domain/organizational-synthetic.js';
import { OrganizationalAreaProjector, projectFichaTrail } from '../src/modules/inference/domain/organizational-areas.js';
import { InferenceService } from '../src/modules/inference/inference-service.js';
import { ProjectService } from '../src/modules/projects/project-service.js';
import {
  renderAudiencePage,
  renderFrontierPage,
  renderHistoryPage,
  renderMapPage,
  renderNodeCard,
  renderReadinessPage,
  renderTreatmentPage,
  renderWalkthrough,
} from '../src/modules/projects/diagnostic-report-view.js';
import {
  renderCapabilityRadar,
  renderFirstScreen,
} from '../src/modules/projects/project-routes.js';
import type { StageDistribution } from '../src/modules/measurement/domain/measurement-params.js';
import type { SophisticationDistribution } from '../src/modules/inference/domain/sophistication-matrix.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';
import type { IndexPublication } from '../src/modules/inference/domain/stage-posterior.js';

const peaked = (stage: 0 | 1 | 2 | 3 | 4): StageDistribution => (
  [0, 1, 2, 3, 4].map((item) => (item === stage ? 1 : 0)) as unknown as StageDistribution
);
const phasePeaked = (phase: 0 | 1 | 2 | 3 | 4 | 5): SophisticationDistribution => (
  [0, 1, 2, 3, 4, 5].map((item) => (item === phase ? 1 : 0)) as unknown as SophisticationDistribution
);

const finding: OutcomeFinding = {
  kind: 'correction',
  pattern: 'integracao-tardia',
  detailCapability: 'continuous-integration',
  title: 'Integrar o trabalho no mesmo dia',
  cause: 'Mudanças se encontram tarde',
  intervention: 'Integrar o trabalho no mesmo dia',
  confidence: 0.9,
  priority: 0.8,
  prescription: { status: 'ready', reason: 'ok' },
  experiment: {
    action: 'Integrar o trabalho no mesmo dia',
    owner: 'Time',
    metric: 'espera',
    reviewHorizon: '30 dias',
    successCriterion: 'A espera cai.',
  },
};

const publishedIndex: Extract<IndexPublication, { published: true }> = {
  published: true,
  index: 40,
  band: [30, 50],
  coverage: 0.8,
  distribution: peaked(2),
  leaves: [
    { id: 'continuous-integration', distribution: peaked(2) },
    { id: 'observability-practice', distribution: peaked(1) },
  ],
};

function places(brief: ReturnType<typeof projectFrontierBrief>) {
  return [...brief.mastered, ...brief.learnable, ...brief.blocked];
}

function assertNoForbidden(html: string, page: string) {
  assert.equal(html.includes('de 4'), false, `${page}: fingerprint "de 4"`);
  assert.equal(html.includes('Estimativa ordinal interna'), false, `${page}: fingerprint "Estimativa ordinal interna"`);
  assert.equal(html.includes('modelo m1'), false, `${page}: fingerprint "modelo m1" em projeto m2`);
  assert.equal(
    html.includes('<summary>Leituras por público</summary>'),
    false,
    `${page}: audienceArchive legado no manage`,
  );
  assert.doesNotMatch(
    html,
    /class="classification-level">\s*\d+\s*·/,
    `${page}: .classification-level ordinal no laudo`,
  );
}

test('travessia das nove páginas só encontra número emitido pela publicação da página', async () => {
  const db = createDatabase(':memory:');
  const { created, projectId } = runOrganizationalSynthetic(db, { band: 'medium' });
  new ProjectService(db).setMeasurementModel(projectId, 'm2');
  const inference = new InferenceService(db);
  const live = inference.report(projectId, 5);
  assert.equal(live.measurementModel, 'm2');

  const publishedLeaves = {
    'observability-practice': { distribution: peaked(1), phaseDistribution: phasePeaked(1) },
    'incident-management': { distribution: peaked(3), phaseDistribution: phasePeaked(2) },
    'release-feedback': { distribution: peaked(2), phaseDistribution: phasePeaked(2) },
    'continuous-integration': { distribution: peaked(2) },
    'reliability-practice': { distribution: peaked(1) },
    'organizational-learning': { distribution: peaked(2) },
  };
  const levelOnlyLeaves = {
    'work-management': { level: 4, coverage: 1 },
    'leadership-management': { level: 4, coverage: 1 },
    'sdlc-automation': { level: 4, coverage: 1 },
    'planning-refinement': { level: 4, coverage: 1 },
    'cloud-security': { level: 4, coverage: 1 },
    'platform-autonomy': { level: 4, coverage: 1 },
  };
  const mixedLeaves = { ...publishedLeaves, ...levelOnlyLeaves };

  const map = OrganizationalAreaProjector.project({
    capabilities: [
      { id: 'continuous-integration', label: 'Integração', level: 2, confidence: 0.8, evidence: 4, hasContradiction: false, coverage: 1 },
      { id: 'work-management', label: 'Fluxo', level: 4, confidence: 0.8, evidence: 4, hasContradiction: false, coverage: 1 },
      { id: 'incident-management', label: 'Incidentes', level: 1, confidence: 0.8, evidence: 4, hasContradiction: false, coverage: 1 },
    ],
    findings: [finding],
  });
  const outcome = {
    kind: 'correct' as const,
    kindLabel: 'Precisa de correção',
    limiterLabel: 'Integração',
    reading: finding.title,
    nextStepTitle: finding.title,
    nextStepBody: finding.intervention,
    finding,
  };

  const laudo = projectDiagnosticLaudo({
    outcome,
    findings: [finding],
    organizationalAreas: map,
    index: publishedIndex,
    instrument: 'Instrumento vigente · modelo m2',
  });
  const laudoHtml = renderFirstScreen({
    outcome,
    classification: { level: 2, label: 'Repetível', limitingCapabilities: ['Integração contínua'] },
    organizationalAreas: map,
    findings: [finding],
    scopes: [],
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    index: publishedIndex,
    instrument: 'Instrumento vigente · modelo m2',
    projectName: 'Fixture m2',
  });

  const mapaHtml = renderMapPage({
    map,
    cut: 'cap',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
  });

  const leafDist = leafStageDistribution(publishedIndex, 'continuous-integration');
  const how = projectHowItIs({
    ...(leafDist ? { stageDistribution: leafDist } : {}),
  });
  const radar = renderCapabilityRadar([{
    id: 'continuous-integration',
    label: 'Integração',
    level: 2,
    confidence: 0.8,
    evidence: 4,
    hasContradiction: false,
    assessed: true,
    coverage: 1,
  }], '/capabilities');
  const fichaHtml = renderNodeCard({
    title: 'Integração',
    trail: projectFichaTrail({
      map,
      capabilityId: 'continuous-integration',
      capabilityLabel: 'Integração',
      mapHref: '/report/map',
      areaBase: '/areas',
    }),
    definition: projectNodeDefinition('continuous-integration'),
    how,
    reported: projectReportedReadings({
      capabilityIds: ['continuous-integration'],
      minimum: 5,
      samples: [],
      units: [],
    }),
    detail: `<div class="report-home">${radar}</div>`,
    preserve: projectPreserve('correct'),
    close: projectFichaClose({ nodeId: 'continuous-integration' }),
  });

  const readiness = projectCatalogReadiness(mixedLeaves);
  const prontidaoHtml = renderReadinessPage(readiness);

  const frontierBrief = projectFrontierBrief(frontierLeaves({
    stages: [
      { id: 'continuous-integration', respondents: 6, distribution: peaked(2) },
      { id: 'observability-practice', respondents: 6, distribution: peaked(1) },
      { id: 'incident-management', respondents: 6, distribution: peaked(3) },
      { id: 'release-feedback', respondents: 6, distribution: peaked(2) },
      { id: 'work-management', respondents: 6, distribution: peaked(1) },
      { id: 'leadership-management', respondents: 6, distribution: peaked(1) },
    ],
    phases: new Map([
      ['observability-practice', { distribution: phasePeaked(1), phase: 1 }],
      ['incident-management', { distribution: phasePeaked(2), phase: 2 }],
      ['release-feedback', { distribution: phasePeaked(2), phase: 2 }],
    ]),
  }));
  const levelOnlyFrontier = projectFrontierBrief(levelOnlyLeaves);
  const fronteiraHtml = renderFrontierPage({ ...frontierBrief, readinessHref: '/report/readiness' });

  const plan = projectTreatmentPlan([finding]);
  const planoHtml = renderTreatmentPage(plan);

  const operations = map.systems.find((system) => system.id === 'operations')
    ?? map.systems.find((system) => system.id === 'engineering')!;
  const walk = projectAreaWalkthrough({
    area: operations,
    findings: [finding],
    capabilities: [
      { id: 'continuous-integration', label: 'Integração', level: 2 },
      { id: 'work-management', label: 'Fluxo', level: 4 },
    ],
    organizationalAreas: map,
    outcomeKind: 'correct',
    conducts: [{
      action: finding.experiment!.action,
      owner: finding.experiment!.owner,
      success: finding.experiment!.successCriterion,
      horizon: '0-30',
      authority: 'team',
    }],
    pulse: [],
    leaves: mixedLeaves,
  });
  const walkthroughHtml = renderWalkthrough(walk);

  const history = projectHistoryComparison({
    readings: [
      { id: 'a', label: 'Março', index: 20, band: [10, 30], distribution: peaked(1) },
      { id: 'b', label: 'Outubro', index: 40, band: [30, 50], distribution: peaked(2) },
    ],
  });
  const historicoHtml = renderHistoryPage(history);

  const audiences = projectAudienceReadings({ findings: [finding], map });
  const audienciasHtml = renderAudiencePage(audiences);

  const app = await createApp(db);
  const base = `/projects/${created.publicId}/manage/${created.adminSecret}`;
  const manage = await app.inject({ method: 'GET', url: base });
  assert.equal(manage.statusCode, 200);
  const capabilityId = live.capabilities.find((capability) => (capability.coverage ?? 0) >= 1)?.id
    ?? live.findings[0]?.detailCapability
    ?? 'continuous-integration';
  const fichaRoute = await app.inject({ method: 'GET', url: `${base}/capabilities/${capabilityId}` });
  assert.equal(fichaRoute.statusCode, 200);
  await app.close();

  const pages: Record<string, string> = {
    laudo: laudoHtml,
    mapa: mapaHtml,
    ficha: `${fichaHtml}\n${fichaRoute.body}`,
    prontidao: prontidaoHtml,
    fronteira: fronteiraHtml,
    plano: planoHtml,
    walkthrough: walkthroughHtml,
    historico: historicoHtml,
    audiencias: audienciasHtml,
    manage: manage.body,
  };

  for (const [page, html] of Object.entries(pages)) {
    assertNoForbidden(html, page);
  }

  // Laudo m2: divergências e rodapé não repetem o rótulo m1.
  assert.equal(JSON.stringify(laudo).includes('modelo m1'), false);
  assert.equal(laudo.footer.instrument.includes('m2'), true);

  // Ficha: distribuição publicada sem detail/radar paralelo com ordinal de 4.
  assert.equal(how.stage.published, true);
  assert.match(fichaHtml, /class="stage-distribution"/);
  assert.doesNotMatch(fichaHtml, /de 4|Estimativa ordinal interna|formatMaturityLevel/);
  assert.doesNotMatch(fichaRoute.body, /de 4|Estimativa ordinal interna/);

  // Prontidão: folhas só com level não geram p_k; só entram folhas com distribution.
  const levelOnlyReadiness = projectCatalogReadiness(levelOnlyLeaves);
  assert.ok(levelOnlyReadiness.every((item) => item.gap && !item.assessment));
  assert.equal(/p_k \d/.test(renderReadinessPage(levelOnlyReadiness)), false);
  for (const item of readiness) {
    if (!item.assessment) continue;
    assert.equal(prontidaoHtml.includes(item.conduct!), true);
    for (const row of item.assessment.checklist) {
      assert.equal(prontidaoHtml.includes(`p_k ${row.probability.toFixed(2)}`), true);
    }
  }

  // Fronteira: folhas só com level não inventam faixa/F via peakedDistribution(level).
  assert.equal(places(levelOnlyFrontier).length, 0, 'folha só com level não entra na fronteira');
  for (const token of ['F0', 'F1', 'F2', 'F3', 'F4', 'F5'] as const) {
    assert.equal(
      fronteiraHtml.includes(token),
      places(frontierBrief).some((item) => item.mark === token),
      `marca ${token} só se a publicação da fronteira a emitiu`,
    );
  }

  // Walkthrough: folhas sem distribution não desenham faixa/estágio inventados por level.
  const levelOnlyWalk = projectAreaWalkthrough({
    area: operations,
    findings: [],
    capabilities: [
      { id: 'work-management', label: 'Fluxo', level: 4 },
    ],
    organizationalAreas: map,
    outcomeKind: 'correct',
    conducts: [],
    pulse: [],
    leaves: { 'work-management': { level: 4, coverage: 1 } },
  });
  const levelOnlyWalkHtml = renderWalkthrough(levelOnlyWalk);
  assert.doesNotMatch(levelOnlyWalkHtml, /Adaptativo|estágio 4|Estágio 4/);
  assert.match(levelOnlyWalkHtml, /report-gap|quando o modelo publicar|ainda não/);
});
