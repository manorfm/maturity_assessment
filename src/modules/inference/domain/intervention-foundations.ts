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
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "integracao-tardia": {
    "source": "Continuous Delivery",
    "principle": "Lote pequeno, feedback cedo, caminho reproduzível",
    "why": "Pipeline nominal não substitui o comportamento sob pressão."
  },
  "dependencia-coordenada": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
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
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "mitigacao-sem-prevencao": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "solucao-local-nao-difundida": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "operacao-manual-fragil": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
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
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "feedback-tardio": {
    "source": "Discovery e evidência de uso",
    "principle": "Evidência de uso com poder de reabrir o investimento",
    "why": "Aceite de escopo não substitui a prova de que a hipótese vale o lote."
  },
  "prazo-sem-aprendizado": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "qualidade-como-handoff": {
    "source": "Qualidade no fluxo",
    "principle": "Risco entra cedo; verificação é feedback, não fase",
    "why": "Suíte ou scanner presente não prova estratégia de qualidade."
  },
  "verificacao-dependente-de-memoria": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
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
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
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
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "evolucao-em-grande-lote": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
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
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
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
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "dependencia-operacional-sob-urgencia": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
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
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
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
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
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
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "causa-privacidade-operacional": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "correcao-direta-na-producao": {
    "source": "Infrastructure as Code / SRE",
    "principle": "Uma única origem reproduzível também no caminho emergencial",
    "why": "Reconciliação e detecção de divergência impedem que console e fonte definam estados concorrentes."
  },
  "correcao-manual-de-dados": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "iteracao-orientada-a-escopo": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "ocupacao-como-progresso": {
    "source": "Lean / Accelerate",
    "principle": "Incentivo alinhado a resultado, não a ocupação",
    "why": "Cerimônia de OKR não mede maturidade; o que pesa na decisão sim."
  },
  "prioridade-sem-foco": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "bloqueio-depende-de-coordenador": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
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
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "causa-competencia-inacessivel": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "causa-dependencia-arquitetural": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "solucao-entregue-pronta": {
    "source": "Discovery e evidência de uso",
    "principle": "Restrições e hipóteses alteram a decisão antes do investimento",
    "why": "Comparar opções cedo permite que negócio, produto e competências técnicas mudem o desenho."
  },
  "decisao-concentrada": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "decisao-por-inercia": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "retrospectiva-sem-fechamento": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "melhoria-sem-prioridade": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "cerimonia-sem-adaptacao": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "processo-sem-autonomia": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "melhoria-reativa": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "mudanca-centralizada": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "causa-melhoria-sem-capacidade": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "causa-melhoria-sem-autonomia": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "causa-acoes-sem-foco": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "causa-baixa-seguranca-psicologica": {
    "source": "Qualidade no fluxo",
    "principle": "Risco entra cedo; verificação é feedback, não fase",
    "why": "Suíte ou scanner presente não prova estratégia de qualidade."
  },
  "mudanca-sobrescrita": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "fonte-nao-confiavel": {
    "source": "Continuous Delivery",
    "principle": "Lote pequeno, feedback cedo, caminho reproduzível",
    "why": "Pipeline nominal não substitui o comportamento sob pressão."
  },
  "comunicacao-de-mudanca-fragil": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
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
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
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
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "causa-verificacao-concorrente": {
    "source": "Continuous Delivery",
    "principle": "Lote pequeno, feedback cedo, caminho reproduzível",
    "why": "Pipeline nominal não substitui o comportamento sob pressão."
  },
  "estrutura-definida-centralmente": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "coordenacao-compensa-carga": {
    "source": "Team Topologies",
    "principle": "Fronteira, carga e modo de interação alinhados ao fluxo",
    "why": "Mais coordenação ou herói de contexto costuma compensar limite ruim, não resolvê-lo."
  },
  "estrutura-implicita": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
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
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "codigo-depende-de-especialista": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "sustentabilidade-em-grande-lote": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "migracao-coordenada-em-lote": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "contrato-implicito-fragil": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "migracao-de-dados-contextual": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
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
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "lideranca-coordena-handoffs": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "otimizacao-local-pela-gestao": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "mudanca-sistemica-em-grande-lote": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
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
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "alerta-de-risco-depende-de-seguranca-pessoal": {
    "source": "Qualidade no fluxo",
    "principle": "Risco entra cedo; verificação é feedback, não fase",
    "why": "Suíte ou scanner presente não prova estratégia de qualidade."
  },
  "discovery-refina-solucao-dada": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "discovery-substituida-por-patrocinio": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "resultado-gera-ajuste-sem-revisar-direcao": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
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
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "nao-funcionais-descobertos-em-producao": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "seguranca-depende-de-reconhecimento-e-especialista": {
    "source": "Qualidade no fluxo",
    "principle": "Risco entra cedo; verificação é feedback, não fase",
    "why": "Suíte ou scanner presente não prova estratégia de qualidade."
  },
  "mudanca-aguarda-especialista": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "aprendizado-tecnico-sem-caminho-repetivel": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
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
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "integracao-frequente-fragil": {
    "source": "Continuous Delivery",
    "principle": "Lote pequeno, feedback cedo, caminho reproduzível",
    "why": "Pipeline nominal não substitui o comportamento sob pressão."
  },
  "excecao-controlada": {
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
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
    "source": "Melhoria contínua",
    "principle": "Mudança pequena, dono, sinal de efeito",
    "why": "A intervenção ataca o comportamento observado, não um inventário de práticas."
  },
  "seguranca-concentrada-em-scanners": {
    "source": "Qualidade no fluxo",
    "principle": "Risco entra cedo; verificação é feedback, não fase",
    "why": "Suíte ou scanner presente não prova estratégia de qualidade."
  }
};
