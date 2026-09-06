# Plano: diagnóstico em várias áreas, no formato de consultoria

Status: ondas 0–4 incorporadas (0.88.0). O catálogo, o grafo `v20`, o
relatório multiárea e a massa sintética de baixa prática estão
vigentes. O piloto humano e a calibração continuam nos planos já donos
disso.

Este plano não substitui
[`specialist-diagnostic-platform-plan.md`](specialist-diagnostic-platform-plan.md)
(direção completa),
[`event-centered-diagnostic-plan.md`](event-centered-diagnostic-plan.md)
(entrevista por evento) nem
[`comparative-diagnostic-plan.md`](comparative-diagnostic-plan.md)
(rubrica de alta performance). Ele fecha o gap que o showcase
demonstrou: o motor escolhe um limitador da família espera/ownership e
recusa diagnosticar o restante.

## Problema

Um consultor entra, pergunta o cotidiano em várias lentes e sai com
fragilidades de processo, política, prática, ferramenta, clima e
liderança — e com o que fazer em cada área. O produto atual, com 18
entrevistas sintéticas, publica um cartão e variações do mesmo
mecanismo. Folhas técnicas pedem outra rodada. Contradição vira
inconclusivo. Cerimônia nominal (Scrum, post-mortem, daily) não é
discriminada do efeito no dia a dia.

Quem lê o relatório de baixa prática não vê falta de caminho de
artefato, IAM, war room, medo, retro sem dono ou duas frentes pagas
para o mesmo trabalho. Vê espera na esteira.

## Hipótese de resultado

A partir da anamnese — eventos recentes, várias perspectivas, sem
apontar pessoa — o relatório consegue responder:

1. o que se repetiu no trabalho;
2. quais famílias de capacidade faltam ou são desiguais (esteira,
   artefato, imagem, IAM, aprendizado, ownership);
3. quais áreas isso atravessa e qual ação cabe em cada uma;
4. o que o clima, o incentivo e a liderança fazem com o erro e com o
   risco — no local, sem nome;
5. se cerimônias (ágil, post-mortem, retro) produzem solução no
   cotidiano ou só existem;
6. qual é a primeira decisão e o que ela não apaga.

Isso é o formato da primeira semana do consultor, não o laudo de seis
semanas. Alfa honesto. Calibração e entrevistas reais continuam
depois.

## Invariantes

- Anonimato, participação única, limiar e impossibilidade de o gestor
  ver resposta individual permanecem. O relatório constata o **local**
  (unidade, recorte, sistema), nunca a pessoa.
- Clima, incentivo e liderança são maturidade do **sistema**. Prazo,
  heroísmo, culpa, silêncio e war room são efeitos observáveis, não
  rótulos de um gerente.
- Ferramenta, framework, cargo e cerimônia não pontuam. Ter
  post-mortem, Scrum ou repositório não é evidência. Quem participa,
  o que acontece no próximo evento equivalente e se a ação fecha
  efeito — isso é evidência.
- Família de capacidade ≠ marca. Precisa existir caminho governado e
  identificável para a versão; não se escolhe JFrog vs Nexus, GitHub
  vs GitLab, AWS vs Azure.
- Ausência do comportamento esperado da família, no evento, é falta de
  prática ou de capacidade compartilhada — não “folha não avaliada”
  quando o evento ocorreu.
- Relatos opostos no mesmo local são adoção desigual (gestão,
  comunicação, desconhecimento ou ignorar). Hipóteses competem com
  suporte. Inconclusivo só quando o grafo ou a amostra não
  atravessaram o evento.
- Um fato pode reforçar hipóteses em várias áreas. Cada área recebe
  indicação própria: mesma hipótese, contenções diferentes.
- Criar time de plataforma ou desfazer sustentação só com mecanismo
  demonstrado (fila recorrente, handoff sem autoridade, responsabilidade
  que morre no aceite). Antipadrão: plataforma que opera a mesma fila;
  “somos modernos, logo não tem N2”.
- Sem LLM. Grafo declarativo, Bayes especialista, portfólio por
  contrato. Clique e aceitação não treinam o modelo.
- Referências (SRE, blameless, Team Topologies, Accelerate,
  Well-Architected, práticas documentadas de Netflix, Google,
  Microsoft, AWS) confrontam **comportamento**, não produto.

## O que maturidade inclui neste plano

Além de fluxo, arquitetura e operação:

| Dimensão | O que se observa no cotidiano | O que o relatório não faz |
|---|---|---|
| Clima do ambiente | Se erro e risco podem ser ditos; se a reunião “tranquila” omite o que importa; se war room é o único momento em que a liderança vê o sistema | Nomear quem cala ou quem pune |
| Incentivos | O que é reconhecido: apagar o incêndio, cumprir a data, ou evitar o incêndio; se o post-mortem vira avaliação de desempenho | Nota de pessoa ou cargo |
| Liderança | Se a restrição sobe para quem pode removê-la; se sob pressão o caminho seguro some; se a análise para na etapa “onde escapou” | “Gerente de baixa performance” |
| Cerimônia com efeito | Daily, retro, review, post-mortem: quem está, o que se decide, se a ação tem dono e se o próximo evento equivalente mudou | “Têm Scrum” / “têm post-mortem” |
| Família técnica | Origem da versão, artefato, imagem, esteira, identidade vs autorização no recurso, rollback | AWS vs Azure, Ansible vs Actions como nota |

Blameless para a diretoria é **decisão de política**: parar de autorizar
caça ao culpado, meta que pune relato e celebração só do herói. Não é
workshop nem poster. O antipadrão já descrito no catálogo permanece:
declarar a conversa blameless e continuar procurando quem errou.

## Cerimônia e post-mortem (como ágil)

Perguntar se existe o rito não entra. O evento recente reconstrói:

```text
gatilho (falha, retro, fim de ciclo)
  -> quem estava e quem podia decidir
  -> o que foi dito e o que não podia ser dito
  -> se saiu uma mudança no sistema (caminho, política, fronteira)
  -> se essa mudança tinha dono, capacidade e revisão de efeito
  -> o que aconteceu no próximo evento equivalente
```

Aprendeu = o sistema mudou e o efeito foi revisto. Não aprendeu =
lista, culpa, controle local, ou a pressão seguinte comeu a análise.
Quem participa importa como fato de autoridade e de clima (só
operação; sem produto; sem quem autoriza a restrição), não como lista
de nomes.

O mesmo contrato vale para daily, retro e review: sem o SM a daily
para, retro sem dono das ações, review só o PM, sprint sem objetivo,
“pronto” = chegou em homologação. Isso abre frentes de gestão,
entrega e CD — não um eixo “Agile”.

## Três motores (sem IA generativa)

| Motor | Papel neste plano | Algoritmo vigente a estender |
|---|---|---|
| Perguntas | Evento → fato → ramo que **reforça** hipótese já aberta (entrega amarra inception; priorização amarra gestão tática vs organizacional) | Grafo `v20` + ranking com bônus de reforço |
| Diagnóstico | Uma hipótese, várias áreas; ausência e desigualdade publicáveis; crença relativa provisória | Bayes em log-espaço; hoje colapsa em um limitador e empata na contradição |
| Intervenção | Uma ação por contenção; diretoria ≠ engenharia; operating model quando o mecanismo for desenho | `transformation-portfolio-v1` + `audience-report-v1`; hoje uma ação ou “investigar” |

O planejador continua nas cinco fases. Criar ou desfazer área é fase
de operating model, não card de esteira.

## Sequência

```text
0   contrato na base (família, ausência, desigualdade, reforço, clima)
1   catálogo e texto dos packs
2   grafo que afunila e reforça
3   relatório geral + profundo + briefing de política
4   massa sintética que prove o ciclo
    → só então piloto humano e calibração (planos já donos disso)
```

Ondas 0–2 mudam comportamento e exigem red → green → blue numa versão
nova do grafo. Não alterar `evidence-anamnesis-pilot-v19` depois que
a coleta humana dessa versão tiver começado.

### Onda 0 — Contrato

Status: **vigente na base** (0.84.0). O runtime ainda não materializa
publicação nem arestas `reinforces`.

**Trabalho.** Promover à base, antes do código:

- família de capacidade vs marca;
- ausência no evento = falta de prática; contradição = adoção desigual;
- `reinforces` / `amplifies` entre ramos;
- finding com efeitos por sistema e ação por contenção;
- clima, incentivo e liderança como sistema local, sem pessoa;
- cerimônia e post-mortem pelo efeito no próximo evento;
- inconclusivo = amostra ou grafo insuficiente, não finding “repetível
  sem causa”;
- desperdício quando duas frentes fazem o mesmo trabalho (funding).

**Documentos.** `recommendation-model.md`, `question-design.md`,
`assessment-model.md`, `adaptive-assessment-graph.md`, índice da base.

**Não entra.** Eixo novo no radar (IAM, FinOps, Agile, Cultura).
Pergunta “vocês têm post-mortem / ECR / Vault?”.

### Onda 1 — Catálogo e texto

Status: **vigente** (0.85.0). Cinco packs em `capability-family.ts`;
hipóteses com contrato explícito; arestas `reinforces` em
`causal-catalog-v10`. Sinais publicados em nós já existentes do `v19`.

Cinco packs, cada um com fatos do cotidiano, hipóteses, `reinforces`,
prática-alvo, família de ferramenta opcional e fundamento:

1. Origem e promoção da versão (repo, artefato, imagem, esteira).
2. Acesso e mudança em nuvem (identidade ≠ autorização no recurso;
   blast radius; zero trust como comportamento).
3. Incidente e reversão (quem vê, quem age, rollback).
4. Cerimônia com efeito (daily, retro, review, **post-mortem**:
   participação, método, solução que fecha).
5. Reação a erro, clima e liderança (silêncio, culpa, war room,
   restrição que não sobe; briefing de política para diretoria).

TDD: duas respostas em ramos distintos aumentam a mesma hipótese;
post-mortem nominal sem mudança no próximo incidente **não** pontua
aprendizado; ausência de caminho de artefato no evento de promoção
publica falta da família, sem nome de produto.

### Onda 2 — Grafo

Status: **vigente** (0.86.0). Grafo `evidence-anamnesis-pilot-v20`.

O próximo nó prefere o probe que confirma ou mata hipótese já
reforçada. Entrega depois de inception amarra lote/fronteira, não
abre um eixo solto. Priorização discrimina gestão tática (o time não
para de iniciar) de organizacional (quem autoriza o ciclo). War room
abre o pack 5 **e** o lado técnico (lote, reversão, permissão no
recurso) no mesmo fio.

Texto: cotidiano, um fato por alternativa, sem jargão na boca de quem
responde. Auditoria vigente permanece (`deploy`, `rollback` etc. não
aparecem na pergunta).

### Onda 3 — Relatório

Status: **vigente** (0.87.0). Projetor `front-inventory-v1`.

First screen: problema cotidiano, hipótese, primeira decisão. Abaixo:
inventário por frente (Produto, Engenharia, Operação, Gestão),
mecanismo, crença relativa provisória, ação daquela contenção. Folha
de impacto lista causas possíveis com suporte cruzado; não diz “a
contradição impede escolher”.

Briefing de diretoria no recorte de medo: o que esconder/war room
produz; o que parar de autorizar; menor teste de um incidente sem
nome; como saber (relato mais cedo, condição antes omitida, ação
sistêmica, war room menos frequente). Engenharia recebe o caminho
técnico do mesmo evento; não “adote blameless”.

Quando o mecanismo for desenho: opção explícita de instituir
capacidade compartilhada **ou** desfazer fronteira (sustentação), com
antipadrão ao lado.

### Onda 4 — Massa sintética

Status: **vigente** (0.88.0). Caso `engineering-practice`.

Um caso “baixa prática de engenharia” que não seja só espera:
promoção manual, sem caminho de artefato/imagem, token sem autorização
no recurso, retro/post-mortem sem dono nem efeito, sustentação à
parte, negócio fechando desenho, war room como modo de gestão, duas
frentes no mesmo trabalho.

`lookFor` executivo exige famílias distintas no panorama e um card de
política para diretoria. Sem isso o showcase continua mentindo que 18
entrevistas no roteiro atual bastam.

## Fora de escopo

- identificar ou ranquear gestores, times ou pessoas;
- pontuar presença de cloud, GitHub Actions, Ansible, JFrog, Scrum ou
  post-mortem;
- fabricar DORA ou impacto financeiro sem evidência;
- eixo “cultura” ou “IAM” no radar;
- LLM recomendador;
- declarar o instrumento calibrado com sintéticos.

## Riscos

- Inferir “liderança imatura” a partir de uma perspectiva só: exige
  triangulação (quem sofre a pressão e quem autoriza).
- Transformar silêncio em prova de toxicidade: “não observo” continua
  visibilidade, não culpa.
- Recomendar desfazer sustentação onde a regulação exige
  segregação: o contrato tem de preservar controle proporcional.

## Menor experimento

Um evento “última vez que uma mudança foi para produção **ou** que um
incidente virou war room” no caso opaco publica, no mesmo relatório:

1. falta de caminho de artefato/imagem;
2. esteira dependente de pessoa;
3. ownership que morre no aceite;
4. post-mortem ou análise que não fecha solução;
5. decisão de política (parar de gerir por culpa/war room).

Cinco frentes, um limitador em cima, nenhuma pessoa nomeada. Se o
showcase ainda colapsar em espera, o bug é o motor, não o texto.

## Aceite desta sequência

Quem abre o relatório, sem facilitador, aponta os problemas do local
e o que cada área precisa fazer. Diretoria vê clima e incentivo como
decisão. Engenharia vê família de capacidade, não marca. Ninguém
consegue usar o relatório para avaliar um indivíduo. Ter o rito e
aprender no dia a dia são leituras distintas.
