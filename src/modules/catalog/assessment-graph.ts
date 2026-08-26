export const GRAPH_VERSION = 'sdlc-interview-v3';

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
export type NodeVariant = { nodeId: string; profile: Profile; title?: string; scenario: string; prompt?: string };

export const profiles: Record<Profile, string> = {
  management: 'Gestão', product: 'Produto', quality: 'Qualidade / QA',
  engineering: 'Engenharia', platform: 'Plataforma / SRE / Infraestrutura',
};

export const graph: AssessmentNode[] = [
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
    next: 'recent-need',
  },
  {
    id: 'recent-need', title: 'Da necessidade ao primeiro feedback',
    scenario: 'Pense em uma necessidade recente que parecia importante quando chegou. Antes de uma solução completa ficar pronta, havia incertezas sobre valor e impacto técnico.',
    prompt: 'Como essa incerteza normalmente diminui no trabalho real?',
    options: [
      { id: 'small-evidence', label: 'Produto, engenharia e outras especialidades testam a menor hipótese útil cedo e mudam direção com a evidência.', signals: [{ capability: 'fluxo', pattern: 'descoberta-integrada', weight: 2 }] },
      { id: 'defined-then-built', label: 'A necessidade é detalhada e aprovada antes de chegar às especialidades que construirão e operarão a solução.', signals: [{ capability: 'fluxo', pattern: 'cascata-fracionada', weight: -2 }] },
      { id: 'demo-feedback', label: 'O principal feedback conjunto ocorre em demonstrações, quando uma parte relevante da solução já foi construída.', signals: [{ capability: 'aprendizado', pattern: 'feedback-tardio', weight: -1 }] },
      { id: 'deadline-validates', label: 'O prazo define o que será feito; valor e impacto são avaliados principalmente depois da entrega.', signals: [{ capability: 'governanca', pattern: 'prazo-sem-aprendizado', weight: -2 }] },
    ], next: 'change-verification',
  },
  {
    id: 'change-verification', title: 'Feedback durante a construção',
    scenario: 'Uma mudança pequena toca uma regra antiga e pode afetar mais de uma jornada. Considere o período entre a primeira alteração e a confiança para integrá-la.',
    prompt: 'De onde costuma vir o feedback mais rápido e confiável?',
    options: [
      { id: 'repeatable-checks', label: 'Verificações rápidas e repetíveis acompanham a mudança; riscos novos são discutidos e cobertos conforme aparecem.', signals: [{ capability: 'engenharia', pattern: 'feedback-tecnico-rapido', weight: 2 }] },
      { id: 'qa-cycle', label: 'Uma pessoa de qualidade executa a maior parte das verificações quando recebe uma versão e um ambiente utilizável.', signals: [{ capability: 'qualidade', pattern: 'qualidade-como-handoff', weight: -2 }] },
      { id: 'developer-memory', label: 'Quem alterou valida os casos que conhece; outros efeitos aparecem na revisão, regressão ou uso posterior.', signals: [{ capability: 'engenharia', pattern: 'verificacao-dependente-de-memoria', weight: -2 }] },
      { id: 'slow-suite', label: 'Há verificações automatizadas, mas o retorno demora ou varia tanto que frequentemente seguimos sem esperar.', signals: [{ capability: 'engenharia', pattern: 'automacao-sem-feedback', weight: -1 }] },
    ], next: 'environment-access',
  },
  {
    id: 'environment-access', title: 'Um ambiente para aprender',
    scenario: 'O time precisa reproduzir uma condição, validar integração e colocar uma alteração em um ambiente seguro. A necessidade não estava planejada.',
    prompt: 'Como isso normalmente acontece do pedido ao primeiro uso?',
    options: [
      { id: 'self-service', label: 'Um caminho suportado cria configuração reproduzível com limites de segurança, retorno rápido e remoção prevista.', signals: [{ capability: 'plataforma', pattern: 'self-service-com-guardrails', weight: 2 }] },
      { id: 'ticket-queue', label: 'Abre-se uma solicitação e o trabalho aguarda disponibilidade, esclarecimentos e execução de outro grupo.', signals: [{ capability: 'plataforma', pattern: 'provisionamento-em-fila', weight: -2 }] },
      { id: 'manual-access', label: 'Pessoas experientes combinam acessos e ajustam recursos existentes até a validação se tornar possível.', signals: [{ capability: 'governanca', pattern: 'acesso-artesanal', weight: -2 }] },
      { id: 'shared-drift', label: 'Usa-se um ambiente compartilhado; diferenças e concorrência são resolvidas durante a execução.', signals: [{ capability: 'confiabilidade', pattern: 'ambiente-inconsistente', weight: -2 }] },
    ], next: 'security-change',
  },
  {
    id: 'security-change', title: 'Uma mudança com risco diferente',
    scenario: 'Uma alteração de baixo impacto e outra que toca dados sensíveis avançam na mesma semana. Ambas precisam demonstrar que podem operar com segurança.',
    prompt: 'Como os controles costumam participar dessas mudanças?',
    options: [
      { id: 'risk-guardrails', label: 'Risco muda o caminho; controles repetíveis dão retorno durante o trabalho e especialistas entram onde julgamento é necessário.', signals: [{ capability: 'plataforma', pattern: 'seguranca-habilitadora', weight: 2 }] },
      { id: 'late-review', label: 'A revisão especializada ocorre perto da liberação e pode devolver a mudança para etapas anteriores.', signals: [{ capability: 'governanca', pattern: 'seguranca-tardia', weight: -2 }] },
      { id: 'same-checklist', label: 'As duas seguem a mesma lista e aprovações; cumprir o processo é a principal evidência disponível.', signals: [{ capability: 'governanca', pattern: 'controle-indiferenciado', weight: -2 }] },
      { id: 'team-best-effort', label: 'O time aplica o que conhece e procura ajuda quando percebe algo fora do comum.', signals: [{ capability: 'engenharia', pattern: 'competencia-de-seguranca-inacessivel', weight: -1 }] },
    ], next: 'architecture-pressure',
  },
  {
    id: 'architecture-pressure', title: 'Mudança além de uma fronteira',
    scenario: 'Uma regra muda com frequência e agora exige alterações coordenadas em componentes mantidos por grupos diferentes. O custo vem crescendo a cada entrega.',
    prompt: 'O que normalmente acontece quando esse padrão fica visível?',
    options: [
      { id: 'measure-and-adjust', label: 'Os grupos tornam o custo observável, testam uma fronteira ou contrato menor e acompanham se a coordenação diminui.', signals: [{ capability: 'arquitetura', pattern: 'arquitetura-evolutiva', weight: 2 }] },
      { id: 'planning-sync', label: 'Aumentam alinhamentos, calendário e responsáveis para coordenar melhor a estrutura existente.', signals: [{ capability: 'arquitetura', pattern: 'acoplamento-coordenado', weight: -1 }] },
      { id: 'architecture-project', label: 'A solução aguarda uma iniciativa maior de arquitetura enquanto entregas continuam usando contornos locais.', signals: [{ capability: 'arquitetura', pattern: 'evolucao-em-grande-lote', weight: -2 }] },
      { id: 'ownership-dispute', label: 'A prioridade varia conforme quem sofre o impacto e quem possui autoridade sobre cada componente.', signals: [{ capability: 'organizacao', pattern: 'ownership-fragmentado', weight: -2 }] },
    ], next: 'team-pressure',
  },
  {
    id: 'team-pressure', title: 'Pressão, conflito e aprendizado',
    scenario: 'Após uma falha relevante, há pressão por explicações. Decisões envolveram prazo, produto, código, controles e operação; nenhuma pessoa viu a cadeia inteira.',
    prompt: 'Como a organização costuma conduzir os dias seguintes?',
    options: [
      { id: 'system-learning', label: 'Reconstrói condições e decisões sem buscar culpado, protege relatos difíceis e muda o sistema com responsáveis e sinais de efeito.', signals: [{ capability: 'organizacao', pattern: 'aprendizado-blameless', weight: 2 }] },
      { id: 'accountability-person', label: 'Identifica quem deveria ter evitado a falha e reforça revisão, atenção ou aprovação nessa etapa.', signals: [{ capability: 'organizacao', pattern: 'culpa-e-controle', weight: -2 }] },
      { id: 'private-resolution', label: 'Lideranças e especialistas resolvem o caso em um grupo pequeno para reduzir exposição e recuperar a entrega.', signals: [{ capability: 'aprendizado', pattern: 'aprendizado-restrito', weight: -2 }] },
      { id: 'move-on', label: 'Corrige o efeito imediato; com a pressão seguinte, a análise mais ampla perde prioridade.', signals: [{ capability: 'confiabilidade', pattern: 'incidente-sem-aprendizado', weight: -2 }] },
    ],
  },
];

export const edges: AssessmentEdge[] = graph.flatMap((node) => {
  if (node.id === 'ready-to-release') return [
    { from: node.id, optionId: 'small-automated', to: 'degradation' },
    { from: node.id, optionId: 'manual-package', to: 'deployment-probe' },
    { from: node.id, optionId: 'test-queue', to: 'quality-probe' },
    { from: node.id, optionId: 'approval', to: 'governance-probe' },
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
];
