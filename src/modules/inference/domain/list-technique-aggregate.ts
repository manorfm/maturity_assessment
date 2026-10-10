import { estimateListTechniquePrevalence } from '../../catalog/item-catalog.js';

export type ListTechniqueAnswer = { arm: 'control' | 'treatment'; count: number };

export type ListTechniquePublication = {
  published: boolean;
  controlN: number;
  treatmentN: number;
  prevalence?: number;
  interval?: [number, number];
  reason?: string;
};

/**
 * Agrega prevalência sensível pela diferença de médias (07 §4.4 / Blair & Imai).
 * Só publica com ≥ minimumPerArm por braço; não alimenta estágio de prática.
 */
export function aggregateListTechnique(input: {
  answers: readonly ListTechniqueAnswer[];
  minimumPerArm: number;
}): ListTechniquePublication {
  const control = input.answers.filter((answer) => answer.arm === 'control');
  const treatment = input.answers.filter((answer) => answer.arm === 'treatment');
  const controlN = control.length;
  const treatmentN = treatment.length;
  if (controlN < input.minimumPerArm || treatmentN < input.minimumPerArm) {
    return {
      published: false,
      controlN,
      treatmentN,
      reason: `Técnica de lista exige ≥ ${input.minimumPerArm} pessoas por braço.`,
    };
  }
  const controlMean = control.reduce((sum, answer) => sum + answer.count, 0) / controlN;
  const treatmentMean = treatment.reduce((sum, answer) => sum + answer.count, 0) / treatmentN;
  const estimated = estimateListTechniquePrevalence({
    controlMean,
    treatmentMean,
    controlN,
    treatmentN,
  });
  if (!estimated.publishable) {
    return { published: false, controlN, treatmentN, reason: estimated.reason };
  }
  return {
    published: true,
    controlN,
    treatmentN,
    prevalence: estimated.prevalence,
    interval: estimated.interval,
  };
}

export function parseListTechniqueCount(optionId: string): number | undefined {
  const match = /^count-(\d+)$/.exec(optionId);
  if (!match) return undefined;
  return Number(match[1]);
}
