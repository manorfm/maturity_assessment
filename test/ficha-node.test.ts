import assert from 'node:assert/strict';
import { test } from 'node:test';
import { leafStageDistribution, projectFichaClose, projectHowItIs, projectNodeDefinition, projectPreserve, projectReportedReadings } from '../src/modules/inference/domain/ficha-node.js';
import { OrganizationalAreaProjector, projectFichaTrail } from '../src/modules/inference/domain/organizational-areas.js';
import { renderNodeCard } from '../src/modules/projects/diagnostic-report-view.js';

test('definição diz o que a capacidade é e por que importa, sem nome de ferramenta', () => {
  const definition = projectNodeDefinition('delivery');
  assert.match(definition.what, /Abrange/);
  assert.match(definition.why, /Trata/);
  assert.doesNotMatch(`${definition.what} ${definition.why}`, /Jenkins|Kubernetes|SAST|Jira/);
});

test('posterior publicada desenha os cinco pesos; sem posterior e abaixo do mínimo não há curva', () => {
  const shares = [0.05, 0.1, 0.2, 0.4, 0.25] as const;
  const how = projectHowItIs({
    stageDistribution: shares,
    minimum: 5,
    slices: [
      { label: 'Gestão', completed: 6, distribution: [0.1, 0.1, 0.2, 0.4, 0.2] },
      { label: 'Engenharia', completed: 2, distribution: [0.7, 0.1, 0.1, 0.05, 0.05] },
      { label: 'Pagamentos', completed: 3, distribution: [0, 0, 1, 0, 0] },
    ],
  });
  assert.equal(how.stage.published, true);
  if (!how.stage.published) return;
  assert.deepEqual([...how.stage.shares], [...shares]);
  assert.equal(how.stage.series.length, 1);
  assert.equal(how.stage.series[0]?.label, 'Gestão');
  assert.match(how.stage.withheld.join(' '), /Engenharia teve 2 pessoas/);
  assert.match(how.stage.withheld.join(' '), /Pagamentos teve 3 pessoas/);
  assert.doesNotMatch(how.stage.withheld.join(' '), /0\.7/);
  const card = {
    title: 'Entrega',
    trail: [],
    definition: projectNodeDefinition('delivery'),
    reported: projectReportedReadings({ capabilityIds: ['delivery'], minimum: 5, samples: [], units: [] }),
    preserve: projectPreserve('correct'),
    close: projectFichaClose({}),
  };
  const html = renderNodeCard({ ...card, how });
  for (const stage of [0, 1, 2, 3, 4]) assert.match(html, new RegExp(`Estágio ${stage}`));
  assert.match(html, /class="stage-distribution"/);
  assert.match(html, /40%/);
  assert.match(html, /Gestão/);
  assert.doesNotMatch(html, /70%/);
  const empty = renderNodeCard({ ...card, how: projectHowItIs({}) });
  assert.match(empty, /Ainda não publicamos a distribuição de estágio 0–4/);
  assert.doesNotMatch(empty, /class="stage-distribution"/);
  const onlySmall = projectHowItIs({
    minimum: 5,
    slices: [{ label: 'Engenharia', completed: 2, distribution: [0.7, 0.1, 0.1, 0.05, 0.05] }],
  });
  assert.equal(onlySmall.stage.published, false);
});

test('a ficha lê a posterior da folha, não o índice agregado', () => {
  const leaf = [0.05, 0.1, 0.2, 0.4, 0.25] as const;
  const parent = [0.2, 0.2, 0.2, 0.2, 0.2] as const;
  assert.equal(leafStageDistribution(undefined, 'delivery'), undefined);
  assert.equal(leafStageDistribution({ published: false, reason: 'Faixa larga demais para publicar índice.' }, 'delivery'), undefined);
  assert.deepEqual(leafStageDistribution({
    published: true,
    index: 40,
    band: [25, 75],
    coverage: 1,
    distribution: parent,
    leaves: [{ id: 'delivery', distribution: leaf }],
  }, 'delivery'), leaf);
  assert.equal(leafStageDistribution({
    published: true,
    index: 40,
    band: [25, 75],
    coverage: 1,
    distribution: parent,
    leaves: [{ id: 'flow', distribution: leaf }],
  }, 'delivery'), undefined);
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

test('a ficha mostra o outro lado da aresta publicada e não desenha laço sem aresta', () => {
  const linked = projectFichaClose({ nodeId: 'organizational-learning' });
  assert.equal(linked.relations.published, true);
  if (!linked.relations.published) return;
  const depende = linked.relations.edges.find((edge) => edge.kind === 'depende-de' && edge.otherLabel === 'Liderança e gestão');
  assert.ok(depende);
  assert.equal(depende.text.includes('depende-de'), true);
  assert.equal(depende.text.includes('Liderança e gestão'), true);
  assert.equal(linked.relations.edges.some((edge) => edge.kind === 'bloqueia'), false);
  const amplified = projectFichaClose({ nodeId: 'platform-autonomy' });
  assert.equal(amplified.relations.published, true);
  if (!amplified.relations.published) return;
  const amplifica = amplified.relations.edges.find((edge) => edge.kind === 'amplifica' && edge.otherLabel === 'Fluxo de trabalho');
  assert.ok(amplifica);
  const card = {
    title: 'Aprendizado e adaptação',
    trail: [],
    definition: { what: 'Abrange o aprendizado do sistema.', why: 'Trata o que muda depois do evento.' },
    how: projectHowItIs({}),
    reported: projectReportedReadings({ capabilityIds: ['organizational-learning'], minimum: 5, samples: [], units: [] }),
    preserve: projectPreserve('correct'),
  };
  const html = renderNodeCard({ ...card, close: linked });
  assert.equal(html.includes('depende-de'), true);
  assert.equal(html.includes('Liderança e gestão'), true);
  assert.equal(html.includes('Orbital'), false);
  assert.equal(html.includes('13%'), false);
  assert.equal(html.includes('45%'), false);
  const empty = projectFichaClose({ nodeId: 'cloud-efficiency' });
  assert.equal(empty.relations.published, false);
  if (empty.relations.published) return;
  assert.equal(empty.relations.body.includes('grafo não ligou'), true);
  const emptyHtml = renderNodeCard({
    ...card,
    title: 'Eficiência de operação',
    close: empty,
  });
  assert.equal(emptyHtml.includes('grafo não ligou'), true);
  assert.equal(emptyHtml.includes('class="ficha-relations"'), false);
  assert.equal(emptyHtml.includes('Orbital'), false);
  assert.equal(emptyHtml.includes('Integração contínua'), false);
  assert.equal(emptyHtml.includes('13%'), false);
  assert.equal(emptyHtml.includes('45%'), false);
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
