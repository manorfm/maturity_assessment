import { credibleBand, type IndexPublication, type Stage } from './stage-posterior.js';
import type { PerspectiveSample } from './map-matrix.js';
import type { ReportOutcomeKind } from './report-outcome.js';
import { disciplineScope } from './discipline-brief.js';
import { projectNodeRelations, type FichaRelations } from './node-relations.js';
import { classifySophisticationQuadrant, type SophisticationQuadrant } from './sophistication-matrix.js';
import type { CynefinDomain, EvidenceGrade, LearningMode } from './treatment-contract.js';

export type NodeDefinition = { what: string; why: string };

export type StageShares = readonly [number, number, number, number, number];

export type StageReading = {
  index: number;
  band: [number, number];
  cloud: ReadonlyArray<Stage>;
};

export type StageSeries = { label: string; shares: StageShares; reading: StageReading; target?: number };

export type StageSlice = { label: string; completed: number; distribution?: StageShares; target?: number };

export type StagePublication =
  | { published: false; gap: string }
  | { published: true; shares: StageShares; reading: StageReading; target?: number; series: StageSeries[]; withheld: string[] };

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

/** Índice E[S]/4·100, faixa credibleBand e nuvem de 20 cenários (maior resto). */
export function projectStageReading(shares: StageShares): StageReading {
  const expectation = shares.reduce((sum, probability, stage) => sum + probability * stage, 0);
  return {
    index: Math.round((expectation / 4) * 100),
    band: credibleBand([...shares] as [number, number, number, number, number]),
    cloud: stageCloud(shares),
  };
}

export function projectHowItIs(input: {
  stageDistribution?: StageShares;
  minimum?: number;
  slices?: StageSlice[];
  phase?: number;
  appropriation?: number;
  target?: number;
}): HowItIs {
  const stage: StagePublication = input.stageDistribution
    ? {
      published: true,
      shares: input.stageDistribution,
      reading: projectStageReading(input.stageDistribution),
      ...(input.target !== undefined ? { target: input.target } : {}),
      ...stageSlices(input.slices ?? [], input.minimum ?? 5),
    }
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
    if (!slice.distribution) continue;
    series.push({
      label: slice.label,
      shares: slice.distribution,
      reading: projectStageReading(slice.distribution),
      ...(slice.target !== undefined ? { target: slice.target } : {}),
    });
  }
  return { series, withheld };
}

function stageCloud(shares: StageShares, n = 20): Stage[] {
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
  const cloud: Stage[] = [];
  for (let stage = 0; stage <= 4; stage += 1) {
    for (let i = 0; i < counts[stage]!; i += 1) cloud.push(stage as Stage);
  }
  return cloud;
}

function withheldLine(label: string, completed: number): string {
  const people = completed === 1 ? 'pessoa' : 'pessoas';
  return `${label} teve ${completed} ${people}. As respostas entram só no total.`;
}

export type FichaLine = { published: boolean; body: string };

export type FichaAction = FichaLine & {
  cynefin?: CynefinDomain;
  evidenceGrade?: EvidenceGrade;
  learningMode?: LearningMode;
};

export type { FichaRelation, FichaRelations } from './node-relations.js';

export type FichaClose = {
  cause: FichaLine;
  place: FichaLine;
  action: FichaAction;
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
  cynefin?: CynefinDomain;
  evidenceGrade?: EvidenceGrade;
  learningMode?: LearningMode;
  check?: string;
  unknown?: string;
  references?: string;
}): FichaClose {
  const line = (key: keyof typeof closeGaps, value?: string): FichaLine => {
    const body = value?.trim();
    return body ? { published: true, body } : { published: false, body: closeGaps[key] };
  };
  const actionBody = input.action?.trim();
  const action: FichaAction = actionBody
    ? {
      published: true,
      body: actionBody,
      ...(input.cynefin ? { cynefin: input.cynefin } : {}),
      ...(input.evidenceGrade ? { evidenceGrade: input.evidenceGrade } : {}),
      ...(input.learningMode ? { learningMode: input.learningMode } : {}),
    }
    : { published: false, body: closeGaps.action };
  return {
    cause: line('cause', input.cause),
    place: line('place', input.place),
    action,
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
