# Changelog

Este arquivo resume os marcos funcionais por versão. O comportamento vigente está
na [base de conhecimento](docs/knowledge-base/README.md); mudanças menores e a
cronologia técnica completa permanecem no
[histórico de evoluções](docs/history/completed.md).

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
