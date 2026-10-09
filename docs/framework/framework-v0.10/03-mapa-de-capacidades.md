# 03 — Mapa de capacidades

> A árvore completa, as escadas de apropriação e o catálogo de sinais estão no
> [Anexo A](anexo-A-mapa-completo.md). Este documento resume a estrutura, define
> as perspectivas e mostra **o que falta para cada tema virar medida**.

## 1. Estrutura

| Sistema (home) | Domínio | Pilar do motor | Folhas vigentes |
|---|---|---|---|
| **Produto** | D1 Direção, valor e investimento | `product-value` | `product-direction`, `portfolio-management` |
| | D2 Produto, serviço e cliente | `product-value` | `discovery-validation` |
| **Engenharia** | D3 Fluxo e entrega | `delivery-flow` | `planning-refinement`, `work-management`, `continuous-integration`, `release-feedback` |
| | D4 Engenharia e qualidade | `engineering-quality` | `sustainable-design`, `quality-strategy`, `sdlc-automation`, `technical-capability` |
| | D5 Arquitetura e evolução | `architecture-evolution` | `domain-alignment`, `architecture-decisions`, `evolvability`, `integration-data` |
| | D6 Dados, analytics e IA *(proposto)* | *(hoje em `integration-data`)* | — |
| | D7 Plataforma e experiência de engenharia | `platform-experience` | `platform-autonomy`, `reproducible-infrastructure`, `cloud-efficiency` |
| | D9 Segurança, risco e resiliência | `security-risk` | `software-security`, `cloud-security` |
| **Operação** | D8 Operação e confiabilidade | `operations-reliability` | `observability-practice`, `reliability-practice`, `incident-management`, `cloud-reliability` |
| **Organização** | D10 Estrutura, governança e colaboração | `organizational-system` | `team-ownership`, `enabling-governance`, `collaboration` |
| | D11 Pessoas, liderança e clima | `organizational-system` | `leadership-management` |
| | D12 Direção, desempenho e aprendizado | `organizational-system` | `organizational-learning` |

**Proposta para o motor:** dividir o pilar `organizational-system` em três
pilares (`org-structure`, `org-people`, `org-direction`), reaproveitando as cinco
folhas atuais como mostrado acima. Criar o pilar `data-ai` quando pelo menos duas
folhas de D6 tiverem contrato (§3).

## 2. Perspectivas e contexto do respondente

### 2.1 Perspectivas (roteamento e triangulação)

| # | Perspectiva | Situação | O que costuma observar |
|---|---|---|---|
| 1 | **Direção executiva** (CEO, CTO, CIO, diretoria) | **Nova** | Estratégia, investimento, reação à má notícia, o que chega até ela |
| 2 | Gestão | Vigente | Portfólio, prioridade, pessoas, dependências |
| 3 | Produto | Vigente | Discovery, resultado, cliente |
| 4 | Design | Vigente | Experiência, evidência de uso |
| 5 | Engenharia | Vigente | Construção, integração, entrega, qualidade |
| 6 | Qualidade | Vigente | Risco, regressão, escapes |
| 7 | Arquitetura | Vigente | Limites, decisões, acoplamento |
| 8 | Plataforma / SRE | Vigente | Operação, recuperação, capacidade compartilhada |
| 9 | Segurança | Vigente | Ameaça, controle, exceção |
| 10 | Dados | Vigente | Significado, contratos, consumo analítico |

### 2.2 Contexto (não produz sinal)

| Variável | Faixas | Uso |
|---|---|---|
| Senioridade | início de carreira · intermediário · sênior · liderança | Triangulação (o júnior vê coisas que o sênior normalizou); acessibilidade do conhecimento |
| Tempo na organização | < 6 meses · 6–24 meses · > 2 anos | Onboarding (quem chegou há pouco vê o custo de entrada); normalização de problemas antigos |
| Responsabilidade, autoridade, alcance, eventos observáveis | vigente (`work-context`) | Roteamento |

Senioridade e tempo de casa **só** aparecem em recortes com ≥ 5 pessoas por faixa
e passam pela mesma proteção contra interseção das perspectivas (R5, R22). Na
dúvida, a faixa é fundida com a vizinha.

## 3. Situação dos temas

| Marca | Significado | Qtd. | O que falta |
|---|---|---|---|
| `[folha-id]` | Coberto por uma das 29 folhas | 29 folhas | Migrar para o novo contrato de evidência (04) |
| `[anexar: folha]` | Cabe numa folha existente | 16 | Acrescentar comportamentos à rubrica e perguntas. **Sem pesquisa nova** |
| `[rubrica]` | Literatura madura, falta autoria | 24 | Rubrica 0–4, 2+ eventos, perguntas, entrevista cognitiva |
| `[pesquisa]` | Evidência em formação ou desafio de método | 14 | Pesquisa antes da autoria (§4) |

### 3.1 Por domínio

| Domínio | anexar | rubrica | pesquisa |
|---|---|---|---|
| D1 Direção e investimento | 4 | — | — |
| D2 Produto | 2 | 1 | 2 |
| D3 Fluxo | — | 1 | — |
| D4 Engenharia (IA no SDLC) | — | — | 4 |
| D6 Dados e IA | 1 | 6 | 4 |
| D7 Plataforma | 1 | — | — |
| D9 Segurança | 2 | 2 | — |
| D10 Estrutura | — | 1 | — |
| D11 Pessoas e clima | 3 | 4 | 2 |
| D12 Direção e aprendizado | 3 | 9 | 2 |

### 3.2 Prioridade de autoria das `[rubrica]`

Critério: quantos sinais do catálogo (Anexo A §4) cada tema explica × quantos
domínios ele afeta × custo de autoria.

| Ordem | Tema | Sinais que explica | Por que primeiro |
|---|---|---|---|
| 1 | Indicador como termômetro + meta não atingida | S05, S06, S16, S20, S24, S31, S32, S42 | Afeta todos os domínios; é causa frequente de disfunção |
| 2 | Desdobramento estratégico + compreensão | S03, S29, S30, S33 | Explica trabalho sem propósito e prioridade divergente |
| 3 | Letramento em indicadores | S06, S16, S28 | Barato de tratar; alto poder diagnóstico |
| 4 | Voz e escuta | S12, S34, S35, S40 | Condição para os outros aprendizados |
| 5 | Forma de integração analítica + definição única de métrica | S14, S15 | Revela acoplamento e confiança no dado |
| 6 | Onboarding | S22, S23 | Aproveita a nova variável de tempo de casa |
| 7 | Cerimônias com efeito | S04 | Já tem ramo parcial no grafo (`work-management`) |

## 4. Agenda de pesquisa das `[pesquisa]`

| Tema | Pergunta de pesquisa | Método sugerido |
|---|---|---|
| IA no SDLC (adequação, contexto, revisão, agentes) | Quais comportamentos observáveis distinguem uso de IA que melhora o resultado de uso que só aumenta a sensação de produtividade? | Revisão da literatura 2025–2026 (DORA AI Capabilities, METR e sucessores); entrevistas com 10–15 times; confronto com telemetria |
| Operação de IA (ciclo de vida, evals, segurança, supervisão) | Que eventos recentes são comuns o bastante para ancorar perguntas ("a última vez que um modelo mudou de comportamento…")? | Levantamento de incidentes públicos de IA; OWASP LLM Top 10; NIST AI RMF; entrevistas |
| Postura de IA (impacto, redesenho do trabalho) | Como distinguir redesenho real de adoção nominal sem depender de telemetria? | Estudos de caso; MIT CISR; comparação entre estágios |
| Pessoa-função e tratamento de disfunção | Como observar decisões do sistema sobre pessoas sem permitir identificar ninguém (P2, P3, P8)? | Revisão ética; perguntas sobre padrões com lista de itens (07 §4.5); teste com comitê de ética e RH |
| Design de serviço e acessibilidade | Que eventos de entrega revelam (ou escondem) acessibilidade e serviço ponta a ponta? | Entrevistas com design e suporte; WCAG como referência de efeito, não de checklist |

## 5. Contrato mínimo para um tema virar folha pontuável

Um tema só pontua quando tiver todos os itens abaixo (04 detalha cada um):

1. **Rubrica** (`CapabilityReference`): propósito, 5 âncoras de comportamento e
   efeito, reação sob pressão, regressões, limites de interpretação.
2. **Pelo menos dois eventos independentes** (testlets diferentes) que a observem.
3. **Matriz Q**: cada opção declara âncora de estágio, camada e discriminação
   para esta folha.
4. **Perspectivas elegíveis**: quais lentes podem observá-la, e pelo menos duas.
5. **Vinheta de ancoragem** (para folhas organizacionais e de clima): uma
   situação hipotética comum a todas as perspectivas (07 §4.3).
6. **Entrevista cognitiva** com 5–8 pessoas por perspectiva elegível.
7. **Hipóteses causais** com priors elicitados (05 §8, 08).
8. **Condutas** com grau de evidência (08 §4).

## 6. Capacidades novas da v0.6

A análise de cobertura (13 §6) e o aprofundamento de padrão × caixa (14) propõem
16 capacidades novas (N13–N16 na v0.10):

| # | Capacidade | Domínio | Marca |
|---|---|---|---|
| N1 | Arquitetura corporativa e portfólio de aplicações | D5 | `[rubrica]` |
| N2 | Gestão de serviço | D8 | `[rubrica]` |
| N3 | Custo total de tecnologia | D1 + D7 | `[rubrica]` |
| N4 | Coerência do modelo operacional | D10 | `[pesquisa]` |
| N5 | Governança corporativa de TI | D12 | `[rubrica]` |
| N6 | Estratégia tecnológica situacional | D1 | `[rubrica]` |
| N7 | Padronização com variedade e reuso entre áreas | D10 + D7 | `[rubrica]` |
| N8 | Construção colaborativa e posse coletiva | D4 | `[anexar: technical-capability]` |
| N9 | Modos de interação entre times | D10 | `[anexar: collaboration]` |
| N10 | Error budget, toil e prontidão para produção | D8 | `[anexar: reliability-practice]` |
| N11 | Distribuição do fluxo | D1 | `[anexar: portfolio-management]` |
| N12 | Revisão de arquitetura por risco | D5 | `[anexar: architecture-decisions]` |
| N13 | Rede e conectividade em nuvem (24) | D7 | `[rubrica]` |
| N14 | Comunicação entre serviços e resiliência de chamada (24) | D8 / D5 | `[anexar: reliability-practice]` |
| N15 | Segurança de rede e Zero Trust (24) | D9 | `[rubrica]` |
| N16 | Postura de segurança de nuvem contínua (24) | D9 | `[anexar: cloud-security]` |

Com elas, o total passa a 23 `[anexar]`, 32 `[rubrica]` e 15 `[pesquisa]`.
Prioridade entre as novas: **N5** (governança corporativa de TI) e **N7**
(padronização com variedade), porque explicam restrições que aparecem em vários
domínios.

## 7. Decisão sobre o domínio D6

**Recomendação:** manter D6 como domínio no **mapa de referência** e no
relatório (Engenharia › Dados e IA). No motor, criar o pilar `data-ai` somente
quando `[rubrica]` "forma de integração" e "definição única de métrica" tiverem
contrato completo. Até lá, os sinais de dados alimentam `integration-data`.
