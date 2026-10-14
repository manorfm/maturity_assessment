import type { OrganizationalAreaMap, OrganizationalAreaNode } from './organizational-areas.js';

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
