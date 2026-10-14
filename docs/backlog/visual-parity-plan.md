# Plano: paridade visual com o protótipo

O protótipo `maturity` no design-graph é a referência visual. Este plano
lista o que as telas mostram e o HTML ainda não desenha. Não é compromisso
de implementação, ordem de prioridade nem licença para copiar os números
de exemplo (Orbital Pagamentos, índice 13%, “Integração contínua” como
dado fixo). Onde o modelo `m1` não mede, o bloco continua declarando a
lacuna.

O menu do relatório já segue o protótipo. O restante abaixo ainda não.

## Problema

Quem compara o protótipo com o produto encontra blocos de texto no lugar
de gráficos, cartões e grades. O menu chegou a listar walkthroughs de
Produto, Engenharia e Organização, que o protótipo não tem: essas áreas
vivem no mapa.

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

Rodapé do menu: instrumento vigente e estimativas provisórias. O rótulo
“Instrumento v21 · modelo m2” do protótipo não entra. As rotas
`/walkthrough/product`, `/engineering` e `/organization` continuam
acessíveis; só saíram do menu.

## Relatório — o que falta desenhar

| Tela | Já existe | Falta no visual |
| --- | --- | --- |
| Laudo | Motivo em citação ou lacuna, leitura com mecanismo, até três achados em cartão (caminho, sustentação, “Ver ficha”), divergência nos dois lados, restrição com efeito, conduta, prognóstico sem promessa, lacunas e exames separados, rodapé | Tema escuro é variante de tela no protótipo; o produto usa um botão no chrome |
| Mapa | Três cortes, sistema observado abre disciplinas, matrizes com célula do domínio, radar, perfil e legenda de estimativa, faixa e alvo só quando o modelo publica | — |
| Ficha | Trilha até o mapa; definição do que é e por que importa; “como está” com lacuna de 0–4 ou quadrante só quando há leitura; “o que já funciona” só na preservação | Grade do que as pessoas relataram, cartões separados de causa, lugar, ação e critério |
| Prontidão | Lista com banda e `p_k` | Cartão por prática (chaos, AI-DLC, service mesh no exemplo) com grade de pré-requisitos e legenda Pronto / Perto / Não pronto |
| Fronteira | Lista por banda | Faixas (dominado, pode aprender, bloqueado), condições humanas e bloco “Comece por” |
| Plano | Condutas 0–30, depois, pulso e lista Cynefin | Cartões de conduta ativa e setas de dependência. O protótipo não mostra “Depois” nem pulso como seções próprias |
| Walkthrough de Operação | Oito seções em listas | Caminho 30/90/180 como trilha, marcos em grade, chip de alvo |
| Histórico | Probabilidades e, quando há duas leituras, evolução e correspondência de unidades | Seletor da leitura anterior, comparação por capacidade, chips do que melhorou e piorou, nota de atenção |
| Visão por público | O achado reescrito por verbo | Um achado com pilha por público e o cartão da decisão de política |

## Administração

Os quatro rótulos já coincidem com o protótipo: 1 Projeto, 2 Estrutura,
3 Convites e participação, 4 Termo de uso. Na criação, só os dois
primeiros são links. No painel, só convites e termo. O protótipo deixa
os quatro clicáveis em todas essas telas.

| Tela | Já existe | Falta no visual |
| --- | --- | --- |
| Criar projeto | Nome e criação | Campos de contexto do protótipo (porte, regulação, estágio). Continuam fora do domínio; ver `future-evolution.md` |
| Estrutura | Hierarquia editável | Cartões de tribo e squad e a ação de adicionar squad no molde do protótipo |
| Convites | Lotes, revogar, reemitir, limiar | Linha de amostra, estado do lote e lembrar lote |
| Termo | Cinco cláusulas informativas | Aceite formal antes de liberar convites. Ainda é hipótese, não compromisso |

## Entrevista

O produto abre direto na pergunta, com progresso, práticas separadas de
saídas observacionais e tela de conclusão. O protótipo tem uma jornada
de telas, cada uma em web e celular:

1. Boas-vindas
2. Contexto
3. Sua perspectiva
4. Pergunta de evento
5. Pedido de exemplo
6. Aprofundamento de pressão
7. Pergunta de leitura
8. Conclusão

A boas-vindas dedicada já está como hipótese em `future-evolution.md`.
As outras telas também não são compromisso: só entram se o grafo publicar
o passo sem transformar a entrevista em prova de conhecimento.

## Fora deste plano

- Copiar índices, faixas e alvos desenhados no protótipo.
- Colocar as quatro áreas de volta no menu.
- React ou outro framework de interface.
- Calibração, piloto humano e folhas candidatas — continuam nos planos
  de instrumento.

## Menor experimento

Uma página de cada vez, em TDD do HTML: o teste afirma a presença do
bloco visual (trilha, cartão, marca de não avaliado) e a ausência do
número de exemplo. A primeira candidata, depois do menu, é o mapa:
radar e célula cinza sem índice.
