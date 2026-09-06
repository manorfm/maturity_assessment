import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import { AudienceReportProjector } from '../src/modules/inference/domain/audience-report.js';
import { TransformationPortfolioPlanner } from '../src/modules/inference/domain/transformation-portfolio.js';
import {
  renderAudienceBriefs,
  renderFirstScreen,
  renderOrganizationalAreaIndex,
  renderOrganizationalAreaMap,
  renderOutcome,
  renderScopeIndex,
  renderAreaRecorte,
} from '../src/modules/projects/project-routes.js';
import { compactMechanismBody } from '../src/modules/inference/domain/finding-narrative.js';
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
    strength: {
      executiveStatus: 'directional',
      convergence: 'high',
      populationBreadth: 'medium',
      perspectiveDiversity: 'medium',
      causalCoverage: 'low',
    },
  },
};

const investigate = (pattern: string, title: string, detailCapability: string): OutcomeFinding => {
  const { experiment: _experiment, ...base } = readyFinding;
  return { ...base, pattern, title, detailCapability, prescription: { status: 'investigate', reason: 'Ainda falta o mecanismo.' } };
};

const outcome = {
  kind: 'correct' as const, kindLabel: 'Precisa de correção', limiterLabel: 'Gestão de portfólio',
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
    capabilityGroups: overrides.capabilityGroups ?? [
      leaf('work-management', 'Fluxo'),
      { ...leaf('continuous-integration', 'Integração'), assessed: false, coverage: .2, evidence: 0 },
    ],
    ...overrides,
  });
}

test('mecanismo compacto corta o título e os hedges', () => {
  const echoed = compactMechanismBody({
    ...readyFinding,
    title: 'O war room virou o modo de ver e gerir o sistema',
    cause: 'O war room virou o modo de ver e gerir o sistema, então a liderança só enxerga o trabalho quando já quebrou.',
  });
  assert.match(echoed, /liderança só enxerga o trabalho quando já quebrou/);
  assert.doesNotMatch(echoed, /O war room virou o modo de ver e gerir o sistema/);
  assert.doesNotMatch(echoed, /Ainda falta|Limite:/);
});

test('cartão compacto começa pelo problema e só depois pede a ação', () => {
  const html = renderOutcome(outcome, { density: 'compact' });
  const firstPlane = html.slice(0, html.search(/<details[^>]*class="[^"]*methodology/));
  const happening = firstPlane.indexOf('O que está acontecendo');
  const repeats = firstPlane.indexOf('Por que isso se repete');
  const action = firstPlane.indexOf('O que fazer agora');
  assert.ok(happening >= 0 && repeats > happening && action > repeats);
  assert.match(firstPlane, /comprometidas com a próxima iniciativa|já foram alocadas/);
  assert.doesNotMatch(firstPlane, /aposta já comeu|comeu as pessoas/);
  assert.doesNotMatch(firstPlane, /<h2>A próxima iniciativa ocupa a capacidade/);
  assert.match(firstPlane, /Novos compromissos ocupam toda a capacidade/);
  assert.match(firstPlane, /Não autorizar todo o próximo ciclo/);
  assert.match(firstPlane, /Como saber se funcionou|Teste:/);
  assert.match(firstPlane, /O que esta decisão não resolve/);
  assert.match(firstPlane, /Quem autoriza/);
  assert.doesNotMatch(firstPlane, /Não faça/);
  assert.doesNotMatch(firstPlane, /não significa que (ele )?não exista/i);
  assert.doesNotMatch(firstPlane, /catalog-title/);
  assert.match(html, /<details[^>]*>[\s\S]*Não faça/);
  assert.match(firstPlane, /Precisa de correção/);
  assert.doesNotMatch(firstPlane, /Próxima decisão/);
  assert.doesNotMatch(firstPlane, /Corrigir o limitador/);
  assert.doesNotMatch(firstPlane, /Decisão pedida/);
  assert.match(html, /<details[^>]*>[\s\S]*Lean portfolio/);
  assert.match(html, /<details[^>]*>[\s\S]*Fundamento e evidência/);
  assert.doesNotMatch(firstPlane, /Lean portfolio/);
  assert.doesNotMatch(firstPlane, /Detalhes metodológicos/);
  assert.doesNotMatch(firstPlane, /A organização já consegue fazer isso/);
  const actionBlock = firstPlane.slice(action);
  assert.equal((actionBlock.match(/Não autorizar todo o próximo ciclo/g) ?? []).length, 1);
});

test('cartão compacto não ecoa o título no mecanismo visível', () => {
  const finding = {
    ...readyFinding,
    pattern: 'war-room-como-gestao',
    detailCapability: 'leadership-management',
    title: 'O war room virou o modo de ver e gerir o sistema',
    cause: 'O war room virou o modo de ver e gerir o sistema, então a liderança só enxerga o trabalho quando já quebrou e o reconhecimento cai em quem apaga o incêndio.',
  };
  const html = renderOutcome({
    kind: 'correct', kindLabel: 'Precisa de correção', limiterLabel: 'Liderança e gestão',
    reading: '', nextStepTitle: finding.title, nextStepBody: finding.intervention, finding,
  }, { density: 'compact' });
  const firstPlane = html.slice(0, html.search(/<details/));
  assert.match(firstPlane, /liderança só enxerga o trabalho quando já quebrou/i);
  assert.equal((firstPlane.match(/O war room virou o modo de ver e gerir o sistema/g) ?? []).length, 0);
  assert.doesNotMatch(firstPlane, /Não faça/);
  assert.doesNotMatch(firstPlane, /A organização já consegue fazer isso/);
});

test('força da evidência fala em confirmação, não em evidência direcional', () => {
  const html = renderOutcome(outcome, { density: 'full' });
  assert.doesNotMatch(html, /Evidência direcional/);
  assert.match(html, /Os relatos apontam nesta direção\. Ainda não é confirmação/);
  assert.match(html, /Acordo entre os relatos/);
  assert.match(html, /quantas pessoas|Tamanho da base/i);
});

test('first screen mostra a amostra que o experimento real precisa repetir', () => {
  const html = firstScreen({
    sample: {
      completed: 18,
      units: [
        { path: 'Produto em transição/Gama', completed: 9 },
        { path: 'Produto em transição/Delta', completed: 9 },
      ],
    },
  });
  assert.match(html, /18 pessoas em 2 unidades/);
  assert.match(html, /Gama \(9\)/);
  assert.match(html, /Delta \(9\)/);
  assert.doesNotMatch(html, /Para repetir com dados reais/);
  assert.doesNotMatch(html, /Calibração \(50–100/);
  const sample = html.indexOf('Amostra desta leitura');
  const problems = html.indexOf('Problemas publicados');
  const systems = html.indexOf('Sistemas da organização');
  assert.ok(sample >= 0 && sample < problems && problems < systems);
});

test('first screen lista problemas por área com caminho e sustentação, não uma decisão única', () => {
  const html = firstScreen();
  const index = html.indexOf('Problemas publicados');
  const product = html.indexOf('>Produto</');
  const engineering = html.indexOf('>Engenharia</');
  const management = html.indexOf('>Gestão</');
  const systems = html.indexOf('Sistemas da organização');
  const units = html.indexOf('Unidades');
  assert.ok(index >= 0 && product > index && engineering > product && management > engineering && systems > management && units > systems);
  assert.match(html, /class="interview-report"/);
  assert.match(html, /A decisão — se houver — é de quem autoriza/);
  assert.match(html, /Não autorize todo o próximo ciclo|Não autorizar todo o próximo ciclo/);
  assert.match(html, /Sustentação provisória alta/);
  assert.match(html, /capacidade reservada para rever o resultado|Medir sem reservar capacidade/);
  assert.match(html, /Impacto esperado/);
  assert.match(html, /O que este caminho não resolve/);
  assert.doesNotMatch(html.slice(0, index + 80), /O que fazer agora/);
  assert.doesNotMatch(html, /class="outcome-card compact"/);
  assert.match(html, />Produto</);
  assert.match(html, />Engenharia</);
  assert.match(html, />Operação</);
  assert.match(html, /Ver disciplinas/);
  assert.match(html, /class="report-systems first-screen-systems"/);
  assert.match(html, /class="card finding-index"/);
  assert.match(html, /class="card scope-index"/);
  assert.match(html, /Mapa de contraste e cobertura/);
  assert.match(html, /<svg/);
  assert.ok(html.indexOf('Sistemas da organização') < html.indexOf('Mapa de contraste e cobertura'));
  assert.doesNotMatch(html, /Outros problemas/);
  assert.doesNotMatch(html, /Aguarde mais respostas/);
  assert.doesNotMatch(html, /<article class="area-tile[^"]*">\s*(?:<a[^>]*>)?<h3>Gestão<\/h3>/);
  assert.match(html, /<nav class="area-band" aria-label="Gestão"/);
});

test('outras restrições separam mecanismos e mostram o que cada um faz', () => {
  const html = firstScreen();
  const plane = html.slice(0, html.indexOf('first-screen-deep') === -1 ? html.length : html.indexOf('first-screen-deep'));
  assert.doesNotMatch(plane, /Como as disciplinas se cruzam/);
  assert.doesNotMatch(plane, /Onde mais isso chega/);
  assert.doesNotMatch(plane, / em Acesso a capacidades gera /);
  assert.doesNotMatch(plane, /Inventário por frente/);
  assert.doesNotMatch(plane, /entrevista não atravessou/);
  assert.doesNotMatch(plane, /Outras restrições/);
  assert.doesNotMatch(html, /sustentam o mesmo efeito/);
  assert.doesNotMatch(html, /O que alimenta este efeito/);
  assert.doesNotMatch(html, /Sequência de transformação/);
  assert.doesNotMatch(html, /mostrando os 4/);
  assert.doesNotMatch(html, /Também observado nas entrevistas/);
});

test('unidades ocupam uma linha, apontam cobertura e não reimprimem o cartão nem o radar', () => {
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
  assert.match(html, /Ver cobertura deste time/);
  assert.match(html, /href="\/capabilities\/continuous-integration\?scope=alfa"/);
  assert.doesNotMatch(html, /outcome-card/);
  assert.doesNotMatch(html, /Próxima decisão/);
  assert.doesNotMatch(html, /Mapa de contraste e cobertura/);
  assert.doesNotMatch(html, /<svg/);
});

test('página de área mostra o recorte, as disciplinas e o radar', () => {
  const map = OrganizationalAreaProjector.project({
    capabilities: [
      { id: 'work-management', label: 'Fluxo', level: 1, confidence: .8, evidence: 4, hasContradiction: false, coverage: 1 },
      { id: 'platform-autonomy', label: 'Plataforma', level: 1, confidence: .8, evidence: 4, hasContradiction: false, coverage: 1 },
    ],
    findings: [readyFinding],
  });
  const path = map.systems.filter((system) => system.id === 'engineering');
  const html = renderAreaRecorte(path, {
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    findings: [readyFinding],
    organizationalAreas: map,
    capabilities: [
      leaf('work-management', 'Fluxo de trabalho'),
      leaf('platform-autonomy', 'Acesso a capacidades'),
    ],
  });
  assert.match(html, /Disciplinas de Engenharia/);
  assert.match(html, /href="\/areas\/delivery"/);
  assert.match(html, /href="\/areas\/platform"/);
  assert.match(html, /Mapa de contraste e cobertura/);
  assert.match(html, /<svg/);
  assert.doesNotMatch(html, /outcome-card/);
  assert.doesNotMatch(html, /Próxima decisão/);
});

test('cartão compacto não lista hipóteses concorrentes da mesma família', () => {
  const html = renderOutcome({
    ...outcome,
    finding: {
      ...readyFinding,
      causalAnalysis: {
        knowledgeVersion: 'test',
        hypothesis: 'A hipótese principal explica o recorte.',
        alternatives: ['Outra leitura da mesma família.', 'Terceira variação do mesmo limitador.'],
        evidenceFor: [],
        evidenceAgainst: [],
        missingEvidence: 'Falta um evento.',
        limitations: 'Não cria capacidade.',
      },
    },
  }, { density: 'compact' });
  const compact = html.slice(0, html.indexOf('Fundamento e evidência'));
  assert.match(compact, /A hipótese principal explica o recorte/);
  assert.doesNotMatch(compact, /Hipóteses concorrentes/);
  assert.doesNotMatch(compact, /Outra leitura da mesma família/);
});

test('mapa da home aponta Ver disciplinas no sistema observado', () => {
  const map = OrganizationalAreaProjector.project({
    capabilities: [
      { id: 'work-management', label: 'Fluxo', level: 1, confidence: .8, evidence: 4, hasContradiction: false, coverage: 1 },
    ],
    findings: [readyFinding],
  });
  const html = renderOrganizationalAreaMap(map, { areaBase: '/areas', capabilityBase: '/capabilities' });
  assert.match(html, /Ver disciplinas/);
  assert.match(html, /href="\/areas\/engineering"/);
});

test('briefing de diretoria é um cartão com o pedido, não uma lista de links', () => {
  const findings = [
    { ...readyFinding },
    { kind: 'correction' as const, pattern: 'policy', detailCapability: 'enabling-governance', title: 'Política acumula mudanças pequenas', cause: '', intervention: '', confidence: .9, priority: .9, mechanism: 'policy' as const, containment: 'organizational-policy' as const, decisionAuthority: 'organizational-governance' as const, prescription: { status: 'ready' as const, reason: 'confirmado' } },
  ];
  const reports = AudienceReportProjector.project({ findings, portfolio: TransformationPortfolioPlanner.plan(findings) });
  const html = renderAudienceBriefs(reports, '/capabilities');
  assert.match(html, /Briefing para diretoria/);
  assert.match(html, /article class="audience-brief-card"/);
  assert.match(html, /Pare de autorizar o ciclo seguinte|Autorizar, recusar ou redirecionar/);
  assert.match(html, /Quem autoriza/);
  assert.match(html, /Ver detalhe/);
  assert.doesNotMatch(html, /<ol>[\s\S]*?<li><a href="\/capabilities/);
});

test('índice de área continua listando filhos sem nota de grupo', () => {
  const map = OrganizationalAreaProjector.project({
    capabilities: [
      { id: 'work-management', label: 'Fluxo', level: 1, confidence: .8, evidence: 4, hasContradiction: false, coverage: 1 },
      { id: 'platform-autonomy', label: 'Plataforma', level: 1, confidence: .8, evidence: 4, hasContradiction: false, coverage: 1 },
    ],
    findings: [readyFinding],
  });
  const path = map.systems.filter((system) => system.id === 'engineering');
  const index = renderOrganizationalAreaIndex(path, { areaBase: '/areas', capabilityBase: '/capabilities' });
  assert.match(index, /href="\/areas\/delivery"/);
  assert.match(index, /href="\/areas\/platform"/);
  assert.doesNotMatch(index, /de 4/);
});
