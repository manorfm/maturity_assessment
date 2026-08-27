export const GRAPH_VERSION = 'evidence-anamnesis-v12';
export const CANNOT_OBSERVE_ID = 'cannot-observe';
export const NOT_APPLICABLE_ID = 'not-applicable';

export type Profile = 'management' | 'product' | 'quality' | 'engineering' | 'platform';
export type EvidenceLayer = 'knowledge' | 'practice' | 'consistency' | 'system' | 'outcome';
export type ConstraintKind = 'none' | 'knowledge' | 'process' | 'tooling' | 'access' | 'architecture' | 'organization' | 'governance' | 'culture';
export type ObservationKind = 'practice' | 'visibility' | 'not_applicable';
export type Signal = { capability: string; pattern: string; weight: number; details: string[]; layer: EvidenceLayer; constraint: ConstraintKind };
export type Option = { id: string; label: string; signals: Signal[]; observation?: ObservationKind };

export const cannotObserve: Option = {
  id: CANNOT_OBSERVE_ID,
  observation: 'visibility',
  label: 'Não observo esse evento no meu trabalho cotidiano; outras pessoas do fluxo veriam melhor.',
  signals: [],
};

export const notApplicableEvent: Option = {
  id: NOT_APPLICABLE_ID,
  observation: 'not_applicable',
  label: 'Esse tipo de evento não ocorre neste ambiente.',
  signals: [],
};

export function observationOf(option: Option): ObservationKind {
  return option.observation ?? 'practice';
}

function attachObservationalExits(node: AssessmentNode): AssessmentNode {
  if (node.id === 'respondent-context') return node;
  if (node.options.some((option) => option.id === CANNOT_OBSERVE_ID)) return node;
  return { ...node, options: [...node.options, cannotObserve] };
}
export type AssessmentNode = {
  id: string;
  type?: 'context' | 'scenario' | 'probe';
  title: string;
  scenario: string;
  prompt: string;
  options: Option[];
  next?: string;
};

export type AssessmentEdge = { from: string; to: string; optionId?: string; profile?: Profile };
export type NodeVariant = { nodeId: string; profile: Profile; title?: string; scenario: string; prompt?: string };

export const profiles: Record<Profile, string> = {
  management: 'Gestão', product: 'Produto', quality: 'Qualidade / QA',
  engineering: 'Engenharia', platform: 'Plataforma / SRE / Infraestrutura',
};

const authoredNodes: AssessmentNode[] = [
  {
    id: 'respondent-context',
    title: 'Seu ponto de observação',
    scenario: 'Pessoas diferentes vivenciam partes distintas do mesmo sistema de entrega. Escolha a perspectiva que mais se aproxima de onde você atua hoje. Isso apenas adapta a entrevista e não produz pontuação.',
    prompt: 'De qual perspectiva você acompanha a maior parte do trabalho no dia a dia?',
    options: Object.entries(profiles).map(([profile, label]) => ({ id: profile, label, signals: [] })),
    next: 'urgent-change',
  },
  {
    id: 'urgent-change',
    title: 'Uma necessidade urgente',
    scenario: 'Uma necessidade importante surge no meio do ciclo e precisa atravessar produto, engenharia e qualidade. O prazo original continua sendo cobrado.',
    prompt: 'Qual descrição mais se aproxima do que normalmente acontece?',
    options: [
      { id: 'replan-together', label: 'As pessoas afetadas reavaliam risco, capacidade e escopo juntas; algo explícito deixa de ser feito.', signals: [{ capability: 'fluxo', pattern: 'feedback-integrado', weight: 2 , details: ['work-management'], layer: 'practice', constraint: 'none' }] },
      { id: 'add-to-sprint', label: 'O trabalho entra como prioridade adicional e cada etapa tenta absorvê-lo sem alterar o compromisso anterior.', signals: [{ capability: 'fluxo', pattern: 'sobrecarga-silenciosa', weight: -2 , details: ['portfolio-management', 'work-management', 'team-ownership'], layer: 'practice', constraint: 'none' }] },
      { id: 'manager-coordinates', label: 'Uma liderança reorganiza a sequência e negocia separadamente com cada área para viabilizar a entrega.', signals: [{ capability: 'organizacao', pattern: 'coordenacao-centralizada', weight: -1 , details: ['work-management', 'leadership-management', 'collaboration', 'organizational-learning'], layer: 'practice', constraint: 'none' }] },
      { id: 'depends', label: 'Varia muito; não há um modo previsível de decidir e normalmente descobrimos o impacto durante a execução.', signals: [{ capability: 'governanca', pattern: 'decisao-opaca', weight: -2 , details: ['architecture-decisions'], layer: 'practice', constraint: 'none' }] },
    ],
    next: 'shared-change',
  },
  {
    id: 'shared-change',
    title: 'Uma mudança atravessa times',
    scenario: 'Duas partes da mesma entrega, conduzidas por grupos diferentes, alteram comportamentos que precisam funcionar juntos.',
    prompt: 'Em que momento as mudanças normalmente se encontram de verdade?',
    options: [
      { id: 'continuous', label: 'Ao longo do desenvolvimento, com uma versão reproduzível e verificações frequentes entre as partes.', signals: [{ capability: 'engenharia', pattern: 'integracao-frequente', weight: 2 , details: ['continuous-integration', 'organizational-learning'], layer: 'practice', constraint: 'none' }] },
      { id: 'before-release', label: 'Pouco antes da liberação, quando todas as partes são reunidas em um ambiente comum.', signals: [{ capability: 'engenharia', pattern: 'integracao-tardia', weight: -2 , details: ['continuous-integration', 'organizational-learning'], layer: 'practice', constraint: 'none' }] },
      { id: 'coordination', label: 'Quando responsáveis combinam manualmente versões, ordem e janelas para testar em conjunto.', signals: [{ capability: 'arquitetura', pattern: 'dependencia-coordenada', weight: -2 , details: ['evolvability'], layer: 'practice', constraint: 'none' }] },
      { id: 'production', label: 'Frequentemente apenas depois da liberação ou quando alguém relata um comportamento inesperado.', signals: [{ capability: 'confiabilidade', pattern: 'feedback-em-producao', weight: -3 , details: ['reliability-practice'], layer: 'practice', constraint: 'none' }] },
    ],
    next: 'ready-to-release',
  },
  {
    id: 'ready-to-release',
    title: 'Pronto para entregar',
    scenario: 'A alteração foi considerada pronta pelo desenvolvimento. Agora ela precisa chegar com segurança às pessoas usuárias.',
    prompt: 'Onde costuma estar a maior parte do tempo até a mudança operar?',
    options: [
      { id: 'small-automated', label: 'O fluxo é curto e repetível; a maior espera é uma decisão consciente de produto ou risco.', signals: [{ capability: 'entrega', pattern: 'entrega-repetivel', weight: 2 , details: ['release-feedback'], layer: 'practice', constraint: 'none' }] },
      { id: 'manual-package', label: 'Em preparar, conferir ou transportar versões e configurações entre ambientes.', signals: [{ capability: 'entrega', pattern: 'empacotamento-manual', weight: -2 , details: ['release-feedback'], layer: 'practice', constraint: 'none' }] },
      { id: 'test-queue', label: 'Na fila de regressão, obtenção de dados de teste ou disponibilidade de ambiente e pessoas.', signals: [{ capability: 'qualidade', pattern: 'qualidade-como-fase', weight: -2 , details: ['quality-strategy'], layer: 'practice', constraint: 'none' }] },
      { id: 'approval', label: 'Em aprovações e permissões cujo tempo varia e cuja decisão raramente muda com novas evidências.', signals: [{ capability: 'governanca', pattern: 'controle-sem-feedback', weight: -2 , details: ['enabling-governance'], layer: 'practice', constraint: 'none' }] },
    ],
  },
  {
    id: 'deployment-probe', type: 'probe', title: 'Como a versão é preparada?',
    scenario: 'Pensando na última entrega que exigiu preparação manual, considere quem executou os passos e como uma segunda pessoa conseguiria repeti-los.',
    prompt: 'Qual descrição é mais próxima da realidade?',
    options: [
      { id: 'shared-script', label: 'Existe uma automação mantida pelo time, usada de forma consistente e verificada a cada mudança.', signals: [{ capability: 'entrega', pattern: 'automacao-local-consistente', weight: 1 , details: ['sdlc-automation', 'organizational-learning'], layer: 'practice', constraint: 'none' }] },
      { id: 'local-script', label: 'Uma pessoa ou grupo criou scripts que ajudam, mas adoção, suporte e comportamento variam.', signals: [{ capability: 'plataforma', pattern: 'solucao-local-nao-difundida', weight: -1 , details: ['platform-autonomy'], layer: 'practice', constraint: 'none' }] },
      { id: 'runbook', label: 'Há instruções; a execução depende de atenção, acesso e conhecimento de quem está disponível.', signals: [{ capability: 'entrega', pattern: 'operacao-manual-fragil', weight: -2 , details: ['organizational-learning'], layer: 'practice', constraint: 'none' }] },
      { id: 'memory', label: 'Os passos são conhecidos principalmente por experiência e são ajustados durante a execução.', signals: [{ capability: 'entrega', pattern: 'dependencia-de-heroi', weight: -2 , details: ['technical-capability'], layer: 'knowledge', constraint: 'none' }] },
    ], next: 'integration-cadence',
  },
  {
    id: 'quality-probe', type: 'probe', title: 'De onde vem a espera de qualidade?',
    scenario: 'Uma mudança aguarda validação enquanto novas alterações continuam chegando. Considere dados, ambiente, critérios e divisão de responsabilidade.',
    prompt: 'Qual fator costuma tornar essa espera mais difícil de reduzir?',
    options: [
      { id: 'risk-together', label: 'O risco é discutido cedo e as verificações evoluem junto; a espera ocorre apenas em casos excepcionais.', signals: [{ capability: 'qualidade', pattern: 'qualidade-compartilhada', weight: 2 , details: ['quality-strategy'], layer: 'practice', constraint: 'none' }] },
      { id: 'data-environment', label: 'Preparar massa e ambiente confiáveis consome grande parte do tempo e exige intervenção.', signals: [{ capability: 'qualidade', pattern: 'dados-de-teste-fragil', weight: -2 , details: ['sustainable-design', 'quality-strategy', 'integration-data'], layer: 'practice', constraint: 'none' }] },
      { id: 'regression', label: 'A regressão cresceu e precisa ser repetida manualmente porque mudanças novas podem afetar áreas antigas.', signals: [{ capability: 'qualidade', pattern: 'regressao-crescente', weight: -2 , details: ['quality-strategy'], layer: 'practice', constraint: 'none' }] },
      { id: 'late-context', label: 'Critérios, riscos ou contexto chegam quando a implementação já está pronta.', signals: [{ capability: 'fluxo', pattern: 'qualidade-tardia', weight: -2 , details: ['planning-refinement', 'quality-strategy'], layer: 'practice', constraint: 'none' }] },
    ], next: 'integration-cadence',
  },
  {
    id: 'governance-probe', type: 'probe', title: 'O que a aprovação protege?',
    scenario: 'Uma entrega de baixo impacto aguarda a mesma aprovação aplicada a mudanças críticas. Uma exceção exigiria outra cadeia de decisão.',
    prompt: 'Como o controle costuma reagir a evidências de risco diferentes?',
    options: [
      { id: 'proportional', label: 'Critérios explícitos mudam o caminho; casos seguros fluem com guardrails e exceções deixam trilha.', signals: [{ capability: 'governanca', pattern: 'governanca-proporcional', weight: 2 , details: ['enabling-governance'], layer: 'practice', constraint: 'none' }] },
      { id: 'same-flow', label: 'O caminho é praticamente igual para todos; isso simplifica a política, embora gere espera.', signals: [{ capability: 'governanca', pattern: 'controle-indiferenciado', weight: -2 , details: ['enabling-governance'], layer: 'practice', constraint: 'none' }] },
      { id: 'relationship', label: 'A velocidade depende de conhecer responsáveis, explicar urgência e conseguir prioridade.', signals: [{ capability: 'governanca', pattern: 'governanca-relacional', weight: -2 , details: ['enabling-governance'], layer: 'practice', constraint: 'none' }] },
      { id: 'unclear', label: 'É difícil explicar qual risco cada aprovação reduz ou quais evidências mudariam a decisão.', signals: [{ capability: 'governanca', pattern: 'controle-sem-proposito', weight: -2 , details: ['enabling-governance'], layer: 'practice', constraint: 'none' }] },
    ], next: 'integration-cadence',
  },
  {
    id: 'integration-cadence', type: 'probe', title: 'Quanto tempo a mudança fica isolada?',
    scenario: 'Pense na última alteração comum, sem emergência. Considere desde o primeiro código utilizável até ele encontrar a versão compartilhada e receber verificações do restante do produto.',
    prompt: 'Qual descrição representa melhor essa integração no dia a dia?',
    options: [
      { id: 'integrated-daily', label: 'Mudanças pequenas encontram a versão compartilhada no mesmo dia; verificações rápidas protegem o fluxo e falhas são corrigidas antes de acumular.', signals: [{ capability: 'engenharia', pattern: 'integracao-continua-validada', weight: 2 , details: ['continuous-integration', 'organizational-learning'], layer: 'practice', constraint: 'none' }] },
      { id: 'integrated-few-days', label: 'A integração ocorre em poucos dias e geralmente exige estabilização curta antes de outras mudanças seguirem.', signals: [{ capability: 'engenharia', pattern: 'integracao-frequente-fragil', weight: 1 , details: ['continuous-integration', 'organizational-learning'], layer: 'practice', constraint: 'none' }] },
      { id: 'isolated-days', label: 'Mudanças ficam isoladas por vários dias ou semanas e encontram conflitos, regressões ou decisões divergentes ao final.', signals: [{ capability: 'engenharia', pattern: 'mudanca-isolada', weight: -2 , details: ['continuous-integration'], layer: 'practice', constraint: 'none' }] },
      { id: 'coordinated-window', label: 'A integração depende de uma janela, versão ou combinação coordenada entre responsáveis e ambientes.', signals: [{ capability: 'entrega', pattern: 'integracao-por-janela', weight: -2 , details: ['continuous-integration', 'organizational-learning'], layer: 'practice', constraint: 'none' }] },
    ],
  },
  {
    id: 'delivery-cause', type: 'probe', title: 'O que mantém a mudança isolada?',
    scenario: 'A integração tardia reaparece mesmo quando as pessoas tentam antecipá-la. Considere o impedimento que permanece após uma tentativa concreta de reduzir o intervalo.',
    prompt: 'Qual causa provável explica melhor a recorrência?',
    options: [
      { id: 'tooling-gap', label: 'O retorno automatizado é lento, instável ou incompleto; integrar cedo interrompe o trabalho sem produzir confiança.', signals: [{ capability: 'engenharia', pattern: 'causa-ferramental-feedback', weight: -1 , details: ['sdlc-automation'], layer: 'system', constraint: 'none' }] },
      { id: 'process-policy', label: 'Política, revisão ou processo exige acumular escopo ou aguardar uma etapa antes de compartilhar a mudança.', signals: [{ capability: 'governanca', pattern: 'causa-processo-lote', weight: -1 , details: ['enabling-governance'], layer: 'system', constraint: 'none' }] },
      { id: 'team-boundary', label: 'Responsabilidades e prioridades atravessam times; ninguém consegue concluir a integração sem coordenar agendas.', signals: [{ capability: 'organizacao', pattern: 'causa-fronteira-times', weight: -1 , details: ['team-ownership'], layer: 'system', constraint: 'none' }] },
      { id: 'architecture-coupling', label: 'O sistema exige alterar e validar muitas partes juntas; uma mudança pequena não permanece pequena.', signals: [{ capability: 'arquitetura', pattern: 'causa-acoplamento-entrega', weight: -1 , details: ['release-feedback', 'evolvability'], layer: 'system', constraint: 'none' }] },
    ], next: 'release-control',
  },
  {
    id: 'release-control', type: 'probe', title: 'Implantar e liberar são a mesma decisão?',
    scenario: 'Uma alteração passou pelas verificações e pode chegar ao ambiente real, mas produto ainda quer controlar quando e para quem o comportamento ficará disponível.',
    prompt: 'Como essa separação costuma funcionar de verdade?',
    options: [
      { id: 'decoupled-observed', label: 'A versão pode chegar ao ambiente sem expor o comportamento; produto decide depois para quem libera.', signals: [{ capability: 'entrega', pattern: 'deploy-release-desacoplados', weight: 2 , details: ['release-feedback'], layer: 'practice', constraint: 'none' }] },
      { id: 'toggle-permanent', label: 'É possível ativar separadamente, mas controles antigos, combinações e responsáveis tendem a se acumular.', signals: [{ capability: 'entrega', pattern: 'controles-de-release-acumulados', weight: 0 , details: ['release-feedback', 'enabling-governance'], layer: 'practice', constraint: 'none' }] },
      { id: 'deploy-is-release', label: 'Colocar a versão no ambiente já disponibiliza o comportamento; risco é controlado principalmente antes desse momento.', signals: [{ capability: 'entrega', pattern: 'deploy-igual-release', weight: -1 , details: ['release-feedback'], layer: 'practice', constraint: 'none' }] },
      { id: 'release-train', label: 'Mudanças prontas aguardam uma versão ou janela conjunta para serem disponibilizadas.', signals: [{ capability: 'entrega', pattern: 'release-em-lote', weight: -2 , details: ['release-feedback'], layer: 'practice', constraint: 'none' }] },
    ], next: 'release-validation',
  },
  {
    id: 'release-validation', type: 'probe', title: 'Quando a pressão aumenta',
    scenario: 'Uma correção importante precisa sair no mesmo dia. O fluxo habitual parece maduro, mas esperar todas as verificações ameaça o prazo.',
    prompt: 'O que normalmente acontece nessa situação recente e concreta?',
    options: [
      { id: 'safe-fast-path', label: 'O mesmo caminho automatizado suporta uma mudança pequena, exposição controlada, sinais de impacto e reversão rápida.', signals: [{ capability: 'entrega', pattern: 'fluxo-seguro-sob-pressao', weight: 2 , details: ['release-feedback'], layer: 'practice', constraint: 'none' }] },
      { id: 'manual-fast-path', label: 'Existe um caminho de exceção com ações manuais e aprovação explícita; depois a equipe reconcilia e revisa o ocorrido.', signals: [{ capability: 'governanca', pattern: 'excecao-controlada', weight: 0 , details: ['enabling-governance'], layer: 'practice', constraint: 'none' }] },
      { id: 'bypass-under-pressure', label: 'Verificações ou etapas são contornadas por pessoas experientes para ganhar tempo e corrigidas posteriormente.', signals: [{ capability: 'entrega', pattern: 'maturidade-nao-resiste-urgencia', weight: -2 , details: ['release-feedback'], layer: 'practice', constraint: 'none' }] },
      { id: 'wait-specialists', label: 'A entrega aguarda especialistas, acessos ou uma janela segura, mesmo com impacto crescente.', signals: [{ capability: 'plataforma', pattern: 'dependencia-operacional-sob-urgencia', weight: -2 , details: ['platform-autonomy'], layer: 'practice', constraint: 'none' }] },
    ], next: 'degradation',
  },
  {
    id: 'degradation',
    title: 'Degradação parcial',
    scenario: 'Depois de uma entrega, uma parte das pessoas percebe lentidão. Os indicadores oscilam e não há falha total.',
    prompt: 'O que mais orienta a primeira decisão?',
    options: [
      { id: 'impact-change', label: 'Impacto nas pessoas, mudança recente e incerteza; mitigamos de modo reversível enquanto investigamos.', signals: [{ capability: 'observabilidade', pattern: 'sinal-orientado-impacto', weight: 2 , details: ['observability-practice'], layer: 'outcome', constraint: 'none' }] },
      { id: 'threshold', label: 'Se algum indicador ultrapassou um limite fixo; abaixo dele, normalmente aguardamos mais evidências.', signals: [{ capability: 'observabilidade', pattern: 'limiar-sem-contexto', weight: -1 , details: ['observability-practice'], layer: 'practice', constraint: 'none' }] },
      { id: 'specialist', label: 'A experiência de quem conhece melhor o sistema; essa pessoa decide quais dados procurar.', signals: [{ capability: 'confiabilidade', pattern: 'dependencia-de-heroi', weight: -2 , details: ['technical-capability'], layer: 'knowledge', constraint: 'none' }] },
      { id: 'customer-volume', label: 'O volume de reclamações; sem ele é difícil saber se a oscilação merece interromper a entrega.', signals: [{ capability: 'observabilidade', pattern: 'deteccao-tardia', weight: -2 , details: ['observability-practice'], layer: 'practice', constraint: 'none' }] },
    ],
    next: 'incident-intake',
  },
  {
    id: 'incident-intake', title: 'O incidente se torna visível',
    scenario: 'Um comportamento crítico afeta parte das pessoas durante o horário de maior uso. Pense no último evento real que exigiu interromper trabalho planejado.',
    prompt: 'Como o grupo responsável normalmente percebe e assume esse evento?',
    options: [
      { id: 'impact-routed', label: 'Um sinal ligado ao impacto aciona responsáveis definidos, reúne contexto inicial e confirma rapidamente quem conduz comunicação e resposta.', signals: [{ capability: 'confiabilidade', pattern: 'incidente-orientado-impacto', weight: 2 , details: ['incident-management'], layer: 'outcome', constraint: 'none' }] },
      { id: 'central-screening', label: 'Uma central ou sustentação recebe, registra e tenta resolver antes de encaminhar ao time que mantém o produto.', signals: [{ capability: 'organizacao', pattern: 'incidente-por-handoff', weight: -1 , details: ['incident-management', 'collaboration'], layer: 'practice', constraint: 'none' }] },
      { id: 'customer-report', label: 'Atendimento ou negócio relata casos até que alguém reconheça abrangência suficiente para mobilizar o time.', signals: [{ capability: 'observabilidade', pattern: 'incidente-detectado-por-cliente', weight: -2 , details: ['incident-management'], layer: 'practice', constraint: 'none' }] },
      { id: 'author-contacted', label: 'Procuram primeiro quem fez a mudança ou quem conhece melhor o componente afetado.', signals: [{ capability: 'organizacao', pattern: 'incidente-depende-do-autor', weight: -2 , details: ['incident-management'], layer: 'practice', constraint: 'none' }] },
    ], next: 'incident-triage',
  },
  {
    id: 'incident-triage', type: 'probe', title: 'Severidade e roteamento',
    scenario: 'O impacto ainda está evoluindo e diferentes áreas precisam decidir prioridade, comunicação e quem será mobilizado.',
    prompt: 'O que normalmente determina o caminho do incidente?',
    options: [
      { id: 'risk-classified', label: 'Critérios de impacto, abrangência e urgência são conhecidos; a classificação muda resposta e comunicação e pode ser revisada com evidências.', signals: [{ capability: 'governanca', pattern: 'severidade-operacional', weight: 2 , details: ['incident-management'], layer: 'practice', constraint: 'none' }] },
      { id: 'fixed-labels', label: 'Existem categorias e procedimentos, mas a classificação depende bastante da interpretação de quem recebe.', signals: [{ capability: 'governanca', pattern: 'severidade-inconsistente', weight: -1 , details: ['incident-management'], layer: 'practice', constraint: 'none' }] },
      { id: 'relationship-escalation', label: 'A prioridade cresce quando alguém com influência encontra e aciona as pessoas certas.', signals: [{ capability: 'organizacao', pattern: 'incidente-por-escalada-relacional', weight: -2 , details: ['incident-management', 'collaboration'], layer: 'practice', constraint: 'none' }] },
      { id: 'same-queue', label: 'O evento entra na fila comum e o time decide urgência quando consegue analisar o caso.', signals: [{ capability: 'fluxo', pattern: 'incidente-na-fila-de-trabalho', weight: -2 , details: ['work-management', 'incident-management'], layer: 'practice', constraint: 'none' }] },
    ],
  },
  {
    id: 'incident-routing-cause', type: 'probe', title: 'Por que o roteamento depende de pessoas?',
    scenario: 'Casos semelhantes percorrem caminhos diferentes e consomem tempo até encontrar quem consegue agir.',
    prompt: 'Qual condição mais sustenta essa variação?',
    options: [
      { id: 'unclear-ownership', label: 'Serviços e jornadas não possuem responsabilidade operacional clara ou atualizada.', signals: [{ capability: 'organizacao', pattern: 'causa-ownership-operacional', weight: -1 , details: ['team-ownership'], layer: 'system', constraint: 'none' }] },
      { id: 'impact-unknown', label: 'Não há informação suficiente para relacionar sintomas técnicos, clientes afetados e criticidade.', signals: [{ capability: 'observabilidade', pattern: 'causa-impacto-invisivel', weight: -1 , details: ['observability-practice'], layer: 'system', constraint: 'none' }] },
      { id: 'support-boundary', label: 'A estrutura separa sustentação e desenvolvimento, mas transferência de contexto e autoridade é lenta.', signals: [{ capability: 'organizacao', pattern: 'causa-fronteira-sustentacao', weight: -1 , details: ['organizational-learning'], layer: 'system', constraint: 'none' }] },
      { id: 'classification-policy', label: 'A política existe, porém categorias e respostas não refletem o risco real dos produtos.', signals: [{ capability: 'governanca', pattern: 'causa-politica-incidente', weight: -1 , details: ['incident-management', 'enabling-governance'], layer: 'system', constraint: 'none' }] },
    ], next: 'incident-diagnosis',
  },
  {
    id: 'incident-diagnosis', type: 'probe', title: 'Do impacto à hipótese',
    scenario: 'O time assumiu o incidente. Há sinais em mais de um componente e é necessário localizar a transação afetada sem ampliar exposição de dados.',
    prompt: 'Como a investigação costuma avançar nos primeiros minutos?',
    options: [
      { id: 'correlated-telemetry', label: 'A investigação começa por um identificador técnico da jornada e pela mudança recente, sem buscar dado pessoal.', signals: [{ capability: 'observabilidade', pattern: 'diagnostico-correlacionado', weight: 2 , details: ['incident-management'], layer: 'practice', constraint: 'none' }] },
      { id: 'separate-searches', label: 'Cada responsável consulta sua parte e combina horários e sintomas em uma conversa até formar a sequência provável.', signals: [{ capability: 'observabilidade', pattern: 'telemetria-fragmentada', weight: -1 , details: ['observability-practice'], layer: 'practice', constraint: 'none' }] },
      { id: 'direct-runtime-access', label: 'Pessoas acessam diretamente processos, máquinas ou componentes em execução para coletar arquivos, comandos e estado.', signals: [{ capability: 'plataforma', pattern: 'diagnostico-por-acesso-direto', weight: -2 , details: ['incident-management', 'platform-autonomy'], layer: 'practice', constraint: 'none' }] },
      { id: 'personal-data-search', label: 'A busca começa por um identificador pessoal ou dado do cliente porque é a forma mais rápida de encontrar o caso entre sistemas.', signals: [{ capability: 'plataforma', pattern: 'diagnostico-por-dado-pessoal', weight: -3 , details: ['software-security', 'incident-management'], layer: 'practice', constraint: 'none' }] },
    ],
  },
  {
    id: 'diagnostic-cause', type: 'probe', title: 'O que impede diagnóstico seguro?',
    scenario: 'O acesso direto ou a combinação manual reaparece em incidentes diferentes, apesar do risco e do tempo consumido.',
    prompt: 'Qual causa provável melhor explica essa dependência?',
    options: [
      { id: 'telemetry-gap', label: 'Sinais necessários não são coletados, indexados ou correlacionados de ponta a ponta.', signals: [{ capability: 'observabilidade', pattern: 'causa-lacuna-telemetria', weight: -1 , details: ['observability-practice'], layer: 'system', constraint: 'none' }] },
      { id: 'tool-access-gap', label: 'A informação existe, mas ferramentas homologadas, licenças, acesso ou experiência não permitem usá-la no tempo do incidente.', signals: [{ capability: 'plataforma', pattern: 'causa-ferramenta-observabilidade', weight: -1 , details: ['observability-practice'], layer: 'system', constraint: 'none' }] },
      { id: 'context-propagation-gap', label: 'Componentes não preservam um identificador técnico comum ou contratos de instrumentação.', signals: [{ capability: 'arquitetura', pattern: 'causa-correlacao-arquitetural', weight: -1 , details: ['integration-data', 'organizational-learning'], layer: 'system', constraint: 'none' }] },
      { id: 'privacy-design-gap', label: 'O desenho não oferece busca operacional minimizada e empurra a investigação para dados pessoais.', signals: [{ capability: 'plataforma', pattern: 'causa-privacidade-operacional', weight: -2 , details: ['software-security', 'cloud-security'], layer: 'system', constraint: 'none' }] },
    ], next: 'incident-remediation',
  },
  {
    id: 'incident-remediation', type: 'probe', title: 'A correção durante o incidente',
    scenario: 'A hipótese aponta para código, configuração, dado ou recurso de infraestrutura. Mitigar rápido importa, mas o estado precisa continuar reproduzível depois.',
    prompt: 'Como a mudança corretiva normalmente chega ao ambiente afetado?',
    options: [
      { id: 'reproducible-change', label: 'A menor correção percorre um caminho rápido e verificável; código, configuração, schema ou infraestrutura mantêm uma fonte reproduzível e observada após aplicação.', signals: [{ capability: 'confiabilidade', pattern: 'correcao-reproduzivel', weight: 2 , details: ['incident-management', 'reproducible-infrastructure'], layer: 'practice', constraint: 'none' }] },
      { id: 'controlled-emergency', label: 'Uma alteração emergencial é feita com dupla verificação e trilha; logo depois é reconciliada na fonte e validada contra divergência.', signals: [{ capability: 'governanca', pattern: 'mudanca-emergencial-reconciliada', weight: 1 , details: ['enabling-governance'], layer: 'practice', constraint: 'none' }] },
      { id: 'live-console-change', label: 'Uma pessoa experiente altera configuração ou recurso diretamente e depois documenta ou tenta reproduzir a correção.', signals: [{ capability: 'plataforma', pattern: 'correcao-direta-na-producao', weight: -2 , details: ['incident-management'], layer: 'practice', constraint: 'none' }] },
      { id: 'live-data-change', label: 'Dados ou estruturas são ajustados diretamente para recuperar o serviço; validação e reconciliação dependem do contexto de quem executa.', signals: [{ capability: 'engenharia', pattern: 'correcao-manual-de-dados', weight: -2 , details: ['sustainable-design', 'integration-data', 'incident-management'], layer: 'practice', constraint: 'none' }] },
    ], next: 'recurrence',
  },
  {
    id: 'recurrence',
    title: 'O problema retorna',
    scenario: 'Um problema parecido ocorre novamente meses depois. A ocorrência anterior havia gerado ações e discussões.',
    prompt: 'Qual resultado é mais comum após a primeira ocorrência?',
    options: [
      { id: 'system-change', label: 'Mudamos o sistema de trabalho ou produto, definimos um sinal de sucesso e depois verificamos o efeito.', signals: [{ capability: 'aprendizado', pattern: 'aprendizado-fechado', weight: 2 , details: ['organizational-learning'], layer: 'outcome', constraint: 'none' }] },
      { id: 'action-list', label: 'Criamos uma lista de ações; algumas entram no planejamento e outras perdem prioridade com o tempo.', signals: [{ capability: 'aprendizado', pattern: 'acao-sem-fechamento', weight: -1 , details: ['organizational-learning'], layer: 'practice', constraint: 'none' }] },
      { id: 'documentation', label: 'Atualizamos documentação ou orientação para que as pessoas saibam reagir mais rápido na próxima vez.', signals: [{ capability: 'confiabilidade', pattern: 'mitigacao-sem-prevencao', weight: -1 , details: ['reliability-practice', 'organizational-learning'], layer: 'practice', constraint: 'none' }] },
      { id: 'local-fix', label: 'Uma pessoa ou time cria uma automação local que ajuda naquele contexto, mas não se espalha facilmente.', signals: [{ capability: 'plataforma', pattern: 'solucao-local-nao-difundida', weight: -1 , details: ['platform-autonomy'], layer: 'practice', constraint: 'none' }] },
    ],
    next: 'recent-need',
  },
  {
    id: 'recent-need', title: 'Da necessidade ao primeiro feedback',
    scenario: 'Pense em uma necessidade recente que parecia importante quando chegou. Antes de uma solução completa ficar pronta, havia incertezas sobre valor e impacto técnico.',
    prompt: 'Como essa incerteza normalmente diminui no trabalho real?',
    options: [
      { id: 'small-evidence', label: 'Produto, engenharia e outras especialidades testam a menor hipótese útil cedo e mudam direção com a evidência.', signals: [{ capability: 'fluxo', pattern: 'descoberta-integrada', weight: 2 , details: ['discovery-validation'], layer: 'practice', constraint: 'none' }] },
      { id: 'defined-then-built', label: 'A necessidade é detalhada e aprovada antes de chegar às especialidades que construirão e operarão a solução.', signals: [{ capability: 'fluxo', pattern: 'cascata-fracionada', weight: -2 , details: ['discovery-validation'], layer: 'practice', constraint: 'none' }] },
      { id: 'demo-feedback', label: 'O principal feedback conjunto ocorre em demonstrações, quando uma parte relevante da solução já foi construída.', signals: [{ capability: 'aprendizado', pattern: 'feedback-tardio', weight: -1 , details: ['discovery-validation'], layer: 'practice', constraint: 'none' }] },
      { id: 'deadline-validates', label: 'O prazo define o que será feito; valor e impacto são avaliados principalmente depois da entrega.', signals: [{ capability: 'governanca', pattern: 'prazo-sem-aprendizado', weight: -2 , details: ['product-direction', 'organizational-learning'], layer: 'outcome', constraint: 'none' }] },
    ], next: 'iteration-purpose',
  },
  {
    id: 'iteration-purpose', title: 'O propósito do trabalho corrente',
    scenario: 'No início do período atual, há mais trabalho possível do que capacidade. Algumas atividades entregam partes diferentes de uma mesma mudança e outras tratam manutenção.',
    prompt: 'Como o grupo normalmente decide o que significa ter avançado ao final desse período?',
    options: [
      { id: 'outcome-goal', label: 'Existe um resultado ou hipótese compartilhada; itens são ajustados durante o período para preservar o objetivo e obter feedback utilizável.', signals: [{ capability: 'fluxo', pattern: 'trabalho-orientado-resultado', weight: 2 , details: ['product-direction'], layer: 'outcome', constraint: 'none' }] },
      { id: 'deliver-committed-items', label: 'O principal compromisso é concluir os itens aceitos; mudanças ameaçam previsibilidade e são negociadas separadamente.', signals: [{ capability: 'fluxo', pattern: 'iteracao-orientada-a-escopo', weight: -1 , details: ['planning-refinement', 'organizational-learning'], layer: 'practice', constraint: 'none' }] },
      { id: 'fill-capacity', label: 'As pessoas recebem trabalho suficiente para ocupar sua capacidade e o progresso é acompanhado pela movimentação das atividades.', signals: [{ capability: 'organizacao', pattern: 'ocupacao-como-progresso', weight: -2 , details: ['leadership-management', 'organizational-learning'], layer: 'practice', constraint: 'none' }] },
      { id: 'urgent-priority', label: 'Prioridades mudam conforme urgências e solicitações; o objetivo é absorver o mais importante sem uma meta estável.', signals: [{ capability: 'governanca', pattern: 'prioridade-sem-foco', weight: -2 , details: ['product-direction'], layer: 'practice', constraint: 'none' }] },
    ], next: 'blocked-work',
  },
  {
    id: 'blocked-work', type: 'probe', title: 'Quando o trabalho para',
    scenario: 'Uma atividade importante não consegue avançar por depender de decisão, acesso, ambiente ou conhecimento fora de quem a iniciou.',
    prompt: 'O que costuma acontecer nas horas e dias seguintes?',
    options: [
      { id: 'team-resolves', label: 'O bloqueio fica visível imediatamente; o grupo reorganiza trabalho, aciona o caminho conhecido e usa o ocorrido para reduzir recorrência.', signals: [{ capability: 'fluxo', pattern: 'bloqueio-tratado-pelo-sistema', weight: 2 , details: ['work-management'], layer: 'practice', constraint: 'none' }] },
      { id: 'facilitator-chases', label: 'Uma pessoa de facilitação, produto ou gestão acompanha responsáveis e escaladas enquanto os demais seguem com outras atividades.', signals: [{ capability: 'organizacao', pattern: 'bloqueio-depende-de-coordenador', weight: -1 , details: ['work-management'], layer: 'practice', constraint: 'none' }] },
      { id: 'waiting-external', label: 'A atividade permanece aguardando a área responsável; quem iniciou atualiza o status e ocupa a capacidade com outro item.', signals: [{ capability: 'fluxo', pattern: 'espera-normalizada', weight: -2 , details: ['work-management'], layer: 'practice', constraint: 'none' }] },
      { id: 'local-workaround', label: 'O time cria um contorno para continuar, mesmo que aumente divergência, trabalho manual ou dívida a reconciliar.', signals: [{ capability: 'arquitetura', pattern: 'contorno-acumula-divida', weight: -1 , details: ['sustainable-design'], layer: 'practice', constraint: 'none' }] },
    ],
  },
  {
    id: 'blocked-cause', type: 'probe', title: 'O que torna a espera recorrente?',
    scenario: 'Bloqueios semelhantes aparecem em atividades diferentes e o simples escalonamento não reduz o tempo total.',
    prompt: 'Qual condição mais mantém esse padrão?',
    options: [
      { id: 'permission-policy', label: 'Permissões e controles não distinguem riscos nem oferecem um caminho seguro de autosserviço.', signals: [{ capability: 'governanca', pattern: 'causa-permissao-sem-autonomia', weight: -1 , details: ['enabling-governance'], layer: 'system', constraint: 'none' }] },
      { id: 'dependency-priority', label: 'A dependência pertence a outro grupo com prioridades e tempos que não são negociados pelo resultado compartilhado.', signals: [{ capability: 'organizacao', pattern: 'causa-prioridade-entre-times', weight: -1 , details: ['product-direction'], layer: 'system', constraint: 'none' }] },
      { id: 'missing-capability', label: 'Conhecimento necessário não está acessível no time, na plataforma ou em uma colaboração com tempo definido.', signals: [{ capability: 'organizacao', pattern: 'causa-competencia-inacessivel', weight: -1 , details: ['technical-capability'], layer: 'system', constraint: 'none' }] },
      { id: 'architecture-dependency', label: 'O desenho técnico exige alterar ou consultar muitos responsáveis para uma mudança comum.', signals: [{ capability: 'arquitetura', pattern: 'causa-dependencia-arquitetural', weight: -1 , details: ['evolvability'], layer: 'system', constraint: 'none' }] },
    ], next: 'decision-context',
  },
  {
    id: 'decision-context', type: 'probe', title: 'Como uma decisão chega para construção?',
    scenario: 'Uma necessidade relevante permite caminhos com custos, riscos e reversibilidade diferentes. O prazo pressiona por uma escolha rápida.',
    prompt: 'Como a opção que será construída normalmente ganha contexto e compromisso?',
    options: [
      { id: 'options-recorded', label: 'Negócio, produto e competências técnicas necessárias avaliam opções e restrições; decisões relevantes registram contexto, trade-offs e sinais para revisão.', signals: [{ capability: 'arquitetura', pattern: 'decisao-intencional-revisavel', weight: 2 , details: ['architecture-decisions'], layer: 'practice', constraint: 'none' }] },
      { id: 'design-handed-off', label: 'A solução chega definida e o time detalha implementação; dúvidas relevantes retornam aos responsáveis pela concepção.', signals: [{ capability: 'fluxo', pattern: 'solucao-entregue-pronta', weight: -2 , details: ['discovery-validation', 'planning-refinement', 'architecture-decisions'], layer: 'practice', constraint: 'none' }] },
      { id: 'expert-decides', label: 'Uma referência técnica escolhe o caminho usando experiência e comunica o necessário para o restante do grupo executar.', signals: [{ capability: 'arquitetura', pattern: 'decisao-concentrada', weight: -1 , details: ['architecture-decisions'], layer: 'practice', constraint: 'none' }] },
      { id: 'local-convention', label: 'O grupo segue o padrão habitual; alternativas são discutidas principalmente quando o padrão deixa de funcionar.', signals: [{ capability: 'aprendizado', pattern: 'decisao-por-inercia', weight: -1 , details: ['architecture-decisions'], layer: 'practice', constraint: 'none' }] },
    ], next: 'change-verification',
  },
  {
    id: 'change-verification', title: 'Feedback durante a construção',
    scenario: 'Uma mudança pequena toca uma regra antiga e pode afetar mais de uma jornada. Considere o período entre a primeira alteração e a confiança para integrá-la.',
    prompt: 'De onde costuma vir o feedback mais rápido e confiável?',
    options: [
      { id: 'repeatable-checks', label: 'Verificações rápidas e repetíveis acompanham a mudança; riscos novos são discutidos e cobertos conforme aparecem.', signals: [{ capability: 'engenharia', pattern: 'feedback-tecnico-rapido', weight: 2 , details: ['sdlc-automation'], layer: 'practice', constraint: 'none' }] },
      { id: 'qa-cycle', label: 'Uma pessoa de qualidade executa a maior parte das verificações quando recebe uma versão e um ambiente utilizável.', signals: [{ capability: 'qualidade', pattern: 'qualidade-como-handoff', weight: -2 , details: ['quality-strategy', 'collaboration'], layer: 'practice', constraint: 'none' }] },
      { id: 'developer-memory', label: 'Quem alterou valida os casos que conhece; outros efeitos aparecem na revisão, regressão ou uso posterior.', signals: [{ capability: 'engenharia', pattern: 'verificacao-dependente-de-memoria', weight: -2 , details: ['quality-strategy', 'technical-capability', 'organizational-learning'], layer: 'knowledge', constraint: 'none' }] },
      { id: 'slow-suite', label: 'Há verificações automatizadas, mas o retorno demora ou varia tanto que frequentemente seguimos sem esperar.', signals: [{ capability: 'engenharia', pattern: 'automacao-sem-feedback', weight: -1 , details: ['sdlc-automation', 'organizational-learning'], layer: 'practice', constraint: 'none' }] },
    ], next: 'environment-access',
  },
  {
    id: 'environment-access', title: 'Um ambiente para aprender',
    scenario: 'O time precisa reproduzir uma condição, validar integração e colocar uma alteração em um ambiente seguro. A necessidade não estava planejada.',
    prompt: 'Como isso normalmente acontece do pedido ao primeiro uso?',
    options: [
      { id: 'self-service', label: 'Um caminho suportado cria configuração reproduzível com limites de segurança, retorno rápido e remoção prevista.', signals: [{ capability: 'plataforma', pattern: 'self-service-com-guardrails', weight: 2 , details: ['platform-autonomy'], layer: 'practice', constraint: 'none' }] },
      { id: 'ticket-queue', label: 'Abre-se uma solicitação e o trabalho aguarda disponibilidade, esclarecimentos e execução de outro grupo.', signals: [{ capability: 'plataforma', pattern: 'provisionamento-em-fila', weight: -2 , details: ['platform-autonomy'], layer: 'practice', constraint: 'none' }] },
      { id: 'manual-access', label: 'Pessoas experientes combinam acessos e ajustam recursos existentes até a validação se tornar possível.', signals: [{ capability: 'governanca', pattern: 'acesso-artesanal', weight: -2 , details: ['platform-autonomy'], layer: 'practice', constraint: 'none' }] },
      { id: 'shared-drift', label: 'Usa-se um ambiente compartilhado; diferenças e concorrência são resolvidas durante a execução.', signals: [{ capability: 'confiabilidade', pattern: 'ambiente-inconsistente', weight: -2 , details: ['reliability-practice'], layer: 'practice', constraint: 'none' }] },
    ], next: 'security-change',
  },
  {
    id: 'security-change', title: 'Uma mudança com risco diferente',
    scenario: 'Uma alteração de baixo impacto e outra que toca dados sensíveis avançam na mesma semana. Ambas precisam demonstrar que podem operar com segurança.',
    prompt: 'Como os controles costumam participar dessas mudanças?',
    options: [
      { id: 'risk-guardrails', label: 'Risco muda o caminho; controles repetíveis dão retorno durante o trabalho e especialistas entram onde julgamento é necessário.', signals: [{ capability: 'plataforma', pattern: 'seguranca-habilitadora', weight: 2 , details: ['software-security', 'cloud-security'], layer: 'practice', constraint: 'none' }] },
      { id: 'late-review', label: 'A revisão especializada ocorre perto da liberação e pode devolver a mudança para etapas anteriores.', signals: [{ capability: 'governanca', pattern: 'seguranca-tardia', weight: -2 , details: ['software-security'], layer: 'practice', constraint: 'none' }] },
      { id: 'same-checklist', label: 'As duas seguem a mesma lista e aprovações; cumprir o processo é a principal evidência disponível.', signals: [{ capability: 'governanca', pattern: 'controle-indiferenciado', weight: -2 , details: ['enabling-governance'], layer: 'practice', constraint: 'none' }] },
      { id: 'team-best-effort', label: 'O time aplica o que conhece e procura ajuda quando percebe algo fora do comum.', signals: [{ capability: 'engenharia', pattern: 'competencia-de-seguranca-inacessivel', weight: -1 , details: ['software-security', 'technical-capability'], layer: 'knowledge', constraint: 'none' }] },
    ], next: 'architecture-pressure',
  },
  {
    id: 'architecture-pressure', title: 'Mudança além de uma fronteira',
    scenario: 'Uma regra muda com frequência e agora exige alterações coordenadas em componentes mantidos por grupos diferentes. O custo vem crescendo a cada entrega.',
    prompt: 'O que normalmente acontece quando esse padrão fica visível?',
    options: [
      { id: 'measure-and-adjust', label: 'Os grupos tornam o custo observável, testam uma fronteira ou contrato menor e acompanham se a coordenação diminui.', signals: [{ capability: 'arquitetura', pattern: 'arquitetura-evolutiva', weight: 2 , details: ['evolvability'], layer: 'practice', constraint: 'none' }] },
      { id: 'planning-sync', label: 'Aumentam alinhamentos, calendário e responsáveis para coordenar melhor a estrutura existente.', signals: [{ capability: 'arquitetura', pattern: 'acoplamento-coordenado', weight: -1 , details: ['evolvability'], layer: 'practice', constraint: 'none' }] },
      { id: 'architecture-project', label: 'A solução aguarda uma iniciativa maior de arquitetura enquanto entregas continuam usando contornos locais.', signals: [{ capability: 'arquitetura', pattern: 'evolucao-em-grande-lote', weight: -2 , details: ['evolvability'], layer: 'practice', constraint: 'none' }] },
      { id: 'ownership-dispute', label: 'A prioridade varia conforme quem sofre o impacto e quem possui autoridade sobre cada componente.', signals: [{ capability: 'organizacao', pattern: 'ownership-fragmentado', weight: -2 , details: ['domain-alignment', 'team-ownership'], layer: 'practice', constraint: 'none' }] },
    ], next: 'team-pressure',
  },
  {
    id: 'team-pressure', title: 'Pressão, conflito e aprendizado',
    scenario: 'Após uma falha relevante, há pressão por explicações. Decisões envolveram prazo, produto, código, controles e operação; nenhuma pessoa viu a cadeia inteira.',
    prompt: 'Como a organização costuma conduzir os dias seguintes?',
    options: [
      { id: 'system-learning', label: 'Reconstrói condições e decisões sem buscar culpado, protege relatos difíceis e muda o sistema com responsáveis e sinais de efeito.', signals: [{ capability: 'organizacao', pattern: 'aprendizado-blameless', weight: 2 , details: ['organizational-learning'], layer: 'outcome', constraint: 'none' }] },
      { id: 'accountability-person', label: 'Identifica quem deveria ter evitado a falha e reforça revisão, atenção ou aprovação nessa etapa.', signals: [{ capability: 'organizacao', pattern: 'culpa-e-controle', weight: -2 , details: ['enabling-governance', 'leadership-management'], layer: 'practice', constraint: 'none' }] },
      { id: 'private-resolution', label: 'Lideranças e especialistas resolvem o caso em um grupo pequeno para reduzir exposição e recuperar a entrega.', signals: [{ capability: 'aprendizado', pattern: 'aprendizado-restrito', weight: -2 , details: ['organizational-learning'], layer: 'outcome', constraint: 'none' }] },
      { id: 'move-on', label: 'Corrige o efeito imediato; com a pressão seguinte, a análise mais ampla perde prioridade.', signals: [{ capability: 'confiabilidade', pattern: 'incidente-sem-aprendizado', weight: -2 , details: ['incident-management', 'organizational-learning'], layer: 'outcome', constraint: 'none' }] },
    ], next: 'improvement-loop',
  },
  {
    id: 'improvement-loop', title: 'O que muda após refletir sobre o trabalho?',
    scenario: 'Pense nas últimas vezes em que o grupo parou para revisar entrega, colaboração, incidentes ou forma de trabalhar. O encontro pode ter qualquer nome e frequência.',
    prompt: 'Qual consequência aparece com mais consistência nas semanas seguintes?',
    options: [
      { id: 'owned-and-verified', label: 'O grupo escolhe poucas mudanças, cada uma com responsável, e volta a elas até haver efeito observável.', signals: [
        { capability: 'aprendizado', pattern: 'melhoria-com-ciclo-fechado', weight: 2 , details: ['organizational-learning'], layer: 'practice', constraint: 'none' },
        { capability: 'organizacao', pattern: 'melhoria-com-ownership', weight: 2 , details: ['team-ownership', 'organizational-learning'], layer: 'practice', constraint: 'none' },
        { capability: 'fluxo', pattern: 'melhoria-protegida-no-fluxo', weight: 2 , details: ['organizational-learning'], layer: 'practice', constraint: 'none' },
      ] },
      { id: 'action-list-fades', label: 'A conversa gera ações, mas elas competem com entregas, perdem responsáveis ou deixam de ser revisitadas.', signals: [
        { capability: 'aprendizado', pattern: 'retrospectiva-sem-fechamento', weight: -2 , details: ['organizational-learning'], layer: 'practice', constraint: 'none' },
        { capability: 'governanca', pattern: 'melhoria-sem-prioridade', weight: -1 , details: ['product-direction', 'organizational-learning'], layer: 'practice', constraint: 'none' },
      ] },
      { id: 'ceremony-report', label: 'O encontro acontece no calendário e registra percepções, porém raramente muda decisão, processo ou capacidade reservada.', signals: [
        { capability: 'aprendizado', pattern: 'cerimonia-sem-adaptacao', weight: -2 , details: ['organizational-learning'], layer: 'practice', constraint: 'none' },
        { capability: 'organizacao', pattern: 'processo-sem-autonomia', weight: -1 , details: ['team-ownership'], layer: 'practice', constraint: 'none' },
      ] },
      { id: 'only-after-crisis', label: 'Mudanças no modo de trabalhar surgem principalmente após crise ou cobrança externa, conduzidas por liderança ou especialistas.', signals: [
        { capability: 'aprendizado', pattern: 'melhoria-reativa', weight: -2 , details: ['organizational-learning'], layer: 'practice', constraint: 'none' },
        { capability: 'organizacao', pattern: 'mudanca-centralizada', weight: -1 , details: ['leadership-management'], layer: 'practice', constraint: 'none' },
      ] },
    ],
  },
  {
    id: 'improvement-cause', type: 'probe', title: 'O que impede a melhoria de fechar o ciclo?',
    scenario: 'Os mesmos temas retornam em encontros diferentes sem mudança sustentada, mesmo quando o grupo reconhece o impacto.',
    prompt: 'Qual condição mais mantém esse padrão?',
    options: [
      { id: 'no-capacity', label: 'Toda a capacidade é consumida por entregas e urgências; melhorar o sistema não compete de forma explícita na priorização.', signals: [{ capability: 'governanca', pattern: 'causa-melhoria-sem-capacidade', weight: -1 , details: ['portfolio-management', 'organizational-learning'], layer: 'system', constraint: 'none' }] },
      { id: 'no-autonomy', label: 'As causas dependem de decisões, políticas ou estruturas fora da autonomia do grupo e não há caminho efetivo de escalada.', signals: [{ capability: 'organizacao', pattern: 'causa-melhoria-sem-autonomia', weight: -1 , details: ['organizational-learning'], layer: 'system', constraint: 'none' }] },
      { id: 'too-many-actions', label: 'Muitas ações são abertas sem limite, evidência de sucesso ou encerramento explícito.', signals: [{ capability: 'aprendizado', pattern: 'causa-acoes-sem-foco', weight: -1 , details: ['product-direction'], layer: 'system', constraint: 'none' }] },
      { id: 'unsafe-dialogue', label: 'Conflitos, erros e decisões difíceis são suavizados porque expô-los traz risco pessoal ou pouca mudança prática.', signals: [{ capability: 'organizacao', pattern: 'causa-baixa-seguranca-psicologica', weight: -2 , details: ['software-security'], layer: 'system', constraint: 'none' }] },
    ], next: 'shared-surface-context',
  },
  {
    id: 'shared-surface-context', type: 'context', title: 'Fronteira de mudança',
    scenario: 'Considere o código e a configuração que sustentam a principal jornada do grupo. Esta etapa apenas seleciona um cenário aplicável.',
    prompt: 'Quem normalmente altera essa mesma superfície?',
    options: [
      { id: 'single-owner', label: 'Um único time mantém a maior parte dessa superfície; outros colaboram por interfaces ou pedidos explícitos.', signals: [] },
      { id: 'multiple-teams', label: 'Vários times alteram diretamente a mesma base, configuração ou pipeline ao longo do mesmo período.', signals: [] },
      { id: 'mixed-boundaries', label: 'Há áreas com ownership claro e outras compartilhadas conforme produto, prazo ou especialidade.', signals: [] },
      { id: 'unknown-ownership', label: 'Não consigo identificar com segurança quem pode alterar ou quem responde por todas as partes relevantes.', signals: [] },
    ],
  },
  {
    id: 'shared-surface-risk', type: 'probe', title: 'Mudanças concorrentes na mesma superfície',
    scenario: 'Dois grupos preparam mudanças próximas na mesma base. Uma delas altera comportamento, configuração ou sequência esperada pela outra.',
    prompt: 'Como esse conflito normalmente se torna visível?',
    options: [
      { id: 'early-contract-feedback', label: 'Ownership e mudanças em curso são visíveis; integração e verificações encontram incompatibilidades enquanto os lotes ainda são pequenos.', signals: [
        { capability: 'engenharia', pattern: 'concorrencia-detectada-cedo', weight: 2 , details: ['sustainable-design'], layer: 'practice', constraint: 'none' },
        { capability: 'organizacao', pattern: 'ownership-compartilhado-explicito', weight: 1 , details: ['team-ownership'], layer: 'practice', constraint: 'none' },
      ] },
      { id: 'overwritten-change', label: 'Uma versão, configuração ou pacote já foi sobrescrito ou substituído sem que o outro grupo percebesse a tempo.', signals: [
        { capability: 'entrega', pattern: 'mudanca-sobrescrita', weight: -2 , details: ['continuous-integration'], layer: 'practice', constraint: 'none' },
        { capability: 'engenharia', pattern: 'fonte-nao-confiavel', weight: -2 , details: ['continuous-integration', 'sdlc-automation'], layer: 'practice', constraint: 'none' },
        { capability: 'organizacao', pattern: 'comunicacao-de-mudanca-fragil', weight: -1 , details: ['collaboration', 'organizational-learning'], layer: 'practice', constraint: 'none' },
      ] },
      { id: 'late-integration-conflict', label: 'Conflitos e regressões aparecem ao reunir versões ou preparar a liberação, exigindo decisão conjunta sob pressão.', signals: [
        { capability: 'fluxo', pattern: 'conflito-de-integracao-tardio', weight: -2 , details: ['continuous-integration', 'organizational-learning'], layer: 'practice', constraint: 'none' },
        { capability: 'arquitetura', pattern: 'fronteira-compartilhada-acoplada', weight: -1 , details: ['evolvability'], layer: 'practice', constraint: 'none' },
      ] },
      { id: 'manual-coordination', label: 'Responsáveis mantêm alinhamentos, mensagens e calendário para evitar colisões; o resultado depende de todos conhecerem o plano.', signals: [
        { capability: 'organizacao', pattern: 'concorrencia-coordenada-manualmente', weight: -1 , details: ['team-ownership'], layer: 'practice', constraint: 'none' },
        { capability: 'fluxo', pattern: 'planejamento-compensa-acoplamento', weight: -1 , details: ['evolvability'], layer: 'practice', constraint: 'none' },
      ] },
    ],
  },
  {
    id: 'shared-surface-cause', type: 'probe', title: 'Por que a colisão continua possível?',
    scenario: 'Problemas de concorrência reaparecem apesar de mais comunicação, revisão e cuidado das pessoas envolvidas.',
    prompt: 'Qual causa provável melhor explica a recorrência?',
    options: [
      { id: 'ambiguous-source', label: 'Há mais de uma origem ou processo capaz de produzir a versão considerada válida.', signals: [{ capability: 'engenharia', pattern: 'causa-multiplas-fontes', weight: -1 , details: ['sdlc-automation'], layer: 'system', constraint: 'none' }] },
      { id: 'weak-boundaries', label: 'Os limites do sistema não acompanham ownership; mudanças locais exigem compreender uma área extensa compartilhada.', signals: [{ capability: 'arquitetura', pattern: 'causa-limites-sem-ownership', weight: -1 , details: ['domain-alignment', 'team-ownership'], layer: 'system', constraint: 'none' }] },
      { id: 'independent-priorities', label: 'Times compartilham a superfície, mas objetivos, prazos e decisões são independentes.', signals: [{ capability: 'governanca', pattern: 'causa-prioridades-na-superficie', weight: -1 , details: ['product-direction', 'team-ownership'], layer: 'system', constraint: 'none' }] },
      { id: 'missing-verification', label: 'Contratos, configuração e integração não possuem feedback repetível antes da composição final.', signals: [{ capability: 'engenharia', pattern: 'causa-verificacao-concorrente', weight: -1 , details: ['continuous-integration', 'quality-strategy', 'organizational-learning'], layer: 'system', constraint: 'none' }] },
    ], next: 'team-health',
  },
  {
    id: 'team-health', title: 'Quando a forma de trabalhar deixa de servir',
    scenario: 'O grupo cresce, muda de responsabilidades ou passa a depender de mais áreas. Conflitos e carga cognitiva aumentam sem uma falha técnica única.',
    prompt: 'Como a estrutura e o modo de interação normalmente são revistos?',
    options: [
      { id: 'observe-and-adapt', label: 'O grupo observa fluxo, carga, conflitos e resultados; testa mudanças de fronteira ou colaboração e revisa seus efeitos com as pessoas afetadas.', signals: [
        { capability: 'organizacao', pattern: 'estrutura-adaptada-por-evidencia', weight: 2 , details: ['team-ownership'], layer: 'practice', constraint: 'none' },
        { capability: 'aprendizado', pattern: 'dinamica-de-time-revisada', weight: 2 , details: ['organizational-learning'], layer: 'practice', constraint: 'none' },
      ] },
      { id: 'manager-reorganizes', label: 'A liderança reorganiza responsabilidades e pessoas usando desempenho, capacidade e prioridades disponíveis.', signals: [{ capability: 'organizacao', pattern: 'estrutura-definida-centralmente', weight: -1 , details: ['team-ownership'], layer: 'practice', constraint: 'none' }] },
      { id: 'add-coordination', label: 'Mantêm-se as fronteiras e adicionam-se alinhamentos, responsáveis ou especialistas para absorver a complexidade.', signals: [{ capability: 'organizacao', pattern: 'coordenacao-compensa-carga', weight: -1 , details: ['work-management', 'team-ownership', 'collaboration', 'organizational-learning'], layer: 'practice', constraint: 'none' }] },
      { id: 'individual-adaptation', label: 'As pessoas ajustam informalmente responsabilidades e buscam ajuda conforme a pressão aparece.', signals: [{ capability: 'organizacao', pattern: 'estrutura-implicita', weight: -2 , details: ['team-ownership'], layer: 'practice', constraint: 'none' }] },
    ], next: 'product-outcome-evidence',
  },
  {
    id: 'product-outcome-evidence', title: 'Da entrega ao resultado',
    scenario: 'Uma funcionalidade relevante chegou às pessoas usuárias. Semanas depois, novas demandas competem por capacidade e é preciso decidir se o investimento produziu o efeito esperado.',
    prompt: 'Como essa decisão costuma ser tomada no trabalho real?',
    options: [
      { id: 'outcome-reviewed', label: 'O resultado esperado foi definido antes da construção; produto, negócio e tecnologia revisam evidências e alteram prioridade ou solução quando necessário.', signals: [{ capability: 'fluxo', pattern: 'resultado-de-produto-revisado', weight: 2 , details: ['product-direction'], layer: 'outcome', constraint: 'none' }, { capability: 'aprendizado', pattern: 'hipotese-validada-por-resultado', weight: 2 , details: ['discovery-validation', 'product-direction'], layer: 'outcome', constraint: 'none' }] },
      { id: 'usage-reported', label: 'Acompanhamos uso e indicadores após a entrega, mas eles raramente mudam compromissos já assumidos ou a direção do portfólio.', signals: [{ capability: 'governanca', pattern: 'resultado-sem-repriorizacao', weight: -1 , details: ['product-direction', 'organizational-learning'], layer: 'outcome', constraint: 'none' }] },
      { id: 'delivery-accepted', label: 'A conclusão é validada principalmente por aceite e entrega do escopo; benefícios são acompanhados por negócio em outro momento.', signals: [{ capability: 'fluxo', pattern: 'entrega-substitui-resultado', weight: -2 , details: ['product-direction', 'release-feedback'], layer: 'outcome', constraint: 'none' }] },
      { id: 'next-demand', label: 'O grupo segue para a próxima demanda e volta ao resultado anterior quando surge reclamação, cobrança ou nova iniciativa.', signals: [{ capability: 'governanca', pattern: 'portfolio-sem-feedback', weight: -2 , details: ['portfolio-management'], layer: 'practice', constraint: 'none' }] },
    ], next: 'technical-stewardship',
  },
  {
    id: 'technical-stewardship', title: 'Sustentabilidade da mudança',
    scenario: 'Uma área do código muda com frequência, concentra defeitos e exige conhecimento específico. Há pressão para continuar entregando sem interromper todo o roadmap.',
    prompt: 'Como o grupo normalmente reduz esse custo ao longo das próximas mudanças?',
    options: [
      { id: 'incremental-improvement', label: 'Reserva melhoria proporcional em cada mudança, explicita o risco, acompanha escapes e reduz dependência de conhecimento concentrado.', signals: [{ capability: 'engenharia', pattern: 'design-sustentavel-incremental', weight: 2 , details: ['sustainable-design'], layer: 'practice', constraint: 'none' }, { capability: 'aprendizado', pattern: 'divida-revista-por-efeito', weight: 1 , details: ['sustainable-design'], layer: 'outcome', constraint: 'none' }] },
      { id: 'dedicated-backlog', label: 'Registra dívida em um backlog separado e tenta negociar uma iniciativa quando o impacto se torna grande o suficiente.', signals: [{ capability: 'governanca', pattern: 'divida-sem-capacidade-continua', weight: -1 , details: ['portfolio-management', 'sustainable-design'], layer: 'practice', constraint: 'none' }] },
      { id: 'expert-ownership', label: 'Direciona mudanças para as pessoas que conhecem melhor a área, preservando velocidade apesar da concentração.', signals: [{ capability: 'engenharia', pattern: 'codigo-depende-de-especialista', weight: -2 , details: ['sustainable-design', 'platform-autonomy'], layer: 'practice', constraint: 'none' }] },
      { id: 'rewrite-later', label: 'Evita alterar além do necessário porque a solução definitiva depende de reescrita, migração ou projeto futuro.', signals: [{ capability: 'arquitetura', pattern: 'sustentabilidade-em-grande-lote', weight: -2 , details: ['evolvability'], layer: 'practice', constraint: 'none' }] },
    ], next: 'data-contract-change',
  },
  {
    id: 'data-contract-change', title: 'Evolução de contratos e dados',
    scenario: 'Uma mudança precisa alterar um contrato ou estrutura de dados consumida por outros componentes e times, sem interromper versões ainda em uso.',
    prompt: 'Como a compatibilidade costuma ser preservada?',
    options: [
      { id: 'compatible-evolution', label: 'Consumidores e ownership são conhecidos; contrato e schema evoluem de forma compatível, verificável e com remoção planejada da versão anterior.', signals: [{ capability: 'arquitetura', pattern: 'contrato-e-dados-evoluem-compativeis', weight: 2 , details: ['sustainable-design', 'integration-data'], layer: 'practice', constraint: 'none' }, { capability: 'engenharia', pattern: 'compatibilidade-verificada', weight: 1 , details: ['sustainable-design'], layer: 'practice', constraint: 'none' }] },
      { id: 'coordinated-migration', label: 'Responsáveis combinam uma janela e sequência de migração; a segurança depende de todos executarem o plano na ordem.', signals: [{ capability: 'fluxo', pattern: 'migracao-coordenada-em-lote', weight: -1 , details: ['organizational-learning'], layer: 'practice', constraint: 'none' }] },
      { id: 'defensive-consumers', label: 'Cada consumidor trata variações conhecidas e corrige incompatibilidades conforme elas aparecem nos ambientes.', signals: [{ capability: 'arquitetura', pattern: 'contrato-implicito-fragil', weight: -2 , details: ['integration-data'], layer: 'practice', constraint: 'none' }] },
      { id: 'direct-data-fix', label: 'Scripts e ajustes de dados são preparados para reconciliar casos depois da implantação, conforme o estado encontrado.', signals: [{ capability: 'engenharia', pattern: 'migracao-de-dados-contextual', weight: -2 , details: ['sustainable-design', 'integration-data', 'organizational-learning'], layer: 'practice', constraint: 'none' }] },
    ], next: 'reliability-objective',
  },
  {
    id: 'reliability-objective', title: 'Confiabilidade como decisão',
    scenario: 'Uma jornada apresenta falhas e lentidão intermitentes. Melhorá-la compete com funcionalidades e os indicadores técnicos possuem distribuições diferentes ao longo do dia.',
    prompt: 'Como o grupo decide quanto esforço investir e se a situação melhorou?',
    options: [
      { id: 'service-objective', label: 'Um objetivo ligado à experiência das pessoas usuárias orienta a prioridade; o grupo revisa a distribuição do impacto, não só a média, antes de decidir se a situação melhorou.', signals: [{ capability: 'confiabilidade', pattern: 'objetivo-de-confiabilidade-orienta-decisao', weight: 2 , details: ['product-direction', 'architecture-decisions', 'reliability-practice'], layer: 'practice', constraint: 'none' }, { capability: 'observabilidade', pattern: 'distribuicao-interpretada-no-contexto', weight: 2 , details: ['observability-practice'], layer: 'practice', constraint: 'none' }] },
      { id: 'fixed-thresholds', label: 'Metas e limites fixos orientam alertas; quando voltam ao normal, o trabalho planejado segue mesmo que parte das pessoas ainda perceba impacto.', signals: [{ capability: 'observabilidade', pattern: 'limites-escondem-distribuicao', weight: -1 , details: ['observability-practice'], layer: 'practice', constraint: 'none' }] },
      { id: 'incident-priority', label: 'O investimento cresce depois de incidentes e reclamações; fora desses períodos, funcionalidades recuperam prioridade.', signals: [{ capability: 'confiabilidade', pattern: 'confiabilidade-reativa-a-incidente', weight: -2 , details: ['reliability-practice', 'incident-management'], layer: 'practice', constraint: 'none' }] },
      { id: 'specialist-judgment', label: 'Especialistas avaliam gráficos e histórico e negociam caso a caso quanto risco é aceitável.', signals: [{ capability: 'organizacao', pattern: 'decisao-de-confiabilidade-concentrada', weight: -1 , details: ['architecture-decisions', 'reliability-practice'], layer: 'practice', constraint: 'none' }] },
    ], next: 'credential-context',
  },
  {
    id: 'credential-context', type: 'context', title: 'Autenticação entre partes do sistema',
    scenario: 'Algumas mudanças precisam que um componente, pessoa ou carga se autentique em outro sistema. Outros ambientes não têm essa necessidade.',
    prompt: 'No trabalho recente, esse tipo de evento ocorre?',
    options: [
      { id: 'occurs', label: 'Sim: mudanças recentes precisaram de credencial, identidade ou acesso entre componentes ou pessoas.', signals: [] },
      { ...notApplicableEvent, label: 'Não: neste ambiente não há autenticação entre sistemas nem concessão recorrente de acesso.' },
    ],
  },
  {
    id: 'credential-practice', title: 'Como a credencial chega a quem precisa',
    scenario: 'Uma mudança precisa que um componente fale com outro que já exige autenticação, ou que uma pessoa obtenha acesso mínimo para investigar.',
    prompt: 'O que normalmente acontece até isso funcionar de ponta a ponta?',
    options: [
      { id: 'scoped-identity', label: 'Há um caminho repetível: a identidade tem escopo, expiração e trilha; outra pessoa consegue repetir sem herdar acesso permanente.', signals: [{ capability: 'plataforma', pattern: 'identidade-com-escopo-e-expiracao', weight: 2, details: ['cloud-security', 'software-security', 'platform-autonomy'], layer: 'practice', constraint: 'none' }] },
      { id: 'handoff-secret', label: 'Alguém com acesso coloca o valor e avisa por ticket, chat ou conversa; o tempo depende de quem está disponível.', signals: [{ capability: 'plataforma', pattern: 'credencial-por-handoff', weight: -2, details: ['cloud-security', 'platform-autonomy'], layer: 'practice', constraint: 'none' }] },
      { id: 'config-secret', label: 'O valor viaja em configuração, arquivo ou variável compartilhada para destravar a mudança.', signals: [{ capability: 'engenharia', pattern: 'credencial-em-configuracao', weight: -3, details: ['cloud-security', 'software-security'], layer: 'practice', constraint: 'none' }] },
      { id: 'shared-identity', label: 'Usa-se uma conta ou chave já conhecida por várias pessoas, porque é o caminho mais rápido.', signals: [{ capability: 'plataforma', pattern: 'identidade-compartilhada', weight: -2, details: ['cloud-security', 'enabling-governance'], layer: 'practice', constraint: 'none' }] },
    ], next: 'dependency-context',
  },
  {
    id: 'dependency-context', type: 'context', title: 'Dependência que pode falhar ou atrasar',
    scenario: 'O trabalho às vezes depende de outro serviço, parceiro ou fila cujo tempo de resposta não está sob controle do time.',
    prompt: 'Esse tipo de dependência faz parte do cotidiano?',
    options: [
      { id: 'occurs', label: 'Sim: há serviços ou parceiros cujo atraso ou falha afeta o que entregamos.', signals: [] },
      { ...notApplicableEvent, label: 'Não: o produto não depende de outro sistema que possa atrasar ou falhar de forma visível.' },
    ],
  },
  {
    id: 'dependency-practice', title: 'Quando a dependência fica lenta',
    scenario: 'Um serviço de terceiro ou interno começa a responder muito mais devagar. O fluxo de usuários continua chegando.',
    prompt: 'O que o sistema faz nos minutos seguintes, e como vocês sabem que isso foi uma decisão?',
    options: [
      { id: 'decided-limits', label: 'Há limites conscientes de espera e isolamento; o comportamento foi revisado e dá para explicar por que existe.', signals: [{ capability: 'arquitetura', pattern: 'dependencia-com-limites-decididos', weight: 2, details: ['evolvability', 'reliability-practice'], layer: 'practice', constraint: 'none' }] },
      { id: 'retry-amplifies', label: 'O sistema insiste automaticamente e a fila ou a carga no dependente cresce.', signals: [{ capability: 'confiabilidade', pattern: 'retry-amplia-falha', weight: -2, details: ['reliability-practice', 'evolvability'], layer: 'practice', constraint: 'none' }] },
      { id: 'wait-forever', label: 'As requisições esperam até alguém intervir ou o cliente desistir.', signals: [{ capability: 'confiabilidade', pattern: 'espera-sem-limite', weight: -2, details: ['reliability-practice'], layer: 'practice', constraint: 'none' }] },
      { id: 'cosmetic-limit', label: 'Existe um limite configurado com valor tão alto ou tão genérico que, na prática, não muda o comportamento.', signals: [{ capability: 'arquitetura', pattern: 'limite-cosmetico', weight: -1, details: ['evolvability', 'reliability-practice'], layer: 'practice', constraint: 'none' }] },
    ], next: 'incentive-context',
  },
  {
    id: 'incentive-context', type: 'context', title: 'O que o sistema de reconhecimento premia',
    scenario: 'Em algumas organizações há ciclo de avaliação, bônus, promoção ou reconhecimento público que as pessoas observam. Em outras, isso não existe ou fica invisível.',
    prompt: 'Você observa um ciclo recente de reconhecimento, avaliação ou promoção?',
    options: [
      { id: 'occurs', label: 'Sim: houve avaliação, bônus, promoção ou reconhecimento que as pessoas comentam.', signals: [] },
      { ...notApplicableEvent, label: 'Não: neste ambiente não há ciclo de avaliação, bônus ou promoção visível ao grupo.' },
    ],
  },
  {
    id: 'incentive-practice', title: 'O que pesou de fato',
    scenario: 'Pense no último ciclo de avaliação, bônus ou promoção que o grupo comentou. Entregas, estabilidade e resultado de negócio competiam.',
    prompt: 'O que de fato pesou para quem constrói e prioriza o produto?',
    options: [
      { id: 'outcome-weighted', label: 'Resultado observado (efeito em usuários, risco evitado, aprendizado) entrou na decisão, mesmo quando o escopo atrasou.', signals: [{ capability: 'governanca', pattern: 'incentivo-segue-resultado', weight: 2, details: ['portfolio-management', 'product-direction', 'leadership-management'], layer: 'outcome', constraint: 'none' }] },
      { id: 'delivery-weighted', label: 'O que pesou foi concluir itens, cumprir prazo ou volume de entrega, independentemente do efeito.', signals: [{ capability: 'governanca', pattern: 'incentivo-segue-entrega', weight: -2, details: ['portfolio-management', 'product-direction'], layer: 'outcome', constraint: 'none' }] },
      { id: 'opaque-reward', label: 'Ninguém sabe explicar o critério; o reconhecimento parece relacional ou opaco.', signals: [{ capability: 'organizacao', pattern: 'incentivo-opaco', weight: -2, details: ['leadership-management', 'enabling-governance'], layer: 'system', constraint: 'culture' }] },
    ], next: 'ai-context',
  },
  {
    id: 'ai-context', type: 'context', title: 'Saída assistida por modelo',
    scenario: 'Em alguns fluxos, texto, código, teste, diagnóstico ou atendimento começa com uma saída gerada por um modelo. Em outros, isso ainda não entra no trabalho.',
    prompt: 'No trabalho recente, uma saída gerada por modelo entra em decisão, código, teste, operação ou atendimento?',
    options: [
      { id: 'occurs', label: 'Sim: pessoas usam assistência de modelo em alguma etapa do trabalho real.', signals: [] },
      { ...notApplicableEvent, label: 'Não: esse tipo de assistência não faz parte do trabalho cotidiano.' },
    ],
  },
  {
    id: 'ai-practice', title: 'Quando a assistência erra no risco',
    scenario: 'Uma alteração ou resposta assistida por modelo chegou perto de produção ou de um cliente com um erro sutil de autorização, dado ou entendimento.',
    prompt: 'Como o grupo descobre, contém e muda o modo de usar a assistência?',
    options: [
      { id: 'proportional-review', label: 'Há revisão proporcional ao risco, rastros do que foi assistido e um caminho suportado para o modelo autorizado.', signals: [{ capability: 'engenharia', pattern: 'ia-revisada-proporcional', weight: 2, details: ['quality-strategy', 'software-security', 'organizational-learning'], layer: 'practice', constraint: 'none' }] },
      { id: 'shadow-model', label: 'Cada pessoa cola a ferramenta que tiver; não há política visível de dado, modelo ou segredo.', signals: [{ capability: 'governanca', pattern: 'ia-sombra-sem-politica', weight: -2, details: ['enabling-governance', 'software-security', 'cloud-security'], layer: 'system', constraint: 'governance' }] },
      { id: 'understanding-drops', label: 'A entrega acelera, mas menos pessoas conseguem explicar o que foi feito ou revisar com segurança.', signals: [{ capability: 'engenharia', pattern: 'ia-substitui-entendimento', weight: -2, details: ['technical-capability', 'organizational-learning'], layer: 'outcome', constraint: 'none' }] },
      { id: 'generated-as-fact', label: 'Diagnóstico ou texto gerado é tratado como fato até alguém desmentir na operação.', signals: [{ capability: 'confiabilidade', pattern: 'ia-diagnostico-como-fato', weight: -2, details: ['incident-management', 'observability-practice'], layer: 'practice', constraint: 'none' }] },
    ], next: 'accidental-complexity',
  },
  {
    id: 'accidental-complexity', title: 'Camada extra para um problema local',
    scenario: 'Um problema que parecia caber em um módulo ganhou um novo serviço, fila ou camada de abstração. Duas entregas depois, o custo de mudança ainda é visível.',
    prompt: 'Como essa decisão costuma ser revista?',
    options: [
      { id: 'simplicity-reviewed', label: 'O grupo revisa se a complexidade ainda se justifica e reduz ou mantém com um motivo explícito.', signals: [{ capability: 'arquitetura', pattern: 'simplicidade-revista', weight: 2, details: ['evolvability', 'architecture-decisions'], layer: 'practice', constraint: 'none' }] },
      { id: 'layer-stays', label: 'A camada permanece porque já está lá; o custo é absorvido nas próximas mudanças.', signals: [{ capability: 'arquitetura', pattern: 'camada-sem-revisao', weight: -2, details: ['evolvability'], layer: 'practice', constraint: 'none' }] },
      { id: 'prestige-design', label: 'A escolha se sustenta pelo prestígio técnico ou pela moda da solução, mais do que pelo problema atual.', signals: [{ capability: 'arquitetura', pattern: 'prestigio-tecnico', weight: -1, details: ['architecture-decisions', 'evolvability'], layer: 'practice', constraint: 'none' }] },
      { ...notApplicableEvent, label: 'Não construímos software com limites técnicos que possam ganhar camadas extras.' },
    ], next: 'noisy-signal',
  },
  {
    id: 'noisy-signal', title: 'Um gráfico que parece ter melhorado',
    scenario: 'Depois de um deploy, um gráfico de latência “melhorou”: a média caiu, um extremo piorou e o volume caiu cerca de 40%. Alguém pergunta se podem comunicar sucesso.',
    prompt: 'Qual decisão o grupo toma com o que tem?',
    options: [
      { id: 'ask-denominator', label: 'Pedem o denominador, o recorte e o que aconteceu com a cauda antes de concluir; se a base ficou pequena, não celebram.', signals: [{ capability: 'observabilidade', pattern: 'recusa-concluir-sem-contexto', weight: 2, details: ['observability-practice'], layer: 'practice', constraint: 'none' }] },
      { id: 'celebrate-mean', label: 'Comunicam a melhoria da média e seguem o plano, porque o indicador principal desceu.', signals: [{ capability: 'observabilidade', pattern: 'celebra-media', weight: -2, details: ['observability-practice'], layer: 'practice', constraint: 'none' }] },
      { id: 'ignore-sample', label: 'Tratam o gráfico como prova suficiente; tamanho da base e mudança de mistura não entram na conversa.', signals: [{ capability: 'observabilidade', pattern: 'ignora-base-pequena', weight: -1, details: ['observability-practice', 'product-direction'], layer: 'practice', constraint: 'none' }] },
    ], next: 'leadership-enablement',
  },
  {
    id: 'leadership-enablement', title: 'Liderança diante de um limite sistêmico',
    scenario: 'O mesmo gargalo afeta entregas diferentes e não cabe na autonomia de uma única squad. Resolver exige capacidade, decisão e colaboração entre áreas.',
    prompt: 'Como a liderança normalmente atua até produzir uma mudança sustentável?',
    options: [
      { id: 'system-owner', label: 'Torna o gargalo visível e atribui um responsável pelo resultado compartilhado, com capacidade protegida para um experimento.', signals: [{ capability: 'organizacao', pattern: 'lideranca-habilita-mudanca-sistemica', weight: 2 , details: ['leadership-management'], layer: 'practice', constraint: 'none' }, { capability: 'governanca', pattern: 'governanca-protege-capacidade-de-melhoria', weight: 2 , details: ['portfolio-management', 'enabling-governance', 'organizational-learning'], layer: 'practice', constraint: 'none' }] },
      { id: 'escalation-followup', label: 'Escala o tema, acompanha responsáveis e cobra planos até que cada área conclua sua parte.', signals: [{ capability: 'organizacao', pattern: 'lideranca-coordena-handoffs', weight: -1 , details: ['leadership-management', 'collaboration'], layer: 'practice', constraint: 'none' }] },
      { id: 'local-efficiency', label: 'Solicita que cada time melhore seus indicadores e processos dentro da autonomia disponível.', signals: [{ capability: 'organizacao', pattern: 'otimizacao-local-pela-gestao', weight: -2 , details: ['organizational-learning'], layer: 'practice', constraint: 'none' }] },
      { id: 'strategic-project', label: 'Transforma o problema em iniciativa estratégica com planejamento, orçamento e governança próprios.', signals: [{ capability: 'governanca', pattern: 'mudanca-sistemica-em-grande-lote', weight: -1 , details: ['enabling-governance'], layer: 'practice', constraint: 'none' }] },
    ],
  },
  {
    id: 'management-portfolio', title: 'Decisão sobre capacidade organizacional',
    scenario: 'Iniciativas novas competem com confiabilidade, dívida e melhorias estruturais que atravessam mais de um time.', prompt: 'Como a capacidade costuma ser redistribuída?',
    options: [
      { id: 'portfolio-tradeoffs', label: 'Resultados, riscos, dependências e custo de atraso são comparados; iniciar algo novo torna explícito o que será interrompido.', signals: [{ capability: 'governanca', pattern: 'portfolio-explicita-tradeoffs', weight: 2, details: ['portfolio-management', 'product-direction'], layer: 'practice' , constraint: 'none' }] },
      { id: 'executive-priority', label: 'Lideranças definem a ordem e as áreas reorganizam seus compromissos para absorver a decisão.', signals: [{ capability: 'governanca', pattern: 'portfolio-por-prioridade-executiva', weight: -1, details: ['portfolio-management', 'leadership-management'], layer: 'system', constraint: 'governance'  }] },
      { id: 'parallel-initiatives', label: 'As iniciativas seguem em paralelo e cada responsável negocia pessoas e dependências durante a execução.', signals: [{ capability: 'organizacao', pattern: 'portfolio-paralelo-fragmenta-capacidade', weight: -2, details: ['portfolio-management', 'work-management'], layer: 'system', constraint: 'organization'  }] },
    ], next: 'management-safety',
  },
  {
    id: 'management-safety', title: 'Segurança para expor risco',
    scenario: 'Uma decisão de prazo produziu risco conhecido e pessoas diferentes possuíam partes da informação antes da falha.', prompt: 'O que acontece quando alguém expõe esse tipo de risco?',
    options: [
      { id: 'risk-changes-decision', label: 'A informação pode mudar escopo, prazo ou apoio; quem trouxe o risco participa da revisão sem sofrer consequência punitiva.', signals: [{ capability: 'organizacao', pattern: 'lideranca-protege-alerta-de-risco', weight: 2, details: ['leadership-management', 'organizational-learning', 'collaboration'], layer: 'consistency' , constraint: 'none' }] },
      { id: 'risk-recorded', label: 'O risco é registrado e escalado, mas compromissos normalmente permanecem até existir evidência mais forte.', signals: [{ capability: 'organizacao', pattern: 'risco-visivel-sem-poder-de-decisao', weight: -1, details: ['leadership-management', 'enabling-governance'], layer: 'system', constraint: 'governance'  }] },
      { id: 'private-warning', label: 'Alertas sensíveis circulam em conversas privadas para evitar conflito, exposição ou interpretação de resistência.', signals: [{ capability: 'organizacao', pattern: 'alerta-de-risco-depende-de-seguranca-pessoal', weight: -2, details: ['leadership-management', 'collaboration'], layer: 'system', constraint: 'culture'  }] },
    ],
  },
  {
    id: 'product-discovery-depth', title: 'Hipótese antes da solução',
    scenario: 'Uma oportunidade relevante chega com uma solução sugerida e prazo desejado, mas comportamento e resultado ainda possuem incerteza.', prompt: 'Como produto costuma reduzir essa incerteza?',
    options: [
      { id: 'problem-evidence', label: 'Problema, público, hipótese e decisão são testados com negócio, tecnologia e pessoas usuárias antes de ampliar a solução.', signals: [{ capability: 'fluxo', pattern: 'discovery-testa-problema-e-decisao', weight: 2, details: ['discovery-validation', 'product-direction', 'planning-refinement', 'domain-alignment'], layer: 'practice' , constraint: 'none' }] },
      { id: 'solution-refinement', label: 'A solução é refinada com tecnologia e qualidade para reduzir risco de implementação e alinhar critérios.', signals: [{ capability: 'fluxo', pattern: 'discovery-refina-solucao-dada', weight: -1, details: ['discovery-validation', 'planning-refinement'], layer: 'practice', constraint: 'process'  }] },
      { id: 'business-request', label: 'A demanda segue porque possui patrocinador e urgência; aprendizado acontece com demonstração ou uso.', signals: [{ capability: 'governanca', pattern: 'discovery-substituida-por-patrocinio', weight: -2, details: ['discovery-validation', 'product-direction'], layer: 'system', constraint: 'governance'  }] },
    ], next: 'product-outcome-depth',
  },
  {
    id: 'product-outcome-depth', title: 'Decisão depois do aprendizado',
    scenario: 'A evidência mostra resultado abaixo do esperado, embora a entrega esteja tecnicamente concluída.', prompt: 'Qual consequência costuma ocorrer?',
    options: [
      { id: 'change-investment', label: 'Produto revisa hipótese e investimento, podendo interromper, reduzir ou mudar a solução.', signals: [{ capability: 'aprendizado', pattern: 'resultado-muda-investimento', weight: 2, details: ['product-direction', 'portfolio-management', 'organizational-learning'], layer: 'outcome' , constraint: 'none' }] },
      { id: 'optimize-feature', label: 'O time recebe ajustes para melhorar adoção, mantendo a direção e compromissos principais.', signals: [{ capability: 'fluxo', pattern: 'resultado-gera-ajuste-sem-revisar-direcao', weight: -1, details: ['product-direction', 'discovery-validation'], layer: 'outcome', constraint: 'process'  }] },
      { id: 'report-result', label: 'O resultado é comunicado; novas prioridades já ocupam a capacidade e a revisão não altera o portfólio.', signals: [{ capability: 'governanca', pattern: 'resultado-sem-efeito-no-portfolio', weight: -2, details: ['product-direction', 'portfolio-management'], layer: 'outcome', constraint: 'governance'  }] },
    ],
  },
  {
    id: 'quality-risk-strategy', title: 'Estratégia de qualidade baseada em risco',
    scenario: 'Uma mudança pequena afeta jornada crítica e outra mudança grande afeta área pouco utilizada.', prompt: 'Como as verificações costumam ser definidas?',
    options: [
      { id: 'risk-shaped', label: 'Risco, impacto e histórico definem combinações de prevenção, testes e observação depois da entrega.', signals: [{ capability: 'qualidade', pattern: 'qualidade-proporcional-ao-risco', weight: 2, details: ['quality-strategy', 'planning-refinement'], layer: 'practice' , constraint: 'none' }] },
      { id: 'standard-suite', label: 'Uma suíte e checklist comuns protegem todas as mudanças, com complementos quando alguém identifica risco especial.', signals: [{ capability: 'qualidade', pattern: 'qualidade-por-suite-padrao', weight: -1, details: ['quality-strategy', 'sdlc-automation'], layer: 'practice', constraint: 'process'  }] },
      { id: 'qa-judgment', label: 'QA define os casos usando experiência e tempo disponível quando recebe a versão.', signals: [{ capability: 'qualidade', pattern: 'estrategia-de-qualidade-concentrada-no-qa', weight: -2, details: ['quality-strategy', 'technical-capability'], layer: 'system', constraint: 'organization'  }] },
    ], next: 'quality-nonfunctional',
  },
  {
    id: 'quality-nonfunctional', title: 'Riscos além do caminho funcional',
    scenario: 'Volume, concorrência, acessibilidade ou falha de dependência podem comprometer a entrega sem quebrar o fluxo funcional principal.', prompt: 'Como esses riscos entram no cotidiano?',
    options: [
      { id: 'continuous-risk-evidence', label: 'Cenários prioritários possuem evidência repetível, limites e responsáveis; resultados alteram desenho e capacidade.', signals: [{ capability: 'qualidade', pattern: 'nao-funcionais-geram-feedback-continuo', weight: 2, details: ['quality-strategy', 'reliability-practice'], layer: 'consistency' , constraint: 'none' }] },
      { id: 'release-campaign', label: 'Testes especializados acontecem antes de grandes releases ou quando o risco é solicitado.', signals: [{ capability: 'qualidade', pattern: 'nao-funcionais-por-campanha', weight: -1, details: ['quality-strategy', 'release-feedback'], layer: 'practice', constraint: 'process'  }] },
      { id: 'incident-learning', label: 'Capacidade e resiliência são revistas principalmente depois de degradação ou incidente.', signals: [{ capability: 'confiabilidade', pattern: 'nao-funcionais-descobertos-em-producao', weight: -2, details: ['quality-strategy', 'reliability-practice'], layer: 'outcome', constraint: 'knowledge'  }] },
    ],
  },
  {
    id: 'engineering-security-depth', title: 'Segurança durante a mudança',
    scenario: 'Uma alteração manipula dado sensível e adiciona dependência externa. O prazo é comum, sem emergência.', prompt: 'Como riscos de segurança entram no fluxo?',
    options: [
      { id: 'threat-and-guardrails', label: 'Ameaças relevantes são discutidas cedo; dependências, segredos e dados recebem controles e feedback automatizado proporcionais.', signals: [{ capability: 'engenharia', pattern: 'seguranca-integrada-a-mudanca', weight: 2, details: ['software-security', 'sdlc-automation', 'technical-capability'], layer: 'practice' , constraint: 'none' }] },
      { id: 'pipeline-scans', label: 'Ferramentas analisam código e dependências; alertas relevantes são tratados antes da liberação.', signals: [{ capability: 'engenharia', pattern: 'seguranca-concentrada-em-scanners', weight: 0, details: ['software-security', 'sdlc-automation'], layer: 'practice' , constraint: 'none' }] },
      { id: 'specialist-review', label: 'O time implementa e aciona segurança quando reconhece sensibilidade ou quando o processo exige revisão.', signals: [{ capability: 'engenharia', pattern: 'seguranca-depende-de-reconhecimento-e-especialista', weight: -2, details: ['software-security', 'technical-capability'], layer: 'system', constraint: 'knowledge'  }] },
    ], next: 'engineering-knowledge-depth',
  },
  {
    id: 'engineering-knowledge-depth', title: 'Capacidade para evoluir o sistema',
    scenario: 'Uma mudança atravessa área pouco conhecida e a pessoa mais experiente não está disponível.', prompt: 'Como o trabalho normalmente avança?',
    options: [
      { id: 'shared-model', label: 'Limites, decisões, exemplos e verificações permitem formar hipótese; colaboração distribui conhecimento durante a mudança.', signals: [{ capability: 'engenharia', pattern: 'conhecimento-distribuido-por-modelo-e-feedback', weight: 2, details: ['technical-capability', 'sustainable-design', 'domain-alignment', 'evolvability', 'collaboration'], layer: 'knowledge' , constraint: 'none' }] },
      { id: 'wait-expert', label: 'O grupo aguarda ou consulta a referência para evitar decisão incompatível com detalhes históricos.', signals: [{ capability: 'engenharia', pattern: 'mudanca-aguarda-especialista', weight: -2, details: ['technical-capability', 'sustainable-design'], layer: 'system', constraint: 'knowledge'  }] },
      { id: 'learn-while-changing', label: 'A pessoa investiga e implementa com revisão posterior; qualidade depende do tempo e de quem estiver disponível.', signals: [{ capability: 'engenharia', pattern: 'aprendizado-tecnico-sem-caminho-repetivel', weight: -1, details: ['technical-capability', 'sustainable-design'], layer: 'knowledge', constraint: 'process'  }] },
    ],
  },
  {
    id: 'platform-cloud-reliability', title: 'Falha de infraestrutura sem acesso artesanal',
    scenario: 'Uma zona, serviço gerenciado ou componente de infraestrutura degrada enquanto a aplicação continua parcialmente disponível.', prompt: 'Como a recuperação costuma ocorrer?',
    options: [
      { id: 'designed-recovery', label: 'O desenho possui limites, redundância e recuperação testada; sinais mostram impacto e acionam resposta reproduzível.', signals: [{ capability: 'plataforma', pattern: 'infraestrutura-recupera-por-desenho-testado', weight: 2, details: ['cloud-reliability', 'reproducible-infrastructure', 'platform-autonomy', 'evolvability'], layer: 'consistency' , constraint: 'none' }] },
      { id: 'provider-runbook', label: 'Runbooks orientam especialistas a redirecionar, escalar ou recriar recursos conforme o evento.', signals: [{ capability: 'plataforma', pattern: 'recuperacao-cloud-depende-de-runbook', weight: -1, details: ['cloud-reliability', 'technical-capability'], layer: 'system', constraint: 'knowledge'  }] },
      { id: 'console-recovery', label: 'Pessoas com acesso ajustam capacidade, rede ou configuração no console até estabilizar.', signals: [{ capability: 'plataforma', pattern: 'recuperacao-cloud-por-console', weight: -2, details: ['cloud-reliability', 'reproducible-infrastructure'], layer: 'system', constraint: 'access'  }] },
    ], next: 'platform-cloud-resilience-validation',
  },
  {
    id: 'platform-cloud-resilience-validation', title: 'Evidência de recuperação',
    scenario: 'O desenho declara tolerância a falha e recuperação, mas dependências e tráfego mudaram desde a última revisão.', prompt: 'Como essa capacidade é validada?',
    options: [
      { id: 'failure-experiments', label: 'Experimentos proporcionais verificam hipóteses, tempo de recuperação e comportamento das dependências; resultados mudam o desenho.', signals: [{ capability: 'confiabilidade', pattern: 'resiliencia-cloud-validada-por-experimento', weight: 2, details: ['cloud-reliability', 'reliability-practice', 'integration-data', 'architecture-decisions'], layer: 'outcome' , constraint: 'none' }] },
      { id: 'documented-design', label: 'Arquitetura e procedimentos são revisados; testes completos ocorrem em exercícios ou auditorias periódicas.', signals: [{ capability: 'confiabilidade', pattern: 'resiliencia-cloud-validada-periodicamente', weight: -1, details: ['cloud-reliability', 'architecture-decisions'], layer: 'consistency', constraint: 'process'  }] },
      { id: 'incident-proof', label: 'A principal evidência é o comportamento observado nos últimos incidentes reais.', signals: [{ capability: 'confiabilidade', pattern: 'incidente-e-unica-evidencia-de-resiliencia', weight: -2, details: ['cloud-reliability', 'incident-management'], layer: 'outcome', constraint: 'process'  }] },
    ], next: 'platform-cloud-efficiency',
  },
  {
    id: 'platform-cloud-efficiency', title: 'Eficiência como decisão arquitetural',
    scenario: 'Custo e consumo cresceram, mas tráfego, criticidade e comportamento variam entre jornadas.', prompt: 'Como otimizações são priorizadas?',
    options: [
      { id: 'unit-economics', label: 'Custo, capacidade, impacto e resultado por jornada orientam trade-offs; otimização é validada sem transferir risco oculto.', signals: [{ capability: 'plataforma', pattern: 'eficiencia-cloud-orientada-a-resultado', weight: 2, details: ['cloud-efficiency', 'product-direction'], layer: 'outcome' , constraint: 'none' }] },
      { id: 'cost-target', label: 'Metas de redução orientam áreas; especialistas encontram recursos ociosos e oportunidades de compromisso.', signals: [{ capability: 'plataforma', pattern: 'eficiencia-cloud-por-meta-de-custo', weight: -1, details: ['cloud-efficiency', 'enabling-governance'], layer: 'system', constraint: 'governance'  }] },
      { id: 'after-bill', label: 'O tema ganha prioridade quando a fatura ou limite de capacidade chama atenção da liderança.', signals: [{ capability: 'plataforma', pattern: 'eficiencia-cloud-reativa-a-fatura', weight: -2, details: ['cloud-efficiency', 'portfolio-management'], layer: 'outcome', constraint: 'process'  }] },
    ], next: 'platform-cloud-sustainability',
  },
  {
    id: 'platform-cloud-sustainability', title: 'Eficiência sustentada no cotidiano',
    scenario: 'Uma otimização reduziu consumo inicialmente, mas produtos, regiões e configurações continuam evoluindo.', prompt: 'Como o resultado permanece saudável?',
    options: [
      { id: 'continuous-guardrails', label: 'Ownership, orçamento, sinais e guardrails acompanham novas mudanças; capacidade e descarte são revistos continuamente.', signals: [{ capability: 'plataforma', pattern: 'eficiencia-cloud-com-ciclo-continuo', weight: 2, details: ['cloud-efficiency', 'reproducible-infrastructure'], layer: 'consistency' , constraint: 'none' }] },
      { id: 'periodic-review', label: 'Relatórios periódicos geram campanhas de ajuste conduzidas por plataforma ou FinOps.', signals: [{ capability: 'plataforma', pattern: 'eficiencia-cloud-por-campanha', weight: -1, details: ['cloud-efficiency', 'organizational-learning'], layer: 'consistency', constraint: 'process'  }] },
      { id: 'local-ownership', label: 'Cada time recebe visibilidade e decide quando otimizar conforme suas prioridades.', signals: [{ capability: 'plataforma', pattern: 'eficiencia-cloud-sem-decisao-compartilhada', weight: -1, details: ['cloud-efficiency', 'team-ownership'], layer: 'system', constraint: 'organization'  }] },
    ],
  },
];

export const graph: AssessmentNode[] = authoredNodes.map(attachObservationalExits);

const skipObservational: Record<string, string> = {
  'ready-to-release': 'integration-cadence',
  'integration-cadence': 'release-control',
  'incident-triage': 'incident-diagnosis',
  'incident-diagnosis': 'incident-remediation',
  'blocked-work': 'decision-context',
  'improvement-loop': 'shared-surface-context',
  'shared-surface-context': 'team-health',
  'shared-surface-risk': 'team-health',
};

function skipEdges(node: AssessmentNode, to: string): AssessmentEdge[] {
  return node.options
    .filter((option) => option.id === CANNOT_OBSERVE_ID || option.id === NOT_APPLICABLE_ID)
    .map((option) => ({ from: node.id, optionId: option.id, to }));
}

export const edges: AssessmentEdge[] = graph.flatMap((node) => {
  if (node.id === 'leadership-enablement') return [
    { from: node.id, to: 'management-portfolio', profile: 'management' },
    { from: node.id, to: 'product-discovery-depth', profile: 'product' },
    { from: node.id, to: 'quality-risk-strategy', profile: 'quality' },
    { from: node.id, to: 'engineering-security-depth', profile: 'engineering' },
    { from: node.id, to: 'platform-cloud-reliability', profile: 'platform' },
  ];
  if (node.id === 'credential-context') return [
    { from: node.id, optionId: 'occurs', to: 'credential-practice' },
    ...skipEdges(node, 'dependency-context'),
  ];
  if (node.id === 'dependency-context') return [
    { from: node.id, optionId: 'occurs', to: 'dependency-practice' },
    ...skipEdges(node, 'incentive-context'),
  ];
  if (node.id === 'incentive-context') return [
    { from: node.id, optionId: 'occurs', to: 'incentive-practice' },
    ...skipEdges(node, 'ai-context'),
  ];
  if (node.id === 'ai-context') return [
    { from: node.id, optionId: 'occurs', to: 'ai-practice' },
    ...skipEdges(node, 'accidental-complexity'),
  ];
  if (node.id === 'ready-to-release') return [
    { from: node.id, optionId: 'small-automated', to: 'integration-cadence' },
    { from: node.id, optionId: 'manual-package', to: 'deployment-probe' },
    { from: node.id, optionId: 'test-queue', to: 'quality-probe' },
    { from: node.id, optionId: 'approval', to: 'governance-probe' },
    ...skipEdges(node, skipObservational[node.id]!),
  ];
  if (node.id === 'integration-cadence') return [
    { from: node.id, optionId: 'integrated-daily', to: 'release-control' },
    { from: node.id, optionId: 'integrated-few-days', to: 'release-control' },
    { from: node.id, optionId: 'isolated-days', to: 'delivery-cause' },
    { from: node.id, optionId: 'coordinated-window', to: 'delivery-cause' },
    ...skipEdges(node, skipObservational[node.id]!),
  ];
  if (node.id === 'incident-triage') return [
    { from: node.id, optionId: 'risk-classified', to: 'incident-diagnosis' },
    { from: node.id, optionId: 'fixed-labels', to: 'incident-diagnosis' },
    { from: node.id, optionId: 'relationship-escalation', to: 'incident-routing-cause' },
    { from: node.id, optionId: 'same-queue', to: 'incident-routing-cause' },
    ...skipEdges(node, skipObservational[node.id]!),
  ];
  if (node.id === 'incident-diagnosis') return [
    { from: node.id, optionId: 'correlated-telemetry', to: 'incident-remediation' },
    { from: node.id, optionId: 'separate-searches', to: 'diagnostic-cause' },
    { from: node.id, optionId: 'direct-runtime-access', to: 'diagnostic-cause' },
    { from: node.id, optionId: 'personal-data-search', to: 'diagnostic-cause' },
    ...skipEdges(node, skipObservational[node.id]!),
  ];
  if (node.id === 'blocked-work') return [
    { from: node.id, optionId: 'team-resolves', to: 'decision-context' },
    { from: node.id, optionId: 'facilitator-chases', to: 'blocked-cause' },
    { from: node.id, optionId: 'waiting-external', to: 'blocked-cause' },
    { from: node.id, optionId: 'local-workaround', to: 'blocked-cause' },
    ...skipEdges(node, skipObservational[node.id]!),
  ];
  if (node.id === 'improvement-loop') return [
    { from: node.id, optionId: 'owned-and-verified', to: 'shared-surface-context' },
    { from: node.id, optionId: 'action-list-fades', to: 'improvement-cause' },
    { from: node.id, optionId: 'ceremony-report', to: 'improvement-cause' },
    { from: node.id, optionId: 'only-after-crisis', to: 'improvement-cause' },
    ...skipEdges(node, skipObservational[node.id]!),
  ];
  if (node.id === 'shared-surface-context') return [
    { from: node.id, optionId: 'single-owner', to: 'team-health' },
    { from: node.id, optionId: 'multiple-teams', to: 'shared-surface-risk' },
    { from: node.id, optionId: 'mixed-boundaries', to: 'shared-surface-risk' },
    { from: node.id, optionId: 'unknown-ownership', to: 'shared-surface-risk' },
    ...skipEdges(node, skipObservational[node.id]!),
  ];
  if (node.id === 'shared-surface-risk') return [
    { from: node.id, optionId: 'early-contract-feedback', to: 'team-health' },
    { from: node.id, optionId: 'overwritten-change', to: 'shared-surface-cause' },
    { from: node.id, optionId: 'late-integration-conflict', to: 'shared-surface-cause' },
    { from: node.id, optionId: 'manual-coordination', to: 'shared-surface-cause' },
    ...skipEdges(node, skipObservational[node.id]!),
  ];
  return node.next ? [{ from: node.id, to: node.next }] : [];
});

export const nodeVariants: NodeVariant[] = [
  { nodeId: 'urgent-change', profile: 'management', scenario: 'Uma necessidade importante surge no meio do ciclo. Pessoas de produto, engenharia e qualidade já assumiram outros compromissos, e as dependências atravessam mais de um time.', prompt: 'Como você normalmente estrutura a decisão e acompanha seu impacto?' },
  { nodeId: 'urgent-change', profile: 'product', scenario: 'Uma necessidade importante surge no meio do ciclo. Ela promete valor, mas compete com hipóteses e entregas já comunicadas; engenharia e qualidade ainda não avaliaram todo o impacto.', prompt: 'Qual descrição mais se aproxima de como a prioridade normalmente muda?' },
  { nodeId: 'urgent-change', profile: 'quality', scenario: 'Uma necessidade importante surge no meio do ciclo. A implementação começa rapidamente, enquanto critérios de risco, dados e regressão ainda precisam ser entendidos.', prompt: 'Como qualidade normalmente entra nessa mudança?' },
  { nodeId: 'urgent-change', profile: 'engineering', scenario: 'Uma necessidade importante surge no meio do ciclo. O time já possui mudanças em andamento e precisa acomodar novo escopo sem perder integração e capacidade de entrega.', prompt: 'Qual descrição mais se aproxima do fluxo real?' },
  { nodeId: 'urgent-change', profile: 'platform', scenario: 'Uma necessidade importante surge no meio do ciclo e depende de capacidade oferecida por plataforma, infraestrutura ou operação, além dos compromissos já assumidos.', prompt: 'Como a nova demanda normalmente atravessa as dependências?' },
  { nodeId: 'degradation', profile: 'management', scenario: 'Depois de uma entrega, parte das pessoas percebe lentidão. Indicadores oscilam, não há falha total e o time precisa decidir se interrompe trabalho planejado.', prompt: 'Que informação normalmente sustenta sua decisão e o espaço dado ao time?' },
  { nodeId: 'degradation', profile: 'quality', scenario: 'Depois de uma entrega, parte das pessoas percebe lentidão. O comportamento não apareceu de forma clara nas verificações anteriores e os indicadores oscilam.', prompt: 'O que mais orienta a investigação e a revisão da estratégia de qualidade?' },
  { nodeId: 'degradation', profile: 'platform', scenario: 'Depois de uma entrega, parte das pessoas percebe lentidão. Sinais de aplicação e infraestrutura oscilam e diferentes grupos observam apenas partes da jornada.', prompt: 'O que mais orienta a primeira decisão operacional?' },
  { nodeId: 'incident-intake', profile: 'management', scenario: 'Um comportamento crítico afeta clientes no horário de maior uso. Você precisa saber impacto, prioridade, responsável e comunicação sem depender de localizar informalmente quem conhece o sistema.', prompt: 'Como a informação normalmente chega até você e mobiliza a resposta?' },
  { nodeId: 'incident-intake', profile: 'product', scenario: 'Um comportamento crítico afeta parte dos clientes. Produto precisa compreender impacto, orientar comunicação e decidir como o incidente altera compromissos em andamento.', prompt: 'Como o evento normalmente ganha prioridade e contexto de negócio?' },
  { nodeId: 'incident-intake', profile: 'quality', scenario: 'Um comportamento crítico escapa das verificações e afeta parte dos clientes. É necessário entender abrangência, condições e quais riscos não estavam visíveis antes.', prompt: 'Como qualidade normalmente entra na detecção e na resposta?' },
  { nodeId: 'incident-intake', profile: 'engineering', scenario: 'Um comportamento crítico afeta parte dos clientes. Você precisa formar uma hipótese, conter impacto e mudar o sistema sem depender de alterar componentes vivos de modo irreproduzível.', prompt: 'Como o incidente normalmente chega ao time e começa a ser investigado?' },
  { nodeId: 'incident-intake', profile: 'platform', scenario: 'Um comportamento crítico atravessa aplicação, dados e infraestrutura. Sinais e responsabilidades estão distribuídos e a resposta precisa preservar segurança operacional.', prompt: 'Como o evento normalmente é detectado, correlacionado e direcionado?' },
  { nodeId: 'product-outcome-evidence', profile: 'management', scenario: 'Uma entrega relevante consumiu capacidade de várias áreas. Agora você precisa decidir continuidade, expansão ou interrupção diante de novas prioridades.', prompt: 'Que evidência normalmente muda a decisão de investimento?' },
  { nodeId: 'product-outcome-evidence', profile: 'product', scenario: 'Uma hipótese relevante foi entregue e já possui uso suficiente para revisar valor, comportamento e efeitos não esperados.', prompt: 'Como o aprendizado normalmente retorna ao portfólio?' },
  { nodeId: 'product-outcome-evidence', profile: 'engineering', scenario: 'Uma funcionalidade relevante está em uso. Novas mudanças técnicas competem com ajustes necessários para produzir o resultado esperado.', prompt: 'Como evidência de resultado costuma alterar o trabalho técnico seguinte?' },
  { nodeId: 'technical-stewardship', profile: 'quality', scenario: 'Uma área muda com frequência, concentra escapes e torna a regressão cada vez mais custosa. A próxima entrega tocará novamente esse código.', prompt: 'Como qualidade participa da redução sustentável desse risco?' },
  { nodeId: 'technical-stewardship', profile: 'engineering', scenario: 'Uma área muda com frequência, concentra defeitos e depende de poucas pessoas. A próxima alteração precisa entregar valor sem ampliar o custo futuro.', prompt: 'Como o grupo normalmente trata essa condição durante a mudança?' },
  { nodeId: 'data-contract-change', profile: 'product', scenario: 'Uma evolução de comportamento depende de dados e contratos usados por outras jornadas. Uma migração incompatível pode afetar clientes fora do escopo visível.', prompt: 'Como risco e sequência normalmente entram na decisão de produto?' },
  { nodeId: 'data-contract-change', profile: 'engineering', scenario: 'Um contrato ou schema precisa evoluir enquanto consumidores e versões anteriores continuam ativos.', prompt: 'Como compatibilidade e remoção normalmente são conduzidas?' },
  { nodeId: 'data-contract-change', profile: 'platform', scenario: 'Dados e contratos atravessam componentes com ciclos independentes, e a plataforma pode ou não oferecer verificação e migração reproduzíveis.', prompt: 'Como a mudança normalmente atravessa esses limites?' },
  { nodeId: 'reliability-objective', profile: 'management', scenario: 'Confiabilidade compete com novas entregas e o impacto varia por horário e grupo de clientes. Você precisa decidir capacidade e risco aceitável.', prompt: 'Como a organização normalmente sustenta essa decisão?' },
  { nodeId: 'reliability-objective', profile: 'product', scenario: 'Parte dos clientes percebe degradação intermitente enquanto a demanda por novas funcionalidades continua.', prompt: 'Como experiência, risco e prioridade normalmente são equilibrados?' },
  { nodeId: 'reliability-objective', profile: 'engineering', scenario: 'Falhas e latência variam pela distribuição; médias parecem aceitáveis, mas uma parte da jornada continua degradada.', prompt: 'Como o time decide se deve mudar o sistema e se a mudança funcionou?' },
  { nodeId: 'reliability-objective', profile: 'platform', scenario: 'Sinais de aplicação e infraestrutura possuem distribuições diferentes e precisam orientar capacidade, confiabilidade e ritmo de mudança.', prompt: 'Como esses sinais normalmente se tornam uma decisão compartilhada?' },
  { nodeId: 'leadership-enablement', profile: 'management', scenario: 'Um gargalo sistêmico atravessa times e políticas e não pode ser resolvido pela otimização isolada de uma squad.', prompt: 'Como você normalmente cria ownership, capacidade e aprendizado para removê-lo?' },
  { nodeId: 'leadership-enablement', profile: 'engineering', scenario: 'O time reconhece um gargalo recorrente, mas decisões e capacidade necessárias estão além da sua autonomia.', prompt: 'Como a liderança normalmente transforma essa evidência em mudança do sistema?' },
  { nodeId: 'leadership-enablement', profile: 'platform', scenario: 'Vários times esbarram na mesma capacidade ausente e a plataforma precisa evoluir sem virar apenas uma fila central.', prompt: 'Como liderança e times normalmente convertem a demanda recorrente em capacidade compartilhada?' },
];
