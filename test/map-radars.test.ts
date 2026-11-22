/**
 * Mapa 6c — Radars do mapa (contrato CONTRATO_OK).
 *
 * APIs previstas (ainda ausentes no red):
 * - `publishPillarSlices` em `src/modules/inference/domain/diagnostic-report.ts`
 * - `projectMapRadars` em `src/modules/inference/domain/map-matrix.ts`
 * - `renderMapPage(..., mapRadars)` obrigatório em `diagnostic-report-view.ts`
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  CapabilityTaxonomy,
  capabilityPillarIds,
} from '../src/modules/inference/domain/capability-taxonomy.js';
import {
  maturitySliceDraws,
  maturitySliceSeed,
} from '../src/modules/inference/domain/diagnostic-report.js';
import {
  disciplineColumns,
  projectEngineeringDomains,
  projectPerspectiveMatrix,
  projectStructureMatrix,
} from '../src/modules/inference/domain/map-matrix.js';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import type { IndexPublication, MaturitySlice } from '../src/modules/inference/domain/stage-posterior.js';
import { aggregateParentIndex } from '../src/modules/measurement/domain/index-aggregation.js';
import { renderMapPage } from '../src/modules/projects/diagnostic-report-view.js';

type LeafDistribution = readonly [number, number, number, number, number];

type RadarAxis = {
  id: string;
  label: string;
  state: 'published' | 'unevaluated';
  reading?: MaturitySlice;
  note?: string;
};

type RadarPanel = {
  title: string;
  notice: string;
  axes: RadarAxis[];
};

type MapRadars = {
  domains: RadarPanel;
  capabilities: RadarPanel;
};

type PublishPillarSlices = (
  leaves: ReadonlyArray<{ id: string; distribution: LeafDistribution }>,
) => Partial<Record<(typeof capabilityPillarIds)[number], MaturitySlice>>;

type ProjectMapRadars = (input: {
  map: ReturnType<typeof OrganizationalAreaProjector.empty>;
  index?: IndexPublication;
}) => MapRadars;

const peaked = (stage: 0 | 1 | 2 | 3 | 4): LeafDistribution => {
  const distribution = [0, 0, 0, 0, 0] as [number, number, number, number, number];
  distribution[stage] = 1;
  return distribution;
};

const wide: LeafDistribution = [0.05, 0.05, 0.05, 0.05, 0.8];

const map = OrganizationalAreaProjector.empty();
const columns = disciplineColumns(map);

const CANONICAL_DOMAIN_IDS = [
  'delivery',
  'software-quality',
  'architecture',
  'platform',
  'security',
] as const;

const CANONICAL_DOMAIN_LABELS = [
  'Entrega',
  'Qualidade de software',
  'Arquitetura',
  'Plataforma',
  'Segurança',
] as const;

const RADAR_NOTICE = 'Eixo não avaliado fica fora do polígono e não vale zero.';

async function loadPublishPillarSlices(): Promise<PublishPillarSlices> {
  const mod = await import('../src/modules/inference/domain/diagnostic-report.js') as {
    publishPillarSlices?: PublishPillarSlices;
  };
  assert.equal(typeof mod.publishPillarSlices, 'function', 'publishPillarSlices deve existir em diagnostic-report');
  return mod.publishPillarSlices!;
}

async function loadProjectMapRadars(): Promise<ProjectMapRadars> {
  const mod = await import('../src/modules/inference/domain/map-matrix.js') as {
    projectMapRadars?: ProjectMapRadars;
  };
  assert.equal(typeof mod.projectMapRadars, 'function', 'projectMapRadars deve existir em map-matrix');
  return mod.projectMapRadars!;
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

const gapOverview = {
  lead: 'Ainda não há achado publicado para localizar o problema no mapa.',
  technology: { published: false as const, gap: 'Menos de 5 respondentes neste recorte.' },
  systems: [
    { id: 'product', label: 'Produto', status: 'entrevista não atravessou', gap: 'Sem índice publicado neste sistema.' },
    { id: 'engineering', label: 'Engenharia', status: 'entrevista não atravessou', gap: 'Sem índice publicado neste sistema.' },
    { id: 'operations', label: 'Operação', status: 'entrevista não atravessou', gap: 'Sem índice publicado neste sistema.' },
    { id: 'organization', label: 'Organização', status: 'entrevista não atravessou', gap: 'Sem índice publicado neste sistema.' },
  ],
  method: 'Sistemas na ordem do modelo, não por resultado.',
  notice: 'Este diagnóstico descreve o sistema de trabalho. Não use para avaliar pessoas.',
};

const gapDomains = projectEngineeringDomains({ map });

const publishedDelivery = parentOf({
  'work-management': peaked(1),
  'continuous-integration': peaked(1),
});

const publishedDeliveryFlow = parentOf({
  'work-management': peaked(1),
  'continuous-integration': peaked(1),
});

function unevaluatedAxes(
  ids: readonly string[],
  labels: readonly string[],
): RadarAxis[] {
  return ids.map((id, i) => ({
    id,
    label: labels[i]!,
    state: 'unevaluated' as const,
    note: 'Não avaliado',
  }));
}

const gapRadars: MapRadars = {
  domains: {
    title: 'Engenharia: perfil dos domínios',
    notice: RADAR_NOTICE,
    axes: unevaluatedAxes(CANONICAL_DOMAIN_IDS, CANONICAL_DOMAIN_LABELS),
  },
  capabilities: {
    title: 'Tecnologia: perfil das capacidades',
    notice: RADAR_NOTICE,
    axes: unevaluatedAxes(
      capabilityPillarIds,
      capabilityPillarIds.map((id) => CapabilityTaxonomy.labelFor(id)),
    ),
  },
};

const twoPublishedRadars: MapRadars = {
  domains: {
    title: 'Engenharia: perfil dos domínios',
    notice: RADAR_NOTICE,
    axes: CANONICAL_DOMAIN_IDS.map((id, i) => (
      id === 'delivery' || id === 'security'
        ? {
          id,
          label: CANONICAL_DOMAIN_LABELS[i]!,
          state: 'published' as const,
          reading: { index: publishedDelivery.index, band: publishedDelivery.band },
        }
        : {
          id,
          label: CANONICAL_DOMAIN_LABELS[i]!,
          state: 'unevaluated' as const,
          note: 'Não avaliado',
        }
    )),
  },
  capabilities: {
    title: 'Tecnologia: perfil das capacidades',
    notice: RADAR_NOTICE,
    axes: capabilityPillarIds.map((id) => (
      id === 'delivery-flow' || id === 'security-risk'
        ? {
          id,
          label: CapabilityTaxonomy.labelFor(id),
          state: 'published' as const,
          reading: { index: publishedDeliveryFlow.index, band: publishedDeliveryFlow.band },
        }
        : {
          id,
          label: CapabilityTaxonomy.labelFor(id),
          state: 'unevaluated' as const,
          note: 'Não avaliado',
        }
    )),
  },
};

const threePublishedDomainReadings = [
  { index: publishedDelivery.index, band: publishedDelivery.band },
  { index: 40, band: [20, 55] as [number, number] },
  { index: 70, band: [55, 85] as [number, number] },
] as const;

const threePlusPublishedRadars: MapRadars = {
  domains: {
    title: 'Engenharia: perfil dos domínios',
    notice: RADAR_NOTICE,
    axes: CANONICAL_DOMAIN_IDS.map((id, i) => (
      i < 3
        ? {
          id,
          label: CANONICAL_DOMAIN_LABELS[i]!,
          state: 'published' as const,
          reading: threePublishedDomainReadings[i]!,
        }
        : {
          id,
          label: CANONICAL_DOMAIN_LABELS[i]!,
          state: 'unevaluated' as const,
          note: 'Não avaliado',
        }
    )),
  },
  capabilities: {
    title: 'Tecnologia: perfil das capacidades',
    notice: RADAR_NOTICE,
    axes: capabilityPillarIds.map((id, i) => (
      i < 3
        ? {
          id,
          label: CapabilityTaxonomy.labelFor(id),
          state: 'published' as const,
          reading: threePublishedDomainReadings[i]!,
        }
        : {
          id,
          label: CapabilityTaxonomy.labelFor(id),
          state: 'unevaluated' as const,
          note: 'Não avaliado',
        }
    )),
  },
};

function renderWithRadars(mapRadars: MapRadars, extras: {
  cut?: 'cap' | 'est' | 'per';
  structure?: ReturnType<typeof structureFixture>;
  perspectives?: ReturnType<typeof perspectiveFixture>;
} = {}): string {
  return renderMapPage({
    map,
    cut: extras.cut ?? 'cap',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    overview: gapOverview,
    engineeringDomains: gapDomains,
    ...(extras.structure ? { structure: extras.structure } : {}),
    ...(extras.perspectives ? { perspectives: extras.perspectives } : {}),
    mapRadars,
  } as Parameters<typeof renderMapPage>[0] & { mapRadars: MapRadars });
}

function mapRadarsBlock(html: string): string {
  const start = html.indexOf('map-radars');
  const end = html.indexOf('report-tabs');
  assert.ok(start >= 0, 'bloco map-radars presente');
  assert.ok(end >= 0, 'abas report-tabs presentes');
  return html.slice(start, end);
}

function resultPolygons(block: string): string[] {
  return [...block.matchAll(/<polygon\b[^>]*class="[^"]*radar-result[^"]*"[^>]*>/g)].map((m) => m[0]!);
}

test('publishPillarSlices agrega leaves por pilar da taxonomia e omite faixa larga', async () => {
  const publishPillarSlices = await loadPublishPillarSlices();
  const deliveryFlowLeaves = {
    'work-management': peaked(1),
    'continuous-integration': peaked(1),
  };
  const expected = parentOf(deliveryFlowLeaves);
  assert.ok(expected.band[1] - expected.band[0] <= 50);

  const slices = publishPillarSlices(
    Object.entries(deliveryFlowLeaves).map(([id, distribution]) => ({ id, distribution })),
  );
  assert.deepEqual(slices['delivery-flow'], { index: expected.index, band: expected.band });
  for (const pillarId of capabilityPillarIds) {
    if (pillarId === 'delivery-flow') continue;
    assert.equal(slices[pillarId], undefined, `pilar inesperado publicado: ${pillarId}`);
  }

  const wideParent = parentOf({ 'work-management': wide, 'continuous-integration': wide });
  assert.ok(wideParent.band[1] - wideParent.band[0] > 50);
  const withheld = publishPillarSlices([
    { id: 'work-management', distribution: wide },
    { id: 'continuous-integration', distribution: wide },
  ]);
  assert.equal(withheld['delivery-flow'], undefined);

  assert.deepEqual(publishPillarSlices([]), {});

  const orgOnly = publishPillarSlices([
    { id: 'leadership-management', distribution: peaked(1) },
  ]);
  assert.ok(orgOnly['organizational-system']);
  assert.equal(orgOnly['delivery-flow'], undefined);
});

test('publishPillarSlices só emite chaves dos 8 pilares e não inventa Aprovação de mudança', async () => {
  const publishPillarSlices = await loadPublishPillarSlices();
  const slices = publishPillarSlices([
    { id: 'work-management', distribution: peaked(1) },
    { id: 'software-security', distribution: peaked(3) },
    { id: 'product-direction', distribution: peaked(2) },
  ]);
  const keys = Object.keys(slices);
  for (const key of keys) {
    assert.ok(
      (capabilityPillarIds as readonly string[]).includes(key),
      `chave de pilar inesperada: ${key}`,
    );
  }
  assert.equal(keys.includes('change-approval'), false);
  assert.equal(JSON.stringify(slices).includes('Aprovação de mudança'), false);
  assert.equal(capabilityPillarIds.length, 8);
});

test('projectMapRadars retorna domains (5, ordem 6b) e capabilities (8, ordem taxonomia)', async () => {
  const projectMapRadars = await loadProjectMapRadars();
  const projected = projectMapRadars({
    map,
    index: {
      published: true,
      index: 40,
      band: [20, 60],
      coverage: 0.7,
      leaves: [
        { id: 'software-security', distribution: peaked(4) },
        { id: 'work-management', distribution: peaked(0) },
      ],
    },
  });

  assert.equal(projected.domains.axes.length, 5);
  assert.deepEqual(projected.domains.axes.map((axis) => axis.id), [...CANONICAL_DOMAIN_IDS]);
  assert.deepEqual(projected.domains.axes.map((axis) => axis.label), [...CANONICAL_DOMAIN_LABELS]);
  assert.equal(projected.domains.axes.at(-1)?.id, 'security');
  assert.equal(projected.domains.title.includes('6 domínios'), false);
  assert.equal(projected.domains.title.includes('Dados e IA'), false);
  assert.equal(JSON.stringify(projected.domains).includes('Dados e IA'), false);

  assert.equal(projected.capabilities.axes.length, 8);
  assert.deepEqual(
    projected.capabilities.axes.map((axis) => axis.id),
    [...capabilityPillarIds],
  );
  assert.deepEqual(
    projected.capabilities.axes.map((axis) => axis.label),
    capabilityPillarIds.map((id) => CapabilityTaxonomy.labelFor(id)),
  );
  assert.equal(projected.capabilities.title.includes('6 domínios'), false);
});

test('projectMapRadars publica reading só se agregável, unevaluated sem %, notice do polígono', async () => {
  const projectMapRadars = await loadProjectMapRadars();
  const globalIndex = 62;
  const projected = projectMapRadars({
    map,
    index: {
      published: true,
      index: globalIndex,
      band: [50, 75],
      coverage: 0.8,
      leaves: [
        { id: 'work-management', distribution: peaked(1) },
        { id: 'continuous-integration', distribution: peaked(1) },
      ],
    },
  });

  const delivery = projected.domains.axes.find((axis) => axis.id === 'delivery');
  assert.equal(delivery?.state, 'published');
  assert.ok(delivery?.reading);
  assert.notEqual(delivery?.reading?.index, globalIndex);

  for (const axis of projected.domains.axes.filter((item) => item.id !== 'delivery')) {
    assert.equal(axis.state, 'unevaluated');
    assert.match(axis.note ?? '', /Não avaliado/i);
    assert.equal(axis.reading, undefined);
    assert.equal(JSON.stringify(axis).includes('%'), false);
  }

  const deliveryFlow = projected.capabilities.axes.find((axis) => axis.id === 'delivery-flow');
  assert.equal(deliveryFlow?.state, 'published');
  assert.ok(deliveryFlow?.reading);
  assert.notEqual(deliveryFlow?.reading?.index, globalIndex);

  for (const axis of projected.capabilities.axes.filter((item) => item.id !== 'delivery-flow')) {
    assert.equal(axis.state, 'unevaluated');
    assert.match(axis.note ?? '', /Não avaliado/i);
    assert.equal(axis.reading, undefined);
    assert.equal(JSON.stringify(axis).includes('%'), false);
  }

  assert.match(projected.domains.notice, /polígono|poligono/i);
  assert.match(projected.domains.notice, /não vale zero|nao vale zero|fora/i);
  assert.match(projected.capabilities.notice, /polígono|poligono/i);
  assert.match(projected.capabilities.notice, /não vale zero|nao vale zero|fora/i);
  assert.equal(projected.domains.notice.includes('Orbital'), false);
  assert.equal(projected.capabilities.notice.includes('13%'), false);
  assert.equal(projected.capabilities.notice.includes('24%'), false);

  const blocked = projectMapRadars({
    map,
    index: { published: false, reason: 'Menos de 5 respondentes neste recorte.' },
  });
  assert.equal(blocked.domains.axes.every((axis) => axis.state === 'unevaluated'), true);
  assert.equal(blocked.capabilities.axes.every((axis) => axis.state === 'unevaluated'), true);
  assert.equal(JSON.stringify(blocked).includes('%'), false);

  const emptyLeaves = projectMapRadars({
    map,
    index: { published: true, index: 50, band: [40, 60], coverage: 0.5, leaves: [] },
  });
  assert.equal(emptyLeaves.domains.axes.every((axis) => axis.state === 'unevaluated'), true);
  assert.equal(emptyLeaves.capabilities.axes.every((axis) => axis.state === 'unevaluated'), true);
});

test('renderMapPage coloca map-radars depois de map-engineering-domains e antes de report-tabs', () => {
  const html = renderWithRadars(threePlusPublishedRadars);
  const domainsAt = html.indexOf('map-engineering-domains');
  const radarsAt = html.indexOf('map-radars');
  const tabsAt = html.indexOf('report-tabs');
  assert.ok(domainsAt >= 0, 'bloco map-engineering-domains presente');
  assert.ok(radarsAt >= 0, 'bloco map-radars presente');
  assert.ok(tabsAt >= 0, 'abas report-tabs presentes');
  assert.ok(domainsAt < radarsAt, 'Engenharia por domínio deve ficar acima dos radars');
  assert.ok(radarsAt < tabsAt, 'radars devem ficar acima das abas');

  assert.match(html, /aria-label="[^"]*(domínio|dominio|Engenharia)[^"]*"/i);
  assert.match(html, /aria-label="[^"]*(capacidad|Tecnologia|pilar)[^"]*"/i);
  const block = mapRadarsBlock(html);
  const ariaLabels = [...block.matchAll(/aria-label="([^"]+)"/g)].map((m) => m[1]!);
  assert.ok(ariaLabels.length >= 2, 'dois aria-labels distinguindo radars');
  assert.ok(
    ariaLabels.some((label) => /domínio|dominio|Engenharia/i.test(label)),
    'aria-label de domínios',
  );
  assert.ok(
    ariaLabels.some((label) => /capacidad|Tecnologia|pilar/i.test(label)),
    'aria-label de capacidades',
  );
});

test('renderMapPage radars: polígono só com eixos published (≥3); unevaluated não entra como zero', () => {
  const few = renderWithRadars(twoPublishedRadars);
  const fewBlock = mapRadarsBlock(few);
  assert.equal(resultPolygons(fewBlock).length, 0, 'com menos de 3 published não desenha polígono de resultado');
  assert.match(fewBlock, /não avaliado|nao avaliado/i);

  const many = renderWithRadars(threePlusPublishedRadars);
  const manyBlock = mapRadarsBlock(many);
  assert.ok(resultPolygons(manyBlock).length >= 1, 'com ≥3 published desenha polígono de resultado');
  assert.match(manyBlock, /não avaliado|nao avaliado/i);

  for (const polygon of resultPolygons(manyBlock)) {
    assert.equal(/points="[^"]*\b0,0\b/.test(polygon), false);
  }
  assert.equal(manyBlock.includes('raio 0'), false);
  assert.equal(/radar-marker-unassessed|map-radar-unassessed|coverage-gap|report-gap|--na|não avaliado/i.test(manyBlock), true);
});

test('renderMapPage radars usam índice 0–100 no raio, não estágio 0–4', () => {
  const html = renderWithRadars(threePlusPublishedRadars);
  const block = mapRadarsBlock(html);
  for (const stage of ['Opaco', 'Reativo', 'Repetível', 'Gerenciado', 'Adaptativo']) {
    assert.equal(block.includes(stage), false, `rótulo de estágio indevido no mapa: ${stage}`);
  }
  assert.match(block, new RegExp(`${publishedDelivery.index}%`));
  assert.ok(resultPolygons(block).length >= 1, 'eixo published participa do polígono na escala de índice');
});

test('renderMapPage radars sem publicação não inventa Orbital, 13%, 24%, Dados e IA nem Aprovação de mudança', () => {
  const html = renderWithRadars(gapRadars);
  const block = mapRadarsBlock(html);
  assert.equal(block.includes('Orbital'), false);
  assert.equal(block.includes('13%'), false);
  assert.equal(block.includes('24%'), false);
  assert.equal(block.includes('Dados e IA'), false);
  assert.equal(block.includes('Aprovação de mudança'), false);
  assert.match(html, /map-radars/);
});

test('renderMapPage com mapRadars preserva overview, engineering-domains e cortes cap, est e per', () => {
  const cap = renderWithRadars(gapRadars, { cut: 'cap' });
  assert.match(cap, /map-overview/);
  assert.match(cap, /map-engineering-domains/);
  assert.match(cap, /map-radars/);
  assert.match(cap, /report-tabs/);
  assert.match(cap, /Por capacidade/);
  assert.match(cap, /area-map|Sistemas da organização/);

  const est = renderWithRadars(gapRadars, { cut: 'est', structure: structureFixture() });
  assert.match(est, /map-overview/);
  assert.match(est, /map-engineering-domains/);
  assert.match(est, /map-radars/);
  assert.match(est, /report-tabs/);
  assert.match(est, /Por estrutura/);
  assert.match(est, /Delta/);
  assert.match(est, /coverage-cell|coverage-gap/);

  const per = renderWithRadars(gapRadars, {
    cut: 'per',
    perspectives: perspectiveFixture(),
  });
  assert.match(per, /map-overview/);
  assert.match(per, /map-engineering-domains/);
  assert.match(per, /map-radars/);
  assert.match(per, /report-tabs/);
  assert.match(per, /Por perspectiva/);
  assert.match(per, /divergence-cell/);
  assert.match(per, /Gestão descreve um sistema mais folgado/);
});
