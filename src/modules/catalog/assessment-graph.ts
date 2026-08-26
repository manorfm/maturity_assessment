export const GRAPH_VERSION = 'capability-drilldown-v7';

export type Profile = 'management' | 'product' | 'quality' | 'engineering' | 'platform';
export type Signal = { capability: string; pattern: string; weight: number };
export type Option = { id: string; label: string; signals: Signal[] };
export type AssessmentNode = {
  id: string;
  type?: 'context' | 'scenario' | 'probe';
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
    ], next: 'integration-cadence',
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
    ], next: 'integration-cadence',
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
    ], next: 'integration-cadence',
  },
  {
    id: 'integration-cadence', type: 'probe', title: 'Quanto tempo a mudança fica isolada?',
    scenario: 'Pense na última alteração comum, sem emergência. Considere desde o primeiro código utilizável até ele encontrar a versão compartilhada e receber verificações do restante do produto.',
    prompt: 'Qual descrição representa melhor essa integração no dia a dia?',
    options: [
      { id: 'integrated-daily', label: 'Mudanças pequenas encontram a versão compartilhada no mesmo dia; verificações rápidas protegem o fluxo e falhas são corrigidas antes de acumular.', signals: [{ capability: 'engenharia', pattern: 'integracao-continua-validada', weight: 2 }] },
      { id: 'integrated-few-days', label: 'A integração ocorre em poucos dias e geralmente exige estabilização curta antes de outras mudanças seguirem.', signals: [{ capability: 'engenharia', pattern: 'integracao-frequente-fragil', weight: 1 }] },
      { id: 'isolated-days', label: 'Mudanças ficam isoladas por vários dias ou semanas e encontram conflitos, regressões ou decisões divergentes ao final.', signals: [{ capability: 'engenharia', pattern: 'mudanca-isolada', weight: -2 }] },
      { id: 'coordinated-window', label: 'A integração depende de uma janela, versão ou combinação coordenada entre responsáveis e ambientes.', signals: [{ capability: 'entrega', pattern: 'integracao-por-janela', weight: -2 }] },
    ],
  },
  {
    id: 'delivery-cause', type: 'probe', title: 'O que mantém a mudança isolada?',
    scenario: 'A integração tardia reaparece mesmo quando as pessoas tentam antecipá-la. Considere o impedimento que permanece após uma tentativa concreta de reduzir o intervalo.',
    prompt: 'Qual causa provável explica melhor a recorrência?',
    options: [
      { id: 'tooling-gap', label: 'O retorno automatizado é lento, instável ou incompleto; integrar cedo interrompe o trabalho sem produzir confiança.', signals: [{ capability: 'engenharia', pattern: 'causa-ferramental-feedback', weight: -1 }] },
      { id: 'process-policy', label: 'Política, revisão ou processo exige acumular escopo ou aguardar uma etapa antes de compartilhar a mudança.', signals: [{ capability: 'governanca', pattern: 'causa-processo-lote', weight: -1 }] },
      { id: 'team-boundary', label: 'Responsabilidades e prioridades atravessam times; ninguém consegue concluir a integração sem coordenar agendas.', signals: [{ capability: 'organizacao', pattern: 'causa-fronteira-times', weight: -1 }] },
      { id: 'architecture-coupling', label: 'O sistema exige alterar e validar muitas partes juntas; uma mudança pequena não permanece pequena.', signals: [{ capability: 'arquitetura', pattern: 'causa-acoplamento-entrega', weight: -1 }] },
    ], next: 'release-control',
  },
  {
    id: 'release-control', type: 'probe', title: 'Implantar e liberar são a mesma decisão?',
    scenario: 'Uma alteração passou pelas verificações e pode chegar ao ambiente real, mas produto ainda quer controlar quando e para quem o comportamento ficará disponível.',
    prompt: 'Como essa separação costuma funcionar de verdade?',
    options: [
      { id: 'decoupled-observed', label: 'A versão pode operar desativada ou com exposição gradual; há responsável, validade do controle, observação de impacto e remoção posterior.', signals: [{ capability: 'entrega', pattern: 'deploy-release-desacoplados', weight: 2 }] },
      { id: 'toggle-permanent', label: 'É possível ativar separadamente, mas controles antigos, combinações e responsáveis tendem a se acumular.', signals: [{ capability: 'entrega', pattern: 'controles-de-release-acumulados', weight: 0 }] },
      { id: 'deploy-is-release', label: 'Colocar a versão no ambiente já disponibiliza o comportamento; risco é controlado principalmente antes desse momento.', signals: [{ capability: 'entrega', pattern: 'deploy-igual-release', weight: -1 }] },
      { id: 'release-train', label: 'Mudanças prontas aguardam uma versão ou janela conjunta para serem disponibilizadas.', signals: [{ capability: 'entrega', pattern: 'release-em-lote', weight: -2 }] },
    ], next: 'release-validation',
  },
  {
    id: 'release-validation', type: 'probe', title: 'Quando a pressão aumenta',
    scenario: 'Uma correção importante precisa sair no mesmo dia. O fluxo habitual parece maduro, mas esperar todas as verificações ameaça o prazo.',
    prompt: 'O que normalmente acontece nessa situação recente e concreta?',
    options: [
      { id: 'safe-fast-path', label: 'O mesmo caminho automatizado suporta uma mudança pequena, exposição controlada, sinais de impacto e reversão rápida.', signals: [{ capability: 'entrega', pattern: 'fluxo-seguro-sob-pressao', weight: 2 }] },
      { id: 'manual-fast-path', label: 'Existe um caminho de exceção com ações manuais e aprovação explícita; depois a equipe reconcilia e revisa o ocorrido.', signals: [{ capability: 'governanca', pattern: 'excecao-controlada', weight: 0 }] },
      { id: 'bypass-under-pressure', label: 'Verificações ou etapas são contornadas por pessoas experientes para ganhar tempo e corrigidas posteriormente.', signals: [{ capability: 'entrega', pattern: 'maturidade-nao-resiste-urgencia', weight: -2 }] },
      { id: 'wait-specialists', label: 'A entrega aguarda especialistas, acessos ou uma janela segura, mesmo com impacto crescente.', signals: [{ capability: 'plataforma', pattern: 'dependencia-operacional-sob-urgencia', weight: -2 }] },
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
    next: 'incident-intake',
  },
  {
    id: 'incident-intake', title: 'O incidente se torna visível',
    scenario: 'Um comportamento crítico afeta parte das pessoas durante o horário de maior uso. Pense no último evento real que exigiu interromper trabalho planejado.',
    prompt: 'Como o grupo responsável normalmente percebe e assume esse evento?',
    options: [
      { id: 'impact-routed', label: 'Um sinal ligado ao impacto aciona responsáveis definidos, reúne contexto inicial e confirma rapidamente quem conduz comunicação e resposta.', signals: [{ capability: 'confiabilidade', pattern: 'incidente-orientado-impacto', weight: 2 }] },
      { id: 'central-screening', label: 'Uma central ou sustentação recebe, registra e tenta resolver antes de encaminhar ao time que mantém o produto.', signals: [{ capability: 'organizacao', pattern: 'incidente-por-handoff', weight: -1 }] },
      { id: 'customer-report', label: 'Atendimento ou negócio relata casos até que alguém reconheça abrangência suficiente para mobilizar o time.', signals: [{ capability: 'observabilidade', pattern: 'incidente-detectado-por-cliente', weight: -2 }] },
      { id: 'author-contacted', label: 'Procuram primeiro quem fez a mudança ou quem conhece melhor o componente afetado.', signals: [{ capability: 'organizacao', pattern: 'incidente-depende-do-autor', weight: -2 }] },
    ], next: 'incident-triage',
  },
  {
    id: 'incident-triage', type: 'probe', title: 'Severidade e roteamento',
    scenario: 'O impacto ainda está evoluindo e diferentes áreas precisam decidir prioridade, comunicação e quem será mobilizado.',
    prompt: 'O que normalmente determina o caminho do incidente?',
    options: [
      { id: 'risk-classified', label: 'Critérios de impacto, abrangência e urgência são conhecidos; a classificação muda resposta e comunicação e pode ser revisada com evidências.', signals: [{ capability: 'governanca', pattern: 'severidade-operacional', weight: 2 }] },
      { id: 'fixed-labels', label: 'Existem categorias e procedimentos, mas a classificação depende bastante da interpretação de quem recebe.', signals: [{ capability: 'governanca', pattern: 'severidade-inconsistente', weight: -1 }] },
      { id: 'relationship-escalation', label: 'A prioridade cresce quando alguém com influência encontra e aciona as pessoas certas.', signals: [{ capability: 'organizacao', pattern: 'incidente-por-escalada-relacional', weight: -2 }] },
      { id: 'same-queue', label: 'O evento entra na fila comum e o time decide urgência quando consegue analisar o caso.', signals: [{ capability: 'fluxo', pattern: 'incidente-na-fila-de-trabalho', weight: -2 }] },
    ],
  },
  {
    id: 'incident-routing-cause', type: 'probe', title: 'Por que o roteamento depende de pessoas?',
    scenario: 'Casos semelhantes percorrem caminhos diferentes e consomem tempo até encontrar quem consegue agir.',
    prompt: 'Qual condição mais sustenta essa variação?',
    options: [
      { id: 'unclear-ownership', label: 'Serviços e jornadas não possuem responsabilidade operacional clara ou atualizada.', signals: [{ capability: 'organizacao', pattern: 'causa-ownership-operacional', weight: -1 }] },
      { id: 'impact-unknown', label: 'Não há informação suficiente para relacionar sintomas técnicos, clientes afetados e criticidade.', signals: [{ capability: 'observabilidade', pattern: 'causa-impacto-invisivel', weight: -1 }] },
      { id: 'support-boundary', label: 'A estrutura separa sustentação e desenvolvimento, mas transferência de contexto e autoridade é lenta.', signals: [{ capability: 'organizacao', pattern: 'causa-fronteira-sustentacao', weight: -1 }] },
      { id: 'classification-policy', label: 'A política existe, porém categorias e respostas não refletem o risco real dos produtos.', signals: [{ capability: 'governanca', pattern: 'causa-politica-incidente', weight: -1 }] },
    ], next: 'incident-diagnosis',
  },
  {
    id: 'incident-diagnosis', type: 'probe', title: 'Do impacto à hipótese',
    scenario: 'O time assumiu o incidente. Há sinais em mais de um componente e é necessário localizar a transação afetada sem ampliar exposição de dados.',
    prompt: 'Como a investigação costuma avançar nos primeiros minutos?',
    options: [
      { id: 'correlated-telemetry', label: 'Jornada, mudança recente, métricas, eventos e rastros podem ser correlacionados por identificadores técnicos, com acesso controlado e hipóteses compartilhadas.', signals: [{ capability: 'observabilidade', pattern: 'diagnostico-correlacionado', weight: 2 }] },
      { id: 'separate-searches', label: 'Cada responsável consulta sua parte e combina horários e sintomas em uma conversa até formar a sequência provável.', signals: [{ capability: 'observabilidade', pattern: 'telemetria-fragmentada', weight: -1 }] },
      { id: 'direct-runtime-access', label: 'Pessoas acessam diretamente processos, máquinas ou componentes em execução para coletar arquivos, comandos e estado.', signals: [{ capability: 'plataforma', pattern: 'diagnostico-por-acesso-direto', weight: -2 }] },
      { id: 'personal-data-search', label: 'A busca começa por um identificador pessoal ou dado do cliente porque é a forma mais rápida de encontrar o caso entre sistemas.', signals: [{ capability: 'plataforma', pattern: 'diagnostico-por-dado-pessoal', weight: -3 }] },
    ],
  },
  {
    id: 'diagnostic-cause', type: 'probe', title: 'O que impede diagnóstico seguro?',
    scenario: 'O acesso direto ou a combinação manual reaparece em incidentes diferentes, apesar do risco e do tempo consumido.',
    prompt: 'Qual causa provável melhor explica essa dependência?',
    options: [
      { id: 'telemetry-gap', label: 'Sinais necessários não são coletados, indexados ou correlacionados de ponta a ponta.', signals: [{ capability: 'observabilidade', pattern: 'causa-lacuna-telemetria', weight: -1 }] },
      { id: 'tool-access-gap', label: 'A informação existe, mas ferramentas homologadas, licenças, acesso ou experiência não permitem usá-la no tempo do incidente.', signals: [{ capability: 'plataforma', pattern: 'causa-ferramenta-observabilidade', weight: -1 }] },
      { id: 'context-propagation-gap', label: 'Componentes não preservam um identificador técnico comum ou contratos de instrumentação.', signals: [{ capability: 'arquitetura', pattern: 'causa-correlacao-arquitetural', weight: -1 }] },
      { id: 'privacy-design-gap', label: 'O desenho não oferece busca operacional minimizada e empurra a investigação para dados pessoais.', signals: [{ capability: 'plataforma', pattern: 'causa-privacidade-operacional', weight: -2 }] },
    ], next: 'incident-remediation',
  },
  {
    id: 'incident-remediation', type: 'probe', title: 'A correção durante o incidente',
    scenario: 'A hipótese aponta para código, configuração, dado ou recurso de infraestrutura. Mitigar rápido importa, mas o estado precisa continuar reproduzível depois.',
    prompt: 'Como a mudança corretiva normalmente chega ao ambiente afetado?',
    options: [
      { id: 'reproducible-change', label: 'A menor correção percorre um caminho rápido e verificável; código, configuração, schema ou infraestrutura mantêm uma fonte reproduzível e observada após aplicação.', signals: [{ capability: 'confiabilidade', pattern: 'correcao-reproduzivel', weight: 2 }] },
      { id: 'controlled-emergency', label: 'Uma alteração emergencial é feita com dupla verificação e trilha; logo depois é reconciliada na fonte e validada contra divergência.', signals: [{ capability: 'governanca', pattern: 'mudanca-emergencial-reconciliada', weight: 1 }] },
      { id: 'live-console-change', label: 'Uma pessoa experiente altera configuração ou recurso diretamente e depois documenta ou tenta reproduzir a correção.', signals: [{ capability: 'plataforma', pattern: 'correcao-direta-na-producao', weight: -2 }] },
      { id: 'live-data-change', label: 'Dados ou estruturas são ajustados diretamente para recuperar o serviço; validação e reconciliação dependem do contexto de quem executa.', signals: [{ capability: 'engenharia', pattern: 'correcao-manual-de-dados', weight: -2 }] },
    ], next: 'recurrence',
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
    ], next: 'iteration-purpose',
  },
  {
    id: 'iteration-purpose', title: 'O propósito do trabalho corrente',
    scenario: 'No início do período atual, há mais trabalho possível do que capacidade. Algumas atividades entregam partes diferentes de uma mesma mudança e outras tratam manutenção.',
    prompt: 'Como o grupo normalmente decide o que significa ter avançado ao final desse período?',
    options: [
      { id: 'outcome-goal', label: 'Existe um resultado ou hipótese compartilhada; itens são ajustados durante o período para preservar o objetivo e obter feedback utilizável.', signals: [{ capability: 'fluxo', pattern: 'trabalho-orientado-resultado', weight: 2 }] },
      { id: 'deliver-committed-items', label: 'O principal compromisso é concluir os itens aceitos; mudanças ameaçam previsibilidade e são negociadas separadamente.', signals: [{ capability: 'fluxo', pattern: 'iteracao-orientada-a-escopo', weight: -1 }] },
      { id: 'fill-capacity', label: 'As pessoas recebem trabalho suficiente para ocupar sua capacidade e o progresso é acompanhado pela movimentação das atividades.', signals: [{ capability: 'organizacao', pattern: 'ocupacao-como-progresso', weight: -2 }] },
      { id: 'urgent-priority', label: 'Prioridades mudam conforme urgências e solicitações; o objetivo é absorver o mais importante sem uma meta estável.', signals: [{ capability: 'governanca', pattern: 'prioridade-sem-foco', weight: -2 }] },
    ], next: 'blocked-work',
  },
  {
    id: 'blocked-work', type: 'probe', title: 'Quando o trabalho para',
    scenario: 'Uma atividade importante não consegue avançar por depender de decisão, acesso, ambiente ou conhecimento fora de quem a iniciou.',
    prompt: 'O que costuma acontecer nas horas e dias seguintes?',
    options: [
      { id: 'team-resolves', label: 'O bloqueio fica visível imediatamente; o grupo reorganiza trabalho, aciona o caminho conhecido e usa o ocorrido para reduzir recorrência.', signals: [{ capability: 'fluxo', pattern: 'bloqueio-tratado-pelo-sistema', weight: 2 }] },
      { id: 'facilitator-chases', label: 'Uma pessoa de facilitação, produto ou gestão acompanha responsáveis e escaladas enquanto os demais seguem com outras atividades.', signals: [{ capability: 'organizacao', pattern: 'bloqueio-depende-de-coordenador', weight: -1 }] },
      { id: 'waiting-external', label: 'A atividade permanece aguardando a área responsável; quem iniciou atualiza o status e ocupa a capacidade com outro item.', signals: [{ capability: 'fluxo', pattern: 'espera-normalizada', weight: -2 }] },
      { id: 'local-workaround', label: 'O time cria um contorno para continuar, mesmo que aumente divergência, trabalho manual ou dívida a reconciliar.', signals: [{ capability: 'arquitetura', pattern: 'contorno-acumula-divida', weight: -1 }] },
    ],
  },
  {
    id: 'blocked-cause', type: 'probe', title: 'O que torna a espera recorrente?',
    scenario: 'Bloqueios semelhantes aparecem em atividades diferentes e o simples escalonamento não reduz o tempo total.',
    prompt: 'Qual condição mais mantém esse padrão?',
    options: [
      { id: 'permission-policy', label: 'Permissões e controles não distinguem riscos nem oferecem um caminho seguro de autosserviço.', signals: [{ capability: 'governanca', pattern: 'causa-permissao-sem-autonomia', weight: -1 }] },
      { id: 'dependency-priority', label: 'A dependência pertence a outro grupo com prioridades e tempos que não são negociados pelo resultado compartilhado.', signals: [{ capability: 'organizacao', pattern: 'causa-prioridade-entre-times', weight: -1 }] },
      { id: 'missing-capability', label: 'Conhecimento necessário não está acessível no time, na plataforma ou em uma colaboração com tempo definido.', signals: [{ capability: 'organizacao', pattern: 'causa-competencia-inacessivel', weight: -1 }] },
      { id: 'architecture-dependency', label: 'O desenho técnico exige alterar ou consultar muitos responsáveis para uma mudança comum.', signals: [{ capability: 'arquitetura', pattern: 'causa-dependencia-arquitetural', weight: -1 }] },
    ], next: 'decision-context',
  },
  {
    id: 'decision-context', type: 'probe', title: 'Como uma decisão chega para construção?',
    scenario: 'Uma necessidade relevante permite caminhos com custos, riscos e reversibilidade diferentes. O prazo pressiona por uma escolha rápida.',
    prompt: 'Como a opção que será construída normalmente ganha contexto e compromisso?',
    options: [
      { id: 'options-recorded', label: 'Negócio, produto e competências técnicas necessárias avaliam opções e restrições; decisões relevantes registram contexto, trade-offs e sinais para revisão.', signals: [{ capability: 'arquitetura', pattern: 'decisao-intencional-revisavel', weight: 2 }] },
      { id: 'design-handed-off', label: 'A solução chega definida e o time detalha implementação; dúvidas relevantes retornam aos responsáveis pela concepção.', signals: [{ capability: 'fluxo', pattern: 'solucao-entregue-pronta', weight: -2 }] },
      { id: 'expert-decides', label: 'Uma referência técnica escolhe o caminho usando experiência e comunica o necessário para o restante do grupo executar.', signals: [{ capability: 'arquitetura', pattern: 'decisao-concentrada', weight: -1 }] },
      { id: 'local-convention', label: 'O grupo segue o padrão habitual; alternativas são discutidas principalmente quando o padrão deixa de funcionar.', signals: [{ capability: 'aprendizado', pattern: 'decisao-por-inercia', weight: -1 }] },
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
    ], next: 'improvement-loop',
  },
  {
    id: 'improvement-loop', title: 'O que muda após refletir sobre o trabalho?',
    scenario: 'Pense nas últimas vezes em que o grupo parou para revisar entrega, colaboração, incidentes ou forma de trabalhar. O encontro pode ter qualquer nome e frequência.',
    prompt: 'Qual consequência aparece com mais consistência nas semanas seguintes?',
    options: [
      { id: 'owned-and-verified', label: 'Poucas mudanças são escolhidas pelo grupo, recebem responsável e condição de sucesso, voltam à pauta e são ajustadas até produzir efeito.', signals: [
        { capability: 'aprendizado', pattern: 'melhoria-com-ciclo-fechado', weight: 2 },
        { capability: 'organizacao', pattern: 'melhoria-com-ownership', weight: 2 },
        { capability: 'fluxo', pattern: 'melhoria-protegida-no-fluxo', weight: 2 },
      ] },
      { id: 'action-list-fades', label: 'A conversa gera ações, mas elas competem com entregas, perdem responsáveis ou deixam de ser revisitadas.', signals: [
        { capability: 'aprendizado', pattern: 'retrospectiva-sem-fechamento', weight: -2 },
        { capability: 'governanca', pattern: 'melhoria-sem-prioridade', weight: -1 },
      ] },
      { id: 'ceremony-report', label: 'O encontro acontece no calendário e registra percepções, porém raramente muda decisão, processo ou capacidade reservada.', signals: [
        { capability: 'aprendizado', pattern: 'cerimonia-sem-adaptacao', weight: -2 },
        { capability: 'organizacao', pattern: 'processo-sem-autonomia', weight: -1 },
      ] },
      { id: 'only-after-crisis', label: 'Mudanças no modo de trabalhar surgem principalmente após crise ou cobrança externa, conduzidas por liderança ou especialistas.', signals: [
        { capability: 'aprendizado', pattern: 'melhoria-reativa', weight: -2 },
        { capability: 'organizacao', pattern: 'mudanca-centralizada', weight: -1 },
      ] },
    ],
  },
  {
    id: 'improvement-cause', type: 'probe', title: 'O que impede a melhoria de fechar o ciclo?',
    scenario: 'Os mesmos temas retornam em encontros diferentes sem mudança sustentada, mesmo quando o grupo reconhece o impacto.',
    prompt: 'Qual condição mais mantém esse padrão?',
    options: [
      { id: 'no-capacity', label: 'Toda a capacidade é consumida por entregas e urgências; melhorar o sistema não compete de forma explícita na priorização.', signals: [{ capability: 'governanca', pattern: 'causa-melhoria-sem-capacidade', weight: -1 }] },
      { id: 'no-autonomy', label: 'As causas dependem de decisões, políticas ou estruturas fora da autonomia do grupo e não há caminho efetivo de escalada.', signals: [{ capability: 'organizacao', pattern: 'causa-melhoria-sem-autonomia', weight: -1 }] },
      { id: 'too-many-actions', label: 'Muitas ações são abertas sem limite, evidência de sucesso ou encerramento explícito.', signals: [{ capability: 'aprendizado', pattern: 'causa-acoes-sem-foco', weight: -1 }] },
      { id: 'unsafe-dialogue', label: 'Conflitos, erros e decisões difíceis são suavizados porque expô-los traz risco pessoal ou pouca mudança prática.', signals: [{ capability: 'organizacao', pattern: 'causa-baixa-seguranca-psicologica', weight: -2 }] },
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
        { capability: 'engenharia', pattern: 'concorrencia-detectada-cedo', weight: 2 },
        { capability: 'organizacao', pattern: 'ownership-compartilhado-explicito', weight: 1 },
      ] },
      { id: 'overwritten-change', label: 'Uma versão, configuração ou pacote já foi sobrescrito ou substituído sem que o outro grupo percebesse a tempo.', signals: [
        { capability: 'entrega', pattern: 'mudanca-sobrescrita', weight: -2 },
        { capability: 'engenharia', pattern: 'fonte-nao-confiavel', weight: -2 },
        { capability: 'organizacao', pattern: 'comunicacao-de-mudanca-fragil', weight: -1 },
      ] },
      { id: 'late-integration-conflict', label: 'Conflitos e regressões aparecem ao reunir versões ou preparar a liberação, exigindo decisão conjunta sob pressão.', signals: [
        { capability: 'fluxo', pattern: 'conflito-de-integracao-tardio', weight: -2 },
        { capability: 'arquitetura', pattern: 'fronteira-compartilhada-acoplada', weight: -1 },
      ] },
      { id: 'manual-coordination', label: 'Responsáveis mantêm alinhamentos, mensagens e calendário para evitar colisões; o resultado depende de todos conhecerem o plano.', signals: [
        { capability: 'organizacao', pattern: 'concorrencia-coordenada-manualmente', weight: -1 },
        { capability: 'fluxo', pattern: 'planejamento-compensa-acoplamento', weight: -1 },
      ] },
    ],
  },
  {
    id: 'shared-surface-cause', type: 'probe', title: 'Por que a colisão continua possível?',
    scenario: 'Problemas de concorrência reaparecem apesar de mais comunicação, revisão e cuidado das pessoas envolvidas.',
    prompt: 'Qual causa provável melhor explica a recorrência?',
    options: [
      { id: 'ambiguous-source', label: 'Há mais de uma origem ou processo capaz de produzir a versão considerada válida.', signals: [{ capability: 'engenharia', pattern: 'causa-multiplas-fontes', weight: -1 }] },
      { id: 'weak-boundaries', label: 'Os limites do sistema não acompanham ownership; mudanças locais exigem compreender uma área extensa compartilhada.', signals: [{ capability: 'arquitetura', pattern: 'causa-limites-sem-ownership', weight: -1 }] },
      { id: 'independent-priorities', label: 'Times compartilham a superfície, mas objetivos, prazos e decisões são independentes.', signals: [{ capability: 'governanca', pattern: 'causa-prioridades-na-superficie', weight: -1 }] },
      { id: 'missing-verification', label: 'Contratos, configuração e integração não possuem feedback repetível antes da composição final.', signals: [{ capability: 'engenharia', pattern: 'causa-verificacao-concorrente', weight: -1 }] },
    ], next: 'team-health',
  },
  {
    id: 'team-health', title: 'Quando a forma de trabalhar deixa de servir',
    scenario: 'O grupo cresce, muda de responsabilidades ou passa a depender de mais áreas. Conflitos e carga cognitiva aumentam sem uma falha técnica única.',
    prompt: 'Como a estrutura e o modo de interação normalmente são revistos?',
    options: [
      { id: 'observe-and-adapt', label: 'O grupo observa fluxo, carga, conflitos e resultados; testa mudanças de fronteira ou colaboração e revisa seus efeitos com as pessoas afetadas.', signals: [
        { capability: 'organizacao', pattern: 'estrutura-adaptada-por-evidencia', weight: 2 },
        { capability: 'aprendizado', pattern: 'dinamica-de-time-revisada', weight: 2 },
      ] },
      { id: 'manager-reorganizes', label: 'A liderança reorganiza responsabilidades e pessoas usando desempenho, capacidade e prioridades disponíveis.', signals: [{ capability: 'organizacao', pattern: 'estrutura-definida-centralmente', weight: -1 }] },
      { id: 'add-coordination', label: 'Mantêm-se as fronteiras e adicionam-se alinhamentos, responsáveis ou especialistas para absorver a complexidade.', signals: [{ capability: 'organizacao', pattern: 'coordenacao-compensa-carga', weight: -1 }] },
      { id: 'individual-adaptation', label: 'As pessoas ajustam informalmente responsabilidades e buscam ajuda conforme a pressão aparece.', signals: [{ capability: 'organizacao', pattern: 'estrutura-implicita', weight: -2 }] },
    ],
  },
];

export const edges: AssessmentEdge[] = graph.flatMap((node) => {
  if (node.id === 'ready-to-release') return [
    { from: node.id, optionId: 'small-automated', to: 'integration-cadence' },
    { from: node.id, optionId: 'manual-package', to: 'deployment-probe' },
    { from: node.id, optionId: 'test-queue', to: 'quality-probe' },
    { from: node.id, optionId: 'approval', to: 'governance-probe' },
  ];
  if (node.id === 'integration-cadence') return [
    { from: node.id, optionId: 'integrated-daily', to: 'release-control' },
    { from: node.id, optionId: 'integrated-few-days', to: 'release-control' },
    { from: node.id, optionId: 'isolated-days', to: 'delivery-cause' },
    { from: node.id, optionId: 'coordinated-window', to: 'delivery-cause' },
  ];
  if (node.id === 'incident-triage') return [
    { from: node.id, optionId: 'risk-classified', to: 'incident-diagnosis' },
    { from: node.id, optionId: 'fixed-labels', to: 'incident-diagnosis' },
    { from: node.id, optionId: 'relationship-escalation', to: 'incident-routing-cause' },
    { from: node.id, optionId: 'same-queue', to: 'incident-routing-cause' },
  ];
  if (node.id === 'incident-diagnosis') return [
    { from: node.id, optionId: 'correlated-telemetry', to: 'incident-remediation' },
    { from: node.id, optionId: 'separate-searches', to: 'diagnostic-cause' },
    { from: node.id, optionId: 'direct-runtime-access', to: 'diagnostic-cause' },
    { from: node.id, optionId: 'personal-data-search', to: 'diagnostic-cause' },
  ];
  if (node.id === 'blocked-work') return [
    { from: node.id, optionId: 'team-resolves', to: 'decision-context' },
    { from: node.id, optionId: 'facilitator-chases', to: 'blocked-cause' },
    { from: node.id, optionId: 'waiting-external', to: 'blocked-cause' },
    { from: node.id, optionId: 'local-workaround', to: 'blocked-cause' },
  ];
  if (node.id === 'improvement-loop') return [
    { from: node.id, optionId: 'owned-and-verified', to: 'shared-surface-context' },
    { from: node.id, optionId: 'action-list-fades', to: 'improvement-cause' },
    { from: node.id, optionId: 'ceremony-report', to: 'improvement-cause' },
    { from: node.id, optionId: 'only-after-crisis', to: 'improvement-cause' },
  ];
  if (node.id === 'shared-surface-context') return [
    { from: node.id, optionId: 'single-owner', to: 'team-health' },
    { from: node.id, optionId: 'multiple-teams', to: 'shared-surface-risk' },
    { from: node.id, optionId: 'mixed-boundaries', to: 'shared-surface-risk' },
    { from: node.id, optionId: 'unknown-ownership', to: 'shared-surface-risk' },
  ];
  if (node.id === 'shared-surface-risk') return [
    { from: node.id, optionId: 'early-contract-feedback', to: 'team-health' },
    { from: node.id, optionId: 'overwritten-change', to: 'shared-surface-cause' },
    { from: node.id, optionId: 'late-integration-conflict', to: 'shared-surface-cause' },
    { from: node.id, optionId: 'manual-coordination', to: 'shared-surface-cause' },
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
];
