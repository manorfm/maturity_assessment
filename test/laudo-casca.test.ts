import assert from 'node:assert/strict';
import { test } from 'node:test';
import { projectDiagnosticLaudo } from '../src/modules/inference/domain/diagnostic-report.js';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';
import { renderLaudo } from '../src/modules/projects/diagnostic-report-view.js';
import { layout } from '../src/shared/html.js';

const finding = (pattern: string, title: string): OutcomeFinding => ({
  kind: 'correction',
  pattern,
  detailCapability: 'work-management',
  title,
  cause: 'Mudanças prontas esperam aprovação.',
  intervention: 'Aprovar por risco.',
  confidence: 0.91,
  priority: 0.8,
  missingEvidence: 'Não sabemos se a espera vem da política ou dos testes.',
  experiment: {
    action: 'Aprovação por exceção em dois times.',
    owner: 'Gestão de Engenharia, com Segurança',
    metric: 'tempo até produção',
    reviewHorizon: '30 dias',
    successCriterion: 'Tempo de pronto até produção abaixo de 3 dias.',
  },
  affectedCapabilities: ['work-management', 'release-feedback'],
});

const outcome = {
  kind: 'correct' as const,
  kindLabel: 'Precisa de correção',
  limiterLabel: 'Aprovação de mudança',
  reading: 'O trabalho fica pronto, mas espera.',
  nextStepTitle: '',
  nextStepBody: '',
  finding: finding('aprovacao', 'Mudanças prontas esperam aprovação de várias pessoas.'),
};

type LaudoInput = Parameters<typeof projectDiagnosticLaudo>[0];

function minimalLaudo(extra: Partial<LaudoInput> = {}) {
  return projectDiagnosticLaudo({
    outcome,
    findings: [finding('aprovacao', 'Mudanças prontas esperam aprovação de várias pessoas.')],
    organizationalAreas: OrganizationalAreaProjector.empty(),
    context: 'Pagamentos · 2 unidades',
    complaint: { quote: 'Entregamos devagar e não sabemos por quê.', author: 'CTO, na abertura do projeto' },
    sample: {
      completed: 12,
      units: [
        { path: 'Pagamentos/Time A', completed: 8 },
        { path: 'Pagamentos/Time B', completed: 4 },
      ],
    },
    ...extra,
  });
}

function htmlFor(extra: Partial<LaudoInput> = {}): string {
  return renderLaudo(minimalLaudo(extra), { capabilityBase: '/c', reportBase: '/r' });
}

/** Primeira regra cujo seletor lista a classe (antes de media queries). */
function cssRuleFor(served: string, className: string): string {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = [...served.matchAll(new RegExp(`([^{}]*\\.${escaped}\\b[^{]*)\\{([^}]+)\\}`, 'g'))]
    .find((entry) => !entry[1]!.includes('@media'));
  assert.ok(match?.[2], `regra CSS não encontrada para .${className}`);
  return match![2]!.replace(/\s+/g, ' ').trim();
}

const SECTION_TITLES = [
  'Motivo da avaliação',
  'Leitura geral',
  'Achados',
  'Divergências',
  'Restrição principal',
  'Conduta para 30 dias',
  'Prognóstico',
  'O que ainda não sabemos',
] as const;

test('CSS do laudo declara tipografia da casca (h1 52, quote 38 itálico, mecanismo 25, índice 88)', () => {
  const served = layout('Laudo', '');
  const hero = [...served.matchAll(/\.report-hero\s+h1\s*\{([^}]+)\}/g)][0]?.[1] ?? '';
  assert.match(hero.replace(/\s+/g, ' '), /font-size:\s*52px/);

  const quoteP = [...served.matchAll(/\.report-quote\s+p\s*\{([^}]+)\}/g)][0]?.[1]?.replace(/\s+/g, ' ') ?? '';
  assert.match(quoteP, /font-size:\s*38px/);
  assert.match(quoteP, /font-style:\s*italic/);
  assert.match(quoteP, /Newsreader|Georgia|serif/);

  const mechanism = cssRuleFor(served, 'report-mechanism');
  assert.match(mechanism, /font-size:\s*25px/);
  assert.match(mechanism, /Newsreader|Georgia|serif/);

  const index = cssRuleFor(served, 'report-index');
  assert.match(index, /font-size:\s*88px/);

  const withoutIndex = htmlFor();
  assert.doesNotMatch(withoutIndex, /class="report-index"/);
  assert.doesNotMatch(withoutIndex, /\b(?:13|24|45|100)%\b/);

  const withIndex = htmlFor({
    index: { published: true, index: 62, band: [50, 75], coverage: 0.8, leaves: [] },
  });
  assert.match(withIndex, /class="report-index"/);
  assert.match(withIndex, /62%/);
});

test('Laudo numera seções 1–8 no trilho com título 15px/600', () => {
  const served = layout('Laudo', '');
  const h2Rules = [...served.matchAll(/\.report-block\s+h2\s*\{([^}]+)\}/g)].map((m) => m[1]!.replace(/\s+/g, ' '));
  const h2 = h2Rules.find((rule) => rule.includes('font-size')) ?? '';
  assert.match(h2, /font-size:\s*15px/);
  assert.match(h2, /font-weight:\s*600/);

  const html = htmlFor();
  const blocks = [...html.matchAll(/<section class="report-block">([\s\S]*?)<\/section>/g)].map((m) => m[1]!);
  assert.equal(blocks.length, 8);
  for (const [i, expected] of SECTION_TITLES.entries()) {
    const block = blocks[i]!;
    const heading = /<h2[^>]*>([\s\S]*?)<\/h2>/.exec(block)?.[1] ?? '';
    assert.match(heading, new RegExp(`(^|[^0-9])${i + 1}([^0-9]|$)`));
    assert.match(heading, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  const footer = /<footer class="report-footer">[\s\S]*?<\/footer>/.exec(html)?.[0] ?? '';
  assert.ok(footer);
  assert.doesNotMatch(footer, /Motivo da avaliação|Leitura geral|Achados/);
});

test('Hero do laudo usa note com borda ink e amostra publicada', () => {
  const served = layout('Laudo', '');
  const noteCss = cssRuleFor(served, 'report-note');
  assert.match(noteCss, /border:\s*1\.5px\s+solid\s+var\(--ink\)/);

  const html = htmlFor();
  const hero = /<header class="report-hero">[\s\S]*?<\/header>/.exec(html)?.[0] ?? '';
  assert.ok(hero);
  assert.match(hero, /role="note"/);
  assert.match(hero, /Este diagnóstico descreve o sistema de trabalho/);
  assert.match(hero, /12 pessoas em 2 unidades/);
  assert.doesNotMatch(hero, /\b64\b/);
  assert.doesNotMatch(hero, /(?<![0-9])9(?![0-9])/);
  assert.doesNotMatch(hero, /(?<![0-9])7(?![0-9])/);
  assert.doesNotMatch(hero, /\bOrbital\b/);
  assert.doesNotMatch(html, /\bOrbital\b/);
});

test('Achados do laudo ficam em grade de 3 colunas no desktop', () => {
  const served = layout('Laudo', '');
  assert.match(served, /\.report-findings\b[^{]*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);

  const html = htmlFor({
    findings: [
      finding('aprovacao', 'Mudanças prontas esperam aprovação de várias pessoas.'),
      finding('espera', 'Fila cresce antes da liberação.'),
      finding('handoff', 'Entrega passa por filas entre times.'),
    ],
  });
  assert.match(html, /class="report-findings"/);
  assert.equal((html.match(/class="report-finding"/g) ?? []).length, 3);

  const empty = htmlFor({
    outcome: {
      kind: 'correct',
      kindLabel: 'Precisa de correção',
      limiterLabel: 'Fluxo',
      reading: '',
      nextStepTitle: '',
      nextStepBody: '',
    },
    findings: [],
  });
  assert.doesNotMatch(empty, /class="report-finding"/);
});

test('Conduta de 30 dias usa grade Experimento | Dono | Critério quando há condutas', () => {
  const served = layout('Laudo', '');
  assert.match(
    served,
    /\.report-conduct(?:-grid|-table|s)?\b[^{]*\{[^}]*(?:grid-template-columns|display:\s*table)/,
  );

  const html = htmlFor();
  const start = html.indexOf('Conduta para 30 dias');
  const end = html.indexOf('Prognóstico', start);
  assert.ok(start >= 0 && end > start);
  const section = html.slice(start, end);
  assert.match(section, /<(?:th|span|p)[^>]*>\s*Experimento/);
  assert.match(section, /<(?:th|span|p)[^>]*>\s*Dono(?:\s|<)/);
  assert.match(section, /<(?:th|span|p)[^>]*>\s*Critério(?:\s|<)/);
  assert.match(section, /Aprovação por exceção em dois times/);
  assert.match(section, /Gestão de Engenharia, com Segurança/);
  assert.match(section, /Tempo de pronto até produção abaixo de 3 dias/);
  assert.doesNotMatch(section, /Orbital/);

  const without = htmlFor({
    outcome: {
      kind: 'correct',
      kindLabel: 'Precisa de correção',
      limiterLabel: 'Fluxo',
      reading: '',
      nextStepTitle: '',
      nextStepBody: '',
    },
    findings: [],
  });
  const gapStart = without.indexOf('Conduta para 30 dias');
  const gapEnd = without.indexOf('Prognóstico', gapStart);
  const gapSection = without.slice(gapStart, gapEnd);
  assert.match(gapSection, /Nenhuma conduta de 30 dias foi publicada/);
  assert.doesNotMatch(gapSection, /Orbital/);
  assert.doesNotMatch(gapSection, /<(?:th|span)[^>]*>\s*Experimento/);
});

test('Lacunas e exames ficam em duas colunas', () => {
  const served = layout('Laudo', '');
  assert.match(
    served,
    /\.report-(?:unknowns|exams|lacunas|gaps)(?:-grid|-pair)?\b[^{]*\{[^}]*grid-template-columns:\s*repeat\(2,/,
  );

  const html = htmlFor();
  const start = html.indexOf('O que ainda não sabemos');
  const end = html.indexOf('<footer class="report-footer">', start);
  assert.ok(start >= 0 && end > start);
  const section = html.slice(start, end);
  assert.match(section, /Lacunas/);
  assert.match(section, /Exames complementares sugeridos|Exames/);
  assert.match(section, /Nenhum exame complementar foi sugerido|Não sabemos se a espera/);
  assert.match(section, /class="report-unknowns-grid"/);
});

test('Footer do laudo tem duas colunas Sobre estimativas | Aviso de uso', () => {
  const served = layout('Laudo', '');
  const footerCss = cssRuleFor(served, 'report-footer');
  assert.match(footerCss, /grid-template-columns:\s*repeat\(2,/);

  const html = htmlFor();
  const footer = /<footer class="report-footer">[\s\S]*?<\/footer>/.exec(html)?.[0] ?? '';
  assert.ok(footer);
  assert.match(footer, /Sobre estas estimativas/);
  assert.match(footer, /Aviso de uso/);
  assert.match(footer, /12 pessoas em 2 unidades|Amostra desta leitura/);
  assert.doesNotMatch(footer, /Instrumento v21\s*·\s*modelo m2/);
  assert.doesNotMatch(footer, /Orbital/);
});

test('Casca do laudo não copia Orbital nem 13%/24%', () => {
  const html = htmlFor({
    index: { published: true, index: 62, band: [50, 75], coverage: 0.8, leaves: [] },
  });
  assert.doesNotMatch(html, /Orbital/);
  assert.doesNotMatch(html, /\b13%/);
  assert.doesNotMatch(html, /\b24%/);
});
