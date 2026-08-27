import type { Database } from '../../shared/database.js';
import { DomainValidationError } from '../../shared/errors.js';
import { id } from '../../shared/ids.js';
import { profiles as catalogProfiles } from '../catalog/assessment-graph.js';
import { PilotEvaluation, type CognitiveReview, type ExternalLabel, type PilotReport } from './domain/pilot-evaluation.js';
import { PILOT_THRESHOLDS } from './domain/pilot-policy.js';

const allowedProfiles = new Set(Object.keys(catalogProfiles));

export class PilotService {
  constructor(private readonly db: Database) {}

  recordLabel(input: ExternalLabel & { modelVersion: string }): void {
    const label = validateLabel(input);
    this.db.prepare(`INSERT INTO pilot_labels
      (id, case_key, model_version, family_key, predicted_hypothesis, predicted_confidence, labeled_hypothesis, stopped_without_cause, reviewer_discipline, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(model_version, case_key, family_key, reviewer_discipline) DO UPDATE SET
        predicted_hypothesis=excluded.predicted_hypothesis, predicted_confidence=excluded.predicted_confidence,
        labeled_hypothesis=excluded.labeled_hypothesis, stopped_without_cause=excluded.stopped_without_cause`).run(
      id(), label.caseKey, input.modelVersion, label.familyKey, label.predictedHypothesis, label.predictedConfidence, label.labeledHypothesis, label.stoppedWithoutCause ? 1 : 0, label.reviewerDiscipline, new Date().toISOString(),
    );
  }

  recordCognitiveReview(input: CognitiveReview): void {
    if (!input.nodeKey.trim()) throw new DomainValidationError();
    if (!allowedProfiles.has(input.profile)) throw new DomainValidationError();
    this.db.prepare('INSERT INTO item_reviews (id, node_key, profile, comprehension_ok, gold_option_bias, visibility_exit_used, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id(), input.nodeKey, input.profile, input.comprehensionOk ? 1 : 0, input.goldOptionBias ? 1 : 0, input.visibilityExitUsed ? 1 : 0, new Date().toISOString());
  }

  summarize(modelVersion: string): PilotReport {
    const labels = this.db.prepare('SELECT case_key, family_key, predicted_hypothesis, predicted_confidence, labeled_hypothesis, stopped_without_cause, reviewer_discipline FROM pilot_labels WHERE model_version = ?')
      .all(modelVersion) as unknown as Array<{ case_key: string; family_key: string; predicted_hypothesis: string; predicted_confidence: number; labeled_hypothesis: string; stopped_without_cause: number; reviewer_discipline: string }>;
    const reviews = this.db.prepare('SELECT node_key, profile, comprehension_ok, gold_option_bias, visibility_exit_used FROM item_reviews')
      .all() as unknown as Array<{ node_key: string; profile: string; comprehension_ok: number; gold_option_bias: number; visibility_exit_used: number }>;
    return PilotEvaluation.from(labels.map((row) => ({
      caseKey: row.case_key, familyKey: row.family_key, predictedHypothesis: row.predicted_hypothesis,
      predictedConfidence: Number(row.predicted_confidence), labeledHypothesis: row.labeled_hypothesis,
      stoppedWithoutCause: Number(row.stopped_without_cause) === 1, reviewerDiscipline: row.reviewer_discipline,
    })), reviews.map((row) => ({
      nodeKey: row.node_key, profile: row.profile, comprehensionOk: Number(row.comprehension_ok) === 1,
      goldOptionBias: Number(row.gold_option_bias) === 1, visibilityExitUsed: Number(row.visibility_exit_used) === 1,
    })), this.policy(modelVersion));
  }

  proposeRevision(modelVersion: string): { version: string; status: 'draft' } {
    const summary = this.summarize(modelVersion);
    if (summary.gate !== 'ready_for_revision') throw new DomainValidationError('A calibração permanece bloqueada; o posterior publicado continua provisório.');
    const source = this.db.prepare('SELECT graph_version, policy_json FROM inference_model_versions WHERE version = ?').get(modelVersion) as { graph_version: string; policy_json: string } | undefined;
    if (!source) throw new DomainValidationError();
    const version = `${modelVersion}-revision-${new Date().toISOString().slice(0, 10)}`;
    this.db.prepare('INSERT INTO inference_model_versions (version, graph_version, status, policy_json, published_at) VALUES (?, ?, ?, ?, ?)')
      .run(version, source.graph_version, 'draft', source.policy_json, new Date().toISOString());
    this.db.prepare('INSERT INTO diagnostic_hypotheses (model_version, family_key, capability, hypothesis_key, label, prior) SELECT ?, family_key, capability, hypothesis_key, label, prior FROM diagnostic_hypotheses WHERE model_version = ?')
      .run(version, modelVersion);
    this.db.prepare('INSERT INTO evidence_likelihoods (model_version, family_key, pattern, evidence_group, hypothesis_key, likelihood) SELECT ?, family_key, pattern, evidence_group, hypothesis_key, likelihood FROM evidence_likelihoods WHERE model_version = ?')
      .run(version, modelVersion);
    this.db.prepare('INSERT INTO question_observations (model_version, node_key, profiles_json, applicability_patterns_json, cost) SELECT ?, node_key, profiles_json, applicability_patterns_json, cost FROM question_observations WHERE model_version = ?')
      .run(version, modelVersion);
    return { version, status: 'draft' };
  }

  private policy(modelVersion: string): typeof PILOT_THRESHOLDS {
    const row = this.db.prepare('SELECT policy_json FROM inference_model_versions WHERE version = ?').get(modelVersion) as { policy_json: string } | undefined;
    const parsed = row ? JSON.parse(row.policy_json) as { pilot?: Partial<typeof PILOT_THRESHOLDS> } : {};
    return { ...PILOT_THRESHOLDS, ...parsed.pilot };
  }
}

function validateLabel(input: ExternalLabel & { modelVersion: string }): ExternalLabel {
  if (!input.modelVersion.trim() || !input.caseKey.trim() || !input.familyKey.trim() || !input.predictedHypothesis.trim() || !input.labeledHypothesis.trim()) throw new DomainValidationError();
  if (!allowedProfiles.has(input.reviewerDiscipline)) throw new DomainValidationError();
  if (!Number.isFinite(input.predictedConfidence) || input.predictedConfidence < 0 || input.predictedConfidence > 1) throw new DomainValidationError();
  if (/\b(participation|invitation|resume|token)\b/i.test(input.caseKey)) throw new DomainValidationError();
  return input;
}

export { PILOT_THRESHOLDS };
