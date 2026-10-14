import assert from 'node:assert/strict';
import { test } from 'node:test';
import { projectTreatmentPlan } from '../src/modules/inference/domain/diagnostic-report.js';
import { cynefinLine } from '../src/modules/inference/domain/treatment-contract.js';
import { renderTreatmentPage } from '../src/modules/projects/diagnostic-report-view.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';

function finding(partial: Partial<OutcomeFinding> & Pick<OutcomeFinding, 'pattern' | 'title' | 'detailCapability'>): OutcomeFinding {
  return {
    kind: 'correction',
    cause: partial.title,
    intervention: partial.title,
    confidence: 0.9,
    priority: 0.8,
    prescription: { status: 'ready', reason: 'ok' },
    experiment: {
      action: partial.title,
      owner: 'Time',
      metric: 'espera',
      reviewHorizon: '30 dias',
      successCriterion: 'A espera cai.',
    },
    ...partial,
  };
}

test('conduta sem dependência fica ativa; a que depende sai da lista e diz de quem', () => {
  const plan = projectTreatmentPlan([
    finding({
      pattern: 'servico-sem-owner',
      title: 'Nomear quem responde pelo serviço',
      detailCapability: 'team-ownership',
      mechanism: 'organization',
      containment: 'organizational-structure',
      decisionAuthority: 'cross-team',
      experiment: {
        action: 'Nomear quem responde pelo serviço',
        owner: 'Direção',
        metric: 'serviço',
        reviewHorizon: '30 dias',
        successCriterion: 'Cada serviço tem uma pessoa responsável.',
      },
    }),
    finding({
      pattern: 'integracao-tardia',
      title: 'Integrar o trabalho no mesmo dia',
      detailCapability: 'continuous-integration',
      mechanism: 'process',
      containment: 'team',
      decisionAuthority: 'team',
    }),
  ]);
  const active = plan.active.find((item) => item.action.includes('Nomear quem responde'));
  const waiting = plan.waiting.find((item) => item.action.includes('Integrar o trabalho'));
  assert.ok(active);
  assert.equal(active?.dependency, 'sem dependência');
  assert.equal(plan.active.some((item) => item.action.includes('Integrar o trabalho')), false);
  assert.ok(waiting);
  assert.match(waiting?.dependency ?? '', /depende de Nomear quem responde pelo serviço/);
  assert.equal(cynefinLine('clear'), 'Claro — aplicar');
  assert.equal(cynefinLine('complicated'), 'Complicado — analisar');
  assert.equal(cynefinLine('complex'), 'Complexo — experimentar');
  assert.equal(cynefinLine('chaotic'), 'Caótico — estabilizar');
});

test('plano desenha o cartão, a seta e o pulso só com item-âncora', () => {
  const plan = projectTreatmentPlan([
    finding({
      pattern: 'servico-sem-owner',
      title: 'Nomear quem responde pelo serviço',
      detailCapability: 'team-ownership',
      mechanism: 'organization',
      containment: 'organizational-structure',
      decisionAuthority: 'cross-team',
      experiment: {
        action: 'Nomear quem responde pelo serviço',
        owner: 'Direção',
        metric: 'serviço',
        reviewHorizon: '30 dias',
        successCriterion: 'Cada serviço tem uma pessoa responsável.',
      },
    }),
    finding({
      pattern: 'integracao-tardia',
      title: 'Integrar o trabalho no mesmo dia',
      detailCapability: 'continuous-integration',
      mechanism: 'process',
      containment: 'team',
      decisionAuthority: 'team',
    }),
  ]);
  const html = renderTreatmentPage(plan);
  const arrow = html.indexOf('A conduta de destino depende da de origem');
  const activeAt = html.indexOf('Nomear quem responde pelo serviço');
  const waitingAt = html.indexOf('Integrar o trabalho no mesmo dia');
  assert.ok(activeAt >= 0 && arrow > activeAt && waitingAt > arrow);
  assert.match(html, /sem dependência/);
  assert.match(html, /depende de Nomear quem responde pelo serviço/);
  assert.match(html, /Direção/);
  assert.match(html, /Cada serviço tem uma pessoa responsável/);
  assert.match(html, /Claro — aplicar|Complicado — analisar|Complexo — experimentar|Caótico — estabilizar/);
  assert.match(html, /Evidência D/);
  assert.match(html, /experimento explícito/);
  assert.doesNotMatch(html, /depende de D1|Pix/);
  const empty = renderTreatmentPage({ active: [], waiting: [], deferred: [], pulse: [] });
  assert.match(empty, /item-âncora/);
  assert.doesNotMatch(empty, /3 a 6 itens/);
});
