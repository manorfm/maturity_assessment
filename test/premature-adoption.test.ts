import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  detectPrematureAdoptions,
  technicalPhaseFor,
} from '../src/modules/inference/domain/advanced-readiness.js';
import { advancedPracticeCatalog } from '../src/modules/inference/domain/advanced-readiness.js';
import type { StageDistribution } from '../src/modules/measurement/domain/measurement-params.js';
import type { SophisticationDistribution } from '../src/modules/inference/domain/sophistication-matrix.js';
import { projectDiagnosticLaudo } from '../src/modules/inference/domain/diagnostic-report.js';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';
import { renderLaudo } from '../src/modules/projects/diagnostic-report-view.js';

const peaked = (stage: 0 | 1 | 2 | 3 | 4): StageDistribution => (
  [0, 1, 2, 3, 4].map((s) => (s === stage ? 1 : 0)) as unknown as StageDistribution
);
const phasePeaked = (phase: 0 | 1 | 2 | 3 | 4 | 5): SophisticationDistribution => (
  [0, 1, 2, 3, 4, 5].map((p) => (p === phase ? 1 : 0)) as unknown as SophisticationDistribution
);

const weakChaosLeaves = {
  'observability-practice': { distribution: peaked(1), phaseDistribution: phasePeaked(4) },
  'reliability-practice': { distribution: peaked(1) },
  'incident-management': { distribution: peaked(1), phaseDistribution: phasePeaked(2) },
  'release-feedback': { distribution: peaked(1), phaseDistribution: phasePeaked(3) },
  'organizational-learning': { distribution: peaked(1) },
};

test('detecta adoção prematura quando F ≥ 3 e essencial tem p_k < 0,3', () => {
  const practice = advancedPracticeCatalog.find((item) => item.id === 'chaos-engineering')!;
  assert.ok((technicalPhaseFor(practice, weakChaosLeaves) ?? 0) >= 3);
  const findings = detectPrematureAdoptions(weakChaosLeaves);
  const chaos = findings.find((item) => item.practiceId === 'chaos-engineering');
  assert.ok(chaos);
  assert.match(chaos!.title, /Adoção prematura/i);
  assert.match(chaos!.action, /reduzir o escopo/i);
  assert.ok(chaos!.weakEssentials.length >= 1);
});

test('laudo publica adoção prematura como achado de risco com conduta', () => {
  const finding = (pattern: string, title: string): OutcomeFinding => ({
    kind: 'correction', pattern, detailCapability: 'work-management', title, cause: 'espera', intervention: 'reduzir espera',
    confidence: 0.91, priority: 0.8,
    experiment: { action: 'aprovar por risco', owner: 'Plataforma', metric: 'espera', reviewHorizon: '30 dias', successCriterion: 'espera cai' },
  });
  const laudo = projectDiagnosticLaudo({
    outcome: {
      kind: 'correct', kindLabel: 'Precisa de correção', limiterLabel: 'Aprovação', reading: 'espera',
      nextStepTitle: '', nextStepBody: '', finding: finding('a', 'Espera'),
    },
    findings: [finding('a', 'Espera'), finding('b', 'Fila')],
    organizationalAreas: OrganizationalAreaProjector.empty(),
    leaves: weakChaosLeaves,
  });
  assert.ok(laudo.findings.some((item) => /Adoção prematura/i.test(item.title)));
  assert.ok(laudo.conduct.some((item) => /reduzir o escopo/i.test(item.action)));
  assert.ok(laudo.findings.length <= 3);
  const html = renderLaudo(laudo, { capabilityBase: '/c', reportBase: '/r' });
  assert.match(html, /Adoção prematura/i);
});
