import assert from 'node:assert/strict';
import { test } from 'node:test';
import { projectHowItIs, projectNodeDefinition, projectPreserve } from '../src/modules/inference/domain/ficha-node.js';
import { OrganizationalAreaProjector, projectFichaTrail } from '../src/modules/inference/domain/organizational-areas.js';
import { renderNodeCard } from '../src/modules/projects/diagnostic-report-view.js';

test('definição diz o que a capacidade é e por que importa, sem nome de ferramenta', () => {
  const definition = projectNodeDefinition('delivery');
  assert.match(definition.what, /Abrange/);
  assert.match(definition.why, /Trata/);
  assert.doesNotMatch(`${definition.what} ${definition.why}`, /Jenkins|Kubernetes|SAST|Jira/);
});

test('como está publica a lacuna de 0–4 e o quadrante só com leitura', () => {
  const missing = projectHowItIs({});
  assert.equal(missing.stage.published, false);
  if (!missing.stage.published) assert.match(missing.stage.gap, /Ainda não publicamos a distribuição de estágio 0–4/);
  assert.equal(missing.quadrant.published, false);
  const wantsMedium = projectHowItIs({ phase: 1, appropriation: 3 });
  assert.equal(wantsMedium.quadrant.published, true);
  if (wantsMedium.quadrant.published) {
    assert.match(wantsMedium.quadrant.conduct, /começa pelo meio/);
    assert.match(wantsMedium.quadrant.conduct, /não por treinamento/);
  }
  const wantsHabit = projectHowItIs({ phase: 4, appropriation: 1 });
  if (wantsHabit.quadrant.published) assert.match(wantsHabit.quadrant.conduct, /começa pelo hábito/);
});

test('o que já funciona só aparece na leitura de preservação', () => {
  assert.equal(projectPreserve('correct').shown, false);
  assert.equal(projectPreserve('preserve', 'O fluxo curto se sustenta.').shown, true);
  assert.equal(projectPreserve('preserve', 'O fluxo curto se sustenta.').body, 'O fluxo curto se sustenta.');
});

test('ficha mostra a frase de por que importa, a lacuna de estágio e omite o quadrante sem leitura', () => {
  const how = projectHowItIs({});
  const html = renderNodeCard({
    title: 'Entrega',
    trail: projectFichaTrail({
      map: OrganizationalAreaProjector.empty(),
      capabilityId: 'delivery',
      capabilityLabel: 'Entrega',
      mapHref: '/report/map',
      areaBase: '/areas',
    }),
    definition: projectNodeDefinition('delivery'),
    how,
    preserve: projectPreserve('correct'),
    reported: '',
    why: 'A espera se repete.',
    where: 'No caminho compartilhado.',
    action: 'Encurte um lote.',
    check: 'A espera cai.',
    relations: '',
    unknown: '',
    references: '',
  });
  assert.match(html, /Abrange o caminho da mudança/);
  assert.match(html, /Trata espera escondida/);
  assert.match(html, /Ainda não publicamos a distribuição de estágio 0–4/);
  assert.doesNotMatch(html, /começa pelo meio/);
  assert.match(html, /entra quando a leitura é de preservação/);
  assert.doesNotMatch(html, /20%/);
});
