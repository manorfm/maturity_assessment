# Plano: paridade visual com o protótipo

Referência visual vigente: protótipo Design Graph
`anaminese_maturity_v3` (alias carregado também como `maturity`).
As telas do relatório, da administração e da entrevista já abrem no
produto. O que ainda falta desenhar porque o motor não publica o bloco
está em `sdd-docs/maturity-model-publication`, fora deste repositório.
Este arquivo guarda o inventário. Não é licença para copiar os números
de exemplo (Orbital Pagamentos, índice 13%/24%, “Integração contínua”
como dado fixo). Onde o modelo não mede, o bloco continua declarando a
lacuna.

## Problema

Quem compara o protótipo com o produto encontra blocos de texto no lugar
de gráficos, cartões e grades — e, no laudo, tipografia e composição
muito abaixo do que o protótipo define (índice 88px, citação 38px
itálica, grades e medidores).

## Hipótese de resultado

Cada página do relatório, da administração e da entrevista usa os mesmos
blocos visuais do protótipo, preenchidos com a leitura publicada. Célula
sem cobertura continua neutra. Nenhum gráfico publica o exemplo numérico
do protótipo.

## Menu — vigente

Ordem do protótipo, já no chrome:

1. Laudo
2. Mapa
3. Ficha da capacidade aberta, ou do primeiro achado publicado
4. Prontidão para práticas avançadas
5. Fronteira de aprendizado
6. Plano de tratamento
7. Área: Operação
8. Histórico e reavaliação
9. Visão por público

Rodapé do menu no protótipo: `Instrumento v21 · modelo m2` **e**
`Estimativas provisórias`. No produto: só “Instrumento vigente /
Estimativas provisórias” — o rótulo v21/m2 **não entra**. As rotas
`/walkthrough/product`, `/engineering` e `/organization` continuam
acessíveis; só saíram do menu.

## Reavaliação pós-rebuild (2026-11-21)

O banco do Design Graph foi reconstruído. `get_build_diff` nesta carga
reportou **primeira build** (sem delta automático vs. build anterior);
a reavaliação abaixo foi feita contra `get_screen`/`get_full`/`search`
em `anaminese_maturity_v3` e contra o HTML/CSS do produto.

### O que o inventário anterior capturou errado ou de forma incompleta

| Assunto | Antes (plano) | Agora (protótipo reconstruído) |
| --- | --- | --- |
| Identidade do doc | genérico `maturity` | Doc ativo `anaminese_maturity_v3` (espelho `maturity` ainda listado) |
| Índice tipográfico no laudo | “~34px” | **88px** Newsreader no índice principal de Tecnologia; prognóstico usa **36px**; restrição título **40px** |
| Citação do motivo | “citação” sem escala | **38px** itálico serif; autor 14px |
| H1 do laudo | implícito “hero” | **52px** Newsreader; produto hoje ~`clamp(2rem,4vw,2.75rem)` |
| Mecanismo (leitura geral) | texto corrido | **25px** serif, max ~40ch |
| Seções do laudo | `h2` simples | Trilho esquerdo **numerado 1–8** (serif 15px) + título 15px/600 + lead 13px |
| Hero / amostra | sample só no rodapé | Hero em duas colunas: contexto à esquerda; **respondentes · unidades · perspectivas** + janela de coleta à direita |
| Aviso de uso | só rodapé / parágrafo | **Note** com borda `1.5px solid var(--ink)` no hero **e** coluna no footer |
| Leitura + medidor | “medidor” vago / bloqueado | Índice grande + linha de faixa/cobertura/alvo + **gauge** (trilho, banda `accent-soft`, marcador) por recorte |
| Achados | cartões empilhados | Grade **3 colunas**; path caps + ordem serif; fato 21px; dots de sustentação |
| Divergências | dois textos lado a lado | Título + “N pontos de distância” + **barra comparativa** (Direção/Operação com %) — produto ainda é texto |
| Restrição | bloco de texto | Cartão `accent-soft` + borda accent; título 40px; métrica lateral (ex. “6 a 15 dias”) |
| Conduta 30 dias | cartões empilhados | **Tabela** Experimento \| Dono \| Critério (não só `report-conduct`) |
| Prognóstico | “só lacuna de domínio” | Layout **dois cartões** (Sem tratamento / Com tratamento) + índice 36px + gauge; domínio ainda não publica distribuição — a **casca visual** faltava no inventário |
| Lacunas / exames | listas sob h3 | Grade **2 colunas** Lacunas \| Exames |
| Footer | pilha de `<p>` | Grade **2 colunas** “Sobre estas estimativas” \| “Aviso de uso” |
| Criar projeto | “faltam porte/regulação/estágio” | Protótipo já desenha fieldsets: **Porte da área de tecnologia**, **Setor regulado**, **Estágio da organização**, motivo com nota de citação, “Salvar rascunho” |
| Contexto (entrevista) | “senioridade fora do domínio” | Tela dedicada com seção **Senioridade na profissão** (`SenioridadeProfissãoFieldset`); “Como tratamos os dados” nas boas-vindas |
| Mapa “já existe / —” | coluna “Falta” vazia | Subestimou densidade: ChartGrid, ChartMark*, células perspectivas×capacidades, SCobertura — Onda 2a só fechou marca NA |

### O que continua correto

- Menu de 9 itens e exclusão de walkthroughs Product/Engineering/Org do menu.
- Proibição de copiar Orbital / 13% / 24% / Integração contínua fixa.
- Domínio bloqueia prognóstico real (duas distribuições) e aceite formal do termo.
- Tokens claros/escuros alinhados; Onda 1 e Onda 2a (NA) feitas.

## Relatório — o que falta desenhar (revisado)

| Tela | Já existe no produto | Falta no visual (protótipo) |
| --- | --- | --- |
| Laudo | Casca tipográfica e composição (Onda 3): h1 52 / quote 38 itálico / mecanismo 25 / índice 88; seções 1–8; note com borda ink + amostra no hero; achados em 3 colunas; conduta Experimento\|Dono\|Critério; lacunas/exames e footer em 2 colunas; tema via botão | Gauge de faixa; divergência com barra; restrição em cartão accent; prognóstico em 2 cartões+gauge (números só se publicados). Tema escuro no protótipo é tela variante; produto mantém toggle |
| Mapa | Cortes, matrizes, radar, SCobertura/`--na` (Onda 2a) | ChartGrid / ChartMark*, densidade perspectivas×capacidades, trilhas CapsBold; disciplina sem pilar pai permanece **domínio** |
| Ficha | Trilha, definição, pesos, relatos, close | Ritmo de cartões/quadrantes, ChartMark de estágio, Alvo tipográfico do mock (sem copiar %) |
| Prontidão | `p_k` / lacuna | Grades Grid6/Grid7 do protótipo — **sem** % de exemplo |
| Fronteira | Faixas textuais | Marcas ChartMark6 F0–F5 só com posterior; stacks de condições humanas |
| Plano | Colunas de horizonte | DiasAtivasStack / tags; setas de dependência no visual do protótipo |
| Walkthrough Operação | Texto + trilha | CaminhoStack / CaminhoTag; marcos sem % de exemplo |
| Histórico | Seletor, deltas | ChipsItem / alvo só com par publicado |
| Visão por público | Dois lados | DecisãoPolíticaStack; proibir CTO/CFO/Orbital |

## Administração (revisado)

| Tela | Já existe | Falta |
| --- | --- | --- |
| Criar projeto | Nome + 4 passos numerados (admin já próximo) | Persistir/exibir **Porte**, **Setor regulado**, **Estágio da organização**, motivo→citação do laudo, “Salvar rascunho” — **bloqueado no domínio** até contrato; visual dos radios já especificado no protótipo (`NovoDiagnósticoLabel`) |
| Estrutura | Cartões | Polimento fino |
| Convites | Lote / amostra | Polimento fino |
| Termo | Cinco cláusulas + aviso | Aceite formal que trava convites — hipótese |

## Entrevista (revisado)

| Tela | Já existe | Falta |
| --- | --- | --- |
| Boas-vindas | Anonimato, tempo, começar | Link **Como tratamos os dados** (texto no protótipo; domínio ainda não publica política) |
| Contexto | Tela do grafo | **Senioridade na profissão** (fieldset no protótipo); tempo de empresa se existir no markup — fora do domínio até contrato |
| Perspectiva / evento / exemplo / pressão / leitura | Fluxo | Polimento; leitura já tem figura semanal |
| Conclusão | Limiar 5 | Compromisso de devolução do resumo — domínio não registra |

## Hipóteses abertas do recorte do laudo (revisadas)

1. ~~**Casca tipográfica e de layout do laudo (só CSS/HTML).**~~ Feito na Onda 3.
2. ~~**Gauge + índice por recorte.**~~ Feito na Onda 4: trilho/banda/marcador só com índice/faixa publicados; lacuna no mesmo encaixe sem %.
3. ~~**Divergência em barra.**~~ Feito na Onda 4: barra + “pontos de distância” só com magnitudes opcionais no item; senão texto/lacuna.
4. ~~**Prognóstico em dois cartões.**~~ Feito na Onda 4: casca Sem|Com tratamento sempre; números/gauge só se o laudo publicar os dois lados.
5. **Lacunas de prova** (banda 50 pts, `maturitySliceDraws`) e fixture e2e sem faixa — inalteradas.
6. **Contexto do projeto (porte / setor regulado / estágio / motivo).** Protótipo completo; produto sem campos — contrato de domínio antes do green de UI.

## Fora deste plano

- Copiar índices, faixas e alvos desenhados no protótipo.
- Colocar as quatro áreas de volta no menu.
- React ou outro framework de interface.
- Calibração, piloto humano e folhas candidatas — continuam nos planos
  de instrumento.
- Gravar o rótulo “Instrumento v21 · modelo m2” no chrome do produto.

## Menor experimento

Uma página de cada vez, em TDD do HTML: presença do bloco visual e
ausência de Orbital/`13%`/`24%`.

Ordem revisada pós-rebuild:

1. ~~Tokens + shell~~ (feito).
2. ~~Mapa marca NA~~ (feito); ChartGrid permanece aberto.
3. ~~Laudo — casca tipográfica e composição~~ (feito).
4. ~~Laudo — gauge/divergência-barra/prognóstico-cartões condicionados à publicação~~ (feito).
5. Mapa ChartGrid (sem %).
6. Ficha → Prontidão → Fronteira → Plano.
7. Walkthrough → Histórico → Público.
8. Admin contexto + entrevista (só após contrato de domínio).
9. Prova transversal (e2e sem faixa; testes de banda/amostragem).

## Inventário (atualizado 2026-11-21)

| Tela (protótipo) | View atual | Classificação | Notas |
| --- | --- | --- | --- |
| Laudo / Laudo escuro | `renderLaudo` | **casca** (Onda 3) + **condicionado** (Onda 4) | Gauge/barra/métrica só com publicação; prognóstico 2 cartões com gap |
| Mapa navegável | `renderMapPage` | só CSS (+ domínio disciplina-sem-pai) | Onda 2a feita; ChartGrid aberto |
| Ficha do nó | `renderNodeCard` | só CSS | |
| Prontidão | `renderReadinessPage` | só CSS | |
| Fronteira | `renderFrontierPage` | só CSS | |
| Plano | `renderTreatmentPage` | só CSS | |
| Walkthrough Operação | `renderWalkthrough` | só CSS | |
| Histórico | `renderHistoryPage` | só CSS | |
| Visão por público | `renderAudiencePage` | só CSS | |
| Criar projeto | admin | **bloqueado** + só CSS | Radios porte/setor/estágio no protótipo |
| Estrutura / Convites | admin | só CSS fino | |
| Termo | admin | bloqueado (aceite) | |
| Entrevista | `interview-view` | só CSS fino + bloqueado | Senioridade + link de dados |

### Fundação visual

| Item | Estado |
| --- | --- |
| Tokens `.diagnostic-report` + `:root --na` | feito (Ondas 1 e 2a) |
| Shell nav 9 itens + tema | vigente |
| Anti-exemplo Orbital/13%/24% | vigente nos testes |

## Sequência de implementação

0. Inventário Onda 0 — feito; **reavaliação pós-rebuild** — esta seção.
1. Tokens + shell — feito (`f9c1713`).
2. Mapa NA — feito (`a65be16`); ChartGrid aberto.
3. Laudo casca (tipografia, números de seção, grades, tabela conduta, footer) — feito.
4. Laudo condicionado (gauge, barra de divergência, prognóstico 2 cartões, restrição accent-soft) — feito.
5. Mapa ChartGrid.
6. Ficha → Prontidão → Fronteira → Plano.
7. Walkthrough → Histórico → Público.
8. Admin + entrevista (domínio primeiro).
9. Prova transversal.

Fora: React, copiar números do mock, recolocar 4 áreas no menu,
calibração/piloto/folhas candidatas.
