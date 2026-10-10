import type { FindingSeverity } from './diagnostic-contract.js';
import type { OutcomeFinding } from './report-outcome.js';

export type ExplainedFindingWeight = { severity: number; reach: number };

export type CauseScoreInput = {
  causeId: string;
  probability: number;
  explained: ExplainedFindingWeight[];
};

export type PrimaryConstraint = {
  causeId: string;
  title: string;
  score: number;
  explainedPatterns: string[];
};

const severityWeight: Record<FindingSeverity, number> = {
  low: 0.35,
  moderate: 0.55,
  high: 0.8,
  critical: 1,
  undetermined: 0.4,
};

/** escore(causa) = P(causa) × Σ severidade(achado) × alcance(achado) (08 §4). */
export function scoreCause(input: CauseScoreInput): number {
  const sum = input.explained.reduce((total, item) => total + item.severity * item.reach, 0);
  return input.probability * sum;
}

/**
 * Identifica a restrição principal entre achados publicados.
 * Cada padrão de causa (ou o próprio padrão do achado) compete pelo escore.
 */
export function identifyPrimaryConstraint(findings: OutcomeFinding[]): PrimaryConstraint | undefined {
  if (!findings.length) return undefined;
  const byCause = new Map<string, { title: string; probability: number; explained: ExplainedFindingWeight[]; patterns: string[] }>();

  for (const finding of findings) {
    const causeId = causeKey(finding);
    const current = byCause.get(causeId) ?? {
      title: finding.title,
      probability: finding.confidence,
      explained: [],
      patterns: [],
    };
    current.probability = Math.max(current.probability, finding.confidence);
    current.explained.push({
      severity: severityWeight[finding.severity ?? 'moderate'],
      reach: finding.priorityFactors?.reach ?? Math.min(1, (finding.affectedCapabilities?.length ?? 1) / 3),
    });
    current.patterns.push(finding.pattern);
    byCause.set(causeId, current);
  }

  let best: PrimaryConstraint | undefined;
  for (const [causeId, value] of byCause) {
    const score = scoreCause({
      causeId,
      probability: value.probability,
      explained: value.explained,
    });
    if (!best || score > best.score) {
      best = { causeId, title: value.title, score, explainedPatterns: value.patterns };
    }
  }
  return best;
}

function causeKey(finding: OutcomeFinding): string {
  if (finding.pattern.startsWith('causa-')) return finding.pattern;
  const alternative = finding.causalAnalysis?.alternatives.find((item) => item.startsWith('causa-'));
  return alternative ?? finding.pattern;
}
