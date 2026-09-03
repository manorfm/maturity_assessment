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
  'release-feedback',
  'organizational-system',
  'technical-capability',
  'software-security',
  'evolvability',
  'organizational-learning',
];

test('catálogo publica nove referências comportamentais versionadas', () => {
  assert.equal(capabilityReferenceVersion, 'capability-reference-v6');
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

test('aprendizado organizacional exige efeito revisto no evento seguinte', () => {
  const reference = capabilityReferenceCatalog['organizational-learning'];
  assert.ok(reference);
  assert.match(reference.stage(1).behavior, /crise|aç[oõ]es|reativ/i);
  assert.match(reference.stage(3).behavior, /efeito|evento seguinte|revis/i);
  assert.match(`${reference.stage(4).behavior} ${reference.stage(4).effect}`, /feedback|aprend|sistema/i);
  assert.doesNotMatch(reference.stages.map((item) => `${item.behavior} ${item.effect}`).join(' '), /retrospectiva|post-mortem|treinamento|repositório/i);
  assert.ok(reference.interpretationLimits.some((item) => /retrospectiva|post-mortem|treinamento|repositório/i.test(item)));
});

test('evolutibilidade é avaliada pelo custo da mudança seguinte, não pelo estilo arquitetural', () => {
  const reference = capabilityReferenceCatalog.evolvability;
  assert.ok(reference);
  assert.match(reference.stage(1).behavior, /coorden|contorno|grande/i);
  assert.match(reference.stage(3).behavior, /limite|contrato|mudança/i);
  assert.match(`${reference.stage(4).behavior} ${reference.stage(4).effect}`, /feedback|efeito|aprend|mudança seguinte/i);
  assert.doesNotMatch(reference.stages.map((item) => `${item.behavior} ${item.effect}`).join(' '), /DDD|microsserviç|TOGAF/i);
  assert.ok(reference.interpretationLimits.some((item) => /DDD|microsserviç|arquitetura|documentaç/i.test(item)));
});

test('segurança é avaliada pela decisão sobre risco, não pela presença de controle', () => {
  const reference = capabilityReferenceCatalog['software-security'];
  assert.ok(reference);
  assert.match(reference.stage(1).behavior, /tardi|incidente|especialista/i);
  assert.match(reference.stage(3).behavior, /risco|desenho|decis[aã]o/i);
  assert.match(`${reference.stage(4).behavior} ${reference.stage(4).effect}`, /feedback|efeito|aprend|exceç/i);
  assert.doesNotMatch(reference.stages.map((item) => `${item.behavior} ${item.effect}`).join(' '), /SAST|scanner|checklist|AppSec/i);
  assert.ok(reference.interpretationLimits.some((item) => /SAST|scanner|checklist|especialista/i.test(item)));
});

test('competência é avaliada pelo trabalho distribuído, não por formação declarada', () => {
  const reference = capabilityReferenceCatalog['technical-capability'];
  assert.ok(reference);
  assert.match(reference.stage(1).behavior, /concentr|ausente|especialista/i);
  assert.match(reference.stage(3).behavior, /mais pessoas|distribu|trabalho/i);
  assert.match(`${reference.stage(4).behavior} ${reference.stage(4).effect}`, /efeito|feedback|aprend|distribui/i);
  assert.doesNotMatch(reference.stages.map((item) => `${item.behavior} ${item.effect}`).join(' '), /certificaç[aã]o|matriz de compet[eê]ncia|cargo/i);
  assert.ok(reference.interpretationLimits.some((item) => /curso|certificaç[aã]o|cargo|matriz/i.test(item)));
});

test('release é avaliado por decisão, efeito e aprendizado, não por mecanismo nominal', () => {
  const reference = capabilityReferenceCatalog['release-feedback'];
  assert.ok(reference);
  assert.match(reference.stage(3).behavior, /decis[aã]o|mudança|exposiç[aã]o/i);
  assert.match(`${reference.stage(4).behavior} ${reference.stage(4).effect}`, /feedback|efeito|aprend/i);
  assert.doesNotMatch(reference.stages.map((item) => `${item.behavior} ${item.effect}`).join(' '), /GitOps|Argo|Jenkins|Kubernetes/i);
  assert.ok(reference.interpretationLimits.some((item) => /ferramenta|pipeline|estrat[eé]gia/i.test(item)));
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
