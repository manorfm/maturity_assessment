# 23 — Grafo de habilitação: o que a organização precisa aprender primeiro

> Pergunta: existe uma escala do que a organização precisa aprender primeiro? Há
> práticas que dependem de outras, em que é preciso aprender um comportamento
> para habilitar a próxima fase?
>
> **Sim, e até a v0.8 isso só existia por partes**: a regra "um degrau por vez"
> dentro de cada capacidade (16) e os pré-requisitos das práticas avançadas (22).
> Faltava o **mapa de dependências entre todas as capacidades**. A v0.9 o
> acrescenta: um grafo de habilitação, camadas de fundação, os comportamentos-
> chave que destravam cada passo e o jeito como o motor escolhe o que aprender a
> seguir.

## 1. A ideia central

Uma organização aprende de forma **cumulativa**: um comportamento novo só se
sustenta quando os que ele usa já existem. A literatura mostra isso de vários
ângulos:

| Ideia | Fonte | O que diz |
|---|---|---|
| **Capacidade de absorção** | Cohen & Levinthal (1990) | Uma organização só absorve conhecimento novo se já tem conhecimento relacionado. Não se pula a base |
| **Zona de desenvolvimento proximal** | Vygotsky (1978) | Aprende-se melhor o que está logo além do que já se faz, com apoio. Longe demais, não pega |
| **Capacidades cumulativas** (modelo do cone de areia) | Ferdows & De Meyer (1990) | Na manufatura, capacidades se constroem em camadas (qualidade → confiabilidade → velocidade → custo). No software a ordem não é a mesma, mas o princípio de camadas vale |
| **Hierarquia de confiabilidade** | Google SRE (Dickerson) | Monitoramento → resposta a incidentes → análise pós-incidente → testes e liberação → capacidade → desenvolvimento → produto. Cada nível depende do de baixo |
| **Pipeline de entrega contínua** | Humble & Farley; DORA | Controle de versão → integração contínua → testes automatizados → deploy automatizado → entrega contínua |
| **Segurança psicológica como base** | Google, Projeto Aristóteles | Das cinco dinâmicas de times efetivos, a segurança psicológica **sustenta as outras quatro** (confiabilidade mútua, estrutura e clareza, significado, impacto) |
| **Transferência de treinamento** | Baldwin & Ford (1988) | O que se aprende em curso só vira prática se o ambiente de trabalho apoiar. Treinar sem mudar o ambiente não habilita nada |
| **Restrição** | Goldratt | Entre as coisas desbloqueadas, a primeira a tratar é a que limita o sistema |

## 2. Camadas de fundação

A ordem abaixo é a **tendência geral**, não uma regra rígida (P6). Na prática, as
camadas se sobrepõem; o que importa é não tentar a camada de cima sem a base
mínima da de baixo.

| Camada | Tema | O que a organização aprende | Por que vem antes |
|---|---|---|---|
| **0 — Condições humanas** | Segurança para falar, clareza de prioridade, tempo protegido para melhorar | Dizer má notícia cedo; saber o que é mais importante; ter tempo que não é comido pela urgência | Sem isso, nenhum aprendizado se sustenta: problemas ficam escondidos e melhorias nunca entram |
| **1 — Visibilidade** | Ver o trabalho, ver o sistema, ver o resultado | Quadro que corresponde ao trabalho real; observabilidade básica; indicadores lidos como termômetro | Não dá para melhorar o que não se vê. Todas as camadas seguintes usam essa visão |
| **2 — Mudança segura** | Controle de versão, lotes pequenos, integração contínua, testes automatizados básicos, reversão | Integrar pouco e com frequência; saber rápido se algo quebrou; voltar atrás sem drama | Torna o erro barato. Sem isso, autonomia e experimentação são perigosas |
| **3 — Responsabilidade com autonomia** | Dono ponta a ponta, direitos de decisão, plataforma de autosserviço, controle por risco | Decidir no time o que é do time; assumir o resultado em produção | Autonomia sem visibilidade e sem mudança segura vira risco; com elas, vira velocidade |
| **4 — Aprendizado sistemático** | SLO e error budget, revisão de incidente com efeito, experimentação de produto, previsão por fluxo | Transformar evento em mudança do sistema; decidir por hipótese e dado | Exige as três camadas anteriores funcionando juntas |
| **5 — Práticas avançadas** | Entrega contínua, chaos engineering, AI-DLC, data mesh, remediação automática (22) | Usar a própria fragilidade e a automação como alavanca | São composições das camadas 1–4 |

```text
5  Práticas avançadas         CD · chaos · AI-DLC · data mesh · AIOps
4  Aprendizado sistemático     SLO · incidente com efeito · experimento · previsão
3  Responsabilidade+autonomia  ownership · decisão local · plataforma · controle por risco
2  Mudança segura              versão · lote pequeno · CI · testes · reversão
1  Visibilidade                fluxo visível · observabilidade básica · indicador-termômetro
0  Condições humanas           segurança para falar · clareza de prioridade · tempo para melhorar
```

**A camada 0 é a mais esquecida e a mais importante.** Muitas transformações
começam pela camada 2 ou 5 (comprar ferramenta de CI, adotar IA) e falham porque
as pessoas não podem dizer que algo não está funcionando, não sabem o que é
prioridade e não têm tempo para aprender.

## 3. O grafo de habilitação

As camadas são uma visão resumida. O motor usa um **grafo** entre pares
(capacidade, estágio), mais fino que as camadas.

### 3.1 Aresta `habilita`

```text
(capacidade A, estágio a)  ──habilita──►  (capacidade B, passar de b para b+1)
tipo: técnico | cognitivo | social | estrutural | governança
força: essencial | conforto
comportamento-chave: o que precisa ter sido aprendido
origem: literatura (A/B) | especialistas (C) | hipótese (D)
```

### 3.2 Tipos de dependência

| Tipo | Exemplo |
|---|---|
| **Técnico** | Integração contínua ≥ 3 habilita entrega contínua (release) de 2 para 3 |
| **Cognitivo** | Letramento em indicadores ≥ 2 habilita "indicador como termômetro" de 1 para 2 (não se lê termômetro sem saber ler variação) |
| **Social** | Voz e segurança ≥ 2 habilita aprendizado com incidentes de 2 para 3 (ninguém conta o erro que vai ser punido) |
| **Estrutural** | Ownership ponta a ponta ≥ 2 habilita observabilidade de 2 para 3 (quem não opera não instrumenta) |
| **Governança** | Direitos de decisão ≥ 2 habilita autonomia de plataforma de 1 para 2 (autosserviço exige alguém que autorize o guardrail, não cada uso) |

### 3.3 Arestas iniciais (amostra)

| De (mínimo) | Habilita | Tipo | Força | Comportamento-chave | Origem |
|---|---|---|---|---|---|
| Voz e segurança ≥ 2 | Aprendizado com incidentes 2→3 | Social | Essencial | Contar o próprio erro sem medo | B (Edmondson; Aristóteles) |
| Clareza de prioridade (desdobramento) ≥ 2 | Fluxo (WIP) 1→2 | Governança | Essencial | Dizer "isto não agora" | C |
| Tempo protegido para melhoria (P, Anexo A) ≥ 2 | Qualquer capacidade 2→3 | Estrutural | Conforto | Reservar capacidade que a urgência não consome | B (Repenning & Sterman) |
| Fluxo visível ≥ 2 | Métricas de fluxo e previsão 1→2 | Técnico | Essencial | Manter o quadro igual ao trabalho real | B (Anderson; Vacanti) |
| Observabilidade ≥ 2 | Resposta a incidentes 2→3 | Técnico | Essencial | Investigar pelos dados, não por suposição | B (hierarquia SRE) |
| Resposta a incidentes ≥ 2 | Aprendizado com incidentes 1→2 | Técnico | Essencial | Registrar o que aconteceu | B (hierarquia SRE) |
| Controle de versão e lote pequeno ≥ 2 | Integração contínua 2→3 | Técnico | Essencial | Integrar diariamente | A (DORA; Humble & Farley) |
| Testabilidade ≥ 2 | Estratégia de qualidade 1→2 | Técnico | Essencial | Escrever código que dá para testar | A–B |
| Integração contínua ≥ 3 e testes F3 | Release 2→3 (entrega contínua) | Técnico | Essencial | Confiar no pipeline | A (DORA) |
| Ownership ponta a ponta ≥ 2 | Observabilidade 2→3 | Estrutural | Essencial | Operar o que construiu | B (Vogels; SRE) |
| Observabilidade ≥ 3 | Confiabilidade (SLO) 2→3 | Técnico | Essencial | Medir o que o usuário sente | B (SRE) |
| Letramento ≥ 2 | Indicador como termômetro 1→2 | Cognitivo | Essencial | Distinguir variação comum de especial | B (Wheeler; Deming) |
| Direitos de decisão ≥ 2 | Governança habilitadora 1→2 | Governança | Essencial | Decidir por risco, não por hierarquia | B (*Accelerate*) |
| Refinamento com critérios ≥ 3 | Engenharia com IA F3→F4 (AI-DLC) | Cognitivo | Essencial | Definir o "o quê" e o critério de pronto | C (AI-DLC) |
| Descoberta ≥ 2 | Direção de produto 2→3 | Cognitivo | Essencial | Escrever a hipótese antes de construir | B (Cagan; Torres) |
| Desenho do time ≥ 2 | Colaboração 2→3 | Estrutural | Conforto | Times estáveis com fronteira clara | B (Hackman) |

As arestas de §3.3 são o ponto de partida. A biblioteca completa é elicitada com
especialistas (SHELF, 05 §8.6) e validada com dados longitudinais (§6).

## 4. Comportamentos-chave que destravam

Alguns comportamentos destravam muitos outros. Na literatura popular são
chamados de "hábitos-chave". No produto, são os nós do grafo com mais arestas de
saída; priorizá-los tem efeito em cascata.

| Comportamento-chave | Camada | O que destrava |
|---|---|---|
| Dizer má notícia cedo e ser ouvido | 0 | Aprendizado com incidentes, previsão honesta, revisão de estratégia, voz |
| Dizer "isto não agora" (priorizar de verdade) | 0 | Limite de WIP, tempo para melhoria, foco, fluxo |
| Manter o quadro igual ao trabalho real | 1 | Métricas de fluxo, previsão, visibilidade de gargalo |
| Olhar o efeito depois de cada mudança | 1 | Canary com análise, SLO, experimentação, confiança no deploy |
| Integrar pouco e com frequência | 2 | CI, trunk-based, revisão rápida, entrega contínua, AI-DLC |
| Saber se quebrou em minutos | 2 | Refatoração, mudança segura, autonomia, IA com verificação |
| Operar o que construiu | 3 | Observabilidade, qualidade, confiabilidade, ownership |
| Escrever a hipótese antes de agir | 4 | Experimentação de produto, chaos engineering, revisão de estratégia, AI-DLC |
| Transformar incidente em mudança do sistema | 4 | Confiabilidade, arquitetura, plataforma, prevenção |

## 5. Como a organização aprende um comportamento novo

Saber a ordem não basta: é preciso escolher **como** aprender. A pesquisa sobre
transferência de treinamento mostra que o ambiente decide se o aprendizado vira
prática (Baldwin & Ford, 1988).

| Modalidade | Quando serve | Transferência para o trabalho | Exemplo |
|---|---|---|---|
| Curso ou treinamento isolado | Conhecimento novo, camada Conhecimento | **Baixa** sem mudança no ambiente | Curso de SLO |
| Prática guiada no trabalho real (coaching, time de habilitação) | Comportamento novo em contexto | Alta | Time de plataforma ajuda um time a criar o primeiro SLO |
| Imersão (*dojo*) | Várias práticas juntas, time inteiro | Alta, com custo alto | Time passa 6 semanas trabalhando no próprio backlog com coaches |
| Trabalho em par ou em grupo | Difundir habilidade existente | Alta | Investigação em par de um incidente real |
| Kata (rotina diária curta) | Hábito de melhoria contínua | Alta, se sustentado | Toyota Kata: condição-alvo, obstáculo, experimento, aprendizado |
| Comunidade de prática | Manter e evoluir entre times | Média | Guilda de observabilidade |
| Rodízio de pessoas | Espalhar contexto | Média | Rodízio no plantão |

Toda conduta (08 §6.1) passa a declarar sua **modalidade de aprendizado**. Uma
conduta que só prevê treinamento, sem mudar o ambiente, recebe um aviso de baixa
transferência.

## 6. Como o motor usa o grafo

### 6.1 Fronteira de aprendizado

Para cada capacidade `B` e o próximo degrau `b→b+1`:

```text
P(desbloqueado) = Π_{arestas essenciais A→B} P(S_A ≥ mínimo)
fronteira       = degraus com P(desbloqueado) ≥ 0,6
bloqueados      = degraus com P(desbloqueado) < 0,25  → mostra "bloqueado por A"
perto           = entre 0,25 e 0,6                     → mostra o que falta
```

A **fronteira** é a zona de desenvolvimento proximal da organização: o que ela
consegue aprender agora. O motor:

1. escolhe a **próxima fase** do walkthrough (16 §3.1) **dentro da fronteira**;
2. entre os itens da fronteira, prioriza pela restrição principal (08 §4) e
   pelos comportamentos-chave (§4);
3. mostra os degraus bloqueados com o que falta, para que ninguém tente a camada
   de cima sem base.

É a generalização da prontidão de 22: práticas avançadas são só os nós do topo.

### 6.2 Exemplo

```text
Organização: fluxo visível 1, voz 1, observabilidade 2, CI 3, ownership 1

Desejo da direção: "entrega contínua e AI-DLC"
  Release 2→3        desbloqueado? CI ≥3 sim · testes F3 não      → P = 0,30 (perto)
  AI-DLC F3→F4       refinamento ≥3 não · testes F3 não           → bloqueado

Fronteira de aprendizado agora:
  Voz 1→2            (camada 0; destrava aprendizado, previsão, estratégia)
  Fluxo visível 1→2  (camada 1; destrava métricas e previsão)
  Ownership 1→2      (camada 3; destrava observabilidade 2→3)
  Testes F2→F3       (camada 2; destrava release e AI-DLC)

Próxima fase sugerida: Voz 1→2 e Testes F2→F3
  (comportamentos-chave com mais arestas de saída, dentro da fronteira)
```

### 6.3 Detecção de salto

Quando a organização pratica algo acima da fronteira (estágio ou fase de `B`
acima do que as arestas essenciais permitem), o motor publica um achado de
**salto de camada**: generalização da adoção prematura de 22. A conduta é
consolidar a base antes de avançar mais.

## 7. Validação do grafo

As arestas começam como hipóteses de especialistas e literatura. Com dados
longitudinais (15, E1):

- **Análise de transição latente:** as organizações realmente passam por B só
  depois de A? Arestas frequentemente violadas são revisadas ou rebaixadas para
  "conforto".
- **Contraexemplos são dados:** uma organização que chegou a B sem A mostra outro
  caminho possível (P6). O grafo pode ter caminhos alternativos (A **ou** A').
- Cada aresta mostra sua origem (A–D) na ficha do nó, como as condutas.

## 8. O framework já está robusto?

A resposta de 17 continua válida: **a arquitetura está sólida e cobre agora o
"o quê", o "por quê", o "em que ordem" e o "como aprender"; o produto ainda não
está validado.** Esta versão fechou uma lacuna conceitual real (a ordem de
aprendizado). O que falta para robustez não é mais escopo: é construir, reescrever
o banco de perguntas, rodar a simulação E0 e pilotar (21 §6).
