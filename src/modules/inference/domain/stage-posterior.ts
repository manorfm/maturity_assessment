export type Stage = 0 | 1 | 2 | 3 | 4;

export type AnchoredResponse = {
  anchor: Stage;
  options: Stage[];
  discrimination: number;
  perspectiveReliability: number;
  severity: number;
};

export type StagePosterior = {
  probabilities: [number, number, number, number, number];
  index: number;
  band: [number, number];
};

const stages: Stage[] = [0, 1, 2, 3, 4];

export function observeStage(responses: AnchoredResponse[], prior?: [number, number, number, number, number]): StagePosterior {
  const base = prior ?? [0.2, 0.2, 0.2, 0.2, 0.2];
  const unnormalized = stages.map((stage) => base[stage] * likelihood(stage, responses) * layerGate(stage, responses));
  const total = unnormalized.reduce((sum, value) => sum + value, 0) || 1;
  const probabilities = unnormalized.map((value) => value / total) as StagePosterior['probabilities'];
  const expectation = probabilities.reduce((sum, probability, stage) => sum + probability * stage, 0);
  return {
    probabilities,
    index: Math.round((expectation / 4) * 100),
    band: credibleBand(probabilities),
  };
}

function likelihood(stage: Stage, responses: AnchoredResponse[]): number {
  return responses.reduce((product, response) => {
    let local = 0;
    for (const lived of stages) {
      local += proximity(lived, stage) * choice(response, lived);
    }
    return product * local;
  }, 1);
}

function proximity(lived: Stage, stage: Stage): number {
  const weight = Math.exp(-1.2 * Math.abs(lived - stage));
  const normalizer = stages.reduce<number>((sum, candidate) => sum + Math.exp(-1.2 * Math.abs(candidate - stage)), 0);
  return weight / normalizer;
}

function choice(response: AnchoredResponse, lived: Stage): number {
  const kappa = response.discrimination * response.perspectiveReliability;
  const perceived = lived + response.severity;
  const weights = response.options.map((option) => Math.exp(-kappa * Math.abs(option - perceived)));
  const total = weights.reduce((sum, weight) => sum + weight, 0) || 1;
  const chosen = response.options.indexOf(response.anchor);
  return (weights[chosen] ?? 0) / total;
}

function layerGate(stage: Stage, responses: AnchoredResponse[]): number {
  if (stage <= 2) return 1;
  const highest = Math.max(0, ...responses.map((response) => response.anchor));
  if (stage === 3) return highest >= 3 ? 1 : 0.35;
  return highest >= 4 ? 1 : 0.25;
}

function credibleBand(probabilities: StagePosterior['probabilities']): [number, number] {
  const ranked = probabilities.map((probability, stage) => ({ stage, probability })).sort((left, right) => right.probability - left.probability);
  let mass = 0;
  const kept: number[] = [];
  for (const item of ranked) {
    kept.push(item.stage);
    mass += item.probability;
    if (mass >= 0.9) break;
  }
  const lower = Math.min(...kept);
  const upper = Math.max(...kept);
  return [Math.round((lower / 4) * 100), Math.round((upper / 4) * 100)];
}

export type IndexPublication =
  | { published: false; reason: string }
  | {
    published: true;
    index: number;
    band: [number, number];
    coverage: number;
    target?: number;
    /** Posterior 0–4 quando disponível para P(melhora) (05 §9). */
    distribution?: readonly [number, number, number, number, number];
  };

export function publishIndex(input: {
  respondents: number;
  testlets: number;
  perspectives: number;
  singleLens?: boolean;
  posterior: StagePosterior;
  coverage: number;
  target?: number;
}): IndexPublication {
  if (input.respondents < 5) return { published: false, reason: 'Menos de 5 respondentes neste recorte.' };
  if (input.testlets < 2) return { published: false, reason: 'Menos de 2 testlets distintos.' };
  if (input.perspectives < 2 && !input.singleLens) return { published: false, reason: 'Menos de 2 perspectivas elegíveis.' };
  const width = input.posterior.band[1] - input.posterior.band[0];
  if (width > 50) return { published: false, reason: 'Faixa larga demais para publicar índice.' };
  return {
    published: true,
    index: input.posterior.index,
    band: input.posterior.band,
    coverage: input.coverage,
    ...(input.target !== undefined ? { target: input.target } : {}),
  };
}
