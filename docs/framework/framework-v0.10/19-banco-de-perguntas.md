# 19 — Banco de perguntas e mecânica de aprofundamento: auditoria e padrão novo

> Pergunta: as perguntas e a mecânica de aprofundamento estão boas? Precisam ser
> refeitas ou evoluídas?
>
> **Resposta curta:** a **mecânica** (grafo, trilhas, probes, `reinforces`, saídas
> de visibilidade, auditoria) é boa e deve **evoluir**. O **banco de itens**
> precisa ser **reescrito** em boa parte: não do zero, mas com um padrão novo de
> escrita. A auditoria abaixo mostra por quê.

## 1. Auditoria quantitativa do grafo vigente (`evidence-anamnesis-pilot-v20`)

Extraída do próprio repositório (92 nós, 345 opções de prática, 350 sinais):

| # | Medida | Valor | Por que importa |
|---|---|---|---|
| A1 | Opções de estágio intermediário (peso 0 ou +1) | **9 de 350 sinais (3%)**; só **9 de 92 nós** têm alguma | O instrumento separa "frágil" de "excelente", mas quase não distingue 1, 2 e 3, justamente onde está a maioria das organizações |
| A2 | Distribuição dos pesos | −2: 127 · −1: 127 · 0: 3 · +1: 6 · +2: 84 | Polarizado: uma opção "boa" contra várias "ruins" |
| A3 | Camada consistência | **11 de 350 (3%)** | Sem consistência não há como sustentar o estágio 3 (04 §5). Sete das onze áreas têm 0 ou 1 sinal de consistência |
| A4 | Opção de peso +2 é a **mais longa** do nó | **48 de 75 nós (64%)**; por acaso seria ~29% | Pista de opção "certa". O comprimento é uma das pistas mais conhecidas na literatura de escrita de itens (Haladyna, Downing & Rodriguez, 2002) |
| A5 | Pergunta habitual ("costuma", "normalmente") | **39 de 92 nós**, embora **79** abram com "pense no último caso" | Mistura referência episódica com habitual; a pergunta habitual convida à resposta idealizada |
| A6 | Tamanho mediano das opções | 104 caracteres (máx. 174) | Carga de leitura alta; opções compostas (várias ações numa frase) |
| A7 | Sinais por opção | 1 sinal em 292 de 345 opções | Matriz Q esparsa: pouco uso do mesmo fato para várias capacidades |
| A8 | Opções de prática sem nenhum sinal | 26 | Revisar: ou são fatos de contexto (e deveriam ser marcadas assim) ou evidência perdida |
| A9 | Variantes por perspectiva | 40, nenhuma de direção executiva | Direção não é ouvida com linguagem própria |
| A10 | Cobertura por área (sinais) | governança 60 · organização 57 · … · observabilidade 13 · qualidade 10 | Desequilíbrio; qualidade e observabilidade com pouca evidência |

## 2. Diagnóstico qualitativo

Amostra de itens vigentes e o que eles mostram:

| Padrão | Exemplo real | Problema |
|---|---|---|
| **Opção-ideal com vocabulário virtuoso** | "Reconstrói condições e decisões sem buscar culpado, protege relatos difíceis e muda o sistema com responsáveis e sinais de efeito." | A melhor opção se reconhece pelo vocabulário ("sem buscar culpado", "sinais de efeito"), não pelo comportamento |
| **Opção composta** | A mesma opção acima junta 4 comportamentos | Quem vive 2 dos 4 não tem onde responder |
| **Cenário hipotético com pergunta habitual** | "Após uma falha relevante, há pressão por explicações… Como a organização costuma conduzir os dias seguintes?" | É julgamento situacional, não reconstrução do último evento |
| **Sem degrau do meio** | 1 opção +2, 3 opções −1/−2 | Não há como marcar "fazemos, mas só quando não há prazo" (estágio 2) |
| **Linguagem abstrata** | "Custo, capacidade, impacto e resultado por jornada orientam escolhas" | Difícil de reconhecer para quem não é especialista; o júnior não se vê nas opções |

**O que está bom e deve ficar:** ancoragem em evento, ausência de nomes de
ferramenta e prática, saída "não observo", probes causais só depois do sintoma,
funis `reinforces`, trilhas por contexto de trabalho, auditoria automática.

## 3. Veredito

| Componente | Decisão |
|---|---|
| Grafo, trilhas, contexto de trabalho, probes, `reinforces`, auditoria | **Evoluir** (§5) |
| Cenários (eventos escolhidos) | **Manter a maioria**; reescrever o enunciado para o passado do último caso |
| Opções | **Reescrever** com o padrão de §4: âncoras 0–4, curtas, comportamentais, sem pista |
| Probes causais | **Manter a lógica**; reescrever opções no mesmo padrão |
| Cobertura | **Ampliar**: consistência (pressão), generalização, direção executiva, vinhetas, sofisticação, domínios novos |

## 4. Padrão novo de escrita de item

### 4.1 Regras

| # | Regra | Verificação automática |
|---|---|---|
| E1 | O enunciado pergunta **o que aconteceu no último caso**, no passado. Nada de "costuma" | Bloquear "costuma", "normalmente", "geralmente", "tende a" no enunciado de prática |
| E2 | Cada opção descreve **um** comportamento observável | Bloquear opção com mais de um verbo principal coordenado (heurística) ou > 110 caracteres |
| E3 | Opções cobrem pelo menos **três degraus** (baixo, meio, alto), com âncora declarada | Bloquear nó de prática sem âncora 2 |
| E4 | **Sem pista de opção certa**: a opção de âncora alta não pode ser sistematicamente a mais longa nem a única com vocabulário de valor | Métrica por versão: % de nós em que a opção de maior âncora é a mais longa (meta ≤ 35%); lista de termos de valor ("sem culpa", "com efeito", "orientam", "revisão", "aprendizado") só em opções de qualquer âncora, nunca só na alta |
| E5 | Linguagem de quem faz o trabalho; frases que um júnior reconheceria | Entrevista cognitiva com início de carreira |
| E6 | A opção de ritual existe onde o ritual é comum ("existe, mas…") | Checklist de autoria |
| E7 | Visibilidade e "não se aplica" sempre presentes (vigente) | Vigente |
| E8 | Pergunta de frequência sempre pede faixa + exemplo | Vigente |

### 4.2 Antes e depois

**Antes** (nó `team-pressure`):

> *Após uma falha relevante, há pressão por explicações. Como a organização
> costuma conduzir os dias seguintes?*
> - Reconstrói condições e decisões sem buscar culpado, protege relatos difíceis e muda o sistema com responsáveis e sinais de efeito. (+2)
> - Concentra a análise na etapa em que a falha escapou e acrescenta revisão, orientação ou aprovação para reduzir nova ocorrência. (−2)
> - Lideranças e especialistas resolvem o caso em um grupo pequeno para reduzir exposição e recuperar a entrega. (−2)
> - Corrige o efeito imediato; com a pressão seguinte, a análise mais ampla perde prioridade. (−2/−1)

**Depois** (evento + três perguntas curtas):

> **Evento:** Pense na última falha que afetou clientes e que você acompanhou.
>
> **1. Depois que o serviço voltou, o que aconteceu primeiro?**
> - Nada além da correção. (âncora 0)
> - Procuraram quem tinha feito a mudança. (1)
> - Um grupo pequeno de líderes analisou o caso. (1)
> - Houve uma conversa com as pessoas envolvidas para entender o que aconteceu. (2)
> - Houve uma conversa aberta, com outras áreas, reconstruindo a sequência com dados. (3)
>
> **2. O que mudou no trabalho nas semanas seguintes?**
> - Nada. (0)
> - Uma nova aprovação ou revisão foi acrescentada. (1, `ritual`)
> - Uma correção técnica no ponto da falha. (2)
> - Uma mudança no sistema de trabalho, com alguém responsável por ver se funcionou. (3)
> - Uma mudança que depois foi revista e ajustada porque não funcionou como esperado. (4, camada resultado)
>
> **3. (pressão) E da última vez que isso aconteceu perto de uma entrega importante?**
> - A análise ficou para depois e não voltou. (1)
> - Foi feita de forma mais curta. (2)
> - Foi feita do mesmo jeito. (3, camada consistência)

As opções ficaram curtas, uma ação por opção, com o degrau do meio e sem
vocabulário que entregue a resposta.

## 5. Mecânica de aprofundamento evoluída

### 5.1 Escada por evento (padrão para toda trilha)

```text
1 EVENTO        "Pense no último…"                                  (âncora episódica)
2 FATO          o que aconteceu, em ordem                           (prática)
3 CONSEQUÊNCIA  o que mudou depois                                  (resultado)
4 PRESSÃO       "e quando havia prazo ou crise?"                    (consistência → estágio 3)
5 GENERALIZAÇÃO "isso vale também para [outro tipo]?"               (estágio 4)
6 EXEMPLO       uma frase livre, opcional                           (codificada, 07 §6; Laya, 20)
7 CAUSA         só se o sintoma abriu hipóteses                     (camada causal)
```

Hoje o grafo tem 1, 2, 3 e 7; **4 e 5 são raros** (A3). A regra nova: toda folha
publicável precisa de pelo menos uma pergunta de pressão e uma de generalização
alcançáveis nas trilhas que a observam.

### 5.2 Aprofundar pelo que falta na unidade, não só pela pessoa

Com a amostragem matricial (06 §4), a pergunta seguinte é escolhida pelo que
**a unidade** ainda não sabe. Se três engenheiros já descreveram o último deploy,
o quarto recebe a pergunta de pressão ou o evento de outra folha.

### 5.3 Confirmação cruzada

Quando uma perspectiva relata um fato que outra perspectiva deveria ver (a
engenharia diz "esperou 10 dias por aprovação"), o motor prioriza, para as
próximas pessoas da outra perspectiva (gestão, segurança), o item que observa o
mesmo evento do lado delas. É a triangulação feita **durante** a coleta, não só
no relatório.

### 5.4 Limite de probes

O teto vigente de 5 probes extras é mantido para a pessoa. A parada passa a ser
pela precisão da unidade (06 §5): quando a folha está precisa, o motor para de
aprofundá-la mesmo que haja probes disponíveis.

## 6. Produção do banco novo

| Etapa | Entrega | Critério |
|---|---|---|
| 1 | Reescrever os 57 cenários e 28 probes vigentes no padrão §4 | Métricas A1–A6 dentro da meta |
| 2 | Acrescentar perguntas de pressão e generalização por folha | Toda folha com ≥ 1 de cada |
| 3 | Variantes de direção executiva nos eventos de estratégia, incidente, investimento | ≥ 8 variantes |
| 4 | Vinhetas de ancoragem (07 §4.3) para as folhas organizacionais | 1 por folha |
| 5 | Itens de sofisticação (12, 18 §7) | 1 por trilha |
| 6 | Itens dos domínios novos por prioridade (03 §3.2; 13 §6) | Contrato completo (03 §5) |
| 7 | Entrevistas cognitivas (5–8 por perspectiva) | Sem erro recorrente de interpretação |

Metas numéricas por versão (acompanhadas pela auditoria):

| Métrica | v20 | Meta v21 |
|---|---|---|
| Nós com âncora intermediária | 9 de 92 | ≥ 90% dos nós de prática |
| Sinais de camada consistência | 3% | ≥ 15% |
| Nós em que a opção de maior âncora é a mais longa | 64% | ≤ 35% |
| Enunciados de prática com "costuma" | 39 | 0 |
| Opções > 110 caracteres | maioria | ≤ 10% |
| Variantes de direção executiva | 0 | ≥ 8 |
