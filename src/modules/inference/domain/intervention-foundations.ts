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
