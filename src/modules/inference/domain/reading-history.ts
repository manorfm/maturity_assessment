import {
  assessStageChange,
  CHANGE_PUBLICATION_THRESHOLD,
  type ChangeAssessment,
} from '../../measurement/domain/change-detection.js';
import type { StageDistribution } from '../../measurement/domain/measurement-params.js';
import type { EvolutionReport, UnitCorrespondenceLink } from './evolution-report.js';
import { projectEvolutionReport } from './evolution-report.js';

export type IndexReadingContext = {
  findingPatterns: string[];
  limiterId?: string;
  limiterLabel?: string;
  units: Array<{ id: string; label: string }>;
  unitLinks?: UnitCorrespondenceLink[];
  capabilities?: Array<{ id: string; label: string; distribution: StageDistribution }>;
  treatedConduct?: string;
};

export type IndexReading = {
  id: string;
  label: string;
  index: number;
  band: [number, number];
  /** Posterior de estágio 0–4; habilita P(melhora) de 05 §9. */
  distribution?: StageDistribution;
  context?: IndexReadingContext;
  /** Percentual de alvo guardado com a fotografia, só quando a publicação o incluiu. */
  target?: number;
};

export type ReadingChange = 'improved' | 'regressed' | 'stable' | 'uncertain';

export type HistoryAssessment = {
  change?: ReadingChange;
  pImprove?: number;
  pRegress?: number;
  pStable?: number;
  threshold?: number;
  gap?: string;
  evolution?: EvolutionReport;
};

export function compareReadings(previous: IndexReading, current: IndexReading): ReadingChange {
  if (previous.distribution && current.distribution) {
    return assessStageChange(previous.distribution, current.distribution).change;
  }
  const previousHigh = previous.band[1];
  const previousLow = previous.band[0];
  const currentLow = current.band[0];
  const currentHigh = current.band[1];
  if (currentLow > previousHigh) return 'improved';
  if (currentHigh < previousLow) return 'regressed';
  return 'uncertain';
}

/** Compara duas fotografias; com distribuições aplica o limiar P ≥ 0,8 (05 §9). */
export function projectHistoryAssessment(input: {
  previous?: IndexReading;
  current?: IndexReading;
}): HistoryAssessment {
  if (!input.previous || !input.current) {
    return { gap: 'Ainda não há duas leituras com índice e faixa. Diferença de suporte de padrão não publica melhora.' };
  }
  if (input.previous.distribution && input.current.distribution) {
    const assessed: ChangeAssessment = assessStageChange(
      input.previous.distribution,
      input.current.distribution,
    );
    return {
      change: assessed.change,
      pImprove: assessed.pImprove,
      pRegress: assessed.pRegress,
      pStable: assessed.pStable,
      threshold: assessed.threshold,
    };
  }
  return {
    change: compareReadings(input.previous, input.current),
    threshold: CHANGE_PUBLICATION_THRESHOLD,
  };
}

export type HistoryOption = { id: string; label: string; selected: boolean };

export type HistoryPage = HistoryAssessment & {
  options: HistoryOption[];
  caution: string;
  capabilityGap?: string;
  /** Os dois alvos guardados. Ausente quando uma das fotografias não tem alvo. */
  targetChip?: string;
};

/** Chip só com os percentuais já guardados. Uma leitura sem alvo não publica percentual. */
function storedTargetChip(previous: IndexReading, current: IndexReading): string | undefined {
  if (previous.target === undefined || current.target === undefined) return undefined;
  return `alvo ${previous.target}% · ${current.target}%`;
}

export const historyCaution = 'Melhora depois da conduta não prova que a conduta causou a melhora. Outras mudanças no período também explicam o resultado.';

/** Leituras da mais antiga para a mais recente. A atual é a última; o seletor só aparece com duas anteriores ou mais. */
export function projectHistoryComparison(input: {
  readings: IndexReading[];
  previousId?: string;
}): HistoryPage {
  const current = input.readings.at(-1);
  const candidates = input.readings.slice(0, -1).reverse();
  if (!current || !candidates.length) {
    return { ...projectHistoryAssessment({}), options: [], caution: historyCaution };
  }
  const selected = candidates.find((item) => item.id === input.previousId) ?? candidates[0]!;
  const options = candidates.length > 1
    ? candidates.map((item) => ({ id: item.id, label: item.label, selected: item.id === selected.id }))
    : [];
  const history = projectHistoryAssessment({ previous: selected, current });
  const targetChip = storedTargetChip(selected, current);
  const publishedChip = targetChip !== undefined ? { targetChip } : {};
  if (!selected.distribution || !current.distribution) {
    return { ...history, options, caution: historyCaution, ...publishedChip };
  }
  const previousCapabilities = new Map((selected.context?.capabilities ?? []).map((item) => [item.id, item]));
  const leafNodes = (current.context?.capabilities ?? []).flatMap((item) => {
    const previous = previousCapabilities.get(item.id);
    if (!previous) return [];
    return [{
      leafId: item.id,
      label: item.label,
      previous: previous.distribution,
      current: item.distribution,
    }];
  });
  const evolution = projectEvolutionReport({
    nodes: [{
      leafId: 'organization-index',
      label: 'Índice da organização',
      previous: selected.distribution,
      current: current.distribution,
      ...(current.context?.treatedConduct ? { appliedConduct: current.context.treatedConduct } : {}),
    }, ...leafNodes],
    previousFindings: selected.context?.findingPatterns ?? [],
    currentFindings: current.context?.findingPatterns ?? [],
    ...(selected.context?.limiterId && selected.context.limiterLabel
      ? { previousLimiter: { id: selected.context.limiterId, label: selected.context.limiterLabel } }
      : {}),
    ...(current.context?.limiterId && current.context.limiterLabel
      ? { currentLimiter: { id: current.context.limiterId, label: current.context.limiterLabel } }
      : {}),
    previousUnits: selected.context?.units ?? [],
    currentUnits: current.context?.units ?? [],
    unitLinks: current.context?.unitLinks ?? selected.context?.unitLinks ?? [],
  });
  const leavesCompared = evolution.nodes.some((node) => node.leafId !== 'organization-index');
  return {
    ...history,
    evolution,
    options,
    caution: historyCaution,
    ...publishedChip,
    ...(leavesCompared ? {} : { capabilityGap: 'A posterior de cada capacidade ainda não é guardada entre leituras.' }),
  };
}
