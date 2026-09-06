# Plano: relatório apresentável — mapa, cartão, UX e sintéticos

Ondas A–D e o cruzamento documentado (0.93) estão na base. A home
ainda falha o aceite de leitura: o cartão é um memorando, o mapa
ainda mostra disciplinas sem causa, e o cruzamento às vezes não
amarra a decisão. **F é a sequência aberta.** E (folhas candidatas)
só depois de F. Piloto humano só depois de F fechar.
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
| F | Relatório que responde | **Aberta.** Quatro cortes abaixo; aceite: quem lê o showcase reformula a decisão sem perguntar o que a entrevista não atravessou |
| E | Folhas candidatas | Só depois de F; lacunas viram folha com contrato, uma de cada vez |

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

## Onda F — Relatório que responde (aberta)

Não é outra onda de prosa. Cada corte tem um teste que falha na home
atual e um aceite de leitura nos sintéticos `low`, `medium`,
`engineering-practice` e `boundary`. Sem piloto humano neste bloco.

### F1 — Cartão em quatro batidas

O compacto ainda empilha título de catálogo, “por que se repete” que
copia o título, autorização, teste, o que não resolve, antipadrão e
hedges de prontidão. Quem lê sai com pergunta.

**Fazer.** No primeiro plano, só: efeito cotidiano; um mecanismo que
não ecoa o título; verbo + quem autoriza; teste + o que não resolve.
Antipadrão, prontidão, contenção e “não significa que não exista”
ficam no `details` já existente. TDD no HTML visível (sem conteúdo
de `<details>`).

**Aceite.** Em viewport desktop, decisão + cruzamento + três sistemas
cabem sem rolar. Quem lê o opaco reformula: guerra de crise, quem
para de autorizar caça ao culpado, como sabe. Não pergunta se “o
caminho já existe”.

### F2 — Mapa sem disciplina aberta

Os azulejos ainda listam Direção, Descoberta, Portfólio… sem causa.
Isso reabre a lacuna que saiu da árvore.

**Fazer.** Em leitura de problema, chip e faixa só com finding
publicado. Sistema sem problema publicado mostra o nome e o drill,
sem status-ensaio. Pasta vazia continua no mapa fechado, nunca como
saúde e nunca como pergunta.

**Aceite.** A first plane do opaco não contém “entrevista não
atravessou”, “ainda sem causa” nem nome de folha sem finding.

### F3 — Cruzamento amarra a decisão ou declara que não amarra

Hoje o cruzamento já recusa o leque “tudo gera o cartão”. No opaco
as três arestas conversam com a crise. Na baixa prática o cartão é
segurança e as arestas são fila, aprendizado e herói → reversão —
três mecanismos reais que não tocam a decisão do cartão.

**Fazer.** Se existir feed documentado até o finding do cartão,
pelo menos uma aresta aponta para ele. Se não existir, uma linha:
esta decisão não depende das outras frentes publicadas — e as três
arestas continuam só com mecanismo. Proibido inventar “herói gera
token”. Frase vaga de efeito sistêmico (“mudanças se encontram
tarde”) só entra se for o mecanismo da aresta, não um tapa-buraco.

**Aceite.** Em cada um dos quatro sintéticos, as arestas visíveis
são acionáveis (dá para dizer o que parar). Nenhuma cola dois
títulos com “gera”.

### F4 — Disciplina: dor, efeito, ação

A página ainda abre com três parágrafos de escopo. Isso gera
pergunta antes da causa.

**Fazer.** Uma linha de recorte (o que não é). Depois: dor local,
efeito no sistema, o que fazer. Lista de buracos da entrevista
fica fora desta página quando a leitura é problema e a folha não
foi atravessada — o drill do mapa fechado cobre o catálogo.

**Aceite.** Abrir `Acesso a capacidades` no opaco mostra a fila, o
que ela gera e o teste. Não pergunta o que a disciplina “abrange”
em três blocos.

### Fora de F

LLM, React, mais inventário, árvore exaustiva na home, calibrar por
sintético, piloto com pessoas, onda E.

### Quando F fecha

Atualizar `recommendation-model.md`, `assessment-model.md` e o
wireframe vigente. Só então o
[`plano multiárea`](multi-area-consultant-diagnostic-plan.md) volta
a ser o próximo passo humano.

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

A, B, D e o cruzamento documentado já estão na base. F: `recommendation-model.md`
e `assessment-model.md` quando o first screen fechar decisão. E: `assessment-model.md` por folha nova.
