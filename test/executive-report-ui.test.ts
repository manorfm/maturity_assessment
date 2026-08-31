import assert from 'node:assert/strict';
import { test } from 'node:test';
import { diagnosticStrength, renderAudienceBriefs, renderAudienceNavigation, renderCapabilityDiagnosis, renderCapabilityRadar, renderClassification, renderDiagnosticFirstPlane, renderFindingPortfolio, renderOutcome, renderPerspectiveSynthesis, renderScopeReport } from '../src/modules/projects/project-routes.js';
import { AudienceReportProjector } from '../src/modules/inference/domain/audience-report.js';
import { TransformationPortfolioPlanner } from '../src/modules/inference/domain/transformation-portfolio.js';
import { SociotechnicalPattern } from '../src/modules/inference/domain/sociotechnical-pattern.js';

const leaf = (overrides: Partial<Parameters<typeof renderCapabilityRadar>[0][number]> = {}) => ({
  id: 'delivery', label: 'Entrega', level: 2.4, confidence: .8, evidence: 8,
  hasContradiction: false, assessed: true, coverage: 1, children: [], ...overrides,
});

test('primeiro plano é o diagnóstico, não o estágio nem o radar', () => {
  const outcome = {
    kind: 'correct' as const, kindLabel: 'Corrigir o limitador', limiterLabel: 'Integração contínua', limiterId: 'continuous-integration',
    reading: 'Mudanças ficam isoladas.', nextStepTitle: 'Mudanças permanecem isoladas', nextStepBody: 'Integre no mesmo dia.',
    finding: {
      kind: 'correction' as const, pattern: 'mudanca-isolada', detailCapability: 'continuous-integration',
      title: 'Mudanças permanecem isoladas', cause: '', intervention: 'Integre no mesmo dia.', confidence: .9, priority: .9,
      recommendationEvidence: { supportingParticipants: 5, applicablePopulation: 9, contradictingParticipants: 0, patterns: ['mudanca-isolada'], layers: ['practice'], profiles: ['engineering'] },
      experiment: { action: 'Integre no mesmo dia.', owner: 'Fluxo', metric: 'espera até a junta', reviewHorizon: '30 dias', successCriterion: 'encontro no mesmo dia' },
    },
  };
  const html = renderDiagnosticFirstPlane({
    classification: { level: 0, label: 'Opaco', limitingCapabilities: ['Integração contínua'] },
    outcome,
    findings: [outcome.finding],
    confirmedProblemCount: 2,
  });
  const diagnosis = html.indexOf('O que observamos');
  const interviews = html.indexOf('O que sustenta ou contradiz');
  const test = html.indexOf('Próximo experimento');
  const success = html.indexOf('Como saber se funcionou');
  const consistency = html.indexOf('Consistência do comportamento no elo limitante');
  assert.ok(diagnosis >= 0 && interviews > diagnosis && test > interviews && success > test);
  assert.ok(consistency > success);
  assert.doesNotMatch(html, /Resumo executivo/);
  assert.match(html, /<details[^>]*>[\s\S]*0 · Opaco/);
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
  assert.match(html, /Detalhes metodológicos/);
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
  assert.match(html, /O que observamos/);
  assert.match(html, /O que sustenta ou contradiz/);
  assert.match(html, /Próximo experimento/);
  assert.match(html, /Como saber se funcionou/);
  assert.match(html, /4 de 9 pessoas que poderiam observar/);
  assert.match(html, /2 padrões de resposta/);
  assert.match(html, /Políticas e etapas exigem acumular mudanças.*O que observamos/s);
  assert.match(html, /5 pessoas não aparecem neste agregado como apoio nem como contradição específica/);
  assert.match(html, /não significa que (?:as demais pessoas )?concordaram com a hipótese/i);
  assert.match(html, /Nenhuma contradição específica atingiu o limiar de publicação/);
  assert.match(html, /ainda não mostraram esse caminho funcionando/i);
  assert.equal((html.match(/data-narrative="evidence"/g) ?? []).length, 1);
  assert.doesNotMatch(html, /padrões independentes|Capacidade para resolver|Impacto decisório/);
});

test('decisão principal explica que é uma prioridade entre vários problemas', () => {
  const html = renderOutcome({
    kind: 'correct', kindLabel: 'Corrigir o limitador', limiterLabel: 'Integração contínua',
    reading: 'Integração limita o fluxo.', nextStepTitle: 'A esteira devolve feedback tarde', nextStepBody: 'Reduza o retorno.',
    finding: { kind: 'correction', pattern: 'mudanca-isolada', detailCapability: 'continuous-integration', title: 'A esteira devolve feedback tarde', cause: '', intervention: '', confidence: .9, priority: .9 },
  }, { confirmedProblemCount: 5, occurrence: { pattern: 'mudanca-isolada', scopePaths: ['Empresa/Squad Alfa'], eligibleScopePaths: ['Empresa/Squad Alfa', 'Empresa/Squad Beta'], eligibleScopeCount: 2 } });
  assert.match(html, /prioridade 1 de 5 problemas confirmados/i);
  assert.match(html, /intensidade do sinal e alcance/i);
  assert.match(html, /Escopo local/);
  assert.match(html, /Squad Alfa/);
});

test('prioridade compara a decisão principal com o próximo problema', () => {
  const primary = { kind: 'correction' as const, pattern: 'mudanca-isolada', detailCapability: 'continuous-integration', title: 'Mudanças permanecem isoladas', cause: '', intervention: '', confidence: .9, priority: .78, priorityFactors: { intensity: 1, reach: .4 } };
  const runnerUp = { kind: 'correction' as const, pattern: 'acoes-perdem-dono', detailCapability: 'organizational-learning', title: 'Ações de melhoria perdem continuidade', cause: '', intervention: '', confidence: .9, priority: .68, priorityFactors: { intensity: .5, reach: 1 } };
  const html = renderOutcome({ kind: 'correct', kindLabel: 'Corrigir o limitador', limiterLabel: 'Integração contínua', reading: '', nextStepTitle: '', nextStepBody: '', finding: primary }, { confirmedProblemCount: 2, competingFinding: runnerUp });
  assert.match(html, /Comparação com a próxima frente/);
  assert.match(html, /Ações de melhoria perdem continuidade/);
  assert.match(html, /intensidade mais alta do sinal/i);
});

test('detalhe causal mostra alternativas, evidência contrária e limite do conhecimento', () => {
  const finding = {
    kind: 'correction' as const, pattern: 'causa-ferramental-feedback', detailCapability: 'continuous-integration',
    title: 'O retorno técnico chega tarde', cause: 'A verificação não orienta a decisão.', intervention: 'Teste a verificação crítica.', confidence: .8, priority: .8,
    causalAnalysis: {
      knowledgeVersion: 'causal-catalog-v1', hypothesis: 'A verificação não orienta a decisão.',
      alternatives: ['Uma política exige acumular mudanças.', 'A fronteira exige coordenação.'],
      evidenceFor: ['Retorno automatizado lento'], evidenceAgainst: ['Integração segura sob pressão'],
      missingEvidence: 'Confirmar se a política obriga o lote.', limitations: 'Não corrige uma política externa.',
    },
  };
  const html = renderOutcome({ kind: 'correct', kindLabel: 'Corrigir o limitador', limiterLabel: 'Integração contínua', reading: '', nextStepTitle: '', nextStepBody: '', finding });
  assert.match(html, /Outras explicações que ainda competem/);
  assert.match(html, /Evidência que contraria/);
  assert.match(html, /causal-catalog-v1/);
  assert.match(html, /Não corrige uma política externa/);
});

test('detalhe causal publica ciclo sociotécnico sem apresentá-lo como causalidade comprovada', () => {
  const finding = {
    kind: 'correction' as const, pattern: 'causa-processo-lote', detailCapability: 'continuous-integration',
    title: 'Mudanças acumulam antes da integração', cause: '', intervention: '', confidence: .8, priority: .8,
    causalAnalysis: {
      knowledgeVersion: 'causal-catalog-v2', hypothesis: 'A política preserva lotes maiores.', alternatives: [],
      evidenceFor: ['O lote foi adiado.', 'O conflito apareceu na integração.'], evidenceAgainst: [], missingEvidence: 'Confirmar a autoridade.', limitations: 'Não prova causalidade.',
      sociotechnicalPattern: SociotechnicalPattern.create({
        kind: 'vicious', behavior: 'O lote foi ampliado para preservar a data.', enablingCondition: 'A data premia volume entregue.',
        localRationale: 'Agrupar reduz coordenação imediata.', systemicEffect: 'O conflito aparece tarde.',
        reinforcementHypothesis: 'O retrabalho consome capacidade e aumenta a pressão.', regressionSignal: 'O lote volta a crescer.',
        observations: { decision: ['O lote foi adiado.'], consequence: ['O conflito apareceu na integração.'], contrary: [], missing: ['Confirmar a autoridade.'] },
        incentive: { kind: 'deadline', effectOnDecision: 'A data tornou o lote racional.' },
        boundary: { observes: 'Time', recommends: 'Liderança técnica', decides: 'Portfólio', executes: 'Time' },
        compensatingBehavior: { kind: 'coordination', description: 'Uma pessoa coordena a integração.', masks: 'A ausência de feedback reproduzível.' },
        scope: { observed: ['Squad A'], eligible: ['Squad A', 'Squad B'] },
      }),
    },
  };
  const html = renderOutcome({ kind: 'correct', kindLabel: 'Corrigir o limitador', limiterLabel: 'Integração contínua', reading: '', nextStepTitle: '', nextStepBody: '', finding });
  assert.match(html, /Ciclo sociotécnico em investigação/);
  assert.match(html, /Decisão localmente racional/);
  assert.match(html, /Comportamento compensatório/);
  assert.match(html, /Hipótese de reforço/);
  assert.match(html, /não comprovam causalidade/i);
});

test('direção técnica separa prática, técnica, habilitador e ferramenta opcional', () => {
  const finding = {
    kind: 'correction' as const, pattern: 'causa-ferramental-feedback', detailCapability: 'sdlc-automation',
    title: 'O retorno automatizado não orienta a mudança', cause: '', intervention: '', confidence: .8, priority: .8,
    technicalDirection: {
      library: 'delivery-feedback' as const, practiceTarget: 'Feedback técnico no tempo da decisão',
      techniques: ['Caminho rápido', 'Teste de contrato'], enablingMechanism: 'Evidência acionável antes da próxima decisão.',
      toolFamilies: ['integração e build'], prerequisites: ['Verificação crítica identificada'], doesNotSolve: 'Não remove política de lote.',
      qualitativeCost: 'medium' as const, risk: 'Reduzir cobertura relevante.', smallestExperiment: 'Estabilizar uma verificação.',
      indicator: 'Tempo até retorno.', successCriterion: 'Retorno usado no mesmo dia.',
      foundation: { source: 'Continuous Delivery', principle: 'Feedback rápido', versionOrDate: '2010', limitation: 'Não define o risco do produto.' },
    },
  };
  const html = renderOutcome({ kind: 'correct', kindLabel: 'Corrigir', limiterLabel: 'Feedback', reading: '', nextStepTitle: '', nextStepBody: '', finding });
  assert.match(html, /Opções técnicas condicionadas/);
  assert.ok(html.indexOf('Prática-alvo') < html.indexOf('Técnicas compatíveis'));
  assert.ok(html.indexOf('Técnicas compatíveis') < html.indexOf('Mecanismo habilitador'));
  assert.ok(html.indexOf('Mecanismo habilitador') < html.indexOf('Famílias de ferramenta opcionais'));
  assert.match(html, /Não remove política de lote/);
  assert.match(html, /Continuous Delivery.*2010/s);
  assert.match(html, /Não define o risco do produto/);
});

test('evidência mostra convergência, amplitude e diversidade como medidas diferentes', () => {
  const html = renderOutcome({
    kind: 'correct', kindLabel: 'Corrigir o limitador', limiterLabel: 'Integração contínua', reading: '', nextStepTitle: '', nextStepBody: '',
    finding: {
      kind: 'correction', pattern: 'mudanca-isolada', detailCapability: 'continuous-integration', title: 'Mudanças permanecem isoladas', cause: '', intervention: '', confidence: .9, priority: .9,
      recommendationEvidence: { supportingParticipants: 3, applicablePopulation: 3, contradictingParticipants: 0, patterns: ['mudanca-isolada'], layers: ['practice'], profiles: ['engineering'], strength: { convergence: 'high', populationBreadth: 'low', perspectiveDiversity: 'low', causalCoverage: 'low', executiveStatus: 'local-hypothesis' } },
    },
  });
  assert.match(html, /Convergência.*Alta/s);
  assert.match(html, /Convergência.*quanto as respostas aplicáveis apontam na mesma direção/s);
  assert.match(html, /Amplitude.*Baixa/s);
  assert.match(html, /Amplitude.*quantas pessoas sustentam a leitura/s);
  assert.match(html, /Diversidade de perspectivas.*Baixa/s);
  assert.match(html, /Cobertura causal.*se as entrevistas explicam por que o comportamento acontece/s);
  assert.match(html, /Hipótese local para investigação/);
});

test('evidência contrária é apresentada sem converter o restante da população em concordância', () => {
  const html = renderOutcome({
    kind: 'discriminate', kindLabel: 'Entender a causa antes de agir', limiterLabel: 'Integração contínua', reading: '', nextStepTitle: '', nextStepBody: '',
    finding: {
      kind: 'correction', pattern: 'mudanca-isolada', detailCapability: 'continuous-integration', title: 'Mudanças permanecem isoladas', cause: '', intervention: '', confidence: .7, priority: .8,
      recommendationEvidence: { supportingParticipants: 4, applicablePopulation: 9, contradictingParticipants: 2, patterns: ['mudanca-isolada'], layers: ['practice'], profiles: ['engineering', 'product'] },
    },
  });
  assert.match(html, /2 pessoas relataram uma situação que contradiz especificamente essa leitura/);
  assert.match(html, /3 pessoas não aparecem neste agregado como apoio nem como contradição específica/);
  assert.doesNotMatch(html, /Nenhum relato contraditório suficiente/);
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

test('panorama agrupa padrões relacionados sem declará-los como causa única', () => {
  const findings = ['mudanca-isolada', 'integracao-tardia', 'integracao-por-janela'].map((pattern) => ({ kind: 'correction' as const, pattern, detailCapability: 'continuous-integration', title: pattern, cause: '', intervention: '', confidence: .9, priority: .9 }));
  const html = renderFindingPortfolio(findings);
  assert.match(html, /3 padrões formam 1 frente diagnóstica/);
  assert.match(html, /Integração e feedback tardios \(3\)/);
  assert.match(html, /não declara que uma causa única já foi comprovada/i);
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

test('panorama separa decisões organizacionais, compartilhadas e locais e permite abrir o achado', () => {
  const html = renderFindingPortfolio([
    { kind: 'correction', pattern: 'policy-gate', detailCapability: 'enabling-governance', title: 'Aprovação trata riscos diferentes do mesmo jeito', cause: '', intervention: '', confidence: .9, priority: .9, containment: 'organizational-policy' },
    { kind: 'correction', pattern: 'platform-queue', detailCapability: 'platform-autonomy', title: 'Ambientes chegam por fila', cause: '', intervention: '', confidence: .8, priority: .8, containment: 'shared-service' },
    { kind: 'correction', pattern: 'team-batch', detailCapability: 'work-management', title: 'O time acumula trabalho', cause: '', intervention: '', confidence: .7, priority: .7, containment: 'team' },
  ], undefined, [], '/projects/example/capabilities');
  assert.match(html, /Decisões organizacionais/);
  assert.match(html, /Capacidades compartilhadas/);
  assert.match(html, /Problemas locais/);
  assert.match(html, /href="\/projects\/example\/capabilities\/enabling-governance#finding-policy-gate"/);
});

test('panorama apresenta uma sequência de transformação em vez de uma lista simultânea', () => {
  const html = renderFindingPortfolio([
    { kind: 'correction', pattern: 'servico-sem-owner', detailCapability: 'team-ownership', title: 'Serviço sem responsável', cause: '', intervention: '', confidence: .9, priority: .9, mechanism: 'organization', containment: 'organizational-structure', decisionAuthority: 'cross-team', prescription: { status: 'ready', reason: 'confirmado' } },
    { kind: 'correction', pattern: 'integracao-tardia', detailCapability: 'continuous-integration', title: 'Integração tardia', cause: '', intervention: '', confidence: .8, priority: .8, mechanism: 'process', containment: 'team', decisionAuthority: 'team', prescription: { status: 'ready', reason: 'confirmado' } },
    { kind: 'correction', pattern: 'causa-incerta', detailCapability: 'collaboration', title: 'Coordenação sem causa localizada', cause: '', intervention: '', confidence: .7, priority: .7, mechanism: 'undetermined', containment: 'undetermined', decisionAuthority: 'undetermined', prescription: { status: 'investigate', reason: 'Localize a restrição antes de escolher a solução.' } },
  ]);
  assert.match(html, /Sequência de transformação/);
  assert.match(html, /Agora/);
  assert.match(html, /Depois/);
  assert.match(html, /Antes de ampliar/);
  assert.ok(html.indexOf('Serviço sem responsável') < html.indexOf('Integração tardia'));
  assert.match(html, /Localize a restrição antes de escolher a solução/);
});

test('navegação por público explica a decisão de cada leitura sem duplicar motores', () => {
  const html = renderAudienceNavigation({ executiveDecisions: 2, technologyConstraints: 3, localReports: 2, specialistFindings: 6 });
  assert.match(html, /Visões para decisão/);
  assert.match(html, /Diretoria.*2 decisões organizacionais/s);
  assert.match(html, /Liderança de tecnologia.*3 restrições sistêmicas/s);
  assert.match(html, /Gerência local.*2 recortes/s);
  assert.match(html, /Especialistas e times.*6 diagnósticos explicáveis/s);
  assert.match(html, /mesmos diagnósticos e portfólio/i);
  assert.match(html, /href="#report-executive"/);
  assert.match(html, /href="#report-technology"/);
  assert.match(html, /href="#report-units"/);
  assert.match(html, /href="#report-portfolio"/);
});

test('navegação especialista não aponta para um panorama ausente quando existe um único diagnóstico', () => {
  const html = renderAudienceNavigation({ executiveDecisions: 0, technologyConstraints: 0, localReports: 0, specialistFindings: 1 });
  assert.match(html, /href="#report-diagnosis"[^>]*>.*Especialistas e times/s);
  assert.doesNotMatch(html, /href="#report-portfolio"/);
});

test('briefings de diretoria e tecnologia mostram somente decisões da sua autoridade', () => {
  const findings = [
    { kind: 'correction' as const, pattern: 'policy', detailCapability: 'enabling-governance', title: 'Política acumula mudanças pequenas', cause: '', intervention: '', confidence: .9, priority: .9, mechanism: 'policy' as const, containment: 'organizational-policy' as const, decisionAuthority: 'organizational-governance' as const, impacts: ['delivery-speed' as const], prescription: { status: 'ready' as const, reason: 'confirmado' } },
    { kind: 'correction' as const, pattern: 'pipeline', detailCapability: 'continuous-integration', title: 'Feedback técnico chega tarde', cause: '', intervention: '', confidence: .8, priority: .8, mechanism: 'tooling' as const, containment: 'shared-service' as const, decisionAuthority: 'platform' as const, prescription: { status: 'ready' as const, reason: 'confirmado' } },
  ];
  const reports = AudienceReportProjector.project({ findings, portfolio: TransformationPortfolioPlanner.plan(findings) });
  const html = renderAudienceBriefs(reports, '/capabilities');
  assert.match(html, /Briefing para diretoria/);
  assert.match(html, /Política acumula mudanças pequenas/);
  assert.match(html, /Briefing para liderança de tecnologia/);
  assert.match(html, /Feedback técnico chega tarde/);
  assert.match(html, /Velocidade de entrega/);
});

test('diagnóstico condicionado explica autoridade e motivo da investigação', () => {
  const html = renderOutcome({
    kind: 'discriminate', kindLabel: 'Discriminar a causa', limiterLabel: 'Integração contínua', reading: 'Mudanças permanecem isoladas.', nextStepTitle: 'Investigar', nextStepBody: 'Reconstrua a última mudança.',
    finding: { kind: 'correction', pattern: 'batch', detailCapability: 'continuous-integration', title: 'Mudanças permanecem isoladas', cause: '', intervention: '', confidence: .8, priority: .8, mechanism: 'undetermined', containment: 'undetermined', decisionAuthority: 'undetermined', prescription: { status: 'investigate', reason: 'Ainda falta discriminar o mecanismo.' } },
  }, { confirmedProblemCount: 3 });
  assert.match(html, /Quem pode decidir.*Ainda não determinada/s);
  assert.match(html, /Por que ainda não indicamos uma solução/);
  assert.match(html, /O que parece manter o problema.*Ainda não determinado/s);
  assert.match(html, /Por que investigar primeiro.*Ainda falta discriminar o mecanismo/s);
  assert.doesNotMatch(html, /Decisão solicitada/);
  assert.match(html, /prioridade 1 de 3 problemas confirmados/i);
});

test('leitura executiva apresenta situação e prioridade antes do vocabulário metodológico', () => {
  const html = renderOutcome({
    kind: 'discriminate', kindLabel: 'Entender a causa antes de agir', limiterLabel: 'Integração contínua', reading: 'Mudanças pequenas ficam separadas por vários dias e encontram conflitos tarde.', nextStepTitle: 'Entender a espera', nextStepBody: 'Reconstrua a última mudança que ficou separada.',
    finding: { kind: 'correction', pattern: 'batch', detailCapability: 'continuous-integration', title: 'Mudanças encontram o restante do sistema tarde', cause: '', intervention: '', confidence: .8, priority: .8, mechanism: 'undetermined', containment: 'undetermined', decisionAuthority: 'undetermined', prescription: { status: 'investigate', reason: 'Ainda falta localizar o impedimento.' } },
  }, { confirmedProblemCount: 4 });
  const firstPlane = html.slice(0, html.indexOf('<details'));
  assert.match(firstPlane, /Mudanças pequenas ficam separadas/);
  assert.match(firstPlane, /prioridade 1 de 4 problemas confirmados/i);
  assert.doesNotMatch(firstPlane, /mecanismo|contenção|severidade|posterior/i);
});

test('cartão detalhado publica a âncora canônica do finding', () => {
  const html = renderCapabilityDiagnosis([{ kind: 'correction', pattern: 'policy/gate', detailCapability: 'enabling-governance', title: 'Controle único', cause: '', intervention: '', confidence: .9, priority: .9 }], leaf({ id: 'enabling-governance', label: 'Governança habilitadora', level: 0 }));
  assert.match(html, /id="finding-policy-gate"/);
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
  assert.ok(html.indexOf('Próxima decisão') < html.indexOf('Consistência do comportamento no elo limitante'));
  assert.ok(html.indexOf('Consistência do comportamento no elo limitante') < html.indexOf('Mapa de contraste e cobertura'));
});

test('recorte gerencial separa o que a squad muda, recebe e precisa escalar', () => {
  const findings = [
    { kind: 'correction' as const, pattern: 'local', detailCapability: 'work-management', title: 'A squad acumula mudanças', cause: '', intervention: '', confidence: .9, priority: .9, mechanism: 'process' as const, containment: 'team' as const, decisionAuthority: 'team' as const, prescription: { status: 'ready' as const, reason: 'confirmado' } },
    { kind: 'correction' as const, pattern: 'shared', detailCapability: 'platform-autonomy', title: 'Ambientes chegam por fila', cause: '', intervention: '', confidence: .8, priority: .8, mechanism: 'platform' as const, containment: 'shared-service' as const, decisionAuthority: 'platform' as const, prescription: { status: 'ready' as const, reason: 'confirmado' } },
  ];
  const html = renderScopeReport({
    id: 'alfa', path: 'Empresa/Squad Alfa', classification: { level: 1, label: 'Reativo', limitingCapabilities: ['Fluxo'] },
    capabilityGroups: [leaf({ id: 'work-management', label: 'Fluxo', level: 1 })], findings, perspectiveGaps: [],
  }, '/capabilities');
  assert.match(html, /Leitura da gerência local/);
  assert.match(html, /O que a unidade pode mudar.*A squad acumula mudanças/s);
  assert.match(html, /Restrições que a unidade recebe.*Ambientes chegam por fila/s);
  assert.match(html, /O que precisa ser escalado.*plataforma/s);
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

test('estágio ordinal fica no detalhe de consistência, não no cabeçalho', () => {
  const html = renderClassification({
    level: 1, label: 'Reativo', limitingCapabilities: ['Descoberta e validação'],
  }, {
    kind: 'discriminate', kindLabel: 'Entender a causa antes de agir', limiterLabel: 'Descoberta e validação',
    reading: 'Ainda faltam causas.', nextStepTitle: 'Investigar', nextStepBody: 'Reconstrua um evento.',
  });
  assert.match(html, /<details/);
  assert.match(html, /Consistência do comportamento no elo limitante/);
  assert.match(html, /1 · Reativo/);
  assert.match(html, /Descoberta e validação/);
  assert.doesNotMatch(html, /Resumo executivo/);
});

test('radar publica estágio e cobertura, sem N de 4 no primeiro plano', () => {
  const html = renderCapabilityRadar([leaf({ label: 'Entrega', level: 2.4, coverage: 1 })], '/capabilities');
  assert.match(html, /Mapa de contraste e cobertura/);
  assert.match(html, /Repetível/);
  assert.match(html, /evidência insuficiente, não fragilidade/);
  assert.doesNotMatch(html, /de 4/);
  assert.doesNotMatch(html, /baixa maturidade/);
});

test('limitador organizacional é lido como meta-sistema', () => {
  const html = renderOutcome({
    kind: 'correct', kindLabel: 'Corrigir o limitador', limiterLabel: 'Governança habilitadora', limiterId: 'enabling-governance',
    reading: 'Aprovação cria espera.', nextStepTitle: 'Controle indiferenciado', nextStepBody: 'Teste um caminho proporcional.',
    finding: {
      kind: 'correction', pattern: 'controle-indiferenciado', detailCapability: 'enabling-governance',
      title: 'O mesmo controle trata riscos diferentes', cause: '', intervention: 'Teste um caminho proporcional.',
      confidence: .9, priority: .9,
    },
  });
  assert.match(html, /meta-sistema/i);
  assert.match(html, /não um oitavo eixo técnico/i);
});

test('discriminação distingue evidência insuficiente, contradição e fragilidade dispersa', () => {
  const insufficient = renderOutcome({
    kind: 'insufficient', kindLabel: 'Evidência insuficiente', limiterLabel: 'Nenhuma capacidade',
    reading: 'Ainda não há dado agregado.', nextStepTitle: 'Aguardar', nextStepBody: 'Espere o grupo mínimo.',
  });
  assert.match(insufficient, /O que está acontecendo/);
  assert.match(insufficient, /O que as entrevistas mostraram/);
  assert.match(insufficient, /evidência coletiva insuficiente|variedade temática|grupo mínimo/i);
  assert.doesNotMatch(insufficient, /fragilidade confirmada/i);

  const contradiction = renderOutcome({
    kind: 'discriminate', kindLabel: 'Entender a causa antes de agir', limiterLabel: 'Aprendizado',
    reading: 'Aprendizado está em reativo, mas as evidências deste elo ainda se misturam.',
    nextStepTitle: 'Discriminar', nextStepBody: 'Reconstrua um evento sem abrir várias frentes.',
  });
  assert.match(contradiction, /O que está acontecendo/);
  assert.match(contradiction, /direções opostas|contrad/i);

  const dispersed = renderOutcome({
    kind: 'discriminate', kindLabel: 'Entender a causa antes de agir', limiterLabel: 'Descoberta e validação',
    reading: 'Descoberta e validação está em reativo e as fragilidades observadas neste elo estão dispersas; o relatório não inventa uma causa.',
    nextStepTitle: 'Investigar', nextStepBody: 'Reconstrua um evento recente de descoberta.',
  });
  assert.match(dispersed, /dispersas/);
  assert.match(dispersed, /não inventa uma causa/);
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
  assert.match(html, /Consistência do comportamento no elo limitante/);
  assert.doesNotMatch(html, /e mais/);
  assert.doesNotMatch(html, /Hipóteses permanecem em execução/);
  assert.match(renderOutcome(outcome), /Próxima decisão/);
  assert.match(renderOutcome(outcome), /Corrigir o limitador/);
  assert.match(renderOutcome(outcome), /Hipóteses permanecem em execução/);
});

test('divergência suspende a classificação ordinal no primeiro plano', () => {
  const html = renderClassification(
    { level: 0, label: 'Opaco', limitingCapabilities: ['Aprendizado'] },
    { kind: 'discriminate', kindLabel: 'Entender a causa antes de agir', limiterLabel: 'Perspectivas divergem sobre aprendizado', reading: 'As lentes divergem.', nextStepTitle: 'Triangular', nextStepBody: 'Reconstruir evento.' },
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
