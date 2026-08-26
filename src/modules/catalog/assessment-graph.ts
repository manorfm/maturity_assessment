export const GRAPH_VERSION = 'delivery-observability-v1';

export type Profile = 'management' | 'product' | 'quality' | 'engineering' | 'platform';
export type Signal = { capability: string; pattern: string; weight: number };
export type Option = { id: string; label: string; signals: Signal[] };
export type AssessmentNode = {
  id: string;
  type?: 'scenario' | 'probe';
  title: string;
  scenario: string;
  prompt: string;
  options: Option[];
  next?: string;
};

export type AssessmentEdge = { from: string; to: string; optionId?: string };

export const profiles: Record<Profile, string> = {
  management: 'Gestão', product: 'Produto', quality: 'Qualidade / QA',
  engineering: 'Engenharia', platform: 'Plataforma / SRE / Infraestrutura',
};

export const graph: AssessmentNode[] = [
  {
    id: 'urgent-change',
    title: 'Uma necessidade urgente',
    scenario: 'Uma necessidade importante surge no meio do ciclo e precisa atravessar produto, engenharia e qualidade. O prazo original continua sendo cobrado.',
    prompt: 'Qual descrição mais se aproxima do que normalmente acontece?',
    options: [
      { id: 'replan-together', label: 'As pessoas afetadas reavaliam risco, capacidade e escopo juntas; algo explícito deixa de ser feito.', signals: [{ capability: 'fluxo', pattern: 'feedback-integrado', weight: 2 }] },
      { id: 'add-to-sprint', label: 'O trabalho entra como prioridade adicional e cada etapa tenta absorvê-lo sem alterar o compromisso anterior.', signals: [{ capability: 'fluxo', pattern: 'sobrecarga-silenciosa', weight: -2 }] },
      { id: 'manager-coordinates', label: 'Uma liderança reorganiza a sequência e negocia separadamente com cada área para viabilizar a entrega.', signals: [{ capability: 'organizacao', pattern: 'coordenacao-centralizada', weight: -1 }] },
      { id: 'depends', label: 'Varia muito; não há um modo previsível de decidir e normalmente descobrimos o impacto durante a execução.', signals: [{ capability: 'governanca', pattern: 'decisao-opaca', weight: -2 }] },
    ],
    next: 'shared-change',
  },
  {
    id: 'shared-change',
    title: 'Uma mudança atravessa times',
    scenario: 'Duas partes da mesma entrega, conduzidas por grupos diferentes, alteram comportamentos que precisam funcionar juntos.',
    prompt: 'Em que momento as mudanças normalmente se encontram de verdade?',
    options: [
      { id: 'continuous', label: 'Ao longo do desenvolvimento, com uma versão reproduzível e verificações frequentes entre as partes.', signals: [{ capability: 'engenharia', pattern: 'integracao-frequente', weight: 2 }] },
      { id: 'before-release', label: 'Pouco antes da liberação, quando todas as partes são reunidas em um ambiente comum.', signals: [{ capability: 'engenharia', pattern: 'integracao-tardia', weight: -2 }] },
      { id: 'coordination', label: 'Quando responsáveis combinam manualmente versões, ordem e janelas para testar em conjunto.', signals: [{ capability: 'arquitetura', pattern: 'dependencia-coordenada', weight: -2 }] },
      { id: 'production', label: 'Frequentemente apenas depois da liberação ou quando alguém relata um comportamento inesperado.', signals: [{ capability: 'confiabilidade', pattern: 'feedback-em-producao', weight: -3 }] },
    ],
    next: 'ready-to-release',
  },
  {
    id: 'ready-to-release',
    title: 'Pronto para entregar',
    scenario: 'A alteração foi considerada pronta pelo desenvolvimento. Agora ela precisa chegar com segurança às pessoas usuárias.',
    prompt: 'Onde costuma estar a maior parte do tempo até a mudança operar?',
    options: [
      { id: 'small-automated', label: 'O fluxo é curto e repetível; a maior espera é uma decisão consciente de produto ou risco.', signals: [{ capability: 'entrega', pattern: 'entrega-repetivel', weight: 2 }] },
      { id: 'manual-package', label: 'Em preparar, conferir ou transportar versões e configurações entre ambientes.', signals: [{ capability: 'entrega', pattern: 'empacotamento-manual', weight: -2 }] },
      { id: 'test-queue', label: 'Na fila de regressão, obtenção de dados de teste ou disponibilidade de ambiente e pessoas.', signals: [{ capability: 'qualidade', pattern: 'qualidade-como-fase', weight: -2 }] },
      { id: 'approval', label: 'Em aprovações e permissões cujo tempo varia e cuja decisão raramente muda com novas evidências.', signals: [{ capability: 'governanca', pattern: 'controle-sem-feedback', weight: -2 }] },
    ],
  },
  {
    id: 'deployment-probe', type: 'probe', title: 'Como a versão é preparada?',
    scenario: 'Pensando na última entrega que exigiu preparação manual, considere quem executou os passos e como uma segunda pessoa conseguiria repeti-los.',
    prompt: 'Qual descrição é mais próxima da realidade?',
    options: [
      { id: 'shared-script', label: 'Existe uma automação mantida pelo time, usada de forma consistente e verificada a cada mudança.', signals: [{ capability: 'entrega', pattern: 'automacao-local-consistente', weight: 1 }] },
      { id: 'local-script', label: 'Uma pessoa ou grupo criou scripts que ajudam, mas adoção, suporte e comportamento variam.', signals: [{ capability: 'plataforma', pattern: 'solucao-local-nao-difundida', weight: -1 }] },
      { id: 'runbook', label: 'Há instruções; a execução depende de atenção, acesso e conhecimento de quem está disponível.', signals: [{ capability: 'entrega', pattern: 'operacao-manual-fragil', weight: -2 }] },
      { id: 'memory', label: 'Os passos são conhecidos principalmente por experiência e são ajustados durante a execução.', signals: [{ capability: 'entrega', pattern: 'dependencia-de-heroi', weight: -2 }] },
    ], next: 'degradation',
  },
  {
    id: 'quality-probe', type: 'probe', title: 'De onde vem a espera de qualidade?',
    scenario: 'Uma mudança aguarda validação enquanto novas alterações continuam chegando. Considere dados, ambiente, critérios e divisão de responsabilidade.',
    prompt: 'Qual fator costuma tornar essa espera mais difícil de reduzir?',
    options: [
      { id: 'risk-together', label: 'O risco é discutido cedo e as verificações evoluem junto; a espera ocorre apenas em casos excepcionais.', signals: [{ capability: 'qualidade', pattern: 'qualidade-compartilhada', weight: 2 }] },
      { id: 'data-environment', label: 'Preparar massa e ambiente confiáveis consome grande parte do tempo e exige intervenção.', signals: [{ capability: 'qualidade', pattern: 'dados-de-teste-fragil', weight: -2 }] },
      { id: 'regression', label: 'A regressão cresceu e precisa ser repetida manualmente porque mudanças novas podem afetar áreas antigas.', signals: [{ capability: 'qualidade', pattern: 'regressao-crescente', weight: -2 }] },
      { id: 'late-context', label: 'Critérios, riscos ou contexto chegam quando a implementação já está pronta.', signals: [{ capability: 'fluxo', pattern: 'qualidade-tardia', weight: -2 }] },
    ], next: 'degradation',
  },
  {
    id: 'governance-probe', type: 'probe', title: 'O que a aprovação protege?',
    scenario: 'Uma entrega de baixo impacto aguarda a mesma aprovação aplicada a mudanças críticas. Uma exceção exigiria outra cadeia de decisão.',
    prompt: 'Como o controle costuma reagir a evidências de risco diferentes?',
    options: [
      { id: 'proportional', label: 'Critérios explícitos mudam o caminho; casos seguros fluem com guardrails e exceções deixam trilha.', signals: [{ capability: 'governanca', pattern: 'governanca-proporcional', weight: 2 }] },
      { id: 'same-flow', label: 'O caminho é praticamente igual para todos; isso simplifica a política, embora gere espera.', signals: [{ capability: 'governanca', pattern: 'controle-indiferenciado', weight: -2 }] },
      { id: 'relationship', label: 'A velocidade depende de conhecer responsáveis, explicar urgência e conseguir prioridade.', signals: [{ capability: 'governanca', pattern: 'governanca-relacional', weight: -2 }] },
      { id: 'unclear', label: 'É difícil explicar qual risco cada aprovação reduz ou quais evidências mudariam a decisão.', signals: [{ capability: 'governanca', pattern: 'controle-sem-proposito', weight: -2 }] },
    ], next: 'degradation',
  },
  {
    id: 'degradation',
    title: 'Degradação parcial',
    scenario: 'Depois de uma entrega, uma parte das pessoas percebe lentidão. Os indicadores oscilam e não há falha total.',
    prompt: 'O que mais orienta a primeira decisão?',
    options: [
      { id: 'impact-change', label: 'Impacto nas pessoas, mudança recente e incerteza; mitigamos de modo reversível enquanto investigamos.', signals: [{ capability: 'observabilidade', pattern: 'sinal-orientado-impacto', weight: 2 }] },
      { id: 'threshold', label: 'Se algum indicador ultrapassou um limite fixo; abaixo dele, normalmente aguardamos mais evidências.', signals: [{ capability: 'observabilidade', pattern: 'limiar-sem-contexto', weight: -1 }] },
      { id: 'specialist', label: 'A experiência de quem conhece melhor o sistema; essa pessoa decide quais dados procurar.', signals: [{ capability: 'confiabilidade', pattern: 'dependencia-de-heroi', weight: -2 }] },
      { id: 'customer-volume', label: 'O volume de reclamações; sem ele é difícil saber se a oscilação merece interromper a entrega.', signals: [{ capability: 'observabilidade', pattern: 'deteccao-tardia', weight: -2 }] },
    ],
    next: 'recurrence',
  },
  {
    id: 'recurrence',
    title: 'O problema retorna',
    scenario: 'Um problema parecido ocorre novamente meses depois. A ocorrência anterior havia gerado ações e discussões.',
    prompt: 'Qual resultado é mais comum após a primeira ocorrência?',
    options: [
      { id: 'system-change', label: 'Mudamos o sistema de trabalho ou produto, definimos um sinal de sucesso e depois verificamos o efeito.', signals: [{ capability: 'aprendizado', pattern: 'aprendizado-fechado', weight: 2 }] },
      { id: 'action-list', label: 'Criamos uma lista de ações; algumas entram no planejamento e outras perdem prioridade com o tempo.', signals: [{ capability: 'aprendizado', pattern: 'acao-sem-fechamento', weight: -1 }] },
      { id: 'documentation', label: 'Atualizamos documentação ou orientação para que as pessoas saibam reagir mais rápido na próxima vez.', signals: [{ capability: 'confiabilidade', pattern: 'mitigacao-sem-prevencao', weight: -1 }] },
      { id: 'local-fix', label: 'Uma pessoa ou time cria uma automação local que ajuda naquele contexto, mas não se espalha facilmente.', signals: [{ capability: 'plataforma', pattern: 'solucao-local-nao-difundida', weight: -1 }] },
    ],
  },
];

export const nodeById = (nodeId: string): AssessmentNode | undefined => graph.find((node) => node.id === nodeId);

export const edges: AssessmentEdge[] = graph.flatMap((node) => {
  if (node.id === 'ready-to-release') return [
    { from: node.id, optionId: 'small-automated', to: 'degradation' },
    { from: node.id, optionId: 'manual-package', to: 'deployment-probe' },
    { from: node.id, optionId: 'test-queue', to: 'quality-probe' },
    { from: node.id, optionId: 'approval', to: 'governance-probe' },
  ];
  return node.next ? [{ from: node.id, to: node.next }] : [];
});
