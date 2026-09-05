import assert from 'node:assert/strict';
import { test } from 'node:test';
import { projectFindingNarrative } from '../src/modules/inference/domain/finding-narrative.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';

const finding: OutcomeFinding = {
  kind: 'correction', pattern: 'causa-ferramental-feedback', detailCapability: 'sdlc-automation',
  title: 'O retorno técnico chega depois da decisão', cause: 'A verificação é lenta e instável.', intervention: 'Estabilize a verificação crítica.', confidence: .8, priority: .8,
  impacts: ['delivery-speed', 'quality'], mechanism: 'tooling', containment: 'shared-service', decisionAuthority: 'platform',
  missingEvidence: 'Confirmar qual verificação muda a decisão.', prescription: { status: 'ready', reason: 'Mecanismo discriminado.' }, severity: 'moderate',
  recommendationEvidence: { supportingParticipants: 4, applicablePopulation: 6, contradictingParticipants: 1, unclassifiedParticipants: 1, patterns: ['feedback-lento'], layers: ['practice', 'outcome'], profiles: ['engineering'], strength: { convergence: 'medium', populationBreadth: 'medium', perspectiveDiversity: 'low', causalCoverage: 'medium', executiveStatus: 'directional' } },
  solutionReadiness: { stage: 'local', label: 'Local', explanation: 'O time já estabilizou outra verificação.', evidence: 2 },
  experiment: { action: 'Estabilizar uma verificação.', owner: 'Plataforma com engenharia', metric: 'Tempo até retorno.', reviewHorizon: 'na próxima mudança', successCriterion: 'Retorno usado no mesmo dia.' },
  causalAnalysis: { knowledgeVersion: 'causal-catalog-v3', hypothesis: 'A verificação é lenta.', alternatives: ['A política exige lote.'], evidenceFor: ['Retorno lento'], evidenceAgainst: ['Outro caminho é estável'], missingEvidence: 'Confirmar o caminho crítico.', limitations: 'Não remove política.' },
  technicalDirection: {
    library: 'delivery-feedback', practiceTarget: 'Feedback no tempo da decisão', techniques: ['Caminho rápido'], enablingMechanism: 'Retorno acionável.', toolFamilies: ['integração e build'], prerequisites: ['Caminho crítico conhecido'], doesNotSolve: 'Não remove política.', qualitativeCost: 'medium', risk: 'Reduzir cobertura.', smallestExperiment: 'Estabilizar uma verificação.', indicator: 'Tempo até retorno.', successCriterion: 'Uso no mesmo dia.', foundation: { source: 'Continuous Delivery', principle: 'Feedback rápido', versionOrDate: '2010', limitation: 'Não define o risco.' },
  },
};

test('narrativa ordena problema, causa, decisão, impacto, recorte, experimento, evidência, contenção, força, técnica e método', () => {
  const narrative = projectFindingNarrative(finding);
  assert.deepEqual(narrative.sections.map((section) => section.id), [
    'observation', 'mechanism', 'decision', 'importance', 'capability', 'experiment', 'evidence', 'containment', 'existing-strength', 'technical-options', 'methodology',
  ]);
  assert.match(narrative.sections.find((section) => section.id === 'observation')!.body, /retorno técnico/i);
  assert.match(narrative.sections.find((section) => section.id === 'importance')!.body, /velocidade de entrega.*qualidade/i);
  assert.match(narrative.sections.find((section) => section.id === 'evidence')!.body, /4 de 6/i);
  assert.match(narrative.sections.find((section) => section.id === 'containment')!.body, /serviço compartilhado.*plataforma/i);
  assert.match(narrative.sections.find((section) => section.id === 'existing-strength')!.body, /já funciona|Local/i);
});

test('projeção mantém contradição, lacuna e limite sem converter silêncio em consenso', () => {
  const narrative = projectFindingNarrative(finding);
  const evidence = narrative.sections.find((section) => section.id === 'evidence')!;
  const mechanism = narrative.sections.find((section) => section.id === 'mechanism')!;
  assert.match(evidence.body, /1 pessoa.*contradiz/i);
  assert.match(evidence.body, /1 pessoa.*não produziu/i);
  assert.match(mechanism.body, /Ainda falta.*Confirmar o caminho crítico/i);
  assert.match(mechanism.body, /Limite.*Não remove política/i);
});

test('finding investigativo omite experimento de implementação e opções técnicas', () => {
  const { technicalDirection: _technicalDirection, ...withoutTechnicalDirection } = finding;
  const narrative = projectFindingNarrative({
    ...withoutTechnicalDirection,
    prescription: { status: 'investigate', reason: 'Mecanismo não discriminado.' },
  });
  assert.equal(narrative.sections.some((section) => section.id === 'technical-options'), false);
  assert.equal(narrative.sections.some((section) => section.id === 'experiment'), false);
  assert.ok(narrative.sections.some((section) => section.id === 'investigation'));
});

test('padrão virtuoso publica condição de sustentação e sinal de regressão', () => {
  const narrative = projectFindingNarrative({
    ...finding,
    kind: 'evolution',
    causalAnalysis: {
      ...finding.causalAnalysis!,
      sociotechnicalPattern: {
        kind: 'virtuous', behavior: 'O time integra cedo.', enablingCondition: 'Feedback estável.', localRationale: 'Corrigir cedo custa menos.', systemicEffect: 'Conflitos diminuem.', regressionSignal: 'O intervalo volta a crescer.',
        loop: { status: 'hypothesis', plainLanguage: 'O retorno pode sustentar o padrão.' }, evidence: { for: [], against: [], missing: [] },
        boundary: { observes: 'Time', recommends: 'Time', decides: 'Time', executes: 'Time' }, scope: { containment: 'local', observed: ['Squad'], limit: 'Não demonstra difusão.' },
      },
    },
  });
  const strength = narrative.sections.find((section) => section.id === 'existing-strength')!;
  assert.match(strength.body, /Feedback estável/);
  assert.match(strength.body, /intervalo volta a crescer/i);
});
