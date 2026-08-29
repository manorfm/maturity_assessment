import assert from 'node:assert/strict';
import { test } from 'node:test';
import { diagnosticStrength, renderCapabilityDiagnosis, renderCapabilityRadar, renderClassification, renderFindingPortfolio, renderOutcome, renderPerspectiveSynthesis, renderScopeReport } from '../src/modules/projects/project-routes.js';

const leaf = (overrides: Partial<Parameters<typeof renderCapabilityRadar>[0][number]> = {}) => ({
  id: 'delivery', label: 'Entrega', level: 2.4, confidence: .8, evidence: 8,
  hasContradiction: false, assessed: true, coverage: 1, children: [], ...overrides,
});

test('radar diferencia fragilidade confirmada de ausência de evidência', () => {
  const html = renderCapabilityRadar([
    leaf({ id: 'critical', label: 'Crítica', level: .7 }),
    leaf({ id: 'unknown', label: 'Sem amostra', assessed: false, level: 0, confidence: 0, evidence: 0, coverage: .2 }),
  ], '/capabilities');

  assert.match(html, /radar-status-critical/);
  assert.match(html, /Fragilidade confirmada; exige ação imediata/);
  assert.match(html, /class="radar-marker radar-marker-unassessed"/);
  assert.match(html, /Evidência insuficiente/);
  assert.doesNotMatch(html, /href="\/capabilities\/unknown"/);
  assert.match(html, /aria-disabled="true"/);
});

test('recomendação apresenta decisão executiva antes da metodologia', () => {
  const html = renderCapabilityDiagnosis([{
    kind: 'correction', title: 'Mudanças aguardam filas externas',
    cause: 'Acesso depende de aprovações manuais.', intervention: 'Criar um caminho automatizado com controles embutidos.',
    confidence: .82, priority: .9, constraint: 'access', reasons: ['A espera apareceu em três jornadas.'],
    solutionCapability: 'Disponibilizar acesso seguro sem coordenação artesanal.',
    solutionReadiness: { stage: 'declared', label: 'Declarada, ainda não executada', explanation: 'Há conhecimento ou mecanismo declarado, sem execução coletiva observável.', evidence: 1 },
    experiment: { action: 'Automatizar um fluxo frequente.', owner: 'Plataforma', metric: 'Tempo de espera', reviewHorizon: '30 dias', successCriterion: 'Reduzir espera pela metade' },
  }], leaf());

  assert.match(html, /Atenção imediata/);
  assert.match(html, /Impacto no negócio/);
  assert.match(html, /Ação recomendada/);
  assert.match(html, /Como acompanhar/);
  assert.match(html, /Capacidade necessária para resolver/);
  assert.match(html, /Declarada, ainda não executada/);
  assert.match(html, /Ver diagnóstico, evidências e fundamento/);
  assert.doesNotMatch(html, /posterior provisório/);
});

test('impacto executivo acompanha a capacidade avaliada', () => {
  const html = renderCapabilityDiagnosis([{
    kind: 'correction', detailCapability: 'portfolio-management', title: 'Portfólio sem ciclo de resultado',
    intervention: 'Revisar uma iniciativa antes de começar outra.', confidence: .85, priority: .7,
  }], leaf());

  assert.match(html, /Novas iniciativas disputam capacidade/);
  assert.doesNotMatch(html, /exposição operacional no fluxo de entrega/);
});

test('cartão de correção mostra o universo da solução', () => {
  const html = renderOutcome({
    kind: 'correct',
    kindLabel: 'Corrigir o limitador',
    limiterLabel: 'Integração contínua',
    reading: 'Integração contínua está em opaco.',
    nextStepTitle: 'Mudanças permanecem isoladas',
    nextStepBody: 'Integre no mesmo dia.',
    finding: {
      kind: 'correction', pattern: 'mudanca-isolada', detailCapability: 'continuous-integration',
      title: 'Mudanças permanecem isoladas e encontram o sistema tarde', cause: '', intervention: 'Integre no mesmo dia',
      confidence: .9, priority: .9,
      foundation: { source: 'Continuous Delivery', principle: 'Integração frequente reduz o custo do encontro', why: 'O retorno acontece enquanto a mudança ainda é pequena.' },
      affectedCapabilities: ['continuous-integration', 'evolvability'],
      recommendationEvidence: { supportingParticipants: 5, applicablePopulation: 9, contradictingParticipants: 1, patterns: ['mudanca-isolada', 'integracao-por-janela'], layers: ['practice', 'system'], profiles: ['engineering', 'quality'] },
      solutionCapability: 'Integrar mudanças enquanto ainda são pequenas',
      solutionReadiness: { stage: 'local', label: 'Local e dependente do contexto', explanation: 'A capacidade aparece na prática, mas não foi difundida.', evidence: 2 },
      experiment: { action: 'Reduza uma mudança até integrá-la no mesmo dia', owner: 'Fluxo', metric: 'espera até a junta', reviewHorizon: '30 dias', successCriterion: 'encontro no mesmo dia' },
    },
  });
  assert.match(html, /Fundamento técnico e opções/);
  assert.match(html, /Princípio aplicado/);
  assert.match(html, /Integração frequente reduz o custo/);
  assert.match(html, /Integração em tronco/);
  assert.match(html, /Decisão solicitada/);
  assert.match(html, /A organização já consegue fazer isso/);
  assert.match(html, /Capacidade principal:<\/strong> Integração contínua/);
  assert.match(html, /Efeitos relacionados:<\/strong> Evolutibilidade/);
  assert.match(html, /Decisão solicitada/);
  assert.match(html, /5 de 9 pessoas que poderiam observar/);
  assert.match(html, /Engenharia · Qualidade \/ QA/);
  assert.match(html, /2 padrões de resposta/);
  assert.match(html, /1 pessoa relatou/);
  assert.match(html, /O que esta decisão não resolve/);
  assert.doesNotMatch(html, /ciclo de melhoria/);
});

test('cartão executivo explica a situação em linguagem cotidiana sem perder rastreabilidade', () => {
  const html = renderOutcome({
    kind: 'correct', kindLabel: 'Corrigir o limitador', limiterLabel: 'Governança habilitadora',
    reading: 'Governança está opaca.', nextStepTitle: 'Políticas exigem acumular mudanças', nextStepBody: 'Teste um caminho proporcional.',
    finding: {
      kind: 'correction', pattern: 'causa-processo-lote', detailCapability: 'enabling-governance',
      title: 'Políticas e etapas exigem acumular mudanças', cause: '', intervention: 'Teste um caminho proporcional.', confidence: .9, priority: .9,
      recommendationEvidence: { supportingParticipants: 4, applicablePopulation: 9, contradictingParticipants: 0, patterns: ['causa-processo-lote', 'controle-indiferenciado'], layers: ['practice'], profiles: ['management', 'engineering', 'product'] },
      solutionCapability: 'Caminho proporcional ao risco para mudança pequena e reversível',
      solutionReadiness: { stage: 'not-demonstrated', label: 'Não demonstrada', explanation: 'Ausência de evidência.', evidence: 0 },
      experiment: { action: 'Explicite o risco e teste um caminho simples para baixo risco.', owner: 'Governança e executores', metric: 'espera da mudança pequena', reviewHorizon: '30 dias', successCriterion: 'a mudança pequena avança sem perder o controle' },
    },
  });
  assert.match(html, /O que está acontecendo/);
  assert.match(html, /O que as entrevistas mostraram/);
  assert.match(html, /O que recomendamos testar/);
  assert.match(html, /Como saber se funcionou/);
  assert.match(html, /4 de 9 pessoas que poderiam observar/);
  assert.match(html, /2 padrões de resposta/);
  assert.match(html, /ainda não mostraram esse caminho funcionando/i);
  assert.doesNotMatch(html, /padrões independentes|Capacidade para resolver|Impacto decisório/);
});

test('decisão principal explica que é uma prioridade entre vários problemas', () => {
  const html = renderOutcome({
    kind: 'correct', kindLabel: 'Corrigir o limitador', limiterLabel: 'Integração contínua',
    reading: 'Integração limita o fluxo.', nextStepTitle: 'A esteira devolve feedback tarde', nextStepBody: 'Reduza o retorno.',
    finding: { kind: 'correction', pattern: 'mudanca-isolada', detailCapability: 'continuous-integration', title: 'A esteira devolve feedback tarde', cause: '', intervention: '', confidence: .9, priority: .9 },
  }, { confirmedProblemCount: 5, occurrence: { pattern: 'mudanca-isolada', scopePaths: ['Empresa/Squad Alfa'], eligibleScopePaths: ['Empresa/Squad Alfa', 'Empresa/Squad Beta'], eligibleScopeCount: 2 } });
  assert.match(html, /prioridade 1 de 5 problemas confirmados/i);
  assert.match(html, /alcance e severidade/i);
  assert.match(html, /Escopo local/);
  assert.match(html, /Squad Alfa/);
});

test('panorama mostra outros problemas confirmados sem duplicar a decisão principal', () => {
  const html = renderFindingPortfolio([
    { kind: 'correction', pattern: 'pipeline', detailCapability: 'continuous-integration', title: 'A esteira devolve feedback tarde', cause: '', intervention: '', confidence: .9, priority: .9, recommendationEvidence: { supportingParticipants: 8, applicablePopulation: 10, contradictingParticipants: 0, patterns: ['pipeline'], layers: ['practice'], profiles: ['engineering', 'quality'] } },
    { kind: 'correction', pattern: 'communication', detailCapability: 'collaboration', title: 'Dependências exigem coordenação constante', cause: '', intervention: '', confidence: .8, priority: .8, recommendationEvidence: { supportingParticipants: 7, applicablePopulation: 10, contradictingParticipants: 1, patterns: ['communication'], layers: ['system'], profiles: ['management', 'product'] } },
    { kind: 'correction', pattern: 'pipeline', detailCapability: 'sdlc-automation', title: 'A esteira devolve feedback tarde', cause: '', intervention: '', confidence: .9, priority: .7 },
  ], 'pipeline');
  assert.match(html, /Panorama de problemas confirmados/);
  assert.match(html, /1 outro padrão exige atenção/);
  assert.match(html, /Dependências exigem coordenação constante/);
  assert.match(html, /Colaboração/);
  assert.match(html, /7 de 10 pessoas/);
  assert.doesNotMatch(html, /A esteira devolve feedback tarde/);
});

test('panorama informa o total confirmado mesmo quando limita a lista executiva', () => {
  const findings = Array.from({ length: 7 }, (_, index) => ({
    kind: 'correction' as const,
    pattern: `pattern-${index}`,
    detailCapability: 'collaboration',
    title: `Problema ${index}`,
    cause: '', intervention: '', confidence: .9, priority: 1 - index / 10,
  }));
  const html = renderFindingPortfolio(findings, 'pattern-0');
  assert.match(html, /6 outros padrões confirmados/);
  assert.match(html, /mostrando os 4 mais prioritários/i);
  assert.equal((html.match(/<li>/g) ?? []).length, 4);
});

test('panorama mostra onde cada problema foi observado sem generalizar uma squad', () => {
  const html = renderFindingPortfolio([{
    kind: 'correction', pattern: 'pipeline', detailCapability: 'continuous-integration',
    title: 'A esteira devolve feedback tarde', cause: '', intervention: '', confidence: .9, priority: .9,
  }], undefined, [{ pattern: 'pipeline', scopePaths: ['Empresa/Squad Alfa'], eligibleScopePaths: ['Empresa/Squad Alfa', 'Empresa/Squad Beta'], eligibleScopeCount: 2 }]);
  assert.match(html, /Escopo local/);
  assert.match(html, /Squad Alfa/);
  assert.match(html, /não foi demonstrado na Squad Beta/i);
});

test('recorte de squad apresenta decisão e problemas próprios', () => {
  const html = renderScopeReport({
    id: 'alfa', path: 'Empresa/Squad Alfa',
    classification: { level: 0, label: 'Opaco', limitingCapabilities: ['Integração contínua'] },
    capabilityGroups: [leaf({ id: 'continuous-integration', label: 'Integração contínua', level: 0 })],
    findings: [
      { kind: 'correction', pattern: 'pipeline', detailCapability: 'continuous-integration', title: 'A esteira devolve feedback tarde', cause: '', intervention: 'Reduza o retorno.', confidence: .9, priority: .9 },
      { kind: 'correction', pattern: 'environment', detailCapability: 'platform-autonomy', title: 'Ambientes chegam por fila', cause: '', intervention: 'Teste autosserviço.', confidence: .8, priority: .8 },
    ],
    perspectiveGaps: [],
  }, '/capabilities');
  assert.match(html, /Próxima decisão/);
  assert.match(html, /A esteira devolve feedback tarde/);
  assert.match(html, /Panorama de problemas confirmados/);
  assert.match(html, /Ambientes chegam por fila/);
});

test('radar executivo mostra estado e suficiência de evidência sem decimal ou porcentagem', () => {
  const html = renderCapabilityRadar([
    leaf({ label: 'Entrega', level: 2.4, coverage: 1 }),
    leaf({ id: 'partial', label: 'Plataforma', level: 1.2, coverage: .67 }),
  ], '/capabilities');

  assert.match(html, /Entrega <span>Repetível · cobertura temática ampla<\/span>/);
  assert.match(html, /Plataforma <span>Reativo · cobertura temática parcial<\/span>/);
  assert.doesNotMatch(html, />2\.4 · 100%</);
  assert.doesNotMatch(html, />1\.2 · 67%</);
});

test('resumo executivo mostra um limitador e a próxima decisão, sem lista aberta', () => {
  const outcome = {
    kind: 'correct' as const,
    kindLabel: 'Corrigir o limitador',
    limiterLabel: 'Descoberta e validação',
    reading: 'Descoberta e validação limita o recorte em reativo.',
    nextStepTitle: 'Hipóteses permanecem em execução',
    nextStepBody: 'Reconstrua a última hipótese que avançou sem evidência de uso.',
  };
  const html = renderClassification({
    level: 1, label: 'Reativo',
    limitingCapabilities: ['Descoberta e validação', 'Aprendizado e adaptação', 'Fluxo de trabalho', 'Integração contínua'],
  }, outcome);
  assert.match(html, /Descoberta e validação/);
  assert.match(html, /elo que limita o sistema, não a organização inteira/i);
  assert.doesNotMatch(html, /e mais/);
  assert.doesNotMatch(html, /Hipóteses permanecem em execução/);
  assert.match(renderOutcome(outcome), /Próxima decisão/);
  assert.match(renderOutcome(outcome), /Corrigir o limitador/);
  assert.match(renderOutcome(outcome), /Hipóteses permanecem em execução/);
});

test('divergência suspende a classificação ordinal no primeiro plano', () => {
  const html = renderClassification(
    { level: 0, label: 'Opaco', limitingCapabilities: ['Aprendizado'] },
    { kind: 'discriminate', kindLabel: 'Discriminar antes de intervir', limiterLabel: 'Perspectivas divergem sobre aprendizado', reading: 'As lentes divergem.', nextStepTitle: 'Triangular', nextStepBody: 'Reconstruir evento.' },
  );
  assert.match(html, /Inconclusivo/);
  assert.doesNotMatch(html, />0 · Opaco</);
  assert.match(html, /divergência de perspectivas/i);
});

test('relatório pré-piloto usa faixas verbais em vez de percentuais causais', () => {
  assert.equal(diagnosticStrength(.9), 'Hipótese fortemente sustentada');
  const html = renderCapabilityDiagnosis([{
    kind: 'correction', title: 'Problema recorrente', intervention: 'Testar uma mudança pequena.', confidence: .9, priority: .8,
  }], leaf());
  assert.match(html, /Hipótese fortemente sustentada/);
  assert.doesNotMatch(html, /90%/);
});

test('divergências são condensadas em uma hipótese de fronteira, não repetidas por capacidade', () => {
  const html = renderPerspectiveSynthesis([
    { title: 'Perspectivas divergem sobre aprendizado', capability: 'aprendizado', strongerProfiles: ['Gestão'], constrainedProfiles: ['Engenharia'] },
    { title: 'Perspectivas divergem sobre fluxo', capability: 'fluxo', strongerProfiles: ['Gestão'], constrainedProfiles: ['Engenharia'] },
    { title: 'Perspectivas divergem sobre arquitetura', capability: 'arquitetura', strongerProfiles: ['Gestão'], constrainedProfiles: ['Engenharia'] },
  ], []);

  assert.equal((html.match(/divergência agregada/g) ?? []).length, 1);
  assert.match(html, /3 capacidades/);
  assert.match(html, /Gestão/);
  assert.match(html, /Engenharia/);
  assert.match(html, /evento recente compartilhado/);
});
