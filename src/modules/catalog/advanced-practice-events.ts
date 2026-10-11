import type { SophisticationPhase } from './evidence-contract.js';

/** Padrões de evento que medem a fase técnica de uma prática avançada (22). */
export type AdvancedPracticeEventPhase = {
  practiceId: string;
  phase: SophisticationPhase;
};

/**
 * Trilha de chaos engineering (22 §2.3–§2.5).
 * A apropriação continua na folha tipada do sinal; a fase da prática
 * alimenta prontidão e adoção prematura via `practiceId`.
 */
export const advancedPracticeEventPhases: Record<string, AdvancedPracticeEventPhase> = {
  'chaos-nenhum-exercicio': { practiceId: 'chaos-engineering', phase: 0 },
  'chaos-tabletop': { practiceId: 'chaos-engineering', phase: 1 },
  'chaos-gameday-teste': { practiceId: 'chaos-engineering', phase: 2 },
  'chaos-gameday-producao': { practiceId: 'chaos-engineering', phase: 3 },
  'chaos-automatizado': { practiceId: 'chaos-engineering', phase: 4 },
  'chaos-alimenta-design': { practiceId: 'chaos-engineering', phase: 5 },
};

export function advancedPracticePhaseForPattern(pattern: string): AdvancedPracticeEventPhase | undefined {
  return advancedPracticeEventPhases[pattern];
}
