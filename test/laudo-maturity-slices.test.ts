import assert from 'node:assert/strict';
import { test } from 'node:test';
import { maturitySliceDraws, maturitySliceSeed, projectDiagnosticLaudo } from '../src/modules/inference/domain/diagnostic-report.js';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';
import type { IndexPublication } from '../src/modules/inference/domain/stage-posterior.js';
import { aggregateParentIndex } from '../src/modules/measurement/domain/index-aggregation.js';
import { renderLaudo } from '../src/modules/projects/diagnostic-report-view.js';

const peaked = (stage: 0 | 1 | 2 | 3 | 4): [number, number, number, number, number] => {
  const distribution = [0, 0, 0, 0, 0] as [number, number, number, number, number];
  distribution[stage] = 1;
  return distribution;
};

const finding: OutcomeFinding = {
  kind: 'correction',
  pattern: 'espera',
  detailCapability: 'work-management',
  title: 'Espera',
  cause: 'fila',
  intervention: 'limitar o trabalho em curso',
  confidence: 0.9,
  priority: 0.8,
};

const outcome = {
  kind: 'correct' as const,
  kindLabel: 'Precisa de correção',
  limiterLabel: 'Fluxo',
  reading: 'espera',
  nextStepTitle: '',
  nextStepBody: '',
  finding,
};

function parentOf(leaves: Record<string, readonly [number, number, number, number, number]>) {
  return aggregateParentIndex({
    leaves,
    weights: Object.fromEntries(Object.keys(leaves).map((id) => [id, 1])),
    draws: maturitySliceDraws,
    seed: maturitySliceSeed,
  });
}

function published(extra: Partial<Extract<IndexPublication, { published: true }>> & Pick<Extract<IndexPublication, { published: true }>, 'leaves'>): IndexPublication {
  return {
    published: true,
    index: 62,
    band: [50, 75],
    coverage: 0.8,
    ...extra,
  };
}

function htmlFor(index: IndexPublication): { html: string; reading: ReturnType<typeof projectDiagnosticLaudo>['reading'] } {
  const laudo = projectDiagnosticLaudo({
    outcome,
    findings: [finding],
    organizationalAreas: OrganizationalAreaProjector.empty(),
    index,
  });
  return {
    html: renderLaudo(laudo, { capabilityBase: '/c', reportBase: '/r' }),
    reading: laudo.reading,
  };
}

test('laudo com índice parcial não completa a maturidade que o domínio não publicou', () => {
  const organizational = parentOf({ 'leadership-management': peaked(1) });
  const { html, reading } = htmlFor(published({
    leaves: [
      { id: 'leadership-management', distribution: peaked(1) },
      { id: 'not-in-the-map', distribution: peaked(4) },
    ],
  }));
  assert.equal('gap' in reading, false);
  if ('gap' in reading) return;
  assert.equal(reading.index, 62);
  assert.deepEqual(reading.band, [50, 75]);
  assert.equal(reading.coverage, 0.8);
  assert.equal(reading.target, undefined);
  assert.equal(reading.profile, undefined);
  assert.equal(JSON.stringify(reading.technical), undefined);
  assert.equal(JSON.stringify(reading.organizational), JSON.stringify({ index: organizational.index, band: organizational.band }));
  assert.ok(html.includes('62%'));
  assert.ok(html.includes('faixa 50–75% · cobertura 80%'));
  assert.ok(html.includes(`Maturidade organizacional ${organizational.index}% · faixa ${organizational.band[0]}–${organizational.band[1]}%`));
  assert.ok(html.includes('Esta leitura ainda não publica a maturidade técnica com faixa.'));
  assert.equal(html.includes(`Maturidade técnica ${reading.index}%`), false);
  assert.equal(html.includes('Maturidade técnica 0%'), false);
  assert.equal(html.includes(`Maturidade técnica ${organizational.index}%`), false);
  assert.equal(html.includes('100%'), false);
  assert.equal(/(^|[^0-9])0%/.test(html), false);
  assert.equal(html.includes('13%'), false);
  assert.equal(html.includes('45%'), false);
  assert.equal(html.includes('Orbital'), false);
  assert.equal(html.includes('alvo'), false);
  assert.equal(html.includes('Porte'), false);
  assert.equal(html.includes('Regulação'), false);
  assert.equal(html.includes('porte'), false);
  assert.equal(html.includes('regulação'), false);
  assert.equal(html.includes('Estágio'), false);
});

test('laudo mostra maturidade técnica e organizacional só com a faixa que o índice publicou', () => {
  const technicalLeaves = {
    'product-direction': peaked(3),
    'continuous-integration': peaked(3),
    'reliability-practice': peaked(3),
  };
  const organizationalLeaves = { 'team-ownership': peaked(1) };
  const technical = parentOf(technicalLeaves);
  const organizational = parentOf(organizationalLeaves);
  const { html, reading } = htmlFor(published({
    leaves: [
      ...Object.entries(technicalLeaves).map(([id, distribution]) => ({ id, distribution })),
      ...Object.entries(organizationalLeaves).map(([id, distribution]) => ({ id, distribution })),
    ],
  }));
  assert.equal('gap' in reading, false);
  if ('gap' in reading) return;
  assert.equal(JSON.stringify(reading.technical), JSON.stringify({ index: technical.index, band: technical.band }));
  assert.equal(JSON.stringify(reading.organizational), JSON.stringify({ index: organizational.index, band: organizational.band }));
  assert.equal(reading.profile, undefined);
  assert.ok(html.includes(`Maturidade técnica ${technical.index}% · faixa ${technical.band[0]}–${technical.band[1]}%`));
  assert.ok(html.includes(`Maturidade organizacional ${organizational.index}% · faixa ${organizational.band[0]}–${organizational.band[1]}%`));
  assert.equal(html.includes('ainda não publica a maturidade técnica'), false);
  assert.equal(html.includes('ainda não publica a maturidade organizacional'), false);
  assert.equal(html.includes('Porte'), false);
  assert.equal(html.includes('Regulação'), false);
  assert.equal(html.includes('Estágio'), false);
});

type Distribution = [number, number, number, number, number];

/** Esperança exata de min(média, mínimo + 1) / 4 · 100 por enumeração; confere a simulação sem repeti-la. */
function exactIndex(distributions: Distribution[]): number {
  let total = 0;
  const walk = (position: number, probability: number, stages: number[]): void => {
    if (position === distributions.length) {
      const average = stages.reduce((sum, stage) => sum + stage, 0) / stages.length;
      total += probability * (Math.min(average, Math.min(...stages) + 1) / 4) * 100;
      return;
    }
    distributions[position]!.forEach((mass, stage) => {
      if (mass > 0) walk(position + 1, probability * mass, [...stages, stage]);
    });
  };
  walk(0, 1, []);
  return total;
}

test('a folha de Operação entra no recorte técnico com índice e faixa fixos', () => {
  const product: Distribution = [0, 0, 0, 0.25, 0.75];
  const engineering: Distribution = [0, 0, 0.75, 0.25, 0];
  const operations: Distribution = [0, 0.25, 0.75, 0, 0];
  const { html, reading } = htmlFor(published({
    leaves: [
      { id: 'product-direction', distribution: product },
      { id: 'continuous-integration', distribution: engineering },
      { id: 'reliability-practice', distribution: operations },
      { id: 'team-ownership', distribution: peaked(1) },
    ],
  }));
  assert.equal('gap' in reading, false);
  if ('gap' in reading) return;
  // 62,5 exato: a simulação de 8 000 sorteios com a semente da raiz arredonda para 63.
  assert.equal(exactIndex([product, engineering, operations]), 62.5);
  assert.deepEqual(reading.technical, { index: 63, band: [50, 75] });
  assert.ok(Math.abs((reading.technical?.index ?? 0) - exactIndex([product, engineering, operations])) <= 1);
  // Sem a folha de Operação o mesmo recorte seria 75 (faixa 75–100): a folha pesa no índice.
  assert.equal(exactIndex([product, engineering]), 75);
  assert.ok(html.includes('Maturidade técnica 63% · faixa 50–75%'));
  assert.equal(html.includes('Maturidade técnica 75%'), false);
  assert.equal(html.includes('faixa 75–100%'), false);
});

test('leitura sem nenhum recorte mostra as duas lacunas juntas e não herda o índice geral', () => {
  const noLeaves = htmlFor({ published: true, index: 62, band: [50, 75], coverage: 0.8, target: 60 });
  const unmapped = htmlFor(published({ leaves: [{ id: 'not-in-the-map', distribution: peaked(4) }] }));
  for (const { html, reading } of [noLeaves, unmapped]) {
    assert.equal('gap' in reading, false);
    if (!('gap' in reading)) {
      assert.equal(reading.technical, undefined);
      assert.equal(reading.organizational, undefined);
      assert.equal(reading.index, 62);
    }
    assert.ok(html.includes('Esta leitura ainda não publica a maturidade técnica com faixa.'));
    assert.ok(html.includes('Esta leitura ainda não publica a maturidade organizacional com faixa.'));
    assert.equal(html.includes('Maturidade técnica 62%'), false);
    assert.equal(html.includes('Maturidade organizacional 62%'), false);
    assert.ok(html.includes('faixa 50–75% · cobertura 80%'));
  }
  assert.ok(noLeaves.html.includes('alvo 60%'));
});

test('faixa larga demais não publica o recorte e o alvo entra só quando a publicação o traz', () => {
  const wideLeaves = {
    'product-direction': [0.05, 0.05, 0.05, 0.05, 0.8] as [number, number, number, number, number],
    'continuous-integration': [0.05, 0.05, 0.05, 0.05, 0.8] as [number, number, number, number, number],
  };
  const wide = parentOf(wideLeaves);
  assert.ok(wide.band[1] - wide.band[0] > 50);
  const organizational = parentOf({ 'leadership-management': peaked(1) });
  const withheld = htmlFor(published({
    leaves: [
      ...Object.entries(wideLeaves).map(([id, distribution]) => ({ id, distribution })),
      { id: 'leadership-management', distribution: peaked(1) },
    ],
  }));
  assert.equal('gap' in withheld.reading, false);
  if (!('gap' in withheld.reading)) {
    assert.equal(JSON.stringify(withheld.reading.technical), undefined);
    assert.equal(JSON.stringify(withheld.reading.organizational), JSON.stringify({ index: organizational.index, band: organizational.band }));
  }
  assert.ok(withheld.html.includes('Esta leitura ainda não publica a maturidade técnica com faixa.'));
  assert.equal(withheld.html.includes(`${wide.index}%`), false);
  assert.equal(withheld.html.includes(`faixa ${wide.band[0]}–${wide.band[1]}%`), false);

  const targeted = htmlFor(published({ target: 60, leaves: [{ id: 'leadership-management', distribution: peaked(1) }] }));
  assert.ok(targeted.html.includes('faixa 50–75% · cobertura 80% · alvo 60%'));
  assert.equal(targeted.html.includes('alvo 60% · faixa'), false);
  assert.equal('gap' in targeted.reading, false);
  if (!('gap' in targeted.reading)) assert.equal(targeted.reading.target, 60);

  const withoutTarget = htmlFor(published({ leaves: [{ id: 'leadership-management', distribution: peaked(1) }] }));
  assert.equal(withoutTarget.html.includes('alvo'), false);

  const blocked = htmlFor({ published: false, reason: 'Menos de 5 respondentes neste recorte.' });
  assert.equal('gap' in blocked.reading, true);
  assert.ok(blocked.html.includes('Menos de 5 respondentes neste recorte.'));
  assert.equal(blocked.html.includes('Maturidade técnica'), false);
  assert.equal(blocked.html.includes('Maturidade organizacional'), false);
  assert.equal(blocked.html.includes('62%'), false);
});

function slicesOf(html: string): string {
  const group = /<section class="report-slices"[\s\S]*?<\/section>/.exec(html);
  assert.ok(group, 'o laudo agrupa os recortes numa seção própria');
  return group[0];
}

test('os recortes formam um grupo nomeado pelo kicker e a lacuna tem variante própria', () => {
  const technicalGap = 'Esta leitura ainda não publica a maturidade técnica com faixa.';
  const organizational = parentOf({ 'leadership-management': peaked(1) });
  const mixed = slicesOf(htmlFor(published({ leaves: [{ id: 'leadership-management', distribution: peaked(1) }] })).html);
  assert.ok(mixed.startsWith('<section class="report-slices" aria-labelledby="report-slices-title">'));
  assert.ok(mixed.includes('<p class="report-kicker" id="report-slices-title">Técnica × organizacional</p>'));
  assert.equal(mixed.match(/<ul class="report-slice-list">/g)?.length, 1);
  assert.equal(mixed.match(/<li class="report-slice[ "]/g)?.length, 2);
  assert.ok(mixed.includes(`<li class="report-slice report-slice-gap"><p class="report-slice-note">${technicalGap}</p></li>`));
  assert.ok(mixed.includes(`<li class="report-slice"><p class="report-slice-reading">Maturidade organizacional ${organizational.index}% · faixa ${organizational.band[0]}–${organizational.band[1]}%</p></li>`));
  assert.equal(mixed.match(/report-slice-gap/g)?.length, 1);
  assert.equal(mixed.includes('<span'), false);

  const none = slicesOf(htmlFor(published({ leaves: [{ id: 'not-in-the-map', distribution: peaked(4) }] })).html);
  assert.equal(none.match(/<li class="report-slice report-slice-gap">/g)?.length, 2);
  assert.equal(none.includes('report-slice-reading'), false);

  const both = slicesOf(htmlFor(published({
    leaves: [
      { id: 'product-direction', distribution: peaked(3) },
      { id: 'continuous-integration', distribution: peaked(3) },
      { id: 'reliability-practice', distribution: peaked(3) },
      { id: 'team-ownership', distribution: peaked(1) },
    ],
  })).html);
  assert.equal(both.match(/<p class="report-slice-reading">/g)?.length, 2);
  assert.equal(both.includes('report-slice-gap'), false);

  assert.equal(htmlFor({ published: false, reason: 'Menos de 5 respondentes neste recorte.' }).html.includes('report-slices'), false);
});
