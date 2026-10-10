/** Família causal noisy-OR (05 §12). Substitui hipóteses mutuamente exclusivas + "desconhecido". */

export type ParameterProvenance = {
  author: string;
  date: string;
  rationale: string;
};

export type CausalCause = {
  id: string;
  label: string;
  prior: number;
  /** Padrões do grafo que publicam esta causa. */
  aliases?: string[];
};

export type CausalSymptom = {
  id: string;
  /** λ₀ — vazamento (outras causas não modeladas). */
  leak: number;
  /** λ_{m,k} por id de causa. */
  lambda: Record<string, number>;
  /** Padrões do grafo que observam este sintoma. */
  aliases?: string[];
};

export type CausalReporting = {
  p1: number;
  p0: number;
  phi: number;
};

export type CausalFamily = {
  id: string;
  capability: string;
  causes: CausalCause[];
  symptoms: CausalSymptom[];
  reporting: CausalReporting;
  provenance: ParameterProvenance;
};

export function symptomIdForPattern(family: CausalFamily, pattern: string): string | undefined {
  for (const symptom of family.symptoms) {
    if (symptom.id === pattern || symptom.aliases?.includes(pattern)) return symptom.id;
  }
  return undefined;
}
