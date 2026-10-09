import type { StageDistribution } from './measurement-params.js';

export type ParentIndex = {
  index: number;
  band: [number, number];
  pureMinimum: number;
  coverage?: number;
};

/** Mulberry32 — deterministic draws matching lab reproducibility needs. */
function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleStage(distribution: StageDistribution, random: () => number): number {
  const draw = random();
  let cumulative = 0;
  for (let stage = 0; stage < 5; stage += 1) {
    cumulative += distribution[stage] ?? 0;
    if (draw < cumulative) return stage;
  }
  return 4;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * sorted.length)));
  return sorted[index]!;
}

/**
 * Índice do nó pai por simulação com teto pelo elo limitante (05 §7.3).
 * valor = min(média ponderada, min(folhas)+1) / 4 · 100
 */
export function aggregateParentIndex(input: {
  leaves: Record<string, StageDistribution | number[]>;
  weights: Record<string, number>;
  draws?: number;
  seed?: number;
}): ParentIndex {
  const keys = Object.keys(input.leaves);
  const weightSum = keys.reduce((sum, key) => sum + (input.weights[key] ?? 0), 0) || 1;
  const random = createRng(input.seed ?? 1);
  const draws = input.draws ?? 10_000;
  const values: number[] = [];
  const minima: number[] = [];

  for (let draw = 0; draw < draws; draw += 1) {
    const sampled: Record<string, number> = {};
    for (const key of keys) {
      sampled[key] = sampleStage(input.leaves[key] as StageDistribution, random);
    }
    const stages = keys.map((key) => sampled[key]!);
    const average = keys.reduce((sum, key) => sum + (input.weights[key] ?? 0) * sampled[key]!, 0) / weightSum;
    const cap = Math.min(...stages) + 1;
    values.push((Math.min(average, cap) / 4) * 100);
    minima.push((Math.min(...stages) / 4) * 100);
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const pureMinimum = Math.round(minima.reduce((sum, value) => sum + value, 0) / minima.length);
  const lo = percentile(sorted, 5);
  const hi = percentile(sorted, 95);
  // Band reported in 25 p.p. steps for leaf-like display of parent example.
  const band: [number, number] = [snapBand(lo), snapBand(hi)];
  return {
    index: Math.round(mean),
    band,
    pureMinimum,
  };
}

function snapBand(value: number): number {
  return Math.round(value / 25) * 25;
}
