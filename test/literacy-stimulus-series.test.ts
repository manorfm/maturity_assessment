import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  itemCatalog,
  literacyWipChart,
} from '../src/modules/catalog/item-catalog.js';
import type { LiteracyItem } from '../src/modules/catalog/item-types.js';
import { auditItemCatalog } from '../src/modules/catalog/item-type-audit.js';
import { aggregateLiteracy } from '../src/modules/inference/domain/literacy-aggregate.js';

type LiteracySeries = {
  stages: readonly string[];
  values: Readonly<Record<string, readonly number[]>>;
};

function publishedSeries(item: LiteracyItem): LiteracySeries {
  const candidate = item as LiteracyItem & { series?: LiteracySeries };
  assert.ok(candidate.series, 'item de leitura precisa publicar series');
  return candidate.series;
}

function stageValues(series: LiteracySeries, pattern: RegExp): readonly number[] {
  const name = series.stages.find((stage) => pattern.test(stage));
  assert.ok(name, `série precisa de etapa que case ${pattern}`);
  const values = series.values[name];
  assert.ok(values, `série precisa de valores para ${name}`);
  return values;
}

function growth(values: readonly number[]): number {
  return values[values.length - 1]! - values[0]!;
}

test('item de leitura publica etapas nomeadas e série semanal coerente com o stimulus', () => {
  const series = publishedSeries(literacyWipChart);
  assert.ok(series.stages.length >= 1);
  assert.ok(series.stages.some((stage) => /aguardando teste/i.test(stage)));
  assert.ok(series.stages.some((stage) => /conclu[ií]do/i.test(stage)));

  const lengths = series.stages.map((stage) => {
    const values = series.values[stage];
    assert.ok(values, `faltam valores para a etapa ${stage}`);
    return values.length;
  });
  assert.ok(lengths.every((length) => length === lengths[0]));
  assert.ok(lengths[0]! >= 2);
  assert.equal(lengths[0], 8, 'scenario vigente fala em oito semanas');

  const waiting = stageValues(series, /aguardando teste/i);
  const done = stageValues(series, /conclu[ií]do/i);
  assert.ok(waiting[waiting.length - 1]! > waiting[0]!);
  const doneGrowth = growth(done);
  const waitingGrowth = growth(waiting);
  assert.ok(doneGrowth <= 1 || doneGrowth < waitingGrowth);
});

test('auditoria item-type rejeita leitura sem série ou com série que contradiz o stimulus', () => {
  const readings = literacyWipChart.readings;
  const stimulus = literacyWipChart.stimulus;

  const withoutSeries: LiteracyItem = {
    id: 'literacy-missing-series-fixture',
    kind: 'literacy',
    title: 'Sem série',
    scenario: 'Um quadro ao longo de semanas.',
    prompt: 'O que faria?',
    stimulus,
    readings,
  };
  const missing = auditItemCatalog([withoutSeries]);
  assert.ok(
    missing.some((issue) => issue.code === 'literacy-missing-series' && issue.severity === 'error'),
    'leitura sem série deve emitir literacy-missing-series',
  );

  const incoherent: LiteracyItem & { series: LiteracySeries } = {
    id: 'literacy-incoherent-series-fixture',
    kind: 'literacy',
    title: 'Série incoerente',
    scenario: 'Um quadro ao longo de semanas.',
    prompt: 'O que faria?',
    stimulus,
    readings,
    series: {
      stages: ['A fazer', 'Aguardando teste', 'Concluído'],
      values: {
        'A fazer': [4, 4, 4],
        'Aguardando teste': [2, 2, 2],
        Concluído: [1, 5, 9],
      },
    },
  };
  const bad = auditItemCatalog([incoherent as LiteracyItem]);
  assert.ok(
    bad.some((issue) => issue.code === 'literacy-series-incoherent-with-stimulus' && issue.severity === 'error'),
    'série que contradiz o stimulus deve emitir literacy-series-incoherent-with-stimulus',
  );

  const reference = auditItemCatalog(itemCatalog);
  assert.equal(
    reference.filter((issue) =>
      issue.severity === 'error'
      && (issue.code === 'literacy-missing-series' || issue.code === 'literacy-series-incoherent-with-stimulus'),
    ).length,
    0,
    'catálogo de referência não deve falhar a coerência da série',
  );
});

test('série do estímulo não altera vereditos nem aggregateLiteracy', () => {
  assert.equal(literacyWipChart.readings.find((item) => item.id === 'stop-starting')?.verdict, 'correct');
  assert.equal(literacyWipChart.readings.find((item) => item.id === 'cannot-read')?.verdict, 'literacy-absent');
  assert.ok(literacyWipChart.readings.some((item) => item.verdict === 'incorrect'));

  const published = aggregateLiteracy({
    answers: [
      { optionId: 'stop-starting' },
      { optionId: 'stop-starting' },
      { optionId: 'faster-dev' },
      { optionId: 'hire-devs' },
      { optionId: 'cannot-read' },
    ],
    minimum: 5,
    readings: literacyWipChart.readings,
  });
  assert.equal(published.published, true);
  assert.equal(published.n, 5);
  assert.equal(published.correctRate, 0.4);
  assert.equal(published.absentRate, 0.2);
  assert.equal(published.incorrectRate, 0.4);
  assert.equal('series' in published, false);
  assert.equal('stages' in published, false);
  assert.equal('values' in published, false);
});
