import type { Database } from '../../shared/database.js';
import { id } from '../../shared/ids.js';
import { AdaptiveQuestionSelector, type QuestionCandidate } from '../inference/domain/adaptive-question-selector.js';
import { BayesianInferenceEngine } from '../inference/domain/bayesian-inference-engine.js';
import { DiagnosticModel } from '../inference/domain/diagnostic-model.js';

type HypothesisRow = { family_key: string; capability: string; hypothesis_key: string; label: string; prior: number };
type LikelihoodRow = { pattern: string; evidence_group: string; hypothesis_key: string; likelihood: number };

export class AdaptiveJourneyService {
  constructor(private readonly db: Database) {}

  selectAfterTerminal(participationId: string, profile: string, graphVersion: string): string | undefined {
    const adaptiveQuestions = Number((this.db.prepare('SELECT COUNT(*) total FROM inference_snapshots WHERE participation_id = ?').get(participationId) as { total: number }).total);
    if (adaptiveQuestions >= 5) return undefined;
    const modelVersion = (this.db.prepare("SELECT version FROM inference_model_versions WHERE graph_version = ? AND status = 'published' LIMIT 1").get(graphVersion) as { version: string } | undefined)?.version;
    if (!modelVersion) return undefined;
    const family = this.mostUncertainFamily(modelVersion, participationId);
    if (!family) return undefined;
    const candidates = this.questionCandidates(modelVersion, family.familyId, participationId, profile, family.hypotheses.map((item) => item.id));
    const selected = new AdaptiveQuestionSelector().select(family, candidates);
    if (!selected || selected.informationGain <= .05) return undefined;
    this.db.prepare('INSERT INTO inference_snapshots (id, model_version, participation_id, family_key, posterior_json, selected_question_key, selection_reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id(), modelVersion, participationId, family.familyId, JSON.stringify(family.hypotheses), selected.id, selected.reasons.join(' '), new Date().toISOString());
    return selected.id;
  }

  private mostUncertainFamily(modelVersion: string, participationId: string) {
    const rows = this.db.prepare('SELECT family_key, capability, hypothesis_key, label, prior FROM diagnostic_hypotheses WHERE model_version = ? ORDER BY family_key, hypothesis_key').all(modelVersion) as unknown as HypothesisRow[];
    const observed = this.db.prepare('SELECT DISTINCT s.pattern FROM responses r JOIN participations p ON p.id = r.participation_id JOIN assessment_signals s ON s.graph_version = p.graph_version AND s.node_key = r.node_id AND s.option_key = r.option_id WHERE p.id = ?').all(participationId) as unknown as Array<{ pattern: string }>;
    const families = [...new Set(rows.map((row) => row.family_key))].map((familyId) => {
      const hypotheses = rows.filter((row) => row.family_key === familyId);
      const likelihoodRows = this.db.prepare('SELECT pattern, evidence_group, hypothesis_key, likelihood FROM evidence_likelihoods WHERE model_version = ? AND family_key = ?').all(modelVersion, familyId) as unknown as LikelihoodRow[];
      const patterns = [...new Set(likelihoodRows.map((row) => row.pattern))];
      return { id: familyId, capability: hypotheses[0]!.capability, hypotheses: hypotheses.map((row) => ({ id: row.hypothesis_key, label: row.label, prior: Number(row.prior) })), evidence: patterns.map((pattern) => ({ pattern, group: likelihoodRows.find((row) => row.pattern === pattern)!.evidence_group, likelihoods: Object.fromEntries(likelihoodRows.filter((row) => row.pattern === pattern).map((row) => [row.hypothesis_key, Number(row.likelihood)])) })) };
    });
    const posteriors = new BayesianInferenceEngine().infer(DiagnosticModel.create({ version: modelVersion, families }), observed.map((row) => row.pattern));
    return posteriors.filter((item) => item.evidenceUsed.length > 0).sort((left, right) => right.entropy - left.entropy)[0];
  }

  private questionCandidates(modelVersion: string, familyId: string, participationId: string, profile: string, hypothesisIds: string[]): QuestionCandidate[] {
    const observedPatterns = new Set((this.db.prepare('SELECT DISTINCT s.pattern FROM responses r JOIN participations p ON p.id = r.participation_id JOIN assessment_signals s ON s.graph_version = p.graph_version AND s.node_key = r.node_id AND s.option_key = r.option_id WHERE p.id = ?').all(participationId) as unknown as Array<{ pattern: string }>).map((item) => item.pattern));
    const rows = this.db.prepare(`
      SELECT DISTINCT q.node_key, q.cost, q.applicability_patterns_json FROM question_observations q
      JOIN inference_model_versions m ON m.version = q.model_version
      JOIN assessment_nodes n ON n.graph_version = m.graph_version AND n.node_key = q.node_key
      JOIN assessment_signals s ON s.graph_version = m.graph_version AND s.node_key = q.node_key
      WHERE q.model_version = ? AND n.node_type = 'probe'
        AND q.profiles_json LIKE ?
        AND s.detail_capabilities LIKE ?
        AND q.node_key NOT IN (SELECT node_id FROM responses WHERE participation_id = ?)
    `).all(modelVersion, `%${profile}%`, `%${familyId}%`, participationId) as unknown as Array<{ node_key: string; cost: number; applicability_patterns_json: string }>;
    return rows.filter((row) => {
      const required = JSON.parse(row.applicability_patterns_json) as string[];
      return required.length === 0 || required.some((pattern) => observedPatterns.has(pattern));
    }).map((row) => {
      const options = this.db.prepare('SELECT o.option_key, s.pattern, s.weight FROM assessment_options o JOIN inference_model_versions m ON m.graph_version = o.graph_version LEFT JOIN assessment_signals s ON s.graph_version = o.graph_version AND s.node_key = o.node_key AND s.option_key = o.option_key WHERE m.version = ? AND o.node_key = ? ORDER BY o.position').all(modelVersion, row.node_key) as unknown as Array<{ option_key: string; pattern: string | null; weight: number | null }>;
      const optionIds = [...new Set(options.map((item) => item.option_key))];
      const outcomes = optionIds.map((optionId) => {
        const patterns = options.filter((item) => item.option_key === optionId).flatMap((item) => item.pattern ? [item.pattern] : []);
        return { probability: 1 / optionIds.length, likelihoods: Object.fromEntries(hypothesisIds.map((hypothesisId) => [hypothesisId, hypothesisId === 'unknown' ? .4 : patterns.includes(hypothesisId) ? .85 : .3])) };
      });
      const weights = options.flatMap((item) => item.weight === null ? [] : [Number(item.weight)]);
      return { id: row.node_key, cost: Number(row.cost), coverage: 0, validationNeed: weights.some((value) => value > 0) && weights.some((value) => value < 0) ? 1 : .5, outcomes };
    });
  }
}
