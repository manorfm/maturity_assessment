import assert from 'node:assert/strict';
import { test } from 'node:test';
import { diagnosticStrength, renderCapabilityDiagnosis, renderCapabilityRadar, renderClassification, renderOutcome } from '../src/modules/projects/project-routes.js';

const leaf = (overrides: Partial<Parameters<typeof renderCapabilityRadar>[0][number]> = {}) => ({
  id: 'delivery', label: 'Entrega', level: 2.4, confidence: .8, evidence: 8,
  hasContradiction: false, assessed: true, coverage: 1, children: [], ...overrides,
});

test('radar diferencia fragilidade confirmada de ausência de evidência', () => {
  const html = renderCapabilityRadar([
    leaf({ id: 'critical', label: 'Crítica', level: .7 }),
    leaf({ id: 'unknown', label: 'Sem amostra', assessed: false, level: 0, confidence: 0, evidence: 0, coverage: .2 }),
  ], '/capabilities');

  assert.match(html, /radar-status-critical/);
  assert.match(html, /Fragilidade confirmada; exige ação imediata/);
  assert.match(html, /class="radar-marker radar-marker-unassessed"/);
  assert.match(html, /Evidência insuficiente/);
  assert.doesNotMatch(html, /href="\/capabilities\/unknown"/);
  assert.match(html, /aria-disabled="true"/);
});

test('recomendação apresenta decisão executiva antes da metodologia', () => {
  const html = renderCapabilityDiagnosis([{
    kind: 'correction', title: 'Mudanças aguardam filas externas',
    cause: 'Acesso depende de aprovações manuais.', intervention: 'Criar um caminho automatizado com controles embutidos.',
    confidence: .82, priority: .9, constraint: 'access', reasons: ['A espera apareceu em três jornadas.'],
    experiment: { action: 'Automatizar um fluxo frequente.', owner: 'Plataforma', metric: 'Tempo de espera', reviewHorizon: '30 dias', successCriterion: 'Reduzir espera pela metade' },
  }], leaf());

  assert.match(html, /Atenção imediata/);
  assert.match(html, /Impacto no negócio/);
  assert.match(html, /Ação recomendada/);
  assert.match(html, /Como acompanhar/);
  assert.match(html, /Ver diagnóstico, evidências e fundamento/);
  assert.doesNotMatch(html, /posterior provisório/);
});

test('impacto executivo acompanha a capacidade avaliada', () => {
  const html = renderCapabilityDiagnosis([{
    kind: 'correction', detailCapability: 'portfolio-management', title: 'Portfólio sem ciclo de resultado',
    intervention: 'Revisar uma iniciativa antes de começar outra.', confidence: .85, priority: .7,
  }], leaf());

  assert.match(html, /Novas iniciativas disputam capacidade/);
  assert.doesNotMatch(html, /exposição operacional no fluxo de entrega/);
});

test('cartão de correção mostra o universo da solução', () => {
  const html = renderOutcome({
    kind: 'correct',
    kindLabel: 'Corrigir o limitador',
    limiterLabel: 'Integração contínua',
    reading: 'Integração contínua está em opaco.',
    nextStepTitle: 'Mudanças permanecem isoladas',
    nextStepBody: 'Integre no mesmo dia.',
    finding: {
      kind: 'correction', pattern: 'mudanca-isolada', detailCapability: 'continuous-integration',
      title: 'Mudanças permanecem isoladas e encontram o sistema tarde', cause: '', intervention: 'Integre no mesmo dia',
      confidence: .9, priority: .9,
      experiment: { action: 'Reduza uma mudança até integrá-la no mesmo dia', owner: 'Fluxo', metric: 'espera até a junta', reviewHorizon: '30 dias', successCriterion: 'encontro no mesmo dia' },
    },
  });
  assert.match(html, /Universo da solução/);
  assert.match(html, /Integração em tronco/);
  assert.match(html, /Menor passo desta semana/);
  assert.doesNotMatch(html, /ciclo de melhoria/);
});

test('resumo executivo mostra um limitador e a próxima decisão, sem lista aberta', () => {
  const outcome = {
    kind: 'correct' as const,
    kindLabel: 'Corrigir o limitador',
    limiterLabel: 'Descoberta e validação',
    reading: 'Descoberta e validação limita o recorte em reativo.',
    nextStepTitle: 'Hipóteses permanecem em execução',
    nextStepBody: 'Reconstrua a última hipótese que avançou sem evidência de uso.',
  };
  const html = renderClassification({
    level: 1, label: 'Reativo',
    limitingCapabilities: ['Descoberta e validação', 'Aprendizado e adaptação', 'Fluxo de trabalho', 'Integração contínua'],
  }, outcome);
  assert.match(html, /Descoberta e validação/);
  assert.doesNotMatch(html, /e mais/);
  assert.doesNotMatch(html, /Hipóteses permanecem em execução/);
  assert.match(renderOutcome(outcome), /Próxima decisão/);
  assert.match(renderOutcome(outcome), /Corrigir o limitador/);
  assert.match(renderOutcome(outcome), /Hipóteses permanecem em execução/);
});

test('relatório pré-piloto usa faixas verbais em vez de percentuais causais', () => {
  assert.equal(diagnosticStrength(.9), 'Hipótese fortemente sustentada');
  const html = renderCapabilityDiagnosis([{
    kind: 'correction', title: 'Problema recorrente', intervention: 'Testar uma mudança pequena.', confidence: .9, priority: .8,
  }], leaf());
  assert.match(html, /Hipótese fortemente sustentada/);
  assert.doesNotMatch(html, /90%/);
});
