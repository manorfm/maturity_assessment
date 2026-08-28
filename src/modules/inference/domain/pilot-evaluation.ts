import { CalibrationMetrics, type CalibrationReport } from './calibration-metrics.js';
import { PILOT_THRESHOLDS, assertPilotThresholds, type PilotThresholds } from './pilot-policy.js';
import { profiles } from '../../catalog/assessment-graph.js';

export type ExternalLabel = {
  caseKey: string;
  familyKey: string;
  predictedHypothesis: string;
  predictedConfidence: number;
  labeledHypothesis: string;
  stoppedWithoutCause: boolean;
  reviewerDiscipline: string;
};

export type CognitiveReview = { nodeKey: string; profile: string; comprehensionOk: boolean; interpretationMatch: boolean; optionFit: boolean; optionOverlap: boolean; retrievalDifficulty: boolean; goldOptionBias: boolean; visibilityExitUsed: boolean; confusingTerm?: string };
export type PilotGate = 'blocked' | 'ready_for_revision';
export type PilotReport = {
  policy: PilotThresholds;
  labeledCases: number;
  cognitiveReviews: number;
  cognitiveCoverage: Record<string, number>;
  cognitiveIssues: Record<string, number>;
  raterDisagreement: number | null;
  falsePositiveRate: number | null;
  incorrectStopRate: number | null;
  calibration: CalibrationReport | null;
  gate: PilotGate;
  blockers: string[];
};

export class PilotEvaluation {
  static from(labels: ExternalLabel[], reviews: CognitiveReview[] = [], policy: PilotThresholds = PILOT_THRESHOLDS): PilotReport {
    const thresholds = assertPilotThresholds(policy);
    const cases = uniqueCases(labels);
    const published = labels.filter((item) => item.predictedHypothesis !== 'unknown' && item.predictedConfidence >= thresholds.decisionThreshold);
    const falsePositives = published.filter((item) => item.labeledHypothesis !== item.predictedHypothesis);
    const incorrectStops = labels.filter((item) => item.stoppedWithoutCause && item.labeledHypothesis !== 'unknown');
    const calibration = published.length
      ? CalibrationMetrics.evaluate(published.map((item) => ({ confidence: item.predictedConfidence, outcome: item.labeledHypothesis === item.predictedHypothesis ? 1 : 0 })), thresholds.decisionThreshold)
      : null;
    const falsePositiveRate = published.length ? falsePositives.length / published.length : null;
    const incorrectStopRate = labels.length ? incorrectStops.length / labels.length : null;
    const raterDisagreement = disagreementRate(labels);
    const cognitiveCoverage = countBy(reviews.map((item) => item.profile));
    const cognitiveIssues = {
      comprehension: reviews.filter((item) => !item.comprehensionOk).length,
      interpretation: reviews.filter((item) => !item.interpretationMatch).length,
      optionFit: reviews.filter((item) => !item.optionFit).length,
      optionOverlap: reviews.filter((item) => item.optionOverlap).length,
      retrieval: reviews.filter((item) => item.retrievalDifficulty).length,
      desirability: reviews.filter((item) => item.goldOptionBias).length,
    };
    const blockers = [
      ...(cases.length < thresholds.minLabeledCases ? [`Revisão cega insuficiente: ${cases.length} de ${thresholds.minLabeledCases} jornadas rotuladas.`] : []),
      ...missingCognitiveProfiles(cognitiveCoverage, thresholds.minCognitiveReviewsPerProfile),
      ...(falsePositiveRate !== null && falsePositiveRate > thresholds.maxFalsePositiveRate ? [`Falso positivo ${formatRate(falsePositiveRate)} acima do limiar ${formatRate(thresholds.maxFalsePositiveRate)}.`] : []),
      ...(incorrectStopRate !== null && incorrectStopRate > thresholds.maxIncorrectStopRate ? [`Parada incorreta ${formatRate(incorrectStopRate)} acima do limiar ${formatRate(thresholds.maxIncorrectStopRate)}.`] : []),
      ...(raterDisagreement !== null && raterDisagreement > thresholds.maxRaterDisagreement ? [`Discordância entre avaliadores ${formatRate(raterDisagreement)} acima do limiar ${formatRate(thresholds.maxRaterDisagreement)}.`] : []),
      ...(calibration && calibration.expectedCalibrationError > thresholds.maxExpectedCalibrationError ? [`ECE ${calibration.expectedCalibrationError.toFixed(3)} acima do limiar ${thresholds.maxExpectedCalibrationError}.`] : []),
      ...(calibration && calibration.brierScore > thresholds.maxBrierScore ? [`Brier ${calibration.brierScore.toFixed(3)} acima do limiar ${thresholds.maxBrierScore}.`] : []),
    ];
    return {
      policy: thresholds,
      labeledCases: cases.length,
      cognitiveReviews: reviews.length,
      cognitiveCoverage,
      cognitiveIssues,
      raterDisagreement,
      falsePositiveRate,
      incorrectStopRate,
      calibration,
      gate: blockers.length ? 'blocked' : 'ready_for_revision',
      blockers,
    };
  }
}

function uniqueCases(labels: ExternalLabel[]): string[] {
  return [...new Set(labels.map((item) => `${item.caseKey}:${item.familyKey}`))];
}

function disagreementRate(labels: ExternalLabel[]): number | null {
  const grouped = new Map<string, { reviewers: number; hypotheses: Set<string> }>();
  for (const item of labels) {
    const key = `${item.caseKey}:${item.familyKey}`;
    const current = grouped.get(key) ?? { reviewers: 0, hypotheses: new Set<string>() };
    current.reviewers += 1;
    current.hypotheses.add(item.labeledHypothesis);
    grouped.set(key, current);
  }
  const compared = [...grouped.values()].filter((item) => item.reviewers >= 2);
  if (!compared.length) return null;
  return compared.filter((item) => item.hypotheses.size > 1).length / compared.length;
}

function missingCognitiveProfiles(coverage: Record<string, number>, minimum: number): string[] {
  return Object.keys(profiles).flatMap((profile) => (coverage[profile] ?? 0) < minimum
    ? [`Entrevistas cognitivas insuficientes para ${profile}: ${coverage[profile] ?? 0} de ${minimum}.`]
    : []);
}

function countBy(values: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}

function formatRate(value: number): string {
  return `${Math.round(value * 100)}%`;
}
