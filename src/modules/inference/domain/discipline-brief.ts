export type DisciplineScope = {
  covers: string;
  treats: string;
  not: string;
};

export const presentationDisciplineIds = [
  'product', 'engineering', 'operations', 'management',
  'delivery', 'software-quality', 'architecture', 'platform', 'security',
] as const;

const scopes: Record<string, DisciplineScope> = {
  product: {
    covers: 'Abrange a decisão de investir: problema, público, descoberta, portfólio e o planejamento que vira compromisso.',
    treats: 'Trata se a capacidade é ocupada por prazo ou solução pronta, se a dúvida é testada a tempo e se o próximo ciclo reserva gente para rever o resultado anterior.',
    not: 'Não é o departamento de produto nem um canvas. Não diagnostica cargo, ritual ou ferramenta de discovery.',
  },
  engineering: {
    covers: 'Abrange o caminho compartilhado da mudança: entrega, qualidade de software, arquitetura, plataforma e segurança.',
    treats: 'Trata espera, origem da versão, proteção do risco, desenho que arrasta o sistema e o pedido a outro grupo para começar o trabalho.',
    not: 'Não é o organograma de engenharia. Qualidade, plataforma e segurança não competem aqui: são disciplinas dentro deste sistema.',
  },
  operations: {
    covers: 'Abrange o serviço em uso: impacto, contenção, prioridade sob degradação e recuperação do ambiente.',
    treats: 'Trata se o grupo vê o efeito, contém o incidente e restaura com resultado — ou só se vê na crise.',
    not: 'Não é o time de SRE por existência. Incidente não prova engenharia; operação não some porque a entrega publicou.',
  },
  management: {
    covers: 'Abrange o recorte transversal: responsabilidade, governança, liderança, colaboração e aprendizado.',
    treats: 'Trata quem responde pelo resultado, quem autoriza, como o contexto entra na decisão e se o reconhecimento fecha em mudança.',
    not: 'Não é um quarto sistema rival nem avaliação de gestor. Não diagnostica pessoa, personalidade ou “cultura tóxica”.',
  },
  delivery: {
    covers: 'Abrange o caminho da mudança até chegar: o que está aberto, quando as partes se encontram e o que a publicação devolve.',
    treats: 'Trata espera escondida atrás de novo início, mudança isolada e versão que para no empacotamento ou sem origem.',
    not: 'Não é o SDLC nem cerimônia de refinamento. Fluxo, integração e publicação são recortes distintos dentro da entrega.',
  },
  'software-quality': {
    covers: 'Abrange sustentabilidade da mudança, onde o risco é protegido, o retorno técnico e se a competência entra no fluxo.',
    treats: 'Trata alteração que cresce por acoplamento, proteção só no fim, verificação tardia e fila em especialista.',
    not: 'Não é o time de QA nem cobertura de testes por presença. Não pontua ferramenta de qualidade.',
  },
  architecture: {
    covers: 'Abrange domínio, decisões de desenho, evolução da mudança comum e dados ou interfaces compartilhadas.',
    treats: 'Trata se uma alteração permanece local, se a escolha registra problema e alternativa, e se o outro lado descobre a mudança tarde.',
    not: 'Não é comitê, ADR por existência ou framework de arquitetura. Não diagnostica cargo de arquiteto.',
  },
  platform: {
    covers: 'Abrange o caminho até ambiente, permissão, infraestrutura reproduzível e a decisão de custo e uso.',
    treats: 'Trata pedido a outro grupo, ambiente mudado na mão e otimização no escuro — o que o trabalho precisa para começar e se repetir.',
    not: 'Não é o time de plataforma, portal ou “ter cloud”. Autonomia não significa liberdade sem limite.',
  },
  security: {
    covers: 'Abrange risco no caminho da entrega e identidade no recurso: escopo, tempo e trilha do acesso.',
    treats: 'Trata risco que só aparece no alerta tardio e privilégio que mora na conversa, no código ou no atalho permanente.',
    not: 'Não é checklist, ferramenta SAST ou o time de segurança por existência. Controle não equivale a proteção.',
  },
  'product-value': {
    covers: 'Abrange direção, descoberta e investimento: se problema, público e resultado se encontram antes de ampliar o trabalho.',
    treats: 'Trata prazo sem contexto, ideia que vira construção sem teste e iniciativa que come a capacidade de rever o ciclo anterior.',
    not: 'Não é framework de produto. Não pontua canvas, OKR ou cargo de product manager.',
  },
  'delivery-flow': {
    covers: 'Abrange o fluxo até o usuário: o que entra, o que espera, o que se encontra e o que chega.',
    treats: 'Trata compromisso cego, trabalho aberto sem limite, mudança isolada e retorno que chega tarde demais para decidir.',
    not: 'Não é esteira, board ou cerimônia. Não diagnostica ferramenta de gestão de trabalho.',
  },
  'engineering-quality': {
    covers: 'Abrange se a mudança permanece sustentável, protegida, verificável e executável pelo próprio grupo.',
    treats: 'Trata desenho que só uma pessoa explica, risco empurrado ao fim, feedback técnico instável e conhecimento fora do fluxo.',
    not: 'Não é nota de qualidade de código nem presença de pipeline. Não pontua linter ou suite.',
  },
  'architecture-evolution': {
    covers: 'Abrange se o desenho acompanha o domínio e aceita mudança pequena sem arrastar o sistema inteiro.',
    treats: 'Trata linguagem partida, decisão sem alternativa, coordenação demais e dado compartilhado sem dono.',
    not: 'Não é mapa C4, TOGAF ou repositório de ADRs. Não diagnostica ferramenta de modelagem.',
  },
  'operations-reliability': {
    covers: 'Abrange detecção, contenção e recuperação — o que acontece quando o serviço falha ou degrada.',
    treats: 'Trata impacto invisível, prioridade que não muda na degradação, incidente por relação pessoal e restauração presumida.',
    not: 'Não é o time de operação por existência nem ferramenta de monitoramento. Incidente não é prova de maturidade.',
  },
  'platform-experience': {
    covers: 'Abrange como ambiente, permissão e capacidade compartilhada chegam a quem precisa trabalhar, e se o ambiente se reproduz.',
    treats: 'Trata fila em outro grupo, origem do ambiente e se custo e impacto entram na mesma decisão.',
    not: 'Não é IDP, catálogo ou time de plataforma. Não diagnostica “falta de cloud”.',
  },
  'security-risk': {
    covers: 'Abrange se risco de software e de acesso altera o caminho da entrega, com identidade no recurso.',
    treats: 'Trata proteção tardia, privilégio amplo e trilha que não explica quem usou o quê.',
    not: 'Não é compliance por checklist nem ferramenta de scan. Aprovação não equivale a risco tratado.',
  },
  'organizational-system': {
    covers: 'Abrange responsabilidade, autoridade, incentivo, colaboração e aprendizado — o recorte que habilita ou bloqueia as demais disciplinas.',
    treats: 'Trata dono partido, portão indiferenciado, gargalo que volta ao time, contexto tardio e melhoria que não fecha.',
    not: 'Não é oitavo eixo técnico nem laudo de cultura. Não avalia pessoa nem gestor.',
  },
  'product-direction': {
    covers: 'Abrange se quem executa recebe o problema, o resultado esperado e o limite da decisão — juntos e revisáveis.',
    treats: 'Trata trabalho que chega como prazo ou solução pronta, sem o que se pode contestar nem quando a decisão se revê.',
    not: 'Não é alinhamento por slide nem cargo de direção. Não diagnostica framework de strategy.',
  },
  'discovery-validation': {
    covers: 'Abrange se uma dúvida é testada cedo o bastante para reduzir, alterar ou interromper o que seria construído.',
    treats: 'Trata ideia que vira construção sem conversa com quem usa, e evidência que chega só depois do compromisso.',
    not: 'Não é pesquisa por existência nem ferramenta de interview. Ritual de discovery não produz o recorte.',
  },
  'portfolio-management': {
    covers: 'Abrange se novo investimento compete com resultado anterior, custo de atraso e trabalho já em curso.',
    treats: 'Trata iniciativa que só soma, capacidade tomada pelo próximo ciclo e ausência de quem pode retirar trabalho.',
    not: 'Não é o board de portfólio nem SAFe por presença. Não pontua ferramenta de roadmap.',
  },
  'planning-refinement': {
    covers: 'Abrange se risco, dependência e critério aparecem antes do compromisso, não depois que o relógio já corre.',
    treats: 'Trata trabalho que muda muito depois de iniciado porque o entendimento compartilhado não existia.',
    not: 'Não é cerimônia de refinamento. Não diagnostica história de usuário ou pontuação de backlog.',
  },
  'work-management': {
    covers: 'Abrange o que está aberto, o que espera e o que deixa de ser feito quando entra uma urgência.',
    treats: 'Trata início que esconde fila, bloqueio invisível e grupo que absorve tudo sem decidir parar.',
    not: 'Não é o quadro kanban nem limite de WIP por adesivo. Não diagnostica ferramenta de fluxo.',
  },
  'continuous-integration': {
    covers: 'Abrange quando a mudança de cada pessoa encontra a versão compartilhada — cedo, com retorno, ou só no fim.',
    treats: 'Trata trabalho isolado, conflito tardio e janela coordenada para juntar o que deveria ter se encontrado antes.',
    not: 'Não é o servidor de CI nem Git. Pipeline presente não produz este recorte.',
  },
  'release-feedback': {
    covers: 'Abrange o caminho da versão pronta até o efeito no uso: espera, exposição, contenção e o que esse retorno altera.',
    treats: 'Trata pacote sem origem, lote que segura a mudança e sucesso inferido pela execução técnica sem ver o efeito.',
    not: 'Não é frequência DORA declarada nem ferramenta de deploy. GitOps por presença não fecha o recorte.',
  },
  'sustainable-design': {
    covers: 'Abrange se uma alteração comum permanece pequena e explicável por mais de uma pessoa.',
    treats: 'Trata mudança que cresce por acoplamento, contorno e memória local de quem já conhece o caminho.',
    not: 'Não é clean code, nota de complexidade nem refactor por moda. Não pontua linter.',
  },
  'quality-strategy': {
    covers: 'Abrange onde o risco é protegido: perto de onde nasce ou só no fim, por um grupo separado.',
    treats: 'Trata critério que chega tarde, proteção padrão para risco diferente e qualidade que recebe a versão pronta.',
    not: 'Não é o time de QA nem pirâmide de testes. Suite presente não produz o recorte.',
  },
  'sdlc-automation': {
    covers: 'Abrange se a verificação devolve informação confiável enquanto a mudança ainda é pequena e outra pessoa reproduz o resultado.',
    treats: 'Trata retorno lento, intermitente ou que só interrompe sem explicar, e execução que depende de máquina ou memória.',
    not: 'Não é automatizar por automatizar. Ferramenta de build não produz estágio por presença.',
  },
  'technical-capability': {
    covers: 'Abrange se o conhecimento necessário entra no fluxo por prática acompanhada, ou vira fila em especialista e fornecedor.',
    treats: 'Trata trabalho que para porque a experiência está em outra pessoa, e aprendizado sem oportunidade de aplicar.',
    not: 'Não é matriz de competência nem treinamento por presença. Não avalia indivíduo.',
  },
  'domain-alignment': {
    covers: 'Abrange se linguagem, limite e responsabilidade acompanham o mesmo resultado de negócio.',
    treats: 'Trata o mesmo termo com sentidos diferentes, dono fragmentado e mudança transversal sem quem feche o resultado.',
    not: 'Não é DDD, glossário ou event storming por existência. Vocabulário nominal não fecha o recorte.',
  },
  'architecture-decisions': {
    covers: 'Abrange se uma escolha de desenho registra problema, alternativas, responsável e condição de revisão.',
    treats: 'Trata solução que aparece por prestígio ou inércia, sem o que a faria ser revista.',
    not: 'Não é ADR, comitê ou board de arquitetura. Documento presente não produz o recorte.',
  },
  evolvability: {
    covers: 'Abrange se o sistema aceita mudança pequena e reversível sem multiplicar coordenação, risco e custo.',
    treats: 'Trata alteração comum que exige calendário conjunto, muitas partes e pouca reversão segura.',
    not: 'Não é microserviço por moda nem “evolutibilidade” como jargão. Ferramenta de decomposição não fecha o recorte.',
  },
  'integration-data': {
    covers: 'Abrange interface e dado compartilhado: dono, consumidores, compatibilidade e quando o outro lado fica sabendo.',
    treats: 'Trata mudança que o consumidor descobre tarde, versões que precisam mudar juntas e origem ambígua.',
    not: 'Não é o time de dados nem ferramenta de schema. Contrato no papel não produz o recorte.',
  },
  'observability-practice': {
    covers: 'Abrange se impacto, mudança e comportamento técnico se relacionam sem procurar gente, dado sensível ou atalho.',
    treats: 'Trata investigação que junta pedaços, acesso direto e dependência de quem conhece o caminho.',
    not: 'Não é a ferramenta de APM nem “ter logs”. Observabilidade não é o nome do produto.',
  },
  'reliability-practice': {
    covers: 'Abrange se degradação e risco aceitável conseguem alterar prioridade, ou entregar e manter competem sem limite.',
    treats: 'Trata média que tranquiliza, prazo que impede parar e impacto que ninguém podia interromper.',
    not: 'Não é SLO no slide nem ferramenta de error budget. Meta declarada não produz o recorte.',
  },
  'incident-management': {
    covers: 'Abrange detectar, encaminhar, conter e aprender com o incidente — com caminho, não com quem a pessoa conhece.',
    treats: 'Trata busca informal de responsável, alteração ao vivo sem reconciliação e encerramento sem efeito no próximo evento.',
    not: 'Não é a ferramenta de ITSM nem o cargo de incidente. War room por existência não fecha o recorte.',
  },
  'cloud-reliability': {
    covers: 'Abrange se restaurar o ambiente é exercitado com resultado observável, dependências conhecidas e tempo compatível com o impacto.',
    treats: 'Trata recuperação presumida, cópia que não serve e dependência que nunca foi exercitada sem o especialista.',
    not: 'Não é backup configurado nem região na nuvem. Declaração de DR não produz o recorte.',
  },
  'platform-autonomy': {
    covers: 'Abrange o caminho até ambiente, permissão, conta e capacidade compartilhada que o time precisa para começar e repetir o trabalho.',
    treats: 'Trata pedido a outro grupo, caminho desconhecido, ajuda recorrente e contorno local quando o caminho não serve.',
    not: 'Não é o time de cloud, portal ou IDP. Não diagnostica “falta de autonomia” como slogan nem liberdade sem limite.',
  },
  'reproducible-infrastructure': {
    covers: 'Abrange se o ambiente em uso nasce de uma origem verificável e se a exceção urgente volta para essa origem.',
    treats: 'Trata mudança na mão, mais de uma fonte considerada válida e urgência que nunca reconcilia.',
    not: 'Não é Terraform por presença nem “infra as code”. Arquivo de configuração não produz o recorte.',
  },
  'cloud-efficiency': {
    covers: 'Abrange se custo, uso e impacto entram na mesma decisão, com quem pode escolher e rever o efeito.',
    treats: 'Trata custo só comunicado, otimização local que fere confiabilidade e ausência de rotina de revisão.',
    not: 'Não é FinOps por equipe nem alerta de billing. Economia isolada não produz o recorte.',
  },
  'software-security': {
    covers: 'Abrange se um risco relevante aparece cedo e altera desenho, verificação ou liberação, com alguém capaz de decidir.',
    treats: 'Trata risco que só entra no alerta tardio, aprovação sem risco nomeado e proteção dispensada sem dono.',
    not: 'Não é SAST, pentest ou o time de AppSec. Scan presente não produz o recorte.',
  },
  'cloud-security': {
    covers: 'Abrange identidade e acesso no recurso: escopo, tempo, finalidade, trilha de uso e remoção verificável.',
    treats: 'Trata segredo no código ou na conversa, privilégio permanente e concessão que ninguém explica depois.',
    not: 'Não é o provedor de IAM por existência. Política escrita não equivale a autorização no recurso.',
  },
  'team-ownership': {
    covers: 'Abrange se o resultado tem dono de ponta a ponta — serviço, mudança e operação — com fronteira e decisão conhecidas.',
    treats: 'Trata serviço sem responsável, mudança que atravessa agendas e artefato que vários alteram e ninguém mantém.',
    not: 'Não é o nome do time no organograma. Cargo de owner não produz o recorte.',
  },
  'enabling-governance': {
    covers: 'Abrange se o controle é proporcional ao risco, deixa a decisão rastreável e oferece caminho simples para mudança pequena.',
    treats: 'Trata o mesmo portão para risco pequeno e grande, aprovação que só transfere responsabilidade e exceção informal permanente.',
    not: 'Não é o comitê de governança nem ISO por certificado. Controle a mais depois da falha não fecha o recorte.',
  },
  'leadership-management': {
    covers: 'Abrange se evidência de gargalo vira prioridade, autoridade e capacidade para mudar o sistema, com efeito acompanhado.',
    treats: 'Trata problema que volta ao time, cobrança sem decisão e ação aberta sem gente reservada.',
    not: 'Não avalia o gestor como pessoa. Não diagnostica estilo de liderança nem “falta de disciplina do time”.',
  },
  collaboration: {
    covers: 'Abrange se quem precisa decidir e executar entra enquanto ainda pode mudar o recorte, com pedido, espera e responsabilidade explícitos.',
    treats: 'Trata contexto que chega no fim, especialidade tardia e dependência que exige alinhamento o tempo todo.',
    not: 'Não é cerimônia de alinhamento nem ferramenta de chat. Mais reunião não produz o recorte.',
  },
  'organizational-learning': {
    covers: 'Abrange se reconhecer o problema fecha em mudança pequena, com dono, capacidade, revisão de efeito e disseminação quando funciona.',
    treats: 'Trata lista que só cresce, cerimônia sem decisão e aprendizado que só aparece depois da crise.',
    not: 'Não é retrospectiva ou post-mortem por existência. Facilitação não produz o recorte.',
  },
};

const fallback: DisciplineScope = {
  covers: 'Abrange o comportamento e o efeito observados neste recorte do sistema de entrega.',
  treats: 'Trata o que as entrevistas sustentam aqui, sem transformar ausência de recorte em diagnóstico.',
  not: 'Não diagnostica ferramenta, cargo ou cerimônia. Não conclui ausência de problema onde a entrevista não passou.',
};

export function disciplineScope(id: string): DisciplineScope {
  return scopes[id] ?? fallback;
}

export function disciplineBrief(id: string): string {
  return disciplineScope(id).covers;
}
