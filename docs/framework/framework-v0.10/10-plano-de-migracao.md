# 10 — Plano de migração para o agente de código

> Instruções para um agente aplicar a v0.5 no repositório
> `manorfm/maturity_assessment`. O agente deve seguir o `AGENTS.md` vigente
> (contexto obrigatório, TDD red/green/blue, manutenção documental, mensagem de
> commit ao final), exceto onde este plano o altera explicitamente (WP0).

## 1. Regras para o agente

1. **Documentação antes do código.** Cada pacote começa atualizando a base de
   conhecimento (`docs/knowledge-base/`) com o comportamento-alvo. Nada é
   implementado que contradiga a base de conhecimento.
2. **Princípios P1–P8 são invioláveis** (02). Se uma tarefa parecer exigir
   violá-los, parar e registrar a dúvida no backlog.
3. **TDD explícito** em todo comportamento novo: `red` (teste falhando pela razão
   certa), `green` (menor implementação), `blue` (refatoração com testes verdes).
4. **Números de referência.** Os exemplos numéricos de 05 §5.1, §7.3 e §8.4 viram
   testes de domínio com tolerância de 0,01 (a simulação com semente fixa).
5. **Coexistência de versões.** O modelo de medição novo (`m2`) entra atrás de uma
   opção de versão por projeto. O antigo (`m1`) só é removido quando os testes de
   paridade e os casos sintéticos do showcase passarem com `m2`.
6. **Versões:** grafo `evidence-anamnesis-pilot-v21`; parâmetros de medição `m2`;
   catálogo causal `causal-catalog-v11`; schema do banco incrementado (a base atual
   é recriada, regra vigente).
7. **Não fazer:** pontuar ferramenta; expor percurso individual; usar LLM para
   inferir estágio, causa ou conduta; publicar versão nova no meio de um piloto
   humano; remover testes vigentes sem substituí-los por equivalentes.

## 2. Mapa de dependências

```text
WP0 Documentação e constituição (inclui 12–17)
 ├─► WP1 Taxonomia e mapa de referência
 ├─► WP2 Perspectivas e contexto
 └─► WP3 Contrato de evidência (matriz Q)
        └─► WP4 Modelo de medição m2 ──► WP10 Laboratório (paralelo)
               ├─► WP5 Camada causal noisy-OR
               │      └─► WP9 Tratamento
               ├─► WP6 Motor adaptativo
               ├─► WP7 Tipos de item novos
               ├─► WP12 Eixo de sofisticação
               ├─► WP13 Capacidades novas e padrão × caixa
               └─► WP8 Relatório v2 ◄── WP9
                         ├─► WP11 Validação e piloto
                         ├─► WP15 Ciclo de evolução
                         └─► WP16 Exames complementares
WP10 Laboratório ──► WP14 Algoritmos e Laya
```

## 3. Pacotes de trabalho

### WP0 — Documentação e constituição

| Item | Ação |
|---|---|
| Arquivos | Copiar este pacote para `docs/framework/v0.5/`. Atualizar `docs/knowledge-base/README.md` (índice), `product-vision.md` (relatório-alvo, 01), `assessment-model.md` (medição, 05), `question-design.md` (tipos de item, 07), `recommendation-model.md` (tratamento, 08), `open-decisions.md` (aponta para 02) |
| `AGENTS.md` | Substituir "Princípios que não podem ser perdidos" por P1–P8 com link para 02; manter as demais seções |
| Backlog | Criar `docs/backlog/framework-v0.5-plan.md` com os WPs abertos; mover itens superados de `instrument-evolution-plan.md` e `probabilistic-inference-roadmap.md` |
| Aceite | Índices sem links quebrados; nenhuma contradição entre base de conhecimento e 02 |

### WP1 — Taxonomia e mapa de referência

| Item | Ação |
|---|---|
| `capability-taxonomy.ts` | Dividir o pilar `organizational-system` em `org-structure` (`team-ownership`, `enabling-governance`, `collaboration`), `org-people` (`leadership-management`) e `org-direction` (`organizational-learning`). **IDs de folha não mudam** |
| `organizational-areas.ts` | Home com 4 sistemas: Produto, Engenharia, Operação, **Organização** (R2) |
| Novo `capability-reference-map.ts` | Mapa de referência de 12 domínios com os temas marcados `[anexar]`, `[rubrica]`, `[pesquisa]` (03, Anexo A). Não pontua |
| Testes | Projeção da home com 4 sistemas; 29 folhas preservadas; nenhum tema de referência gera nota |

### WP2 — Perspectivas e contexto

| Item | Ação |
|---|---|
| `assessment-graph.ts` | Adicionar a perspectiva `executive` (direção executiva) com variantes nos eventos de estratégia, incidente, investimento e má notícia |
| `respondent-work-context.ts` | Senioridade (4 faixas) e tempo de casa (3 faixas) como contexto sem sinal |
| Anonimato | A supressão por partição passa a considerar as novas dimensões; faixa com < 5 é fundida com a vizinha |
| Testes | Contexto não gera sinal; relatório não mostra faixa com < 5; teste de interseção cobre as novas dimensões |

### WP3 — Contrato de evidência (matriz Q)

| Item | Ação |
|---|---|
| Tipos | `EvidenceLink` e `Option.evidence[]` conforme 04 §4.1; `AssessmentNode` ganha `taskFamily`, `testlet`, `pressure` |
| Migração | Converter todo `signals[]` para `evidence[]` com a tabela de 04 §4.2 (`weight` → `anchorStage`); `discrimination: 'medium'` inicial; marcar `appropriation` onde a opção descreve ritual ou heroísmo |
| Adaptador | Enquanto WP4 não termina, um adaptador deriva o `Signal` antigo a partir do `EvidenceLink` para o motor `m1` |
| Auditoria | Estender `scripts/audit-instrument.ts` com as 7 checagens de 04 §9 |
| Versão | `GRAPH_VERSION = 'evidence-anamnesis-pilot-v21'` |
| Aceite | `npm run audit:instrument` sem bloqueios; toda folha publicável com ≥ 2 testlets, âncora baixa e caminho até 4 |

### WP4 — Modelo de medição m2

| Item | Ação |
|---|---|
| Módulo | Novo `src/modules/measurement/domain/`: `observation-model.ts`, `unit-posterior.ts`, `layer-gates.ts`, `perspective-severity.ts`, `hierarchical-pooling.ts`, `index-aggregation.ts` (simulação com gerador de números aleatórios com semente), `divergence.ts`, `change-detection.ts`, `publication-rule.ts` |
| Parâmetros | `measurement-params-m2.json` com os valores de 05 §13 e validação de schema |
| Integração | `inference-service.ts` escolhe `m1` ou `m2` pela versão do projeto; `m2` padrão para projetos novos após aceite |
| Testes | Reproduzir 05 §5.1 (distribuições, índices, divergências) e 05 §7.3 (índice 42%, faixa 25–50%, mínimo puro 20%) com semente fixa; teste de propriedade: mais respostas concordantes nunca alargam a faixa; discordância alarga |
| Aceite | Casos sintéticos do showcase produzem leituras coerentes com a narrativa de cada caso (opaco, reativo, adaptativo) |

### WP5 — Camada causal noisy-OR

| Item | Ação |
|---|---|
| Tipos | `CausalFamily` (05 §12) substitui `DiagnosticFamilyDefinition` |
| Migração | Converter `causal-catalog-v10`: hipóteses → causas com prior; `likelihoods` → `λ` por sintoma; "desconhecido" → vazamento `λ₀`. Registrar a proveniência de cada parâmetro (autor, data, justificativa) |
| Motor | Inferência por enumeração 2^K; evidência por beta-binomial (05 §8.2); remover o expoente *ad hoc* e a regra "uma evidência por grupo" |
| Testes | Reproduzir 05 §8.4 (0,57/0,47/0,26 → 0,45/0,88/0,26 → 0,45/0,90/0,11) |
| Versão | `causal-catalog-v11` |

### WP6 — Motor adaptativo

| Item | Ação |
|---|---|
| `adaptive-question-selector.ts` | Utilidade em bits por minuto sobre a posterior da **unidade** (06 §2); restrições como filtros (06 §3); remover o escore linear |
| Amostragem matricial | Priorizar folhas da unidade com < 2 testlets (06 §4) |
| Parada | Regras de 06 §5 |
| Vinhetas | Rodízio de 1–2 vinhetas por respondente |
| Testes | Critérios de 06 §8 com um simulador de unidade sintética |

### WP7 — Tipos de item novos

Ordem: (1) vinhetas de ancoragem, (2) leitura (variável `literacy`), (3) itens
sobre o grupo em D11/D12, (4) técnica de lista, (5) texto livre (flag desligada
por padrão; remoção de PII; livro de códigos; fila de revisão humana no painel;
κ medido). Cada tipo com testes e auditoria próprios (07).

### WP8 — Relatório v2

| Item | Ação |
|---|---|
| Projeção | `diagnostic-report-v2` com o laudo (01 §4), substituindo a primeira tela do `interview-report-v1` |
| Ficha do nó | Um único template para qualquer nó (01 §6); rota por id de nó |
| Mapa | Três cortes (capacidade, estrutura, perspectiva) com matriz de divergência |
| Visual | Ponto + intervalo; *quantile dotplot* em SVG acessível; radar só no detalhe |
| Linguagem | Escala verbal de 01 §7; índice inteiro com faixa, cobertura, alvo e rodapé de calibração |
| Testes | Playwright: laudo com as 9 seções; ficha de subcapacidade abre isolada; nenhum decimal; nenhum recorte < 5 |

### WP9 — Tratamento

| Item | Ação |
|---|---|
| Contrato | Campos de 08 §6.1 em `intervention-foundations` e `solution-guidance` |
| Biblioteca | Arquétipos (08 §3) como conteúdo versionado; grau de evidência A–D em cada conduta |
| Restrição principal | Escore de 08 §4 no `transformation-portfolio` |
| Cynefin | Classificação por regras (08 §5) |
| Plano | Horizonte, autoridade, limite de 3 condutas ativas por autoridade |
| Pulso | Conjunto de itens-âncora por nó tratado |

### WP10 — Laboratório de modelo (offline)

| Item | Ação |
|---|---|
| Pasta | `lab/` fora do runtime (Python), com `requirements.txt` |
| Protótipos | `lab/prototypes/model.py` e `causal.py` (os números de 05) |
| E0 | Simulação e recuperação de parâmetros (09 §3) |
| Estimação | PyMC ou Stan para κ, δ, ρ, ψ, ω; Dawid–Skene; estudo G; DIF |
| Exportação | `measurement-params-m*.json` validado pelo schema do TS |
| Aceite | E0 atinge os critérios de 09 §3 antes do piloto |

### WP11 — Validação e piloto

Protocolo dos estudos E1–E10 em `docs/backlog/`; atualização dos limiares do
gate em `pilot-evaluation.ts` (09 §8); plano de amostragem (09 §4) exibido no
painel do projeto ("amostra abaixo do recomendado").

### WP12 — Eixo de sofisticação (12)

| Item | Ação |
|---|---|
| Tipos | `EvidenceLink.sophistication` (F0–F5) |
| Conteúdo | Opções das perguntas de evento das 12 trilhas de 12 §3 com fase declarada |
| Motor | Posterior de sofisticação por prática × unidade com o mesmo modelo de observação de 05 (escala 0–5), **fora do índice** (R28) |
| Relatório | Matriz sofisticação × apropriação na ficha e no walkthrough |
| Testes | Comprar ferramenta (F sobe) não altera o índice; a matriz classifica os 4 quadrantes |

### WP13 — Capacidades novas e cenário padrão × caixa (13, 14)

| Item | Ação |
|---|---|
| Mapa | N1–N12 no mapa de referência com as marcas de 03 §6 |
| Autoria | Contrato completo (03 §5) para N5 e N7 primeiro; escadas Q e R de 14 §4; sinais S43–S52 |
| Causal | Famílias "padrão-caixa" e "duplicação estrutural" (14 §6) |
| Condutas | As 8 condutas de 14 §7 no contrato de 08 §6.1 |

### WP14 — Algoritmos e Laya (15)

| Item | Ação |
|---|---|
| Laboratório | Otimização do plano de condutas (restrições de capacidade e dependência); centralidade no grafo causal; estatísticas de ajuste da pessoa |
| Portões | Cada algoritmo com volume mínimo declarado (15 §6); desligado até atingir |
| Laya | Experimento de 15 §5.3 no laboratório, atrás de flag; nada no runtime até κ ≥ 0,7 e ECE ≤ 0,08 (R32) |

### WP15 — Ciclo de evolução (16)

| Item | Ação |
|---|---|
| Fotografia | Captura imutável do relatório com versões e estrutura organizacional (R31) |
| Walkthrough | Projeção `area-walkthrough-v1` com as 8 seções de 16 §3 e a regra da próxima fase |
| Pulso | Campanha curta com itens-âncora das capacidades tratadas |
| Reavaliação | Relatório de evolução (avançou, regrediu, estável, incerto); tabela de correspondência de unidades; bloqueio de publicação sem itens-âncora |
| Testes | Reorganização entre leituras; unidade nova sem histórico; mudança dentro da faixa publicada como "incerto" |

### WP16 — Exames complementares (17 §3)

| Item | Ação |
|---|---|
| Primeiro exame | Importação de Git e CI/CD (lead time, frequência, idade de branch, tamanho de PR, taxa de falha) por serviço |
| Leitura | Separada da entrevista (R25), exibida lado a lado na ficha |
| Próximos | Registro de incidentes; faturas de nuvem; varredura de configuração |

### WP17 — Reescrita do banco de perguntas (19)

| Item | Ação |
|---|---|
| Auditoria | Acrescentar as métricas A1–A6 de 19 §1 e as regras E1–E8 de 19 §4 ao `audit:instrument`, com metas por versão |
| Reescrita | Cenários e probes vigentes no padrão novo; perguntas de pressão e generalização por folha; variantes de direção executiva |
| Mecânica | Escada por evento (19 §5.1); confirmação cruzada entre perspectivas (19 §5.3) |
| Aceite | Metas de 19 §6 atingidas; entrevistas cognitivas sem erro recorrente |

### WP18 — Dossiês de estado da arte (18, 21 §2)

| Item | Ação |
|---|---|
| Formato | Dossiê com as 12 seções de 18 §13 em `docs/knowledge-base/dossies/` |
| Conteúdo | Observabilidade (pronto); depois resposta a incidentes, entrega contínua, plataforma, indicadores e metas, organização e liderança |
| Integração | Cada dossiê alimenta rubrica, sinais, itens, família causal e condutas do seu tema |

### WP19 — Laya (20)

Fases de 20 §4, começando por L7 (apoio à autoria, útil já na WP17) e L3 (pedir
exemplo), atrás de flag e com as condições de 20 §3.

### WP20 — Prontidão para práticas avançadas (22)

| Item | Ação |
|---|---|
| Domínio | `AdvancedPractice` e `ReadinessAssessment` em `measurement/domain/`: pré-requisitos, `P(pronto)`, conforto, gargalo, adoção prematura |
| Conteúdo | Biblioteca de 12 práticas (22 §5), começando por chaos engineering, automação de qualidade e AI-DLC |
| Relatório | Seção de prontidão no laudo e na ficha; checklist de pré-requisitos com `p_k` |
| Testes | Reproduzir a tabela de 22 §1.2 (0,01 → 0,08 → 0,37); adoção prematura dispara com F ≥ 3 e essencial < 0,3 |

### WP21 — Grafo de habilitação (23)

| Item | Ação |
|---|---|
| Domínio | `EnablementEdge` (de, mínimo, habilita, degrau, tipo, força, comportamento-chave, origem) e `LearningFrontier` em `measurement/domain/`; `AdvancedPractice` (WP20) passa a ser caso particular |
| Conteúdo | Arestas de 23 §3.3; elicitação SHELF das demais; camadas de 23 §2 como metadado das folhas |
| Motor | Próxima fase do walkthrough restrita à fronteira; achado de salto de camada |
| Tratamento | Campos `learningMode` e `unlocks` nas condutas |
| Testes | Exemplo de 23 §6.2; aresta com P < 0,25 aparece como "bloqueado por"; conduta só com curso recebe aviso |

### WP22 — Infraestrutura: rede, comunicação entre serviços e segurança (24)

| Item | Ação |
|---|---|
| Mapa | N13–N16 no mapa de referência; escada de detecção e resposta |
| Conteúdo | Escadas de 24 §6, trilhas de 24 §7, sinais S63–S72, perguntas de 24 §10 no padrão de 19 |
| Prontidão | Service mesh e Zero Trust na biblioteca de práticas avançadas (22 §5) |
| Grafo | Arestas de 24 §12 no grafo de habilitação |
| Condutas | As 8 condutas de 24 §11 no contrato de 08 §6.1 |

## 4. Correspondência conceito → artefato

| Conceito v0.5 | Artefato atual | Artefato alvo |
|---|---|---|
| Matriz Q | `Signal` | `EvidenceLink` |
| Posterior do estágio | `CapabilityAssessment` | `measurement/unit-posterior.ts` |
| Severidade de perspectiva | — | `measurement/perspective-severity.ts` |
| Índice e faixa | `CapabilityTaxonomy.organize` | `measurement/index-aggregation.ts` |
| Divergência | Triangulação por média | `measurement/divergence.ts` |
| Causas | `BayesianInferenceEngine`, `DiagnosticModel` | `CausalFamily` noisy-OR |
| Seletor | `AdaptiveQuestionSelector` (escore linear) | Seletor por bits/min com restrições |
| Relatório | `interview-report-v1`, `finding-narrative-v1` | `diagnostic-report-v2` + ficha do nó |
| Tratamento | `intervention-foundations`, `solution-guidance` | Contrato 08 §6.1 |
| Gate | `pilot-evaluation.ts` | Limiares de 09 §8 |

## 5. Definição de pronto (para cada pacote)

- Base de conhecimento atualizada e sem contradição com o código.
- Testes novos cobrindo o comportamento; nenhum teste vigente removido sem
  substituto.
- `npm run check`, `npm test` e `npm run audit:instrument` sem erros.
- Linha curta em `docs/history/completed.md`; backlog sem o item concluído.
- Mensagem de commit sugerida ao final, no formato do `AGENTS.md`.
