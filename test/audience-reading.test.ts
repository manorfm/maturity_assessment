import assert from 'node:assert/strict';
import { test } from 'node:test';
import { projectAudienceReadings } from '../src/modules/inference/domain/diagnostic-report.js';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import { guidanceFor } from '../src/modules/inference/domain/solution-guidance.js';
import { renderAudiencePage } from '../src/modules/projects/diagnostic-report-view.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';

const map = OrganizationalAreaProjector.empty();

function finding(overrides: Partial<OutcomeFinding> & Pick<OutcomeFinding, 'pattern' | 'title'>): OutcomeFinding {
  return {
    kind: 'correction',
    detailCapability: 'continuous-integration',
    cause: 'o rito trata riscos diferentes do mesmo jeito',
    intervention: 'separar o caso comum do caso que ainda precisa de julgamento',
    confidence: 0.8,
    priority: 0.8,
    mechanism: 'policy',
    containment: 'organizational-policy',
    decisionAuthority: 'organizational-governance',
    prescription: { status: 'ready', reason: 'mecanismo discriminado' },
    experiment: {
      action: 'Autorizar exceção para a mudança de baixo risco já observada no fluxo.',
      owner: 'Responsável pela política com executores do fluxo',
      metric: 'tempo até a mudança seguir e falha ligada a ela',
      reviewHorizon: 'na próxima mudança equivalente, com revisão em até 30 dias',
      successCriterion: 'riscos diferentes deixam de esperar o mesmo rito',
    },
    ...overrides,
  };
}

test('sem achado publicado a página mostra a lacuna', () => {
  const html = renderAudiencePage(projectAudienceReadings({ findings: [], map }));
  assert.match(html, /Nenhum achado publicado/);
  assert.doesNotMatch(html, /Versão para a direção/);
  assert.doesNotMatch(html, /alvo 45|Pagamentos/);
});

test('o mesmo achado vira decisão da direção e semana do time, com papéis e sem bônus', () => {
  const lead = finding({ pattern: 'controle-sem-feedback', title: 'Aprovação trata riscos diferentes com o mesmo rito' });
  const sibling = finding({
    pattern: 'controle-indiferenciado',
    title: 'O controle não distingue o caso',
    detailCapability: 'enabling-governance',
  });
  const readings = projectAudienceReadings({ findings: [lead, sibling], map });
  const card = readings[0]!;
  assert.equal(card.path, 'Engenharia › Entrega › Integração');
  assert.equal(card.fact, guidanceFor(lead.pattern, lead.foundation, lead.title).plainExplanation);
  assert.deepEqual(card.direction.map((field) => field.label), [
    'Decisão pedida',
    'Risco de não agir',
    'Investimento',
    'O que acompanhar',
    'Quando parar',
  ]);
  assert.match(card.direction[0]!.body, /Autorizar exceção/);
  assert.match(card.direction[1]!.body, /O controle cresce e o problema também/);
  assert.match(card.direction[2]!.body, /Custo moderado/);
  assert.match(card.direction[3]!.body, /não use como meta de bônus/i);
  assert.match(card.direction[4]!.body, /deslocar risco/);
  assert.deepEqual(card.team.map((field) => field.label), ['O que muda', 'Como fazer', 'O que registrar']);
  assert.match(card.team[0]!.body, /não se resolve no time/);
  assert.match(card.team[2]!.body, /não avalia ninguém/);
  assert.match(card.roles, /governança/);
  assert.match(card.roles, /política/);
  assert.doesNotMatch(card.roles, /João|Maria|CTO|CFO/);
  assert.match(card.bonus, /não vira meta de bônus/);
  const html = renderAudiencePage(readings);
  assert.match(html, /Versão para a direção/);
  assert.match(html, /Versão para o time/);
  assert.match(html, /A quem recorrer/);
  assert.match(html, /Aprovação trata riscos diferentes/);
  assert.doesNotMatch(html, /alvo 45|Pagamentos|6 meses|3 minutos|por causa de/);
});

test('nome de pessoa não entra em a quem recorrer', () => {
  const readings = projectAudienceReadings({
    findings: [finding({
      pattern: 'controle-sem-feedback',
      title: 'Aprovação trata riscos diferentes com o mesmo rito',
      experiment: {
        action: 'Autorizar exceção para a mudança de baixo risco já observada no fluxo.',
        owner: 'João Silva',
        metric: 'tempo até a mudança seguir',
        reviewHorizon: 'na próxima mudança equivalente',
        successCriterion: 'riscos diferentes deixam de esperar o mesmo rito',
      },
    })],
    map,
  });
  assert.doesNotMatch(readings[0]!.roles, /João/);
  assert.match(readings[0]!.roles, /governança/);
});
