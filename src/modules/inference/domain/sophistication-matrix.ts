import type { EvidenceLink } from '../../catalog/evidence-contract.js';
import { sophisticationPhasesByLeaf as collectPhasesByLeaf } from '../../measurement/domain/response-observation.js';
import type { ResponseObservation } from '../../measurement/domain/response-observation.js';

export type SophisticationPhase = 0 | 1 | 2 | 3 | 4 | 5;

export type SophisticationDistribution = readonly [number, number, number, number, number, number];

export type SophisticationQuadrant =
  | 'tool-without-culture'
  | 'full-maturity'
  | 'beginning'
  | 'culture-without-tool';

export type SophisticationReading = {
  leafId: string;
  label: string;
  phase: SophisticationPhase;
  appropriation: number;
  quadrant: SophisticationQuadrant;
  reading: string;
};

export const sophisticationPhases: SophisticationPhase[] = [0, 1, 2, 3, 4, 5];

const uniformPrior: SophisticationDistribution = [1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6];

const quadrantReading: Record<SophisticationQuadrant, string> = {
  'tool-without-culture': 'Ferramenta sem cultura — tratar propósito, uso e confiança',
  'full-maturity': 'Maturidade plena — preservar e vigiar regressão',
  beginning: 'Início — construir mecanismo e entendimento juntos',
  'culture-without-tool': 'Cultura sem ferramenta — investir no mecanismo',
};

/** Sofisticação alta = F3–F5; apropriação alta = estágio 3–4 (12 §1). */
export function classifySophisticationQuadrant(input: {
  phase: number;
  appropriation: number;
}): SophisticationQuadrant {
  const highF = input.phase >= 3;
  const highA = input.appropriation >= 3;
  if (highF && !highA) return 'tool-without-culture';
  if (highF && highA) return 'full-maturity';
  if (!highF && highA) return 'culture-without-tool';
  return 'beginning';
}

/** R28: sofisticação não entra no índice — só a âncora de apropriação. */
export function sophisticationOutsideIndex(link: EvidenceLink): boolean {
  return link.sophistication !== undefined;
}

export function clampSophisticationPhase(value: number): SophisticationPhase {
  return Math.max(0, Math.min(5, Math.floor(value))) as SophisticationPhase;
}

/** Heterogeneidade dentro da unidade (05 §3.2) no suporte 0–5. */
function withinUnitPhases(psi: number): number[][] {
  return sophisticationPhases.map((phase) => {
    const row = sophisticationPhases.map((lived) => Math.exp(-psi * Math.abs(lived - phase)));
    const total = row.reduce((sum, value) => sum + value, 0) || 1;
    return row.map((value) => value / total);
  });
}

/** Multinomial logit P(chosen | lived) com âncoras F0–F5 (mesmo modelo de 05). */
function phaseOptionProbability(chosen: SophisticationPhase, lived: SophisticationPhase, kappa: number): number {
  const utilities = sophisticationPhases.map((anchor) => -kappa * Math.abs(anchor - lived));
  const max = Math.max(...utilities);
  const weights = utilities.map((utility) => Math.exp(utility - max));
  const total = weights.reduce((sum, weight) => sum + weight, 0) || 1;
  return (weights[chosen] ?? 0) / total;
}

function normalizeSophistication(values: number[]): SophisticationDistribution {
  const total = values.reduce((sum, value) => sum + value, 0) || 1;
  return values.map((value) => value / total) as unknown as SophisticationDistribution;
}

/**
 * Posterior discreta P(F = 0..5) por prática × unidade (12 / WP12).
 * Mesmo modelo de observação de 05, escala 0–5, sem gates γ de apropriação.
 */
export function observeSophistication(
  phases: readonly number[],
  options: { kappa?: number; psi?: number; prior?: SophisticationDistribution } = {},
): SophisticationDistribution {
  const kappa = options.kappa ?? 1.0;
  const psi = options.psi ?? 1.2;
  let post = [...(options.prior ?? uniformPrior)];
  if (!phases.length) return normalizeSophistication(post);

  const within = withinUnitPhases(psi);
  for (const raw of phases) {
    const chosen = clampSophisticationPhase(raw);
    const livedLikelihood = sophisticationPhases.map((lived) => phaseOptionProbability(chosen, lived, kappa));
    const likelihood = sophisticationPhases.map((phase) => (
      within[phase]!.reduce((sum, weight, lived) => sum + weight * livedLikelihood[lived]!, 0)
    ));
    post = post.map((value, phase) => value * likelihood[phase]!);
  }
  return normalizeSophistication(post);
}

export function expectedSophistication(distribution: SophisticationDistribution): number {
  return distribution.reduce((sum, probability, phase) => sum + probability * phase, 0);
}

export function modeSophistication(distribution: SophisticationDistribution): SophisticationPhase {
  let best: SophisticationPhase = 0;
  let bestMass = -1;
  for (let phase = 0; phase < distribution.length; phase += 1) {
    const mass = distribution[phase] ?? 0;
    if (mass > bestMass) {
      bestMass = mass;
      best = phase as SophisticationPhase;
    }
  }
  return best;
}

/** Modo da posterior F0–F5; sem observações, F0. */
export function measureSophisticationPhase(phases: readonly number[]): SophisticationPhase {
  if (!phases.length) return 0;
  return modeSophistication(observeSophistication(phases));
}

export function projectSophisticationMatrix(
  items: Array<{ leafId: string; label: string; phase: number; appropriation: number }>,
): SophisticationReading[] {
  return items.map((item) => {
    const phase = Math.max(0, Math.min(5, Math.floor(item.phase))) as SophisticationPhase;
    const appropriation = Math.max(0, Math.min(4, Math.floor(item.appropriation)));
    const quadrant = classifySophisticationQuadrant({ phase, appropriation });
    return {
      leafId: item.leafId,
      label: item.label,
      phase,
      appropriation,
      quadrant,
      reading: `${item.label}: F${phase} · apropriação ${appropriation} — ${quadrantReading[quadrant]}`,
    };
  });
}

export { collectPhasesByLeaf as sophisticationPhasesByLeaf };

/** Posterior F por folha a partir das respostas; opcionalmente filtrada por unidade. */
export function sophisticationPosteriorByLeaf(
  observations: ResponseObservation[],
  unitId?: string,
): Map<string, { distribution: SophisticationDistribution; phase: SophisticationPhase; expected: number }> {
  const phasesByLeaf = collectPhasesByLeaf(observations, unitId);
  const result = new Map<string, { distribution: SophisticationDistribution; phase: SophisticationPhase; expected: number }>();
  for (const [leaf, phases] of phasesByLeaf) {
    const distribution = observeSophistication(phases);
    result.set(leaf, {
      distribution,
      phase: modeSophistication(distribution),
      expected: expectedSophistication(distribution),
    });
  }
  return result;
}
