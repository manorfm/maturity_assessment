import assert from 'node:assert/strict';
import { test } from 'node:test';
import { capabilityLeafIds, CapabilityTaxonomy } from '../src/modules/inference/domain/capability-taxonomy.js';
import { OrganizationalAreaProjector, collectAreaLeaves, findAreaPath, type OrganizationalAreaNode } from '../src/modules/inference/domain/organizational-areas.js';
import { renderOrganizationalAreaIndex, renderOrganizationalAreaMap } from '../src/modules/projects/project-routes.js';

const measure = (id: string, coverage = 1) => ({
  id, label: id, level: 2, confidence: .8, evidence: 4, hasContradiction: false, coverage,
});

const finding = (detailCapability: string, affectedCapabilities: string[] = []) => ({
  detailCapability, affectedCapabilities,
});

test('projetor cobre as 29 folhas sem criar ID novo e sem reparentar o motor', () => {
  const map = OrganizationalAreaProjector.project({ capabilities: [], findings: [] });
  assert.deepEqual(map.systems.map((system) => system.id), ['product', 'engineering', 'operations']);
  assert.equal(map.band.id, 'management');
  assert.equal(map.band.label, 'Gestão');
  const leaves = collectAreaLeaves(map);
  assert.deepEqual([...leaves].sort(), [...capabilityLeafIds].sort());
  assert.equal(leaves.length, 29);
  const engine = CapabilityTaxonomy.organize([measure('work-management'), measure('sustainable-design')]);
  assert.deepEqual(engine.map((branch) => branch.id), [
    'product-value', 'delivery-flow', 'engineering-quality', 'architecture-evolution',
    'operations-reliability', 'platform-experience', 'security-risk', 'organizational-system',
  ]);
  assert.equal(engine.find((branch) => branch.id === 'delivery-flow')?.assessed, false);
});

test('home mostra três sistemas; qualidade, plataforma e segurança ficam sob Engenharia', () => {
  const map = OrganizationalAreaProjector.project({
    capabilities: [
      measure('work-management'),
      measure('quality-strategy'),
      measure('platform-autonomy'),
      measure('software-security'),
    ],
    findings: [],
  });
  const home = map.systems.filter((system) => system.observed).map((system) => system.label);
  assert.deepEqual(home, ['Engenharia']);
  const engineering = map.systems.find((system) => system.id === 'engineering')!;
  assert.deepEqual(engineering.children.filter((child) => child.observed).map((child) => child.label), [
    'Entrega', 'Qualidade de software', 'Plataforma', 'Segurança',
  ]);
  assert.equal(map.systems.some((system) => system.label === 'Qualidade de software'), false);
  assert.equal(map.systems.some((system) => system.label === 'Plataforma'), false);
  assert.equal(map.systems.some((system) => system.label === 'Segurança'), false);
  assert.equal(map.band.observed, false);
});

test('folha publicada acende o sistema mesmo quando o pilar do motor não fecha', () => {
  const capabilities = [measure('work-management')];
  const pillar = CapabilityTaxonomy.organize(capabilities).find((branch) => branch.id === 'delivery-flow')!;
  assert.equal(pillar.assessed, false);
  const map = OrganizationalAreaProjector.project({ capabilities, findings: [] });
  const engineering = map.systems.find((system) => system.id === 'engineering')!;
  assert.equal(engineering.observed, true);
  assert.equal(engineering.children.find((child) => child.id === 'delivery')?.observed, true);
});

test('finding acende o sistema sem exigir cobertura da folha', () => {
  const map = OrganizationalAreaProjector.project({
    capabilities: [measure('platform-autonomy', .5)],
    findings: [finding('platform-autonomy')],
  });
  const engineering = map.systems.find((system) => system.id === 'engineering')!;
  assert.equal(engineering.observed, true);
  assert.equal(engineering.children.find((child) => child.id === 'platform')?.observed, true);
});

test('planejamento aparece em Produto; observabilidade fica sob Publicação, não em Operação', () => {
  const map = OrganizationalAreaProjector.project({
    capabilities: [measure('planning-refinement'), measure('observability-practice')],
    findings: [],
  });
  const product = map.systems.find((system) => system.id === 'product')!;
  const engineering = map.systems.find((system) => system.id === 'engineering')!;
  const operations = map.systems.find((system) => system.id === 'operations')!;
  assert.equal(product.observed, true);
  assert.ok(product.children.some((child) => child.id === 'planning-refinement' && child.observed));
  assert.equal(operations.observed, false);
  const publication = findAreaPath(map, 'release-feedback')?.at(-1);
  const observability = findAreaPath(map, 'observability-practice');
  assert.equal(publication?.label, 'Publicação');
  assert.equal(observability?.at(-1)?.label, 'Observabilidade');
  assert.ok(observability?.some((node) => node.id === 'engineering'));
  assert.ok(observability?.some((node) => node.id === 'delivery'));
  assert.ok(observability?.some((node) => node.id === 'release-feedback'));
  assert.equal(engineering.observed, true);
  assert.doesNotMatch(collectAreaLeaves({ systems: [operations], band: map.band }).join(','), /observability/);
});

test('finding de responsabilidade acende a faixa e o sistema da restrição', () => {
  const map = OrganizationalAreaProjector.project({
    capabilities: [],
    findings: [finding('team-ownership', ['work-management'])],
  });
  assert.equal(map.band.observed, true);
  assert.equal(map.band.children.find((child) => child.id === 'team-ownership')?.observed, true);
  assert.equal(map.band.children.find((child) => child.id === 'team-ownership')?.label, 'Responsabilidade');
  assert.equal(map.systems.find((system) => system.id === 'engineering')?.observed, true);
  assert.equal(map.systems.find((system) => system.id === 'product')?.observed, false);
});

test('cobertura parcial sem finding não acende pasta vazia', () => {
  const map = OrganizationalAreaProjector.project({
    capabilities: [measure('incident-management', .5)],
    findings: [],
  });
  assert.equal(map.systems.find((system) => system.id === 'operations')?.observed, false);
});

test('rótulos da home são disciplinas, não cerimônia nem slogan', () => {
  const map = OrganizationalAreaProjector.project({
    capabilities: capabilityLeafIds.map((id) => measure(id)),
    findings: [],
  });
  const labels: string[] = [];
  const walk = (node: OrganizationalAreaNode) => {
    labels.push(node.label);
    node.children.forEach(walk);
  };
  map.systems.forEach(walk);
  walk(map.band);
  for (const banned of ['Integração contínua', 'Planejamento e refinamento', 'Release e feedback', 'Evolutibilidade', 'Sistema organizacional', 'Agilidade', 'Liberação']) {
    assert.equal(labels.includes(banned), false, banned);
  }
  assert.ok(labels.includes('Integração'));
  assert.ok(labels.includes('Publicação'));
  assert.ok(labels.includes('Evolução'));
  assert.ok(labels.includes('Planejamento'));
});

test('mapa da home lista três sistemas e não rivaliza qualidade com plataforma', () => {
  const map = OrganizationalAreaProjector.project({
    capabilities: [measure('work-management'), measure('quality-strategy'), measure('platform-autonomy'), measure('software-security')],
    findings: [finding('team-ownership')],
  });
  const html = renderOrganizationalAreaMap(map, { areaBase: '/areas', capabilityBase: '/capabilities' });
  assert.match(html, /aria-label="Sistemas da organização"/);
  assert.match(html, />Produto</);
  assert.match(html, />Engenharia</);
  assert.match(html, />Operação</);
  assert.match(html, /href="\/areas\/engineering"/);
  assert.match(html, /Entrega/);
  assert.match(html, /Qualidade de software/);
  assert.match(html, /Plataforma/);
  assert.match(html, /Segurança/);
  assert.match(html, /Gestão/);
  assert.match(html, /Responsabilidade/);
  assert.doesNotMatch(html, /Sistema organizacional/);
  assert.doesNotMatch(html, /Estratégia de produto e valor/);
  assert.doesNotMatch(html, /<svg/);
  assert.doesNotMatch(html, /Agilidade/);
  const engineering = html.indexOf('>Engenharia<');
  const quality = html.indexOf('Qualidade de software');
  const platform = html.indexOf('Plataforma');
  assert.ok(engineering >= 0 && quality > engineering && platform > engineering);
});

test('índice de Publicação oferece a folha e a observabilidade aninhada', () => {
  const map = OrganizationalAreaProjector.project({
    capabilities: [measure('release-feedback'), measure('observability-practice')],
    findings: [finding('release-feedback')],
  });
  const path = findAreaPath(map, 'release-feedback')!;
  const html = renderOrganizationalAreaIndex(path, { areaBase: '/areas', capabilityBase: '/capabilities' });
  assert.match(html, /href="\/capabilities\/release-feedback"/);
  assert.match(html, /href="\/capabilities\/observability-practice"/);
  assert.match(html, /Observabilidade/);
});

test('índice de Engenharia aprofunda disciplinas sem nota de grupo', () => {
  const map = OrganizationalAreaProjector.project({
    capabilities: [measure('work-management'), measure('platform-autonomy')],
    findings: [],
  });
  const path = findAreaPath(map, 'engineering')!;
  const html = renderOrganizationalAreaIndex(path, { areaBase: '/areas', capabilityBase: '/capabilities' });
  assert.match(html, /Engenharia/);
  assert.match(html, /href="\/areas\/delivery"/);
  assert.match(html, /href="\/areas\/platform"/);
  assert.doesNotMatch(html, /de 4/);
  assert.doesNotMatch(html, /nota do grupo/);
});
