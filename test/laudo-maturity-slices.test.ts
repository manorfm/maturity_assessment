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
    technical: { index: 62, band: [50, 75] },
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

  const copied = htmlFor({
    published: true,
    index: 62,
    band: [50, 75],
    coverage: 0.8,
    organizational: { index: 25, band: [25, 25] },
  });
  assert.equal('gap' in copied.reading, false);
  if (!('gap' in copied.reading)) {
    assert.equal(JSON.stringify(copied.reading.organizational), JSON.stringify({ index: 25, band: [25, 25] }));
    assert.equal(JSON.stringify(copied.reading.technical), undefined);
    assert.equal(copied.reading.profile, undefined);
  }
  assert.ok(copied.html.includes('Maturidade organizacional 25% · faixa 25–25%'));
  assert.ok(copied.html.includes('Esta leitura ainda não publica a maturidade técnica com faixa.'));
  assert.equal(copied.html.includes('Maturidade técnica 62%'), false);

  const blocked = htmlFor({ published: false, reason: 'Menos de 5 respondentes neste recorte.' });
  assert.equal('gap' in blocked.reading, true);
  assert.ok(blocked.html.includes('Menos de 5 respondentes neste recorte.'));
  assert.equal(blocked.html.includes('Maturidade técnica'), false);
  assert.equal(blocked.html.includes('Maturidade organizacional'), false);
  assert.equal(blocked.html.includes('62%'), false);
});
