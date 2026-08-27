# Histórico de evoluções concluídas

Este arquivo registra resultados incorporados. A especificação vigente permanece
em `docs/knowledge-base`; detalhes ainda futuros permanecem em `docs/backlog`.

Para uma visão resumida dos marcos por versão, consulte o
[`CHANGELOG.md`](../../CHANGELOG.md).

## 2026-08-27 — Infraestrutura do piloto e gate de calibração

- Limiares foram congelados na política da versão do modelo; rótulos cegos e
  entrevistas cognitivas passaram a persistir sem identificar pessoas; o gate
  bloqueia revisão de priors até a massa e as métricas caberem nos limiares, e
  mesmo então só cria uma versão `draft`. A especificação vigente está em
  [`recommendation-model.md`](../knowledge-base/recommendation-model.md). O trabalho
  humano restante permanece em
  [`probabilistic-inference-roadmap.md`](../backlog/probabilistic-inference-roadmap.md).

## 2026-08-27 — Higiene observacional, conteúdo aplicável e ciclo mínimo

- O grafo `evidence-anamnesis-v12` passou a oferecer três estados observacionais,
  contexto antes de identidade/credencial, resiliência de dependência, incentivo,
  assistência de modelo, complexidade acidental e sinal ruidoso, e recomendações
  com fundamento. Experimentos e capturas agregadas persistem no recorte elegível.
  A especificação vigente está em
  [`question-design.md`](../knowledge-base/question-design.md),
  [`adaptive-assessment-graph.md`](../knowledge-base/adaptive-assessment-graph.md) e
  [`recommendation-model.md`](../knowledge-base/recommendation-model.md).
  Restam piloto/calibração e ramos extras no
  [`plano de evolução`](../backlog/instrument-evolution-plan.md).

## 2026-08-27 — Plano de evolução do instrumento

- A auditoria do modelo virou um plano sequenciado em seis ondas (higiene, conteúdo
  aplicável, piloto, transformação, perspectivas, evidência externa), com recusa
  explícita de ferramenta como tema e critério para declarar o instrumento robusto.
  O plano está em
  [`instrument-evolution-plan.md`](../backlog/instrument-evolution-plan.md); o
  comportamento vigente não mudou.

## 2026-08-27 — README orientado ao produto

- O README deixou de acumular notas de versão e passou a explicar objetivo, jornada,
  modelo de avaliação, técnicas implementadas, arquitetura, operação e limites.
- A documentação principal detalha o cálculo direcional, inferência bayesiana,
  entropia e ganho de informação, priorização, métricas de calibração e o ciclo
  supervisionado necessário para aumentar robustez com massa real.
- Os marcos funcionais por versão foram consolidados no
  [`CHANGELOG.md`](../../CHANGELOG.md), mantendo este arquivo como histórico técnico.

## 2026-08-27 — Relatório executivo e radar semântico

- A apresentação passou a destacar estágio, risco, prioridade, impacto e ações;
  detalhes probabilísticos ficaram sob demanda, e o radar ganhou estados visuais,
  resumo em hover/foco e marcador neutro não navegável para evidência insuficiente.
  A semântica vigente está em
  [`assessment-model.md`](../knowledge-base/assessment-model.md) e
  [`technical-architecture.md`](../knowledge-base/technical-architecture.md).

## 2026-08-26 — Largura mínima para notas agregadas

- Ramos deixaram de publicar nível quando a evidência está concentrada em uma única
  folha; agora exigem ao menos 50% de cobertura e maioria de filhos avaliados.
- O relatório passou a informar quantas subcapacidades sustentam a publicação,
  evitando apresentar confiança populacional como abrangência do pilar.

## 2026-08-26 — Seis capacidades e cobertura temática

- O radar foi migrado para a taxonomia aprovada de seis capacidades, com folhas
  navegáveis e cloud aprofundada sob operação, confiabilidade e plataforma.
- Sinais passaram a produzir efeitos em múltiplas práticas e cobertura temática foi
  separada de confiança; folhas rasas não participam da classificação.
- O grafo ganhou situações sobre resultado de produto, sustentabilidade do código,
  contratos/dados, decisão de confiabilidade e liderança sistêmica, com variações
  por perspectiva e nova versão imutável do catálogo.

## 2026-08-26 — Taxonomia sociotécnica alvo aprovada

- A direção do MVP passou a separar estratégia de produto e valor, fluxo de entrega,
  engenharia e qualidade, arquitetura e evolução, operação/confiabilidade/plataforma
  e sistema organizacional.
- Foi explicitado que uma resposta pode gerar efeitos explicáveis em múltiplos ramos
  e que folhas sem cobertura discriminativa permanecem não avaliadas.

## 2026-08-26 — Navegação e diagnóstico do deep dive

- O breadcrumb ganhou tratamento visual responsivo e retorno explícito ao nível
  anterior, preservando o recorte organizacional durante o deep dive.
- Capacidades em nível crítico com evidência convergente deixaram de usar a mensagem
  de ausência de problema e passaram a indicar fragilidade confirmada e a próxima
  discriminação causal necessária.

## 2026-08-26 — Drill-down por página e showcase contínuo

- Os quatro eixos macro passaram a permanecer visíveis, com estados não avaliados
  distintos de baixa maturidade e nomes orientados a capacidades organizacionais.
- Cada explosão ganhou URL, breadcrumb, preservação do escopo hierárquico e
  diagnóstico seguro para sinais insuficientes ou contraditórios.
- O comando `npm run demo` agora executa o E2E completo e mantém os três resultados
  sintéticos disponíveis para exploração, sem preparação manual do banco;
  `showcase` permanece como alias.

## 2026-08-26 — Taxonomia navegável e showcase de maturidade

- Capacidades passaram a formar uma árvore recursiva com radares de drill-down;
  fluxo foi separado do sistema de engenharia e cloud ficou sob arquitetura/operação.
- Adicionado acesso explícito a projetos existentes e showcase Playwright persistente
  com cinco respostas para cenários ruim, mediano e elite, incluindo URLs no console.
- Corrigida a interação dos pontos do radar e calibrado o sinal adaptativo de melhoria
  protegida no fluxo em uma nova versão imutável do grafo. Consulte
  [modelo de avaliação](../knowledge-base/assessment-model.md) e
  [arquitetura técnica](../knowledge-base/technical-architecture.md).

## 2026-08-26 — Interações do editor de hierarquia restauradas

- Corrigida a serialização das folhas que invalidava o JavaScript entregue ao
  navegador; um teste agora compila os scripts da página para prevenir regressão.

## 2026-08-26 — Editor visual da estrutura organizacional

- A criação do projeto substituiu caminhos digitados manualmente por uma árvore
  visual livre, com raízes, filhos e validação preventiva de nomes, duplicidades,
  profundidade e quantidade. Consulte [estrutura organizacional](../knowledge-base/organizational-model.md).

## 2026-08-26 — Convites vinculados às folhas da estrutura

- A hierarquia permaneceu livre em nomes e profundidade, enquanto convites passaram
  a ser aceitos somente nas folhas; níveis intermediários consolidam resultados e
  continuam limitados pelo descendente elegível mais frágil. Consulte
  [estrutura organizacional](../knowledge-base/organizational-model.md).

## 2026-08-26 — Diagnóstico agrupado por capacidade

- O relatório deixou de repetir uma lista plana e passou a apresentar, dentro de
  cada área do radar, o problema identificado e o que precisa ser corrigido; a API
  expõe a mesma estrutura agregada por área. Consulte [modelo de avaliação](../knowledge-base/assessment-model.md)
  e [API](../knowledge-base/api.md).

## 2026-08-25

- Criada a fundação do assessment comportamental, seus pilares e limites éticos.
- Definida arquitetura inicial Node.js/TypeScript, monólito modular e SQLite.
- Definidos projetos, convites únicos, participação anônima e proteção de respostas.
- Adicionadas hierarquias configuráveis e relatórios locais, globais e transversais.
- Definido grafo adaptativo versionado para cenários, inferências e recomendações.
- Formalizados perfis como lentes de uma maturidade sociotécnica compartilhada.
- Criado `AGENTS.md` para preservar contexto e disciplina documental entre sessões.
- Entregue o primeiro corte Node.js/Fastify/SQLite: criação de projeto e hierarquia,
  convites únicos, participação anônima, cinco cenários, inferência agregada e telas.
- Adicionados testes para uso único, separação convite/participação, limiar de
  relatório, finding agregado e proteção HTTP contra reabertura do convite.
- Persistido o grafo versionado em tabelas SQLite e adicionados ramos de investigação
  para entrega manual, qualidade tardia/dados e governança.
- Entregues findings por subárvore organizacional com supressão conservadora de
  partições pequenas e testes contra inferência por subtração.
- Adicionada validação de publicação contra ciclos, referências inválidas, opções
  sem saída e nós inalcançáveis; versão da aplicação avançada para 0.2.0.
- Registrada a convenção permanente de encerrar interações com uma mensagem curta
  de commit em inglês, no passado e baseada no trabalho concluído.
- Entregue a versão 0.3.0 com cenários adaptados ao perfil e triangulação entre
  perspectivas protegida por limiar mínimo por grupo.
- Introduzidos value objects para projeto, hierarquia, perfil e quantidade, além de
  transações reutilizáveis e tratamento HTTP universal de erros seguros.
- Aplicado ciclo red/green/blue, ampliada a suíte para onze testes e ativadas
  verificações contra símbolos não usados; código e CSS mortos foram removidos.
- Concluído o MVP na versão 0.4.0 com lotes de convites, estados agregados,
  revogação, reemissão única, telas administrativas e API JSON autenticada.
- Implantadas migrações incrementais com backfill dos convites existentes e
  tratamento seguro de corpos ausentes ou malformados.
- Verificados os dez critérios de conclusão do MVP com quinze testes, tipagem
  estrita, build e revisão de vazamento e código morto.
- Evoluída a entrevista para quinze nós de SDLC, com perspectiva escolhida pelo
  participante, convites sem perfil, cópia de links e radar agregado de capacidades.
- Aprofundado o ramo de entrega com validação sob pressão, discriminação de causas,
  confiança sensível a contradições e radar navegável com próximos passos.
- Adicionados deep dives de incidentes e fluxo de trabalho, com variantes por
  perspectiva, causas sociotécnicas e recomendações condicionadas ao diagnóstico.

## 2026-08-26

- Adicionados sinais entre capacidades, melhoria contínua, contexto de superfície
  compartilhada e classificação hierárquica limitada pelo elo mais frágil.
- Entregue a versão 0.12 com projeções explícitas por folha, camada e restrição,
  auditoria de cobertura completa, ramos por perspectiva e showcase multiperfil.
- Corrigida a seleção de problemas por folha, incluindo efeitos cruzados, e separada
  a comunicação de força sustentada da ausência de causa negativa recorrente.
- Removidas migrações e leituras retrocompatíveis; bancos novos usam apenas o schema
  vigente e o recomendador auditável foi inicialmente delimitado.
- Entregue o recomendador simbólico de grupo sem LLM, sensível a coocorrência,
  camadas, restrições e contradições, com justificativas no relatório e na API.
- Adicionadas recomendações de evolução para capacidades fortes abaixo de 4 e
  removida a casa decimal da apresentação de níveis inteiros.
- Substituído o ranking compartilhado por confiança específica da intervenção,
  população aplicável, contradições pareadas e experimentos executáveis; os 204
  sinais passaram a declarar seus metadados sem projeção textual.

## 2026-08-27

- Entregue a versão 0.14 com ontologia causal persistida, posterior bayesiano
  explicável, proteção contra dupla contagem e hipóteses alternativas no relatório.
- Adicionada seleção de probes por ganho esperado de informação, perfil, validação,
  custo e orçamento de cinco aprofundamentos, com snapshots privados da decisão.
- Implementadas métricas offline de Brier, calibração, precisão e recall para uso
  exclusivo com futuros rótulos externos; a interface explicita ausência de
  calibração empírica.
- Corrigido o ciclo do showcase para recriar o SQLite somente antes do E2E e
  preservar os projetos quando o servidor de inspeção assume a porta.
- Entregue a versão 0.15 com causas simultâneas independentes, posterior sensível à
  prevalência e observabilidade, ausência neutra e lacunas agrupadas por capacidade.
- Removidas sugestões genéricas de aprofundamento quando não existe probe elegível
  e diferenciada a confiança da maturidade do posterior causal.
