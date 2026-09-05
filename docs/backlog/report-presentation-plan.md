# Plano: relatório apresentável — mapa, cartão, UX e sintéticos

Ondas A–D estão na base. Resta a hipótese das folhas candidatas (onda E).
Detalhe do mapa permanece em
[`organizational-area-map-plan.md`](organizational-area-map-plan.md);
detalhe da prosa do cartão em
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
| C | UX minimalista | **Vigente.** First screen: cartão + sistemas + radar + restrições por frente |
| D | Massa sintética | **Vigente.** Três bandas + fronteira e segurança≠governança passam a barra |
| E | Folhas candidatas | Só depois de B–D; lacunas viram folha com contrato, uma de cada vez |

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

**Entregue.** A especificação vigente está em `assessment-model.md`,
`recommendation-model.md` e `technical-architecture.md`. Sem framework
novo. HTML e CSS atuais. Hierarquia visual, não mais prosa.

### First screen (uma tela)

```text
┌─────────────────────────────────────────────────────────┐
│  O que está acontecendo              Precisa de correção│
│  Frase cotidiana do efeito                              │
│  Por que isso se repete                                 │
│  O que fazer agora · quem autoriza                      │
│  Teste · o que não resolve · não faça                   │
│  [detalhe] fundamento e evidência                       │
└─────────────────────────────────────────────────────────┘

┌──────────┐ ┌──────────┐ ┌──────────┐
│ Produto  │ │Engenharia│ │ Operação │
│ Ver disc.│ │ Ver disc.│ │ Ver disc.│
└──────────┘ └──────────┘ └──────────┘
     Radar dos oito pilares (depois dos sistemas)
     “?” = sem cobertura temática, não falta de gente

── Gestão ──  só se houver restrição cruzada
   Modelo de times · Responsabilidade · Governança · …

Outras restrições   frente diagnóstica · mecanismo · decidir|investigar
Unidades            uma linha + ver cobertura deste time
```

### Regras de layout

- Um cartão de decisão. O resto é navegação ou lista.
- Três sistemas no mesmo peso. Gestão nunca é o quarto azulejo.
- Folha ou finding acende o sistema; vazio é “não observado”, não zero.
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

A, B, C e D já estão na base. E: `assessment-model.md` por folha nova.
