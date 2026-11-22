import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  maturitySliceDraws,
  maturitySliceSeed,
  projectDiagnosticLaudo,
  type DiagnosticLaudo,
} from '../src/modules/inference/domain/diagnostic-report.js';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';
import type { IndexPublication } from '../src/modules/inference/domain/stage-posterior.js';
import { aggregateParentIndex } from '../src/modules/measurement/domain/index-aggregation.js';
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

const peaked = (stage: 0 | 1 | 2 | 3 | 4): [number, number, number, number, number] => {
  const distribution = [0, 0, 0, 0, 0] as [number, number, number, number, number];
  distribution[stage] = 1;
  return distribution;
};

function parentOf(leaves: Record<string, readonly [number, number, number, number, number]>) {
  return aggregateParentIndex({
    leaves,
    weights: Object.fromEntries(Object.keys(leaves).map((id) => [id, 1])),
    draws: maturitySliceDraws,
    seed: maturitySliceSeed,
  });
}

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

function render(laudo: DiagnosticLaudo): string {
  return renderLaudo(laudo, { capabilityBase: '/c', reportBase: '/r' });
}

function cssRuleFor(served: string, className: string): string {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = [...served.matchAll(new RegExp(`([^{}]*\\.${escaped}\\b[^{]*)\\{([^}]+)\\}`, 'g'))]
    .find((entry) => !entry[1]!.includes('@media'));
  assert.ok(match?.[2], `regra CSS não encontrada para .${className}`);
  return match![2]!.replace(/\s+/g, ' ').trim();
}

function readingSection(html: string): string {
  const start = html.indexOf('Leitura geral');
  const end = html.indexOf('Achados', start);
  assert.ok(start >= 0 && end > start);
  return html.slice(start, end);
}

function divergencesSection(html: string): string {
  const start = html.indexOf('Divergências');
  const end = html.indexOf('Restrição principal', start);
  assert.ok(start >= 0 && end > start);
  return html.slice(start, end);
}

function constraintSection(html: string): string {
  const start = html.indexOf('Restrição principal');
  const end = html.indexOf('Conduta para 30 dias', start);
  assert.ok(start >= 0 && end > start);
  return html.slice(start, end);
}

function prognosisSection(html: string): string {
  const start = html.indexOf('Prognóstico');
  const end = html.indexOf('O que ainda não sabemos', start);
  assert.ok(start >= 0 && end > start);
  return html.slice(start, end);
}

const publishedIndex = {
  published: true as const,
  index: 62,
  band: [50, 75] as [number, number],
  coverage: 0.8,
  leaves: [] as IndexPublication extends { leaves: infer L } ? L : never,
};

test('Leitura publicada desenha gauge (trilho + banda accent-soft + marcador) com os números do índice', () => {
  const served = layout('Laudo', '');
  const bandCss = cssRuleFor(served, 'report-gauge-band');
  assert.match(bandCss, /var\(--accent-soft\)/);

  const withIndex = htmlFor({ index: publishedIndex });
  const reading = readingSection(withIndex);
  assert.match(reading, /class="[^"]*report-gauge[^"]*"/);
  assert.match(reading, /class="[^"]*report-gauge-track[^"]*"/);
  assert.match(reading, /class="[^"]*report-gauge-band[^"]*"/);
  assert.match(reading, /class="[^"]*report-gauge-marker[^"]*"/);
  assert.match(reading, /62%/);
  assert.match(reading, /faixa\s*50/);
  assert.match(reading, /cobertura\s*80%/);

  const withoutIndex = htmlFor();
  const gapReading = readingSection(withoutIndex);
  assert.match(gapReading, /class="[^"]*report-gauge[^"]*"|class="[^"]*report-gauge-gap[^"]*"/);
  assert.match(gapReading, /class="report-gap"|report-gauge-gap/);
  assert.doesNotMatch(gapReading, /\b(?:13|24|45|55|100)%\b/);
  assert.doesNotMatch(gapReading, /class="[^"]*report-gauge-marker[^"]*"/);
});

test('Fatia técnica/organizacional ganha gauge só quando o domínio publicou a faixa', () => {
  const organizational = parentOf({ 'leadership-management': peaked(1) });
  const partial = htmlFor({
    index: {
      published: true,
      index: 62,
      band: [50, 75],
      coverage: 0.8,
      leaves: [
        { id: 'leadership-management', distribution: peaked(1) },
        { id: 'not-in-the-map', distribution: peaked(4) },
      ],
    },
  });
  assert.match(partial, new RegExp(`Maturidade organizacional[\\s\\S]*${organizational.index}%`));
  assert.match(partial, /report-slice[\s\S]*report-gauge/);
  assert.match(partial, new RegExp(`class="[^"]*report-gauge[^"]*"[\\s\\S]*${organizational.index}%|${organizational.index}%[\\s\\S]*report-gauge`));
  assert.match(partial, /ainda não publica a maturidade técnica/);
  const technicalGap = /report-slice[\s\S]*ainda não publica a maturidade técnica[\s\S]*?(?=report-slice|<\/ul>)/.exec(partial)?.[0]
    ?? partial.slice(partial.indexOf('ainda não publica a maturidade técnica') - 80, partial.indexOf('ainda não publica a maturidade técnica') + 200);
  assert.doesNotMatch(technicalGap, /class="[^"]*report-gauge-marker[^"]*"/);
  assert.doesNotMatch(technicalGap, /(?<![\d.])0%|(?<![\d.])100%/);

  const completeTech = parentOf({
    'product-direction': peaked(3),
    'continuous-integration': peaked(3),
    'reliability-practice': peaked(3),
  });
  const completeOrg = parentOf({ 'team-ownership': peaked(1) });
  const complete = htmlFor({
    index: {
      published: true,
      index: 62,
      band: [50, 75],
      coverage: 0.8,
      leaves: [
        { id: 'product-direction', distribution: peaked(3) },
        { id: 'continuous-integration', distribution: peaked(3) },
        { id: 'reliability-practice', distribution: peaked(3) },
        { id: 'team-ownership', distribution: peaked(1) },
      ],
    },
  });
  assert.match(complete, new RegExp(`Maturidade técnica[\\s\\S]*${completeTech.index}%`));
  assert.match(complete, new RegExp(`Maturidade organizacional[\\s\\S]*${completeOrg.index}%`));
  assert.equal((complete.match(/class="[^"]*report-gauge[^"]*"/g) ?? []).length >= 2, true);
  assert.doesNotMatch(complete, /Maturidade técnica 0%/);
  assert.doesNotMatch(complete, /Maturidade organizacional 100%/);
});

test('Sem magnitudes publicáveis mantém texto ou lacuna; com magnitudes desenha barra + pontos de distância', () => {
  const textOnly = htmlFor({
    perspectiveGaps: [{
      title: 'Fluxo de entrega',
      strongerProfiles: ['Gestão'],
      constrainedProfiles: ['Engenharia'],
    }],
  });
  const textSection = divergencesSection(textOnly);
  assert.match(textSection, /Gestão/);
  assert.match(textSection, /Engenharia/);
  assert.doesNotMatch(textSection, /class="[^"]*report-divergence-bar[^"]*"/);
  assert.doesNotMatch(textSection, /\b55%/);
  assert.doesNotMatch(textSection, /pontos de distância/);

  const gapOnly = htmlFor({ perspectiveGaps: [] });
  const gapSection = divergencesSection(gapOnly);
  assert.match(gapSection, /class="report-gap"/);
  assert.doesNotMatch(gapSection, /class="[^"]*report-divergence-bar[^"]*"/);
  assert.doesNotMatch(gapSection, /\b55%/);
  assert.doesNotMatch(gapSection, /pontos de distância/);

  const base = minimalLaudo();
  const withMagnitudes = {
    ...base,
    divergences: [{
      title: 'Fluxo de entrega',
      left: 'Gestão descreve um sistema mais folgado.',
      right: 'Engenharia descreve a restrição.',
      leftMagnitude: 70,
      rightMagnitude: 48,
      distancePoints: 22,
    }],
  } as DiagnosticLaudo;
  const barHtml = render(withMagnitudes);
  const barSection = divergencesSection(barHtml);
  assert.match(barSection, /class="[^"]*report-divergence-bar[^"]*"/);
  assert.match(barSection, /22 pontos de distância/);
  assert.match(barSection, /70%/);
  assert.match(barSection, /48%/);
  assert.doesNotMatch(barSection, /\b55%/);
  assert.doesNotMatch(barSection, /36 pontos de distância/);
});

test('Prognóstico sempre renderiza Sem tratamento | Com tratamento; números/gauge só se publicados', () => {
  const served = layout('Laudo', '');
  assert.match(
    served,
    /\.report-prognosis\b[^{]*\{[^}]*grid-template-columns:\s*repeat\(2,/,
  );

  const html = htmlFor();
  const section = prognosisSection(html);
  assert.match(section, /class="[^"]*report-prognosis[^"]*"/);
  assert.match(section, /Sem tratamento/);
  assert.match(section, /Com tratamento/);
  assert.match(section, /class="report-gap"/);
  assert.doesNotMatch(section, /\b(?:13|22|24|33)%\b/);
  assert.doesNotMatch(section, /class="[^"]*report-gauge-marker[^"]*"/);

  const withPublishedSides = {
    ...minimalLaudo(),
    prognosis: {
      withoutTreatment: { index: 41, band: [25, 50] as [number, number], coverage: 0.7 },
      withTreatment: { index: 58, band: [50, 75] as [number, number], coverage: 0.7 },
    },
  } as unknown as DiagnosticLaudo;
  const published = render(withPublishedSides);
  const publishedSection = prognosisSection(published);
  assert.match(publishedSection, /Sem tratamento/);
  assert.match(publishedSection, /Com tratamento/);
  assert.match(publishedSection, /41%/);
  assert.match(publishedSection, /58%/);
  assert.match(publishedSection, /class="[^"]*report-gauge[^"]*"/);
  assert.doesNotMatch(publishedSection, /\b(?:13|22|24|33)%\b/);
});

test('Restrição publicada vira cartão accent-soft com título destacado; métrica lateral só se existir no laudo', () => {
  const served = layout('Laudo', '');
  const cardCss = cssRuleFor(served, 'report-constraint');
  assert.match(cardCss, /background:\s*var\(--accent-soft\)/);
  assert.match(cardCss, /border:[^;]*var\(--accent\)/);
  const titleCss = cssRuleFor(served, 'report-constraint-title');
  assert.match(titleCss, /font-size:\s*40px/);
  assert.match(titleCss, /Newsreader|Georgia|serif/);

  const html = htmlFor();
  const section = constraintSection(html);
  assert.match(section, /class="[^"]*report-constraint[^"]*"/);
  assert.match(section, /Aprovação de mudança|Mudanças prontas/);
  assert.doesNotMatch(section, /6 a 15 dias/);
  assert.doesNotMatch(section, /class="[^"]*report-constraint-metric[^"]*"/);

  const withMetric = {
    ...minimalLaudo(),
    constraint: {
      title: 'Aprovação de mudança',
      body: 'Mudanças prontas esperam aprovação. Sem aliviar a fila o restante raramente melhora.',
      metric: '9 a 12 dias',
    },
  } as DiagnosticLaudo;
  const metricHtml = render(withMetric);
  const metricSection = constraintSection(metricHtml);
  assert.match(metricSection, /class="[^"]*report-constraint-metric[^"]*"/);
  assert.match(metricSection, /9 a 12 dias/);
  assert.doesNotMatch(metricSection, /6 a 15 dias/);

  const gapHtml = htmlFor({
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
  const gapSection = constraintSection(gapHtml);
  assert.match(gapSection, /class="report-gap"/);
  assert.doesNotMatch(gapSection, /6 a 15 dias/);
  assert.doesNotMatch(gapSection, /class="[^"]*report-constraint-metric[^"]*"/);
});

test('Onda 4 não copia Orbital nem 13%/24%', () => {
  const fixtures = [
    htmlFor({ index: publishedIndex }),
    htmlFor({
      perspectiveGaps: [{
        title: 'Fluxo de entrega',
        strongerProfiles: ['Gestão'],
        constrainedProfiles: ['Engenharia'],
      }],
    }),
    htmlFor(),
    htmlFor({
      index: {
        published: true,
        index: 62,
        band: [50, 75],
        coverage: 0.8,
        leaves: [
          { id: 'leadership-management', distribution: peaked(1) },
          { id: 'not-in-the-map', distribution: peaked(4) },
        ],
      },
    }),
  ];
  for (const html of fixtures) {
    assert.doesNotMatch(html, /Orbital/);
    assert.doesNotMatch(html, /\b13%/);
    assert.doesNotMatch(html, /\b24%/);
  }
  const textDivergence = divergencesSection(fixtures[1]!);
  assert.doesNotMatch(textDivergence, /\b55%/);
});
