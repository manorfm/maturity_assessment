import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  COGNITIVE_VALIDATION_PROTOCOL,
  WAVE_SIX_SHOWCASE_CASES,
  evaluateHumanShowcaseValidation,
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

test('gate humano evidencia lacunas por contraste e perspectiva sem contar revisão genérica', () => {
  const report = evaluateHumanShowcaseValidation([
    { showcaseCaseId: 'low-autonomy-handoffs', profile: 'engineering', acceptable: true },
    { profile: 'engineering', acceptable: true },
  ], ['engineering', 'quality']);
  assert.equal(report.humanValidationSatisfied, false);
  assert.equal(report.caseCoverage['low-autonomy-handoffs'], 1);
  assert.equal(report.perspectiveCoverage.engineering, 1);
  assert.ok(report.missingCaseIds.includes('full-cycle-without-sre'));
  assert.deepEqual(report.missingPerspectives, ['engineering', 'quality']);
});

test('gate humano só abre com massa real, todos os contrastes e linguagem aceitável', () => {
  const perspectives = ['engineering', 'quality'];
  const reviews = perspectives.flatMap((profile) => Array.from({ length: 5 }, (_, index) => ({
    showcaseCaseId: WAVE_SIX_SHOWCASE_CASES[index % WAVE_SIX_SHOWCASE_CASES.length]!.id,
    profile,
    acceptable: true,
  })));
  reviews.push({ showcaseCaseId: 'strong-practice-simple-tool', profile: 'engineering', acceptable: true });
  const ready = evaluateHumanShowcaseValidation(reviews, perspectives);
  assert.equal(ready.humanValidationSatisfied, true);
  const unsafe = evaluateHumanShowcaseValidation([...reviews, {
    showcaseCaseId: 'strong-practice-simple-tool', profile: 'quality', acceptable: false,
  }], perspectives);
  assert.equal(unsafe.humanValidationSatisfied, false);
  assert.deepEqual(unsafe.problematicCaseIds, ['strong-practice-simple-tool']);
});
