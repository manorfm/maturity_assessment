import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import { renderFirstScreen, renderOrganizationalAreaIndex, renderOutcome, renderScopeIndex } from '../src/modules/projects/project-routes.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';

const readyFinding: OutcomeFinding = {
  kind: 'correction',
  pattern: 'causa-capacidade-tomada-pela-proxima-iniciativa',
  detailCapability: 'portfolio-management',
  title: 'A próxima iniciativa ocupa a capacidade de revisar o resultado anterior',
  cause: 'Novos compromissos ocupam toda a capacidade antes da revisão.',
  intervention: 'Não autorize todo o próximo ciclo sem reservar pessoas para revisar um resultado anterior.',
  confidence: .9, priority: .9,
  mechanism: 'priority', containment: 'organizational-policy', decisionAuthority: 'portfolio-leadership',
  severity: 'undetermined', impacts: [],
  missingEvidence: 'Confirmar se a evidência de resultado existe.',
  prescription: { status: 'ready', reason: 'Mecanismo e contenção discriminados.' },
  experiment: {
    action: 'Não autorizar todo o próximo ciclo sem reservar capacidade para revisar um resultado anterior.',
    owner: 'Liderança de produto e portfólio',
    metric: 'resultados revistos antes do próximo compromisso',
    reviewHorizon: 'no próximo ciclo',
    successCriterion: 'a próxima iniciativa começa preservando capacidade para uma decisão baseada no resultado anterior',
  },
  foundation: { source: 'Lean portfolio management', principle: 'Capacidade condicionada à revisão de resultado', why: 'Medir sem reservar capacidade para decidir não muda o investimento.' },
  recommendationEvidence: {
    supportingParticipants: 6, applicablePopulation: 6, contradictingParticipants: 0,
    patterns: ['causa-capacidade-tomada-pela-proxima-iniciativa'], layers: ['system'], profiles: ['product', 'management', 'data'],
  },
};

const investigate = (pattern: string, title: string, detailCapability: string): OutcomeFinding => {
  const { experiment: _experiment, ...base } = readyFinding;
  return { ...base, pattern, title, detailCapability, prescription: { status: 'investigate', reason: 'Ainda falta o mecanismo.' } };
};

const outcome = {
  kind: 'correct' as const, kindLabel: 'Corrigir o limitador', limiterLabel: 'Gestão de portfólio',
  reading: '', nextStepTitle: readyFinding.title, nextStepBody: readyFinding.intervention, finding: readyFinding,
};

const leaf = (id: string, label: string) => ({
  id, label, level: 1, confidence: .8, evidence: 4, hasContradiction: false, assessed: true, coverage: 1, children: [],
});

function firstScreen(overrides: Partial<Parameters<typeof renderFirstScreen>[0]> = {}) {
  const findings = overrides.findings ?? [
    readyFinding,
    investigate('empacotamento-manual', 'Preparação concentra espera', 'release-feedback'),
    investigate('provisionamento-em-fila', 'Ambientes chegam por fila', 'platform-autonomy'),
    investigate('espera-normalizada', 'Espera some atrás de novo início', 'work-management'),
    investigate('retrospectiva-sem-fechamento', 'A lista de melhoria não fecha', 'organizational-learning'),
  ];
  return renderFirstScreen({
    outcome,
    classification: { level: 1, label: 'Reativo', limitingCapabilities: ['Gestão de portfólio'] },
    organizationalAreas: OrganizationalAreaProjector.project({
      capabilities: [
        { id: 'portfolio-management', label: 'Portfólio', level: 1, confidence: .8, evidence: 4, hasContradiction: false, coverage: 1 },
        { id: 'work-management', label: 'Fluxo', level: 1, confidence: .8, evidence: 4, hasContradiction: false, coverage: 1 },
      ],
      findings,
    }),
    findings,
    scopes: [{
      id: 'alfa', path: 'Empresa/Squad Alfa',
      classification: { level: 1, label: 'Reativo', limitingCapabilities: ['Fluxo'] },
      capabilityGroups: [leaf('work-management', 'Fluxo')],
      findings: [investigate('espera-normalizada', 'Espera some atrás de novo início', 'work-management')],
      perspectiveGaps: [],
    }],
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    ...overrides,
  });
}

test('cartão compacto mostra decisão, valor e teste sem abrir metodologia', () => {
  const html = renderOutcome(outcome, { density: 'compact' });
  const firstPlane = html.slice(0, html.search(/<details[^>]*class="[^"]*methodology/));
  assert.match(firstPlane, /Decisão pedida/);
  assert.match(firstPlane, /O que observamos/);
  assert.match(firstPlane, /Por que importa/);
  assert.match(firstPlane, /ainda não foi medido/i);
  assert.match(firstPlane, /Não autorizar todo o próximo ciclo/);
  assert.match(firstPlane, /O que esta decisão não resolve/);
  assert.match(firstPlane, /Não faça/);
  assert.match(html, /<details[^>]*>[\s\S]*Lean portfolio/);
  assert.match(html, /<details[^>]*>[\s\S]*Fundamento e evidência/);
  assert.doesNotMatch(firstPlane, /Lean portfolio/);
  assert.doesNotMatch(firstPlane, /Detalhes metodológicos/);
  assert.doesNotMatch(firstPlane, /A organização já consegue fazer isso/);
});

test('first screen coloca decisão e três sistemas antes de lista, unidades e administração', () => {
  const html = firstScreen();
  const decision = html.indexOf('Decisão pedida');
  const systems = html.indexOf('Sistemas da organização');
  const others = html.indexOf('Outros problemas');
  const units = html.indexOf('Unidades');
  const admin = html.search(/Administrar|Instrumento e calibração|Leituras por público/);
  assert.ok(decision >= 0 && systems > decision && others > systems && units > others);
  assert.ok(admin < 0 || admin > units);
  assert.match(html, />Produto</);
  assert.match(html, />Engenharia</);
  assert.match(html, />Operação</);
  assert.doesNotMatch(html, /<svg/);
  assert.doesNotMatch(html, /<article class="area-tile[^"]*">[\s\S]*?<h3>Gestão<\/h3>/);
  assert.match(html, /<nav class="area-band" aria-label="Gestão"/);
});

test('outros problemas cabem em uma linha: título, sistema e decidir ou investigar', () => {
  const html = firstScreen();
  assert.match(html, /Preparação concentra espera/);
  assert.match(html, /A lista de melhoria não fecha/);
  assert.match(html, /Engenharia · investigar/);
  assert.match(html, /Gestão · investigar/);
  assert.doesNotMatch(html, /Sequência de transformação/);
  assert.doesNotMatch(html, /mostrando os 4/);
});

test('unidades ocupam uma linha e não reimprimem o cartão nem o radar', () => {
  const html = renderScopeIndex([{
    id: 'alfa', path: 'Empresa/Squad Alfa',
    classification: { level: 0, label: 'Opaco', limitingCapabilities: ['Integração contínua'] },
    capabilityGroups: [leaf('continuous-integration', 'Integração contínua')],
    findings: [
      { kind: 'correction', pattern: 'pipeline', detailCapability: 'continuous-integration', title: 'A esteira devolve feedback tarde', cause: '', intervention: 'Reduza o retorno.', confidence: .9, priority: .9 },
      { kind: 'correction', pattern: 'environment', detailCapability: 'platform-autonomy', title: 'Ambientes chegam por fila', cause: '', intervention: 'Teste autosserviço.', confidence: .8, priority: .8 },
    ],
    perspectiveGaps: [],
  }], '/capabilities');
  assert.match(html, /Empresa\/Squad Alfa/);
  assert.match(html, /Opaco/);
  assert.match(html, /A esteira devolve feedback tarde/);
  assert.doesNotMatch(html, /outcome-card/);
  assert.doesNotMatch(html, /Próxima decisão/);
  assert.doesNotMatch(html, /Mapa de contraste e cobertura/);
  assert.doesNotMatch(html, /<svg/);
});

test('drill-down da área repete o cartão curto e lista os filhos', () => {
  const map = OrganizationalAreaProjector.project({
    capabilities: [
      { id: 'work-management', label: 'Fluxo', level: 1, confidence: .8, evidence: 4, hasContradiction: false, coverage: 1 },
      { id: 'platform-autonomy', label: 'Plataforma', level: 1, confidence: .8, evidence: 4, hasContradiction: false, coverage: 1 },
    ],
    findings: [readyFinding],
  });
  const path = map.systems.filter((system) => system.id === 'engineering');
  const card = renderOutcome(outcome, { density: 'compact' });
  const index = renderOrganizationalAreaIndex(path, { areaBase: '/areas', capabilityBase: '/capabilities' });
  const html = `${card}${index}`;
  assert.match(html, /outcome-card compact/);
  assert.match(html, /Decisão pedida/);
  assert.match(html, /href="\/areas\/delivery"/);
  assert.match(html, /href="\/areas\/platform"/);
  assert.doesNotMatch(html.slice(0, html.search(/<details/)), /Detalhes metodológicos/);
});
