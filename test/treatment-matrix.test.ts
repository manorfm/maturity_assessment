/**
 * Plano matriz autoridade × horizonte (contrato CONTRATO_OK, fase 10).
 * Projector `projectTreatmentMatrix` + view `.treatment-matrix`.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { projectTreatmentPlan } from '../src/modules/inference/domain/diagnostic-report.js';
import * as treatmentContract from '../src/modules/inference/domain/treatment-contract.js';
import type { TreatmentConduct } from '../src/modules/inference/domain/treatment-contract.js';
import { renderTreatmentPage } from '../src/modules/projects/diagnostic-report-view.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';

type TreatmentMatrixCellKey = '0-30' | '1-3' | '3-12';
type TreatmentMatrixRow = {
  authority: TreatmentConduct['authority'];
  label: string;
  subtitle: string;
  activeCount: number;
  totalCount: number;
  cells: Record<TreatmentMatrixCellKey, TreatmentConduct[]>;
};
type TreatmentMatrix = {
  rows: TreatmentMatrixRow[];
  horizonHeaders: Record<TreatmentMatrixCellKey, string>;
};

const projectTreatmentMatrix = (treatmentContract as {
  projectTreatmentMatrix?: (conducts: TreatmentConduct[]) => TreatmentMatrix;
}).projectTreatmentMatrix;

const AUTHORITIES = ['direction', 'management', 'team', 'specialist'] as const;
const LABELS: Record<(typeof AUTHORITIES)[number], string> = {
  direction: 'Direção',
  management: 'Gestão',
  team: 'Times',
  specialist: 'Especialistas',
};
const SUBTITLES: Record<(typeof AUTHORITIES)[number], string> = {
  direction: 'decisão, política, investimento',
  management: 'processo e prioridades',
  team: 'prática do dia a dia',
  specialist: 'plataforma, SRE, segurança',
};
const HORIZON_HEADERS: Record<TreatmentMatrixCellKey, string> = {
  '0-30': '0–30 dias',
  '1-3': '1–3 meses',
  '3-12': '3–12 meses',
};

function conduct(partial: Partial<TreatmentConduct> & Pick<TreatmentConduct, 'action' | 'authority' | 'horizon'>): TreatmentConduct {
  return {
    owner: 'Time',
    success: 'Critério publicado.',
    ...partial,
  };
}

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

function matrixCell(html: string, authority: string, horizon: string): string {
  const rowStart = html.indexOf(`data-authority="${authority}"`);
  assert.ok(rowStart >= 0, `row data-authority=${authority}`);
  const nextRow = html.indexOf('data-authority="', rowStart + 1);
  const rowHtml = html.slice(rowStart, nextRow === -1 ? undefined : nextRow);
  const cellStart = rowHtml.indexOf(`data-horizon="${horizon}"`);
  assert.ok(cellStart >= 0, `cell data-horizon=${horizon} in ${authority}`);
  const nextCell = rowHtml.indexOf('data-horizon="', cellStart + 1);
  return rowHtml.slice(cellStart, nextCell === -1 ? undefined : nextCell);
}

test('projectTreatmentMatrix agrupa por authority × horizon na ordem canônica', () => {
  assert.equal(typeof projectTreatmentMatrix, 'function', 'projectTreatmentMatrix deve existir no domínio');
  const conducts = [
    conduct({ action: 'A direção', authority: 'direction', horizon: '0-30' }),
    conduct({ action: 'B gestão longo', authority: 'management', horizon: '3-12' }),
    conduct({ action: 'C time médio', authority: 'team', horizon: '1-3' }),
    conduct({ action: 'D especialista agora', authority: 'specialist', horizon: '0-30' }),
  ];
  const matrix = projectTreatmentMatrix!(conducts);
  assert.equal(matrix.rows.length, 4);
  for (let i = 0; i < AUTHORITIES.length; i += 1) {
    const authority = AUTHORITIES[i]!;
    const row = matrix.rows[i]!;
    assert.equal(row.authority, authority);
    assert.equal(row.label, LABELS[authority]);
    assert.equal(row.subtitle, SUBTITLES[authority]);
  }
  assert.deepEqual(matrix.horizonHeaders, HORIZON_HEADERS);
  assert.equal(matrix.rows[0]!.cells['0-30'].map((item) => item.action).join('|'), 'A direção');
  assert.equal(matrix.rows[1]!.cells['3-12'].map((item) => item.action).join('|'), 'B gestão longo');
  assert.equal(matrix.rows[2]!.cells['1-3'].map((item) => item.action).join('|'), 'C time médio');
  assert.equal(matrix.rows[3]!.cells['0-30'].map((item) => item.action).join('|'), 'D especialista agora');

  const empty = projectTreatmentMatrix!([]);
  assert.equal(empty.rows.length, 4);
  for (const row of empty.rows) {
    assert.deepEqual(row.cells['0-30'], []);
    assert.deepEqual(row.cells['1-3'], []);
    assert.deepEqual(row.cells['3-12'], []);
    assert.equal(row.activeCount, 0);
    assert.equal(row.totalCount, 0);
  }
});

test('Ativas N de M conta horizon 0-30 por autoridade, não status do portfolio', () => {
  assert.equal(typeof projectTreatmentMatrix, 'function', 'projectTreatmentMatrix deve existir no domínio');
  const conducts = [
    conduct({ action: 'Ativa agora', authority: 'team', horizon: '0-30', dependency: 'sem dependência' }),
    conduct({ action: 'Espera agora', authority: 'team', horizon: '0-30', dependency: 'depende de Ativa agora' }),
    conduct({ action: 'Depois', authority: 'team', horizon: '1-3', dependency: 'sem dependência' }),
    conduct({ action: 'Direção só', authority: 'direction', horizon: '3-12' }),
  ];
  const matrix = projectTreatmentMatrix!(conducts);
  const team = matrix.rows.find((row) => row.authority === 'team');
  const direction = matrix.rows.find((row) => row.authority === 'direction');
  const management = matrix.rows.find((row) => row.authority === 'management');
  assert.ok(team && direction && management);
  assert.equal(team.activeCount, 2);
  assert.equal(team.totalCount, 3);
  assert.equal(direction.activeCount, 0);
  assert.equal(direction.totalCount, 1);
  assert.equal(management.activeCount, 0);
  assert.equal(management.totalCount, 0);

  const html = renderTreatmentPage({
    active: [conducts[0]!],
    waiting: [conducts[1]!],
    deferred: [conducts[2]!, conducts[3]!],
    pulse: [],
  });
  assert.match(html, /Ativas:\s*2 de 3/);
  assert.match(html, /Ativas:\s*0 de 1/);
  assert.match(html, /Ativas:\s*0 de 0/);
});

test('matriz inclui active ∪ waiting ∪ deferred sem filtrar de novo', () => {
  assert.equal(typeof projectTreatmentMatrix, 'function', 'projectTreatmentMatrix deve existir no domínio');
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
  const published = [...plan.active, ...plan.waiting, ...plan.deferred];
  assert.ok(published.length >= 2);
  const matrix = projectTreatmentMatrix!(published);
  const actions = matrix.rows.flatMap((row) =>
    (['0-30', '1-3', '3-12'] as const).flatMap((horizon) => row.cells[horizon].map((item) => item.action)));
  for (const item of published) {
    assert.equal(actions.includes(item.action), true, `faltou ${item.action}`);
  }
  assert.equal(actions.length, published.length);
  assert.equal(actions.some((action) => /Orbital|D1|G1/.test(action)), false);
});

test('com ≥1 conduta a view renderiza treatment-matrix e substitui treatment-horizons', () => {
  const plan = projectTreatmentPlan([
    finding({
      pattern: 'servico-sem-owner',
      title: 'Nomear quem responde pelo serviço',
      detailCapability: 'team-ownership',
      decisionAuthority: 'cross-team',
      experiment: {
        action: 'Nomear quem responde pelo serviço',
        owner: 'Direção',
        metric: 'serviço',
        reviewHorizon: '30 dias',
        successCriterion: 'Cada serviço tem uma pessoa responsável.',
      },
    }),
  ]);
  assert.ok([...plan.active, ...plan.waiting, ...plan.deferred].length >= 1);
  const html = renderTreatmentPage(plan);
  assert.match(html, /class="[^"]*\btreatment-matrix\b/);
  assert.doesNotMatch(html, /class="[^"]*\btreatment-horizons\b/);
  for (const authority of AUTHORITIES) {
    assert.match(html, new RegExp(`class="[^"]*\\btreatment-matrix-row\\b[^"]*"[^>]*data-authority="${authority}"|data-authority="${authority}"[^>]*class="[^"]*\\btreatment-matrix-row\\b`));
  }
  for (const horizon of ['0-30', '1-3', '3-12'] as const) {
    assert.match(html, new RegExp(`class="[^"]*\\btreatment-matrix-cell\\b[^"]*"[^>]*data-horizon="${horizon}"|data-horizon="${horizon}"[^>]*class="[^"]*\\btreatment-matrix-cell\\b`));
  }
  assert.equal(html.includes(HORIZON_HEADERS['0-30']), true);
  assert.equal(html.includes(HORIZON_HEADERS['1-3']), true);
  assert.equal(html.includes(HORIZON_HEADERS['3-12']), true);
});

test('células reusam cartão de conduta; contador Ativas no rótulo da autoridade', () => {
  const active = conduct({
    action: 'Nomear quem responde pelo serviço',
    owner: 'Direção',
    success: 'Cada serviço tem uma pessoa responsável.',
    authority: 'direction',
    horizon: '0-30',
    dependency: 'sem dependência',
    evidenceGrade: 'D',
  });
  const waiting = conduct({
    action: 'Integrar o trabalho <b>hoje</b>',
    owner: 'Time',
    success: 'A espera cai.',
    authority: 'team',
    horizon: '1-3',
    dependency: 'depende de Nomear quem responde pelo serviço',
  });
  const html = renderTreatmentPage({ active: [active], waiting: [waiting], deferred: [], pulse: [] });
  assert.match(html, /class="[^"]*\btreatment-matrix\b/);
  assert.match(html, /Ativas:\s*1 de 1/);
  assert.match(html, /Ativas:\s*0 de 1/);
  const directionNow = matrixCell(html, 'direction', '0-30');
  assert.equal(directionNow.includes('Nomear quem responde pelo serviço'), true);
  assert.equal(directionNow.includes('Direção'), true);
  assert.equal(directionNow.includes('Cada serviço tem uma pessoa responsável.'), true);
  assert.equal(directionNow.includes('sem dependência'), true);
  assert.match(directionNow, /class="[^"]*\btreatment-matrix-card\b/);
  const teamLater = matrixCell(html, 'team', '1-3');
  assert.equal(teamLater.includes('Integrar o trabalho'), true);
  assert.equal(teamLater.includes('depende de Nomear quem responde pelo serviço'), true);
  assert.equal(teamLater.includes('<b>hoje</b>'), false);
  assert.equal(teamLater.includes('Integrar o trabalho &lt;b&gt;hoje&lt;/b&gt;'), true);
  assert.match(teamLater, /class="[^"]*\btreatment-matrix-card\b/);
  const emptyCell = matrixCell(html, 'management', '0-30');
  assert.equal(emptyCell.includes('Nenhuma conduta neste horizonte.'), false);
  assert.doesNotMatch(emptyCell, /class="[^"]*\btreatment-matrix-card\b/);
  assert.equal(emptyCell.includes('report-conduct'), false);
});

test('header 0-30 inclui ativas agora', () => {
  const html = renderTreatmentPage({
    active: [conduct({ action: 'Agora', authority: 'direction', horizon: '0-30' })],
    waiting: [],
    deferred: [],
    pulse: [],
  });
  assert.match(html, /class="[^"]*\btreatment-matrix\b/);
  assert.match(html, /ativas agora/i);
  assert.match(html, /0[–-]30 dias[^<]*ativas agora/i);
});

test('coluna 0-30 tem destaque accent-soft', () => {
  const html = renderTreatmentPage({
    active: [conduct({ action: 'Agora', authority: 'direction', horizon: '0-30' })],
    waiting: [],
    deferred: [],
    pulse: [],
  });
  const nowCell = matrixCell(html, 'direction', '0-30');
  assert.match(
    nowCell,
    /class="[^"]*\b(treatment-matrix-cell--now|treatment-matrix-now)\b/,
  );
  const laterCell = matrixCell(html, 'direction', '1-3');
  assert.doesNotMatch(
    laterCell,
    /class="[^"]*\b(treatment-matrix-cell--now|treatment-matrix-now)\b/,
  );
  assert.match(
    html,
    /\.(treatment-matrix-cell--now|treatment-matrix-now)\s*\{[^}]*accent-soft|class="[^"]*\b(treatment-matrix-cell--now|treatment-matrix-now)\b[^"]*"[^>]*accent-soft|accent-soft[^}]*\.(treatment-matrix-cell--now|treatment-matrix-now)/,
  );
});

test('cards da matriz usam classe compacta', () => {
  const html = renderTreatmentPage({
    active: [
      conduct({
        action: 'Nomear quem responde pelo serviço',
        owner: 'Direção',
        success: 'Cada serviço tem uma pessoa responsável.',
        authority: 'direction',
        horizon: '0-30',
      }),
    ],
    waiting: [],
    deferred: [],
    pulse: [],
  });
  const cell = matrixCell(html, 'direction', '0-30');
  assert.match(cell, /class="[^"]*\btreatment-matrix-card\b/);
  assert.equal(cell.includes('Nomear quem responde pelo serviço'), true);
  assert.equal(cell.includes('Direção'), true);
  assert.equal(cell.includes('Cada serviço tem uma pessoa responsável.'), true);
});

test('sem condutas: sem treatment-matrix; gap; anti-Orbital/13%/24%', () => {
  const html = renderTreatmentPage({ active: [], waiting: [], deferred: [], pulse: [] });
  assert.doesNotMatch(html, /class="[^"]*\btreatment-matrix\b/);
  assert.doesNotMatch(html, /class="[^"]*\btreatment-horizons\b/);
  assert.match(html, /report-gap/);
  assert.doesNotMatch(html, /Orbital/);
  assert.doesNotMatch(html, /\b13%\b/);
  assert.doesNotMatch(html, /\b24%\b/);
  assert.doesNotMatch(html, /\bD1\b|\bE1\b|\bG1\b/);
});

test('pulso e Cynefin permanecem no plano', () => {
  const plan = projectTreatmentPlan([
    finding({
      pattern: 'servico-sem-owner',
      title: 'Nomear quem responde pelo serviço',
      detailCapability: 'team-ownership',
      decisionAuthority: 'cross-team',
      experiment: {
        action: 'Nomear quem responde pelo serviço',
        owner: 'Direção',
        metric: 'serviço',
        reviewHorizon: '30 dias',
        successCriterion: 'Cada serviço tem uma pessoa responsável.',
      },
    }),
  ]);
  const html = renderTreatmentPage(plan);
  assert.match(html, /Pulso/);
  assert.match(html, /Domínio Cynefin/);
  assert.match(html, /Claro — aplicar|Complicado — analisar|Complexo — experimentar|Caótico — estabilizar/);
  const empty = renderTreatmentPage({ active: [], waiting: [], deferred: [], pulse: [] });
  assert.match(empty, /Pulso/);
  assert.match(empty, /Domínio Cynefin/);
  assert.match(empty, /item-âncora/);
});
