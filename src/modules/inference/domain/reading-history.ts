import {
  assessStageChange,
  CHANGE_PUBLICATION_THRESHOLD,
  type ChangeAssessment,
} from '../../measurement/domain/change-detection.js';
import type { StageDistribution } from '../../measurement/domain/measurement-params.js';

export type IndexReading = {
  id: string;
  label: string;
  index: number;
  band: [number, number];
  /** Posterior de estágio 0–4; habilita P(melhora) de 05 §9. */
  distribution?: StageDistribution;
};

export type ReadingChange = 'improved' | 'regressed' | 'uncertain';

export type HistoryAssessment = {
  change?: ReadingChange;
  pImprove?: number;
  pRegress?: number;
  threshold?: number;
  gap?: string;
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
      threshold: assessed.threshold,
    };
  }
  return {
    change: compareReadings(input.previous, input.current),
    threshold: CHANGE_PUBLICATION_THRESHOLD,
  };
}
