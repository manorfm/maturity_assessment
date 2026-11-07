# Plano: paridade visual com o protótipo

O protótipo `maturity` no design-graph é a referência visual. As telas
do relatório, da administração e da entrevista já abrem. O que ainda
falta desenhar porque o motor não publica o bloco está em
`sdd-docs/maturity-model-publication`, fora deste repositório. Este
arquivo guarda o inventário. Não é licença para copiar os números de
exemplo (Orbital Pagamentos, índice 13%, “Integração contínua” como
dado fixo). Onde o modelo não mede, o bloco continua declarando a
lacuna.

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
| Ficha | Trilha até o mapa; definição; “como está” com os cinco pesos 0–4 quando a posterior da folha está publicada, senão a lacuna; quadrante só com leitura; relatos por perspectiva e por time; cartões de causa, lugar, ação, critério, lacuna e referência; relações são as arestas publicadas do nó e, sem aresta, a lacuna; “o que já funciona” só na preservação | — |
| Prontidão | Com posterior de estágio, a página publica `p_k`, o pré-requisito mais fraco e a conduta; sem leitura, a lacuna. A grade de percentuais do exemplo não é o produto | — |
| Fronteira | Faixas dominado, pode aprender agora e ainda bloqueado; “Comece por”; condições humanas em paralelo com “Ver prontidão →”. A marca F0–F5 é a posterior publicada; sem posterior, a faixa fica textual. As marcas 0–5 do exemplo não são o produto | — |
| Plano | Cartão (ação, dono, critério, Cynefin, evidência) nas colunas 0–30 dias, 1–3 meses e 3–12 meses, publicadas pela dependência e pelo modo de aprendizado; seta “depende de” ou “sem dependência”; coluna vazia diz que não há conduta naquele horizonte; grau D como experimento; pulso só com item-âncora | — |
| Walkthrough de Operação | Abertura com estado ou lacuna; próxima fase dentro da fronteira; trilha 30/90/180 com o que esperar; o marco é a conduta publicada (ação, horizonte e critério; percentual só quando o índice inclui alvo); riscos e premissas fecham. A grade de marcos com prazo e alvo percentual do exemplo não é o produto | — |
| Histórico | Seletor quando há mais de uma leitura anterior; estados do índice e das folhas guardadas; achados encerrados e novos; correspondência de unidades; nota de que a melhora não prova causa. O chip de alvo é o par de alvos guardados nas duas leituras; sem alvo numa delas, a página compara estágio e folha e não mostra percentual. Os chips de alvo do exemplo não são o produto | — |
| Visão por público | Um achado por vez, com caminho e fato; versão da direção e versão do time; papéis em “A quem recorrer”; acompanhamento que não vira bônus | Nomes de cargo do exemplo (CTO, CFO) e o caso de Pagamentos |

## Administração

Os quatro passos são links na criação e no painel: Projeto, Estrutura,
Convites e participação, Termo de uso. A estrutura é cartão de unidade,
com adicionar abaixo e remover. O lote mostra estado, amostra agregada
e o lembrete, sem fingir envio. O termo usa as cinco cláusulas no nome
da organização e avisa que o aceite não é gravado.

| Tela | Já existe | Falta no visual |
| --- | --- | --- |
| Criar projeto | Nome, os quatro passos e a lacuna dos passos que só existem depois do projeto | Campos de contexto (porte, regulação, estágio). Continuam fora do domínio; ver `future-evolution.md` |
| Estrutura | Cartões, adicionar abaixo e remover; unidade com convite permanece final | — |
| Convites | Amostra agregada, estado do lote, revogar, reemitir e lembrar | — |
| Termo | Cinco cláusulas e a frase de que o aceite não é gravado | Aceite formal antes de liberar convites. Ainda é hipótese, não compromisso |

## Entrevista

O convite abre na boas-vindas: anonimato, minutos estimados, pausa e
Começar. Perspectiva e contexto são telas próprias e avisam que não
pontuam. O evento separa a prática de “não observo”. O exemplo limita
os caracteres e pede para não citar nomes. O aprofundamento só entra
quando o grafo pede. A leitura usa o estímulo publicado. A conclusão
lembra o limiar de 5 e que o percurso não reabre. No celular a coluna
empilha.

| Tela | Já existe | Falta no visual |
| --- | --- | --- |
| Boas-vindas | Anonimato, tempo estimado, pausa e começar | Link “Como tratamos os dados”, que o domínio ainda não publica |
| Contexto e perspectiva | Telas do grafo, sem pontuação | Senioridade e tempo de empresa. Continuam fora do domínio |
| Evento, exemplo, pressão e leitura | Moldura do passo, limite do texto, probe só no grafo; leitura desenha a série semanal do item | — |
| Conclusão | Limiar de 5 e percurso que não reabre | Compromisso da organização de devolver o resumo, que o domínio não registra |

## Hipóteses abertas do recorte do laudo

Descobertas ao fechar o recorte técnico/organizacional do laudo. São hipóteses
abertas, não compromisso, ordem ou prazo.

1. **Rótulo e índice separados.** O protótipo mostra o rótulo do recorte
   (15px/600) à esquerda, o índice serifado (~34px) à direita e a faixa numa
   linha secundária. Exigiria elemento próprio para o índice e um contrato de
   teste por texto acessível, não por HTML literal. O `quality-reviewer` precisa
   aceitar esse contrato antes de qualquer código de produção.
2. **Medidor, cobertura e alvo por recorte.** O protótipo os desenha, mas o
   domínio não tem fonte para eles. Só entram se a publicação os trouxer; o
   valor de exemplo continua proibido.
3. **Lacunas de prova no teste do recorte.** Hoje o teste não é sensível ao
   limite de 50 pontos da faixa (subir o corte para 60 continua verde) nem ao
   número de sorteios (`maturitySliceDraws` de 8000 para 500 continua verde).
   Cabe um teste de fronteira e outro sensível à amostragem.
4. **Duas lacunas no e2e.** O estado em que os recortes técnico e organizacional
   ficam sem faixa só tem teste unitário. Nenhum caso da fixture e2e o renderiza.
   Falta um caso de fixture que o exiba.

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
