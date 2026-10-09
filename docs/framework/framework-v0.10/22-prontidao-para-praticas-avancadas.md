# 22 — Prontidão para práticas avançadas: chaos engineering, automação de qualidade e AI-DLC

> Pergunta: o motor compreende a maturidade necessária para chegar,
> **com conforto**, a práticas de estado da arte como chaos engineering,
> automação de QA e AI-DLC?
>
> **Até a v0.7, não.** O motor mede cada capacidade isoladamente. Ele não sabe
> que chaos engineering exige observabilidade, objetivos de confiabilidade,
> reversão e cultura de aprendizado **antes**. Também não detecta quando uma
> prática avançada foi adotada cedo demais, que é um risco em si. A v0.8
> acrescenta uma camada de **prontidão** sobre as posteriores que o motor já
> calcula.

## 1. O conceito

Uma prática avançada não é uma capacidade a mais. É uma **composição** de
capacidades que precisam estar num nível mínimo para a prática funcionar, e não
virar ritual ou gerador de incidentes.

```text
PRÁTICA AVANÇADA (ex.: chaos engineering)
  ├─ pré-requisitos essenciais   (sem eles, a prática causa dano ou vira ritual)
  │    capacidade ≥ estágio mínimo  e/ou  trilha técnica ≥ fase mínima
  ├─ pré-requisitos de conforto  (sem eles, funciona, mas com esforço e risco altos)
  └─ antipadrões de adoção prematura (sinais de que foi adotada antes da hora)
```

### 1.1 Cálculo

Para cada pré-requisito `k`, o motor já tem a posterior do estágio ou da fase
(05, 12). Então:

```text
p_k           = P(S_k ≥ mínimo_k)                   (vem direto da posterior)
P(pronto)     = Π_{k essencial} p_k                 (hipótese de independência; ver §1.3)
conforto      = P(pronto) × média_{k de conforto} p_k
gargalo       = argmin_k p_k entre os essenciais    (o primeiro passo)
```

| Leitura | Critério | O que o relatório diz |
|---|---|---|
| **Pronto** | `P(pronto) ≥ 0,6` | "Pode começar; comece pequeno" |
| **Perto** | `0,25 ≤ P(pronto) < 0,6` | "Falta pouco: [lista dos pré-requisitos com p_k < 0,7]" |
| **Não pronto** | `P(pronto) < 0,25` | "O caminho começa por [gargalo]"; sequência pela ordem do grafo de pré-requisitos |
| **Adoção prematura** | Fase técnica da prática ≥ F3 **e** algum essencial com `p_k < 0,3` | Achado de risco, com conduta de **reduzir o escopo da prática** até os pré-requisitos subirem |

### 1.2 Exemplo numérico (chaos engineering)

| Pré-requisito essencial | `p_k` hoje | Depois de 2 ciclos | Depois de 4 ciclos |
|---|---|---|---|
| Observabilidade ≥ 3 e F3 | 0,35 | 0,80 | 0,80 |
| Estado estável definido (SLO; confiabilidade ≥ 3) | 0,20 | 0,75 | 0,75 |
| Resposta a incidentes ≥ 2 e F2 | 0,70 | 0,70 | 0,90 |
| Reversão automatizada (liberação F3) | 0,50 | 0,50 | 0,85 |
| Aprendizado com incidentes ≥ 3 | 0,40 | 0,40 | 0,80 |
| **P(pronto)** | **0,01** · não pronto | **0,08** · não pronto | **0,37** · perto |

O produto é exigente de propósito: prontidão pede **todos** os essenciais ao
mesmo tempo. O gargalo de hoje é o estado estável (0,20): sem saber o que é
"normal", não há hipótese para testar. É por ele que o caminho começa.

### 1.3 Limites do cálculo

- A independência entre pré-requisitos subestima a prontidão quando as
  capacidades andam juntas. Com a correlação entre folhas (15, E2), o produto é
  substituído pela probabilidade conjunta.
- Prontidão **não é meta** (P6). O relatório só mostra as práticas avançadas
  relevantes para o contexto ou pedidas pela organização. Uma empresa com um
  monólito crítico e pouco tráfego pode nunca precisar de chaos em produção.

## 2. Chaos engineering

### 2.1 Estado da arte

| Fonte | Ideia |
|---|---|
| Netflix — Chaos Monkey (2011), ChAP; Basiri et al., *Chaos Engineering* (IEEE Software, 2016); Rosenthal et al., *Chaos Engineering* (O'Reilly, 2017; 2020) | Princípios: **hipótese sobre o estado estável**, variar eventos do mundo real, experimentar em produção, automatizar continuamente, **minimizar o raio de impacto** |
| Modelo de maturidade de chaos (Rosenthal et al.) | Dois eixos: **sofisticação** e **adoção**. Confirma os dois eixos do produto (12) |
| Amazon — GameDays (Jesse Robbins); AWS Fault Injection Service | Exercícios planejados de falha com toda a equipe |
| Engenharia de resiliência — Woods, Cook, Allspaw | O objetivo é aprender como o sistema realmente se comporta, não "passar no teste" |

**Filosofia:** chaos engineering é **método científico aplicado à
confiabilidade**. Parte de uma hipótese ("se a dependência X ficar lenta, as
compras continuam acima de 99%"), provoca o evento de forma controlada e aprende
com a diferença entre o esperado e o observado. Quebrar coisas sem hipótese nem
medida não é chaos engineering: é incidente autoinfligido.

### 2.2 Pré-requisitos

| Tipo | Pré-requisito | Mínimo |
|---|---|---|
| Essencial | Observabilidade (medir o estado estável) | Estágio 3 e F3 (18) |
| Essencial | Estado estável definido (SLO por jornada) | `reliability-practice` ≥ 3 |
| Essencial | Resposta a incidentes (conter se o experimento sair do controle) | `incident-management` ≥ 2 e F2 |
| Essencial | Reversão automatizada e raio de impacto controlável | Liberação F3; exposição progressiva |
| Essencial | Aprendizado sem culpa (o experimento que revela fragilidade é celebrado) | `organizational-learning` ≥ 3; clima ≥ 2 |
| Conforto | Infraestrutura reproduzível | `reproducible-infrastructure` ≥ 3 |
| Conforto | Mapa de dependências | `integration-data` ≥ 2 |
| Conforto | Design para falha (timeouts, bulkheads, degradação) | `reliability-practice` com evidência de design |

### 2.3 Trilha de sofisticação

| Fase | Comportamento |
|---|---|
| F0 | Nenhum exercício de falha |
| F1 | Exercício de mesa (*tabletop*): discutir "e se X cair?" |
| F2 | GameDay em ambiente de teste, planejado, com a equipe |
| F3 | GameDay em produção com raio pequeno e interrupção automática |
| F4 | Experimentos automatizados e recorrentes no pipeline e em produção, com hipótese e parada automática |
| F5 | Experimentos gerados a partir de incidentes e mudanças de arquitetura; resultado alimenta design e SLOs |

### 2.4 Adoção prematura

| Sinal | Risco |
|---|---|
| Ferramenta de injeção de falha instalada sem SLO nem painel de estado estável | Experimento sem medida: incidente sem aprendizado |
| Chaos em produção sem reversão automatizada | O experimento vira indisponibilidade |
| Time é cobrado quando o experimento revela fragilidade | As pessoas passam a escolher experimentos seguros demais |

### 2.5 Pergunta de evento

"Na última vez que alguém quis saber o que aconteceria se uma dependência
falhasse, o que foi feito?" (nada · discutimos · testamos fora de produção ·
testamos em produção com poucos usuários e parada automática · isso roda
automaticamente e o resultado mudou o design · não observo)

## 3. Automação de qualidade (QA)

### 3.1 Estado da arte

| Fonte | Ideia |
|---|---|
| Deming (ponto 3) | Parar de depender de inspeção; qualidade embutida no processo |
| Google — *Software Engineering at Google* (2020); "Flaky Tests at Google" (2016) | Tamanhos de teste (pequeno, médio, grande) por isolamento; testes herméticos; **1,5% das execuções** e **~16% dos testes** com alguma instabilidade: gerir flakiness é prática central |
| Beck (TDD); Cohn (pirâmide); Dodds (troféu); Spotify (colmeia para microsserviços) | O formato da suíte depende da arquitetura; o princípio é **feedback rápido e confiável no nível mais barato** |
| Testes de contrato orientados ao consumidor (Pact) | Integração verificável sem ambiente integrado |
| Testes de mutação em escala (Google, Petrović et al.) | Mede se os testes detectam defeitos, não só se executam linhas |
| Bach e Bolton — *testing* × *checking* | Automação verifica o conhecido; exploração humana descobre o novo |
| *Shift-right*: exposição progressiva, monitoramento sintético, testar em produção | Parte da qualidade só se verifica com tráfego real |
| DORA 2025 | IA aumenta volume e velocidade das mudanças; testes automatizados fortes são o controle que impede que isso vire instabilidade |

**Filosofia:** qualidade é responsabilidade do time inteiro e se constrói no
design (testabilidade), não se inspeciona no fim. O papel de QA evolui de
executor de testes para **coach de qualidade** (time de habilitação, em
Team Topologies), que desenha estratégia de risco e ensina.

### 3.2 Pré-requisitos para automação madura

| Tipo | Pré-requisito | Mínimo |
|---|---|---|
| Essencial | Testabilidade no design (dependências controláveis, interfaces claras) | `sustainable-design` ≥ 2 |
| Essencial | Integração contínua | `continuous-integration` ≥ 3 e F3 |
| Essencial | Quem escreve o código escreve os testes | `quality-strategy` ≥ 2 |
| Essencial | Gestão de instabilidade (flaky) | Evidência de quarentena e correção |
| Conforto | Ambientes e dados de teste reproduzíveis | `reproducible-infrastructure` ≥ 2 |
| Conforto | Observabilidade para verificar em produção | Estágio 2 e F3 |
| Conforto | Estratégia por risco (não por cobertura) | `quality-strategy` ≥ 3 |

### 3.3 Adoção prematura

| Sinal | Risco |
|---|---|
| Automação concentrada em testes de interface ponta a ponta, poucos testes de unidade (casquinha de sorvete) | Suíte lenta e instável; o time deixa de confiar |
| Time separado de automação escrevendo scripts depois do desenvolvimento | Transferência de responsabilidade; feedback tardio |
| Meta de cobertura de código | Testes sem asserção (Goodhart) |
| Testes instáveis ignorados ("roda de novo") | O sinal vermelho perde significado |

### 3.4 Pergunta de evento

"Na última mudança que você fez, quando você soube se ela tinha quebrado algo?"
(só em produção · quando QA testou, dias depois · quando o pipeline rodou, horas
depois · em minutos, antes de integrar · não observo)
**Pressão:** "E da última vez que um teste falhou sem motivo aparente, o que
aconteceu?" (rodamos de novo até passar · desativamos · alguém investigou e
corrigiu · existe um processo para isso)

## 4. AI-DLC e engenharia com IA

### 4.1 O que é o AI-DLC

Metodologia apresentada pela AWS (Raja SP, julho de 2025) para um ciclo de
desenvolvimento **nativo de IA**, não adaptado de métodos anteriores:

- **Fases:** Concepção (*Inception*), Construção e Operação.
- **Rituais:** *Mob Elaboration* (pessoas e IA juntas esclarecem intenção,
  decompõem em unidades e definem critérios de conclusão verificáveis) e
  *Mob Construction*.
- **Unidades e *bolts*:** unidades de trabalho com fronteiras claras, organizadas
  como grafo; *bolts* são ciclos curtos de iteração, com três modos de supervisão:
  humano valida cada passo, humano observa sem bloquear, ou IA itera até o
  critério e o humano revisa o resultado.
- **Inversão de papéis:** humanos definem **o que** é sucesso e os critérios; a IA
  decide **como**. Qualidade por **contrapressão** (portões automáticos: testes,
  tipos, lint, segurança), não por prescrição.

### 4.2 O que a pesquisa diz

| Fonte | Achado |
|---|---|
| DORA 2025 | IA **amplifica** o que a organização já é; adoção de IA associada a **mais instabilidade** de entrega; 30% confiam pouco ou nada no código gerado; 7 capacidades de IA (posição clara sobre IA, ecossistema de dados saudável, dados internos acessíveis à IA, controle de versão forte, lotes pequenos, foco no usuário, plataforma interna de qualidade) |
| METR (2025) | Desenvolvedores experientes 19% mais lentos com IA, acreditando estar 20% mais rápidos |
| Atlassian DevEx 2025 | IA economiza tempo de codificação, mas o atrito está fora do código (informação, coordenação) |

**Leitura:** o AI-DLC pressupõe exatamente as capacidades que o DORA mede. Uma
organização sem testes automatizados, sem lotes pequenos e sem critérios de
aceite claros vai **acelerar a produção de defeitos**.

### 4.3 Pré-requisitos

| Tipo | Pré-requisito | Por quê | Mínimo |
|---|---|---|---|
| Essencial | Verificação automatizada (testes, tipos, segurança no pipeline) | É a contrapressão que dá qualidade ao trabalho autônomo | Qualidade F3; `sdlc-automation` ≥ 3 |
| Essencial | Lotes pequenos e integração frequente | Mudanças geradas por IA precisam ser revisáveis e reversíveis | `continuous-integration` ≥ 3 |
| Essencial | **Critérios de conclusão explícitos** (intenção clara, exemplos) | O AI-DLC transfere o "como"; o "o quê" precisa estar bem definido | `planning-refinement` ≥ 3 |
| Essencial | Posição clara sobre IA e governança de dados | Uso seguro e permitido; sem uso na sombra | Postura de IA (D12) ≥ 2 |
| Essencial | Identidade e segredos para agentes | Agentes com escopo, credencial temporária, rastreabilidade | `cloud-security` ≥ 2 |
| Conforto | Conhecimento acessível (documentação, decisões, ADRs) | Contexto de qualidade para a IA | Conhecimento (D12) ≥ 2 |
| Conforto | Revisão que não é gargalo | O volume de mudanças cresce | `continuous-integration` (revisão) ≥ 3 |
| Conforto | Plataforma com guardrails | Autosserviço seguro para agentes | `platform-autonomy` ≥ 2 |
| Conforto | Medição de impacto real (letramento) | Evitar a ilusão de produtividade (METR) | Letramento ≥ 2 |
| Conforto | Observabilidade (fase de operação) | Ver o efeito do que a IA mudou | Estágio 3 |

### 4.4 Trilha de sofisticação (substitui 12 §3.11 para engenharia com IA)

| Fase | Comportamento |
|---|---|
| F0 | Sem uso, ou uso na sombra |
| F1 | Autocompletar individual |
| F2 | Assistente conversacional em tarefas; a pessoa escreve e integra |
| F3 | Agentes executam tarefas delimitadas com humano validando cada passo e portões automáticos |
| F4 | Elaboração conjunta (pessoas + IA) com critérios de conclusão; unidades em paralelo; humano observa sem bloquear |
| F5 | Ciclos autônomos até o critério, dentro de guardrails; humanos definem intenção, revisam resultados e melhoram os portões; efeito medido em resultado |

### 4.5 Adoção prematura

| Sinal | Risco |
|---|---|
| Agentes autônomos em repositório sem testes automatizados | Instabilidade amplificada (DORA 2025) |
| Volume de PRs cresce e a revisão vira fila | Gargalo deslocado; revisão superficial |
| Meta de "% de código gerado por IA" | Goodhart; ilusão de produtividade |
| Agente com credencial ampla e permanente | Incidente de segurança; injeção de instrução |
| Júnior não consegue explicar o código que entregou | Perda de competência; dependência (competência preservada, v0.2) |

### 4.6 Pergunta de evento

"Na última tarefa em que alguém do seu time usou IA para gerar código, como se
soube que o resultado estava correto?" (não se verificou · alguém leu o código ·
os testes existentes passaram · testes e critérios de conclusão definidos antes
da tarefa · não observo)
**Generalização:** "Isso também vale para mudanças de infraestrutura e de dados?"

## 5. Biblioteca de práticas avançadas

Com o mesmo formato (pré-requisitos essenciais e de conforto, trilha, adoção
prematura, pergunta):

| Prática | Pré-requisitos essenciais principais |
|---|---|
| Chaos engineering | Observabilidade, SLO, incidentes, reversão, aprendizado (§2) |
| Automação de qualidade madura | Testabilidade, CI, dono dos testes, gestão de flaky (§3) |
| AI-DLC | Verificação automatizada, lotes pequenos, critérios claros, postura de IA, identidade de agentes (§4) |
| Entrega contínua (deploy a cada mudança) | Testes F3, reversão, observabilidade, aprovação por risco |
| Desenvolvimento no tronco (trunk-based) | CI rápido, feature flags, revisão ágil, testes confiáveis |
| SLO com política de error budget | Observabilidade, acordo com produto, autoridade para pausar entregas |
| Plataforma como produto | Times consumidores definidos, estratégia de produto, autosserviço |
| Remediação automática (AIOps) | Observabilidade F4, runbooks testados, reversão, confiança no alerta |
| Arquitetura em células ou microsserviços | Ownership por domínio, observabilidade distribuída, automação de deploy, contratos |
| Data mesh | Domínios com dono, plataforma de dados, governança federada, letramento |
| Zero Trust | Identidade forte, inventário, segmentação, observabilidade de acesso (24 §6.3) |
| Service mesh | Orquestração estável, observabilidade, plataforma com dono, necessidade real (24 §8) |
| Otimização automática de custo | Tags e dono, unit economics, guardrails |

## 6. O que muda no motor e no relatório

| Onde | Mudança |
|---|---|
| Modelo (L4.5, entre a camada causal e a agregação) | `AdvancedPractice` com pré-requisitos `{folha ou trilha, mínimo, essencial/conforto}`; cálculo de §1.1 |
| Achados | Novo tipo: **adoção prematura**, com conduta de reduzir escopo |
| Relatório | Seção "Prontidão para práticas avançadas" no laudo (só as relevantes) e na ficha do nó; checklist com `p_k` de cada pré-requisito |
| Walkthrough (16) | "Próxima fase" pode mirar uma prática avançada: o caminho segue a ordem do grafo de pré-requisitos, um degrau por vez |
| Tratamento (08) | Gargalo de prontidão entra no escore da restrição principal quando a organização declarou a prática como objetivo |
