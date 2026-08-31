export type PilotThresholds = {
  minLabeledCases: number;
  minCognitiveReviewsPerProfile: number;
  maxFalsePositiveRate: number;
  maxIncorrectStopRate: number;
  maxExpectedCalibrationError: number;
  maxBrierScore: number;
  maxRaterDisagreement: number;
  decisionThreshold: number;
};

export const PILOT_THRESHOLDS: PilotThresholds = Object.freeze({
  minLabeledCases: 50,
  minCognitiveReviewsPerProfile: 5,
  maxFalsePositiveRate: .2,
  maxIncorrectStopRate: .25,
  maxExpectedCalibrationError: .15,
  maxBrierScore: .25,
  maxRaterDisagreement: .3,
  decisionThreshold: .7,
});

export const INITIAL_COGNITIVE_PILOT_SIZE = 8;

export function assertPilotThresholds(value: PilotThresholds): PilotThresholds {
  for (const [name, amount] of Object.entries(value)) {
    if (!Number.isFinite(amount) || amount < 0) throw new Error(`Invalid pilot threshold: ${name}`);
  }
  if (!Number.isInteger(value.minLabeledCases) || value.minLabeledCases < 1) throw new Error('Pilot requires a positive labeled-case minimum');
  if (!Number.isInteger(value.minCognitiveReviewsPerProfile) || value.minCognitiveReviewsPerProfile < 1) throw new Error('Pilot requires a positive cognitive-review minimum');
  if (value.decisionThreshold <= 0 || value.decisionThreshold >= 1) throw new Error('Decision threshold must be between zero and one');
  return value;
}
