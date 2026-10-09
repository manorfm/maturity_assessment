import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assessReadiness, chaosEngineeringExample } from '../src/modules/inference/domain/advanced-readiness.js';
import { projectDiagnosticLaudo, projectHistoryPage, projectReadinessPage } from '../src/modules/inference/domain/diagnostic-report.js';
import { learningFrontier } from '../src/modules/inference/domain/learning-frontier.js';
import { inferNoisyOr, referenceWaitCauses, referenceWaitSymptoms } from '../src/modules/inference/domain/noisy-or.js';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import { compareReadings } from '../src/modules/inference/domain/reading-history.js';
import { observeStage, publishIndex } from '../src/modules/inference/domain/stage-posterior.js';
import { classifyCynefin, classifyEvidenceGrade } from '../src/modules/inference/domain/treatment-contract.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';

test('noisy-OR reproduz o exemplo de espera do documento 05', () => {
  const onlyWait = inferNoisyOr(referenceWaitCauses, referenceWaitSymptoms, { 'pr-espera': { present: 6, total: 10 } });
  assert.deepEqual(onlyWait, { 'feedback-lento': 0.57, 'aprovacao-externa': 0.47, 'fronteira-de-times': 0.26 });
  const withApproval = inferNoisyOr(referenceWaitCauses, referenceWaitSymptoms, {
    'pr-espera': { present: 6, total: 10 },
    'aprovacao-necessaria': { present: 7, total: 10 },
  });
  assert.deepEqual(withApproval, { 'feedback-lento': 0.45, 'aprovacao-externa': 0.88, 'fronteira-de-times': 0.26 });
  const withConflict = inferNoisyOr(referenceWaitCauses, referenceWaitSymptoms, {
    'pr-espera': { present: 6, total: 10 },
    'aprovacao-necessaria': { present: 7, total: 10 },
    'conflito-mesmo-servico': { present: 1, total: 10 },
  });
  assert.deepEqual(withConflict, { 'feedback-lento': 0.45, 'aprovacao-externa': 0.90, 'fronteira-de-times': 0.11 });
});

test('prontidão de chaos engineering segue 0,01, 0,08 e 0,37', () => {
  assert.equal(assessReadiness({ prerequisites: chaosEngineeringExample }).probability, 0.01);
  assert.equal(assessReadiness({ prerequisites: chaosEngineeringExample }).band, 'not-ready');
  const afterTwo = chaosEngineeringExample.map((item) => (
    item.id === 'observability' ? { ...item, probability: 0.8 }
      : item.id === 'steady-state' ? { ...item, probability: 0.75 }
        : item
  ));
  assert.equal(assessReadiness({ prerequisites: afterTwo }).probability, 0.08);
  const afterFour = [
    { ...chaosEngineeringExample[0]!, probability: 0.8 },
    { ...chaosEngineeringExample[1]!, probability: 0.75 },
    { ...chaosEngineeringExample[2]!, probability: 0.9 },
    { ...chaosEngineeringExample[3]!, probability: 0.85 },
    { ...chaosEngineeringExample[4]!, probability: 0.8 },
  ];
  const later = assessReadiness({ prerequisites: afterFour });
  assert.equal(later.probability, 0.37);
  assert.equal(later.band, 'near');
  assert.equal(assessReadiness({ prerequisites: chaosEngineeringExample, technicalPhase: 3 }).premature, true);
});

test('fronteira marca bloqueio abaixo de 0,25 e histórico não publica sobreposição', () => {
  const nodes = learningFrontier(['fundacao', 'pratica'], [
    { from: 'fundacao', to: 'pratica', probability: 0.2, unlocks: 'pratica' },
  ]);
  assert.deepEqual(nodes.find((node) => node.id === 'pratica')?.blockedBy, ['fundacao']);
  assert.equal(compareReadings(
    { id: 'a', label: 'antes', index: 24, band: [18, 31] },
    { id: 'b', label: 'depois', index: 27, band: [20, 34] },
  ), 'uncertain');
  assert.equal(compareReadings(
    { id: 'a', label: 'antes', index: 24, band: [18, 31] },
    { id: 'b', label: 'depois', index: 40, band: [34, 48] },
  ), 'improved');
});

test('laudo não inventa índice nem motivo e limita achados a três', () => {
  const finding = (pattern: string, title: string): OutcomeFinding => ({
    kind: 'correction', pattern, detailCapability: 'work-management', title, cause: 'espera', intervention: 'reduzir espera',
    confidence: 0.91, priority: 0.8, missingEvidence: 'falta telemetria',
    experiment: { action: 'aprovar por risco', owner: 'Plataforma', metric: 'espera', reviewHorizon: '30 dias', successCriterion: 'espera cai' },
  });
  const map = OrganizationalAreaProjector.empty();
  const laudo = projectDiagnosticLaudo({
    outcome: { kind: 'correct', kindLabel: 'Precisa de correção', limiterLabel: 'Aprovação', reading: 'espera', nextStepTitle: '', nextStepBody: '', finding: finding('a', 'Um') },
    findings: [finding('a', 'Um'), finding('b', 'Dois'), finding('c', 'Três'), finding('d', 'Quatro')],
    organizationalAreas: map,
    sample: { completed: 18, units: [{ path: 'Org/Gama', completed: 9 }, { path: 'Org/Delta', completed: 9 }] },
  });
  assert.equal(laudo.findings.length, 3);
  assert.deepEqual(laudo.otherFindings, ['Quatro']);
  assert.equal('gap' in laudo.reading, true);
  assert.match(laudo.complaint.gap, /motivo da avaliação/);
  assert.match(laudo.footer.sample, /18 pessoas em 2 unidades/);
  assert.match(laudo.footer.sample, /Gama \(9\)/);
  assert.equal(laudo.conduct[0]?.cynefin, classifyCynefin({}));
  assert.equal(projectReadinessPage([{ id: 'chaos-engineering', label: 'Chaos engineering' }])[0]?.gap?.length, laudo ? projectReadinessPage([{ id: 'chaos-engineering', label: 'Chaos engineering' }])[0]?.gap?.length : 0);
  assert.equal(projectHistoryPage({}).gap?.includes('duas leituras'), true);
});

test('índice só publica com amostra, testlets e faixa estreita', () => {
  const posterior = observeStage([
    { anchor: 1, options: [0, 1, 2, 3, 4], discrimination: 1, perspectiveReliability: 1, severity: 0 },
    { anchor: 1, options: [0, 1, 2, 3, 4], discrimination: 1, perspectiveReliability: 1, severity: 0 },
  ]);
  assert.ok(posterior.index >= 0 && posterior.index <= 100);
  assert.equal(publishIndex({ respondents: 4, testlets: 2, perspectives: 2, posterior, coverage: 0.6 }).published, false);
  const wide = { ...posterior, band: [0, 100] as [number, number] };
  assert.equal(publishIndex({ respondents: 8, testlets: 2, perspectives: 2, posterior: wide, coverage: 0.6 }).published, false);
});

test('laudo preenche leitura geral só com IndexPublication publicada', () => {
  const finding: OutcomeFinding = {
    kind: 'correction', pattern: 'espera', detailCapability: 'work-management', title: 'Espera',
    cause: 'fila', intervention: 'limitar WIP', confidence: 0.9, priority: 0.8,
    foundation: { source: 'Accelerate / DORA', principle: 'fluxo', why: 'espera é custo' },
  };
  const posterior = observeStage([
    { anchor: 1, options: [0, 1, 2, 3, 4], discrimination: 1, perspectiveReliability: 1, severity: 0 },
    { anchor: 1, options: [0, 1, 2, 3, 4], discrimination: 1, perspectiveReliability: 1, severity: 0 },
    { anchor: 2, options: [0, 1, 2, 3, 4], discrimination: 1, perspectiveReliability: 1, severity: 0 },
    { anchor: 1, options: [0, 1, 2, 3, 4], discrimination: 1, perspectiveReliability: 1, severity: 0 },
  ]);
  const index = publishIndex({ respondents: 8, testlets: 2, perspectives: 2, posterior, coverage: 0.7, target: 45 });
  assert.equal(index.published, true);
  const map = OrganizationalAreaProjector.empty();
  const outcome = {
    kind: 'correct' as const, kindLabel: 'Precisa de correção', limiterLabel: 'Fluxo',
    reading: 'espera', nextStepTitle: '', nextStepBody: '', finding,
  };
  const laudo = projectDiagnosticLaudo({ outcome, findings: [finding], organizationalAreas: map, index });
  assert.equal('gap' in laudo.reading, false);
  if (!('gap' in laudo.reading)) {
    assert.equal(laudo.reading.index, index.published ? index.index : -1);
    assert.equal(laudo.reading.coverage, 0.7);
    assert.equal(laudo.reading.target, 45);
  }
  const blocked = projectDiagnosticLaudo({
    outcome, findings: [finding], organizationalAreas: map,
    index: { published: false, reason: 'Menos de 5 respondentes neste recorte.' },
  });
  assert.equal('gap' in blocked.reading, true);
  assert.match('gap' in blocked.reading ? blocked.reading.gap : '', /Menos de 5/);
});

test('conduta recebe grau de evidência A–D pela base da prática, não pela amostra local', () => {
  const withDora: OutcomeFinding = {
    kind: 'correction', pattern: 'caminho-de-versao-sem-origem', detailCapability: 'release-feedback',
    title: 'Sem origem', cause: 'cópia', intervention: 'origem única', confidence: 0.9, priority: 0.8,
    foundation: { source: 'Continuous Delivery / SLSA', principle: 'mesmo artefato', why: 'proveniência' },
    prescription: { status: 'ready', reason: 'ok' },
  };
  const bare: OutcomeFinding = {
    kind: 'correction', pattern: 'hipotese-local', detailCapability: 'work-management',
    title: 'Hipótese', cause: 'desconhecido', intervention: 'experimentar', confidence: 0.6, priority: 0.5,
  };
  const map = OrganizationalAreaProjector.empty();
  const laudo = projectDiagnosticLaudo({
    outcome: {
      kind: 'correct', kindLabel: 'Precisa de correção', limiterLabel: 'Entrega',
      reading: '', nextStepTitle: '', nextStepBody: '', finding: withDora,
    },
    findings: [withDora, bare],
    organizationalAreas: map,
  });
  assert.equal(laudo.conduct[0]?.evidenceGrade, 'B');
  assert.equal(laudo.conduct[1]?.evidenceGrade, 'D');
  assert.equal(classifyEvidenceGrade({ foundationSource: 'Accelerate / DORA', replicated: true }), 'A');
  assert.equal(classifyEvidenceGrade({ foundationSource: 'consenso de prática' }), 'C');
});
