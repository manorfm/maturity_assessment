import assert from 'node:assert/strict';
import { test } from 'node:test';
import { projectHowItIs, projectNodeDefinition, projectPreserve } from '../src/modules/inference/domain/ficha-node.js';
import { OrganizationalAreaProjector, projectFichaTrail } from '../src/modules/inference/domain/organizational-areas.js';
import { renderNodeCard } from '../src/modules/projects/diagnostic-report-view.js';

test('trilha da ficha liga os ancestrais ao mapa e deixa a capacidade aberta sem link', () => {
  const trail = projectFichaTrail({
    map: OrganizationalAreaProjector.empty(),
    capabilityId: 'continuous-integration',
    capabilityLabel: 'Integração contínua',
    mapHref: '/report/map',
    areaBase: '/areas',
  });
  assert.deepEqual(trail.map((crumb) => crumb.label), ['Tecnologia', 'Engenharia', 'Entrega', 'Integração contínua']);
  assert.equal(trail[0]?.href, '/report/map');
  assert.equal(trail[1]?.href, '/areas/engineering');
  assert.equal(trail[2]?.href, '/areas/delivery');
  assert.equal(trail.at(-1)?.href, undefined);
});

test('ficha desenha a trilha clicável e não transforma o nome aberto em link', () => {
  const html = renderNodeCard({
    title: 'Integração contínua',
    trail: projectFichaTrail({
      map: OrganizationalAreaProjector.empty(),
      capabilityId: 'continuous-integration',
      capabilityLabel: 'Integração contínua',
      mapHref: '/report/map',
      areaBase: '/areas',
    }),
    definition: projectNodeDefinition('continuous-integration'),
    how: projectHowItIs({}),
    reported: '',
    why: '',
    where: '',
    action: '',
    check: '',
    preserve: projectPreserve('correct'),
    relations: '',
    unknown: '',
    references: '',
  });
  assert.match(html, /aria-label="Caminho"/);
  assert.match(html, /href="\/report\/map"/);
  assert.match(html, /href="\/areas\/engineering"/);
  assert.match(html, /href="\/areas\/delivery"/);
  assert.match(html, /<span[^>]*>Integração contínua<\/span>/);
  assert.doesNotMatch(html, /href="[^"]*">Integração contínua/);
});
