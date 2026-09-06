# Plano: relatório apresentável — mapa, cartão, UX e sintéticos

Ondas A–D, F e G estão na base. A próxima onda de instrumento é E
(folhas candidatas, uma de cada vez, com contrato). O relatório de
anamnese e o relatório que responde fecharam; piloto humano deixa
de estar bloqueado por estas ondas.
Detalhe histórico do mapa em
[`organizational-area-map-plan.md`](organizational-area-map-plan.md);
detalhe histórico do cartão em
[`executive-decision-narrative-plan.md`](executive-decision-narrative-plan.md).
Este arquivo é a **ordem das ondas** e o contrato de UX e de massa
sintética.

Sintético valida coerência do produto. Não calibra posterior, não
substitui entrevista humana, não autoriza o gate 50–100.

## Problema

O motor já publica findings. A home não deixa um diretor, um
desenvolvedor ou um CTO ler a mesma decisão: o mapa mistura ofício e
cerimônia, o cartão fabrica valor, a página é verbosa e o sintético
médio esconde cinco problemas atrás de um slogan.

## Hipótese de resultado

Quem abre o relatório vê, em uma tela: a decisão pedida, três sistemas
(Produto, Engenharia, Operação), a faixa de gestão só quando há
restrição cruzada, o radar de cobertura e as outras restrições por
frente diagnóstica. O drill-down
repete o mesmo cartão, mais curto. As três bandas e os dois contrastes
sintéticos exercitam o mapa e o cartão sem se chamar o que a
classificação não é.

## Sequência

| Onda | Entrega | Aceite |
| --- | --- | --- |
| A | Projetor do mapa | **Vigente.** Home: Produto, Engenharia, Operação; qualidade e segurança sob Engenharia |
| B | Cartão executivo | **Vigente.** Diretor reformula problema, valor (ou a falta) e teste |
| C | UX minimalista | **Parcial.** Cruzamento no lugar do inventário; cartão e mapa ainda abrem pergunta |
| D | Massa sintética | **Vigente.** Três bandas + contrastes passam a barra de coerência, não de leitura |
| F | Relatório que responde | **Vigente.** Mapa só com finding; disciplina em recorte, dor, efeito e teste |
| G | Anamnese por áreas | **Vigente.** Índice, capítulo, dossiê e o mesmo evento em três recortes |
| E | Folhas candidatas | Só depois de G; lacunas viram folha com contrato, uma de cada vez |

Fora: LLM, React por antecipação, radar de quinze eixos, nó Agilidade,
Tuckman como nota, calibração por sintético, reparentar
`capability-taxonomy.ts`.

---

## Onda A — Mapa de apresentação

**Entregue.** A especificação vigente está em
`assessment-model.md`, `domain-model.md` e `technical-architecture.md`.
A árvore com lacunas (onda E) permanece em
[`organizational-area-map-plan.md`](organizational-area-map-plan.md).

---

## Onda B — Cartão que fecha decisão

**Entregue.** A especificação vigente está em `recommendation-model.md`.
O detalhe histórico permanece em
[`executive-decision-narrative-plan.md`](executive-decision-narrative-plan.md).

---

## Onda C — Modelo visual UX

**Parcial.** Inventário e árvore de lacunas saíram da home; o
cruzamento publica no máximo três mecanismos. O wireframe abaixo é o
**alvo de F**, não o estado atual.

### First screen (uma tela)

```text
┌─────────────────────────────────────────────────────────┐
│  Efeito cotidiano                    Precisa de correção│
│  Por que se repete (um mecanismo, sem eco do título)    │
│  Fazer agora · quem autoriza                            │
│  Teste · o que não resolve                              │
│  [fechado] fundamento e evidência                       │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│  Como se cruzam   no máx. 3 · mecanismo · só publicado  │
│  Acesso → Liderança. Fila de ambiente vira gestão por…  │
└─────────────────────────────────────────────────────────┘
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Produto  │ │Engenharia│ │ Operação │
│ N probl. │ │ N probl. │ │ N probl. │
│ só folhas com causa                                 │
└──────────┘ └──────────┘ └──────────┘
── Gestão ──  só disciplinas com causa publicada

[fechado] mapa publicado e radar
Unidades              uma linha + ver cobertura deste time
```

### Regras de layout

- Um cartão de decisão. O resto é navegação ou lista.
- Três sistemas no mesmo peso. Gestão nunca é o quarto azulejo.
- Folha ou finding acende o sistema; vazio é “entrevista não atravessou”, não zero nem ausência.
- Radar vem depois dos sistemas; “?” não pede mais pessoas.
- Os demais achados são frentes distintas; variações do limitador não
  fingem ser problemas novos.
- Drill-down: breadcrumb + o mesmo cartão em metade da altura + filhos.
- Metodologia, calibração, convites e revisão cognitiva ficam no rodapé
  administrativo, fechados.
- Unidades não repetem o cartão global. Mostram só o que muda no recorte.
- Tipografia e espaço do tema vigente. Sem radar de quinze eixos.

### Aceite visual

Em viewport desktop, a decisão e os três sistemas aparecem sem rolar.
Em viewport estreito, a decisão vem primeiro; os sistemas empilham.
O showcase médio não exige ler “Detalhes metodológicos” para achar o
teste.

---

## Onda D — Massa sintética para validar o produto

**Entregue.** Não é calibração. É barra de **apresentação e coerência**.
A especificação vigente está em `organizational-model.md` e
`technical-architecture.md`.

### O que já existe e permanece

Três organizações de 18 pessoas em duas unidades (opaco, intermediário,
sustentável). Scripts coerentes por unidade, sem rotação frágil.
O `/showcase` apresenta os três casos; o E2E percorre o produto e a
first screen.

### O que falta para validar o produto novo

| Caso | O que o sintético precisa produzir | Barra |
| --- | --- | --- |
| Opaco | Finding pronto de responsabilidade + vários investigate | Home em Corrigir; Engenharia e faixa acesas; nome não mente o estágio |
| Intermediário | Seis padrões, um pronto (portfólio) | Cartão sem metáfora de aprender; cinco visíveis; mapa em Produto + Engenharia; nome não alega prática repetível |
| Sustentável | Folhas fortes, pilares sem cobertura | Preservar; sistemas sem cobertura = não observado; não “organização adaptativa” |
| Fronteira de times | Duas unidades no mesmo artefato, causas diferentes | Finding de responsabilidade/fronteira; ancora em Entrega e na faixa; não some no corte de quatro |
| Segurança ≠ governança | Uma unidade: ameaça muda o caminho; outra: mesma aprovação | Segurança acende em Engenharia; governança na faixa; não um único slogan |

Cada caso declara `lookFor` executivo: decisão, valor (ou ausência),
quem autoriza, sistemas acesos, o que não pode aparecer (impacto
fabricado, “prática repetível” com classificação Reativa, Agilidade
como nó, Organização como pilar).

Testes de domínio cobrem o projetor do mapa e o cartão. O E2E percorre
home → sistema → disciplina → folha nos três casos, mais a fronteira.
Qualidade do texto: o `plainExplanation` do finding pronto do médio
não localiza a culpa no time.

### O que a massa não faz

Não rotula jornadas. Não move prior. Não declara o instrumento
calibrado. Não substitui as cinco entrevistas por perspectiva.

---

## Onda F — Relatório que responde (vigente)

Não é outra onda de prosa. Cada corte tem um teste que falha na home
atual e um aceite de leitura nos sintéticos `low`, `medium`,
`engineering-practice` e `boundary`. Sem piloto humano neste bloco.

### F1 — Cartão em quatro batidas

**Vigente.** O compacto mostra efeito, mecanismo sem eco do título,
ação com quem autoriza, teste e o que não resolve. Antipadrão e
hedges ficam em `details`. A especificação passou para
`recommendation-model.md`.

### F2 — Mapa sem disciplina aberta

**Vigente.** Em leitura de problema, chip e faixa só com finding
publicado. Sistema sem problema publicado mostra o nome e o drill,
sem status-ensaio. Pasta vazia continua no mapa fechado, nunca como
saúde e nunca como pergunta. A especificação passou para
`recommendation-model.md`.

### F3 — Cruzamento no detalhe da disciplina

**Vigente.** Não há sessão de cruzamento na home. O motor registra
as arestas; a página da disciplina mostra onde o mesmo mecanismo
chega e com que nome. Área maior lista as dores das menores. A
especificação passou para `recommendation-model.md`.

### F4 — Disciplina: dor, efeito, ação

**Vigente.** Uma linha de recorte (o que não é). Depois: dor local,
efeito no sistema, o que fazer e o teste. Lista de buracos da
entrevista fica fora desta página quando a folha não foi
atravessada — o drill do mapa fechado cobre o catálogo. A
especificação passou para `recommendation-model.md`.

### Fora de F

LLM, React, mais inventário, árvore exaustiva na home, calibrar por
sintético, piloto com pessoas, onda E.

### Quando F fecha

F e G já fecharam. A próxima onda de instrumento é E.

---

## Onda G — Anamnese por áreas (vigente)

O relatório do executivo é o **resultado das entrevistas**, não o
laudo de uma decisão. A home lista problemas por área com caminho,
sustentação, fundamento e impacto. Quem autoriza decide depois de
ler. Abrir uma área é capítulo com dossiê. O sintético opaco
atravessa três capítulos com nomes locais do mesmo evento.

A árvore de disciplinas **já é boa o suficiente como instrumento**:
Produto, Engenharia (com Plataforma dentro), Operação e Gestão como
faixa. Não falta um grafo novo. A leitura das intersecções já
organiza a mesma evidência publicada com o nome de cada recorte,
sem inventar aresta e sem promover Plataforma a sistema. O motor
guarda feeds, reforço de família e mesmo sistema diagnóstico; o
capítulo da área projeta todas as intersecções publicadas. Não
reparentar `capability-taxonomy.ts`.

### O que o exemplo exige e o que o motor já tem

| Peça do exemplo | No motor hoje | Na projeção hoje |
| --- | --- | --- |
| 3–5 dores na visão executiva, com gravidade | `findings[]`, `priority`, `severity` | **G1 vigente.** Índice por área; semáforo só se gravidade já publicada |
| Capítulo por área + “o que avaliamos” | sistemas Produto / Engenharia / Operação + faixa Gestão; `disciplineScope` | **G2 vigente.** Uma linha + dores locais + intersecção publicada |
| Dor: evidências, efeitos, hipóteses, solução, fundamento | `recommendationEvidence`, `systemicEffect`, `causalAnalysis.alternatives`, `intervention`, `foundation` | **G3 vigente** no índice e no capítulo; fundamento cotidiano |
| A mesma evidência em várias áreas, com outro nome | `affectedCapabilities`, cruzamento, dor local ≠ efeito do sistema | **G4 vigente** no sintético opaco; disciplina continua com “onde mais isso chega” |
| Solução: por quê, o que reduz, como, o que a referência defende, limite, prioridade | `plainExplanation`, `whyItWorks`, `doesNotSolve`, `matureReference`, `priority` | Visível no índice, com faixa de sustentação |
| Não escolher uma única árvore causal | hipóteses concorrentes + arestas | Vários caminhos quando a hipótese irmã foi publicada |

### O que copiar do exemplo — e o que é só cuidado

**Copiar.** A forma: índice de dores, capítulo por área, dossiê
(evidências → efeitos → hipóteses → soluções → fundamento), e a
mesma evidência reaparecendo com outro nome. Team Topologies, SRE,
DDD entram como **fundamento da solução**. O exemplo do GPT é
amostra de leitura para o time executivo, não especificação de
árvore. Os capítulos continuam Produto, Engenharia, Operação e a
faixa Gestão. Plataforma e Entrega ficam dentro de Engenharia.
Não reparentar `capability-taxonomy.ts` nem desenhar uma segunda
taxonomia “Desenvolvimento / Plataforma / Organização” para
parecer com o recorte.

**Cuidado — não é rejeitar o exemplo.** São regras do instrumento,
para o relatório não virar checklist de livro:

- A dor só existe se a entrevista publicou o comportamento. “DoD
  inconsistente” no exemplo é ilustração; se ninguém descreveu
  critério de pronto divergente, o relatório não inventa P02.
- “Fundamentação: Scrum Guide” não significa “faltou Scrum”. A
  referência explica por que a ação cabe; não diagnostica ausência
  de framework, ferramenta ou cargo.
- Várias soluções na mesma dor são bem-vindas quando cada uma amarra
  uma hipótese publicada, com sustentação própria (posterior da
  causa). Ownership, boundary e estrutura podem coexistir como
  caminhos, cada um com faixa de sustentação — não como três
  slogans iguais sem probabilidade.
- 🔴/🟠 só quando já há gravidade ou prioridade publicada. Sem isso
  o semáforo mente.

### Cortes

**G1 — Índice de problemas.** **Vigente.** A home lista as dores
publicadas por área, cada uma com a solução mais sustentada, a
faixa de sustentação, o que o caminho significa, o fundamento e o
impacto esperado. Não abre pedindo “o que fazer agora” como se a
decisão já tivesse sido tomada. A especificação passou para
`recommendation-model.md`.

**G2 — Capítulo de área.** **Vigente.** Abrir um sistema vigente
(Engenharia, Produto, Operação) ou a faixa Gestão mostra: uma linha
do que o recorte observa; as dores daquele capítulo, no nome local;
e, quando o cruzamento já foi publicado, a mesma evidência com o
nome do outro recorte. A especificação passou para
`recommendation-model.md`.

**G3 — Dossiê da dor e das soluções.** **Vigente.** Índice e capítulo
mostram evidências, efeitos, hipóteses e a lista de soluções
(significado, fundamento cotidiano, impacto, o que não resolve,
sustentação). “Blameless” se lê como investigação sem culpa. A
especificação passou para `recommendation-model.md`.

**G4 — Sintético de anamnese.** **Vigente.** O caso `low` publica a
fila, a próxima iniciativa e o war room como o mesmo evento em
Produto, Engenharia e Gestão. O índice e os três capítulos
contêm essa evidência com nomes locais. O médio nomeia dores em
Produto e Engenharia, não um slogan. A especificação passou para
`recommendation-model.md`.

### Fora de G

LLM, React, calibrar por sintético, piloto humano, onda E, segunda
árvore causal inventada, inventário de ferramentas, redesenhar a
árvore de disciplinas para copiar os capítulos do exemplo.

---

## Onda E — Lacunas que podem virar folha

Só depois de A–D e só com contrato (comportamento, restrição, rubrica).
Candidatas já vistas no grafo: dois times no mesmo artefato; adoção do
caminho de plataforma; custo de atraso; serviço ponta a ponta. Uma de
cada vez. Tuckman continua interpretação, não filho.

---

## Riscos

- Pasta vazia no mapa (grupo sem folha nem finding) parecer diagnóstico.
- UX “minimalista” cortar a decisão ou o limite do teste.
- Inflar sintéticos até parecer calibração.
- Reparentar o motor para “combinar” com o mapa.

## Mudanças na base, quando cada onda fechar

A, B, D, F, G e o cruzamento documentado já estão na base. E:
`assessment-model.md` por folha nova.
