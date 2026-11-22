/**
 * Mapa 6b — Engenharia por domínio (contrato CONTRATO_OK).
 *
 * APIs previstas (ainda ausentes no red):
 * - `publishDomainSlices` em `src/modules/inference/domain/diagnostic-report.ts`
 * - `projectEngineeringDomains` em `src/modules/inference/domain/map-matrix.ts`
 * - `renderMapPage(..., engineeringDomains)` obrigatório em `diagnostic-report-view.ts`
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  maturitySliceDraws,
  maturitySliceSeed,
} from '../src/modules/inference/domain/diagnostic-report.js';
import {
  disciplineColumns,
  projectMapRadars,
  projectPerspectiveMatrix,
  projectStructureMatrix,
} from '../src/modules/inference/domain/map-matrix.js';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import type { IndexPublication, MaturitySlice } from '../src/modules/inference/domain/stage-posterior.js';
import { aggregateParentIndex } from '../src/modules/measurement/domain/index-aggregation.js';
import { renderMapPage } from '../src/modules/projects/diagnostic-report-view.js';

type LeafDistribution = readonly [number, number, number, number, number];

type EngineeringDomain = {
  id: string;
  label: string;
  reading?: MaturitySlice;
  state: 'published' | 'unevaluated';
  note?: string;
};

type EngineeringDomains = {
  title: string;
  method: string;
  legend: string;
  domains: EngineeringDomain[];
};

type PublishDomainSlices = (
  leaves: ReadonlyArray<{ id: string; distribution: LeafDistribution }>,
  map: ReturnType<typeof OrganizationalAreaProjector.empty>,
) => Partial<Record<'delivery' | 'software-quality' | 'architecture' | 'platform' | 'security', MaturitySlice>>;

type ProjectEngineeringDomains = (input: {
  map: ReturnType<typeof OrganizationalAreaProjector.empty>;
  index?: IndexPublication;
}) => EngineeringDomains;

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

async function loadPublishDomainSlices(): Promise<PublishDomainSlices> {
  const mod = await import('../src/modules/inference/domain/diagnostic-report.js') as {
    publishDomainSlices?: PublishDomainSlices;
  };
  assert.equal(typeof mod.publishDomainSlices, 'function', 'publishDomainSlices deve existir em diagnostic-report');
  return mod.publishDomainSlices!;
}

async function loadProjectEngineeringDomains(): Promise<ProjectEngineeringDomains> {
  const mod = await import('../src/modules/inference/domain/map-matrix.js') as {
    projectEngineeringDomains?: ProjectEngineeringDomains;
  };
  assert.equal(
    typeof mod.projectEngineeringDomains,
    'function',
    'projectEngineeringDomains deve existir em map-matrix',
  );
  return mod.projectEngineeringDomains!;
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

const publishedDelivery = parentOf({
  'work-management': peaked(1),
  'continuous-integration': peaked(1),
});

const publishedDomains: EngineeringDomains = {
  title: 'Engenharia por domínio',
  method: 'Domínios na ordem do modelo, não por resultado.',
  legend: 'losango = estimativa · traço = faixa · linha vertical = alvo',
  domains: [
    {
      id: 'delivery',
      label: 'Entrega',
      state: 'published',
      reading: { index: publishedDelivery.index, band: publishedDelivery.band },
    },
    { id: 'software-quality', label: 'Qualidade de software', state: 'unevaluated', note: 'Não avaliado' },
    { id: 'architecture', label: 'Arquitetura', state: 'unevaluated', note: 'Não avaliado' },
    { id: 'platform', label: 'Plataforma', state: 'unevaluated', note: 'Não avaliado' },
    { id: 'security', label: 'Segurança', state: 'unevaluated', note: 'Não avaliado' },
  ],
};

const gapDomains: EngineeringDomains = {
  title: 'Engenharia por domínio',
  method: 'Domínios na ordem do modelo, não por resultado.',
  legend: 'losango = estimativa · traço = faixa · linha vertical = alvo',
  domains: CANONICAL_DOMAIN_IDS.map((id, i) => ({
    id,
    label: CANONICAL_DOMAIN_LABELS[i]!,
    state: 'unevaluated' as const,
    note: 'Não avaliado',
  })),
};

test('publishDomainSlices agrega leaves por grupo de Engenharia e omite faixa larga', async () => {
  const publishDomainSlices = await loadPublishDomainSlices();
  const deliveryLeaves = {
    'work-management': peaked(1),
    'continuous-integration': peaked(1),
  };
  const expected = parentOf(deliveryLeaves);
  assert.ok(expected.band[1] - expected.band[0] <= 50);

  const slices = publishDomainSlices(
    Object.entries(deliveryLeaves).map(([id, distribution]) => ({ id, distribution })),
    map,
  );
  assert.deepEqual(slices.delivery, { index: expected.index, band: expected.band });
  assert.equal(slices['software-quality'], undefined);
  assert.equal(slices.architecture, undefined);
  assert.equal(slices.platform, undefined);
  assert.equal(slices.security, undefined);

  const wideParent = parentOf({ 'work-management': wide, 'continuous-integration': wide });
  assert.ok(wideParent.band[1] - wideParent.band[0] > 50);
  const withheld = publishDomainSlices(
    [
      { id: 'work-management', distribution: wide },
      { id: 'continuous-integration', distribution: wide },
    ],
    map,
  );
  assert.equal(withheld.delivery, undefined);

  assert.deepEqual(publishDomainSlices([], map), {});

  const orgOnly = publishDomainSlices(
    [{ id: 'leadership-management', distribution: peaked(1) }],
    map,
  );
  assert.deepEqual(orgOnly, {});
});

test('publishDomainSlices coloca Dados sob Arquitetura e não inventa domínio Dados e IA', async () => {
  const publishDomainSlices = await loadPublishDomainSlices();
  const slices = publishDomainSlices(
    [{ id: 'integration-data', distribution: peaked(2) }],
    map,
  );
  assert.ok(slices.architecture);
  assert.equal(slices.delivery, undefined);
  const keys = Object.keys(slices);
  for (const key of keys) {
    assert.ok(
      (CANONICAL_DOMAIN_IDS as readonly string[]).includes(key),
      `chave de domínio inesperada: ${key}`,
    );
  }
  assert.equal(keys.includes('data-ai'), false);
  assert.equal(JSON.stringify(slices).includes('Dados e IA'), false);
});

test('projectEngineeringDomains retorna cinco domínios na ordem canônica', async () => {
  const projectEngineeringDomains = await loadProjectEngineeringDomains();
  const projected = projectEngineeringDomains({
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
  assert.match(projected.title, /Engenharia por domínio/i);
  assert.equal(projected.domains.length, 5);
  assert.deepEqual(projected.domains.map((domain) => domain.id), [...CANONICAL_DOMAIN_IDS]);
  assert.deepEqual(projected.domains.map((domain) => domain.label), [...CANONICAL_DOMAIN_LABELS]);
  assert.equal(projected.domains.at(-1)?.id, 'security');
});

test('projectEngineeringDomains publica reading só se agregável e marca unevaluated sem %', async () => {
  const projectEngineeringDomains = await loadProjectEngineeringDomains();
  const globalIndex = 62;
  const projected = projectEngineeringDomains({
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
  const delivery = projected.domains.find((domain) => domain.id === 'delivery');
  assert.equal(delivery?.state, 'published');
  assert.ok(delivery?.reading);
  assert.notEqual(delivery?.reading?.index, globalIndex);

  for (const domain of projected.domains.filter((item) => item.id !== 'delivery')) {
    assert.equal(domain.state, 'unevaluated');
    assert.match(domain.note ?? '', /Não avaliado/i);
    assert.equal(domain.reading, undefined);
    assert.equal(JSON.stringify(domain).includes('%'), false);
  }

  const blocked = projectEngineeringDomains({
    map,
    index: { published: false, reason: 'Menos de 5 respondentes neste recorte.' },
  });
  assert.equal(blocked.domains.every((domain) => domain.state === 'unevaluated'), true);
  assert.equal(JSON.stringify(blocked.domains).includes('%'), false);

  const emptyLeaves = projectEngineeringDomains({
    map,
    index: { published: true, index: 50, band: [40, 60], coverage: 0.5, leaves: [] },
  });
  assert.equal(emptyLeaves.domains.every((domain) => domain.state === 'unevaluated'), true);
});

test('projectEngineeringDomains method e legend descrevem ordem do modelo e marcas sem Orbital', async () => {
  const projectEngineeringDomains = await loadProjectEngineeringDomains();
  const projected = projectEngineeringDomains({ map });
  assert.ok(projected.method.length > 0);
  assert.match(projected.method, /ordem do modelo/i);
  assert.match(projected.method, /não por resultado|resultado/i);
  assert.ok(projected.legend.length > 0);
  assert.match(projected.legend, /estimativa|losango/i);
  assert.match(projected.legend, /faixa|traço/i);
  assert.match(projected.legend, /alvo|linha/i);
  assert.equal(projected.method.includes('Orbital'), false);
  assert.equal(projected.legend.includes('Orbital'), false);
  assert.equal(projected.method.includes('13%'), false);
  assert.equal(projected.legend.includes('24%'), false);
});

test('renderMapPage coloca Engenharia por domínio entre overview e abas', () => {
  const html = renderMapPage({
    map,
    cut: 'cap',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    overview: gapOverview,
    engineeringDomains: publishedDomains,
    mapRadars: projectMapRadars({ map }),
  });
  const overviewAt = html.indexOf('map-overview');
  const domainsAt = html.indexOf('map-engineering-domains');
  const tabsAt = html.indexOf('report-tabs');
  assert.ok(overviewAt >= 0, 'bloco map-overview presente');
  assert.ok(domainsAt >= 0, 'bloco map-engineering-domains presente');
  assert.ok(tabsAt >= 0, 'abas report-tabs presentes');
  assert.ok(overviewAt < domainsAt, 'overview deve ficar acima de Engenharia por domínio');
  assert.ok(domainsAt < tabsAt, 'Engenharia por domínio deve ficar acima das abas');
  assert.match(html, /Engenharia por domínio/i);
  assert.match(html, /ordem do modelo/i);
  assert.match(html, /losango|estimativa/i);
  assert.match(html, /Entrega/);
  assert.match(html, new RegExp(`${publishedDelivery.index}%`));
  assert.match(html, new RegExp(`faixa ${publishedDelivery.band[0]}–${publishedDelivery.band[1]}%|${publishedDelivery.band[0]}–${publishedDelivery.band[1]}%`));
  assert.match(html, /Não avaliado/i);
  assert.match(html, /coverage-gap|report-gap|--na/);
});

test('renderMapPage Engenharia por domínio sem publicação não inventa Orbital nem Dados e IA', () => {
  const html = renderMapPage({
    map,
    cut: 'cap',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    overview: gapOverview,
    engineeringDomains: gapDomains,
    mapRadars: projectMapRadars({ map }),
  });
  assert.match(html, /map-engineering-domains/);
  assert.equal(html.includes('Orbital'), false);
  assert.equal(html.includes('13%'), false);
  assert.equal(html.includes('24%'), false);
  assert.equal(html.includes('Dados e IA'), false);
  const domainsBlock = html.slice(
    html.indexOf('map-engineering-domains'),
    html.indexOf('map-radars') >= 0 ? html.indexOf('map-radars') : html.indexOf('report-tabs'),
  );
  assert.equal(domainsBlock.includes('Integração contínua'), false);
});

test('renderMapPage com engineeringDomains preserva overview e cortes cap, est e per', () => {
  const mapRadars = projectMapRadars({ map });
  const cap = renderMapPage({
    map,
    cut: 'cap',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    overview: gapOverview,
    engineeringDomains: gapDomains,
    mapRadars,
  });
  assert.match(cap, /map-overview/);
  assert.match(cap, /map-engineering-domains/);
  assert.match(cap, /report-tabs/);
  assert.match(cap, /Por capacidade/);
  assert.match(cap, /area-map|Sistemas da organização/);

  const est = renderMapPage({
    map,
    cut: 'est',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    overview: gapOverview,
    engineeringDomains: gapDomains,
    mapRadars,
    structure: structureFixture(),
  });
  assert.match(est, /map-overview/);
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
    engineeringDomains: gapDomains,
    mapRadars,
    perspectives: perspectiveFixture(),
  });
  assert.match(per, /map-overview/);
  assert.match(per, /report-tabs/);
  assert.match(per, /Por perspectiva/);
  assert.match(per, /divergence-cell/);
  assert.match(per, /Gestão descreve um sistema mais folgado/);
});
