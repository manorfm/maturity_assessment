import type { UnitPosterior } from './unit-posterior.js';

export type Publishability = 'published' | 'observed-imprecise' | 'not-evaluated';

export type PublicationDecision = {
  publishable: Publishability;
  reasons: string[];
};

/**
 * Regra de publicação por folha (05 §6):
 * 1. ≥ 5 respondentes
 * 2. ≥ 2 testlets
 * 3. ≥ 2 perspectivas (ou lente única explícita)
 * 4. faixa 90% com largura ≤ 50 p.p. (2 estágios)
 */
export function publishUnitReading(input: {
  posterior: UnitPosterior;
  respondents: number;
  testlets: number;
  perspectives: number;
  coverage: number;
  singleLens?: boolean;
}): PublicationDecision {
  const reasons: string[] = [];
  const sampleOk = input.respondents >= 5;
  const testletsOk = input.testlets >= 2;
  const perspectivesOk = input.perspectives >= 2 || Boolean(input.singleLens);
  if (!sampleOk) reasons.push('respondents-below-5');
  if (!testletsOk) reasons.push('testlets-below-2');
  if (!perspectivesOk) reasons.push('perspectives-below-2');

  if (!sampleOk || !testletsOk || !perspectivesOk) {
    return { publishable: 'not-evaluated', reasons };
  }

  const width = input.posterior.interval90[1] - input.posterior.interval90[0];
  if (width > 50) {
    return { publishable: 'observed-imprecise', reasons: ['interval-wider-than-2-stages'] };
  }

  return { publishable: 'published', reasons: [] };
}
