import assert from 'node:assert/strict';
import { test } from 'node:test';
import { graph, nodeVariants, profileIds, profiles } from '../src/modules/catalog/assessment-graph.js';
import { instrumentGapFixtures, measureInstrumentBaseline } from '../src/modules/catalog/instrument-baseline.js';
import { evolutionCatalog, interventionCatalog } from '../src/modules/inference/inference-service.js';
import { interventionFoundations } from '../src/modules/inference/domain/intervention-foundations.js';

const interventions = { ...interventionCatalog, ...evolutionCatalog };

test('linha de base mede percurso, autoria e profundidade por perspectiva', () => {
  const baseline = measureInstrumentBaseline({ graph, nodeVariants, profiles, interventions, foundations: interventionFoundations });

  assert.equal(baseline.graphVersion, 'evidence-anamnesis-pilot-v12');
  assert.equal(baseline.nodes.total, 88);
  assert.deepEqual(baseline.nodes.byType, { context: 7, scenario: 57, probe: 24 });
  assert.equal(Object.keys(baseline.routes).length, profileIds.length);
  for (const profile of profileIds) {
    assert.ok(baseline.routes[profile].scenarios >= 30, profile);
    assert.ok(baseline.routes[profile].estimatedMinutes >= 24, profile);
    assert.equal(baseline.authorship.profileVariants[profile], nodeVariants.filter((variant) => variant.profile === profile).length);
  }
  assert.equal(Object.keys(baseline.trackRoutes).length, 8);
  for (const route of Object.values(baseline.trackRoutes)) {
    assert.ok(route.events >= 2 && route.events <= 4);
    assert.ok(route.scenarios < 30);
    assert.ok(route.estimatedMinutes <= 11);
  }
  assert.ok(baseline.authorship.commonTrunkNodes >= 30);
  assert.ok(baseline.authorship.commonTrunkRatio > .34);
  assert.ok(baseline.authorship.causalProbeNodes > 0);
  assert.equal(baseline.authorship.nodesWithoutVisibilityExit, 0);
});

test('linha de base torna visível dívida de fundamentos e contratos de direção', () => {
  const baseline = measureInstrumentBaseline({ graph, nodeVariants, profiles, interventions, foundations: interventionFoundations });

  assert.equal(baseline.direction.totalInterventions, Object.keys(interventions).length);
  assert.equal(baseline.direction.genericFoundations, 13);
  assert.ok(baseline.direction.repeatedFoundationGroups.some((group) => group.count >= 10));
  assert.ok(baseline.direction.withoutExplicitGuidance > 0);
  assert.ok(baseline.direction.withoutPrerequisiteContract > 0);
  assert.deepEqual(
    [...baseline.direction.patternsWithGenericFoundation].sort(),
    Object.entries(interventionFoundations)
      .filter(([, foundation]) => foundation.why === 'A intervenção ataca o comportamento observado, não um inventário de práticas.')
      .map(([pattern]) => pattern)
      .sort(),
  );
});

test('fundamentos de fluxo, prioridade e melhoria explicam o mecanismo específico', () => {
  const promotedPatterns = [
    'acao-sem-fechamento', 'cascata-fracionada', 'prazo-sem-aprendizado',
    'iteracao-orientada-a-escopo', 'prioridade-sem-foco', 'retrospectiva-sem-fechamento',
    'melhoria-sem-prioridade', 'cerimonia-sem-adaptacao', 'processo-sem-autonomia',
    'melhoria-reativa',
  ];
  for (const pattern of promotedPatterns) {
    const foundation = interventionFoundations[pattern];
    assert.ok(foundation, pattern);
    assert.notEqual(foundation.why, 'A intervenção ataca o comportamento observado, não um inventário de práticas.', pattern);
    assert.ok(foundation.why.length >= 70, pattern);
  }
});

test('fundamentos de arquitetura e evolução explicam o mecanismo específico', () => {
  const promotedPatterns = [
    'acoplamento-coordenado', 'causa-correlacao-arquitetural',
    'causa-dependencia-arquitetural', 'causa-impacto-invisivel',
    'contrato-implicito-fragil', 'estrutura-implicita', 'evolucao-em-grande-lote',
    'migracao-coordenada-em-lote', 'planejamento-compensa-acoplamento',
    'sustentabilidade-em-grande-lote',
  ];
  for (const pattern of promotedPatterns) {
    const foundation = interventionFoundations[pattern];
    assert.ok(foundation, pattern);
    assert.notEqual(foundation.why, 'A intervenção ataca o comportamento observado, não um inventário de práticas.', pattern);
    assert.ok(foundation.why.length >= 70, pattern);
  }
});

test('fundamentos de autonomia e dependência explicam autoridade e acesso à capacidade', () => {
  const promotedPatterns = [
    'bloqueio-depende-de-coordenador', 'causa-competencia-inacessivel',
    'causa-prioridade-entre-times', 'decisao-concentrada',
    'decisao-de-confiabilidade-concentrada', 'dependencia-coordenada',
    'dependencia-operacional-sob-urgencia', 'estrutura-definida-centralmente',
    'lideranca-coordena-handoffs', 'risco-visivel-sem-poder-de-decisao',
  ];
  for (const pattern of promotedPatterns) {
    const foundation = interventionFoundations[pattern];
    assert.ok(foundation, pattern);
    assert.notEqual(foundation.why, 'A intervenção ataca o comportamento observado, não um inventário de práticas.', pattern);
    assert.ok(foundation.why.length >= 70, pattern);
  }
});

test('fundamentos de operação sustentável explicam repetibilidade e prevenção', () => {
  const promotedPatterns = [
    'ambiente-inconsistente', 'automacao-local-consistente',
    'correcao-manual-de-dados', 'divida-sem-capacidade-continua',
    'excecao-controlada', 'migracao-de-dados-contextual',
    'mitigacao-sem-prevencao', 'operacao-manual-fragil',
    'solucao-local-nao-difundida', 'verificacao-dependente-de-memoria',
  ];
  for (const pattern of promotedPatterns) {
    const foundation = interventionFoundations[pattern];
    assert.ok(foundation, pattern);
    assert.notEqual(foundation.why, 'A intervenção ataca o comportamento observado, não um inventário de práticas.', pattern);
    assert.ok(foundation.why.length >= 70, pattern);
  }
});

test('fundamentos de decisão e aprendizagem explicam como evidência muda direção', () => {
  const promotedPatterns = [
    'aprendizado-restrito', 'aprendizado-tecnico-sem-caminho-repetivel',
    'causa-acoes-sem-foco', 'causa-melhoria-sem-capacidade',
    'causa-prioridades-na-superficie', 'decisao-opaca', 'decisao-por-inercia',
    'discovery-refina-solucao-dada', 'discovery-substituida-por-patrocinio',
    'resultado-gera-ajuste-sem-revisar-direcao',
  ];
  for (const pattern of promotedPatterns) {
    const foundation = interventionFoundations[pattern];
    assert.ok(foundation, pattern);
    assert.notEqual(foundation.why, 'A intervenção ataca o comportamento observado, não um inventário de práticas.', pattern);
    assert.ok(foundation.why.length >= 70, pattern);
  }
});

test('fixtures reproduzem as cinco lacunas aceitas para as ondas seguintes', () => {
  assert.deepEqual(instrumentGapFixtures.map((fixture) => fixture.id), [
    'full-cycle-without-sre',
    'late-security-feedback',
    'unsafe-environment-path',
    'unknown-technology-estate',
    'unusable-approved-tooling',
  ]);
  for (const fixture of instrumentGapFixtures) {
    assert.equal(fixture.status, 'known-gap');
    assert.ok(fixture.observedFacts.length >= 2, fixture.id);
    assert.ok(fixture.currentLimitation.length >= 40, fixture.id);
    assert.ok(fixture.expectedFutureBehavior.length >= 40, fixture.id);
    assert.ok(fixture.protectedInvariant.length >= 40, fixture.id);
  }
});
