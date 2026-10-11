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
  // Chaos engineering (22 §2.3–§2.5)
  'chaos-nenhum-exercicio': { practiceId: 'chaos-engineering', phase: 0 },
  'chaos-tabletop': { practiceId: 'chaos-engineering', phase: 1 },
  'chaos-gameday-teste': { practiceId: 'chaos-engineering', phase: 2 },
  'chaos-gameday-producao': { practiceId: 'chaos-engineering', phase: 3 },
  'chaos-automatizado': { practiceId: 'chaos-engineering', phase: 4 },
  'chaos-alimenta-design': { practiceId: 'chaos-engineering', phase: 5 },

  // Automação de qualidade (22 §3.4 / 12 §3.6)
  'qa-so-em-producao': { practiceId: 'quality-automation', phase: 0 },
  'qa-fase-dias-depois': { practiceId: 'quality-automation', phase: 1 },
  'qa-pipeline-horas': { practiceId: 'quality-automation', phase: 2 },
  'qa-minutos-antes-integrar': { practiceId: 'quality-automation', phase: 3 },
  'qa-feedback-por-risco': { practiceId: 'quality-automation', phase: 4 },
  'qa-guiado-por-producao': { practiceId: 'quality-automation', phase: 5 },

  // AI-DLC (22 §4.4–§4.6)
  'ai-dlc-sem-verificacao': { practiceId: 'ai-dlc', phase: 0 },
  'ai-dlc-leitura-humana': { practiceId: 'ai-dlc', phase: 1 },
  'ai-dlc-pessoa-integra': { practiceId: 'ai-dlc', phase: 2 },
  'ai-dlc-testes-existentes': { practiceId: 'ai-dlc', phase: 3 },
  'ai-dlc-criterios-antes': { practiceId: 'ai-dlc', phase: 4 },
  'ai-dlc-ciclos-autonomos': { practiceId: 'ai-dlc', phase: 5 },
};

export function advancedPracticePhaseForPattern(pattern: string): AdvancedPracticeEventPhase | undefined {
  return advancedPracticeEventPhases[pattern];
}
