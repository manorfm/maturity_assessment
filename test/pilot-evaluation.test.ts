import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PILOT_THRESHOLDS } from '../src/modules/inference/domain/pilot-policy.js';
import { PilotEvaluation, type CognitiveReview, type ExternalLabel } from '../src/modules/inference/domain/pilot-evaluation.js';
import { PilotService } from '../src/modules/inference/pilot-service.js';
import { createDatabase } from '../src/shared/database.js';
import { GRAPH_VERSION } from '../src/modules/catalog/assessment-graph.js';
import { CatalogService } from '../src/modules/catalog/catalog-service.js';

const discipline = 'engineering';
const label = (overrides: Partial<ExternalLabel> = {}): ExternalLabel => ({
  caseKey: 'case-1', familyKey: 'continuous-integration:slow-feedback', predictedHypothesis: 'slow-feedback',
  predictedConfidence: .85, labeledHypothesis: 'slow-feedback', stoppedWithoutCause: false, reviewerDiscipline: discipline, ...overrides,
});

function enoughReviews(): CognitiveReview[] {
  return ['management', 'product', 'quality', 'engineering', 'platform'].flatMap((profile) =>
    Array.from({ length: PILOT_THRESHOLDS.minCognitiveReviewsPerProfile }, (_, index) => ({
      nodeKey: `node-${index}`, profile, comprehensionOk: true, goldOptionBias: false, visibilityExitUsed: false,
    })));
}

function enoughLabels(match = true): ExternalLabel[] {
  return Array.from({ length: PILOT_THRESHOLDS.minLabeledCases }, (_, index) => label({
    caseKey: `case-${index}`,
    labeledHypothesis: match ? 'slow-feedback' : 'unknown',
  }));
}

test('limiares do piloto são pré-declarados e não dependem de clique', () => {
  assert.equal(PILOT_THRESHOLDS.minLabeledCases, 50);
  assert.equal(PILOT_THRESHOLDS.decisionThreshold, .7);
  assert.equal(PILOT_THRESHOLDS.maxFalsePositiveRate, .2);
});

test('zero rótulos bloqueia a calibração e mantém o posterior provisório', () => {
  const report = PilotEvaluation.from([]);
  assert.equal(report.gate, 'blocked');
  assert.equal(report.labeledCases, 0);
  assert.equal(report.calibration, null);
  assert.match(report.blockers[0]!, /Revisão cega insuficiente/);
});

test('falso positivo e parada incorreta usam só rótulo externo', () => {
  const report = PilotEvaluation.from([
    label({ predictedHypothesis: 'slow-feedback', labeledHypothesis: 'process-gap', predictedConfidence: .9 }),
    label({ caseKey: 'case-2', stoppedWithoutCause: true, predictedHypothesis: 'unknown', predictedConfidence: .4, labeledHypothesis: 'slow-feedback' }),
  ]);
  assert.equal(report.falsePositiveRate, 1);
  assert.equal(report.incorrectStopRate, .5);
  assert.equal(report.gate, 'blocked');
});

test('discordância entre avaliadores é medida no mesmo caso, não na pessoa', () => {
  const report = PilotEvaluation.from([
    label({ reviewerDiscipline: 'engineering' }),
    label({ reviewerDiscipline: 'quality', labeledHypothesis: 'unknown' }),
  ]);
  assert.equal(report.raterDisagreement, 1);
});

test('gate só abre com massa, entrevistas cognitivas e métricas dentro do limiar', () => {
  const blocked = PilotEvaluation.from(enoughLabels(true));
  assert.equal(blocked.gate, 'blocked');
  assert.ok(blocked.blockers.some((item) => /cognitivas/.test(item)));
  const ready = PilotEvaluation.from(enoughLabels(true), enoughReviews());
  assert.equal(ready.gate, 'ready_for_revision');
  assert.deepEqual(ready.blockers, []);
  assert.ok(ready.calibration);
  assert.ok(ready.calibration!.brierScore < PILOT_THRESHOLDS.maxBrierScore);
});

test('rótulos persistidos não guardam participação, convite ou resposta', () => {
  const db = createDatabase(':memory:');
  new CatalogService(db);
  const columns = (db.prepare('PRAGMA table_info(pilot_labels)').all() as Array<{ name: string }>).map((row) => row.name);
  assert.equal(columns.some((name) => /participation|invitation|resume|response|token/i.test(name)), false);
  const pilot = new PilotService(db);
  const modelVersion = `${GRAPH_VERSION}-bayesian-v2`;
  pilot.recordLabel({ ...label(), modelVersion });
  const stored = db.prepare('SELECT case_key, predicted_hypothesis, labeled_hypothesis FROM pilot_labels').get() as { case_key: string };
  assert.equal(stored.case_key, 'case-1');
  const summary = pilot.summarize(modelVersion);
  assert.equal(summary.labeledCases, 1);
  assert.equal(summary.gate, 'blocked');
});

test('mesmo com métricas suficientes o modelo publicado não muda sozinho', () => {
  const db = createDatabase(':memory:');
  new CatalogService(db);
  const pilot = new PilotService(db);
  const modelVersion = `${GRAPH_VERSION}-bayesian-v2`;
  const published = db.prepare("SELECT version, status FROM inference_model_versions WHERE status = 'published'").get() as { version: string };
  for (const item of enoughLabels(true)) pilot.recordLabel({ ...item, modelVersion });
  for (const item of enoughReviews()) pilot.recordCognitiveReview(item);
  const summary = pilot.summarize(modelVersion);
  assert.equal(summary.gate, 'ready_for_revision');
  const draft = pilot.proposeRevision(modelVersion);
  assert.equal(draft.status, 'draft');
  assert.notEqual(draft.version, published.version);
  assert.equal((db.prepare("SELECT status FROM inference_model_versions WHERE version = ?").get(published.version) as { status: string }).status, 'published');
  assert.equal((db.prepare("SELECT COUNT(*) total FROM inference_model_versions WHERE status = 'published'").get() as { total: number }).total, 1);
});

test('sem limiar atendido não propõe revisão de priors', () => {
  const db = createDatabase(':memory:');
  new CatalogService(db);
  const pilot = new PilotService(db);
  assert.throws(() => pilot.proposeRevision(`${GRAPH_VERSION}-bayesian-v2`), /provisório|bloqueado|rótulo/i);
});
