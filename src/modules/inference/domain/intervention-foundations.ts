export type ExplicitFoundation = { source: string; principle: string; why: string };

export const interventionFoundations: Record<string, ExplicitFoundation> = {
  "sobrecarga-silenciosa": {
    "source": "Lean / Accelerate",
    "principle": "Fluxo, limite de trabalho e custo de atraso visíveis",
    "why": "Ocupação individual não mede o sistema; iniciar mais trabalho esconde a espera."
  },
  "coordenacao-centralizada": {
    "source": "Team Topologies",
    "principle": "Fronteira, carga e modo de interação alinhados ao fluxo",
    "why": "Mais coordenação ou herói de contexto costuma compensar limite ruim, não resolvê-lo."
  },
  "decisao-opaca": {
    "source": "Discovery e evidência de uso",
    "principle": "Critério e consequência tornam a decisão observável",
    "why": "Reconstruir participantes, espera e informação disponível revela o que realmente pesou e permite testar um critério explícito na próxima decisão equivalente."
  },
  "integracao-tardia": {
    "source": "Continuous Delivery",
    "principle": "Lote pequeno, feedback cedo, caminho reproduzível",
    "why": "Pipeline nominal não substitui o comportamento sob pressão."
  },
  "dependencia-coordenada": {
    "source": "Team Topologies",
    "principle": "Dependências recorrentes precisam de contrato e modo de interação explícitos",
    "why": "Uma fonte reproduzível e uma verificação antecipada substituem combinação pessoa a pessoa como mecanismo principal para integrar o trabalho entre grupos."
  },
  "feedback-em-producao": {
    "source": "Continuous Delivery",
    "principle": "Lote pequeno, feedback cedo, caminho reproduzível",
    "why": "Pipeline nominal não substitui o comportamento sob pressão."
  },
  "empacotamento-manual": {
    "source": "Continuous Delivery",
    "principle": "Lote pequeno, feedback cedo, caminho reproduzível",
    "why": "Pipeline nominal não substitui o comportamento sob pressão."
  },
  "qualidade-como-fase": {
    "source": "Qualidade no fluxo",
    "principle": "Risco entra cedo; verificação é feedback, não fase",
    "why": "Suíte ou scanner presente não prova estratégia de qualidade."
  },
  "controle-sem-feedback": {
    "source": "Governança habilitadora",
    "principle": "Controle proporcional ao risco, com evidência que muda decisão",
    "why": "Aprovação que não distingue risco só adiciona espera."
  },
  "limiar-sem-contexto": {
    "source": "Data literacy / SRE",
    "principle": "Decisão com denominador, cauda e incerteza",
    "why": "Dashboard sem interpretação gera falsa precisão."
  },
  "dependencia-de-heroi": {
    "source": "SRE / blameless postmortem",
    "principle": "Detectar, correlacionar e aprender sem culpa",
    "why": "A prática é o ciclo de incidente, não a ferramenta de observabilidade."
  },
  "deteccao-tardia": {
    "source": "SRE / blameless postmortem",
    "principle": "Detectar, correlacionar e aprender sem culpa",
    "why": "A prática é o ciclo de incidente, não a ferramenta de observabilidade."
  },
  "acao-sem-fechamento": {
    "source": "Melhoria contínua",
    "principle": "Fechar o ciclo entre ação e efeito observado",
    "why": "Limitar ações, atribuir responsabilidade e revisar um sinal de efeito impede que a reflexão termine em intenção sem aprendizagem verificável."
  },
  "mitigacao-sem-prevencao": {
    "source": "Resilience engineering / SRE",
    "principle": "Mitigar impacto e reduzir recorrência são capacidades distintas",
    "why": "Alterar uma condição que antecede a falha testa prevenção ou detecção precoce; aperfeiçoar somente a reação preserva a mesma classe de incidente."
  },
  "solucao-local-nao-difundida": {
    "source": "Well-Architected / platform engineering",
    "principle": "Capacidade compartilhada é demonstrada pela jornada de outro consumidor",
    "why": "Testar a automação com um segundo time revela documentação, suporte e adequação ausentes antes de institucionalizar uma solução que só funciona localmente."
  },
  "operacao-manual-fragil": {
    "source": "Continuous Delivery",
    "principle": "Operação frequente precisa ser repetível e verificável",
    "why": "Codificar um passo sensível a contexto reduz variação e produz feedback reproduzível; instrução continua apoio, não mecanismo principal de controle."
  },
  "dados-de-teste-fragil": {
    "source": "Qualidade no fluxo",
    "principle": "Risco entra cedo; verificação é feedback, não fase",
    "why": "Suíte ou scanner presente não prova estratégia de qualidade."
  },
  "regressao-crescente": {
    "source": "Qualidade no fluxo",
    "principle": "Risco entra cedo; verificação é feedback, não fase",
    "why": "Suíte ou scanner presente não prova estratégia de qualidade."
  },
  "qualidade-tardia": {
    "source": "Qualidade no fluxo",
    "principle": "Risco entra cedo; verificação é feedback, não fase",
    "why": "Suíte ou scanner presente não prova estratégia de qualidade."
  },
  "controle-indiferenciado": {
    "source": "Governança habilitadora",
    "principle": "Controle proporcional ao risco, com evidência que muda decisão",
    "why": "Aprovação que não distingue risco só adiciona espera."
  },
  "governanca-relacional": {
    "source": "Governança habilitadora",
    "principle": "Controle proporcional ao risco, com evidência que muda decisão",
    "why": "Aprovação que não distingue risco só adiciona espera."
  },
  "controle-sem-proposito": {
    "source": "Governança habilitadora",
    "principle": "Controle proporcional ao risco, com evidência que muda decisão",
    "why": "Aprovação que não distingue risco só adiciona espera."
  },
  "cascata-fracionada": {
    "source": "Discovery e evidência de uso",
    "principle": "Feedback multidisciplinar antes de consolidar o lote",
    "why": "Envolver produto, engenharia, qualidade e operação numa hipótese pequena antecipa restrições enquanto ainda é barato alterar direção e desenho."
  },
  "feedback-tardio": {
    "source": "Discovery e evidência de uso",
    "principle": "Evidência de uso com poder de reabrir o investimento",
    "why": "Aceite de escopo não substitui a prova de que a hipótese vale o lote."
  },
  "prazo-sem-aprendizado": {
    "source": "Discovery e evidência de uso",
    "principle": "Urgência não elimina a hipótese nem sua revisão",
    "why": "Registrar o efeito esperado e uma data de revisão preserva aprendizagem mesmo sob prazo, evitando que entrega seja confundida com resultado comprovado."
  },
  "qualidade-como-handoff": {
    "source": "Qualidade no fluxo",
    "principle": "Risco entra cedo; verificação é feedback, não fase",
    "why": "Suíte ou scanner presente não prova estratégia de qualidade."
  },
  "verificacao-dependente-de-memoria": {
    "source": "Qualidade no fluxo",
    "principle": "Escape real vira feedback repetível junto à mudança",
    "why": "Transformar um defeito recente numa verificação pequena reduz dependência da memória de quem altera e antecipa a mesma falha em mudanças equivalentes."
  },
  "automacao-sem-feedback": {
    "source": "Continuous Delivery",
    "principle": "Lote pequeno, feedback cedo, caminho reproduzível",
    "why": "Pipeline nominal não substitui o comportamento sob pressão."
  },
  "provisionamento-em-fila": {
    "source": "Well-Architected / platform engineering",
    "principle": "Caminho suportado com guardrails, não fila artesanal",
    "why": "Time de plataforma, IDP ou console não é maturidade operacional."
  },
  "acesso-artesanal": {
    "source": "Well-Architected — Security",
    "principle": "Identidade com privilégio mínimo e proteção de dados",
    "why": "O problema observado é credencial ou acesso, não a ausência de um produto de cofre."
  },
  "ambiente-inconsistente": {
    "source": "Well-Architected / platform engineering",
    "principle": "Dependência crítica reproduzível reduz concorrência e diferença ambiental",
    "why": "Reproduzir a menor dependência que causa conflito permite comparar execuções e reduz tempo gasto distinguindo defeito do produto de estado do ambiente."
  },
  "seguranca-tardia": {
    "source": "Qualidade no fluxo",
    "principle": "Risco entra cedo; verificação é feedback, não fase",
    "why": "Suíte ou scanner presente não prova estratégia de qualidade."
  },
  "competencia-de-seguranca-inacessivel": {
    "source": "Qualidade no fluxo",
    "principle": "Risco entra cedo; verificação é feedback, não fase",
    "why": "Suíte ou scanner presente não prova estratégia de qualidade."
  },
  "acoplamento-coordenado": {
    "source": "Arquitetura evolutiva / DDD",
    "principle": "Fronteiras reduzem coordenação recorrente quando seguem o fluxo de mudança",
    "why": "Medir uma mudança transversal e remover uma interação recorrente testa se contrato ou limite reduz coordenação sem apenas deslocá-la para outro grupo."
  },
  "evolucao-em-grande-lote": {
    "source": "Arquitetura evolutiva / DDD",
    "principle": "Evolução segura ocorre por passos reversíveis com feedback",
    "why": "Extrair uma fatia reversível permite verificar redução no custo de mudança antes de comprometer capacidade e risco numa transformação arquitetural ampla."
  },
  "ownership-fragmentado": {
    "source": "Team Topologies",
    "principle": "Fronteira, carga e modo de interação alinhados ao fluxo",
    "why": "Mais coordenação ou herói de contexto costuma compensar limite ruim, não resolvê-lo."
  },
  "culpa-e-controle": {
    "source": "Governança habilitadora",
    "principle": "Controle proporcional ao risco, com evidência que muda decisão",
    "why": "Aprovação que não distingue risco só adiciona espera."
  },
  "aprendizado-restrito": {
    "source": "Melhoria contínua",
    "principle": "Aprendizagem útil circula com contexto e possibilidade de contestação",
    "why": "Compartilhar condições e decisões de forma segura permite que outros grupos testem a interpretação, em vez de transformar síntese de especialistas em regra sem contexto."
  },
  "incidente-sem-aprendizado": {
    "source": "SRE / blameless postmortem",
    "principle": "Detectar, correlacionar e aprender sem culpa",
    "why": "A prática é o ciclo de incidente, não a ferramenta de observabilidade."
  },
  "mudanca-isolada": {
    "source": "Continuous Delivery",
    "principle": "Lote pequeno, feedback cedo, caminho reproduzível",
    "why": "Pipeline nominal não substitui o comportamento sob pressão."
  },
  "integracao-por-janela": {
    "source": "Continuous Delivery",
    "principle": "Lote pequeno, feedback cedo, caminho reproduzível",
    "why": "Pipeline nominal não substitui o comportamento sob pressão."
  },
  "causa-ferramental-feedback": {
    "source": "Continuous Delivery",
    "principle": "Lote pequeno, feedback cedo, caminho reproduzível",
    "why": "Pipeline nominal não substitui o comportamento sob pressão."
  },
  "causa-processo-lote": {
    "source": "Governança habilitadora",
    "principle": "Controle proporcional ao risco, com evidência que muda decisão",
    "why": "Aprovação que não distingue risco só adiciona espera."
  },
  "causa-fronteira-times": {
    "source": "Team Topologies",
    "principle": "Fronteira, carga e modo de interação alinhados ao fluxo",
    "why": "Mais coordenação ou herói de contexto costuma compensar limite ruim, não resolvê-lo."
  },
  "causa-acoplamento-entrega": {
    "source": "Continuous Delivery",
    "principle": "Lote pequeno, feedback cedo, caminho reproduzível",
    "why": "Pipeline nominal não substitui o comportamento sob pressão."
  },
  "controles-de-release-acumulados": {
    "source": "Continuous Delivery",
    "principle": "Lote pequeno, feedback cedo, caminho reproduzível",
    "why": "Pipeline nominal não substitui o comportamento sob pressão."
  },
  "deploy-igual-release": {
    "source": "Continuous Delivery",
    "principle": "Lote pequeno, feedback cedo, caminho reproduzível",
    "why": "Pipeline nominal não substitui o comportamento sob pressão."
  },
  "release-em-lote": {
    "source": "Continuous Delivery",
    "principle": "Lote pequeno, feedback cedo, caminho reproduzível",
    "why": "Pipeline nominal não substitui o comportamento sob pressão."
  },
  "maturidade-nao-resiste-urgencia": {
    "source": "Continuous Delivery",
    "principle": "O caminho seguro precisa ser também o caminho rápido sob pressão",
    "why": "Transformar o atalho recorrente em fluxo automatizado e auditável testa se segurança operacional resiste à urgência sem depender de disciplina excepcional."
  },
  "dependencia-operacional-sob-urgencia": {
    "source": "Well-Architected — Security",
    "principle": "Autonomia operacional exige operação reversível e privilégio mínimo",
    "why": "Um caminho limitado e auditável permite que quem responde pelo serviço aja durante a urgência sem depender do acesso permanente de um especialista."
  },
  "incidente-por-handoff": {
    "source": "SRE / blameless postmortem",
    "principle": "Detectar, correlacionar e aprender sem culpa",
    "why": "A prática é o ciclo de incidente, não a ferramenta de observabilidade."
  },
  "incidente-detectado-por-cliente": {
    "source": "SRE / blameless postmortem",
    "principle": "Detectar, correlacionar e aprender sem culpa",
    "why": "A prática é o ciclo de incidente, não a ferramenta de observabilidade."
  },
  "incidente-depende-do-autor": {
    "source": "SRE / blameless postmortem",
    "principle": "Detectar, correlacionar e aprender sem culpa",
    "why": "A prática é o ciclo de incidente, não a ferramenta de observabilidade."
  },
  "severidade-inconsistente": {
    "source": "Resilience engineering / SRE",
    "principle": "Severidade nasce de impacto e abrangência observáveis",
    "why": "Calibrar critérios contra incidentes reais reduz variação por autoridade ou percepção individual e liga urgência às decisões que o impacto justificou."
  },
  "incidente-por-escalada-relacional": {
    "source": "SRE / blameless postmortem",
    "principle": "Detectar, correlacionar e aprender sem culpa",
    "why": "A prática é o ciclo de incidente, não a ferramenta de observabilidade."
  },
  "incidente-na-fila-de-trabalho": {
    "source": "SRE / blameless postmortem",
    "principle": "Detectar, correlacionar e aprender sem culpa",
    "why": "A prática é o ciclo de incidente, não a ferramenta de observabilidade."
  },
  "causa-ownership-operacional": {
    "source": "Team Topologies",
    "principle": "Fronteira, carga e modo de interação alinhados ao fluxo",
    "why": "Mais coordenação ou herói de contexto costuma compensar limite ruim, não resolvê-lo."
  },
  "causa-impacto-invisivel": {
    "source": "SRE / blameless postmortem",
    "principle": "Sinal técnico só orienta decisão quando ligado ao impacto",
    "why": "Relacionar sintoma, jornada afetada, abrangência e mudança recente torna a criticidade investigável antes de ampliar painéis ou alertas sem contexto."
  },
  "causa-fronteira-sustentacao": {
    "source": "Team Topologies",
    "principle": "Fronteira, carga e modo de interação alinhados ao fluxo",
    "why": "Mais coordenação ou herói de contexto costuma compensar limite ruim, não resolvê-lo."
  },
  "causa-politica-incidente": {
    "source": "SRE / blameless postmortem",
    "principle": "Detectar, correlacionar e aprender sem culpa",
    "why": "A prática é o ciclo de incidente, não a ferramenta de observabilidade."
  },
  "telemetria-fragmentada": {
    "source": "SRE / blameless postmortem",
    "principle": "Detectar, correlacionar e aprender sem culpa",
    "why": "A prática é o ciclo de incidente, não a ferramenta de observabilidade."
  },
  "diagnostico-por-acesso-direto": {
    "source": "SRE / blameless postmortem",
    "principle": "Detectar, correlacionar e aprender sem culpa",
    "why": "A prática é o ciclo de incidente, não a ferramenta de observabilidade."
  },
  "diagnostico-por-dado-pessoal": {
    "source": "SRE / blameless postmortem",
    "principle": "Detectar, correlacionar e aprender sem culpa",
    "why": "A prática é o ciclo de incidente, não a ferramenta de observabilidade."
  },
  "causa-lacuna-telemetria": {
    "source": "SRE / blameless postmortem",
    "principle": "Detectar, correlacionar e aprender sem culpa",
    "why": "A prática é o ciclo de incidente, não a ferramenta de observabilidade."
  },
  "causa-ferramenta-observabilidade": {
    "source": "SRE / blameless postmortem",
    "principle": "Detectar, correlacionar e aprender sem culpa",
    "why": "A prática é o ciclo de incidente, não a ferramenta de observabilidade."
  },
  "causa-correlacao-arquitetural": {
    "source": "Arquitetura evolutiva / DDD",
    "principle": "Fronteiras preservam contexto suficiente para investigar uma jornada",
    "why": "Um contrato mínimo de correlação entre componentes testa se o contexto atravessa o limite técnico sem exigir acesso direto ou reconstrução manual do evento."
  },
  "causa-privacidade-operacional": {
    "source": "Well-Architected — Security",
    "principle": "Investigação preserva minimização, finalidade e acesso proporcional",
    "why": "Identificadores técnicos e retenção mínima permitem correlacionar a jornada sem tornar dado pessoal o mecanismo padrão para diagnosticar falhas operacionais."
  },
  "correcao-direta-na-producao": {
    "source": "Infrastructure as Code / SRE",
    "principle": "Uma única origem reproduzível também no caminho emergencial",
    "why": "Reconciliação e detecção de divergência impedem que console e fonte definam estados concorrentes."
  },
  "correcao-manual-de-dados": {
    "source": "Dados como produto",
    "principle": "Correção recorrente precisa ser idempotente, revisável e auditável",
    "why": "Uma operação com validação e reversão explícitas pode ser repetida sem depender do contexto individual e reduz risco de corrigir duas vezes ou parcialmente."
  },
  "iteracao-orientada-a-escopo": {
    "source": "Lean / Accelerate",
    "principle": "Resultado estável, opções de escopo adaptáveis",
    "why": "Fixar o resultado e limitar trabalho permite trocar itens quando surge evidência nova, em vez de proteger um escopo que já pode ter perdido valor."
  },
  "ocupacao-como-progresso": {
    "source": "Lean / Accelerate",
    "principle": "Incentivo alinhado a resultado, não a ocupação",
    "why": "Cerimônia de OKR não mede maturidade; o que pesa na decisão sim."
  },
  "prioridade-sem-foco": {
    "source": "Lean / Accelerate",
    "principle": "Toda nova prioridade explicita custo de oportunidade",
    "why": "Tornar visível o resultado corrente e o trabalho deslocado por cada urgência reduz troca silenciosa de foco e permite revisar a decisão pelo efeito."
  },
  "bloqueio-depende-de-coordenador": {
    "source": "Team Topologies",
    "principle": "Autonomia nasce de limites e caminhos explícitos, não de intermediação pessoal",
    "why": "Delegar uma classe recorrente de bloqueio com tempo e limites visíveis testa se o grupo consegue resolver a dependência sem uma pessoa coordenadora."
  },
  "espera-normalizada": {
    "source": "Lean / Accelerate",
    "principle": "Fluxo, limite de trabalho e custo de atraso visíveis",
    "why": "Ocupação individual não mede o sistema; iniciar mais trabalho esconde a espera."
  },
  "contorno-acumula-divida": {
    "source": "Lean / arquitetura evolutiva",
    "principle": "Exceção reversível com validade e condição de remoção",
    "why": "O contorno só preserva fluxo sem acumular divergência quando sua reconciliação faz parte da decisão."
  },
  "causa-permissao-sem-autonomia": {
    "source": "Well-Architected — Security",
    "principle": "Identidade com privilégio mínimo e proteção de dados",
    "why": "O problema observado é credencial ou acesso, não a ausência de um produto de cofre."
  },
  "causa-prioridade-entre-times": {
    "source": "Lean / Accelerate",
    "principle": "Dependências compartilham resultado, tempo de resposta e regra de escalada",
    "why": "Um objetivo comum e uma decisão explícita de escalada tornam o custo da espera negociável, em vez de cada grupo otimizar sua própria fila de prioridade."
  },
  "causa-competencia-inacessivel": {
    "source": "Team Topologies",
    "principle": "Competência necessária deve estar acessível ao fluxo de trabalho",
    "why": "Colaboração temporária, aprendizagem aplicada ou um caminho pavimentado reduzem espera quando transferem capacidade de execução, não apenas conhecimento abstrato."
  },
  "causa-dependencia-arquitetural": {
    "source": "Arquitetura evolutiva / DDD",
    "principle": "Fronteiras devem alinhar autoridade e ritmo de mudança",
    "why": "Remover uma passagem recorrente por contrato, limite ou ownership testa se a dependência vem do desenho do sistema em vez de culpar coordenação individual."
  },
  "solucao-entregue-pronta": {
    "source": "Discovery e evidência de uso",
    "principle": "Restrições e hipóteses alteram a decisão antes do investimento",
    "why": "Comparar opções cedo permite que negócio, produto e competências técnicas mudem o desenho."
  },
  "decisao-concentrada": {
    "source": "Arquitetura evolutiva / DDD",
    "principle": "Contexto e critérios tornam decisões revisáveis por outras pessoas",
    "why": "Registrar trade-offs e fazer outra pessoa conduzir a revisão testa se a decisão pertence ao sistema de trabalho ou permanece dependente de uma referência."
  },
  "decisao-por-inercia": {
    "source": "Arquitetura evolutiva / DDD",
    "principle": "Decisão possui condição explícita de revisão",
    "why": "Um sinal antecipado de custo ou risco permite revisar o padrão antes de uma falha grave, evitando que precedentes antigos permaneçam válidos por ausência de gatilho."
  },
  "retrospectiva-sem-fechamento": {
    "source": "Melhoria contínua",
    "principle": "Poucas mudanças com dono e verificação posterior",
    "why": "Escolher uma mudança, reservar capacidade e marcar sua revisão fecha o loop de aprendizagem que uma lista crescente de ações deixa aberto."
  },
  "melhoria-sem-prioridade": {
    "source": "Melhoria contínua",
    "principle": "Melhoria compete por capacidade de forma explícita",
    "why": "Reservar um limite pequeno de capacidade transforma melhoria em trabalho executável e permite comparar recorrência, espera ou retrabalho antes e depois."
  },
  "cerimonia-sem-adaptacao": {
    "source": "Melhoria contínua",
    "principle": "Reflexão só aprende quando muda uma decisão",
    "why": "Partir de um evento recente e escolher uma decisão revisável conecta a conversa ao trabalho real; realizar a cerimônia sem mudança não fecha o ciclo."
  },
  "processo-sem-autonomia": {
    "source": "Governança habilitadora",
    "principle": "Limites explícitos distinguem proteção de escolha local",
    "why": "Explicar o risco protegido e o espaço seguro de experimento permite adaptar o fluxo sem remover controles legítimos nem depender de exceção informal."
  },
  "melhoria-reativa": {
    "source": "Resilience engineering / SRE",
    "principle": "Sinais fracos acionam revisão antes da crise",
    "why": "Um gatilho antecipado de espera, recorrência ou desgaste cria oportunidade de adaptação enquanto o custo e o risco ainda são menores."
  },
  "mudanca-centralizada": {
    "source": "Team Topologies",
    "principle": "Quem executa o fluxo precisa de autonomia dentro de limites explícitos",
    "why": "Delegar um experimento reversível testa se o grupo consegue adaptar o trabalho com segurança, em vez de depender da liderança para toda mudança do sistema."
  },
  "causa-melhoria-sem-capacidade": {
    "source": "Lean / Accelerate",
    "principle": "Melhoria só ocorre quando recebe capacidade real no portfólio",
    "why": "Interromper uma iniciativa pequena explicita o custo de oportunidade e libera trabalho para remover um gargalo que apenas registrar como ação não consegue alterar."
  },
  "causa-melhoria-sem-autonomia": {
    "source": "Team Topologies",
    "principle": "Fronteiras e modos de interação tornam autoridade e dependências explícitas",
    "why": "A intervenção leva a restrição a quem pode alterar o sistema sem culpar o time bloqueado."
  },
  "causa-acoes-sem-foco": {
    "source": "Melhoria contínua",
    "principle": "Limitar melhoria em andamento preserva capacidade de fechar ciclos",
    "why": "Reduzir ações simultâneas e encerrar as que não têm dono ou efeito evita dispersão de capacidade e torna o aprendizado das poucas mudanças concluídas verificável."
  },
  "causa-baixa-seguranca-psicologica": {
    "source": "SRE / blameless postmortem",
    "principle": "Aprender com condições do sistema sem transformar relato em culpa individual",
    "why": "Proteção não punitiva permite que fatos difíceis entrem na investigação e produzam mudança verificável."
  },
  "mudanca-sobrescrita": {
    "source": "Continuous Delivery",
    "principle": "Uma origem reproduzível impede promoção de composição incompleta",
    "why": "Verificar que a versão promovida incorpora a linha compartilhada detecta sobrescrita no fluxo, antes que comunicação manual precise reconstruir qual mudança se perdeu."
  },
  "fonte-nao-confiavel": {
    "source": "Continuous Delivery",
    "principle": "Lote pequeno, feedback cedo, caminho reproduzível",
    "why": "Pipeline nominal não substitui o comportamento sob pressão."
  },
  "comunicacao-de-mudanca-fragil": {
    "source": "Continuous Delivery",
    "principle": "Compatibilidade e ownership precisam ser detectáveis no fluxo",
    "why": "Automatizar a detecção de alterações incompatíveis libera comunicação humana para decisões e exceções, sem usá-la como mecanismo básico de sincronização."
  },
  "conflito-de-integracao-tardio": {
    "source": "Continuous Delivery",
    "principle": "Lote pequeno, feedback cedo, caminho reproduzível",
    "why": "Pipeline nominal não substitui o comportamento sob pressão."
  },
  "fronteira-compartilhada-acoplada": {
    "source": "Team Topologies",
    "principle": "Fronteira, carga e modo de interação alinhados ao fluxo",
    "why": "Mais coordenação ou herói de contexto costuma compensar limite ruim, não resolvê-lo."
  },
  "concorrencia-coordenada-manualmente": {
    "source": "Continuous Delivery",
    "principle": "Composição e contrato recebem feedback antecipado",
    "why": "Uma prova reproduzível substitui coordenação recorrente como detector principal de colisões."
  },
  "planejamento-compensa-acoplamento": {
    "source": "Continuous Delivery",
    "principle": "Composição precoce substitui previsão excessiva por feedback",
    "why": "Reduzir o intervalo até a primeira composição verificável revela conflitos enquanto a mudança é pequena; mais alinhamento prévio não produz essa evidência."
  },
  "causa-multiplas-fontes": {
    "source": "Continuous Delivery",
    "principle": "Lote pequeno, feedback cedo, caminho reproduzível",
    "why": "Pipeline nominal não substitui o comportamento sob pressão."
  },
  "causa-limites-sem-ownership": {
    "source": "Team Topologies",
    "principle": "Fronteira, carga e modo de interação alinhados ao fluxo",
    "why": "Mais coordenação ou herói de contexto costuma compensar limite ruim, não resolvê-lo."
  },
  "causa-prioridades-na-superficie": {
    "source": "Lean / Accelerate",
    "principle": "Superfície compartilhada exige objetivo e regra de decisão comuns",
    "why": "Explicitar resultado, responsabilidade e desempate reduz colisões que integração técnica sozinha não resolve quando os grupos preservam prioridades incompatíveis."
  },
  "causa-verificacao-concorrente": {
    "source": "Continuous Delivery",
    "principle": "Lote pequeno, feedback cedo, caminho reproduzível",
    "why": "Pipeline nominal não substitui o comportamento sob pressão."
  },
  "estrutura-definida-centralmente": {
    "source": "Team Topologies",
    "principle": "Desenho organizacional é uma hipótese sobre fluxo, carga e interação",
    "why": "Incluir as pessoas afetadas e revisar efeitos após trabalho real permite adaptar a estrutura pela evidência, não apenas pela intenção de quem a desenhou."
  },
  "coordenacao-compensa-carga": {
    "source": "Team Topologies",
    "principle": "Fronteira, carga e modo de interação alinhados ao fluxo",
    "why": "Mais coordenação ou herói de contexto costuma compensar limite ruim, não resolvê-lo."
  },
  "estrutura-implicita": {
    "source": "Team Topologies",
    "principle": "Ownership e modo de interação explícitos reduzem negociação sob pressão",
    "why": "Explicitar quem decide, executa e apoia uma jornada permite testar a fronteira numa entrega real, sem inferir capacidade pelo organograma ou pelo cargo."
  },
  "resultado-sem-repriorizacao": {
    "source": "Lean / Accelerate",
    "principle": "Incentivo alinhado a resultado, não a ocupação",
    "why": "Cerimônia de OKR não mede maturidade; o que pesa na decisão sim."
  },
  "entrega-substitui-resultado": {
    "source": "Lean / Accelerate",
    "principle": "Incentivo alinhado a resultado, não a ocupação",
    "why": "Cerimônia de OKR não mede maturidade; o que pesa na decisão sim."
  },
  "portfolio-sem-feedback": {
    "source": "Lean / Accelerate",
    "principle": "Incentivo alinhado a resultado, não a ocupação",
    "why": "Cerimônia de OKR não mede maturidade; o que pesa na decisão sim."
  },
  "causa-funding-temporario": {
    "source": "Lean Product Development / gestão de produto",
    "principle": "Financiar capacidade e resultado, não apenas iniciativa temporária",
    "why": "O modelo é observado pela decisão de manter, mudar ou liberar capacidade depois da evidência, não pelo nome produto ou projeto."
  },
  "causa-responsabilidade-encerra-no-aceite": {
    "source": "Team Topologies",
    "principle": "Ownership durável do resultado ponta a ponta",
    "why": "A fronteira é avaliada pela autoridade e capacidade preservadas depois da entrega, não pelo desenho formal do time."
  },
  "causa-capacidade-tomada-pela-proxima-iniciativa": {
    "source": "Lean / Accelerate",
    "principle": "Capacidade protegida para fechar o ciclo de resultado",
    "why": "Medir sem reservar capacidade para decidir não produz aprendizado nem muda o sistema de investimento."
  },
  "causa-resultado-sem-autoridade": {
    "source": "Lean / Accelerate",
    "principle": "Evidência de resultado com poder para mudar o investimento",
    "why": "O incentivo real aparece quando uma evidência contrária pode interromper ou redirecionar trabalho já comprometido."
  },
  "divida-sem-capacidade-continua": {
    "source": "Arquitetura evolutiva / DDD",
    "principle": "Custo de mudança é reduzido durante a evolução cotidiana",
    "why": "Reservar melhoria proporcional na próxima alteração produz evidência contínua sobre defeitos, espera ou dependência sem aguardar uma iniciativa futura incerta."
  },
  "codigo-depende-de-especialista": {
    "source": "Arquitetura evolutiva / DDD",
    "principle": "Conhecimento crítico torna-se capacidade por colaboração e feedback reproduzível",
    "why": "Outra pessoa concluir uma mudança com verificações confiáveis demonstra transferência de execução; documentação ou presença do especialista isoladamente não demonstram isso."
  },
  "sustentabilidade-em-grande-lote": {
    "source": "Arquitetura evolutiva / DDD",
    "principle": "Sustentabilidade melhora no fluxo de mudanças presentes",
    "why": "Uma melhoria reversível na próxima mudança produz evidência de redução de custo agora, sem condicionar segurança e aprendizado a uma futura reescrita completa."
  },
  "migracao-coordenada-em-lote": {
    "source": "Arquitetura evolutiva / DDD",
    "principle": "Compatibilidade permite evolução desacoplada no tempo",
    "why": "Alterar em duas etapas e observar consumidores reduz a necessidade de uma janela única, preservando reversibilidade enquanto produtor e consumidores evoluem."
  },
  "contrato-implicito-fragil": {
    "source": "Arquitetura evolutiva / DDD",
    "principle": "Contrato verificável torna expectativa e compatibilidade observáveis",
    "why": "Formalizar um contrato crítico e verificá-lo durante a mudança do produtor antecipa quebra que consumidores hoje descobrem e compensam depois da integração."
  },
  "migracao-de-dados-contextual": {
    "source": "Dados como produto",
    "principle": "Migração segura explicita estado, repetição e reversibilidade",
    "why": "Casos representativos e uma operação idempotente tornam o estado encontrado verificável antes da implantação, reduzindo decisões improvisadas durante a execução."
  },
  "limites-escondem-distribuicao": {
    "source": "Data literacy / SRE",
    "principle": "Decisão com denominador, cauda e incerteza",
    "why": "Dashboard sem interpretação gera falsa precisão."
  },
  "confiabilidade-reativa-a-incidente": {
    "source": "SRE / blameless postmortem",
    "principle": "Detectar, correlacionar e aprender sem culpa",
    "why": "A prática é o ciclo de incidente, não a ferramenta de observabilidade."
  },
  "decisao-de-confiabilidade-concentrada": {
    "source": "Resilience engineering / SRE",
    "principle": "Objetivos e trade-offs distribuem a decisão de confiabilidade",
    "why": "Tornar risco, distribuição e limite visíveis permite que produto, engenharia e operação calibrem juntos uma decisão hoje concentrada no julgamento especialista."
  },
  "lideranca-coordena-handoffs": {
    "source": "Team Topologies",
    "principle": "Ownership do resultado reduz passagens que liderança precisa orquestrar",
    "why": "Dar autonomia sobre uma passagem de alta espera testa se a fronteira pode sustentar o resultado sem coordenação gerencial recorrente entre especialistas."
  },
  "otimizacao-local-pela-gestao": {
    "source": "Lean / Accelerate",
    "principle": "O fluxo ponta a ponta prevalece sobre metas locais de utilização",
    "why": "Medir espera no sistema e atribuir ownership ao gargalo compartilhado evita que cada área melhore sua ocupação enquanto aumenta fila ou transferência para outra etapa."
  },
  "mudanca-sistemica-em-grande-lote": {
    "source": "Lean / Accelerate",
    "principle": "Mudança sistêmica aprende por experimento pequeno antes de ampliar",
    "why": "Proteger capacidade para agir num gargalo produz evidência sobre o mecanismo e reduz risco de institucionalizar governança ou escopo amplo sobre uma hipótese não testada."
  },
  "portfolio-por-prioridade-executiva": {
    "source": "Lean / Accelerate",
    "principle": "Incentivo alinhado a resultado, não a ocupação",
    "why": "Cerimônia de OKR não mede maturidade; o que pesa na decisão sim."
  },
  "portfolio-paralelo-fragmenta-capacidade": {
    "source": "Lean / Accelerate",
    "principle": "Incentivo alinhado a resultado, não a ocupação",
    "why": "Cerimônia de OKR não mede maturidade; o que pesa na decisão sim."
  },
  "risco-visivel-sem-poder-de-decisao": {
    "source": "Governança habilitadora",
    "principle": "Evidência de risco precisa alcançar quem pode alterar o compromisso",
    "why": "Definir limiar e autoridade para parar, reduzir ou reordenar trabalho transforma risco conhecido em decisão, sem transferir responsabilidade a quem só observa."
  },
  "alerta-de-risco-depende-de-seguranca-pessoal": {
    "source": "Qualidade no fluxo",
    "principle": "Risco entra cedo; verificação é feedback, não fase",
    "why": "Suíte ou scanner presente não prova estratégia de qualidade."
  },
  "discovery-refina-solucao-dada": {
    "source": "Discovery e evidência de uso",
    "principle": "Discovery compara problemas e opções antes do compromisso",
    "why": "Contrastar hipóteses com pessoas afetadas e evidência de valor preserva a possibilidade de mudar a solução; detalhar uma escolha pronta apenas reduz incerteza de execução."
  },
  "discovery-substituida-por-patrocinio": {
    "source": "Discovery e evidência de uso",
    "principle": "Patrocínio autoriza teste, mas não substitui evidência",
    "why": "Um experimento reversível capaz de contrariar a hipótese separa urgência política de validade do problema sem exigir um investimento amplo antes de aprender."
  },
  "resultado-gera-ajuste-sem-revisar-direcao": {
    "source": "Lean / Accelerate",
    "principle": "Evidência de resultado decide manter, alterar ou encerrar investimento",
    "why": "Uma decisão explícita sobre direção impede que métricas sirvam apenas para otimizar execução enquanto a hipótese de valor e o compromisso permanecem intocados."
  },
  "resultado-sem-efeito-no-portfolio": {
    "source": "Lean / Accelerate",
    "principle": "Incentivo alinhado a resultado, não a ocupação",
    "why": "Cerimônia de OKR não mede maturidade; o que pesa na decisão sim."
  },
  "qualidade-por-suite-padrao": {
    "source": "Qualidade no fluxo",
    "principle": "Risco entra cedo; verificação é feedback, não fase",
    "why": "Suíte ou scanner presente não prova estratégia de qualidade."
  },
  "estrategia-de-qualidade-concentrada-no-qa": {
    "source": "Qualidade no fluxo",
    "principle": "Risco entra cedo; verificação é feedback, não fase",
    "why": "Suíte ou scanner presente não prova estratégia de qualidade."
  },
  "nao-funcionais-por-campanha": {
    "source": "Qualidade no fluxo",
    "principle": "Risco não funcional recebe feedback contínuo na mudança",
    "why": "Verificar desempenho, segurança ou resiliência no fluxo reduz o intervalo entre introduzir e descobrir risco que campanhas periódicas deixam acumular em lote."
  },
  "nao-funcionais-descobertos-em-producao": {
    "source": "Qualidade no fluxo",
    "principle": "Limites críticos são exercitados antes da exposição relevante",
    "why": "Carga ou falha representativa numa jornada crítica antecipa evidência sobre o limite, sem fingir que um ambiente de teste reproduz todo o comportamento de produção."
  },
  "seguranca-depende-de-reconhecimento-e-especialista": {
    "source": "Qualidade no fluxo",
    "principle": "Risco entra cedo; verificação é feedback, não fase",
    "why": "Suíte ou scanner presente não prova estratégia de qualidade."
  },
  "mudanca-aguarda-especialista": {
    "source": "Team Topologies",
    "principle": "Especialidade entra no fluxo para habilitar execução, não criar fila permanente",
    "why": "Colaboração temporária e documentação executável são verificadas quando outra pessoa conclui a mudança com segurança, reduzindo espera sem eliminar conhecimento especializado."
  },
  "aprendizado-tecnico-sem-caminho-repetivel": {
    "source": "Well-Architected / platform engineering",
    "principle": "Aprendizado vira capacidade quando outra pessoa consegue aplicá-lo",
    "why": "Usar a descoberta numa mudança real e registrar exemplos, limites e feedback testa transferência de execução, em vez de contabilizar curso, documento ou especialista disponível."
  },
  "recuperacao-cloud-depende-de-runbook": {
    "source": "Well-Architected / platform engineering",
    "principle": "Caminho suportado com guardrails, não fila artesanal",
    "why": "Time de plataforma, IDP ou console não é maturidade operacional."
  },
  "recuperacao-cloud-por-console": {
    "source": "Well-Architected / platform engineering",
    "principle": "Caminho suportado com guardrails, não fila artesanal",
    "why": "Time de plataforma, IDP ou console não é maturidade operacional."
  },
  "resiliencia-cloud-validada-periodicamente": {
    "source": "Well-Architected / platform engineering",
    "principle": "Caminho suportado com guardrails, não fila artesanal",
    "why": "Time de plataforma, IDP ou console não é maturidade operacional."
  },
  "incidente-e-unica-evidencia-de-resiliencia": {
    "source": "SRE / blameless postmortem",
    "principle": "Detectar, correlacionar e aprender sem culpa",
    "why": "A prática é o ciclo de incidente, não a ferramenta de observabilidade."
  },
  "eficiencia-cloud-por-meta-de-custo": {
    "source": "Well-Architected / platform engineering",
    "principle": "Caminho suportado com guardrails, não fila artesanal",
    "why": "Time de plataforma, IDP ou console não é maturidade operacional."
  },
  "eficiencia-cloud-reativa-a-fatura": {
    "source": "Well-Architected / platform engineering",
    "principle": "Caminho suportado com guardrails, não fila artesanal",
    "why": "Time de plataforma, IDP ou console não é maturidade operacional."
  },
  "eficiencia-cloud-por-campanha": {
    "source": "Well-Architected / platform engineering",
    "principle": "Caminho suportado com guardrails, não fila artesanal",
    "why": "Time de plataforma, IDP ou console não é maturidade operacional."
  },
  "eficiencia-cloud-sem-decisao-compartilhada": {
    "source": "Well-Architected / platform engineering",
    "principle": "Caminho suportado com guardrails, não fila artesanal",
    "why": "Time de plataforma, IDP ou console não é maturidade operacional."
  },
  "credencial-por-handoff": {
    "source": "Well-Architected — Security",
    "principle": "Identidade com privilégio mínimo e proteção de dados",
    "why": "O problema observado é credencial ou acesso, não a ausência de um produto de cofre."
  },
  "credencial-em-configuracao": {
    "source": "Well-Architected — Security",
    "principle": "Identidade com privilégio mínimo e proteção de dados",
    "why": "O problema observado é credencial ou acesso, não a ausência de um produto de cofre."
  },
  "identidade-compartilhada": {
    "source": "Well-Architected — Security",
    "principle": "Identidade com privilégio mínimo e proteção de dados",
    "why": "O problema observado é credencial ou acesso, não a ausência de um produto de cofre."
  },
  "retry-amplia-falha": {
    "source": "Resilience engineering / SRE",
    "principle": "Limites conscientes em dependências",
    "why": "A maturidade está em decidir espera, isolamento e falha, não em nomear uma biblioteca."
  },
  "espera-sem-limite": {
    "source": "Resilience engineering / SRE",
    "principle": "Limites conscientes em dependências",
    "why": "A maturidade está em decidir espera, isolamento e falha, não em nomear uma biblioteca."
  },
  "limite-cosmetico": {
    "source": "Resilience engineering / SRE",
    "principle": "Limites conscientes em dependências",
    "why": "A maturidade está em decidir espera, isolamento e falha, não em nomear uma biblioteca."
  },
  "incentivo-segue-entrega": {
    "source": "Lean / Accelerate",
    "principle": "Incentivo alinhado a resultado, não a ocupação",
    "why": "Cerimônia de OKR não mede maturidade; o que pesa na decisão sim."
  },
  "incentivo-opaco": {
    "source": "Lean / Accelerate",
    "principle": "Incentivo alinhado a resultado, não a ocupação",
    "why": "Cerimônia de OKR não mede maturidade; o que pesa na decisão sim."
  },
  "ia-sombra-sem-politica": {
    "source": "Uso responsável de assistência",
    "principle": "Supervisão proporcional, dados e entendimento",
    "why": "IA é contexto de trabalho; a capacidade avaliada continua sendo qualidade, segurança e aprendizado."
  },
  "ia-substitui-entendimento": {
    "source": "Uso responsável de assistência",
    "principle": "Supervisão proporcional, dados e entendimento",
    "why": "IA é contexto de trabalho; a capacidade avaliada continua sendo qualidade, segurança e aprendizado."
  },
  "ia-diagnostico-como-fato": {
    "source": "Uso responsável de assistência",
    "principle": "Supervisão proporcional, dados e entendimento",
    "why": "IA é contexto de trabalho; a capacidade avaliada continua sendo qualidade, segurança e aprendizado."
  },
  "camada-sem-revisao": {
    "source": "Arquitetura evolutiva / DDD",
    "principle": "Linguagem e limite visíveis na mudança",
    "why": "Glossário ou framework não medem maturidade; o termo que atravessa a entrega sim."
  },
  "prestigio-tecnico": {
    "source": "Arquitetura evolutiva / DDD",
    "principle": "Linguagem e limite visíveis na mudança",
    "why": "Glossário ou framework não medem maturidade; o termo que atravessa a entrega sim."
  },
  "celebra-media": {
    "source": "Data literacy / SRE",
    "principle": "Decisão com denominador, cauda e incerteza",
    "why": "Dashboard sem interpretação gera falsa precisão."
  },
  "ignora-base-pequena": {
    "source": "Data literacy / SRE",
    "principle": "Decisão com denominador, cauda e incerteza",
    "why": "Dashboard sem interpretação gera falsa precisão."
  },
  "termo-diverge-entre-times": {
    "source": "Arquitetura evolutiva / DDD",
    "principle": "Linguagem e limite visíveis na mudança",
    "why": "Glossário ou framework não medem maturidade; o termo que atravessa a entrega sim."
  },
  "glossario-adia-o-limite": {
    "source": "Arquitetura evolutiva / DDD",
    "principle": "Linguagem e limite visíveis na mudança",
    "why": "Glossário ou framework não medem maturidade; o termo que atravessa a entrega sim."
  },
  "espera-por-modo-implicito": {
    "source": "Team Topologies",
    "principle": "Fronteira, carga e modo de interação alinhados ao fluxo",
    "why": "Mais coordenação ou herói de contexto costuma compensar limite ruim, não resolvê-lo."
  },
  "contorno-para-nao-esperar": {
    "source": "Team Topologies",
    "principle": "Fronteira, carga e modo de interação alinhados ao fluxo",
    "why": "Mais coordenação ou herói de contexto costuma compensar limite ruim, não resolvê-lo."
  },
  "ameaca-so-em-checklist": {
    "source": "Qualidade no fluxo",
    "principle": "Risco entra cedo; verificação é feedback, não fase",
    "why": "Suíte ou scanner presente não prova estratégia de qualidade."
  },
  "ameaca-depois-do-incidente": {
    "source": "SRE / blameless postmortem",
    "principle": "Detectar, correlacionar e aprender sem culpa",
    "why": "A prática é o ciclo de incidente, não a ferramenta de observabilidade."
  },
  "achado-na-fila-de-excecao": {
    "source": "Qualidade no fluxo",
    "principle": "Risco entra cedo; verificação é feedback, não fase",
    "why": "Suíte ou scanner presente não prova estratégia de qualidade."
  },
  "achado-corrigido-no-caso": {
    "source": "Qualidade no fluxo",
    "principle": "Risco entra cedo; verificação é feedback, não fase",
    "why": "Suíte ou scanner presente não prova estratégia de qualidade."
  },
  "numero-diverge-sem-dono": {
    "source": "Dados como produto",
    "principle": "Significado com dono, recorte e evolução visível aos consumidores",
    "why": "Ferramenta de dados não pontua; o desencontro de número e a mudança silenciosa de definição sim."
  },
  "reconciliacao-artesanal-de-dado": {
    "source": "Dados como produto",
    "principle": "Significado com dono, recorte e evolução visível aos consumidores",
    "why": "Ferramenta de dados não pontua; o desencontro de número e a mudança silenciosa de definição sim."
  },
  "redefinicao-silenciosa-de-dado": {
    "source": "Dados como produto",
    "principle": "Significado com dono, recorte e evolução visível aos consumidores",
    "why": "Ferramenta de dados não pontua; o desencontro de número e a mudança silenciosa de definição sim."
  },
  "dado-espera-iniciativa": {
    "source": "Dados como produto",
    "principle": "Significado com dono, recorte e evolução visível aos consumidores",
    "why": "Ferramenta de dados não pontua; o desencontro de número e a mudança silenciosa de definição sim."
  },
  "design-chega-como-handoff": {
    "source": "Discovery e evidência de uso",
    "principle": "Experiência entra na decisão e volta com evidência",
    "why": "Ferramenta de design não pontua; handoff tardio e aprovação visual sem uso sim."
  },
  "design-como-opiniao": {
    "source": "Discovery e evidência de uso",
    "principle": "Experiência entra na decisão e volta com evidência",
    "why": "Ferramenta de design não pontua; handoff tardio e aprovação visual sem uso sim."
  },
  "interface-sem-retorno-de-uso": {
    "source": "Discovery e evidência de uso",
    "principle": "Experiência entra na decisão e volta com evidência",
    "why": "Ferramenta de design não pontua; handoff tardio e aprovação visual sem uso sim."
  },
  "aprovacao-visual-encerra": {
    "source": "Discovery e evidência de uso",
    "principle": "Experiência entra na decisão e volta com evidência",
    "why": "Ferramenta de design não pontua; handoff tardio e aprovação visual sem uso sim."
  },
  "acumulo-silencioso-de-tipos": {
    "source": "Team Topologies",
    "principle": "Fronteira, carga e modo de interação alinhados ao fluxo",
    "why": "Mais coordenação ou herói de contexto costuma compensar limite ruim, não resolvê-lo."
  },
  "heroi-troca-contexto": {
    "source": "Team Topologies",
    "principle": "Fronteira, carga e modo de interação alinhados ao fluxo",
    "why": "Mais coordenação ou herói de contexto costuma compensar limite ruim, não resolvê-lo."
  },
  "capacidade-nova-por-ticket-heroi": {
    "source": "Well-Architected / platform engineering",
    "principle": "Caminho suportado com guardrails, não fila artesanal",
    "why": "Time de plataforma, IDP ou console não é maturidade operacional."
  },
  "documentacao-substitui-caminho": {
    "source": "Well-Architected / platform engineering",
    "principle": "Caminho suportado com guardrails, não fila artesanal",
    "why": "Time de plataforma, IDP ou console não é maturidade operacional."
  },
  "caminho-desconhecido": {
    "source": "Platform as a Product",
    "principle": "Descoberta faz parte da experiência do caminho",
    "why": "Uma capacidade publicada mas impossível de encontrar não reduz carga nem dependência no trabalho real."
  },
  "caminho-conhecido-inacessivel": {
    "source": "Well-Architected — Security",
    "principle": "Acesso proporcional com escopo, validade e trilha",
    "why": "Conhecer o caminho não produz autonomia quando o caso comum ainda depende de favor ou privilégio amplo."
  },
  "caminho-inadequado-ao-caso": {
    "source": "Platform as a Product",
    "principle": "Caminho pavimentado resolve necessidades reais dos consumidores",
    "why": "Adoção não é obediência; contornos recorrentes podem demonstrar uma lacuna do produto interno."
  },
  "caminho-depende-de-ajuda-recorrente": {
    "source": "Well-Architected / platform engineering",
    "principle": "Consumidor conclui o caso comum sem intervenção especializada",
    "why": "Documentação e automação nominais não removem dependência quando o ponto de falha continua exigindo um herói."
  },
  "caminhos-equivalentes-fragmentados": {
    "source": "Platform as a Product",
    "principle": "Escolhas distintas correspondem a necessidades distintas",
    "why": "Alternativas equivalentes aumentam descoberta, manutenção e carga cognitiva sem ampliar capacidade."
  },
  "adocao-do-caminho-nao-observada": {
    "source": "Platform as a Product",
    "principle": "Adoção é medida da jornada, não do catálogo publicado",
    "why": "Entregar uma capacidade não mostra se consumidores a encontram, concluem ou abandonam."
  },
  "suporte-substitui-feedback-de-produto-interno": {
    "source": "Platform as a Product",
    "principle": "Feedback inclui consumidores silenciosos e contornos",
    "why": "Chamados mostram quem pediu ajuda, mas omitem quem abandonou ou resolveu fora do caminho."
  },
  "excecoes-nao-retornam-ao-caminho": {
    "source": "Platform as a Product",
    "principle": "Exceção gera aprendizado e decisão de produto interno",
    "why": "Uma exceção invisível transfere custo e impede distinguir necessidade recorrente de desvio temporário."
  },
  "excecao-controlada-com-retorno": {
    "source": "Platform as a Product",
    "principle": "Escape hatch possui dono, validade e ciclo de aprendizado",
    "why": "O caminho permanece seguro sem forçar casos legítimos a criar alternativas permanentes."
  },
  "governanca-compensa-feedback-tecnico": {
    "source": "Governança habilitadora",
    "principle": "Controle consome evidência confiável produzida no fluxo",
    "why": "Remover a aprovação antes de substituir a evidência desloca o risco; mantê-la depois disso preserva espera sem propósito."
  },
  "governanca-compensa-ownership": {
    "source": "Team Topologies",
    "principle": "Autoridade e responsabilidade acompanham o resultado",
    "why": "Uma reunião de aprovadores não substitui ownership verificável depois da decisão."
  },
  "segregacao-por-fila-manual": {
    "source": "Well-Architected — Security",
    "principle": "Separar autorização sem transformar execução em favor pessoal",
    "why": "Segregação legítima preserva independência e trilha; não exige que toda operação comum espere execução artesanal."
  },
  "aprovacao-sem-evidencia-decisoria": {
    "source": "Governança habilitadora",
    "principle": "Evidência precisa ser capaz de mudar a decisão",
    "why": "Registro de aceite sem decisão possível demonstra rito, não redução observável do risco."
  },
  "compliance-substitui-eficacia": {
    "source": "Governança habilitadora",
    "principle": "Conformidade e eficácia são evidências diferentes",
    "why": "Atender a obrigação não demonstra sozinho que o controle reduz o risco pretendido com custo proporcional."
  },
  "excecao-de-risco-renovada-sem-evidencia": {
    "source": "Governança habilitadora",
    "principle": "Exceção temporária reduz incerteza a cada revisão",
    "why": "Renovar prazo sem evidência nova transforma compensação em estado permanente invisível."
  },
  "incidente-apenas-adiciona-controle": {
    "source": "SRE / blameless postmortem",
    "principle": "Aprendizado muda o sistema sem acumular proteção cega",
    "why": "Adicionar etapas após falhas pode aliviar culpa sem tratar causa e sem revisar controles que perderam propósito."
  },
  "competencia-inexistente": {
    "source": "Aprendizagem aplicada / enabling team",
    "principle": "Adquirir capacidade com transferência no trabalho real",
    "why": "Curso isolado, contratação isolada ou consultoria isolada não demonstram que a organização consegue repetir a decisão."
  },
  "competencia-concentrada": {
    "source": "Team Topologies",
    "principle": "Colaboração temporária distribui decisão e execução",
    "why": "Documentar não reduz concentração enquanto prazo e risco continuam devolvendo todo trabalho à referência."
  },
  "competencia-bloqueada-por-acesso": {
    "source": "Well-Architected — Security",
    "principle": "Prática supervisionada com menor privilégio e trilha",
    "why": "Conhecimento não vira capacidade quando a política impede qualquer execução segura por outras pessoas."
  },
  "aprendizado-sem-oportunidade-pratica": {
    "source": "Aprendizagem aplicada / prática deliberada",
    "principle": "Aprender em uma tarefa real com feedback e limite",
    "why": "Conteúdo consumido não demonstra mudança de comportamento sem oportunidade de aplicação."
  },
  "competencia-dependente-de-fornecedor": {
    "source": "Team Topologies",
    "principle": "Dependência temporária transfere capacidade verificável",
    "why": "Acompanhamento passivo não reduz dependência se o fornecedor continua conduzindo toda mudança equivalente."
  },
  "aprendizado-impedido-por-carga": {
    "source": "Lean / Accelerate",
    "principle": "Aprendizado compete por capacidade real e limite de trabalho",
    "why": "Declarar prioridade de desenvolvimento sem retirar trabalho preserva a mesma escolha pelo especialista."
  },
  "capacitacao-medida-por-presenca": {
    "source": "Aprendizagem aplicada / prática deliberada",
    "principle": "Resultado de aprendizagem aparece na execução",
    "why": "Presença e satisfação medem a atividade, não quem consegue executar com segurança depois."
  },
  "matriz-de-competencia-sem-aplicacao": {
    "source": "Aprendizagem aplicada / prática deliberada",
    "principle": "Conhecimento declarado é validado por comportamento observável",
    "why": "A matriz não reduz dependência quando a distribuição do trabalho permanece igual."
  },
  "desenvolvimento-reforca-especialista": {
    "source": "Team Topologies",
    "principle": "Especialista habilita sem retomar a execução",
    "why": "Correção posterior protege o prazo imediato, mas ensina o sistema a concentrar novamente o próximo caso."
  },
  "servico-sem-responsavel": {
    "source": "Team Topologies / service ownership",
    "principle": "Responsabilidade ponta a ponta acompanha autoridade e resultado",
    "why": "Mantenedores por componente não substituem um grupo capaz de decidir e responder pelo serviço completo."
  },
  "responsabilidade-limitada-ao-codigo": {
    "source": "DevOps / Accelerate",
    "principle": "Feedback operacional retorna a quem muda o sistema",
    "why": "Separar entrega de operação alonga o feedback e dilui a decisão sobre o resultado."
  },
  "responsabilidade-compartilhada-sem-decisao": {
    "source": "Team Topologies / governança habilitadora",
    "principle": "Interação e direitos de decisão são explícitos",
    "why": "Participação ampla sem autoridade definida recria coordenação e escalada em toda ocorrência."
  },
  "responsabilidade-depende-de-especialista": {
    "source": "Team Topologies",
    "principle": "Capacidade e responsabilidade pertencem ao grupo, não ao herói",
    "why": "Duplicar a referência não remove a dependência enquanto decisões continuarem associadas a pessoas."
  },
  "legado-sem-modelo-recuperavel": {
    "source": "Working Effectively with Legacy Code",
    "principle": "Caracterizar o comportamento antes de alterar",
    "why": "O risco do legado vem da falta de feedback recuperável, não de sua idade ou tecnologia nominal."
  },
  "legado-muda-por-tentativa": {
    "source": "Working Effectively with Legacy Code / Continuous Delivery",
    "principle": "Descoberta vira proteção reproduzível em lote pequeno",
    "why": "Tentativa sem caracterização obriga a próxima mudança a redescobrir o mesmo comportamento."
  },
  "legado-congelado-ate-reescrita": {
    "source": "Strangler Fig / arquitetura evolutiva",
    "principle": "Reduzir risco por fatias reversíveis",
    "why": "Aposta integral posterga aprendizado e preserva o risco até o fim da migração."
  },
  "legado-dependente-de-fornecedor": {
    "source": "Gestão de fornecedores / aprendizagem aplicada",
    "principle": "Aceite inclui continuidade demonstrada pela organização",
    "why": "Documento entregue não prova que o grupo consegue avaliar, mudar e sustentar o legado."
  },
  "automacao-local-consistente": {
    "source": "Well-Architected / platform engineering",
    "principle": "Automação compartilhada é produto interno com suporte e observabilidade",
    "why": "Medir adoção, tempo e falhas por outros times verifica se a automação virou capacidade acessível, em vez de apenas uma prática eficaz no grupo de origem."
  },
  "integracao-frequente-fragil": {
    "source": "Continuous Delivery",
    "principle": "Lote pequeno, feedback cedo, caminho reproduzível",
    "why": "Pipeline nominal não substitui o comportamento sob pressão."
  },
  "excecao-controlada": {
    "source": "Infrastructure as Code / SRE",
    "principle": "Caminho emergencial preserva limite, auditoria e reconciliação",
    "why": "Transformar uma exceção recorrente em fluxo rápido e reconciliável mantém velocidade sem deixar estado paralelo, privilégio amplo ou correção posterior por memória."
  },
  "mudanca-emergencial-reconciliada": {
    "source": "Infrastructure as Code / SRE",
    "principle": "O caminho emergencial preserva fonte, validação e auditoria",
    "why": "Reconciliação automática remove o trabalho posterior sujeito a memória e pressão."
  },
  "ownership-compartilhado-explicito": {
    "source": "Team Topologies",
    "principle": "Fronteira, carga e modo de interação alinhados ao fluxo",
    "why": "Mais coordenação ou herói de contexto costuma compensar limite ruim, não resolvê-lo."
  },
  "divida-revista-por-efeito": {
    "source": "Arquitetura evolutiva / DDD",
    "principle": "Recorrência orienta prevenção no desenho e nos guardrails",
    "why": "Converter uma causa repetida em verificação ou limite de design testa redução de reincidência, indo além de priorizar cada ocorrência de dívida depois que reaparece."
  },
  "seguranca-concentrada-em-scanners": {
    "source": "Qualidade no fluxo",
    "principle": "Risco entra cedo; verificação é feedback, não fase",
    "why": "Suíte ou scanner presente não prova estratégia de qualidade."
  }
};
