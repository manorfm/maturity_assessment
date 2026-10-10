export type NoisyOrCause = {
  id: string;
  prior: number;
};

export type NoisyOrSymptom = {
  id: string;
  leak: number;
  strengthByCause: Record<string, number>;
};

export type SymptomCount = { present: number; total: number };

const logBeta = (a: number, b: number): number => lgamma(a) + lgamma(b) - lgamma(a + b);

function lgamma(value: number): number {
  const coefficients = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5,
  ];
  let x = value;
  let y = value;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let series = 1.000000000190015;
  for (const coefficient of coefficients) {
    y += 1;
    series += coefficient / y;
  }
  return Math.log(2.5066282746310005 * series / x) - tmp;
}

function betaBinomialLog(present: number, total: number, mean: number, precision = 10): number {
  const alpha = mean * precision;
  const beta = (1 - mean) * precision;
  return logBeta(present + alpha, total - present + beta) - logBeta(alpha, beta);
}

export type NoisyOrReporting = { p1?: number; p0?: number; phi?: number };

export function inferNoisyOr(
  causes: NoisyOrCause[],
  symptoms: NoisyOrSymptom[],
  observations: Record<string, SymptomCount>,
  reporting: NoisyOrReporting = {},
): Record<string, number> {
  const p1 = reporting.p1 ?? 0.6;
  const p0 = reporting.p0 ?? 0.1;
  const phi = reporting.phi ?? 10;
  const posterior = Object.fromEntries(causes.map((cause) => [cause.id, 0]));
  let partition = 0;
  const states = 1 << causes.length;
  for (let mask = 0; mask < states; mask += 1) {
    let weight = 1;
    causes.forEach((cause, index) => {
      const on = (mask & (1 << index)) !== 0;
      weight *= on ? cause.prior : 1 - cause.prior;
    });
    for (const symptom of symptoms) {
      const observed = observations[symptom.id];
      if (!observed) continue;
      let survival = 1;
      causes.forEach((cause, index) => {
        if ((mask & (1 << index)) === 0) return;
        survival *= 1 - (symptom.strengthByCause[cause.id] ?? 0);
      });
      const probability = 1 - (1 - symptom.leak) * survival;
      const present = Math.exp(betaBinomialLog(observed.present, observed.total, p1, phi));
      const absent = Math.exp(betaBinomialLog(observed.present, observed.total, p0, phi));
      weight *= probability * present + (1 - probability) * absent;
    }
    partition += weight;
    causes.forEach((cause, index) => {
      if ((mask & (1 << index)) !== 0) posterior[cause.id] = (posterior[cause.id] ?? 0) + weight;
    });
  }
  return Object.fromEntries(causes.map((cause) => [cause.id, round2((posterior[cause.id] ?? 0) / partition)]));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Referência 05 §8.4 — mesmos λ/priors da família `late-integration` no catálogo v11. */
export const referenceWaitCauses: NoisyOrCause[] = [
  { id: 'feedback-lento', prior: 0.3 },
  { id: 'aprovacao-externa', prior: 0.3 },
  { id: 'fronteira-de-times', prior: 0.2 },
];

export const referenceWaitSymptoms: NoisyOrSymptom[] = [
  { id: 'pr-espera', leak: 0.05, strengthByCause: { 'feedback-lento': 0.6, 'aprovacao-externa': 0.4, 'fronteira-de-times': 0.2 } },
  { id: 'aprovacao-necessaria', leak: 0.05, strengthByCause: { 'feedback-lento': 0.02, 'aprovacao-externa': 0.8, 'fronteira-de-times': 0.1 } },
  { id: 'conflito-mesmo-servico', leak: 0.05, strengthByCause: { 'feedback-lento': 0.05, 'aprovacao-externa': 0.05, 'fronteira-de-times': 0.7 } },
];
