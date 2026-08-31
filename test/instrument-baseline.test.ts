import assert from 'node:assert/strict';
import { test } from 'node:test';
import { graph, nodeVariants, profileIds, profiles } from '../src/modules/catalog/assessment-graph.js';
import { instrumentGapFixtures, measureInstrumentBaseline } from '../src/modules/catalog/instrument-baseline.js';
import { evolutionCatalog, interventionCatalog } from '../src/modules/inference/inference-service.js';
import { interventionFoundations } from '../src/modules/inference/domain/intervention-foundations.js';

const interventions = { ...interventionCatalog, ...evolutionCatalog };

test('linha de base mede percurso, autoria e profundidade por perspectiva', () => {
  const baseline = measureInstrumentBaseline({ graph, nodeVariants, profiles, interventions, foundations: interventionFoundations });

  assert.equal(baseline.graphVersion, 'evidence-anamnesis-pilot-v8');
  assert.equal(baseline.nodes.total, 81);
  assert.deepEqual(baseline.nodes.byType, { context: 5, scenario: 57, probe: 19 });
  assert.equal(Object.keys(baseline.routes).length, profileIds.length);
  for (const profile of profileIds) {
    assert.ok(baseline.routes[profile].scenarios >= 40, profile);
    assert.ok(baseline.routes[profile].estimatedMinutes >= 25, profile);
    assert.equal(baseline.authorship.profileVariants[profile], nodeVariants.filter((variant) => variant.profile === profile).length);
  }
  assert.ok(baseline.authorship.commonTrunkNodes >= 35);
  assert.ok(baseline.authorship.commonTrunkRatio > .4);
  assert.ok(baseline.authorship.causalProbeNodes > 0);
  assert.equal(baseline.authorship.nodesWithoutVisibilityExit, 0);
});

test('linha de base torna visível dívida de fundamentos e contratos de direção', () => {
  const baseline = measureInstrumentBaseline({ graph, nodeVariants, profiles, interventions, foundations: interventionFoundations });

  assert.equal(baseline.direction.totalInterventions, Object.keys(interventions).length);
  assert.ok(baseline.direction.genericFoundations >= 60);
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
