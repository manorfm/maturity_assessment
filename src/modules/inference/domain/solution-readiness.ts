import type { GroupSignal } from './group-recommendation-engine.js';

export type SolutionReadinessStage = 'not-demonstrated' | 'declared' | 'local' | 'operational' | 'adaptive';

export type SolutionReadiness = {
  stage: SolutionReadinessStage;
  label: string;
  explanation: string;
  evidence: number;
};

const descriptions: Record<SolutionReadinessStage, Omit<SolutionReadiness, 'stage' | 'evidence'>> = {
  'not-demonstrated': {
    label: 'Não demonstrada',
    explanation: 'As entrevistas não demonstram um mecanismo executado para enfrentar esta classe de problema; isso não prova que ele inexista.',
  },
  declared: {
    label: 'Declarada, ainda não executada',
    explanation: 'Há conhecimento, intenção ou mecanismo habilitador, mas ainda sem execução coletiva observável.',
  },
  local: {
    label: 'Local e dependente do contexto',
    explanation: 'A capacidade aparece na prática, mas permanece localizada, pouco difundida ou dependente de poucas pessoas.',
  },
  operational: {
    label: 'Operacional e repetível',
    explanation: 'A capacidade é executada por parte relevante do grupo e possui mais de uma camada de sustentação.',
  },
  adaptive: {
    label: 'Adaptativa',
    explanation: 'Execução, consistência e consequência aparecem em perspectivas distintas e alteram o sistema de trabalho.',
  },
};

export function assessSolutionReadiness(signals: GroupSignal[], applicablePopulation: number): SolutionReadiness {
  const positive = signals.filter((signal) => signal.weight > 0);
  const participants = new Set(positive.map((signal) => signal.participantId));
  const layers = new Set(positive.map((signal) => signal.layer));
  const profiles = new Set(positive.flatMap((signal) => signal.profile ? [signal.profile] : []));
  const reach = participants.size / Math.max(1, applicablePopulation);

  let stage: SolutionReadinessStage = 'not-demonstrated';
  if (positive.length && !positive.some((signal) => signal.layer === 'practice')) stage = 'declared';
  if (positive.some((signal) => signal.layer === 'practice')) stage = 'local';
  if (reach >= .5 && layers.size >= 2 && positive.some((signal) => signal.layer === 'practice')) stage = 'operational';
  if (reach >= .8 && profiles.size >= 2 && layers.has('practice') && layers.has('consistency') && layers.has('outcome')) stage = 'adaptive';

  return { stage, ...descriptions[stage], evidence: participants.size };
}
