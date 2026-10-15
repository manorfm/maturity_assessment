import assert from 'node:assert/strict';
import { test } from 'node:test';
import { projectDiagnosticLaudo, projectTreatmentPlan } from '../src/modules/inference/domain/diagnostic-report.js';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import { renderLaudo, renderTreatmentPage } from '../src/modules/projects/diagnostic-report-view.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';

function finding(partial: Partial<OutcomeFinding> & Pick<OutcomeFinding, 'pattern' | 'title' | 'detailCapability'>): OutcomeFinding {
  return {
    kind: 'correction',
    cause: partial.title,
    intervention: partial.experiment?.action ?? partial.title,
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

function column(html: string, start: string, end: string): string {
  const from = html.indexOf(start);
  const to = html.indexOf(end, from + start.length);
  assert.ok(from >= 0, start);
  assert.ok(to > from, end);
  return html.slice(from, to);
}

test('conduta dependente não entra como experimento de 30 dias', () => {
  const plan = projectTreatmentPlan([
    finding({
      pattern: 'servico-sem-owner',
      title: 'Nomear quem responde pelo serviço',
      detailCapability: 'team-ownership',
      mechanism: 'organization',
      containment: 'organizational-structure',
      decisionAuthority: 'cross-team',
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
  const now = plan.active.find((item) => item.action.includes('Nomear quem responde'));
  const waiting = [...plan.active, ...plan.waiting, ...plan.deferred].find((item) => item.action.includes('Integrar o trabalho'));
  assert.equal(now?.dependency, 'sem dependência');
  assert.equal(now?.learningMode, 'work-experiment');
  assert.equal(now?.horizon, '0-30');
  assert.match(waiting?.dependency ?? '', /^depende de /);
  assert.equal(waiting?.horizon, '1-3');

  const html = renderTreatmentPage(plan);
  const days = column(html, '0–30 dias', '1–3 meses');
  const months = column(html, '1–3 meses', '3–12 meses');
  const year = column(html, '3–12 meses', 'Pulso');
  assert.equal(days.includes('Integrar o trabalho no mesmo dia'), false);
  assert.equal(months.includes('Integrar o trabalho no mesmo dia'), true);
  assert.equal(days.includes('Nomear quem responde pelo serviço'), true);
  assert.equal(year.includes('Nenhuma conduta neste horizonte.'), true);
});

test('modo longo fica em 3–12 mesmo se a autoridade ainda a trata como ativa', () => {
  const plan = projectTreatmentPlan([
    finding({
      pattern: 'conhecimento-concentrado',
      title: 'Rodízio de plantão entre quem opera',
      detailCapability: 'incident-management',
      decisionAuthority: 'team',
      experiment: {
        action: 'Rodízio de plantão entre quem opera',
        owner: 'Gestão',
        metric: 'pessoas',
        reviewHorizon: '30 dias',
        successCriterion: 'O plantão cobre uma semana.',
      },
    }),
  ]);
  const conduct = plan.active.find((item) => item.action.includes('Rodízio'));
  assert.ok(conduct);
  assert.equal(conduct?.dependency, 'sem dependência');
  assert.equal(conduct?.learningMode, 'rotation');
  assert.equal(conduct?.horizon, '3-12');

  const html = renderTreatmentPage(plan);
  const days = column(html, '0–30 dias', '1–3 meses');
  const year = column(html, '3–12 meses', 'Pulso');
  assert.equal(days.includes('Rodízio de plantão'), false);
  assert.equal(days.includes('Nenhuma conduta neste horizonte.'), true);
  assert.equal(year.includes('Rodízio de plantão'), true);

  const guildPlan = projectTreatmentPlan([
    finding({
      pattern: 'guilda-observabilidade',
      title: 'Comunidade de observabilidade entre os times',
      detailCapability: 'observability-practice',
      experiment: {
        action: 'Comunidade de observabilidade entre os times',
        owner: 'Gestão',
        metric: 'times',
        reviewHorizon: '30 dias',
        successCriterion: 'A guilda se reúne no trabalho real.',
      },
    }),
  ]);
  const guild = guildPlan.active.find((item) => item.action.includes('Comunidade'));
  assert.equal(guild?.learningMode, 'community');
  assert.equal(guild?.horizon, '3-12');
});

test('capacidade que não é experimento imediato fica em 1–3 meses', () => {
  const plan = projectTreatmentPlan([
    finding({
      pattern: 'postmortem-sem-efeito',
      title: 'Dojo de seis semanas no backlog do time',
      detailCapability: 'organizational-learning',
      experiment: {
        action: 'Dojo de seis semanas no backlog do time',
        owner: 'Time',
        metric: 'itens',
        reviewHorizon: '30 dias',
        successCriterion: 'O time fecha um item do próprio backlog.',
      },
    }),
  ]);
  const conduct = [...plan.active, ...plan.waiting, ...plan.deferred].find((item) => item.action.includes('Dojo'));
  assert.equal(conduct?.learningMode, 'immersion');
  assert.equal(conduct?.dependency, 'sem dependência');
  assert.equal(conduct?.horizon, '1-3');

  const html = renderTreatmentPage(plan);
  const days = column(html, '0–30 dias', '1–3 meses');
  const months = column(html, '1–3 meses', '3–12 meses');
  assert.equal(days.includes('Dojo de seis semanas'), false);
  assert.equal(months.includes('Dojo de seis semanas'), true);
  assert.equal(months.includes('depende da de origem'), false);
  assert.equal(column(html, '3–12 meses', 'Pulso').includes('Nenhuma conduta neste horizonte.'), true);
});

test('coluna de 1–3 meses vazia não afirma dependência', () => {
  const html = renderTreatmentPage({ active: [], waiting: [], deferred: [], pulse: [] });
  const months = column(html, '1–3 meses', '3–12 meses');
  assert.equal(months.includes('depende da de origem'), false);
  assert.equal(months.includes('Nenhuma conduta neste horizonte.'), true);
});

test('laudo não mostra conduta dependente na seção de 30 dias', () => {
  const ownerFinding = finding({
    pattern: 'servico-sem-owner',
    title: 'Nomear quem responde pelo serviço',
    detailCapability: 'team-ownership',
    mechanism: 'organization',
    containment: 'organizational-structure',
    decisionAuthority: 'cross-team',
  });
  const findings = [
    ownerFinding,
    finding({
      pattern: 'integracao-tardia',
      title: 'Integrar o trabalho no mesmo dia',
      detailCapability: 'continuous-integration',
      mechanism: 'process',
      containment: 'team',
      decisionAuthority: 'team',
    }),
  ];
  const laudo = projectDiagnosticLaudo({
    outcome: {
      kind: 'correct',
      kindLabel: 'Precisa de correção',
      limiterLabel: 'Dono do serviço',
      reading: 'O serviço não tem quem responda.',
      nextStepTitle: '',
      nextStepBody: '',
      finding: ownerFinding,
    },
    findings,
    organizationalAreas: OrganizationalAreaProjector.empty(),
  });
  const html = renderLaudo(laudo, { capabilityBase: '/c', reportBase: '/r' });
  const start = html.indexOf('Conduta para 30 dias');
  const end = html.indexOf('Prognóstico', start);
  assert.ok(start >= 0 && end > start);
  const section = html.slice(start, end);
  assert.equal(section.includes('Integrar o trabalho no mesmo dia'), false);
  assert.equal(section.includes('Nomear quem responde pelo serviço'), true);
});
