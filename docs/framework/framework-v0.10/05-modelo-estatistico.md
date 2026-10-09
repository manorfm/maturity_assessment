# 05 — Modelo estatístico

> Objetivo: transformar relatos de observadores imperfeitos em **distribuições de
> estágio por unidade**, **índices com faixa**, **divergências interpretáveis** e
> **causas prováveis que competem entre si**, de forma exata, auditável e
> implementável em TypeScript sem dependências pesadas.
>
> Os exemplos numéricos deste documento foram calculados com o protótipo em
> Python descrito em §12 e podem ser reproduzidos.

## 0. Resumo

| Camada | Hoje | v0.5 |
|---|---|---|
| Medição da capacidade | Média de ordinais por pessoa, intervalo beta aproximado, confiança = 0,55·observadores + 0,25·padrões + 0,2·precisão | **Posterior discreta exata** sobre os estágios 0–4 por unidade, com modelo de observação por opção e heterogeneidade dentro da unidade |
| Perspectivas | Média direcional por perfil; divergência suspende | **Modelo de observadores**: severidade e confiabilidade por perspectiva; vinhetas separam escala de visibilidade |
| Agregação | Prior organizacional de força fixa; mínimo puro | **Partial pooling** estimado; índice do pai por simulação com teto pelo elo limitante |
| Causas | Famílias independentes; força de evidência *ad hoc*; uma evidência por grupo | **Noisy-OR com vazamento**: causas coexistem, competem pela explicação; evidência por prevalência com modelo beta-binomial |
| Parâmetros | Priors especialistas no código | Priors elicitados de forma estruturada; estimação no **laboratório de modelo** offline; JSON versionado |

## 1. Diagnóstico do motor atual

| # | Componente | Problema | Consequência | Referência |
|---|---|---|---|---|
| 1 | `CapabilityAssessment.fromEvidence` | Converte peso −2..+2 em ordinal e **tira média** (por pessoa e depois entre pessoas) | Média de ordinais trata a distância 0→1 como igual a 3→4 e pode inverter conclusões | Liddell & Kruschke (2018) |
| 2 | Intervalo | Beta com pseudo-contagens fracionárias (valor/4 como "sucesso") e aproximação normal ±1,645·dp, cortada em [0, 4] | O intervalo não corresponde a nenhuma quantidade bem definida; fica estreito demais com muitos respondentes que discordam | — |
| 3 | Confiança | Combinação linear com pesos fixos (0,55/0,25/0,20) multiplicada por "acordo" | Número com aparência de probabilidade sem semântica probabilística; mistura cobertura, volume e precisão | Viola P4 |
| 4 | Contradição | Binária: existe observador > 2 e observador < 2 | Um único discordante em 20 marca contradição; 10 contra 10 marca igual | — |
| 5 | Informação das opções | Toda opção pesa igual; não há discriminação nem conjunto de alternativas considerado | Escolher "3" num item cujas opções vão de 1 a 3 conta igual a escolher "3" num item de 0 a 4 | IRT (Samejima; Bock) |
| 6 | `BayesianInferenceEngine` | Expoente de verossimilhança *ad hoc* (`prevalência × min(3, √suporte) × qualidade`) | A força da evidência não deriva de um modelo de dados; difícil calibrar | — |
| 7 | Grupos de evidência | "Uma evidência por grupo" descarta as demais | Perde informação; a dependência deveria ser modelada (testlet), não descartada | Wainer et al. (2007) |
| 8 | Causas | Cada causa avaliada isoladamente | Não há *explaining away*: se a aprovação externa explica a espera, a hipótese de feedback lento deveria perder força, e hoje não perde | Pearl (1988) |
| 9 | Prior de "desconhecido" | `0,65 − 0,4·observabilidade` | Constante arbitrária que controla o resultado | — |
| 10 | Seletor adaptativo | Escore = 0,4·ganho + 0,2·cobertura + 0,15·validação + … | Mistura de unidades diferentes com pesos arbitrários (ver 06) | van der Linden (2005) |
| 11 | Triangulação | Média direcional por perfil com ≥ 5 pessoas | Não distingue "a gestão usa a escala de forma mais otimista" de "a gestão vê outro sistema" | King et al. (2004) |
| 12 | Hierarquia | Ancestral limitado pelo descendente mínimo | O índice não se move quando a organização melhora fora do elo mínimo | — |

**Nada disso invalida o trabalho feito.** A arquitetura (sinais tipados, famílias,
explicabilidade, gate de calibração) está correta. O que precisa mudar é a
**matemática dentro das caixas**.

## 2. Visão geral do pipeline

```text
L0  Respostas (opção escolhida, estado observacional, contexto)
 │
L1  Regras de evidência (matriz Q): opção → {capacidade, âncora, discriminação, camada, testlet}
 │
L2  Modelo de observadores: severidade δ e confiabilidade ρ por perspectiva × capacidade
 │
L3  Modelo de capacidade: posterior discreta P(S = 0..4) por unidade × folha
 │    ├─ heterogeneidade dentro da unidade (ψ)
 │    ├─ portões de camada (consistência, resultado)
 │    └─ partial pooling hierárquico (unidade ← área ← empresa)
 │
L4  Camada causal: rede noisy-OR por família de problema (posterior por causa)
 │
L5  Agregação e índices: simulação da árvore de capacidades e da árvore organizacional
 │
L6  Projeções do relatório (01): laudo, fichas, divergências, tratamento
```

## 3. Modelo de medição da capacidade

### 3.1 Variável latente

Para cada unidade `u` e folha `c`, o estado é `S ∈ {0, 1, 2, 3, 4}` (estágios da
rubrica). Como o suporte é discreto e pequeno, **a posterior é calculada por
enumeração exata**: nada de MCMC em produção.

### 3.2 Modelo de observação de uma resposta

Um item `i` (nó do grafo) oferece opções `o` com âncoras `a_o` (04 §4). A
probabilidade de um observador que vive o estado `e` escolher a opção `o` é um
logit multinomial sobre **as opções daquele item**, com utilidade proporcional à
distância entre a âncora e o estado percebido:

```text
P(o | e) = exp(−κ_i · |a_o − (e + δ_r)|) / Σ_{o' ∈ opções(i)} exp(−κ_i · |a_o' − (e + δ_r)|)
```

- `κ_i`: discriminação da ligação (baixa 0,6 · média 1,0 · alta 1,6 como valores
  iniciais), multiplicada pela confiabilidade da perspectiva `ρ_{r,c}` (§4);
- `δ_r`: severidade da perspectiva `r` (positivo = relata acima do que vive; §4);
- o denominador sobre as opções do próprio item faz com que escolher "3" num item
  que só vai até 3 seja menos informativo do que num item que vai até 4.

É um caso particular dos modelos de resposta nominal/ordinal da teoria de resposta
ao item, escolhido por ser explicável ("a resposta evidencia o estágio `a_o`,
com erro que cresce com a distância").

### 3.3 Portões de camada

Os requisitos de 04 §5 entram como verossimilhança adicional por unidade:

```text
G(S) = 1                      para S ≤ 2
G(3) = γ₃ se não houver evidência de consistência com âncora ≥ 3 na unidade; senão 1
G(4) = γ₄ se não houver evidência de resultado/adaptação com âncora 4; senão 1
```

Valores iniciais: `γ₃ = 0,35`, `γ₄ = 0,25`. São parâmetros elicitados e
documentados, não constantes escondidas.

### 3.4 Heterogeneidade dentro da unidade

Pessoas da mesma unidade vivem partes diferentes do sistema. Cada respondente `j`
tem um estado vivido `e_j` próximo do estado da unidade `S`:

```text
P(e_j | S) ∝ exp(−ψ · |e_j − S|)
L_j(S)    = Σ_e P(e | S) · Π_{testlets t de j} P(resposta_t | e)
P(S | dados) ∝ π_u(S) · G(S) · Π_j L_j(S)
```

- `ψ` (dispersão dentro da unidade) controla quanto a discordância entre pessoas
  alarga a posterior. Valor inicial 1,2; estimado no laboratório a partir da
  variância entre e dentro de unidades (ICC).
- Isso substitui "média por pessoa, depois média entre pessoas".

### 3.5 Testlets

Dentro de uma reconstrução de evento, usa-se por capacidade **a ligação de maior
discriminação** (em empate, a de camada mais alta). Entre testlets, independência
condicional dado `e_j`. Isso substitui "uma evidência por grupo" sem descartar a
informação dos demais testlets.

## 4. Modelo de observadores (perspectivas)

Cada perspectiva `r` é um tipo de observador com dois parâmetros por capacidade:

| Parâmetro | Significado | Valor inicial | Como é estimado |
|---|---|---|---|
| `δ_{r,c}` **severidade** | Deslocamento sistemático da escala: a direção pode relatar sistematicamente acima do que vive | 0 | Vinhetas de ancoragem na própria avaliação (≥ 5 pessoas da perspectiva); depois, laboratório |
| `ρ_{r,c}` **confiabilidade** | Quanto aquela perspectiva enxerga a capacidade (multiplica `κ`) | 1,0 para perspectivas elegíveis; 0,6 para perspectivas marginais | Elicitação (matriz de perspectivas); depois Dawid–Skene no laboratório |
| `v_{r,c}` **visibilidade** | Probabilidade de "não observo" | Observada | Proporção de "não observo" |

### 4.1 Vinhetas de ancoragem

Todas as pessoas de todas as perspectivas avaliam **a mesma situação
hipotética** com âncora conhecida (07 §4.3). A diferença média entre a resposta
de uma perspectiva e a âncora da vinheta estima `δ_r` sem depender do estado real
da unidade (King, Murray, Salomon & Tandon, 2004):

```text
δ̂_r = média_{j ∈ r}(resposta_vinheta_j − âncora_vinheta), encolhida para 0 com n pequeno
```

### 4.2 Laboratório: modelos de avaliadores

Com dados de piloto, os parâmetros são estimados por:

- **Dawid–Skene** (1979): estima a matriz de confusão de cada tipo de observador
  e o estado verdadeiro, sem rótulo externo;
- **modelo de Rasch multifacetado** (Linacre; Myford & Wolfe, 2003–2004):
  separa severidade do avaliador, dificuldade do item e nível do objeto avaliado.

## 5. Divergência entre perspectivas

Para cada par de perspectivas `(r, r')` elegíveis (≥ 5 pessoas cada):

1. calcula-se a posterior de `S` usando só as respostas de `r`, **sem** e **com**
   a correção de severidade;
2. calcula-se `P(|S_r − S_r'| ≥ 1)` e `P(|S_r − S_r'| ≥ 2)`.

| Resultado | Leitura publicada | Exemplo de conduta |
|---|---|---|
| Divergência bruta alta, **corrigida baixa** | **Diferença de escala**: as áreas veem o mesmo sistema, mas descrevem com otimismo diferente | Calibrar linguagem; levar a direção a observar eventos reais |
| Divergência **corrigida alta** | **Sistemas diferentes**: uma perspectiva não vê o que a outra vive (visibilidade, fronteira, poder) | Conduta de visibilidade ou de fronteira (08) |
| Dispersão alta **dentro** da mesma perspectiva | **Adoção desigual** (regra vigente) | Difundir prática local |

Regra de publicação: divergência sobe para o laudo quando `P(|Δ| ≥ 1) ≥ 0,80`
após a correção, ou quando a parte de escala é grande (`P_bruta(|Δ| ≥ 2) −
P_corrigida(|Δ| ≥ 2) ≥ 0,25`).

### 5.1 Exemplo numérico

Unidade com 7 respostas sobre `continuous-integration`: 4 de engenharia (a maioria
relata isolamento longo, âncora 1), 2 de gestão (âncora 3) e 1 de plataforma
(âncora 1). Vinhetas indicam severidade da gestão `δ = +1`.

| Leitura | Distribuição de S (0–4) | Índice |
|---|---|---|
| Engenharia | 0,24 · **0,71** · 0,05 · 0,00 · 0,00 | 20% |
| Gestão, bruta | 0,01 · 0,04 · 0,16 · **0,50** · 0,29 | 75% |
| Gestão, corrigida pela severidade | 0,05 · 0,15 · **0,41** · 0,22 · 0,18 | 59% |
| Unidade (todas, corrigida) | 0,07 · **0,84** · 0,09 · 0,00 · 0,00 | 26% |

| Divergência engenharia × gestão | Bruta | Corrigida |
|---|---|---|
| `P(|Δ| ≥ 1)` | 0,96 | 0,87 |
| `P(|Δ| ≥ 2)` | 0,80 | 0,49 |

**Leitura publicada:** parte da distância é otimismo de escala da gestão, mas
mesmo corrigida a gestão enxerga um sistema melhor do que a engenharia vive
(P = 0,87). Há um achado de visibilidade.

## 6. Regras de publicação por folha

Uma folha publica estágio e índice numa unidade quando **todas** as condições
valem:

1. ≥ 5 respondentes concluídos na unidade (anonimato, R5);
2. ≥ 2 testlets distintos com evidência para a folha (R4);
3. ≥ 2 perspectivas elegíveis com evidência, **ou** marcação explícita de "lente
   única";
4. faixa de 90% com largura ≤ 2 estágios (≤ 50 p.p.).

Se 1–3 valem e 4 não vale, a folha aparece como **"observada, ainda imprecisa"**
com a distribuição, sem índice no mapa.

## 7. Agregação e índice

### 7.1 Partial pooling hierárquico

O prior de uma unidade vem da unidade-mãe, com peso estimado:

```text
π_u(S) = ω · P_mãe(S) + (1 − ω) · Uniforme(S)
```

- `P_mãe` é a posterior da unidade-mãe calculada **sem** as respostas da própria
  unidade (validação cruzada simples, para não contar duas vezes);
- `ω` vem do ICC(1) da capacidade (proporção da variância que é entre unidades);
  inicial 0,5; estimado no laboratório. Quando as unidades são muito diferentes
  (ICC alto), o pooling é fraco; quando são parecidas, é forte (Gelman & Hill, 2007).

### 7.2 Índice de uma folha

```text
índice = E[S] / 4          (inteiro, em %)
faixa  = quantis 5% e 95% de S, convertidos para % (passos de 25 p.p. na folha)
```

### 7.3 Índice de um nó pai (capacidade, pilar, domínio, sistema, raiz)

Calculado por **simulação** a partir das posteriores das folhas (2.000–10.000
sorteios; custo desprezível):

```text
para cada sorteio:
  s_c ~ P(S_c) para cada folha c avaliada
  média = Σ w_c · s_c / Σ w_c
  teto  = min_c(s_c) + 1                 (elo limitante, R9)
  valor = min(média, teto) / 4
índice = média dos valores ; faixa = quantis 5% e 95%
```

- `w_c` são os pesos do contexto (alvo da capacidade; 02 R14). São declarados no
  relatório.
- Nós cinza contribuem para cada pai com a fração da aresta `evidencia`; na raiz,
  cada folha entra uma única vez.
- **Cobertura** = Σ `w` das folhas avaliadas / Σ `w` de todas as folhas do nó.

**Exemplo:** pai com 4 folhas (CI da §5.1; fluxo com moda 2; confiabilidade com
moda 3; planejamento com moda 1, peso 0,5): índice **42% (25–50%)**. O mínimo
puro daria 20% e não mudaria mesmo que três das quatro folhas melhorassem.

### 7.4 Duas maturidades na raiz

A raiz calcula separadamente a **maturidade técnica** (Produto, Engenharia,
Operação) e a **organizacional** (Organização), com o mesmo procedimento. O índice
geral usa todas as folhas, e as duas leituras são sempre exibidas junto (02 §3).

### 7.5 Distância para o alvo

```text
alvo_c        = estágio-alvo da capacidade no contexto (0–4)
atingimento_c = P(S_c ≥ alvo_c)
distância     = alvo_c − E[S_c]   (em estágios; exibida em p.p.)
```

## 8. Camada causal: noisy-OR com vazamento

### 8.1 Estrutura

Para cada família de problema (por exemplo, "integração tardia"):

- **causas** `C_k ∈ {0, 1}`, que podem coexistir, com prior `π_k`;
- **sintomas** `Y_m ∈ {0, 1}` na unidade (fatos relatados: "a mudança esperou
  aprovação externa");
- relação **noisy-OR com vazamento** (Henrion, 1989; Díez, 1993):

```text
P(Y_m = 1 | C) = 1 − (1 − λ₀) · Π_{k: C_k = 1} (1 − λ_{m,k})
```

`λ_{m,k}` é a probabilidade de a causa `k`, sozinha, produzir o sintoma `m`;
`λ₀` é o vazamento (outras causas não modeladas, que substitui o prior de
"desconhecido"). O número de parâmetros cresce linearmente, o que viabiliza a
elicitação com especialistas.

### 8.2 Evidência vinda das respostas

O sintoma não é observado diretamente: observamos `k` de `n` respondentes
aplicáveis que o relatam. A verossimilhança usa uma **beta-binomial**, que admite
heterogeneidade entre pessoas:

```text
P(k | Y = 1) = BetaBin(k; n, média p₁, precisão φ)     p₁ inicial = 0,6
P(k | Y = 0) = BetaBin(k; n, média p₀, precisão φ)     p₀ inicial = 0,1   φ inicial = 10
```

Isso substitui o expoente *ad hoc* atual: a força da evidência passa a vir de um
modelo explícito de "quantas pessoas relatariam isto se o sintoma existisse".

### 8.3 Inferência

Com até ~8 causas por família, a enumeração dos 2^K estados é exata e rápida.

### 8.4 Exemplo numérico (explaining away)

Família "integração tardia", causas: feedback lento, aprovação externa, fronteira
de times.

| Evidência acumulada | feedback lento | aprovação externa | fronteira de times |
|---|---|---|---|
| "PR espera revisão > 2 dias" em 6/10 | 0,57 | 0,47 | 0,26 |
| + "precisou de aprovação externa" em 7/10 | **0,45** ↓ | **0,88** ↑ | 0,26 |
| + "conflito no mesmo serviço" em 1/10 | 0,45 | 0,90 | **0,11** ↓ |

A aprovação externa passa a explicar parte da espera de PR, e a hipótese de
feedback lento **perde força sem nenhuma evidência contra ela**. O motor atual
não faz isso.

### 8.5 Ligação com a capacidade

- As famílias causais são abertas quando a folha tem `P(S ≤ 1) ≥ 0,5` ou quando um
  sintoma está marcado como gatilho no grafo (vigente).
- A causa publicada entra no diagnóstico diferencial (01 §6, bloco 5) com a
  escala verbal de 01 §7.
- Causas com posterior ≥ 0,7 e mecanismo, contenção e autoridade discriminados
  liberam conduta; entre 0,5 e 0,7, a conduta é "investigar" (regra vigente
  mantida).

### 8.6 Elicitação dos parâmetros

- **Protocolo:** SHELF (O'Hagan et al., 2006), com 3 a 5 especialistas por
  disciplina: estimativa individual, discussão, estimativa final, registro das
  justificativas.
- **Formato:** para cada par (sintoma, causa), a pergunta "em 100 unidades com
  apenas esta causa, em quantas o sintoma apareceria?", o que dá `λ` diretamente.
- **Para nós ordinais** (quando necessário): método dos nós ranqueados de Fenton,
  Neil & Caballero (2007).
- Cada parâmetro guarda autor, data, justificativa e versão.

## 9. Mudança entre leituras

```text
P(melhora) = P(S_t2 > S_t1) = Σ_{a < b} P_t1(a) · P_t2(b)
```

A mudança é publicada quando `P(melhora) ≥ 0,8` ou `P(piora) ≥ 0,8`. Exige a
mesma versão de instrumento ou uma ponte de *equating* (09 §6).

## 10. Concordância e força do clima

São descritivos, não entram na posterior:

- **`r_wg`** (James, Demaree & Wolf, 1984) por unidade × capacidade organizacional:
  concordância das respostas. Abaixo de 0,5, a ficha exibe "concordância baixa".
- **ICC(1)** e **ICC(2)** estimados no laboratório (Bliese, 2000). O ICC(1)
  alimenta `ω` (§7.1); o ICC(2) orienta o número mínimo recomendado de
  respondentes (09 §4).

## 11. O que roda onde

| Cálculo | Onde | Por quê |
|---|---|---|
| Posterior discreta por unidade × folha | Runtime TS | Enumeração exata, rápida |
| Severidade por vinhetas na própria avaliação | Runtime TS | Fórmula fechada |
| Simulação da árvore (índices) | Runtime TS | 10.000 sorteios em milissegundos |
| Noisy-OR por família | Runtime TS | Enumeração 2^K |
| Estimação de κ, δ, ρ, ψ, ω a partir de pilotos | **Laboratório** (Python + PyMC/Stan) | Modelos hierárquicos completos |
| Dawid–Skene, Rasch multifacetado, DIF, estudos G | **Laboratório** | Pesquisa, não produção |
| Calibração (Brier, ECE, log score) | Runtime (vigente) + laboratório | Mantido |

Os parâmetros saem do laboratório num arquivo JSON versionado, por exemplo
`measurement-params-m2.json`, carregado pelo catálogo como hoje são carregados
priors. Nenhum parâmetro muda em produção sem publicação explícita (regra
vigente do gate).

## 12. Contratos para implementação (TypeScript)

```ts
type Stage = 0 | 1 | 2 | 3 | 4;
type StageDistribution = readonly [number, number, number, number, number];

interface MeasurementParams {
  version: string;                         // 'm2'
  kappa: Record<'low' | 'medium' | 'high', number>;
  psi: number;                             // dispersão dentro da unidade
  gates: { gamma3: number; gamma4: number };
  perspective: Record<Perspective, Record<LeafId, { delta: number; rho: number }>>;
  pooling: Record<LeafId, number>;         // ω
}

interface ObservationModel {
  likelihood(option: OptionEvidence, itemAnchors: Stage[], perspective: Perspective,
             leaf: LeafId, params: MeasurementParams): StageDistribution; // P(resposta | e)
}

interface UnitPosterior {
  unit: UnitId; leaf: LeafId;
  distribution: StageDistribution;
  index: number;                 // inteiro 0–100
  interval90: [number, number];  // em %
  testlets: number; perspectives: number; respondents: number;
  gatesApplied: { gamma3: boolean; gamma4: boolean };
  publishable: 'published' | 'imprecise' | 'not-evaluated';
}

interface CausalFamily {
  id: string; causes: { id: string; prior: number }[];
  symptoms: { id: string; leak: number; lambda: Record<string, number> }[];
  reporting: { p1: number; p0: number; phi: number };
}
```

Protótipo de referência (Python, ~80 linhas): `lab/prototypes/model.py` e
`lab/prototypes/causal.py` (10, pacote WP10). Os testes de unidade do TS devem
reproduzir os números de §5.1 e §8.4 com tolerância de 0,01.

## 13. Parâmetros iniciais (pré-piloto)

| Parâmetro | Valor | Origem |
|---|---|---|
| κ baixa / média / alta | 0,6 / 1,0 / 1,6 | Elicitação; ajustar com piloto |
| ψ | 1,2 | Elicitação |
| γ₃ / γ₄ | 0,35 / 0,25 | Elicitação (requisito de camada) |
| δ | 0 (até haver vinhetas) | Neutro |
| ρ elegível / marginal | 1,0 / 0,6 | Matriz de perspectivas |
| ω | 0,5 | ICC(1) típico de clima entre 0,05 e 0,30 |
| p₁ / p₀ / φ | 0,6 / 0,1 / 10 | Elicitação |
| λ₀ (vazamento) | 0,05 | Elicitação |

Todos são **provisórios** e aparecem assim no rodapé do relatório até a
calibração (09).
