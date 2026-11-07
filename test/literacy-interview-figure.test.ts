import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { literacyWipChart } from '../src/modules/catalog/item-catalog.js';
import type { LiteracyItem } from '../src/modules/catalog/item-types.js';
import { renderInterviewQuestion } from '../src/modules/assessments/interview-view.js';
import { projectInterviewStep } from '../src/modules/assessments/domain/interview-step.js';
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
    kicker: projectInterviewStep({ id: 'literacy-wip-chart' }).kicker,
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

function figureMarkup(html: string): string {
  return html.match(/<figure[\s\S]*?<\/figure>/i)?.[0] ?? '';
}

function catalogDerivedNumbers(series: LiteracySeries): Set<number> {
  const weekCount = Math.max(0, ...series.stages.map((stage) => series.values[stage]?.length ?? 0));
  const stackBottomFirst = [...series.stages].reverse();
  const allowed = new Set<number>();
  for (let week = 0; week < weekCount; week += 1) {
    allowed.add(week + 1);
    let cumulative = 0;
    for (const stage of stackBottomFirst) {
      const value = Number(series.values[stage]?.[week] ?? 0);
      allowed.add(value);
      cumulative += value;
      allowed.add(cumulative);
    }
  }
  return allowed;
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

test('figura de leitura usa área empilhada, figcaption, fills por etapa e SVG como img', () => {
  const series = publishedOrFixtureSeries(literacyWipChart);
  const html = renderReading(series, literacyWipChart.stimulus);
  const figure = figureMarkup(html);

  assert.match(html, /class="interview-kicker">Leitura de quadro</);
  assert.match(figure, /class="reading-stimulus"/);
  assert.match(figure, /<figcaption[\s>]/i);
  assert.match(figure, /<svg[^>]*role="img"[^>]*aria-label=/i);
  assert.doesNotMatch(figure, /<figure[^>]*role="img"/i);
  assert.doesNotMatch(figure, /polyline|stroke="currentColor"/i);
  for (const fill of ['var(--accent)', 'var(--ochre)', 'var(--ink3)', 'var(--na)']) {
    assert.match(figure, new RegExp(`fill="${escapeRegExp(fill)}"`, 'i'));
  }
  const exposedList = figure.match(/<ul(?![^>]*aria-hidden)[^>]*>[\s\S]*?<\/ul>/i);
  assert.equal(exposedList, null, 'lista de legendas não pode expor listitems sem aria-hidden');

  const styles = readFileSync(new URL('../src/shared/html.ts', import.meta.url), 'utf8');
  assert.match(styles, /\.reading-stimulus\s*\{[^}]*border-(?:top|bottom):[^;]*var\(--rule\)/);
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

  const figure = figureMarkup(html) || html.match(/<svg[\s\S]*?<\/svg>/i)?.[0] || '';
  assert.ok(figure.length > 0, 'precisa haver figura ou svg da série');

  const numbers = [...figure.matchAll(/\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
  const allowed = catalogDerivedNumbers(fixture);
  for (const value of numbers) {
    if (value === 0) continue;
    assert.ok(
      allowed.has(value),
      `número ${value} não deriva da série publicada nem da contagem de semanas`,
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
