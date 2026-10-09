# 07 — Desenho de perguntas

> As regras vigentes de `question-design.md` continuam valendo: evento recente e
> concreto, sem citar a prática inferida, opções plausíveis com custo e benefício,
> três estados observacionais, ordem determinística, auditoria. Este documento
> acrescenta **tipos de item**, **lentes**, **controles de viés** e **exemplos
> completos** com a matriz Q de 04.

## 1. Técnica-base: incidente crítico

Reconstruir **a última ocorrência concreta** (Flanagan, 1954) reduz a resposta
socialmente desejável e o viés de método comum (Podsakoff et al., 2003). A escada
de cada trilha:

1. **Evento:** "A última vez que…"
2. **Fatos ordenados:** quem, o quê, quanto tempo esperou, quem decidiu.
3. **Consequência:** o que aconteceu depois e no caso equivalente seguinte.
4. **Pressão:** "E quando havia prazo apertado?" (separa estágio 2 de 3).
5. **Generalização:** "Isso também acontece com [outro tipo de mudança]?"
   (testa o estágio 4).
6. **Discriminação de causa:** só depois que o sintoma abriu hipóteses.

## 2. Catálogo de tipos de item

| Tipo | Uso | Camada | Situação |
|---|---|---|---|
| Reconstrução de evento | Principal fonte de evidência de prática | Prática, consistência, resultado | Vigente |
| Escolha forçada com trade-off | Revelar prioridade real sob restrição | Prática, sistema | Vigente |
| Ordenação de próximas ações | Revelar resposta a incidente ou pressão | Prática | Vigente |
| Distribuição de orçamento ou tempo | Revelar alocação real (toil × melhoria) | Sistema | Vigente |
| Frequência + exemplo | Recorrência com âncora concreta | Consistência | Vigente |
| **Opções ancoradas por comportamento** | Opções escritas como âncoras de estágio | Todas | **Novo padrão de escrita** (§3) |
| **Leitura** (julgamento situacional) | Letramento: CFD, outlier, meta não atingida | Conhecimento | **Novo** (§4.2) |
| **Vinheta de ancoragem** | Estimar a severidade de cada perspectiva | — (calibração) | **Novo** (§4.3) |
| **Técnica de lista** | Temas sensíveis: manipulação de métrica, medo | Sistema | **Novo, só agregado grande** (§4.4) |
| **Aberta curta codificada** | Compreensão da estratégia; exemplo do evento | Conhecimento, prática | **Novo, opcional** (§6) |
| **Pulso** | Acompanhamento após tratamento | Mesma do item-âncora | **Novo** (08 §7) |

## 3. Opções ancoradas por comportamento

> O padrão completo de escrita, com a auditoria do grafo vigente e exemplos de
> antes e depois, está em [19](19-banco-de-perguntas.md).

As opções de uma pergunta de prática passam a ser escritas como **âncoras
comportamentais** da rubrica, no espírito das escalas BARS (Smith & Kendall,
1963): cada opção descreve um comportamento reconhecível, e a autoria declara o
estágio que ele caracteriza. Regras:

- de 3 a 5 opções de prática, cobrindo pelo menos um estágio baixo (0–1), um
  intermediário (2) e um alto (3–4);
- nenhuma opção menciona o nome da prática ou soa como "a certa";
- opções de ritual (a forma existe sem a função) são explícitas, porque são o
  estágio 1 mais comum e o mais difícil de o respondente admitir;
- "não observo" e "não se aplica" sempre no fim (vigente).

### Exemplo: indicador como termômetro (D12, prioridade 1)

> **Cenário:** Pense no último objetivo importante do seu time que não foi
> atingido.
> **Pergunta:** Qual foi a primeira conversa sobre isso?

| Opção | Âncora | Camada | Observação |
|---|---|---|---|
| Não houve conversa; o objetivo foi substituído pelo seguinte | 0 | prática | |
| Pediram mais esforço, horas ou foco para recuperar o número | 1 | prática | `appropriation: heroism` |
| Buscaram quem deixou de entregar a sua parte | 1 | prática | Sinal também para clima (D11) |
| Revisaram a meta e fizeram um plano de ação para fazer mais do mesmo | 2 | prática | |
| Perguntaram o que faltou saber, fazer ou ter para chegar lá, e mudaram algo no trabalho | 3 | prática | |
| Isso já aconteceu antes e a mudança feita na vez anterior foi revista para ver se funcionou | 4 | resultado | |
| Não acompanho esse tipo de situação | — | visibilidade | |

Matriz Q: `leaf = indicador-termometro (rubrica)`, efeito em
`leadership-management` com âncora igual para as opções de culpa.

### Exemplo: desdobramento estratégico (D12, prioridade 2)

> **Cenário:** Pense no trabalho mais importante que você fez na última semana.
> **Pergunta:** Qual frase descreve melhor o que você sabe sobre a razão dele?

| Opção | Âncora |
|---|---|
| Recebi a tarefa; não sei a que objetivo ela serve | 0 |
| Sei qual projeto ou entrega ela compõe, mas não o resultado que se espera | 1 |
| Sei o objetivo da área, porque está escrito, mas não participei de como chegamos a ele | 2 |
| Sei o objetivo e o resultado esperado e ajudei a decidir como meu time contribui | 3 |
| Sei explicar o porquê e já vi o objetivo mudar por algo que o meu time trouxe | 4 |

Complemento aberto opcional: "Em uma frase, a que ele serve?" (codificado em §6 e
comparado com a resposta da direção).

## 4. Tipos novos

### 4.1 Pergunta sobre o grupo, não sobre si

Para clima e cultura, usar o referente do grupo ("neste time, quando alguém
erra…") e não o indivíduo ("quando eu erro…"). A pergunta mede o que o grupo vive
(Chan, 1998) e protege o respondente (P2, P3).

### 4.2 Leitura (camada Conhecimento)

Um estímulo sintético e uma pergunta de interpretação, sem jargão. Mede
letramento coletivo; é agregado só acima do limiar e alimenta a variável
**letramento**, separada da prática (04 §5).

> **Estímulo:** gráfico com o número de itens em cada etapa ao longo de 8
> semanas; a faixa "aguardando teste" cresce todas as semanas e a faixa
> "concluído" quase não sobe.
> **Pergunta:** Se este fosse o quadro do seu time, o que você faria primeiro na
> segunda-feira?

| Opção | Leitura |
|---|---|
| Parar de começar itens novos e ajudar a esvaziar "aguardando teste" | Correta (gargalo + WIP) |
| Pedir para o time trabalhar mais rápido em desenvolvimento | Incorreta (otimiza o lugar errado) |
| Contratar mais desenvolvedores | Incorreta |
| Não mudar nada; o gráfico mostra que o time está ocupado | Incorreta (confunde ocupação com fluxo) |
| Não sei interpretar este gráfico | Letramento ausente (informação útil, não falha) |

### 4.3 Vinheta de ancoragem

Uma **situação hipotética** igual para todas as perspectivas, com estágio
conhecido pela autoria, avaliada com as mesmas opções do item real (King &
Wand, 2007).

> **Vinheta:** "Num time, as mudanças ficam prontas na segunda-feira, mas só vão
> para os usuários na quinta, depois que três pessoas de áreas diferentes
> assinam um formulário. Quem assina raramente olha o código."
> **Pergunta:** Qual destas descrições melhor representa a situação deste time?
> (mesmas opções do item de aprovação de mudança)

Âncora da autoria: estágio 1. A diferença média entre a escolha de cada
perspectiva e a âncora estima a severidade dessa perspectiva (05 §4.1).

Regras: 1–2 vinhetas por respondente, em rodízio; cada folha organizacional ou
de clima tem pelo menos uma vinheta; as vinhetas passam por entrevista cognitiva
para garantir que todos as entendem da mesma forma (premissa de equivalência).

### 4.4 Técnica de lista (temas sensíveis)

Para comportamentos que as pessoas não admitem diretamente (manipular métrica,
esconder incidente, medo de reportar), a técnica de lista (Blair & Imai, 2012)
estima a prevalência sem que ninguém revele a própria resposta: metade da
amostra vê 4 afirmações neutras e responde **quantas** são verdadeiras; a outra
metade vê as mesmas 4 mais a afirmação sensível. A diferença das médias estima a
prevalência.

Restrições: só em recortes com ≥ 40 pessoas (a variância é alta), nunca em times
pequenos; resultado sempre com intervalo; uso restrito a sinais organizacionais
(D11, D12).

### 4.5 Decisões sobre pessoas sem identificar pessoas

Para pessoa-função e tratamento de disfunção (`[pesquisa]`), perguntar sobre
**padrões de decisão do sistema**, em tempo e frequência, nunca sobre um caso
identificável:

- "Nos últimos 12 meses, quando um comportamento prejudicava o time de forma
  recorrente, quanto tempo costumava levar até algo mudar?" (semanas · meses ·
  não mudava · não observo)
- "Nas últimas escolhas de liderança que você acompanhou, o critério mais visível
  foi…" (resultado individual · capacidade de desenvolver pessoas · proximidade ·
  tempo de casa · não sei)

Auditoria específica: bloquear qualquer texto que peça nome, cargo único, time
pequeno ou data precisa.

## 5. Lentes por perspectiva

Exemplo com o evento **"último incidente relevante"**:

| Perspectiva | O que consegue relatar | Sinal principal |
|---|---|---|
| **Direção executiva** | Como soube, o que perguntou, o que cobrou depois | Reação à má notícia (Westrum); culpa ou aprendizado |
| Gestão | Quem foi chamado, como priorizou as ações | Ações com dono e revisão; capacidade reservada |
| Produto | Impacto no cliente, comunicação | Visibilidade de impacto; mudou a prioridade? |
| Engenharia | Passos da investigação, acessos necessários | Autonomia de investigação, telemetria, reversão |
| **Início de carreira** | O que viu acontecer, a quem perguntou, se conseguiu ajudar | Conhecimento acessível; concentração em uma pessoa |
| Plataforma / SRE | Detecção, escala, contenção | Alerta acionável, toil, heroísmo |
| Qualidade | Por que não foi pego antes | Estratégia de risco e regressão |

**Início de carreira:** não precisa conhecer nomes de práticas. Descreve o que faz
("abro uma branch, espero dois dias pela aprovação"). A falta de visibilidade dele
é **dado sobre o sistema** (transparência, onboarding), nunca nota baixa para ele.

## 6. Texto livre: pipeline de codificação

Evidência recente: em codificação dedutiva com livro de códigos, LLMs de uso
geral chegaram a κ entre 0,37 e 0,75 nos códigos frequentes e ficaram perto de
zero nos códigos raros, com viés de negatividade; fluxos com revisão humana dos
casos incertos e raros melhoraram a confiabilidade. O pipeline respeita isso:

1. **Remoção de PII** antes de qualquer processamento (nomes, times, clientes,
   datas precisas); o texto original não é armazenado depois da codificação.
2. **Livro de códigos** versionado, com definição, exemplos e contraexemplos por
   código.
3. **Codificação assistida**: o modelo propõe código e justificativa.
4. **Revisão humana obrigatória** para confiança baixa, códigos raros (< 5%) e
   uma amostra aleatória de 20%.
5. **Concordância medida** (κ de Cohen entre humano e modelo; entre dois humanos
   na amostra). Código com κ < 0,7 não alimenta o relatório.
6. O código produz **evidência como qualquer opção** (âncora, camada) e passa pelo
   modelo de medição; nunca produz conclusão direta.

## 7. Controles de viés

| Viés | Controle |
|---|---|
| Desejabilidade social | Evento concreto; opções de ritual explícitas; referente do grupo; técnica de lista para temas sensíveis |
| Viés de método comum | Várias perspectivas; telemetria como exame complementar; tipos de item variados |
| Diferença de escala entre perspectivas | Vinhetas de ancoragem (05 §4) |
| *Satisficing* e fadiga | Entrevista curta por amostragem matricial; itens importantes primeiro; sem grades longas |
| Memória e retrospectiva | "O último caso"; janela de 3 meses; fatos antes de interpretação |
| Efeito halo de ferramenta | Ferramenta nunca aparece na pergunta (vigente) |
| Confirmação do autor | Entrevista cognitiva; revisão cega por especialistas (vigente) |
| Ordem das opções | Ordem determinística por participação (vigente) |
| Hierarquia na resposta | Anonimato; perguntas sobre sistema, não sobre chefe |

## 8. Padrões de divergência que o instrumento procura

| Padrão | Exemplo | Leitura (05 §5) |
|---|---|---|
| Otimismo de topo | Direção: "entregamos com agilidade" · engenharia: "15 dias esperando ambiente" | Escala ou visibilidade |
| Cultura declarada × vivida | Gestão: "postmortem sem culpa" · operação: "quem errou apresenta" | Teoria declarada × em uso |
| Adoção declarada × efeito | "Usamos canary/IA/Kanban" · telemetria sem mudança | Ritual (estágio 1) |
| Gargalo deslocado | Engenharia aponta revisão e ambiente · gestão aponta falta de gente | Causa atribuída diferente → solução errada |
| Adoção desigual | Relatos opostos na mesma perspectiva | Prática local |
| Poder × consciência | Todos reconhecem o problema, ninguém pode mudar | Contenção organizacional |

## 9. Âncoras validadas para clima

As perguntas de evento continuam sendo o instrumento principal. No piloto, um
subconjunto curto de itens de escalas validadas verifica se os sinais convergem
(09 §3):

| Construto | Escala de referência |
|---|---|
| Segurança psicológica | Edmondson (1999), 7 itens |
| Cultura de informação | Westrum, 6 itens (DORA) |
| Condições do time | Team Diagnostic Survey (Wageman, Hackman & Lehman, 2005) |
| Burnout e áreas da vida no trabalho | Areas of Worklife Survey (Leiter & Maslach) |
| Organização que aprende | DLOQ (Watkins & Marsick); Garvin, Edmondson & Gino (2008) |
| Justiça | Colquitt (2001) |
| Clareza de papel | Rizzo, House & Lirtzman (1970) |
| Voz | Van Dyne & LePine (1998) |
