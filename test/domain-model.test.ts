import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DomainValidationError } from '../src/shared/errors.js';
import { OrganizationPath, ProjectName } from '../src/modules/projects/domain/project.js';
import { AssessmentProfile, InvitationQuantity } from '../src/modules/assessments/domain/invitation.js';
import { CapabilityAssessment } from '../src/modules/inference/domain/capability-assessment.js';
import { TeamClassification } from '../src/modules/inference/domain/team-classification.js';
import { CapabilityTaxonomy } from '../src/modules/inference/domain/capability-taxonomy.js';
import { formatMaturityLevel, renderCapabilityDiagnosis } from '../src/modules/projects/project-routes.js';

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

test('taxonomia separa seis capacidades e explicita cobertura temática', () => {
  const measure = (id: string, label: string, level: number, coverage = 1) => ({ id, label, level, confidence: 1, evidence: 5, hasContradiction: false, coverage });
  const branches = CapabilityTaxonomy.organize([
    measure('product-direction', 'Direção e alinhamento', 4), measure('discovery-validation', 'Descoberta e validação', 3),
    measure('planning-refinement', 'Planejamento e refinamento', 3), measure('continuous-integration', 'Integração contínua', 2),
    measure('architecture-decisions', 'Decisões arquiteturais', 4), measure('evolvability', 'Evolutibilidade', 4),
    measure('platform-autonomy', 'Plataforma e autonomia', 1), measure('observability-practice', 'Observabilidade', 2), measure('incident-management', 'Gestão de incidentes', 2),
  ]);
  assert.deepEqual(branches.map((branch) => branch.id), ['product-value', 'delivery-flow', 'engineering-quality', 'architecture-evolution', 'operations-platform', 'organizational-system']);
  assert.equal(branches.find((branch) => branch.id === 'product-value')?.level, 3);
  assert.equal(branches.find((branch) => branch.id === 'delivery-flow')?.level, 2);
  assert.equal(branches.find((branch) => branch.id === 'architecture-evolution')?.level, 4);
  assert.equal(branches.find((branch) => branch.id === 'operations-platform')?.level, 1);
  assert.ok((branches.find((branch) => branch.id === 'product-value')?.coverage ?? 1) < 1);
});

test('ramo não publica nota sustentada por uma única folha', () => {
  const measure = (id: string, coverage: number) => ({ id, label: id, level: 3.5, confidence: 1, evidence: 20, hasContradiction: false, coverage });
  const engineering = CapabilityTaxonomy.organize([
    measure('sustainable-design', 1), measure('sdlc-automation', .5), measure('software-security', .5),
  ]).find((branch) => branch.id === 'engineering-quality')!;
  assert.equal(engineering.coverage, .4);
  assert.equal(engineering.assessed, false);
  assert.equal(engineering.level, 0);
});

test('value objects normalizam valores válidos uma única vez', () => {
  assert.equal(ProjectName.create('  Assessment Core  ').value, 'Assessment Core');
  assert.deepEqual(OrganizationPath.create(' Empresa / Tribo / Time ').segments, ['Empresa', 'Tribo', 'Time']);
  assert.equal(AssessmentProfile.create('quality').value, 'quality');
  assert.equal(InvitationQuantity.create(5).value, 5);
});

test('diagnóstico distingue força sustentada de ausência de evidência problemática', () => {
  const capability = { id: 'governance', label: 'Governança', level: 3.7, confidence: 1, evidence: 10, hasContradiction: false, assessed: true, coverage: 1, children: [] };
  const diagnosis = renderCapabilityDiagnosis([], capability);
  assert.match(diagnosis, /não discriminam uma intervenção/i);
  assert.match(diagnosis, /evento recente/i);
  assert.doesNotMatch(diagnosis, /Nenhum problema recorrente atingiu/);
});

test('nota inteira não exibe casa decimal sem informação', () => {
  assert.equal(formatMaturityLevel(4), '4');
  assert.equal(formatMaturityLevel(3.7), '3.7');
});
