import type { IndexPublication } from './stage-posterior.js';
import type { PerspectiveSample } from './map-matrix.js';
import type { ReportOutcomeKind } from './report-outcome.js';
import { disciplineScope } from './discipline-brief.js';
import { projectNodeRelations, type FichaRelations } from './node-relations.js';
import { classifySophisticationQuadrant, type SophisticationQuadrant } from './sophistication-matrix.js';

export type NodeDefinition = { what: string; why: string };

export type StageShares = readonly [number, number, number, number, number];

export type StageSeries = { label: string; shares: StageShares };

export type StageSlice = { label: string; completed: number; distribution?: StageShares };

export type StagePublication =
  | { published: false; gap: string }
  | { published: true; shares: StageShares; series: StageSeries[]; withheld: string[] };

export type QuadrantPublication =
  | { published: false }
  | { published: true; quadrant: SophisticationQuadrant; conduct: string };

export type HowItIs = { stage: StagePublication; quadrant: QuadrantPublication };

export type PreservePublication = { shown: boolean; body: string };

const stageGap = 'Ainda não publicamos a distribuição de estágio 0–4.';

const conductByQuadrant: Record<SophisticationQuadrant, string> = {
  'culture-without-tool': 'Neste quadrante, a conduta começa pelo meio, não por treinamento.',
  'tool-without-culture': 'Neste quadrante, a conduta começa pelo hábito, não por mais ferramenta.',
  beginning: 'Nem o hábito nem o meio sustentam a prática sozinhos.',
  'full-maturity': 'As pessoas querem e o meio ajuda. A conduta é preservar.',
};

export function projectNodeDefinition(id: string): NodeDefinition {
  const scope = disciplineScope(id);
  return { what: scope.covers, why: scope.treats };
}

export function leafStageDistribution(index: IndexPublication | undefined, leafId: string): StageShares | undefined {
  if (!index?.published) return undefined;
  return index.leaves?.find((leaf) => leaf.id === leafId)?.distribution;
}

export function projectHowItIs(input: {
  stageDistribution?: StageShares;
  minimum?: number;
  slices?: StageSlice[];
  phase?: number;
  appropriation?: number;
}): HowItIs {
  const stage: StagePublication = input.stageDistribution
    ? { published: true, shares: input.stageDistribution, ...stageSlices(input.slices ?? [], input.minimum ?? 5) }
    : { published: false, gap: stageGap };
  if (input.phase === undefined || input.appropriation === undefined) return { stage, quadrant: { published: false } };
  const quadrant = classifySophisticationQuadrant({ phase: input.phase, appropriation: input.appropriation });
  return { stage, quadrant: { published: true, quadrant, conduct: conductByQuadrant[quadrant] } };
}

export function projectPreserve(kind?: ReportOutcomeKind, body?: string): PreservePublication {
  if (kind === 'preserve' && body) return { shown: true, body };
  return { shown: false, body: 'O que já funciona entra quando a leitura é de preservação.' };
}

export type ReportedAccount = { label: string; body: string };

export type ReportedReadings = {
  perspectives: ReportedAccount[];
  units: ReportedAccount[];
  withheld: string[];
  gap: string | null;
};

export function projectReportedReadings(input: {
  capabilityIds: string[];
  minimum: number;
  samples: PerspectiveSample[];
  units: Array<{ label: string; completed: number; observed: boolean }>;
}): ReportedReadings {
  const perspectives: ReportedAccount[] = [];
  const withheld: string[] = [];
  for (const sample of input.samples) {
    const reading = sample.readings.find((item) => input.capabilityIds.includes(item.capabilityId) && item.signals > 0);
    if (!reading) continue;
    if (sample.completed < input.minimum) {
      withheld.push(withheldLine(sample.label, sample.completed));
      continue;
    }
    perspectives.push({ label: sample.label, body: perspectiveBody(sample.label, reading.mean) });
  }
  const units: ReportedAccount[] = [];
  for (const unit of input.units) {
    if (!unit.observed) continue;
    if (unit.completed < input.minimum) {
      withheld.push(withheldLine(unit.label, unit.completed));
      continue;
    }
    units.push({ label: unit.label, body: 'Este time tem cobertura neste recorte. O índice do time não é publicado nesta ficha.' });
  }
  const gap = perspectives.length === 0 && units.length === 0 && withheld.length === 0
    ? 'Ainda não há relato publicado neste nó.'
    : null;
  return { perspectives, units, withheld, gap };
}

function stageSlices(slices: StageSlice[], minimum: number): { series: StageSeries[]; withheld: string[] } {
  const series: StageSeries[] = [];
  const withheld: string[] = [];
  for (const slice of slices) {
    if (slice.completed < minimum) {
      withheld.push(`${slice.label} teve ${slice.completed} ${slice.completed === 1 ? 'pessoa' : 'pessoas'}. A distribuição entra só no total.`);
      continue;
    }
    if (slice.distribution) series.push({ label: slice.label, shares: slice.distribution });
  }
  return { series, withheld };
}

function withheldLine(label: string, completed: number): string {
  const people = completed === 1 ? 'pessoa' : 'pessoas';
  return `${label} teve ${completed} ${people}. As respostas entram só no total.`;
}

export type FichaLine = { published: boolean; body: string };

export type { FichaRelation, FichaRelations } from './node-relations.js';

export type FichaClose = {
  cause: FichaLine;
  place: FichaLine;
  action: FichaLine;
  check: FichaLine;
  relations: FichaRelations;
  unknown: FichaLine;
  references: FichaLine;
};

const closeGaps = {
  cause: 'Ainda não há causa publicada neste nó.',
  place: 'Ainda não há lugar publicado para resolver.',
  action: 'Sem conduta publicada.',
  check: 'O teste ainda não foi publicado.',
  unknown: 'Lacuna ainda não nomeada.',
  references: 'Referência ainda não ligada a esta ficha.',
} as const;

export function projectFichaClose(input: {
  nodeId?: string;
  cause?: string;
  place?: string;
  action?: string;
  check?: string;
  unknown?: string;
  references?: string;
}): FichaClose {
  const line = (key: keyof typeof closeGaps, value?: string): FichaLine => {
    const body = value?.trim();
    return body ? { published: true, body } : { published: false, body: closeGaps[key] };
  };
  return {
    cause: line('cause', input.cause),
    place: line('place', input.place),
    action: line('action', input.action),
    check: line('check', input.check),
    relations: projectNodeRelations(input.nodeId),
    unknown: line('unknown', input.unknown),
    references: line('references', input.references),
  };
}

function perspectiveBody(label: string, mean: number): string {
  if (mean >= 1) return `${label} descreve um sistema mais folgado neste recorte.`;
  if (mean <= -1) return `${label} descreve a restrição neste recorte.`;
  return `${label} relata este recorte, sem direção publicada.`;
}
