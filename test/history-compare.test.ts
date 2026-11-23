/**
 * Histórico comparador visual (CONTRATO_OK, fase 11).
 * previousReading/currentReading + .history-compare / .history-change-grid.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { projectHistoryComparison } from '../src/modules/inference/domain/reading-history.js';
import type { HistoryPage, IndexReading } from '../src/modules/inference/domain/reading-history.js';
import { renderHistoryPage } from '../src/modules/projects/diagnostic-report-view.js';
import type { StageDistribution } from '../src/modules/measurement/domain/measurement-params.js';

const peaked = (stage: 0 | 1 | 2 | 3 | 4): StageDistribution => (
  [0, 1, 2, 3, 4].map((item) => (item === stage ? 1 : 0)) as unknown as StageDistribution
);

type PublishedReading = {
  label: string;
  index: number;
  band: [number, number];
  target?: number;
};

type HistoryComparePage = HistoryPage & {
  previousReading?: PublishedReading;
  currentReading?: PublishedReading;
};

function reading(partial: Pick<IndexReading, 'id' | 'label' | 'index' | 'band'> & Partial<IndexReading>): IndexReading {
  return { ...partial };
}

function changeColumn(html: string, heading: 'Melhorou' | 'Piorou'): string {
  const gridStart = html.indexOf('history-change-grid');
  assert.ok(gridStart >= 0, 'history-change-grid ausente');
  const gridHtml = html.slice(gridStart);
  const headingRe = new RegExp(`>(\\s*)${heading}(\\s*)<`);
  const headingMatch = headingRe.exec(gridHtml);
  assert.ok(headingMatch, `coluna ${heading} ausente`);
  const from = headingMatch.index;
  const nextHeading = />(\s*)(Melhorou|Piorou)(\s*)</.exec(gridHtml.slice(from + heading.length));
  const other = nextHeading && nextHeading[2] !== heading
    ? from + heading.length + (nextHeading.index ?? 0)
    : undefined;
  return gridHtml.slice(from, other);
}

test('duas leituras publicam previousReading e currentReading com label index band e target opcional', () => {
  const withTarget = projectHistoryComparison({
    readings: [
      reading({ id: 'antes', label: 'Março', index: 20, band: [10, 30], target: 28, distribution: peaked(1) }),
      reading({ id: 'agora', label: 'Outubro', index: 70, band: [60, 80], distribution: peaked(3) }),
    ],
  }) as HistoryComparePage;
  assert.deepEqual(withTarget.previousReading, { label: 'Março', index: 20, band: [10, 30], target: 28 });
  assert.deepEqual(withTarget.currentReading, { label: 'Outubro', index: 70, band: [60, 80] });
  assert.equal(withTarget.currentReading?.target, undefined);
  assert.equal(withTarget.gap, undefined);

  const bothTargets = projectHistoryComparison({
    readings: [
      reading({ id: 'antes', label: 'Março', index: 20, band: [10, 30], target: 28, distribution: peaked(1) }),
      reading({ id: 'agora', label: 'Outubro', index: 70, band: [60, 80], target: 41, distribution: peaked(3) }),
    ],
  }) as HistoryComparePage;
  assert.equal(bothTargets.previousReading?.target, 28);
  assert.equal(bothTargets.currentReading?.target, 41);

  const gap = projectHistoryComparison({
    readings: [reading({ id: 'agora', label: 'Outubro', index: 40, band: [30, 50] })],
  }) as HistoryComparePage;
  assert.match(gap.gap ?? '', /duas leituras/);
  assert.equal(gap.previousReading, undefined);
  assert.equal(gap.currentReading, undefined);
});

test('renderHistoryPage com par desenha history-compare com dois percentuais e faixas', () => {
  const page = projectHistoryComparison({
    readings: [
      reading({ id: 'antes', label: 'Março', index: 20, band: [10, 30], distribution: peaked(1) }),
      reading({ id: 'agora', label: 'Outubro', index: 70, band: [60, 80], distribution: peaked(3) }),
    ],
  }) as HistoryComparePage;
  const html = renderHistoryPage(page);
  assert.match(html, /class="[^"]*\bhistory-compare\b/);
  assert.match(html, /Comparação/);
  assert.match(html, /Março/);
  assert.match(html, /Outubro/);
  assert.match(html, /20%/);
  assert.match(html, /70%/);
  assert.match(html, /faixa\s*10\s*[–-]\s*30%/);
  assert.match(html, /faixa\s*60\s*[–-]\s*80%/);
  assert.doesNotMatch(html, /Orbital/);
  assert.doesNotMatch(html, /0 a 60%/);

  const gapHtml = renderHistoryPage(projectHistoryComparison({
    readings: [reading({ id: 'agora', label: 'Outubro', index: 40, band: [30, 50] })],
  }));
  assert.doesNotMatch(gapHtml, /class="[^"]*\bhistory-compare\b/);
});

test('trilho dual history-compare-bands marca bandas e estimativas na escala 0-100', () => {
  const page = projectHistoryComparison({
    readings: [
      reading({ id: 'antes', label: 'Março', index: 20, band: [10, 30], distribution: peaked(1) }),
      reading({ id: 'agora', label: 'Outubro', index: 70, band: [60, 80], distribution: peaked(3) }),
    ],
  }) as HistoryComparePage;
  const html = renderHistoryPage(page);
  assert.match(html, /class="[^"]*\bhistory-compare-bands\b/);
  assert.match(html, /left:\s*10%/);
  assert.match(html, /width:\s*20%/);
  assert.match(html, /left:\s*60%/);
  assert.match(html, /width:\s*20%/);
  assert.match(html, /left:\s*20%/);
  assert.match(html, /left:\s*70%/);
  assert.doesNotMatch(html, /0 a 60%/);

  const gapHtml = renderHistoryPage(projectHistoryComparison({
    readings: [reading({ id: 'agora', label: 'Outubro', index: 40, band: [30, 50] })],
  }));
  assert.doesNotMatch(gapHtml, /class="[^"]*\bhistory-compare-bands\b/);
});

test('linha de alvo no comparador só com target nas duas fotografias', () => {
  const both = projectHistoryComparison({
    readings: [
      reading({ id: 'antes', label: 'Março', index: 20, band: [10, 30], target: 28, distribution: peaked(1) }),
      reading({ id: 'agora', label: 'Outubro', index: 70, band: [60, 80], target: 41, distribution: peaked(3) }),
    ],
  }) as HistoryComparePage;
  const bothHtml = renderHistoryPage(both);
  assert.match(bothHtml, /class="[^"]*\bhistory-compare-target\b/);
  assert.match(bothHtml, /left:\s*28%/);
  assert.match(bothHtml, /left:\s*41%/);
  assert.equal(bothHtml.includes('45%'), false);

  const onlyPrevious = projectHistoryComparison({
    readings: [
      reading({ id: 'antes', label: 'Março', index: 20, band: [10, 30], target: 28, distribution: peaked(1) }),
      reading({ id: 'agora', label: 'Outubro', index: 70, band: [60, 80], distribution: peaked(3) }),
    ],
  }) as HistoryComparePage;
  const onlyPreviousHtml = renderHistoryPage(onlyPrevious);
  assert.doesNotMatch(onlyPreviousHtml, /class="[^"]*\bhistory-compare-target\b/);
  assert.equal(onlyPreviousHtml.includes('45%'), false);
  assert.equal(onlyPreviousHtml.includes('28%'), false);

  const onlyCurrent = projectHistoryComparison({
    readings: [
      reading({ id: 'antes', label: 'Março', index: 20, band: [10, 30], distribution: peaked(1) }),
      reading({ id: 'agora', label: 'Outubro', index: 70, band: [60, 80], target: 41, distribution: peaked(3) }),
    ],
  }) as HistoryComparePage;
  const onlyCurrentHtml = renderHistoryPage(onlyCurrent);
  assert.doesNotMatch(onlyCurrentHtml, /class="[^"]*\bhistory-compare-target\b/);
  assert.equal(onlyCurrentHtml.includes('45%'), false);
  assert.equal(onlyCurrentHtml.includes('41%'), false);

  const none = projectHistoryComparison({
    readings: [
      reading({ id: 'antes', label: 'Março', index: 20, band: [10, 30], distribution: peaked(1) }),
      reading({ id: 'agora', label: 'Outubro', index: 70, band: [60, 80], distribution: peaked(3) }),
    ],
  }) as HistoryComparePage;
  const noneHtml = renderHistoryPage(none);
  assert.doesNotMatch(noneHtml, /class="[^"]*\bhistory-compare-target\b/);
  assert.equal(noneHtml.includes('45%'), false);
});

test('history-change-grid Melhorou e Piorou a partir de evolution.nodes', () => {
  const page = projectHistoryComparison({
    readings: [
      reading({
        id: 'antes',
        label: 'Março',
        index: 40,
        band: [30, 50],
        distribution: peaked(2),
        context: {
          findingPatterns: [],
          units: [],
          capabilities: [
            { id: 'incident-response', label: 'Resposta a incidente', distribution: peaked(1) },
            { id: 'observability-practice', label: 'Observabilidade', distribution: peaked(3) },
          ],
        },
      }),
      reading({
        id: 'agora',
        label: 'Outubro',
        index: 70,
        band: [60, 80],
        distribution: peaked(3),
        context: {
          findingPatterns: [],
          units: [],
          capabilities: [
            { id: 'incident-response', label: 'Resposta a incidente', distribution: peaked(3) },
            { id: 'observability-practice', label: 'Observabilidade', distribution: peaked(1) },
          ],
        },
      }),
    ],
  }) as HistoryComparePage;
  assert.ok(page.evolution?.nodes.some((node) => node.label === 'Resposta a incidente' && node.state === 'advanced'));
  assert.ok(page.evolution?.nodes.some((node) => node.label === 'Observabilidade' && node.state === 'regressed'));
  assert.ok(page.evolution?.nodes.some((node) => node.label === 'Índice da organização' && node.state === 'advanced'));

  const html = renderHistoryPage(page);
  assert.match(html, /class="[^"]*\bhistory-change-grid\b/);
  assert.match(html, /Melhorou/);
  assert.match(html, /Piorou/);
  const improved = changeColumn(html, 'Melhorou');
  const regressed = changeColumn(html, 'Piorou');
  assert.equal(improved.includes('Resposta a incidente'), true);
  assert.equal(improved.includes('Índice da organização'), true);
  assert.equal(improved.includes('Observabilidade'), false);
  assert.equal(regressed.includes('Observabilidade'), true);
  assert.equal(regressed.includes('Resposta a incidente'), false);
});

test('sem evolution nao inventa listas de folhas no change-grid', () => {
  const page = projectHistoryComparison({
    readings: [
      reading({ id: 'antes', label: 'Março', index: 20, band: [10, 30] }),
      reading({ id: 'agora', label: 'Outubro', index: 70, band: [60, 80] }),
    ],
  }) as HistoryComparePage;
  assert.equal(page.evolution, undefined);
  assert.ok(page.previousReading);
  assert.ok(page.currentReading);
  const html = renderHistoryPage(page);
  assert.match(html, /class="[^"]*\bhistory-compare\b/);
  assert.match(html, /class="[^"]*\bhistory-change-grid\b/);
  assert.match(html, /Melhorou/);
  assert.match(html, /Piorou/);
  const improved = changeColumn(html, 'Melhorou');
  const regressed = changeColumn(html, 'Piorou');
  assert.match(improved, /report-gap/);
  assert.match(regressed, /report-gap/);
  assert.doesNotMatch(html, /Resposta a incidente|Observabilidade|Orbital/);
  assert.match(html, /Melhorou: P\(melhora\)|Piorou: P\(piora\)|Estável:|Incerto:/);
});

test('gap de duas leituras nao inventa comparador nem mock Orbital', () => {
  const page = projectHistoryComparison({
    readings: [reading({ id: 'agora', label: 'Outubro', index: 40, band: [30, 50] })],
  }) as HistoryComparePage;
  assert.match(page.gap ?? '', /duas leituras/);
  assert.equal(page.previousReading, undefined);
  assert.equal(page.currentReading, undefined);
  const html = renderHistoryPage(page);
  assert.doesNotMatch(html, /class="[^"]*\bhistory-compare\b/);
  assert.doesNotMatch(html, /class="[^"]*\bhistory-change-grid\b/);
  assert.doesNotMatch(html, /class="[^"]*\bhistory-compare-bands\b/);
  assert.equal(html.includes('Orbital'), false);
  assert.equal(html.includes('13%'), false);
  assert.equal(html.includes('24%'), false);
  assert.equal(html.includes('45%'), false);
});

test('mantem seletor P change targetChip evolution findings e caution Atenção', () => {
  const page = projectHistoryComparison({
    readings: [
      reading({
        id: 'a',
        label: 'Março',
        index: 20,
        band: [10, 30],
        target: 28,
        distribution: peaked(1),
        context: {
          findingPatterns: ['dependencia-de-heroi'],
          units: [{ id: 'antigo', label: 'Time antigo' }],
        },
      }),
      reading({ id: 'b', label: 'Junho', index: 40, band: [30, 50], distribution: peaked(2) }),
      reading({
        id: 'c',
        label: 'Outubro',
        index: 70,
        band: [60, 80],
        target: 41,
        distribution: peaked(3),
        context: {
          findingPatterns: ['espera-normalizada'],
          units: [{ id: 'novo', label: 'Time novo' }],
          unitLinks: [{ previousId: 'antigo', currentIds: ['novo'], kind: 'renamed' }],
          treatedConduct: 'Plantão com rodízio',
        },
      }),
    ],
    previousId: 'a',
  }) as HistoryComparePage;
  assert.equal(page.options.length, 2);
  assert.equal(page.targetChip, 'alvo 28% · 41%');
  assert.equal(page.change, 'improved');
  assert.ok(page.pImprove !== undefined && page.pRegress !== undefined);
  assert.ok(page.evolution);
  const html = renderHistoryPage(page);
  assert.match(html, /aria-label="Leitura anterior"/);
  assert.match(html, /Março/);
  assert.match(html, /Junho/);
  assert.match(html, /P\(melhora\)/);
  assert.match(html, /P\(piora\)/);
  assert.match(html, /P\(estável\)/);
  assert.equal(html.includes(page.targetChip!), true);
  assert.match(html, /Achados encerrados: dependencia-de-heroi/);
  assert.match(html, /Achados novos: espera-normalizada/);
  assert.match(html, /renomeada/);
  assert.match(html, /Atenção/);
  assert.match(html, /class="[^"]*\bhistory-compare\b/);
  assert.match(html, /class="[^"]*\bhistory-change-grid\b/);
  assert.doesNotMatch(html, /Orbital/);
  assert.equal(html.includes('45%'), false);
});
