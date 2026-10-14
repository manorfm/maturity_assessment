import assert from 'node:assert/strict';
import { test } from 'node:test';
import { projectFichaClose, projectHowItIs, projectNodeDefinition, projectPreserve, projectReportedReadings } from '../src/modules/inference/domain/ficha-node.js';
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

test('relato próprio exige o limiar; abaixo dele a resposta fica só no total', () => {
  const readings = projectReportedReadings({
    capabilityIds: ['work-management'],
    minimum: 5,
    samples: [
      { label: 'Gestão', completed: 6, readings: [{ capabilityId: 'work-management', signals: 4, mean: 1.2 }] },
      { label: 'Engenharia', completed: 4, readings: [{ capabilityId: 'work-management', signals: 2, mean: -1.4 }] },
    ],
    units: [
      { label: 'Pagamentos', completed: 6, observed: true },
      { label: 'Conciliação', completed: 3, observed: true },
    ],
  });
  assert.equal(readings.perspectives.length, 1);
  assert.match(readings.perspectives[0]?.body ?? '', /Gestão/);
  assert.match(readings.perspectives[0]?.body ?? '', /mais folgado/);
  assert.doesNotMatch(readings.perspectives[0]?.body ?? '', /%/);
  assert.match(readings.withheld.join(' '), /Engenharia teve 4 pessoas/);
  assert.match(readings.withheld.join(' '), /Conciliação teve 3 pessoas/);
  assert.match(readings.withheld.join(' '), /entram só no total/);
  assert.equal(readings.units[0]?.label, 'Pagamentos');
  assert.doesNotMatch(JSON.stringify(readings), /respondentes/);
  const html = renderNodeCard({
    title: 'Gestão do trabalho',
    trail: [],
    definition: projectNodeDefinition('work-management'),
    how: projectHowItIs({}),
    reported: readings,
    preserve: projectPreserve('correct'),
    close: projectFichaClose({}),
  });
  assert.match(html, /Por perspectiva/);
  assert.match(html, /Por time/);
  assert.match(html, /<strong>Pagamentos<\/strong>/);
  assert.doesNotMatch(html, /<strong>Engenharia<\/strong>/);
  assert.doesNotMatch(html, /<strong>Conciliação<\/strong>/);
});

test('causa, lugar, ação e critério são cartões; vazio vira lacuna, sem o caso do protótipo', () => {
  const empty = projectFichaClose({});
  assert.equal(empty.cause.published, false);
  assert.match(empty.cause.body, /Ainda não há causa publicada/);
  assert.equal(empty.place.published, false);
  assert.equal(empty.action.published, false);
  assert.equal(empty.check.published, false);
  assert.match(empty.unknown.body, /Lacuna ainda não nomeada/);
  assert.match(empty.references.body, /Referência ainda não ligada/);
  const filled = projectFichaClose({
    cause: 'A aprovação encarece cada encontro das mudanças.',
    place: 'No caminho compartilhado.',
    action: 'Encurte um lote.',
    check: 'A espera cai.',
    relations: 'Entrega',
  });
  assert.equal(filled.cause.published, true);
  assert.equal(filled.cause.body, 'A aprovação encarece cada encontro das mudanças.');
  const html = renderNodeCard({
    title: 'Entrega',
    trail: [],
    definition: projectNodeDefinition('delivery'),
    how: projectHowItIs({}),
    reported: projectReportedReadings({ capabilityIds: ['delivery'], minimum: 5, samples: [], units: [] }),
    preserve: projectPreserve('correct'),
    close: empty,
  });
  assert.match(html, /class="ficha-card report-gap"/);
  assert.match(html, /Ainda não há causa publicada/);
  assert.doesNotMatch(html, /4 relatos|22%/);
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
    reported: projectReportedReadings({ capabilityIds: ['delivery'], minimum: 5, samples: [], units: [] }),
    close: projectFichaClose({
      cause: 'A espera se repete.',
      place: 'No caminho compartilhado.',
      action: 'Encurte um lote.',
      check: 'A espera cai.',
    }),
  });
  assert.match(html, /Abrange o caminho da mudança/);
  assert.match(html, /Trata espera escondida/);
  assert.match(html, /Ainda não publicamos a distribuição de estágio 0–4/);
  assert.doesNotMatch(html, /começa pelo meio/);
  assert.match(html, /entra quando a leitura é de preservação/);
  assert.doesNotMatch(html, /20%/);
  assert.match(html, /Ainda não há relato publicado neste nó/);
});
