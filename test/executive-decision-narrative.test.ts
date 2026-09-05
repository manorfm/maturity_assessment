import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildDiagnosticContext } from '../src/modules/inference/domain/diagnostic-contract.js';
import { projectFindingNarrative } from '../src/modules/inference/domain/finding-narrative.js';
import { guidanceFor } from '../src/modules/inference/domain/solution-guidance.js';
import { audienceAsk } from '../src/modules/inference/domain/audience-report.js';
import { POC_SYNTHETIC_ORGS } from '../src/modules/inference/domain/organizational-synthetic.js';
import { renderFindingPortfolio, renderOutcome } from '../src/modules/projects/project-routes.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';

const portfolioFinding: OutcomeFinding = {
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
  foundation: { source: 'Lean portfolio management', principle: 'Capacidade protegida para fechar o ciclo de resultado', why: 'Medir sem reservar capacidade para decidir não muda o investimento.' },
  recommendationEvidence: {
    supportingParticipants: 6, applicablePopulation: 6, contradictingParticipants: 0,
    patterns: ['causa-capacidade-tomada-pela-proxima-iniciativa'], layers: ['system'], profiles: ['product', 'management', 'data'],
  },
};

test('gravidade indeterminada não inventa custo, velocidade nem previsibilidade', () => {
  const context = buildDiagnosticContext({ capability: 'portfolio-management', constraint: 'priority' });
  assert.equal(context.severity, 'undetermined');
  assert.deepEqual(context.impacts, []);
  const narrative = projectFindingNarrative({ ...portfolioFinding, impacts: context.impacts, severity: context.severity });
  const importance = narrative.sections.find((section) => section.id === 'importance')!;
  assert.match(importance.body, /ainda não foi medido/i);
  assert.doesNotMatch(importance.body, /custo|velocidade de entrega|previsibilidade/i);
});

test('cartão do portfólio fecha decisão sem metáfora de aprender nem culpar o time', () => {
  const html = renderOutcome({
    kind: 'correct', kindLabel: 'Corrigir o limitador', limiterLabel: 'Gestão de portfólio',
    reading: '', nextStepTitle: portfolioFinding.title, nextStepBody: portfolioFinding.intervention, finding: portfolioFinding,
  });
  const guidance = guidanceFor(portfolioFinding.pattern, portfolioFinding.foundation, portfolioFinding.title);
  assert.match(guidance.plainExplanation, /quem autoriza o próximo ciclo/i);
  assert.doesNotMatch(guidance.plainExplanation, /a equipe sabe|a equipe já recebeu/i);
  assert.match(html, /Decisão pedida/);
  assert.match(html, /liderança de produto, portfólio e orçamento/i);
  assert.match(html, /ainda não foi medido/i);
  assert.match(html, /Capacidade condicionada à revisão de resultado/);
  assert.match(html, /Lean portfolio/);
  assert.match(html, /reunião de métricas/i);
  assert.doesNotMatch(html, /capacidade de aprender/);
  assert.doesNotMatch(html, /A consequência alcança custo/);
});

test('panorama lista todos os padrões e separa investigar de decidir', () => {
  const findings = [
    portfolioFinding,
    { ...portfolioFinding, pattern: 'empacotamento-manual', title: 'Preparação concentra espera', detailCapability: 'release-feedback', prescription: { status: 'investigate' as const, reason: 'Ainda falta o mecanismo.' }, experiment: undefined },
    { ...portfolioFinding, pattern: 'provisionamento-em-fila', title: 'Ambientes chegam por fila', detailCapability: 'platform-autonomy', prescription: { status: 'investigate' as const, reason: 'Ainda falta o mecanismo.' }, experiment: undefined },
    { ...portfolioFinding, pattern: 'mudanca-emergencial-reconciliada', title: 'Emergência exige trabalho posterior', detailCapability: 'reproducible-infrastructure', prescription: { status: 'investigate' as const, reason: 'Ainda falta o mecanismo.' }, experiment: undefined },
    { ...portfolioFinding, pattern: 'espera-normalizada', title: 'Espera some atrás de novo início', detailCapability: 'work-management', prescription: { status: 'investigate' as const, reason: 'Ainda falta o mecanismo.' }, experiment: undefined },
    { ...portfolioFinding, pattern: 'retrospectiva-sem-fechamento', title: 'A lista de melhoria não fecha', detailCapability: 'organizational-learning', prescription: { status: 'investigate' as const, reason: 'Ainda falta o mecanismo.' }, experiment: undefined },
  ];
  const html = renderFindingPortfolio(findings, portfolioFinding.pattern);
  assert.match(html, /5 padrões ainda pedem discriminação/i);
  assert.doesNotMatch(html, /mostrando os 4/);
  assert.match(html, /Preparação concentra espera/);
  assert.match(html, /A lista de melhoria não fecha/);
  assert.match(html, /não entra como decisão para diretoria/i);
});

test('nome do sintético médio não alega prática repetível', () => {
  const medium = POC_SYNTHETIC_ORGS.find((org) => org.band === 'medium')!;
  assert.doesNotMatch(medium.name, /prática repetível/i);
  assert.match(medium.name, /reativo|espera|restrição/i);
});

test('diretoria, gerência e tecnologia leem a mesma restrição com perguntas distintas', () => {
  assert.match(audienceAsk(portfolioFinding, 'executive'), /autorizar o ciclo seguinte|reservar/i);
  assert.match(audienceAsk(portfolioFinding, 'unit-management'), /não falhou em aprender|escale/i);
  assert.match(audienceAsk(portfolioFinding, 'technology-leadership'), /não é ferramenta/i);
  assert.doesNotMatch(audienceAsk(portfolioFinding, 'executive'), /custo, velocidade/);
});
