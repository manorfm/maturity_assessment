import type { CausalFamily, ParameterProvenance } from './causal-family.js';

/**
 * Sessão SHELF (05 §8.6): 3–5 especialistas, estimativa individual → discussão → final.
 * Pergunta: “em 100 unidades com apenas esta causa, em quantas o sintoma aparece?”
 */
export type ShelfEstimate = {
  symptomId: string;
  causeId: string;
  /** Contagem em 0–100; vira λ = count/100. */
  countOutOf100: number;
  justification: string;
};

export type ShelfSession = {
  familyId: string;
  experts: number;
  elicitedAt: string;
  facilitator: string;
  version: string;
  /** Estimativas finais pós-discussão. */
  finals: ShelfEstimate[];
};

export function lambdaFromHundred(countOutOf100: number): number {
  if (!Number.isFinite(countOutOf100)) return 0;
  return Math.min(1, Math.max(0, countOutOf100 / 100));
}

export function shelfProvenance(session: ShelfSession, rationale: string): ParameterProvenance {
  return {
    author: session.facilitator,
    date: session.elicitedAt.slice(0, 10),
    rationale,
    method: 'shelf',
    version: session.version,
    experts: session.experts,
    elicitedAt: session.elicitedAt,
  };
}

/** Aplica λ finais da sessão SHELF à família; leak e priors permanecem. */
export function applyShelfSession(family: CausalFamily, session: ShelfSession): CausalFamily {
  if (session.familyId !== family.id) {
    throw new Error(`Sessão SHELF de ${session.familyId} não aplica a ${family.id}.`);
  }
  if (session.experts < 3 || session.experts > 5) {
    throw new Error('SHELF exige 3 a 5 especialistas (05 §8.6).');
  }
  if (!session.finals.length) {
    throw new Error('Sessão SHELF sem estimativas finais.');
  }
  const bySymptom = new Map<string, Record<string, number>>();
  for (const estimate of session.finals) {
    const row = bySymptom.get(estimate.symptomId) ?? {};
    row[estimate.causeId] = lambdaFromHundred(estimate.countOutOf100);
    bySymptom.set(estimate.symptomId, row);
  }
  const symptoms = family.symptoms.map((symptom) => {
    const elicited = bySymptom.get(symptom.id);
    if (!elicited) return symptom;
    return {
      ...symptom,
      lambda: { ...symptom.lambda, ...elicited },
    };
  });
  const rationale = [
    `Elicitação SHELF com ${session.experts} especialistas.`,
    ...session.finals.slice(0, 3).map((item) => `${item.symptomId}|${item.causeId}: ${item.justification}`),
  ].join(' ');
  return {
    ...family,
    symptoms,
    provenance: shelfProvenance(session, rationale),
  };
}
