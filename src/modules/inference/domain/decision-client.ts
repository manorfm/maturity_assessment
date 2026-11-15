export type DecisionOption = { id: string; label: string };

export type DecisionChoiceInput = {
  state: string;
  options: readonly DecisionOption[];
  instructions?: string;
};

/** Sync: runArchetypeCohort permanece sync neste ciclo. */
export type DecisionClient = {
  choose(input: DecisionChoiceInput): string | null;
};
