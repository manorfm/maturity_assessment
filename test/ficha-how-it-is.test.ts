/**
 * Ficha 7b — Como está (nuvem 20 + colunas %·faixa·alvo).
 * CONTRATO_OK: projector `{ index, band, cloud }` + view sem stage-distribution.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  projectFichaClose,
  projectHowItIs,
  projectNodeDefinition,
  projectPreserve,
  projectReportedReadings,
  type StageShares,
} from '../src/modules/inference/domain/ficha-node.js';
import { renderNodeCard } from '../src/modules/projects/diagnostic-report-view.js';

const LEGEND =
  'Estágio de 0 a 4 (0 Não existe · 1 Esporádico · 2 Repetível · 3 Consistente · 4 Adaptativo). Cada ponto é 1 de 20 cenários igualmente prováveis: quanto mais espalhados, menos certeza.';

const SHARES: StageShares = [0.05, 0.1, 0.2, 0.4, 0.25];
/** E[S]=2.7 → index 68; credibleBand mass≥0.9 → estágios 1–4 → [25, 100]. */
const SHARES_INDEX = 68;
const SHARES_BAND: [number, number] = [25, 100];

type StageReading = {
  index: number;
  band: [number, number];
  cloud: ReadonlyArray<0 | 1 | 2 | 3 | 4>;
};

type ProjectStageReading = (shares: StageShares) => StageReading;

function minimalCard(how = projectHowItIs({})) {
  return {
    title: 'Entrega',
    trail: [],
    definition: projectNodeDefinition('delivery'),
    how,
    reported: projectReportedReadings({ capabilityIds: ['delivery'], minimum: 5, samples: [], units: [] }),
    preserve: projectPreserve('correct'),
    close: projectFichaClose({}),
  };
}

function sectionHtml(html: string, title: string): string {
  const blocks = [...html.matchAll(/<section class="report-block">([\s\S]*?)<\/section>/g)].map((m) => m[1]!);
  const block = blocks.find((body) => body.includes(title));
  assert.ok(block, `seção "${title}" não encontrada`);
  return block!;
}

/** Maior resto (Hamilton): n cotas a partir de shares, empate pelo menor índice. */
function largestRemainderCounts(shares: StageShares, n = 20): [number, number, number, number, number] {
  const raw = shares.map((share) => share * n);
  const floors = raw.map((value) => Math.floor(value));
  let remaining = n - floors.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, frac: value - floors[index]! }))
    .sort((left, right) => right.frac - left.frac || left.index - right.index);
  const counts = [...floors] as [number, number, number, number, number];
  for (let step = 0; step < remaining; step += 1) {
    const slot = order[step]?.index;
    if (slot === undefined) break;
    counts[slot as 0 | 1 | 2 | 3 | 4] += 1;
  }
  return counts;
}

function countCloudStages(cloud: ReadonlyArray<number>): [number, number, number, number, number] {
  const counts: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  for (const stage of cloud) {
    assert.ok(stage >= 0 && stage <= 4);
    counts[stage as 0 | 1 | 2 | 3 | 4] += 1;
  }
  return counts;
}

function countDotsInCloud(markup: string): number {
  // Só dots: bins aninhados também têm data-stage e fecham o </div> cedo.
  return [...markup.matchAll(/class="[^"]*ficha-stage-dot[^"]*"/g)].length;
}

async function loadProjectStageReading(): Promise<ProjectStageReading> {
  const mod = await import('../src/modules/inference/domain/ficha-node.js') as {
    projectStageReading?: ProjectStageReading;
  };
  assert.equal(typeof mod.projectStageReading, 'function', 'projectStageReading deve existir em ficha-node');
  return mod.projectStageReading!;
}

test('projectStageReading aloca 20 estágios por maior resto e espelha índice/faixa da posterior', async () => {
  const projectStageReading = await loadProjectStageReading();
  const reading = projectStageReading(SHARES);
  assert.equal(reading.cloud.length, 20);
  assert.deepEqual(countCloudStages(reading.cloud), largestRemainderCounts(SHARES));
  assert.equal(reading.index, SHARES_INDEX);
  assert.deepEqual(reading.band, SHARES_BAND);

  const again = projectStageReading(SHARES);
  assert.deepEqual(again.cloud, reading.cloud);
  assert.equal(again.index, reading.index);
  assert.deepEqual(again.band, reading.band);

  const uneven: StageShares = [0.12, 0.18, 0.22, 0.28, 0.2];
  const unevenReading = projectStageReading(uneven);
  assert.equal(unevenReading.cloud.length, 20);
  assert.deepEqual(countCloudStages(unevenReading.cloud), largestRemainderCounts(uneven));
});

test('Como está publicado com series: legenda, colunas por série, nuvem 20, sem stage-distribution', () => {
  const how = projectHowItIs({
    stageDistribution: SHARES,
    minimum: 5,
    slices: [
      { label: 'Gestão', completed: 6, distribution: [0.1, 0.1, 0.2, 0.4, 0.2] },
      { label: 'Engenharia', completed: 2, distribution: [0.7, 0.1, 0.1, 0.05, 0.05] },
      { label: 'Pagamentos', completed: 3, distribution: [0, 0, 1, 0, 0] },
    ],
  });
  assert.equal(how.stage.published, true);
  if (!how.stage.published) return;
  assert.equal(how.stage.series.length, 1);

  const section = sectionHtml(renderNodeCard(minimalCard(how)), 'Como está');
  assert.match(section, new RegExp(LEGEND.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(section, /Por perspectiva, lado a lado/);
  assert.match(section, /class="ficha-perspective-columns"/);
  assert.doesNotMatch(section, /class="stage-distribution"/);

  const columns = [...section.matchAll(/class="ficha-perspective-column"/g)];
  assert.equal(columns.length, 1, 'uma coluna por série publicada, sem forçar 3');
  assert.match(section, /Gestão/);
  assert.match(section, /\d+%/);
  assert.match(section, /faixa \d+–\d+%/);
  assert.match(section, /class="ficha-stage-cloud"/);
  assert.equal(countDotsInCloud(section), 20);

  assert.match(section, /report-gap/);
  assert.match(section, /Engenharia teve 2 pessoas/);
  assert.match(section, /Pagamentos teve 3 pessoas/);
  assert.doesNotMatch(section, /0\.7/);
  assert.doesNotMatch(section, /70%/);
});

test('Como está publicado sem series: Combinado, sem heading de perspectiva, nuvem do agregado', () => {
  const how = projectHowItIs({ stageDistribution: SHARES });
  assert.equal(how.stage.published, true);
  if (!how.stage.published) return;
  assert.equal(how.stage.series.length, 0);

  const section = sectionHtml(renderNodeCard(minimalCard(how)), 'Como está');
  assert.match(section, new RegExp(LEGEND.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.doesNotMatch(section, /Por perspectiva, lado a lado/);
  assert.match(section, /class="ficha-perspective-columns"/);
  assert.equal([...section.matchAll(/class="ficha-perspective-column"/g)].length, 1);
  assert.match(section, /Combinado/);
  assert.match(section, new RegExp(`${SHARES_INDEX}%`));
  assert.match(section, new RegExp(`faixa ${SHARES_BAND[0]}–${SHARES_BAND[1]}%`));
  assert.match(section, /class="ficha-stage-cloud"/);
  assert.equal(countDotsInCloud(section), 20);
  assert.doesNotMatch(section, /class="stage-distribution"/);
});

test('alvo só aparece quando o input traz target; sem target não inventa 13/20/24', () => {
  const withTarget = projectHowItIs({ stageDistribution: SHARES, target: 45 } as { stageDistribution: StageShares; target: number });
  const withSection = sectionHtml(renderNodeCard(minimalCard(withTarget)), 'Como está');
  assert.match(withSection, /alvo 45%/);
  assert.doesNotMatch(withSection, /alvo 13%/);
  assert.doesNotMatch(withSection, /alvo 20%/);
  assert.doesNotMatch(withSection, /alvo 24%/);

  const without = projectHowItIs({ stageDistribution: SHARES });
  const withoutSection = sectionHtml(renderNodeCard(minimalCard(without)), 'Como está');
  assert.doesNotMatch(withoutSection, /alvo \d+%/);
});

test('sem posterior: gap canônico sem nuvem, colunas, % nem anti-mock', () => {
  const how = projectHowItIs({});
  const section = sectionHtml(renderNodeCard(minimalCard(how)), 'Como está');
  assert.match(section, /Ainda não publicamos a distribuição de estágio 0–4\./);
  assert.match(section, /report-gap/);
  assert.doesNotMatch(section, /class="ficha-stage-cloud"/);
  assert.doesNotMatch(section, /class="ficha-perspective-columns"/);
  assert.doesNotMatch(section, /class="stage-distribution"/);
  assert.doesNotMatch(section, /alvo \d+%/);
  assert.doesNotMatch(section, /\b\d+%/);
  assert.doesNotMatch(section, /\bOrbital\b/);
  assert.doesNotMatch(section, /\b13%/);
  assert.doesNotMatch(section, /\b24%/);
  assert.doesNotMatch(section, /Integração contínua/);
});

test('phase/appropriation não inventam %; quadrante fica só como conduta', () => {
  const how = projectHowItIs({ phase: 1, appropriation: 3 });
  assert.equal(how.stage.published, false);
  assert.equal(how.quadrant.published, true);
  const section = sectionHtml(renderNodeCard(minimalCard(how)), 'Como está');
  assert.match(section, /começa pelo meio/);
  assert.doesNotMatch(section, /class="ficha-stage-cloud"/);
  assert.doesNotMatch(section, /class="ficha-perspective-columns"/);
  assert.doesNotMatch(section, /\b\d+%/);
  assert.doesNotMatch(section, /alvo \d+%/);
});

test('duas series publicadas viram duas colunas, sem nuvem agregada extra', () => {
  const how = projectHowItIs({
    stageDistribution: SHARES,
    minimum: 5,
    slices: [
      { label: 'Gestão', completed: 6, distribution: [0.1, 0.1, 0.2, 0.4, 0.2] },
      { label: 'Produto', completed: 5, distribution: [0.2, 0.2, 0.2, 0.2, 0.2] },
    ],
  });
  assert.equal(how.stage.published, true);
  if (!how.stage.published) return;
  assert.equal(how.stage.series.length, 2);

  const section = sectionHtml(renderNodeCard(minimalCard(how)), 'Como está');
  assert.match(section, /Por perspectiva, lado a lado/);
  assert.equal([...section.matchAll(/class="ficha-perspective-column"/g)].length, 2);
  assert.match(section, /Gestão/);
  assert.match(section, /Produto/);
  assert.doesNotMatch(section, /Combinado/);
  assert.equal(countDotsInCloud(section), 40);
  assert.doesNotMatch(section, /class="stage-distribution"/);
});
