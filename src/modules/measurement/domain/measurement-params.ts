export type Discrimination = 'low' | 'medium' | 'high';
export type Stage = 0 | 1 | 2 | 3 | 4;
export type StageDistribution = readonly [number, number, number, number, number];

export type MeasurementParams = {
  version: 'm2';
  kappa: Record<Discrimination, number>;
  psi: number;
  gates: { gamma3: number; gamma4: number };
  poolingDefault: number;
};

export function defaultMeasurementParams(): MeasurementParams {
  return {
    version: 'm2',
    kappa: { low: 0.6, medium: 1.0, high: 1.6 },
    psi: 1.2,
    gates: { gamma3: 0.35, gamma4: 0.25 },
    poolingDefault: 0.5,
  };
}

export const stages: Stage[] = [0, 1, 2, 3, 4];
