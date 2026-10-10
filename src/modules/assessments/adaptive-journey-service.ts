import type { Database } from '../../shared/database.js';
import { id } from '../../shared/ids.js';
import { itemCatalog } from '../catalog/item-catalog.js';
import { AdaptiveQuestionSelector, type QuestionCandidate } from '../inference/domain/adaptive-question-selector.js';
import { BayesianInferenceEngine } from '../inference/domain/bayesian-inference-engine.js';
import { DiagnosticModel } from '../inference/domain/diagnostic-model.js';
import { preferredProbeIds } from '../inference/domain/reinforcement-routing.js';
import {
  buildUnitLeafCoverage,
  nextVignetteInRotation,
  type LeafCoverageCounts,
  type UnitObservation,
} from '../inference/domain/unit-leaf-coverage.js';

type HypothesisRow = { family_key: string; capability: string; hypothesis_key: string; label: string; prior: number };
type LikelihoodRow = { pattern: string; evidence_group: string; hypothesis_key: string; likelihood: number };

const VIGNETTE_IDS = new Set(itemCatalog.filter((item) => item.kind === 'vignette').map((item) => item.id));

export class AdaptiveJourneyService {
  constructor(private readonly db: Database) {}

  selectAfterTerminal(participationId: string, profile: string, graphVersion: string): string | undefined {
    const adaptiveQuestions = Number((this.db.prepare('SELECT COUNT(*) total FROM inference_snapshots WHERE participation_id = ?').get(participationId) as { total: number }).total);
    if (adaptiveQuestions >= 5) return undefined;
    const modelVersion = (this.db.prepare("SELECT version FROM inference_model_versions WHERE graph_version = ? AND status = 'published' LIMIT 1").get(graphVersion) as { version: string } | undefined)?.version;
    if (!modelVersion) return undefined;
    const preferredIds = preferredProbeIds(this.observedPatterns(participationId));
    const answeredTestlets = this.answeredNodes(participationId);
    const ranked = this.uncertainFamilies(modelVersion, participationId).flatMap((family) => {
      const candidates = this.questionCandidates(modelVersion, family.capability, participationId, profile, family.hypotheses.map((item) => item.id));
      const selected = new AdaptiveQuestionSelector().select(family, candidates, { preferredIds, answeredTestlets });
      return selected ? [{ family, selected }] : [];
    }).sort((left, right) => right.selected.utility - left.selected.utility || right.selected.informationGain - left.selected.informationGain);
    const choice = ranked[0];
    if (!choice || choice.selected.utility < 0.01) return undefined;
    const { family, selected } = choice;
    this.db.prepare('INSERT INTO inference_snapshots (id, model_version, participation_id, family_key, posterior_json, selected_question_key, selection_reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id(), modelVersion, participationId, family.familyId, JSON.stringify(family.hypotheses), selected.id, selected.reasons.join(' '), new Date().toISOString());
    return selected.id;
  }

  /**
   * Escolhe probe com cobertura matricial da unidade (06 §4).
   * Usado quando a unidade já tem cobertura mista; o caminho quente do tronco
   * permanece em `selectAfterTerminal` para não alterar sintéticos calibrados.
   */
  selectWithUnitCoverage(participationId: string, profile: string, graphVersion: string): string | undefined {
    const adaptiveQuestions = Number((this.db.prepare('SELECT COUNT(*) total FROM inference_snapshots WHERE participation_id = ?').get(participationId) as { total: number }).total);
    if (adaptiveQuestions >= 5) return undefined;
    const modelVersion = (this.db.prepare("SELECT version FROM inference_model_versions WHERE graph_version = ? AND status = 'published' LIMIT 1").get(graphVersion) as { version: string } | undefined)?.version;
    if (!modelVersion) return undefined;
    const participation = this.db.prepare('SELECT project_id, unit_id FROM participations WHERE id = ?')
      .get(participationId) as { project_id: string; unit_id: string } | undefined;
    if (!participation) return undefined;

    const preferredIds = preferredProbeIds(this.observedPatterns(participationId));
    const answeredTestlets = this.answeredNodes(participationId);
    const leafCoverage = this.unitLeafCoverage(String(participation.project_id), participation.unit_id);
    const ranked = this.uncertainFamilies(modelVersion, participationId).flatMap((family) => {
      const candidates = this.questionCandidates(modelVersion, family.capability, participationId, profile, family.hypotheses.map((item) => item.id), true);
      const selected = new AdaptiveQuestionSelector().select(family, candidates, {
        preferredIds,
        answeredTestlets,
        leafCoverage,
      });
      return selected ? [{ family, selected }] : [];
    }).sort((left, right) => right.selected.utility - left.selected.utility || right.selected.informationGain - left.selected.informationGain);
    const choice = ranked[0];
    if (!choice || choice.selected.utility < 0.01) return undefined;
    const { family, selected } = choice;
    this.db.prepare('INSERT INTO inference_snapshots (id, model_version, participation_id, family_key, posterior_json, selected_question_key, selection_reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id(), modelVersion, participationId, family.familyId, JSON.stringify(family.hypotheses), selected.id, selected.reasons.join(' '), new Date().toISOString());
    return selected.id;
  }

  /** Próxima vinheta do rodízio na unidade (06 §3); inserção no tronco permanece WP7. */
  selectVignette(participationId: string): string | undefined {
    const answered = this.answeredNodes(participationId);
    const asked = [...answered].filter((nodeId) => VIGNETTE_IDS.has(nodeId)).length;
    if (asked >= 2) return undefined;
    const rotated = nextVignetteInRotation([...VIGNETTE_IDS], this.vignetteAskCounts(participationId));
    if (!rotated || answered.has(rotated)) return undefined;
    const participation = this.db.prepare('SELECT graph_version FROM participations WHERE id = ?')
      .get(participationId) as { graph_version: string } | undefined;
    if (!participation || !this.nodeExists(participation.graph_version, rotated)) return undefined;
    return rotated;
  }

  /** Cobertura matricial das 29 folhas na unidade (06 §4). */
  unitLeafCoverage(projectId: string, unitId: string): Record<string, LeafCoverageCounts> {
    const rows = this.db.prepare(`
      SELECT s.detail_capabilities, r.node_id AS testlet_id, p.profile
      FROM responses r
      JOIN participations p ON p.id = r.participation_id
      JOIN assessment_signals s ON s.graph_version = p.graph_version AND s.node_key = r.node_id AND s.option_key = r.option_id
      WHERE p.project_id = ? AND p.unit_id = ? AND p.status IN ('completed', 'in_progress')
    `).all(projectId, unitId) as unknown as Array<{ detail_capabilities: string; testlet_id: string; profile: string }>;

    const observations: UnitObservation[] = [];
    for (const row of rows) {
      const leaves = JSON.parse(row.detail_capabilities) as string[];
      for (const leafId of leaves) {
        observations.push({ leafId, testletId: row.testlet_id, profile: row.profile });
      }
    }
    return buildUnitLeafCoverage(observations);
  }

  private vignetteAskCounts(participationId: string): Record<string, number> {
    const row = this.db.prepare('SELECT project_id, unit_id FROM participations WHERE id = ?')
      .get(participationId) as { project_id: string; unit_id: string } | undefined;
    if (!row) return {};
    const counts: Record<string, number> = {};
    for (const vignetteId of VIGNETTE_IDS) counts[vignetteId] = 0;
    if (!VIGNETTE_IDS.size) return counts;
    const rows = this.db.prepare(`
      SELECT r.node_id, COUNT(*) total
      FROM responses r
      JOIN participations p ON p.id = r.participation_id
      WHERE p.project_id = ? AND p.unit_id = ? AND r.node_id IN (${[...VIGNETTE_IDS].map(() => '?').join(',')})
      GROUP BY r.node_id
    `).all(row.project_id, row.unit_id, ...VIGNETTE_IDS) as unknown as Array<{ node_id: string; total: number }>;
    for (const item of rows) counts[item.node_id] = Number(item.total);
    return counts;
  }

  private uncertainFamilies(modelVersion: string, participationId: string) {
    const rows = this.db.prepare('SELECT family_key, capability, hypothesis_key, label, prior FROM diagnostic_hypotheses WHERE model_version = ? ORDER BY family_key, hypothesis_key').all(modelVersion) as unknown as HypothesisRow[];
    const observed = this.db.prepare('SELECT DISTINCT s.pattern FROM responses r JOIN participations p ON p.id = r.participation_id JOIN assessment_signals s ON s.graph_version = p.graph_version AND s.node_key = r.node_id AND s.option_key = r.option_id WHERE p.id = ?').all(participationId) as unknown as Array<{ pattern: string }>;
    const families = [...new Set(rows.map((row) => row.family_key))].map((familyId) => {
      const hypotheses = rows.filter((row) => row.family_key === familyId);
      const likelihoodRows = this.db.prepare('SELECT pattern, evidence_group, hypothesis_key, likelihood FROM evidence_likelihoods WHERE model_version = ? AND family_key = ?').all(modelVersion, familyId) as unknown as LikelihoodRow[];
      const patterns = [...new Set(likelihoodRows.map((row) => row.pattern))];
      return { id: familyId, capability: hypotheses[0]!.capability, hypotheses: hypotheses.map((row) => ({ id: row.hypothesis_key, label: row.label, prior: Number(row.prior) })), evidence: patterns.map((pattern) => ({ pattern, group: likelihoodRows.find((row) => row.pattern === pattern)!.evidence_group, likelihoods: Object.fromEntries(likelihoodRows.filter((row) => row.pattern === pattern).map((row) => [row.hypothesis_key, Number(row.likelihood)])) })) };
    });
    const posteriors = new BayesianInferenceEngine().infer(DiagnosticModel.create({ version: modelVersion, families }), observed.map((row) => row.pattern));
    return posteriors.filter((item) => item.evidenceUsed.length > 0).sort((left, right) => right.entropy - left.entropy);
  }

  private questionCandidates(
    modelVersion: string,
    capability: string,
    participationId: string,
    profile: string,
    hypothesisIds: string[],
    withLeafMeta = false,
  ): QuestionCandidate[] {
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
    `).all(modelVersion, `%${profile}%`, `%${capability}%`, participationId) as unknown as Array<{ node_key: string; cost: number; applicability_patterns_json: string }>;
    return rows.filter((row) => {
      if (VIGNETTE_IDS.has(row.node_key)) return false;
      const required = JSON.parse(row.applicability_patterns_json) as string[];
      return required.length === 0 || required.some((pattern) => observedPatterns.has(pattern));
    }).map((row) => {
      const options = this.db.prepare('SELECT o.option_key, s.pattern, s.weight, s.detail_capabilities FROM assessment_options o JOIN inference_model_versions m ON m.graph_version = o.graph_version LEFT JOIN assessment_signals s ON s.graph_version = o.graph_version AND s.node_key = o.node_key AND s.option_key = o.option_key WHERE m.version = ? AND o.node_key = ? ORDER BY o.position').all(modelVersion, row.node_key) as unknown as Array<{ option_key: string; pattern: string | null; weight: number | null; detail_capabilities: string | null }>;
      const optionIds = [...new Set(options.map((item) => item.option_key))];
      const outcomes = optionIds.map((optionId) => {
        const patterns = options.filter((item) => item.option_key === optionId).flatMap((item) => item.pattern ? [item.pattern] : []);
        return { probability: 1 / optionIds.length, likelihoods: Object.fromEntries(hypothesisIds.map((hypothesisId) => [hypothesisId, hypothesisId === 'unknown' ? .4 : patterns.includes(hypothesisId) ? .95 : .1])) };
      });
      const weights = options.flatMap((item) => item.weight === null ? [] : [Number(item.weight)]);
      const leafId = options.map((item) => item.detail_capabilities ? (JSON.parse(item.detail_capabilities) as string[])[0] : undefined).find(Boolean) ?? capability;
      const base: QuestionCandidate = {
        id: row.node_key,
        cost: Number(row.cost),
        coverage: 0,
        validationNeed: weights.some((value) => value > 0) && weights.some((value) => value < 0) ? 1 : .5,
        outcomes,
      };
      if (!withLeafMeta) return base;
      return { ...base, leafId, testletId: row.node_key, kind: 'probe' };
    });
  }

  private observedPatterns(participationId: string): string[] {
    return (this.db.prepare('SELECT DISTINCT s.pattern FROM responses r JOIN participations p ON p.id = r.participation_id JOIN assessment_signals s ON s.graph_version = p.graph_version AND s.node_key = r.node_id AND s.option_key = r.option_id WHERE p.id = ?').all(participationId) as unknown as Array<{ pattern: string }>).map((row) => row.pattern);
  }

  private answeredNodes(participationId: string): Set<string> {
    const rows = this.db.prepare('SELECT node_id FROM responses WHERE participation_id = ?').all(participationId) as unknown as Array<{ node_id: string }>;
    return new Set(rows.map((row) => row.node_id));
  }

  private nodeExists(graphVersion: string, nodeKey: string): boolean {
    return Boolean(this.db.prepare('SELECT 1 FROM assessment_nodes WHERE graph_version = ? AND node_key = ?').get(graphVersion, nodeKey));
  }
}
