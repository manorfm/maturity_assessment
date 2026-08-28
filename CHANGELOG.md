# Changelog

Este arquivo resume os marcos funcionais por versão. O comportamento vigente está
na [base de conhecimento](docs/knowledge-base/README.md); mudanças menores e a
cronologia técnica completa permanecem no
[histórico de evoluções](docs/history/completed.md).

## 0.26.0

- Reorganizou o relatório para uma mesa executiva: evidência observada, capacidade
  de execução, incerteza e decisão solicitada antecedem método e administração.
- Substituiu decimal e cobertura percentual do primeiro plano por estágio
  qualitativo e suficiência; agregou divergências relacionadas numa hipótese.

## 0.25.0

- Publicou oito pilares sociotécnicos e separou capacidade observada de solução e
  prontidão para executá-la, sem pontuar ferramentas ou práticas pela presença.

## 0.24.0

- O relatório passou a escolher um limitador de decisão (folha útil no piso, com
  finding; cloud aninhada fora do palco por default) e a fechar um cartão: efeito,
  restrição, classe de solução e menor passo da semana.
- O catálogo do tronco ganhou orientação tipada; Melhoria contínua deixou de ser
  o balde padrão de causa. A folha `sdlc-automation` passou a chamar-se Feedback
  técnico repetível. Tooltip do radar não fica sob o rótulo do eixo.

## 0.23.0

- O relatório gerencial passou a fechar um desfecho por página: um limitador, um
  próximo passo e uma decisão (preservar, corrigir, evoluir, discriminar ou
  evidência insuficiente), sem listar “e mais N” capacidades.
- Causas e findings deixaram de se repetir por folha; o suporte publicado usa a
  opção da causa, não o sintoma do nó pai. Calibração e revisão cognitiva ficam
  no rodapé do instrumento.

## 0.22.0

- Publicou o instrumento pré-piloto `evidence-anamnesis-pilot-v1`, ancorado em
  eventos recentes e protegido por auditoria editorial executável.
- Substituiu confiança por volume de sinais por agregação ordinal por pessoa,
  partial pooling fraco e intervalo beta-binomial de 90%.
- Removeu percentuais causais da interface, contextualizou experimentos e ampliou
  o protocolo de entrevista cognitiva. O schema 18 substitui diretamente o anterior.

## 0.21.0

- Publicou o grafo `evidence-anamnesis-v14` com alternativas comportamentais em
  ordem estável por participação, mantendo saídas observacionais no fim.
- Substituiu autodiagnóstico causal e termos julgadores por eventos reconhecíveis
  do cotidiano e adicionou auditorias de qualidade do instrumento.
- Separou título, mecanismo causal e ação; tornou fundamentos explícitos por padrão
  e contextualizou métrica, horizonte e critério dos experimentos.

## 0.20.0

- O showcase passou a gerar casos inspecionáveis (frágil com partição oculta,
  prática local, adaptativo com nove lentes e divergência triangulada), um índice
  com textos observados e convites ociosos para percorrer a entrevista à mão.

## 0.19.0

- Passou a mostrar tempo restante aproximado na entrevista e a pedir que a
  pessoa guarde o endereço de retomada; o convite original continua sem reabrir
  o percurso.
- O painel administrativo passou a registrar entrevistas cognitivas do
  instrumento, sem participação ou identidade, para a revisão de linguagem com
  cada disciplina.

## 0.18.0

- Publicou o grafo `evidence-anamnesis-v13` com perspectivas de arquitetura,
  segurança, dados e design, além de aprofundar carga cognitiva, linguagem na
  mudança, ameaça em alteração comum e caminho até capacidade de plataforma.
- O convite continua comum; a pessoa escolhe uma de nove lentes. Nenhum ramo
  pergunta ferramenta, DDD, Team Topologies ou IDP.

## 0.17.0

- Pré-declarou limiares do piloto (rótulos cegos, entrevistas cognitivas, falso
  positivo, parada incorreta, ECE, Brier e discordância entre avaliadores).
- Passou a persistir rótulos e revisões de item sem participação, convite ou
  resposta, e a recusar publicação automática de priors.
- O relatório passou a mostrar o gate de calibração e a manter o posterior
  provisório enquanto o piloto humano não completar.

## 0.16.0

- Distinguiu prática, “não observo” e “não se aplica”; só a prática pontua.
- Publicou o grafo `evidence-anamnesis-v12` com contexto aplicável de identidade,
  dependência, incentivo, assistência de modelo, complexidade acidental e leitura
  de sinal, sem criar pilares nem perguntar ferramenta.
- Ancorou recomendações em fundamento versionado e passou a persistir experimentos
  e capturas agregadas para comparar reaplicações sem identificar pessoas.

## 0.15.0

- Separou sintomas, causas e consequências no modelo causal.
- Passou a avaliar causas simultâneas de forma independente, considerando população
  aplicável, perspectivas, camadas e ausência neutra.
- Agrupou lacunas por capacidade e deixou de sugerir aprofundamentos inexistentes.
- Reestruturou o relatório para leitura executiva, radar semântico e recomendações
  orientadas a impacto, ação e resultado.

## 0.14.0

- Publicou a ontologia causal versionada no SQLite.
- Adicionou atualização bayesiana explicável em log-espaço e proteção contra dupla
  contagem de evidências correlacionadas.
- Implementou seleção de probes por ganho esperado de informação.
- Adicionou métricas offline para futura calibração com rótulos externos.

## 0.13.0

- Introduziu o recomendador especialista sem LLM.
- Substituiu rankings genéricos por confiança específica da intervenção, população
  aplicável, contradições pareadas e experimentos verificáveis.
- Tornou capacidade, camada e restrição metadados obrigatórios dos sinais.

## 0.12.0

- Publicou projeções explícitas por folha, camada e restrição.
- Auditou cobertura mínima de todas as folhas do catálogo.
- Adicionou ramos próprios para gestão, produto, qualidade, engenharia e
  plataforma/operações.

## 0.11.0

- Adotou seis capacidades sociotécnicas e separou cobertura temática de confiança.
- Permitiu que uma resposta produzisse efeitos explicáveis em múltiplas práticas.
- Ampliou cenários de produto, engenharia, dados, confiabilidade e liderança.

## 0.10.0

- Moveu cada aprofundamento de capacidade para uma página própria.
- Adicionou breadcrumb, retorno ao nível anterior e preservação do recorte
  organizacional.
- Diferenciou baixa maturidade, contradição e evidência insuficiente.

## 0.9.0

- Organizou capacidades em uma árvore recursiva com radares de drill-down.
- Separou fluxo de entrega do sistema de engenharia e posicionou cloud sob operação.
- Criou o showcase Playwright com cenários ruim, mediano e elite.

## 0.8.0

- Conectou comportamentos a múltiplas capacidades.
- Adicionou melhoria contínua, superfícies compartilhadas e classificação
  hierárquica limitada pelo elo mais frágil.

## 0.7.0

- Adicionou anamnese de incidentes, diagnóstico operacional, fluxo de trabalho,
  bloqueios e decisões antes da construção.

## 0.6.0

- Aprofundou entrega e integração, incluindo validação sob pressão, contradições e
  discriminação de causas prováveis.

## 0.5.0

- Tornou convites independentes de perfil e moveu a escolha da perspectiva para a
  jornada.
- Ampliou o assessment do SDLC e adicionou cópia de links e radar agregado.

## 0.4.0

- Concluiu o MVP com lotes de convites, revogação, reemissão, telas administrativas
  e API JSON protegida.

## 0.3.0

- Adaptou cenários ao perfil e adicionou triangulação protegida por grupo mínimo.

## 0.2.0

- Persistiu o grafo versionado, adicionou ramificações e validou ciclos, referências,
  saídas e nós inalcançáveis antes da publicação.

## 0.1.0

- Entregou o primeiro corte Node.js, Fastify e SQLite com projetos, hierarquia,
  convites únicos, participação anônima, inferência agregada e relatórios protegidos.
