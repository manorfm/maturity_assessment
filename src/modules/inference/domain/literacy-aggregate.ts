import type { ItemReading } from '../../catalog/item-types.js';

export type LiteracyAnswer = { optionId: string };

export type LiteracyPublication = {
  published: boolean;
  n: number;
  correctRate?: number;
  incorrectRate?: number;
  absentRate?: number;
  reason?: string;
};

/**
 * Agrega a variável de letramento (07 §4.2 / 04 §5), separada da prática.
 * Só publica acima do limiar de agregação vigente.
 */
export function aggregateLiteracy(input: {
  answers: readonly LiteracyAnswer[];
  readings: readonly ItemReading[];
  minimum: number;
}): LiteracyPublication {
  const byOption = new Map(input.readings.map((reading) => [reading.id, reading.verdict]));
  let correct = 0;
  let incorrect = 0;
  let absent = 0;
  let n = 0;
  for (const answer of input.answers) {
    const verdict = byOption.get(answer.optionId);
    if (!verdict) continue;
    n += 1;
    if (verdict === 'correct') correct += 1;
    else if (verdict === 'literacy-absent') absent += 1;
    else incorrect += 1;
  }
  if (n < input.minimum) {
    return { published: false, n, reason: `Letramento exige ≥ ${input.minimum} respostas aplicáveis.` };
  }
  return {
    published: true,
    n,
    correctRate: Number((correct / n).toFixed(3)),
    incorrectRate: Number((incorrect / n).toFixed(3)),
    absentRate: Number((absent / n).toFixed(3)),
  };
}
