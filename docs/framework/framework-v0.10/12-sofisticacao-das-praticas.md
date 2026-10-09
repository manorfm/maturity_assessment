# 12 — Sofisticação das práticas: o segundo eixo

> Resposta à pergunta sobre o modelo "de fases" por prática (observabilidade,
> SRE, cloud…), como o que a IBM usa em assessments técnicos: uma prática
> progride de instrumentação manual até resposta automatizada, e o assessment diz
> em que fase ela está. A v0.6 incorpora essa ideia como **segundo eixo**, sem
> ferir P1.

## 1. Dois eixos, não um

| Eixo | Pergunta | Escala | Exemplo (canary) |
|---|---|---|---|
| **Sofisticação** (fase técnica) | O que o mecanismo **consegue fazer** hoje? | F0–F5 | F3: promoção automática por comparação com a versão atual |
| **Apropriação** (estágio 0–4) | O quanto a organização **entende e usa** o mecanismo para decidir e aprender? | 0–4 (rubrica) | 1: a policy existe, mas ninguém confia e todos promovem na mão |

Os eixos se combinam numa matriz com leituras e tratamentos diferentes:

| | Apropriação baixa (0–1) | Apropriação alta (3–4) |
|---|---|---|
| **Sofisticação alta (F3–F5)** | **Ferramenta sem cultura.** Investimento feito, efeito não aparece; risco de ritual. Tratar propósito, clima e uso | **Maturidade plena.** Preservar; vigiar regressão |
| **Sofisticação baixa (F0–F2)** | **Início.** Construir mecanismo e entendimento juntos, em pequeno | **Cultura sem ferramenta.** O time sabe o que quer, mas depende de heroísmo. Investir no mecanismo: é onde a ferramenta tem retorno alto |

**Por que isso não fere P1:** a sofisticação não é medida pela presença de
ferramenta ("vocês têm Datadog?"), e sim pelo **que aconteceu no último evento**
("como o último problema de produção foi detectado: por um cliente, por alguém
olhando um painel, por um alerta, ou corrigido automaticamente?"). É
comportamento do sistema técnico, observado por evento.

**Regra:** a sofisticação é exibida na ficha do nó e alimenta a escolha da
conduta; **não entra no índice de maturidade**. O índice continua sendo a
apropriação (estágio). Assim, comprar ferramenta não sobe a nota.

## 2. Fases genéricas

| Fase | Nome | Característica |
|---|---|---|
| F0 | Inexistente | O mecanismo não existe; o evento é tratado quando alguém percebe |
| F1 | Manual | Existe, depende de pessoas executando passos |
| F2 | Padronizado | Procedimento definido e repetível, ainda com passos manuais |
| F3 | Automatizado | O mecanismo executa sozinho o caso comum |
| F4 | Orientado por objetivo | O mecanismo decide com base em objetivos explícitos (SLO, risco, custo) |
| F5 | Autônomo e adaptativo | O mecanismo corrige e se ajusta; humanos supervisionam e melhoram o mecanismo |

F5 não é alvo universal (P6). Para muitos contextos, F3 é suficiente.

## 3. Trilhas por prática

Cada trilha tem a pergunta de evento que discrimina a fase. As fases viram
opções da pergunta, com `sophistication` declarado na matriz Q (04).

### 3.1 Observabilidade

> Versão revisada com o estado da arte em [18 §7](18-dossie-observabilidade.md).

| Fase | Comportamento no último evento |
|---|---|
| F0 | O problema foi descoberto pelo cliente; não havia como investigar |
| F1 | Alguém acessou servidor ou pod e leu logs à mão |
| F2 | Logs e métricas centralizados; busca manual por texto |
| F3 | Telemetria correlacionada (trace atravessa serviços); do sintoma ao deploy em minutos |
| F4 | Alertas por sintoma e consumo de SLO; painéis por jornada de usuário |
| F5 | Detecção de anomalia e correlação automática de causa provável; hipótese pronta quando o humano chega |

**Pergunta:** "No último comportamento estranho em produção, como ele foi
percebido e quais foram os primeiros passos para entender o que acontecia?"

### 3.2 Resposta a incidentes

| Fase | Comportamento |
|---|---|
| F0 | Não há papel nem canal; quem vê resolve |
| F1 | Grupo de conversa e pessoas-chave chamadas à mão |
| F2 | Plantão definido, severidades e runbooks escritos |
| F3 | Acionamento automático, papéis de comando, comunicação com template, runbooks executáveis |
| F4 | Decisão guiada por impacto no SLO e no cliente; revisão com fatores contribuintes e ações acompanhadas |
| F5 | Remediação automática dos casos conhecidos; humanos tratam o novo e melhoram a automação |

### 3.3 Integração contínua

| Fase | Comportamento |
|---|---|
| F0 | Integração no fim, em lote |
| F1 | Build manual; merge em janela |
| F2 | Build automatizado em branches; integração semanal |
| F3 | Integração diária no tronco; testes automáticos rápidos a cada mudança |
| F4 | Feature flags separam integração de liberação; build quebrado é prioridade de todos |
| F5 | Pipeline se adapta ao risco da mudança (testes seletivos, análise de impacto) |

### 3.4 Entrega e liberação

| Fase | Comportamento |
|---|---|
| F0 | Deploy artesanal por uma pessoa |
| F1 | Roteiro manual em janela noturna |
| F2 | Deploy por script padronizado; aprovação manual |
| F3 | Deploy automatizado e reversível sob demanda |
| F4 | Exposição progressiva com análise canary × controle ligada a SLO |
| F5 | Promoção e reversão automáticas; aprendizado alimenta testes e arquitetura |

### 3.5 Infraestrutura e ambientes

| Fase | Comportamento |
|---|---|
| F0 | Servidores configurados à mão, sem registro |
| F1 | Console e scripts soltos (ClickOps) |
| F2 | Infraestrutura como código em parte; drift frequente |
| F3 | Tudo como código, revisado; ambientes recriáveis |
| F4 | Ambientes efêmeros por mudança; políticas como código |
| F5 | Reconciliação contínua (GitOps) e autocorreção de drift |

### 3.6 Qualidade e testes

| Fase | Comportamento |
|---|---|
| F0 | Teste manual no fim, por quem estiver disponível |
| F1 | Roteiro manual de regressão |
| F2 | Testes automatizados de parte do sistema, instáveis |
| F3 | Testes rápidos e confiáveis por mudança; contratos entre serviços |
| F4 | Estratégia por risco; testes de propriedade, mutação, desempenho |
| F5 | Testes guiados por dados de produção e por incidentes; seleção automática por impacto |

### 3.7 Segurança no ciclo de desenvolvimento

| Fase | Comportamento |
|---|---|
| F0 | Segurança só em auditoria ou após incidente |
| F1 | Revisão manual pontual antes de grandes lançamentos |
| F2 | Checklists e varreduras periódicas |
| F3 | Varredura automática no pipeline; segredos fora do código |
| F4 | Modelagem de ameaça na mudança comum; proveniência (SLSA); exceções com prazo |
| F5 | Controles adaptativos por risco; detecção e resposta automatizadas |

Referência de trilhas equivalentes: OWASP SAMM (níveis por prática) e BSIMM
(atividades observadas em empresas reais).

### 3.8 Capacidade e escala

| Fase | Comportamento |
|---|---|
| F0 | Réplicas fixas; ninguém sabe a capacidade |
| F1 | Alguém escala à mão, às vezes de madrugada |
| F2 | Pré-escala agendada para picos conhecidos |
| F3 | Autoscaling por sinal de demanda, testado com carga |
| F4 | Capacidade planejada com negócio; custo por transação acompanhado |
| F5 | Escala preditiva; dependências protegidas automaticamente |

### 3.9 FinOps e custo

| Fase | Comportamento |
|---|---|
| F0 | Fatura chega e ninguém sabe o que é |
| F1 | Alguém analisa a fatura mensalmente, à mão |
| F2 | Tags e alocação por dono; relatórios periódicos |
| F3 | Custo visível para o time que gasta; alertas de anomalia |
| F4 | Unit economics (custo por cliente ou transação) nas decisões de produto e arquitetura |
| F5 | Otimização automática (direitos, reserva, desligamento) com guardrails |

As fases F1–F3 correspondem aproximadamente a *crawl*, *walk*, *run* do FinOps.

### 3.10 Integração operacional → analytics

| Fase | Comportamento |
|---|---|
| F0 | Planilha exportada à mão |
| F1 | Leitura direta do banco de produção |
| F2 | ETL batch para data warehouse |
| F3 | CDC ou eventos com contrato de dados |
| F4 | Camada semântica única; qualidade de dados monitorada |
| F5 | Dados como produto por domínio; consumo quase em tempo real para decisões |

### 3.11 Operação de modelos e IA

> Para engenharia com IA e AI-DLC, ver a trilha de [22 §4.4](22-prontidao-para-praticas-avancadas.md).

| Fase | Comportamento |
|---|---|
| F0 | Modelo ou prompt em produção sem versão nem avaliação |
| F1 | Avaliação manual antes de publicar |
| F2 | Versionamento de modelo, prompt e dados |
| F3 | Avaliação automatizada (evals) a cada mudança; monitoramento de custo e erro |
| F4 | Detecção de drift e reavaliação contínua; guardrails de segurança |
| F5 | Retreino ou ajuste automático supervisionado; incidentes de IA com revisão própria |

### 3.12 Gestão de fluxo

| Fase | Comportamento |
|---|---|
| F0 | Sem visibilidade do trabalho |
| F1 | Quadro sem políticas, atualizado quando alguém lembra |
| F2 | Quadro com etapas e limites de WIP definidos |
| F3 | Métricas de fluxo automáticas (tempo de ciclo, idade, throughput) |
| F4 | Previsão probabilística; fluxo entre times visível |
| F5 | Fluxo de ponta a ponta (ideia → valor) medido e otimizado continuamente |

## 4. Como a conduta usa os dois eixos

| Situação | Conduta típica |
|---|---|
| F alto, apropriação baixa | Não comprar nada. Tratar propósito, uso e confiança: treino aplicado, revisão de um caso real, remover o contorno manual |
| F baixo, apropriação alta | Investir no próximo degrau de F; o retorno é alto porque o uso já existe |
| F e apropriação baixos | Menor experimento que suba os dois um degrau num único serviço |
| F e apropriação altos | Preservar; generalizar o princípio para outras práticas |
