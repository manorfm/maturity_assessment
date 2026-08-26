import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DomainValidationError } from '../src/shared/errors.js';
import { OrganizationPath, ProjectName } from '../src/modules/projects/domain/project.js';
import { AssessmentProfile, InvitationQuantity } from '../src/modules/assessments/domain/invitation.js';
import { CapabilityAssessment } from '../src/modules/inference/domain/capability-assessment.js';
import { TeamClassification } from '../src/modules/inference/domain/team-classification.js';

test('value objects rejeitam estados inválidos na fronteira do domínio', () => {
  assert.throws(() => ProjectName.create('  '), DomainValidationError);
  assert.throws(() => OrganizationPath.create('Empresa//Time'), DomainValidationError);
  assert.throws(() => AssessmentProfile.create('administrator'), DomainValidationError);
  assert.throws(() => InvitationQuantity.create(101), DomainValidationError);
});

test('avaliação de capacidade reduz confiança quando evidências se contradizem', () => {
  const consistent = CapabilityAssessment.from([2, 2, 1, 2]);
  const contradictory = CapabilityAssessment.from([2, 2, -2, -2]);
  assert.ok(consistent.confidence > contradictory.confidence);
  assert.equal(contradictory.hasContradiction, true);
  assert.ok(consistent.level >= 0 && consistent.level <= 4);
});

test('classificação sociotécnica é limitada pela capacidade e unidade mais frágeis', () => {
  const local = TeamClassification.from([
    { id: 'flow', label: 'Fluxo', level: 3.4, confidence: .8 },
    { id: 'learning', label: 'Aprendizado', level: 2.2, confidence: .9 },
  ]);
  assert.equal(local.label, 'Repetível');
  assert.deepEqual(local.limitingCapabilities, ['Aprendizado']);
  const rolledUp = local.constrainedBy([TeamClassification.at(1, ['Time B'])]);
  assert.equal(rolledUp.label, 'Reativo');
  assert.deepEqual(rolledUp.limitingCapabilities, ['Time B']);
});

test('value objects normalizam valores válidos uma única vez', () => {
  assert.equal(ProjectName.create('  Assessment Core  ').value, 'Assessment Core');
  assert.deepEqual(OrganizationPath.create(' Empresa / Tribo / Time ').segments, ['Empresa', 'Tribo', 'Time']);
  assert.equal(AssessmentProfile.create('quality').value, 'quality');
  assert.equal(InvitationQuantity.create(5).value, 5);
});
