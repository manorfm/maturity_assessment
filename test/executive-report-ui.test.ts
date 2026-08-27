import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderCapabilityDiagnosis, renderCapabilityRadar } from '../src/modules/projects/project-routes.js';

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
