import assert from 'node:assert/strict';
import { test } from 'node:test';
import { projectHistoryComparison } from '../src/modules/inference/domain/reading-history.js';
import { renderHistoryPage } from '../src/modules/projects/diagnostic-report-view.js';
import { layout } from '../src/shared/html.js';
import type { IndexReading } from '../src/modules/inference/domain/reading-history.js';
import type { StageDistribution } from '../src/modules/measurement/domain/measurement-params.js';

const peaked = (stage: 0 | 1 | 2 | 3 | 4): StageDistribution => (
  [0, 1, 2, 3, 4].map((item) => (item === stage ? 1 : 0)) as unknown as StageDistribution
);

function reading(partial: Pick<IndexReading, 'id' | 'label' | 'index' | 'band'> & Partial<IndexReading>): IndexReading {
  return { ...partial };
}

test('uma leitura só publica a lacuna, sem seletor e sem melhora', () => {
  const page = projectHistoryComparison({
    readings: [reading({ id: 'now', label: 'Outubro', index: 40, band: [30, 50] })],
  });
  assert.match(page.gap ?? '', /duas leituras/);
  assert.equal(page.options.length, 0);
  const html = renderHistoryPage(page);
  assert.match(html, /duas leituras/);
  assert.doesNotMatch(html, /aria-label="Leitura anterior"/);
  assert.doesNotMatch(html, /Melhorou: P\(melhora\)/);
});

test('com mais de uma leitura anterior o seletor escolhe a fotografia comparada', () => {
  const page = projectHistoryComparison({
    readings: [
      reading({
        id: 'a',
        label: 'Março',
        index: 20,
        band: [10, 30],
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
  });
  assert.equal(page.options.length, 2);
  assert.equal(page.options.find((item) => item.selected)?.id, 'a');
  assert.equal(page.change, 'improved');
  assert.match(page.caution, /não prova que a conduta causou/);
  assert.match(page.caution, /Outras mudanças no período/);
  assert.match(page.capabilityGap ?? '', /cada capacidade/);
  const html = renderHistoryPage(page);
  assert.match(html, /aria-label="Leitura anterior"/);
  assert.match(html, /Março/);
  assert.match(html, /Junho/);
  assert.match(html, /Avançou/);
  assert.match(html, /Regrediu/);
  assert.match(html, /Estável/);
  assert.match(html, /Incerto/);
  assert.match(html, /Achados encerrados: dependencia-de-heroi/);
  assert.match(html, /Achados novos: espera-normalizada/);
  assert.match(html, /renomeada/);
  assert.match(html, /após a conduta/);
  assert.doesNotMatch(html, /por causa de/);
  assert.match(html, /Atenção/);
  assert.doesNotMatch(html, /alvo 45|3 pontos/);
});

test('duas leituras com posterior de folha comparam a capacidade e não inventam as demais', () => {
  const page = projectHistoryComparison({
    readings: [
      reading({
        id: 'antes',
        label: 'Março',
        index: 20,
        band: [10, 30],
        distribution: peaked(1),
        context: {
          findingPatterns: [],
          units: [],
          capabilities: [{ id: 'incident-response', label: 'Resposta a incidente', distribution: peaked(1) }],
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
          capabilities: [{ id: 'incident-response', label: 'Resposta a incidente', distribution: peaked(3) }],
        },
      }),
    ],
  });
  assert.equal(page.capabilityGap, undefined);
  assert.equal(page.evolution?.nodes.some((node) => node.label === 'Resposta a incidente' && node.state === 'advanced'), true);
  const html = renderHistoryPage(page);
  assert.match(html, /Resposta a incidente/);
  assert.match(html, /Avançou/);
  assert.doesNotMatch(html, /aria-label="Leitura anterior"/);
  assert.doesNotMatch(html, /por causa de/);
});

test('o chip de alvo só entra quando as duas fotografias guardaram o alvo', () => {
  const stored = (id: string, label: string, stage: 0 | 1 | 2 | 3 | 4, target?: number): IndexReading => reading({
    id,
    label,
    index: stage * 25,
    band: [10, 30],
    distribution: peaked(stage),
    ...(target !== undefined ? { target } : {}),
    context: {
      findingPatterns: [],
      units: [],
      capabilities: [{ id: 'incident-response', label: 'Resposta a incidente', distribution: peaked(stage) }],
    },
  });
  const both = projectHistoryComparison({
    readings: [stored('antes', 'Março', 1, 28), stored('agora', 'Outubro', 3, 41)],
  });
  assert.equal(both.targetChip, 'alvo 28% · 41%');
  assert.equal(both.change, 'improved');
  assert.equal(both.evolution?.nodes.some((node) => node.label === 'Resposta a incidente' && node.state === 'advanced'), true);
  const bothHtml = renderHistoryPage(both);
  assert.equal(bothHtml.includes(both.targetChip!), true);
  assert.equal(bothHtml.includes('45%'), false);
  assert.equal(bothHtml.includes('13%'), false);
  assert.equal(bothHtml.includes('Orbital'), false);

  const none = projectHistoryComparison({
    readings: [stored('antes', 'Março', 1), stored('agora', 'Outubro', 3)],
  });
  assert.equal(none.targetChip, undefined);
  assert.equal(none.change, 'improved');
  assert.equal(none.evolution?.nodes.some((node) => node.label === 'Resposta a incidente' && node.state === 'advanced'), true);
  const noneHtml = renderHistoryPage(none);
  assert.equal(noneHtml.includes('alvo'), false);
  assert.equal(noneHtml.includes('45%'), false);
  assert.equal(noneHtml.includes('13%'), false);
  assert.equal(noneHtml.includes('Orbital'), false);
  assert.equal(noneHtml.includes('Resposta a incidente'), true);

  const onlyPrevious = projectHistoryComparison({
    readings: [stored('antes', 'Março', 1, 28), stored('agora', 'Outubro', 3)],
  });
  assert.equal(onlyPrevious.targetChip, undefined);
  assert.equal(onlyPrevious.change, 'improved');
  assert.equal(renderHistoryPage(onlyPrevious).includes('alvo'), false);

  const onlyCurrent = projectHistoryComparison({
    readings: [stored('antes', 'Março', 1), stored('agora', 'Outubro', 3, 41)],
  });
  assert.equal(onlyCurrent.targetChip, undefined);
  assert.equal(renderHistoryPage(onlyCurrent).includes('alvo'), false);
});

test('o chip de alvo ocupa só a largura do texto', () => {
  const served = layout('Histórico', '');
  const rule = served.match(/\.history-target\s*\{([^}]+)\}/)?.[1]?.replace(/\s+/g, '') ?? '';
  assert.equal(rule.includes('align-self:flex-start') || rule.includes('width:fit-content'), true);
});
