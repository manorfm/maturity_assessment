import assert from 'node:assert/strict';
import test from 'node:test';
import { graph, nodeVariants } from '../src/modules/catalog/assessment-graph.js';
import { capabilityReferenceCatalog } from '../src/modules/inference/domain/capability-reference.js';
import { mapCapabilityReferenceCoverage } from '../src/modules/catalog/capability-reference-coverage.js';

test('matriz relaciona as dezessete referências a sinais tipados sem inferência textual', () => {
  const matrix = mapCapabilityReferenceCoverage(graph, nodeVariants, capabilityReferenceCatalog);
  assert.equal(matrix.version, 'capability-reference-coverage-v1');
  assert.deepEqual(matrix.references.map((item) => item.capabilityId), Object.keys(capabilityReferenceCatalog));
  for (const item of matrix.references) {
    assert.ok(item.direct.patterns >= 2 || item.indirect.patterns >= 2, item.capabilityId);
    assert.ok(item.layers.length > 0, item.capabilityId);
    assert.equal(item.mixedFactAndCause, 0, item.capabilityId);
    assert.equal(item.desirabilityCues, 0, item.capabilityId);
    assert.ok(item.gaps.length > 0 || item.status === 'minimum-covered', item.capabilityId);
  }
});

test('planejamento e refinamento cobrem preparação, pressão e consequência', () => {
  const matrix = mapCapabilityReferenceCoverage(graph, nodeVariants, capabilityReferenceCatalog);
  const planning = matrix.references.find((item) => item.capabilityId === 'planning-refinement');
  assert.ok(planning);
  assert.equal(planning.status, 'minimum-covered');
  assert.ok(planning.direct.nodes >= 5);
  assert.ok(planning.direct.patterns >= 6);
  assert.deepEqual(planning.layers, ['outcome', 'practice']);
});

test('gestão do trabalho cobre fluxo, espera, bloqueio e consequência', () => {
  const matrix = mapCapabilityReferenceCoverage(graph, nodeVariants, capabilityReferenceCatalog);
  const work = matrix.references.find((item) => item.capabilityId === 'work-management');
  assert.ok(work);
  assert.equal(work.status, 'minimum-covered');
  assert.ok(work.direct.nodes >= 7);
  assert.ok(work.direct.patterns >= 10);
  assert.deepEqual(work.layers, ['outcome', 'practice', 'system']);
});

test('portfólio cobre capacidade, trade-off, funding e revisão de investimento', () => {
  const matrix = mapCapabilityReferenceCoverage(graph, nodeVariants, capabilityReferenceCatalog);
  const portfolio = matrix.references.find((item) => item.capabilityId === 'portfolio-management');
  assert.ok(portfolio);
  assert.equal(portfolio.status, 'minimum-covered');
  assert.ok(portfolio.direct.nodes >= 14);
  assert.ok(portfolio.direct.patterns >= 19);
  assert.deepEqual(portfolio.layers, ['outcome', 'practice', 'system']);
});

test('direção de produto cobre problema, resultado, prioridade e investimento', () => {
  const matrix = mapCapabilityReferenceCoverage(graph, nodeVariants, capabilityReferenceCatalog);
  const direction = matrix.references.find((item) => item.capabilityId === 'product-direction');
  assert.ok(direction);
  assert.equal(direction.status, 'minimum-covered');
  assert.ok(direction.direct.nodes >= 19);
  assert.ok(direction.direct.patterns >= 28);
  assert.deepEqual(direction.layers, ['outcome', 'practice', 'system']);
});

test('colaboração cobre dependência, decisão, transferência e efeito posterior', () => {
  const matrix = mapCapabilityReferenceCoverage(graph, nodeVariants, capabilityReferenceCatalog);
  const collaboration = matrix.references.find((item) => item.capabilityId === 'collaboration');
  assert.ok(collaboration);
  assert.equal(collaboration.status, 'minimum-covered');
  assert.ok(collaboration.direct.nodes >= 13);
  assert.ok(collaboration.direct.patterns >= 15);
  assert.deepEqual(collaboration.layers, ['consistency', 'knowledge', 'outcome', 'practice', 'system']);
});

test('liderança cobre decisão, incentivo, pressão e consequência', () => {
  const matrix = mapCapabilityReferenceCoverage(graph, nodeVariants, capabilityReferenceCatalog);
  const leadership = matrix.references.find((item) => item.capabilityId === 'leadership-management');
  assert.ok(leadership);
  assert.equal(leadership.status, 'minimum-covered');
  assert.ok(leadership.direct.nodes >= 11);
  assert.ok(leadership.direct.patterns >= 16);
  assert.deepEqual(leadership.layers, ['consistency', 'outcome', 'practice', 'system']);
});

test('governança cobre proporcionalidade, compensação e revisão pelo efeito', () => {
  const matrix = mapCapabilityReferenceCoverage(graph, nodeVariants, capabilityReferenceCatalog);
  const governance = matrix.references.find((item) => item.capabilityId === 'enabling-governance');
  assert.ok(governance);
  assert.equal(governance.status, 'minimum-covered');
  assert.ok(governance.direct.nodes >= 20);
  assert.ok(governance.direct.patterns >= 30);
  assert.deepEqual(governance.layers, ['consistency', 'outcome', 'practice', 'system']);
});

test('automação do SDLC combina prática com consequência observável', () => {
  const matrix = mapCapabilityReferenceCoverage(graph, nodeVariants, capabilityReferenceCatalog);
  const automation = matrix.references.find((item) => item.capabilityId === 'sdlc-automation');
  assert.ok(automation);
  assert.equal(automation.status, 'minimum-covered');
  assert.ok(automation.layers.includes('practice'));
  assert.ok(automation.layers.includes('outcome'));
  assert.doesNotMatch(automation.gaps.join(' '), /consequência/i);
});

test('release e feedback já possuem base factual para a nova rubrica', () => {
  const matrix = mapCapabilityReferenceCoverage(graph, nodeVariants, capabilityReferenceCatalog);
  const release = matrix.references.find((item) => item.capabilityId === 'release-feedback');
  assert.ok(release);
  assert.equal(release.status, 'minimum-covered');
  assert.ok(release.direct.nodes >= 7);
  assert.ok(release.direct.patterns >= 10);
  assert.deepEqual(release.layers, ['outcome', 'practice', 'system']);
});

test('competência técnica separa conhecimento, sistema, consistência e efeito', () => {
  const matrix = mapCapabilityReferenceCoverage(graph, nodeVariants, capabilityReferenceCatalog);
  const capability = matrix.references.find((item) => item.capabilityId === 'technical-capability');
  assert.ok(capability);
  assert.equal(capability.status, 'minimum-covered');
  assert.ok(capability.direct.nodes >= 15);
  assert.ok(capability.direct.patterns >= 25);
  assert.deepEqual(capability.layers, ['consistency', 'knowledge', 'outcome', 'practice', 'system']);
});

test('segurança de software possui decisão, pressão e consequência observáveis', () => {
  const matrix = mapCapabilityReferenceCoverage(graph, nodeVariants, capabilityReferenceCatalog);
  const security = matrix.references.find((item) => item.capabilityId === 'software-security');
  assert.ok(security);
  assert.equal(security.status, 'minimum-covered');
  assert.ok(security.direct.nodes >= 12);
  assert.ok(security.direct.patterns >= 20);
  assert.deepEqual(security.layers, ['consistency', 'knowledge', 'outcome', 'practice', 'system']);
});

test('evolutibilidade confronta decisão arquitetural com a mudança equivalente seguinte', () => {
  const matrix = mapCapabilityReferenceCoverage(graph, nodeVariants, capabilityReferenceCatalog);
  const evolvability = matrix.references.find((item) => item.capabilityId === 'evolvability');
  assert.ok(evolvability);
  assert.equal(evolvability.status, 'minimum-covered');
  assert.ok(evolvability.direct.nodes >= 16);
  assert.ok(evolvability.direct.patterns >= 24);
  assert.deepEqual(evolvability.layers, ['consistency', 'knowledge', 'outcome', 'practice', 'system']);
});

test('aprendizado organizacional cobre fechamento, bloqueio e adaptação pelo efeito', () => {
  const matrix = mapCapabilityReferenceCoverage(graph, nodeVariants, capabilityReferenceCatalog);
  const learning = matrix.references.find((item) => item.capabilityId === 'organizational-learning');
  assert.ok(learning);
  assert.equal(learning.status, 'minimum-covered');
  assert.ok(learning.direct.nodes >= 30);
  assert.ok(learning.direct.patterns >= 50);
  assert.deepEqual(learning.layers, ['consistency', 'knowledge', 'outcome', 'practice', 'system']);
});

test('ownership confronta responsabilidade declarada com autoridade e consequência', () => {
  const matrix = mapCapabilityReferenceCoverage(graph, nodeVariants, capabilityReferenceCatalog);
  const ownership = matrix.references.find((item) => item.capabilityId === 'team-ownership');
  assert.ok(ownership);
  assert.equal(ownership.status, 'minimum-covered');
  assert.ok(ownership.direct.nodes >= 18);
  assert.ok(ownership.direct.patterns >= 30);
  assert.deepEqual(ownership.layers, ['consistency', 'outcome', 'practice', 'system']);
});

test('matriz distingue efeito indireto, perspectiva única e ausência', () => {
  const nodes = [{
    id: 'one', type: 'scenario' as const, title: 'Evento', scenario: 'Na última mudança.', prompt: 'O que ocorreu?',
    options: [{ id: 'a', label: 'O grupo aguardou.', signals: [{ capability: 'x', pattern: 'p', weight: -1, details: ['organizational-learning'], layer: 'practice' as const, constraint: 'none' as const }] }],
  }];
  const matrix = mapCapabilityReferenceCoverage(nodes, [{ nodeId: 'one', profile: 'management', scenario: 'Na última mudança.' }], capabilityReferenceCatalog);
  const organizational = matrix.references.find((item) => item.capabilityId === 'organizational-system')!;
  assert.equal(organizational.direct.patterns, 0);
  assert.equal(organizational.indirect.patterns, 1);
  assert.equal(organizational.singlePerspective, true);
  assert.equal(matrix.references.find((item) => item.capabilityId === 'sdlc-automation')?.status, 'missing');
});
