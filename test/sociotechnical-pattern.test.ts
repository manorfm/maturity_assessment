import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  SociotechnicalPattern,
  sociotechnicalPatternFor,
  type SociotechnicalPatternInput,
} from '../src/modules/inference/domain/sociotechnical-pattern.js';

const observedLoop: SociotechnicalPatternInput = {
  kind: 'vicious',
  behavior: 'Sob pressão, a pessoa integra um lote maior para cumprir a data.',
  enablingCondition: 'O prazo reconhece volume entregue e não tempo até feedback.',
  localRationale: 'Agrupar reduz o custo imediato de coordenação percebido pelo time.',
  systemicEffect: 'A integração tardia aumenta retrabalho e torna o próximo lote mais arriscado.',
  reinforcementHypothesis: 'O retrabalho consome capacidade e aumenta a pressão para agrupar novamente.',
  regressionSignal: 'O intervalo até a primeira integração volta a crescer.',
  observations: {
    decision: ['Uma mudança recente foi agrupada para preservar a data.'],
    consequence: ['O conflito apareceu somente na integração do lote.'],
    contrary: ['Outro time integrou cedo no mesmo contexto.'],
    missing: ['Confirmar quem define a política de lote.'],
  },
  incentive: { kind: 'deadline', effectOnDecision: 'A data tornou o lote localmente racional.' },
  boundary: { observes: 'Time de entrega', recommends: 'Liderança técnica', decides: 'Gestão de portfólio', executes: 'Time de entrega' },
  compensatingBehavior: { kind: 'coordination', description: 'Uma pessoa coordena manualmente a integração.', masks: 'A fronteira continua sem feedback reproduzível.' },
  scope: { observed: ['Empresa/Squad A'], eligible: ['Empresa/Squad A', 'Empresa/Squad B'] },
};

test('ciclo exige decisão e consequência observadas e mantém reforço como hipótese', () => {
  const pattern = SociotechnicalPattern.create(observedLoop);
  assert.equal(pattern.loop.status, 'hypothesis');
  assert.match(pattern.loop.plainLanguage, /pode reforçar/i);
  assert.deepEqual(pattern.evidence.for, [...observedLoop.observations.decision, ...observedLoop.observations.consequence]);
  assert.deepEqual(pattern.evidence.against, observedLoop.observations.contrary);
  assert.deepEqual(pattern.evidence.missing, observedLoop.observations.missing);
});

test('cultura isolada não materializa ciclo nem autoriza direção', () => {
  assert.throws(() => SociotechnicalPattern.create({
    ...observedLoop,
    enablingCondition: 'A cultura não ajuda.',
    observations: { ...observedLoop.observations, decision: [] },
  }), /decisão observada/i);
});

test('recorrência não amplia contenção além dos escopos observados', () => {
  const pattern = SociotechnicalPattern.create(observedLoop);
  assert.equal(pattern.scope.containment, 'local');
  assert.match(pattern.scope.limit, /não autoriza concluir/i);
});

test('prática local eficaz permanece padrão virtuoso sem fingir difusão', () => {
  const pattern = SociotechnicalPattern.create({
    ...observedLoop,
    kind: 'virtuous',
    behavior: 'O time integra cedo e reage ao retorno antes de ampliar a mudança.',
    systemicEffect: 'Conflitos são menores e o aprendizado chega durante a construção.',
    reinforcementHypothesis: 'O retorno rápido pode sustentar lotes menores.',
    observations: {
      ...observedLoop.observations,
      decision: ['O time decidiu integrar antes de concluir toda a mudança.'],
      consequence: ['A incompatibilidade foi corrigida no mesmo dia.'],
    },
  });
  assert.equal(pattern.kind, 'virtuous');
  assert.equal(pattern.scope.containment, 'local');
  assert.match(pattern.scope.limit, /não demonstra difusão/i);
});

test('incentivo só é publicado quando altera decisão com consequência observada', () => {
  assert.throws(() => SociotechnicalPattern.create({
    ...observedLoop,
    observations: { ...observedLoop.observations, consequence: [] },
  }), /consequência observada/i);
  assert.equal(SociotechnicalPattern.create(observedLoop).incentive?.kind, 'deadline');
});

test('divergência é lacuna de visibilidade, fronteira ou poder, não fragilidade automática', () => {
  const pattern = SociotechnicalPattern.create({
    ...observedLoop,
    divergence: { perspectives: ['Engenharia', 'Gestão'], interpretation: 'visibility-boundary-or-power' },
  });
  assert.equal(pattern.divergence?.diagnosticEffect, 'investigate');
  assert.match(pattern.divergence?.explanation ?? '', /visibilidade, fronteira de decisão ou assimetria de poder/i);
});

test('projeção causal só publica ciclo quando decisão e resultado estão triangulados', () => {
  assert.equal(sociotechnicalPatternFor({
    kind: 'correction', pattern: 'causa-processo-lote', title: 'Mudanças acumulam antes da integração', cause: 'A política preserva lotes maiores.',
    constraint: 'policy', evidence: { patterns: ['causa-processo-lote'], layers: ['practice'], profiles: ['engineering'] },
  }), undefined);

  const pattern = sociotechnicalPatternFor({
    kind: 'correction', pattern: 'causa-processo-lote', title: 'Mudanças acumulam antes da integração', cause: 'A política preserva lotes maiores.',
    constraint: 'policy', evidence: { patterns: ['lote-adiado', 'conflito-na-integracao'], layers: ['practice', 'outcome'], profiles: ['engineering', 'management'] },
  });
  assert.equal(pattern?.kind, 'vicious');
  assert.equal(pattern?.boundary.decides, 'Responsável pela política');
  assert.match(pattern?.loop.plainLanguage ?? '', /hipótese|pode reforçar/i);
});
