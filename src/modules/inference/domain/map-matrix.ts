import { CapabilityTaxonomy, capabilityPillarIds } from './capability-taxonomy.js';
import { publishDomainSlices, publishPillarSlices, publishSystemSlices } from './diagnostic-report.js';
import type { IndexPublication, MaturitySlice } from './stage-posterior.js';
import { projectSystemTiles, type OrganizationalAreaMap, type OrganizationalAreaNode } from './organizational-areas.js';

export type MapColumn = { id: string; label: string; leafIds: string[] };

export type MapCell =
  | { kind: 'uncovered' }
  | { kind: 'unpublished' }
  | { kind: 'divergence'; left: string; right: string };

export type StructureMatrix = {
  columns: MapColumn[];
  rows: Array<{ label: string; completed: number; cells: MapCell[] }>;
};

export type PerspectiveMatrix = {
  columns: MapColumn[];
  rows: Array<{ label: string; completed: number; cells: MapCell[] }>;
  withoutOwnRow: Array<{ label: string; completed: number }>;
  withheld: string | null;
  notice: string;
};

export type PerspectiveSample = {
  label: string;
  completed: number;
  readings: Array<{ capabilityId: string; signals: number; mean: number }>;
};

export type MapLegendMark = { id: 'estimate' | 'band' | 'target'; label: string; value: string };

export type MapLegend = { marks: MapLegendMark[]; gap: string | null };

export function projectMapLegend(index?: IndexPublication): MapLegend {
  if (!index?.published) return { marks: [], gap: mapCopy.estimateGap };
  const marks: MapLegendMark[] = [
    { id: 'estimate', label: 'estimativa', value: `${index.index}%` },
    { id: 'band', label: 'faixa', value: `${index.band[0]}–${index.band[1]}%` },
  ];
  if (index.target !== undefined) marks.push({ id: 'target', label: 'alvo', value: `${index.target}%` });
  return { marks, gap: null };
}

export type MapOverview = {
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

const SYSTEM_GAP = 'Sem índice publicado neste sistema.';
const OVERVIEW_METHOD = 'Sistemas na ordem do modelo, não por resultado.';
const OVERVIEW_NOTICE = 'Este diagnóstico descreve o sistema de trabalho. Não use para avaliar pessoas.';
const OVERVIEW_LEAD_GAP = 'Ainda não há achado publicado para localizar o problema no mapa.';

export function projectMapOverview(input: {
  map: OrganizationalAreaMap;
  findings?: Array<{ path: string; title?: string; mechanism?: string }>;
  index?: IndexPublication;
}): MapOverview {
  const path = input.findings?.find((finding) => finding.path.trim())?.path.trim();
  const lead = path ? overviewLeadFromPath(path) : OVERVIEW_LEAD_GAP;
  const technology = overviewTechnology(input.index);
  const slices = input.index?.published && input.index.leaves
    ? publishSystemSlices(input.index.leaves, input.map)
    : {};
  const systems = projectSystemTiles(input.map).map((tile) => {
    const reading = slices[tile.id as keyof typeof slices];
    return reading
      ? { id: tile.id, label: tile.label, status: tile.status, reading }
      : { id: tile.id, label: tile.label, status: tile.status, gap: SYSTEM_GAP };
  });
  return { lead, technology, systems, method: OVERVIEW_METHOD, notice: OVERVIEW_NOTICE };
}

function overviewLeadFromPath(path: string): string {
  const segments = path.split('›').map((part) => part.trim()).filter(Boolean);
  const place = segments.slice(0, 2).join(' › ');
  return `O problema aparece em ${place}. Abra qualquer bloco para descer até a capacidade.`;
}

function overviewTechnology(index?: IndexPublication): MapOverview['technology'] {
  if (!index) return { published: false, gap: mapCopy.estimateGap };
  if (!index.published) return { published: false, gap: index.reason };
  return {
    published: true,
    index: index.index,
    band: index.band,
    coverage: index.coverage,
    ...(index.target !== undefined ? { target: index.target } : {}),
  };
}

export type EngineeringDomain = {
  id: string;
  label: string;
  reading?: MaturitySlice;
  state: 'published' | 'unevaluated';
  note?: string;
};

export type EngineeringDomains = {
  title: string;
  method: string;
  legend: string;
  domains: EngineeringDomain[];
};

const DOMAINS_TITLE = 'Engenharia por domínio';
const DOMAINS_METHOD = 'Domínios na ordem do modelo, não por resultado.';
const DOMAINS_LEGEND = 'losango = estimativa · traço = faixa · linha vertical = alvo';
const DOMAIN_UNEVALUATED = 'Não avaliado';

export function projectEngineeringDomains(input: {
  map: OrganizationalAreaMap;
  index?: IndexPublication;
}): EngineeringDomains {
  const engineering = input.map.systems.find((system) => system.id === 'engineering');
  const groups = (engineering?.children ?? []).filter((child) => child.kind === 'group');
  const slices = input.index?.published && input.index.leaves
    ? publishDomainSlices(input.index.leaves, input.map)
    : {};
  const domains = groups.map((group) => {
    const reading = slices[group.id as keyof typeof slices];
    return reading
      ? { id: group.id, label: group.label, state: 'published' as const, reading }
      : { id: group.id, label: group.label, state: 'unevaluated' as const, note: DOMAIN_UNEVALUATED };
  });
  return { title: DOMAINS_TITLE, method: DOMAINS_METHOD, legend: DOMAINS_LEGEND, domains };
}

export type MapRadarAxis = {
  id: string;
  label: string;
  state: 'published' | 'unevaluated';
  reading?: MaturitySlice;
  note?: string;
};

export type MapRadarPanel = {
  title: string;
  notice: string;
  axes: MapRadarAxis[];
};

export type MapRadars = {
  domains: MapRadarPanel;
  capabilities: MapRadarPanel;
};

const RADARS_NOTICE = 'Eixo não avaliado fica fora do polígono e não vale zero.';
const DOMAINS_RADAR_TITLE = 'Engenharia: perfil dos domínios';
const CAPABILITIES_RADAR_TITLE = 'Tecnologia: perfil das capacidades';

export function projectMapRadars(input: {
  map: OrganizationalAreaMap;
  index?: IndexPublication;
}): MapRadars {
  const engineering = input.map.systems.find((system) => system.id === 'engineering');
  const groups = (engineering?.children ?? []).filter((child) => child.kind === 'group');
  const domainSlices = input.index?.published && input.index.leaves
    ? publishDomainSlices(input.index.leaves, input.map)
    : {};
  const pillarSlices = input.index?.published && input.index.leaves
    ? publishPillarSlices(input.index.leaves)
    : {};
  return {
    domains: {
      title: DOMAINS_RADAR_TITLE,
      notice: RADARS_NOTICE,
      axes: groups.map((group) => {
        const reading = domainSlices[group.id as keyof typeof domainSlices];
        return reading
          ? { id: group.id, label: group.label, state: 'published' as const, reading }
          : { id: group.id, label: group.label, state: 'unevaluated' as const, note: DOMAIN_UNEVALUATED };
      }),
    },
    capabilities: {
      title: CAPABILITIES_RADAR_TITLE,
      notice: RADARS_NOTICE,
      axes: capabilityPillarIds.map((id) => {
        const reading = pillarSlices[id];
        return reading
          ? { id, label: CapabilityTaxonomy.labelFor(id), state: 'published' as const, reading }
          : { id, label: CapabilityTaxonomy.labelFor(id), state: 'unevaluated' as const, note: DOMAIN_UNEVALUATED };
      }),
    },
  };
}

export const mapCopy = {
  uncovered: 'sem cobertura',
  unpublished: 'índice não publicado',
  structureLead: 'Times × capacidades, na ordem da estrutura, não por resultado.',
  estimateGap: 'Estimativa, faixa e alvo só entram quando o modelo publicar a célula.',
  perspectiveLead: 'Perspectivas × capacidades. A célula com os dois relatos marca divergência. Não mostra quem está certo.',
  noOwnRow: 'Sem linha própria',
  noDivergence: 'Nenhuma divergência de perspectiva publicada acima do limiar.',
};

const leafIdsOf = (node: OrganizationalAreaNode): string[] => {
  const own = node.leafId ? [node.leafId] : [];
  return [...own, ...node.children.flatMap(leafIdsOf)];
};

export function disciplineColumns(map: OrganizationalAreaMap): MapColumn[] {
  return map.systems.flatMap((system) => system.children.map((child) => ({
    id: child.id,
    label: child.label,
    leafIds: leafIdsOf(child),
  })));
}

export function projectStructureMatrix(input: {
  minimum: number;
  columns: MapColumn[];
  units: Array<{ path: string; completed: number; capabilities: Array<{ id: string; coverage: number }> }>;
}): StructureMatrix {
  const rows = input.units.map((unit) => ({
    label: unit.path.split('/').at(-1) ?? unit.path,
    completed: unit.completed,
    cells: input.columns.map((column) => structureCell(unit, column, input.minimum)),
  }));
  return { columns: input.columns, rows };
}

function structureCell(
  unit: { completed: number; capabilities: Array<{ id: string; coverage: number }> },
  column: MapColumn,
  minimum: number,
): MapCell {
  if (unit.completed < minimum) return { kind: 'uncovered' };
  const covered = unit.capabilities.some((capability) => column.leafIds.includes(capability.id) && capability.coverage >= 1);
  return covered ? { kind: 'unpublished' } : { kind: 'uncovered' };
}

export function projectPerspectiveMatrix(input: {
  minimum: number;
  columns: MapColumn[];
  samples: PerspectiveSample[];
}): PerspectiveMatrix {
  const eligible = input.samples.filter((sample) => sample.completed >= input.minimum);
  const withoutOwnRow = input.samples
    .filter((sample) => sample.completed > 0 && sample.completed < input.minimum)
    .map((sample) => ({ label: sample.label, completed: sample.completed }));
  return {
    columns: input.columns,
    rows: eligible.map((sample) => ({
      label: sample.label,
      completed: sample.completed,
      cells: input.columns.map((column) => perspectiveCell(sample, column, eligible)),
    })),
    withoutOwnRow,
    withheld: withheldNote(withoutOwnRow, input.minimum),
    notice: mapCopy.perspectiveLead,
  };
}

function withheldNote(rows: Array<{ label: string }>, minimum: number): string | null {
  if (!rows.length) return null;
  const names = rows.map((row) => row.label).join(', ');
  const verb = rows.length === 1 ? 'teve' : 'tiveram';
  return `${names} ${verb} menos de ${minimum} pessoas. As respostas entram só no total.`;
}

function side(mean: number): 'looser' | 'tighter' | 'none' {
  if (mean >= 1) return 'looser';
  if (mean <= -1) return 'tighter';
  return 'none';
}

function readingOf(sample: PerspectiveSample, column: MapColumn) {
  return sample.readings.find((reading) => column.leafIds.includes(reading.capabilityId) && reading.signals > 0);
}

function perspectiveCell(sample: PerspectiveSample, column: MapColumn, eligible: PerspectiveSample[]): MapCell {
  const own = readingOf(sample, column);
  if (!own) return { kind: 'uncovered' };
  const ownSide = side(own.mean);
  const labelsOn = (wanted: 'looser' | 'tighter') => eligible
    .filter((candidate) => side(readingOf(candidate, column)?.mean ?? 0) === wanted)
    .map((candidate) => candidate.label);
  const left = labelsOn('looser');
  const right = labelsOn('tighter');
  if (ownSide === 'none' || !left.length || !right.length) return { kind: 'unpublished' };
  return {
    kind: 'divergence',
    left: `${left.join(', ')} descreve um sistema mais folgado.`,
    right: `${right.join(', ')} descreve a restrição no mesmo recorte.`,
  };
}
