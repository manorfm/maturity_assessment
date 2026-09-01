import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  COGNITIVE_VALIDATION_PROTOCOL,
  WAVE_SIX_SHOWCASE_CASES,
  evaluateShowcaseCoverage,
} from '../src/modules/inference/domain/showcase-validation.js';

test('onda seis declara os seis contrastes sem usar estrutura ou ferramenta como score', () => {
  assert.deepEqual(WAVE_SIX_SHOWCASE_CASES.map((item) => item.id), [
    'low-autonomy-handoffs',
    'full-cycle-without-sre',
    'specialist-organization',
    'same-symptom-different-causes',
    'unknown-technology-estate',
    'strong-practice-simple-tool',
  ]);
  assert.ok(WAVE_SIX_SHOWCASE_CASES.every((item) => item.observation.length > 0));
  assert.ok(WAVE_SIX_SHOWCASE_CASES.every((item) => item.expectedDistinction.length > 0));
  assert.ok(WAVE_SIX_SHOWCASE_CASES.every((item) => item.nonInference.length > 0));
});

test('mesmo sintoma exige demonstrar causas de feedback, política e acoplamento', () => {
  const contrast = WAVE_SIX_SHOWCASE_CASES.find((item) => item.id === 'same-symptom-different-causes');
  assert.deepEqual(contrast?.expectedMechanisms, ['tooling-feedback', 'batch-policy', 'architecture-coupling']);
});

test('cobertura sintética informa ausências sem alegar validação humana', () => {
  const report = evaluateShowcaseCoverage(['low-autonomy-handoffs', 'full-cycle-without-sre']);
  assert.equal(report.syntheticCoverageComplete, false);
  assert.equal(report.humanValidationSatisfied, false);
  assert.ok(report.missingCaseIds.includes('unknown-technology-estate'));

  const complete = evaluateShowcaseCoverage(WAVE_SIX_SHOWCASE_CASES.map((item) => item.id));
  assert.equal(complete.syntheticCoverageComplete, true);
  assert.equal(complete.humanValidationSatisfied, false);
});

test('protocolo cognitivo preserva oito observações e cinco entrevistas reais por perspectiva', () => {
  assert.equal(COGNITIVE_VALIDATION_PROTOCOL.minimumInterviewsPerPerspective, 5);
  assert.deepEqual(COGNITIVE_VALIDATION_PROTOCOL.observations, [
    'scenario-comprehension',
    'concrete-event-retrieval',
    'option-fit',
    'option-overlap',
    'artificial-terms',
    'desirable-answer-bias',
    'autonomy-recognition',
    'guidance-utility-and-explanation',
  ]);
  assert.equal(COGNITIVE_VALIDATION_PROTOCOL.syntheticEvidenceAccepted, false);
});
