import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DomainValidationError } from '../src/shared/errors.js';
import { OrganizationPath, ProjectName } from '../src/modules/projects/domain/project.js';
import { AssessmentProfile, InvitationQuantity } from '../src/modules/assessments/domain/invitation.js';

test('value objects rejeitam estados inválidos na fronteira do domínio', () => {
  assert.throws(() => ProjectName.create('  '), DomainValidationError);
  assert.throws(() => OrganizationPath.create('Empresa//Time'), DomainValidationError);
  assert.throws(() => AssessmentProfile.create('administrator'), DomainValidationError);
  assert.throws(() => InvitationQuantity.create(101), DomainValidationError);
});

test('value objects normalizam valores válidos uma única vez', () => {
  assert.equal(ProjectName.create('  Assessment Core  ').value, 'Assessment Core');
  assert.deepEqual(OrganizationPath.create(' Empresa / Tribo / Time ').segments, ['Empresa', 'Tribo', 'Time']);
  assert.equal(AssessmentProfile.create('quality').value, 'quality');
  assert.equal(InvitationQuantity.create(5).value, 5);
});

