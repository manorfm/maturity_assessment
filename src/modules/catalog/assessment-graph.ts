export const GRAPH_VERSION = 'delivery-observability-v1';

export type Profile = 'management' | 'product' | 'quality' | 'engineering' | 'platform';
export type Signal = { capability: string; pattern: string; weight: number };
export type Option = { id: string; label: string; signals: Signal[] };
export type AssessmentNode = {
  id: string;
  title: string;
  scenario: string;
  prompt: string;
  options: Option[];
  next?: string;
};

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
    next: 'degradation',
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

