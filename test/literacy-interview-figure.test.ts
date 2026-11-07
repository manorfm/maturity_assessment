import assert from 'node:assert/strict';
import { test } from 'node:test';
import { literacyWipChart } from '../src/modules/catalog/item-catalog.js';
import type { LiteracyItem } from '../src/modules/catalog/item-types.js';
import { renderInterviewQuestion } from '../src/modules/assessments/interview-view.js';
import { escapeHtml } from '../src/shared/html.js';

type LiteracySeries = {
  stages: readonly string[];
  values: Readonly<Record<string, readonly number[]>>;
};

function publishedOrFixtureSeries(item: LiteracyItem): LiteracySeries {
  const candidate = item as LiteracyItem & { series?: LiteracySeries };
  if (candidate.series) return candidate.series;
  return {
    stages: ['Aguardando teste', 'Concluído'],
    values: {
      'Aguardando teste': [1, 3, 5, 7, 9, 11, 14, 16],
      Concluído: [2, 2, 2, 2, 2, 3, 3, 3],
    },
  };
}

function renderReading(series: LiteracySeries, ariaLabel: string): string {
  return renderInterviewQuestion({
    kicker: 'Leitura',
    title: literacyWipChart.title,
    lead: literacyWipChart.scenario,
    why: 'O quadro é um estímulo. Não é o quadro do seu time.',
    prompt: literacyWipChart.prompt,
    progressLabel: 'cerca de 10 minutos restantes',
    progressPercent: 35,
    action: '/respond/token',
    options: literacyWipChart.readings.map((reading) => ({ id: reading.id, label: reading.label })),
    nodeId: literacyWipChart.id,
    kind: 'reading',
    readingFigure: {
      ariaLabel,
      stages: series.stages,
      values: series.values,
    },
  } as Parameters<typeof renderInterviewQuestion>[0]);
}

test('pergunta de leitura renderiza figura a partir da série publicada com aria-label do stimulus', () => {
  const series = publishedOrFixtureSeries(literacyWipChart);
  const html = renderReading(series, literacyWipChart.stimulus);

  assert.match(html, /<figure[\s>]|<svg[\s>]|role="img"/i);
  assert.match(html, new RegExp(`aria-label="${escapeRegExp(escapeHtml(literacyWipChart.stimulus))}"`, 'i'));
  for (const stage of series.stages) {
    assert.match(html, new RegExp(escapeRegExp(stage), 'i'));
  }
});

test('renderização de leitura não inventa números fora do catálogo', () => {
  const fixture: LiteracySeries = {
    stages: ['Aguardando teste', 'Concluído'],
    values: {
      'Aguardando teste': [2, 4, 7],
      Concluído: [3, 3, 4],
    },
  };
  const ariaLabel = 'Estímulo de fixture mínima.';
  const html = renderReading(fixture, ariaLabel);

  assert.match(html, /<figure[\s>]|<svg[\s>]|role="img"/i);
  assert.doesNotMatch(html, /Orbital|13%|45%/);
  assert.doesNotMatch(html, /\bM0,200 L40,180\b/);

  const figure = html.match(/<figure[\s\S]*?<\/figure>|<svg[\s\S]*?<\/svg>/i)?.[0] ?? '';
  assert.ok(figure.length > 0, 'precisa haver figura ou svg da série');

  const numbers = [...figure.matchAll(/\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
  const allowed = new Set(
    Object.values(fixture.values).flatMap((week) => week.map(Number)),
  );
  for (const value of numbers) {
    if (value === 0) continue;
    assert.ok(
      allowed.has(value) || value <= fixture.values['Aguardando teste']!.length,
      `número ${value} não pertence à série publicada nem à contagem de semanas`,
    );
  }
  assert.equal(
    fixture.values['Aguardando teste']!.length,
    fixture.values.Concluído!.length,
  );
});

test('passo que não é leitura não exige figura do estímulo', () => {
  const html = renderInterviewQuestion({
    kicker: 'O que aconteceu',
    title: 'Última mudança',
    lead: 'Pense no caso mais recente.',
    why: 'Não precisa ser a mais grave.',
    prompt: 'O que aconteceu primeiro?',
    progressLabel: 'cerca de 12 minutos restantes',
    progressPercent: 20,
    action: '/respond/token',
    options: [{ id: 'a', label: 'Esperamos outra área.' }],
  });
  assert.doesNotMatch(html, /role="img"|reading-stimulus|literacy-stimulus/i);
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
