import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CapabilityReference,
  capabilityReferenceCatalog,
  capabilityReferenceVersion,
} from '../src/modules/inference/domain/capability-reference.js';
import { DomainValidationError } from '../src/shared/errors.js';

const initialCapabilities = [
  'discovery-validation',
  'sdlc-automation',
  'platform-autonomy',
  'organizational-system',
];

test('catálogo inicial publica quatro referências comportamentais versionadas', () => {
  assert.equal(capabilityReferenceVersion, 'capability-reference-v1');
  assert.deepEqual(Object.keys(capabilityReferenceCatalog), initialCapabilities);

  for (const capabilityId of initialCapabilities) {
    const reference = capabilityReferenceCatalog[capabilityId]!;
    assert.equal(reference.capabilityId, capabilityId);
    assert.equal(reference.assessmentBasis, 'behavior-and-effect-only');
    assert.deepEqual(reference.stages.map((stage) => stage.level), [0, 1, 2, 3, 4]);
    assert.ok(reference.purpose.length >= 60, capabilityId);
    assert.ok(reference.evidenceRequired.length >= 2, capabilityId);
    assert.ok(reference.enablingConditions.length >= 2, capabilityId);
    assert.ok(reference.regressionSignals.length >= 2, capabilityId);
    assert.ok(reference.interpretationLimits.length >= 2, capabilityId);
    for (const stage of reference.stages) {
      assert.ok(stage.behavior.length >= 50, `${capabilityId}/${stage.level}/behavior`);
      assert.ok(stage.effect.length >= 40, `${capabilityId}/${stage.level}/effect`);
      assert.ok(stage.underPressure.length >= 40, `${capabilityId}/${stage.level}/underPressure`);
    }
  }
});

test('nível quatro exige adaptação por efeito e não adoção nominal', () => {
  for (const reference of Object.values(capabilityReferenceCatalog)) {
    const adaptive = reference.stage(4);
    assert.match(`${adaptive.behavior} ${adaptive.effect}`, /feedback|resultado|efeito|aprend/i, reference.capabilityId);
    assert.doesNotMatch(`${adaptive.behavior} ${adaptive.effect}`, /possui|adotou|implantou|usa (?:uma|um|o|a)/i, reference.capabilityId);
  }
});

test('referência rejeita estágios incompletos e base de pontuação nominal', () => {
  const labels = ['Opaco', 'Reativo', 'Repetível', 'Gerenciado', 'Adaptativo'] as const;
  const validStage = (level: 0 | 1 | 2 | 3 | 4) => ({
    level,
    label: labels[level],
    behavior: 'Um comportamento suficientemente observável é reconstruído no trabalho recente.',
    effect: 'O efeito produzido no sistema de trabalho pode ser verificado.',
    underPressure: 'Sob pressão, a reação do sistema continua sendo observável.',
  });
  const input = {
    capabilityId: 'example',
    title: 'Exemplo',
    purpose: 'Explicar com detalhe suficiente o propósito operacional desta capacidade no fluxo.',
    assessmentBasis: 'behavior-and-effect-only' as const,
    stages: [0, 1, 2, 3].map((level) => validStage(level as 0 | 1 | 2 | 3 | 4)),
    evidenceRequired: ['Um evento recente.', 'Uma consequência observada.'],
    enablingConditions: ['Autoridade compatível.', 'Retorno observável.'],
    regressionSignals: ['Dependência pessoal reaparece.', 'O retorno deixa de alterar decisões.'],
    compatiblePractices: ['Prática condicionada ao diagnóstico.'],
    optionalToolFamilies: ['Família opcional.'],
    interpretationLimits: ['Presença nominal não pontua.', 'Ausência nominal não penaliza.'],
  };

  assert.throws(() => CapabilityReference.create(input), DomainValidationError);
  assert.throws(() => CapabilityReference.create({
    ...input,
    assessmentBasis: 'nominal-adoption' as never,
    stages: [0, 1, 2, 3, 4].map((level) => validStage(level as 0 | 1 | 2 | 3 | 4)),
  }), DomainValidationError);
});
