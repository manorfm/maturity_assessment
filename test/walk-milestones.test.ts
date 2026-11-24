/**
 * Walkthrough Marcos tabela (CONTRATO_OK, fase 12a).
 * WalkthroughMilestone tipado + view `.walk-milestones` / `.walk-milestone-row`.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import {
  projectAreaWalkthrough,
  type AreaWalkthrough,
  type WalkthroughPulse,
} from '../src/modules/inference/domain/area-walkthrough.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';
import type { TreatmentConduct } from '../src/modules/inference/domain/treatment-contract.js';
import { renderWalkthrough } from '../src/modules/projects/diagnostic-report-view.js';
import { layout } from '../src/shared/html.js';

type WalkthroughMilestone = {
  prazo: string;
  marco: string;
  criterio: string;
};

const ready = (pattern: string, title: string, detailCapability: string): OutcomeFinding => ({
  kind: 'correction',
  pattern,
  detailCapability,
  title,
  cause: title,
  intervention: 'Difundir a capacidade sem herói.',
  confidence: 0.88,
  priority: 0.8,
  prescription: { status: 'ready', reason: 'Mecanismo discriminado.' },
  experiment: {
    action: 'Difundir a capacidade sem herói.',
    owner: 'Quem autoriza o recorte',
    metric: 'pessoas distintas investigam',
    reviewHorizon: 'no próximo incidente',
    successCriterion: '≥ 4 pessoas diferentes investigaram',
  },
});

function operationsBase(input: {
  conducts: TreatmentConduct[];
  pulse: WalkthroughPulse[];
  index?: Parameters<typeof projectAreaWalkthrough>[0]['index'];
}): AreaWalkthrough {
  const findings = [
    ready('conhecimento-concentrado', 'Investigar depende de poucas pessoas', 'incident-management'),
  ];
  const capabilities = [
    { id: 'incident-management', label: 'Incidentes', level: 1, confidence: 0.8, evidence: 4, hasContradiction: false, coverage: 1 },
  ];
  const map = OrganizationalAreaProjector.project({ capabilities, findings });
  const operations = map.systems.find((system) => system.id === 'operations')!;
  return projectAreaWalkthrough({
    area: operations,
    findings,
    capabilities,
    organizationalAreas: map,
    outcomeKind: 'correct',
    conducts: input.conducts,
    pulse: input.pulse,
    ...(input.index !== undefined ? { index: input.index } : {}),
  });
}

function milestonesOf(walk: AreaWalkthrough): WalkthroughMilestone[] {
  return walk.sections.milestones as unknown as WalkthroughMilestone[];
}

function milestoneSection(html: string): string {
  const start = html.indexOf('<h2>Marcos</h2>');
  assert.ok(start >= 0, 'seção Marcos ausente');
  const end = html.indexOf('<h2>', start + 1);
  return html.slice(start, end < 0 ? undefined : end);
}

const conducts: TreatmentConduct[] = [
  {
    action: 'Escrever runbook dos incidentes frequentes',
    owner: 'Time de operação',
    success: 'runbooks usados no próximo evento',
    horizon: '0-30',
    authority: 'team',
  },
  {
    action: 'Plantão com rodízio semanal',
    owner: 'Gestão',
    success: 'rodízio cobrindo uma semana inteira',
    horizon: '1-3',
    authority: 'management',
  },
  {
    action: 'Comunidade de investigação entre times',
    owner: 'Operação',
    success: 'investigação compartilhada sem herói fixo',
    horizon: '3-12',
    authority: 'team',
  },
];

const pulse: WalkthroughPulse[] = [
  { prompt: 'Quem investigou o último problema?', leafId: 'incident-management' },
];

const publishedWithoutTarget = {
  published: true as const,
  index: 28,
  band: [20, 40] as [number, number],
  coverage: 60,
};

test('milestones tipados WalkthroughMilestone', () => {
  const walk = operationsBase({ conducts, pulse, index: publishedWithoutTarget });
  const milestones = milestonesOf(walk);
  assert.ok(Array.isArray(milestones));
  assert.ok(milestones.length >= 1);
  for (const row of milestones) {
    assert.equal(typeof row, 'object');
    assert.notEqual(row, null);
    assert.equal(typeof row.prazo, 'string');
    assert.equal(typeof row.marco, 'string');
    assert.equal(typeof row.criterio, 'string');
  }
});

test('conduta mapeia horizonte tipado + ação + critério', () => {
  const walk = operationsBase({ conducts, pulse: [], index: publishedWithoutTarget });
  const milestones = milestonesOf(walk);
  const expected = [
    { prazo: '30 dias', marco: conducts[0]!.action, criterio: conducts[0]!.success },
    { prazo: '90 dias', marco: conducts[1]!.action, criterio: conducts[1]!.success },
    { prazo: '6 meses', marco: conducts[2]!.action, criterio: conducts[2]!.success },
  ];
  for (const row of expected) {
    const found = milestones.find((item) => item.marco === row.marco);
    assert.ok(found, `marco ausente: ${row.marco}`);
    assert.equal(found.prazo, row.prazo);
    assert.equal(found.criterio, row.criterio);
    assert.equal(found.criterio.includes('%'), false);
  }
  assert.equal(milestones.some((item) => /0-30|1-3|3-12/.test(item.prazo)), false);
});

test('alvo só com index.target publicado', () => {
  const without = operationsBase({ conducts, pulse: [], index: publishedWithoutTarget });
  for (const row of milestonesOf(without)) {
    assert.equal(typeof row, 'object', 'milestone deve ser WalkthroughMilestone tipado');
    assert.equal(typeof row.criterio, 'string');
    assert.equal(row.criterio.includes('%'), false);
    assert.equal(row.criterio.includes('alvo'), false);
  }

  const withTarget = operationsBase({
    conducts,
    pulse: [],
    index: { ...publishedWithoutTarget, target: 62 },
  });
  const longHorizon = milestonesOf(withTarget).find((item) => typeof item === 'object' && item?.marco === conducts[2]!.action);
  assert.ok(longHorizon, 'marco tipado da conduta 3-12 ausente');
  assert.ok(longHorizon.criterio.includes(conducts[2]!.success));
  assert.ok(longHorizon.criterio.includes('alvo 62%'));
  assert.equal(longHorizon.criterio.includes('45%'), false);
  assert.equal(longHorizon.criterio.includes('13%'), false);
});

test('pulso local vira row sem % inventado', () => {
  const walk = operationsBase({ conducts: [], pulse, index: publishedWithoutTarget });
  const milestones = milestonesOf(walk);
  const pulseRow = milestones.find((item) => item.prazo === 'Pulso' || item.criterio === pulse[0]!.prompt);
  assert.ok(pulseRow, 'row de pulso ausente');
  assert.equal(pulseRow.prazo, 'Pulso');
  assert.equal(pulseRow.criterio, pulse[0]!.prompt);
  assert.ok(pulseRow.marco === 'Pulso' || pulseRow.marco.length > 0);
  assert.equal(pulseRow.criterio.includes('%'), false);
  assert.equal(milestones.some((item) => typeof item === 'string' && String(item).startsWith('Pulso:')), false);
});

test('lacuna sem conduta/pulso — report-gap, sem Orbital/38%', () => {
  const walk = operationsBase({
    conducts: [],
    pulse: [],
    index: { ...publishedWithoutTarget, target: 62 },
  });
  const milestones = milestonesOf(walk);
  const section = milestoneSection(renderWalkthrough(walk));
  if (milestones.length === 0) {
    assert.match(section, /report-gap/);
  } else {
    assert.ok(
      milestones.every((item) => typeof item === 'object' && item !== null),
      'lacuna tipada: WalkthroughMilestone, não string',
    );
    assert.ok(
      milestones.some((item) =>
        /conduta publicada/.test(`${item.prazo} ${item.marco} ${item.criterio}`),
      ),
      'lacuna deve mencionar conduta publicada',
    );
    assert.match(section, /report-gap|conduta publicada/);
  }
  assert.equal(
    milestones.some((item) => typeof item === 'object' && item?.prazo === '30 dias'),
    false,
  );
  assert.equal(
    milestones.some((item) => typeof item === 'object' && item?.prazo === '90 dias'),
    false,
  );
  assert.equal(
    milestones.some((item) => typeof item === 'object' && item?.prazo === '6 meses'),
    false,
  );
  assert.equal(section.includes('Orbital'), false);
  assert.equal(section.includes('13%'), false);
  assert.equal(section.includes('24%'), false);
  assert.equal(section.includes('45%'), false);
  assert.equal(section.includes('38%'), false);
});

test('view .walk-milestones tabela, sem ul de marcos', () => {
  const walk = operationsBase({ conducts, pulse, index: publishedWithoutTarget });
  const section = milestoneSection(renderWalkthrough(walk));
  assert.match(section, /class="[^"]*\bwalk-milestones\b/);
  assert.match(section, /Prazo/);
  assert.match(section, /Marco/);
  assert.match(section, /Critério/);
  assert.match(section, /class="[^"]*\bwalk-milestone-row\b/);
  assert.doesNotMatch(section, /<ul[\s>]/);
  const rows = section.match(/walk-milestone-row/g) ?? [];
  assert.ok(rows.length >= 1);
  assert.ok(section.includes(conducts[0]!.action));
  assert.ok(section.includes(conducts[0]!.success) || section.includes('30 dias'));
});

test('só rows publicadas — não inventar três horizontes', () => {
  const walk = operationsBase({
    conducts: [conducts[0]!],
    pulse: [],
    index: publishedWithoutTarget,
  });
  const milestones = milestonesOf(walk);
  assert.ok(milestones.some((item) => item.prazo === '30 dias' && item.marco === conducts[0]!.action));
  assert.equal(milestones.some((item) => item.prazo === '6 meses'), false);
  assert.equal(milestones.some((item) => item.prazo === '90 dias'), false);
  const section = milestoneSection(renderWalkthrough(walk));
  assert.equal(section.includes('38%'), false);
  assert.equal(section.includes('Orbital'), false);
});

test('demais seções intactas neste ciclo', () => {
  const walk = operationsBase({ conducts, pulse, index: publishedWithoutTarget });
  const html = renderWalkthrough(walk);
  assert.match(html, /Onde estamos/);
  assert.match(html, /Como chegamos aqui/);
  assert.match(html, /O que já funciona/);
  assert.match(html, /Próxima fase/);
  assert.match(html, /Caminho/);
  assert.match(html, /class="walk-trail"/);
  assert.match(html, /Riscos de regressão/);
  assert.match(html, /Premissas a revisar/);
  assert.doesNotMatch(html, /CaminhoStack/);
  assert.doesNotMatch(html, /walk-alvo|hero-alvo/i);
  assert.doesNotMatch(html, /class="[^"]*\bwalk-track\b|trilho 1/);
  if (!('gap' in walk.opening)) {
    assert.ok(walk.opening.state.length > 0);
  }
  assert.ok(walk.trail.length >= 1);
  assert.ok(walk.sections.risks.length >= 1);
  assert.ok(walk.sections.assumptions.length >= 1);
});

test('assert 9: CSS prazo tipografia MarcosGrid via layout()', () => {
  const served = layout('Marcos', '');
  const prazoRule = [
    ...served.matchAll(/\.walk-milestone-row\s+td:first-child\s*\{([^}]+)\}/g),
  ][0]?.[1]?.replace(/\s+/g, ' ') ?? '';
  assert.match(prazoRule, /Newsreader|Georgia|serif/);
  assert.match(prazoRule, /font-size:\s*20px/);
});

test('assert 10: CSS coluna prazo width 120px via layout()', () => {
  const served = layout('Marcos', '');
  const prazoWidthRules = [
    ...served.matchAll(/\.walk-milestones\s+th:first-child\s*\{([^}]+)\}/g),
    ...served.matchAll(/\.walk-milestones\s+td:first-child\s*\{([^}]+)\}/g),
    ...served.matchAll(/\.walk-milestone-row\s+td:first-child\s*\{([^}]+)\}/g),
  ].map((m) => m[1]!.replace(/\s+/g, ' '));
  const withWidth = prazoWidthRules.find((rule) => /width:\s*120px/.test(rule)) ?? '';
  assert.match(withWidth, /width:\s*120px/);
});

test('assert 11: CSS marco 2ª coluna font-weight 600 via layout()', () => {
  const served = layout('Marcos', '');
  const marcoRule = [
    ...served.matchAll(/\.walk-milestone-row\s+td:nth-child\(2\)\s*\{([^}]+)\}/g),
    ...served.matchAll(/\.walk-milestones\s+td:nth-child\(2\)\s*\{([^}]+)\}/g),
  ][0]?.[1]?.replace(/\s+/g, ' ') ?? '';
  assert.match(marcoRule, /font-weight:\s*600/);
});
