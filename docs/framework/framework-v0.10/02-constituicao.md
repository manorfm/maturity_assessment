# 02 — Constituição: princípios e regras

**Princípio** é o porquê do produto. Quebrá-lo transforma o produto em outra
coisa: um checklist, uma ferramenta punitiva, uma opinião vendida como fato.
**Regra** é uma decisão de implementação que serve a um princípio num momento do
produto. Uma regra pode ser quebrada quando uma alternativa serve **melhor** ao
mesmo princípio, e a quebra precisa dizer qual.

> Proposta para o repositório: esta constituição substitui a seção "Princípios que
> não podem ser perdidos" do `AGENTS.md` e a lista de decisões de
> `open-decisions.md`, que passam a apontar para cá (10, pacote WP0).

## 1. Princípios (invioláveis)

| # | Princípio | O que proíbe |
|---|---|---|
| **P1** | **Comportamento e efeito, não presença.** Maturidade é o que acontece no trabalho real e o que isso produz, inclusive sob pressão | Pontuar ferramenta, framework, cargo, rito ou vocabulário |
| **P2** | **Sistema antes de pessoa.** O instrumento diagnostica o sistema de trabalho; bloqueios impostos pela organização não são atribuídos a quem os sofre | Avaliação individual; ranking de pessoas; nomear "o problema" |
| **P3** | **Segurança de quem responde.** Anonimato real, participação única, agregação mínima, nenhum acesso de gestor a respostas individuais | Qualquer recorte que permita reidentificar alguém |
| **P4** | **Honestidade epistêmica.** Toda conclusão mostra evidência, contradição, incerteza e lacuna; ausência de evidência não vira zero nem "sem problema" | Falsa precisão; inventar causa; esconder incerteza |
| **P5** | **Múltiplas lentes sobre o mesmo sistema.** Perfis diferentes observam o mesmo evento; a divergência é informação | Diagnóstico por uma única voz, inclusive a da direção |
| **P6** | **Contexto define o alvo.** A referência de alta performance é régua; o alvo de cada capacidade depende do contexto e do valor para aquela organização | Régua única de "nível máximo em tudo" |
| **P7** | **Conhecimento que gera direção.** O relatório explica o que acontece, o que a literatura diz e qual o próximo experimento útil | Nota sem causa; recomendação genérica; relatório opaco |
| **P8** | **Não causar dano.** O instrumento não vira meta, pretexto de demissão nem vigilância | Índice em bônus; sinais usados para identificar pessoas |

## 2. Regras

Legenda: **Manter** · **Alterar** (mudança de grau) · **Quebrar** (substituição).
Regras R1–R18 vêm da v0.4; R19–R27 são novas na v0.5.

### 2.1 Relatório e leitura

| # | Regra vigente | Proposta | Princípio servido |
|---|---|---|---|
| R1 | Sem nota global, decimal ou % no primeiro plano | **Quebrar**: índice inteiro em todo nó, sempre com faixa, cobertura, alvo e estado de calibração. Achados continuam antes do índice. Decimal segue proibido | P7; P4 protegido pela faixa |
| R2 | Home com 3 sistemas e Gestão como faixa | **Quebrar**: 4 sistemas (Produto, Engenharia, Operação, **Organização**) | P7, P2 (o nome é "Organização", não "gestores") |
| R9 | Classificação pelo mínimo puro | **Alterar**: média ponderada com teto pelo elo limitante (05 §7) | P7; P2 continua (time forte não esconde bloqueado) |
| R10 | Divergência suspende a classificação | **Alterar**: índice por perspectiva lado a lado; divergência sobe como achado; severidade de perspectiva separada de visibilidade (05 §5) | P5, P4 |
| R14 | Alvo único de alta performance | **Quebrar**: alvo por capacidade conforme contexto; duas distâncias no relatório | P6 |

### 2.2 Instrumento e perguntas

| # | Regra vigente | Proposta | Princípio servido |
|---|---|---|---|
| R6 | Não virar prova de conhecimento | **Alterar**: perguntas de leitura (CFD, outlier, meta não atingida) na camada Conhecimento, sem jargão, só agregadas | P1 (interpretação, não vocabulário), P7 |
| R11 | Texto livre fora do primeiro corte | **Alterar**: texto livre opcional com remoção de PII, codificação assistida por LLM e revisão humana com concordância medida (07 §6) | P7; P3 e P4 como salvaguarda |
| R12 | Não perguntar se o rito existe | **Manter** | P1 |
| R13 | Jargão bloqueado pela auditoria | **Alterar**: jargão permitido em variantes de perspectiva que o usam no dia a dia; tronco comum sem jargão | P5 |
| R17 | Não aprofundar por etapas do SDLC | **Manter** | P1 |
| R18 | Rito só pontua pelo efeito no próximo evento | **Manter** | P1 |
| R21 | Todos percorrem trilhas equivalentes | **Alterar**: amostragem matricial dentro da unidade; cada pessoa responde a um subconjunto e o conjunto cobre a unidade (06 §4) | P7 (cobertura), P3 (menos tempo, menos exposição) |
| R22 | Nove perspectivas, sem direção executiva | **Alterar**: adicionar **direção executiva**; senioridade e tempo de casa como contexto em faixas, só agregados acima do limiar | P5 (do CTO ao júnior), P3 |

### 2.3 Medição e inferência

| # | Regra vigente | Proposta | Princípio servido |
|---|---|---|---|
| R3 | 8 pilares, 29 folhas; sem eixo novo sem dois padrões | **Alterar**: o mapa de referência cresce (12 domínios); publicar nota numa folha continua exigindo dois padrões independentes | P7 e P4 |
| R4 | Dois padrões por folha; padrão negativo ≥ 2 participações e ≥ 20% | **Alterar**: mantidos como piso; publicação passa a exigir também largura máxima de faixa (05 §6) | P4 |
| R7 | Ferramentas não pontuam | **Manter**; falta de capacidade habilitadora pontua quando o evento mostra o efeito | P1 |
| R8 | Categoria DORA só com telemetria | **Manter** | P4 |
| R15 | Sem avaliação individual | **Manter** | P2, P8 |
| R16 | Benchmark só com amostras comparáveis | **Manter**; comparabilidade exige invariância de medida (09 §5) | P4, P6 |
| R20 | Estágio como média de ordinais e confiança composta por pesos fixos | **Quebrar**: posterior discreta exata sobre 0–4; faixa, cobertura e concordância como leituras separadas (05) | P4 |
| R23 | Recomendador sem LLM | **Manter** para inferência e decisão. LLM permitido apenas em aprofundamento conversacional com guardrails e em codificação de texto com revisão humana (06 §6, 07 §6) | P4 (cadeia de evidência auditável) |
| R24 | Posterior não exibido como probabilidade antes da calibração | **Manter** (escala verbal de 01 §7) | P4 |
| R27 | IRT e consistência só com centenas de jornadas | **Alterar**: a estrutura do modelo de medição existe desde já, com parâmetros elicitados; a estimação empírica entra quando houver dados (09) | P4 (estrutura correta desde o início, números honestos depois) |

### 2.4 Dados, privacidade e plataforma

| # | Regra vigente | Proposta | Princípio servido |
|---|---|---|---|
| R5 | Limiar de 5 respostas | **Manter** como piso de anonimato; o relatório informa também o mínimo recomendado para confiabilidade (09 §4) | P3, P4 |
| R19 | Monólito Node/TS + SQLite | **Alterar**: o runtime continua TS/SQLite; um **laboratório de modelo** offline (Python, PyMC/Stan) estima parâmetros e exporta JSON versionado. O laboratório não roda em produção | P4 (estimação correta) sem ferir a simplicidade operacional |
| R25 | Não importar métricas DORA antes do instrumento estável | **Alterar**: telemetria entra como **exame complementar** em leitura separada, sem fundir com a entrevista | P5 (mais uma lente), P4 |
| R26 | Não publicar versão nova do catálogo no meio de um piloto | **Manter** | P4 |

### 2.5 Regras novas da v0.6

| # | Regra | Princípio servido |
|---|---|---|
| R28 | A **sofisticação técnica** (F0–F5, 12) é medida por evento, exibida na ficha e usada na conduta, mas **não entra no índice**; o índice continua sendo a apropriação | P1 (comprar ferramenta não sobe nota), P7 |
| R29 | **Algoritmos treinados** (15) rodam fora do runtime, com portão de volume de dados, saída explicável e publicação só após revisão | P4 |
| R30 | **Aprendizado entre organizações** só com consentimento explícito, dados agregados e opção de não participar | P3, P8 |
| R31 | A **fotografia é imutável**; evolução só é publicada com itens-âncora comuns e tabela de correspondência de unidades (16) | P4 |
| R32 | Classificador de texto (Laya ou similar) pode codificar texto aberto, mapear "outra opção", triar PII como segunda barreira, classificar documentos de exames complementares, apoiar a autoria e decidir se pede um exemplo (20 §1). Exige calibração em português, κ ≥ 0,7 e revisão humana. Nunca decide estágio, causa, conduta ou o próximo nó do grafo | P4 |
| R34 | Prontidão para práticas avançadas (22) não é meta: o relatório só mostra as práticas relevantes ao contexto ou pedidas pela organização; adoção prematura é achado de risco, nunca de culpa | P6, P2 |
| R35 | Arestas do grafo de habilitação (23) declaram tipo, força e origem (A–D); a fronteira de aprendizado orienta a próxima fase, mas não impede a organização de escolher outro caminho, que vira dado de validação | P4, P6 |
| R33 | Todo item de prática segue o padrão de escrita de 19 §4 (passado do último caso, uma ação por opção, três degraus, sem pista de opção certa), verificado pela auditoria | P1, P4 |

> Nenhuma regra marcada "Quebrar" ou "Alterar" viola um princípio. Se, na
> discussão, alguma se mostrar incompatível com P1–P8, ela volta para "Manter".

## 3. Princípios de desenho do mapa

1. **A forma sem a função é um achado.** Rito sem efeito, policy sem análise e
   dashboard sem leitura estão no estágio 1, igual ao heroísmo; a intervenção
   difere (ensinar propósito × criar mecanismo).
2. **Teoria declarada ≠ teoria em uso** (Argyris & Schön). A distância é o dado.
3. **Três níveis de cultura** (Schein): artefatos → valores declarados →
   pressupostos. A escala de apropriação percorre esses níveis.
4. **Nem toda capacidade precisa do topo** (FinOps crawl/walk/run).
5. **Tecnologia antiga não penaliza por idade**, só pelo efeito.
6. **O elo limitante pesa**, sem congelar o índice.
7. **Divergência é sinal, não ruído.**
8. **Capacidade técnica não é maturidade.** O relatório mostra a maturidade
   técnica e a organizacional lado a lado.

## 4. Como mudar esta constituição

- **Princípio:** não muda. Se a discussão mostrar que um princípio está errado, é
  um produto diferente e começa uma nova versão maior (v1.0).
- **Regra:** muda por ADR curto com: regra atual, proposta, princípio servido,
  risco, reversibilidade e evidência. A ADR vai para `docs/knowledge-base/` e a
  linha correspondente desta tabela é atualizada.
