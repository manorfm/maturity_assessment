# Plano: cartão executivo que fecha decisão e valor

A onda B já está vigente. Este arquivo guarda a evidência que justificou
o cartão e as perguntas por audiência. A especificação passou para
`recommendation-model.md`. A first screen compacta já está vigente; a
massa sintética de validação continua na onda D de
[`report-presentation-plan.md`](report-presentation-plan.md).

## Problema e público

Diretoria, gerência e CTO leem o first screen e não conseguem reformular
o problema, o valor em risco nem a decisão pedida. O caso sintético
“prática repetível” expôs o defeito: o motor publicou seis padrões, o
cartão fecha um, e esse um ainda é ilegível.

Público afetado: quem decide autorização de capacidade, prioridade e
investimento. Especialistas continuam com o detalhe causal.

## Evidência de que o problema existe

No relatório ao vivo de `POC — prática repetível`, o finding
`causa-capacidade-tomada-pela-proxima-iniciativa` mostra:

- título metafórico (“capacidade de aprender”) que um diretor lê como
  treinamento ou retrospectiva;
- observação que localiza o problema no time (“a equipe já recebeu
  trabalho novo”) embora a autoridade seja `portfolio-leadership`;
- “Por que importa” gerado por `impactsByCapability['portfolio-management']`
  (`custo`, `velocidade de entrega`, `previsibilidade`) enquanto
  `severity` permanece `undetermined` — valor fabricado, sem evento;
- “Capacidade principal: Gestão de portfólio” sem dizer por que a
  decisão não é do time;
- solução e fundamento (`solutionClass`, `whyItWorks`, `foundation`)
  só sob “Detalhes metodológicos”.

A base vigente já proíbe isso: severidade não deriva do peso da
alternativa; o cartão deve traduzir situação, teste e limite; título,
mecanismo e ação são campos distintos.

## O que um diretor, gerente e CTO deveriam entender

Para este padrão, a leitura correta não é “o time não aprende”. É:

> A próxima aposta já comeu as pessoas. Revisar se a anterior valeu a
> pena exigiria atrasar algo prometido. Quem autoriza o próximo ciclo
> decide isso, não o time lotado.

- **Diretor / CPO / CFO:** parar de autorizar o ciclo seguinte sem
  capacidade reservada para manter, cortar ou redirecionar o anterior.
- **Gerente local:** o time não “falhou em aprender”; a fila de
  compromisso chegou cheia. A ação local é recusar iniciar o próximo
  item sem a revisão, ou escalar a restrição.
- **CTO:** não é ferramenta, cerimônia nem treinamento. É restrição de
  autorização de capacidade. WIP e ocupação são o efeito no fluxo.

## Solução prática e fundamento (já no catálogo, mal projetados)

O contrato vigente deste padrão já é suficiente se subir ao primeiro
plano:

- **Decisão:** não autorizar todo o próximo ciclo sem reservar pessoas
  para revisar um resultado anterior e agir sobre a evidência.
- **Classe:** capacidade condicionada à revisão de resultado (política).
- **Fundamento:** capacidade protegida para fechar o ciclo de resultado
  (Lean portfolio / Accelerate). Medir sem reservar capacidade para
  decidir não muda o investimento.
- **Antipadrão:** reunião de métricas sem liberar capacidade.
- **Limite:** não ajuda se a evidência de resultado não existe ou não é
  confiável.

O que falta é a prosa que liga evento → valor → quem decide → teste.

## Hipótese de resultado

Uma pessoa de diretoria que só lê o first screen reformula, com as
próprias palavras: o problema, o valor em risco (sem inventar DORA),
quem autoriza a mudança e o menor teste. Os demais padrões publicados
aparecem como decisões ou investigações, sem sumir no corte de quatro.

## Riscos

- Reescrever só o título e manter impacto fabricado.
- Transformar o cartão em playbook de Lean/OKR.
- Promover finding investigativo a decisão executiva.
- Usar sintético como calibração de linguagem.

## Menor experimento

Reescrever o projetor do cartão e o contrato de impacto para este
padrão e os outros cinco do caso médio. Aceite: um leitor reescreve a
decisão sem citar “aprender”, “Gestão de portfólio” ou “custo,
velocidade e previsibilidade” como se fossem fato observado.

## Mudanças necessárias na base

`recommendation-model.md` (prosa executiva e impacto só com evidência),
`finding-narrative-v1` (seções e ordem), `diagnostic-contract.ts`
(impacto deixa de nascer da folha). O grafo e o padrão causal não
mudam de mecanismo.

## Ondas

### Onda 1 — Impacto deixa de ser rótulo da folha

`buildDiagnosticContext` não preenche `impacts` a partir de
`impactsByCapability`. Enquanto `severity` for indeterminada, o cartão
não lista custo, velocidade ou previsibilidade. “Por que importa” usa
só o evento e a autoridade: o que deixa de ser decidido se o padrão
continuar.

### Onda 2 — Cartão como decisão, não como padrão

`finding-narrative-v1` passa a projetar, no primeiro plano:

1. decisão pedida (verbo + quem autoriza);
2. situação observada em linguagem cotidiana (`plainExplanation`
   reescrita para não culpar o time quando a contenção é política);
3. valor em risco ligado ao evento, ou declaração honesta de que o
   impacto ainda não foi medido;
4. por que a capacidade principal é essa (autoridade, não jargão);
5. teste, critério, o que não resolve e antipadrão.

Título, fundamento e classe de solução deixam “Detalhes metodológicos”.
Título descreve o efeito sem metáfora de aprendizado.

### Onda 3 — Portfólio visível e nome honesto do recorte

Os seis padrões do caso médio entram no panorama sem corte que esconda
aprendizado. Investigar continua distinto de decidir. O nome do
sintético deixa de dizer “prática repetível” quando a classificação é
Reativo. Pilares com finding e sem duas folhas cobertas não somem do
mapa: aparecem como folha publicada, não como pilar avaliado.

### Onda 4 — Audiências com a mesma decisão

Diretoria, gerência e tecnologia recebem a mesma restrição com a
pergunta de cada um (autorizar, recusar/escalar, não comprar
ferramenta). Sem segundo motor.

### Fora de escopo

LLM, novo radar, mais perguntas no tronco, calibração por sintético,
playbook de SAFe/Lean portfolio como estágio.
