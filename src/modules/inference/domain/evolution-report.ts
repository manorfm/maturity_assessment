import {
  assessStageChange,
  type StageChange,
} from '../../measurement/domain/change-detection.js';
import type { StageDistribution } from '../../measurement/domain/measurement-params.js';

export const EVOLUTION_REPORT_VERSION = 'evolution-report-v1' as const;

export type EvolutionNodeState = 'advanced' | 'regressed' | 'stable' | 'uncertain';

export type EvolutionNode = {
  leafId: string;
  label: string;
  state: EvolutionNodeState;
  pImprove: number;
  pRegress: number;
  pStable: number;
  reading: string;
};

export type FindingDelta = {
  closed: string[];
  opened: string[];
};

export type ConstraintShift = {
  moved: boolean;
  previous?: string;
  current?: string;
  reading: string;
};

export type UnitCorrespondenceKind = 'same' | 'renamed' | 'merged' | 'split' | 'extinct' | 'new';

export type UnitRef = { id: string; label: string };

export type UnitCorrespondenceLink = {
  previousId: string;
  currentIds: string[];
  kind: Exclude<UnitCorrespondenceKind, 'same' | 'extinct' | 'new'>;
};

export type UnitCorrespondenceRow = {
  previousId?: string;
  previousLabel?: string;
  currentId?: string;
  currentLabel?: string;
  kind: UnitCorrespondenceKind;
  publishesEvolution: boolean;
};

export type EvolutionNodeInput = {
  leafId: string;
  label: string;
  previous: StageDistribution;
  current: StageDistribution;
  appliedConduct?: string;
};

export type EvolutionReport = {
  version: typeof EVOLUTION_REPORT_VERSION;
  nodes: EvolutionNode[];
  findings: FindingDelta;
  constraint: ConstraintShift;
  units: UnitCorrespondenceRow[];
};

const stateFromChange = (change: StageChange): EvolutionNodeState => {
  if (change === 'improved') return 'advanced';
  if (change === 'regressed') return 'regressed';
  if (change === 'stable') return 'stable';
  return 'uncertain';
};

const stateReading: Record<EvolutionNodeState, string> = {
  advanced: 'Avançou',
  regressed: 'Regrediu',
  stable: 'Estável',
  uncertain: 'Incerto',
};

export function projectEvolutionReport(input: {
  nodes: EvolutionNodeInput[];
  previousFindings?: string[];
  currentFindings?: string[];
  previousLimiter?: { id: string; label: string };
  currentLimiter?: { id: string; label: string };
  previousUnits?: UnitRef[];
  currentUnits?: UnitRef[];
  unitLinks?: UnitCorrespondenceLink[];
}): EvolutionReport {
  const previousFindings = input.previousFindings ?? [];
  const currentFindings = input.currentFindings ?? [];
  const prevSet = new Set(previousFindings);
  const currSet = new Set(currentFindings);

  return {
    version: EVOLUTION_REPORT_VERSION,
    nodes: input.nodes.map((node) => projectNode(node)),
    findings: {
      closed: previousFindings.filter((pattern) => !currSet.has(pattern)),
      opened: currentFindings.filter((pattern) => !prevSet.has(pattern)),
    },
    constraint: projectConstraint(input.previousLimiter, input.currentLimiter),
    units: resolveUnitCorrespondence({
      previous: input.previousUnits ?? [],
      current: input.currentUnits ?? [],
      links: input.unitLinks ?? [],
    }),
  };
}

export function resolveUnitCorrespondence(input: {
  previous: UnitRef[];
  current: UnitRef[];
  links: UnitCorrespondenceLink[];
}): UnitCorrespondenceRow[] {
  const previousById = new Map(input.previous.map((unit) => [unit.id, unit]));
  const currentById = new Map(input.current.map((unit) => [unit.id, unit]));
  const claimedPrevious = new Set<string>();
  const claimedCurrent = new Set<string>();
  const rows: UnitCorrespondenceRow[] = [];

  for (const unit of input.previous) {
    if (currentById.has(unit.id)) {
      claimedPrevious.add(unit.id);
      claimedCurrent.add(unit.id);
      rows.push({
        previousId: unit.id,
        previousLabel: unit.label,
        currentId: unit.id,
        currentLabel: currentById.get(unit.id)!.label,
        kind: 'same',
        publishesEvolution: true,
      });
    }
  }

  for (const link of input.links) {
    if (!previousById.has(link.previousId)) continue;
    const targets = link.currentIds.filter((id) => currentById.has(id));
    if (!targets.length) continue;
    claimedPrevious.add(link.previousId);
    for (const currentId of targets) {
      claimedCurrent.add(currentId);
      const publishesEvolution = link.kind === 'renamed' && targets.length === 1;
      rows.push({
        previousId: link.previousId,
        previousLabel: previousById.get(link.previousId)!.label,
        currentId,
        currentLabel: currentById.get(currentId)!.label,
        kind: link.kind,
        publishesEvolution,
      });
    }
  }

  for (const unit of input.previous) {
    if (claimedPrevious.has(unit.id)) continue;
    rows.push({
      previousId: unit.id,
      previousLabel: unit.label,
      kind: 'extinct',
      publishesEvolution: false,
    });
  }

  for (const unit of input.current) {
    if (claimedCurrent.has(unit.id)) continue;
    rows.push({
      currentId: unit.id,
      currentLabel: unit.label,
      kind: 'new',
      publishesEvolution: false,
    });
  }

  return rows;
}

function projectNode(node: EvolutionNodeInput): EvolutionNode {
  const assessed = assessStageChange(node.previous, node.current);
  const state = stateFromChange(assessed.change);
  let reading = `${stateReading[state]}: ainda sem direção publicada além do limiar.`;
  if (state === 'advanced') {
    reading = node.appliedConduct
      ? `${stateReading[state]} após a conduta “${node.appliedConduct}”.`
      : `${stateReading[state]} entre as duas leituras.`;
  } else if (state === 'regressed') {
    reading = `${stateReading[state]}: revisar sinais de regressão e mudanças de contexto.`;
  } else if (state === 'stable') {
    reading = node.appliedConduct
      ? `${stateReading[state]}: preservado ou sem efeito detectável após a conduta.`
      : `${stateReading[state]}: mudança dentro da faixa — não publicar direção.`;
  }
  return {
    leafId: node.leafId,
    label: node.label,
    state,
    pImprove: assessed.pImprove,
    pRegress: assessed.pRegress,
    pStable: assessed.pStable,
    reading,
  };
}

function projectConstraint(
  previous?: { id: string; label: string },
  current?: { id: string; label: string },
): ConstraintShift {
  if (!previous && !current) {
    return { moved: false, reading: 'Ainda não há restrição principal publicada nas duas leituras.' };
  }
  if (previous && current && previous.id !== current.id) {
    return {
      moved: true,
      previous: previous.label,
      current: current.label,
      reading: `A restrição principal mudou de “${previous.label}” para “${current.label}” — progresso esperado quando a anterior foi tratada.`,
    };
  }
  const label = current?.label ?? previous?.label ?? '';
  return {
    moved: false,
    ...(previous ? { previous: previous.label } : {}),
    ...(current ? { current: current.label } : {}),
    reading: `A restrição principal permanece em “${label}”.`,
  };
}
