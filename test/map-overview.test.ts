/**
 * Mapa 6a — visão geral (contrato CONTRATO_OK).
 *
 * APIs previstas (ainda ausentes no red):
 * - `projectMapOverview` em `src/modules/inference/domain/map-matrix.ts`
 * - `publishSystemSlices` em `src/modules/inference/domain/diagnostic-report.ts`
 *   (junto de `publishMaturitySlices`, mesma regra de faixa)
 * - `renderMapPage(..., overview)` obrigatório em `diagnostic-report-view.ts`
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  maturitySliceDraws,
  maturitySliceSeed,
} from '../src/modules/inference/domain/diagnostic-report.js';
import {
  disciplineColumns,
  projectEngineeringDomains,
  projectMapRadars,
  projectPerspectiveMatrix,
  projectStructureMatrix,
} from '../src/modules/inference/domain/map-matrix.js';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import type { IndexPublication, MaturitySlice } from '../src/modules/inference/domain/stage-posterior.js';
import { aggregateParentIndex } from '../src/modules/measurement/domain/index-aggregation.js';
import { renderMapPage } from '../src/modules/projects/diagnostic-report-view.js';
import { layout } from '../src/shared/html.js';

function cssRuleBody(served: string, selector: RegExp): string {
  const match = served.match(selector);
  assert.ok(match?.[1], `regra CSS não encontrada: ${selector}`);
  return match[1]!.replace(/\s+/g, '');
}

type LeafDistribution = readonly [number, number, number, number, number];

type MapOverview = {
  lead: string;
  technology:
    | { published: true; index: number; band: [number, number]; coverage: number; target?: number }
    | { published: false; gap: string };
  systems: Array<{
    id: string;
    label: string;
    status: string;
    reading?: MaturitySlice;
    gap?: string;
  }>;
  method: string;
  notice: string;
};

type ProjectMapOverview = (input: {
  map: ReturnType<typeof OrganizationalAreaProjector.empty>;
  findings?: Array<{ path: string; title?: string; mechanism?: string }>;
  index?: IndexPublication;
}) => MapOverview;

type PublishSystemSlices = (
  leaves: ReadonlyArray<{ id: string; distribution: LeafDistribution }>,
  map: ReturnType<typeof OrganizationalAreaProjector.empty>,
) => Partial<Record<'product' | 'engineering' | 'operations' | 'organization', MaturitySlice>>;

const peaked = (stage: 0 | 1 | 2 | 3 | 4): LeafDistribution => {
  const distribution = [0, 0, 0, 0, 0] as [number, number, number, number, number];
  distribution[stage] = 1;
  return distribution;
};

const wide: LeafDistribution = [0.05, 0.05, 0.05, 0.05, 0.8];

const map = OrganizationalAreaProjector.empty();
const columns = disciplineColumns(map);

async function loadProjectMapOverview(): Promise<ProjectMapOverview> {
  const mod = await import('../src/modules/inference/domain/map-matrix.js') as {
    projectMapOverview?: ProjectMapOverview;
  };
  assert.equal(typeof mod.projectMapOverview, 'function', 'projectMapOverview deve existir em map-matrix');
  return mod.projectMapOverview!;
}

async function loadPublishSystemSlices(): Promise<PublishSystemSlices> {
  const mod = await import('../src/modules/inference/domain/diagnostic-report.js') as {
    publishSystemSlices?: PublishSystemSlices;
  };
  assert.equal(typeof mod.publishSystemSlices, 'function', 'publishSystemSlices deve existir em diagnostic-report');
  return mod.publishSystemSlices!;
}

function parentOf(leaves: Record<string, LeafDistribution>): MaturitySlice {
  return aggregateParentIndex({
    leaves,
    weights: Object.fromEntries(Object.keys(leaves).map((id) => [id, 1])),
    draws: maturitySliceDraws,
    seed: maturitySliceSeed,
  });
}

function structureFixture() {
  return projectStructureMatrix({
    minimum: 5,
    columns,
    units: [
      { path: 'Org/Gama', completed: 2, capabilities: [] },
      { path: 'Org/Delta', completed: 9, capabilities: [{ id: 'work-management', coverage: 1 }] },
    ],
  });
}

function perspectiveFixture() {
  return projectPerspectiveMatrix({
    minimum: 5,
    columns,
    samples: [
      { label: 'Gestão', completed: 6, readings: [{ capabilityId: 'work-management', signals: 4, mean: 1.4 }] },
      { label: 'Engenharia', completed: 6, readings: [{ capabilityId: 'work-management', signals: 4, mean: -1.2 }] },
      { label: 'Dados', completed: 3, readings: [] },
    ],
  });
}

const gapOverview: MapOverview = {
  lead: 'Ainda não há achado publicado para localizar o problema no mapa.',
  technology: { published: false, gap: 'Menos de 5 respondentes neste recorte.' },
  systems: [
    { id: 'product', label: 'Produto', status: 'entrevista não atravessou', gap: 'Sem índice publicado neste sistema.' },
    { id: 'engineering', label: 'Engenharia', status: 'entrevista não atravessou', gap: 'Sem índice publicado neste sistema.' },
    { id: 'operations', label: 'Operação', status: 'entrevista não atravessou', gap: 'Sem índice publicado neste sistema.' },
    { id: 'organization', label: 'Organização', status: 'entrevista não atravessou', gap: 'Sem índice publicado neste sistema.' },
  ],
  method: 'Sistemas na ordem do modelo, não por resultado.',
  notice: 'Este diagnóstico descreve o sistema de trabalho. Não use para avaliar pessoas.',
};

const publishedOverview: MapOverview = {
  lead: 'O problema aparece em Engenharia › Entrega. Abra qualquer bloco para descer até a capacidade.',
  technology: { published: true, index: 62, band: [50, 75], coverage: 0.8, target: 60 },
  systems: [
    { id: 'product', label: 'Produto', status: 'entrevista não atravessou', gap: 'Sem índice publicado neste sistema.' },
    { id: 'engineering', label: 'Engenharia', status: '1 problema', reading: { index: 25, band: [0, 50] } },
    { id: 'operations', label: 'Operação', status: 'entrevista não atravessou', gap: 'Sem índice publicado neste sistema.' },
    { id: 'organization', label: 'Organização', status: 'entrevista não atravessou', gap: 'Sem índice publicado neste sistema.' },
  ],
  method: 'Sistemas na ordem do modelo, não por resultado.',
  notice: 'Este diagnóstico descreve o sistema de trabalho. Não use para avaliar pessoas.',
};

test('projectMapOverview lead causal nomeia sistema e domínio do path e convida a abrir', async () => {
  const projectMapOverview = await loadProjectMapOverview();
  const overview = projectMapOverview({
    map,
    findings: [{
      path: 'Engenharia › Entrega › Fluxo de trabalho',
      title: 'Espera no fluxo',
      mechanism: 'Trabalho em curso sem limite cria fila.',
    }],
  });
  assert.match(overview.lead, /Engenharia/);
  assert.match(overview.lead, /Entrega/);
  assert.match(overview.lead, /Abra/);
  assert.equal(overview.lead.includes('Abra um bloco para descer até a capacidade'), false);

  const systemOnly = projectMapOverview({
    map,
    findings: [{ path: 'Engenharia', title: 'Restrição no sistema' }],
  });
  assert.match(systemOnly.lead, /Engenharia/);
  assert.match(systemOnly.lead, /Abra/);
});

test('projectMapOverview sem achado publica lead de lacuna sem inventar Orbital', async () => {
  const projectMapOverview = await loadProjectMapOverview();
  const overview = projectMapOverview({ map, findings: [] });
  assert.ok(overview.lead.length > 0);
  assert.match(overview.lead, /ainda|lacuna|sem achado|não há|não publica/i);
  assert.equal(overview.lead.includes('Orbital'), false);
  assert.equal(overview.lead.includes('13%'), false);
  assert.equal(overview.lead.includes('24%'), false);
  assert.equal(overview.lead.includes('Engenharia › Entrega'), false);
});

test('projectMapOverview technology espelha índice global publicado ou gap', async () => {
  const projectMapOverview = await loadProjectMapOverview();
  const published = projectMapOverview({
    map,
    index: { published: true, index: 62, band: [50, 75], coverage: 0.8, target: 60 },
  });
  assert.equal(published.technology.published, true);
  if (!published.technology.published) return;
  assert.equal(published.technology.index, 62);
  assert.deepEqual(published.technology.band, [50, 75]);
  assert.equal(published.technology.coverage, 0.8);
  assert.equal(published.technology.target, 60);

  const blocked = projectMapOverview({
    map,
    index: { published: false, reason: 'Menos de 5 respondentes neste recorte.' },
  });
  assert.equal(blocked.technology.published, false);
  if (blocked.technology.published) return;
  assert.match(blocked.technology.gap, /Menos de 5 respondentes/);
  assert.equal(JSON.stringify(blocked.technology).includes('%'), false);
  assert.equal('index' in blocked.technology, false);
});

test('publishSystemSlices agrega leaves por sistema e omite faixa larga', async () => {
  const publishSystemSlices = await loadPublishSystemSlices();
  const engineeringLeaves = {
    'work-management': peaked(1),
    'continuous-integration': peaked(1),
  };
  const expected = parentOf(engineeringLeaves);
  assert.ok(expected.band[1] - expected.band[0] <= 50);

  const slices = publishSystemSlices(
    Object.entries(engineeringLeaves).map(([id, distribution]) => ({ id, distribution })),
    map,
  );
  assert.deepEqual(slices.engineering, { index: expected.index, band: expected.band });
  assert.equal(slices.product, undefined);
  assert.equal(slices.operations, undefined);
  assert.equal(slices.organization, undefined);

  const wideParent = parentOf({ 'work-management': wide, 'continuous-integration': wide });
  assert.ok(wideParent.band[1] - wideParent.band[0] > 50);
  const withheld = publishSystemSlices(
    [
      { id: 'work-management', distribution: wide },
      { id: 'continuous-integration', distribution: wide },
    ],
    map,
  );
  assert.equal(withheld.engineering, undefined);

  assert.deepEqual(publishSystemSlices([], map), {});

  const orgOnly = publishSystemSlices(
    [{ id: 'leadership-management', distribution: peaked(1) }],
    map,
  );
  assert.ok(orgOnly.organization);
  assert.equal(orgOnly.product, undefined);
  assert.equal(orgOnly.engineering, undefined);
  assert.equal(orgOnly.operations, undefined);
  const globalIndex = 62;
  assert.equal(JSON.stringify(orgOnly).includes(`${globalIndex}%`), false);
  assert.notEqual(orgOnly.organization?.index, globalIndex);
});

test('projectMapOverview systems na ordem canônica com reading só se agregável', async () => {
  const projectMapOverview = await loadProjectMapOverview();
  const overview = projectMapOverview({
    map,
    index: {
      published: true,
      index: 62,
      band: [50, 75],
      coverage: 0.8,
      leaves: [
        { id: 'work-management', distribution: peaked(1) },
        { id: 'continuous-integration', distribution: peaked(1) },
      ],
    },
  });
  assert.deepEqual(overview.systems.map((system) => system.id), [
    'product',
    'engineering',
    'operations',
    'organization',
  ]);
  assert.deepEqual(overview.systems.map((system) => system.label), [
    'Produto',
    'Engenharia',
    'Operação',
    'Organização',
  ]);
  assert.equal(overview.systems.length, 4);
  for (const system of overview.systems) {
    assert.ok(typeof system.status === 'string');
  }
  const engineering = overview.systems.find((system) => system.id === 'engineering');
  const product = overview.systems.find((system) => system.id === 'product');
  assert.ok(engineering?.reading);
  assert.equal(product?.reading, undefined);
  assert.ok(product?.gap || product?.status);
  assert.notEqual(engineering?.reading?.index, 62);
});

test('projectMapOverview method e notice separam ordem do modelo de ranking e avisam uso', async () => {
  const projectMapOverview = await loadProjectMapOverview();
  const overview = projectMapOverview({ map });
  assert.ok(overview.method.length > 0);
  assert.match(overview.method, /ordem do modelo/i);
  assert.match(overview.method, /não por resultado|ranking|resultado/i);
  assert.ok(overview.notice.length > 0);
  assert.match(overview.notice, /sistema de trabalho/i);
  assert.match(overview.notice, /pessoas/i);
});

test('renderMapPage coloca overview acima das abas com Tecnologia e quatro sistemas', () => {
  const html = renderMapPage({
    map,
    cut: 'cap',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    overview: publishedOverview,
    engineeringDomains: projectEngineeringDomains({ map }),
    mapRadars: projectMapRadars({ map }),
  });
  const overviewAt = html.indexOf('map-overview');
  const tabsAt = html.indexOf('report-tabs');
  assert.ok(overviewAt >= 0, 'bloco map-overview presente');
  assert.ok(tabsAt >= 0, 'abas report-tabs presentes');
  assert.ok(overviewAt < tabsAt, 'overview deve ficar acima das abas');
  assert.match(html, /Engenharia/);
  assert.match(html, /Abra/);
  assert.equal(html.includes('Abra um bloco para descer até a capacidade. Célula sem cobertura não é zero.'), false);
  assert.match(html, /Tecnologia/);
  assert.match(html, /62%/);
  assert.match(html, /faixa 50–75%/);
  assert.match(html, /cobertura 80%/);
  assert.match(html, /class="map-overview-index"/);
  assert.equal(html.includes('class="report-index"'), false);
  assert.match(html, /Produto/);
  assert.match(html, /Engenharia/);
  assert.match(html, /Operação/);
  assert.match(html, /Organização/);
  assert.match(html, /ordem do modelo/i);
  assert.match(html, /sistema de trabalho/i);

  const served = layout('Mapa', '');
  const systems = cssRuleBody(served, /\.map-overview-systems\s*\{([^}]+)\}/);
  assert.match(systems, /display:grid/);
  assert.match(systems, /grid-template-columns:repeat\(4,/);
  const index = cssRuleBody(served, /\.map-overview-index\s*\{([^}]+)\}/);
  assert.match(index, /font-size:32px/);
});

test('renderMapPage overview sem publicação não inventa Orbital nem percentuais do protótipo', () => {
  const html = renderMapPage({
    map,
    cut: 'cap',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    overview: gapOverview,
    engineeringDomains: projectEngineeringDomains({ map }),
    mapRadars: projectMapRadars({ map }),
  });
  assert.match(html, /map-overview/);
  assert.equal(html.includes('Orbital'), false);
  assert.equal(html.includes('13%'), false);
  assert.equal(html.includes('24%'), false);
  assert.equal(html.includes('Integração contínua'), false);
  assert.match(html, /report-gap/);
});

test('renderMapPage com overview preserva cortes cap, est e per', () => {
  const engineeringDomains = projectEngineeringDomains({ map });
  const mapRadars = projectMapRadars({ map });
  const cap = renderMapPage({
    map,
    cut: 'cap',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    overview: gapOverview,
    engineeringDomains,
    mapRadars,
  });
  assert.match(cap, /report-tabs/);
  assert.match(cap, /Por capacidade/);
  assert.match(cap, /area-map|Sistemas da organização/);

  const est = renderMapPage({
    map,
    cut: 'est',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    overview: gapOverview,
    engineeringDomains,
    mapRadars,
    structure: structureFixture(),
  });
  assert.match(est, /report-tabs/);
  assert.match(est, /Por estrutura/);
  assert.match(est, /Delta/);
  assert.match(est, /coverage-cell|coverage-gap/);

  const per = renderMapPage({
    map,
    cut: 'per',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    overview: gapOverview,
    engineeringDomains,
    mapRadars,
    perspectives: perspectiveFixture(),
  });
  assert.match(per, /report-tabs/);
  assert.match(per, /Por perspectiva/);
  assert.match(per, /divergence-cell/);
  assert.match(per, /Gestão descreve um sistema mais folgado/);
});
