# Plano: de framework de maturidade para diagnóstico de engenharia

Status: decisão tomada; ondas 1–4 ainda não estão na base de conhecimento.
A onda 0 (vocabulário e visão) entra junto com este plano. O relatório e o
catálogo continuam os da versão 0.31.0 até as ondas seguintes.

Este plano não compete com
[`decision-report-plan.md`](decision-report-plan.md) nem com
[`instrument-evolution-plan.md`](instrument-evolution-plan.md). Ele muda o
*para quê* do produto. Os outros dois continuam com contratos causais das
folhas restantes, piloto cognitivo e calibração.

## Problema

O motor já diagnostica: hipóteses concorrentes, contradição, prontidão da
solução, experimento, abrangência e triangulação. A pele do produto ainda
ensina maturidade: título, escala 0–4, rótulos Opaco→Adaptativo e radar
como imagem principal. Isso reduz o potencial — o usuário lê nível, não
causa.

## Hipótese de resultado

Quem lê o relatório consegue responder, sem abrir metodologia:

1. que comportamento se repetiu;
2. quais hipóteses de causa ainda competem;
3. o que sustenta, contradiz e falta;
4. o que impede o comportamento desejado;
5. quem contém a restrição;
6. qual é o menor teste reversível e como saber se funcionou.

Uma organização com CI/CD sofisticado e prioridade inexplicável deixa de
parecer “madura com um detalhe”. Passa a ser um diagnóstico de decisão de
produto, com engenharia e operação como efeitos.

## O que esta evolução recusa

- Expandir a árvore ou o tronco para parecer mais “de engenharia”.
- Pontuar prática, framework, ferramenta, cargo ou métrica DORA.
- Transformar a entrevista em inventário técnico (Kubernetes, Helm, Vault).
- Observation identificável (entrevista, pessoa, time no grão).
- Reescrever o runtime em uma cadeia de 16 etapas.
- Renomear o repositório, o pacote npm ou caminhos `/tmp` nesta sequência.
- Recalibrar priors, LLM, novo radar geométrico ou mais perguntas de cobertura.

## Vocabulário

Usar estes termos no produto e na documentação vigente. Não reescrever
histórico (`docs/history`, entradas antigas do changelog) nem identificadores
internos só para trocar a palavra.

| Evitar como produto | Preferir |
|---|---|
| Framework / assessment de maturidade | Diagnóstico de engenharia (sistema sociotécnico de entrega) |
| Avaliar a maturidade da organização | Diagnosticar o sistema de engenharia |
| Nota / nível de maturidade | Estágio do comportamento (leitura auxiliar) |
| Inferência de maturidade | Estimativa de consistência + diagnóstico causal |
| Baixa maturidade | Comportamento frágil, restrição ou evidência insuficiente — nunca os três como se fossem o mesmo |
| Alta maturidade | Comportamento sustentado / convergência positiva |
| Escala de maturidade | Estágio ordinal interno (0–4), secundário ao finding |
| Maduro / imaturo (pilar, time, cargo) | Capacidade sustentada, frágil, bloqueada ou não avaliada |
| Sinal de maturidade | Sinal de capacidade / evidência de comportamento |

Frases pedagógicas do tipo “ferramenta não é maturidade” viram “ferramenta
não é evidência de capacidade” ou “não pontua o diagnóstico”.

Identificadores (`maturidade-nao-resiste-urgencia`, classes CSS
`maturity-level-*`, `maturity-showcase.spec.ts`) só mudam quando o arquivo
já estiver aberto por outro motivo. Não há onda só de rename interno.

## Ondas

```text
0  vocabulário e visão          (docs + README + AGENTS)
1  apresentação do relatório    (o produto passa a parecer diagnóstico)
2  autoria do instrumento       (fato na opção; causa no probe)
3  contrato do finding          (mecanismo, contenção, evidência faltante, impacto)
4  contratos causais restantes  (já em decision-report-plan)
         │
         ▼
    piloto humano               (instrument-evolution-plan + roadmap probabilístico)
```

Não misturar onda 2 com folhas novas. Não começar onda 3 sem a 1: campo
novo sem superfície ensina o usuário a ignorá-lo.

---

### Onda 0 — Vocabulário e decisão

**Público.** Quem lê o repositório, o README e a base de conhecimento.

**Trabalho.**

- Registrar a decisão em `open-decisions.md`.
- Reescrever `product-vision.md` e o princípio em `knowledge-base/README.md`.
- Reescrever o `README.md` como diagnóstico de engenharia. Corrigir a
  taxonomia do README (hoje ainda lista seis eixos; o vigente são oito).
- Ajustar `AGENTS.md` e as regras da base que ainda falam “atribuir
  maturidade”.
- Renomear seções vigentes: “Maturidade por capacidade” → estágio do
  comportamento; “Escala de maturidade” → leitura auxiliar.
- Deixar explícito o que ainda é verdade na 0.31.0: o relatório *ainda*
  abre com classificação ordinal e radar. A decisão é rebaixá-los, não
  fingir que já saíram.

**Não entra.** UI, catálogo, motor, rename de pacote.

**Saída.** Documentação e README descrevem o produto que queremos e o
relatório que ainda existe, sem contradição silenciosa.

---

### Onda 1 — Apresentação: o diagnóstico é o produto

**Público.** Gestão e engenharia que leem o painel.

**Problema.** O cartão de decisão já existe e perde para a classificação
e para o “N de 4” do radar.

**Trabalho, em TDD.**

1. Testes de relatório: o primeiro plano de cada página elegível responde
   o que está acontecendo, o que as entrevistas mostraram, o que testar e
   como saber se funcionou — *antes* de estágio e radar.
2. A classificação Opaco→Adaptativo deixa o cabeçalho e vira detalhe:
   “consistência do comportamento no elo limitante”, não veredito.
3. O radar vira mapa de contraste e cobertura. Rótulos: estágio qualitativo
   e cobertura temática. Tooltip sem “N de 4” no primeiro plano.
4. Pilar 8 na prosa executiva: meta-sistema que explica os outros, não o
   oitavo eixo técnico.
5. Quando não houver finding amarrado, o texto distingue evidência
   insuficiente, contradição e comportamento frágil disperso.

**Não entra.** Nova geometria de radar, nota global, mais eixos.

**Base de conhecimento.** `assessment-model.md` (classificação e radar
secundários), `recommendation-model.md` (contrato executivo).

**Saída.** Uma pessoa que só lê o first screen não consegue citar um
“nível de maturidade” como resultado. Consegue citar um problema e um teste.

---

### Onda 2 — Autoria: fato na opção, causa no probe

**Público.** Quem responde e quem interpreta o catálogo.

**Problema.** Muitas alternativas já nascem como diagnóstico
(`dependencia-operacional-sob-urgencia`, `causa-ferramental-feedback`).
O “chamado para o DBA” vira plataforma cedo demais.

**Regra de autoria (entrar em `question-design.md`).**

- Alternativa de cenário emite fato: quem executa, se há espera, se o
  time opera o caminho, qual consequência.
- Alternativa que nomeia a causa só existe em probe de discriminação.
- Alternativa que nomeia ferramenta ou framework é contexto, sem sinal.
- Depois de sintoma frágil, o ramo oferece 3–4 hipóteses concorrentes
  antes de amarrar folha + intervenção.
- `constraint: 'none'` deixa de ser o default silencioso. Sem
  discriminação, o valor honesto é indeterminado.

**Trabalho.** Não adicionar nós ao tronco. Reescrever opções dos ramos em
que o sintoma ainda cai numa folha só. Prioridade:

1. espera de plataforma / provisão / DBA-equivalente;
2. aprovação e governança;
3. qualidade como fase final.

Copiar o padrão já vigente de integração tardia e incidente.

**Auditoria.** `npm run audit:instrument` ganha checagem: opção de
cenário não pode carregar padrão `causa-*` nem restrição causal única
sem probe seguinte.

**Não entra.** Novas folhas, novos pilares, mais perguntas de cobertura.

**Saída.** Uma resposta isolada não publica causa. O probe seguinte disputa
política, tooling, ownership, segregação legítima, capacidade do outro
time e prioridade.

---

### Onda 3 — Contrato do finding

**Público.** Quem autoriza o experimento.

**Problema.** Abrangência mede quantas unidades sustentam o padrão, não
quem contém a restrição. `ConstraintKind` existe e quase não é preenchido.
Evidência faltante e impacto tipado não são de primeira classe.

**Trabalho, em TDD, sem identificar pessoas.**

1. **Mecanismo** — estender restrição com incentivo/prioridade, dependência
   externa e `undetermined`. Preencher no catálogo tocado pela onda 2.
   Default honesto: indeterminado.
2. **Contenção** distinta de abrangência: local, compartilhada, transversal
   (prevalência) × time, política organizacional, emergência compartilhada,
   fornecedor/regulador, indeterminada (contenção).
3. **Evidência faltante** no finding publicado: o que ainda não sabemos
   (ex.: aprovação pode ser exigência regulatória).
4. **Impacto** qualitativo (segurança, confiabilidade, velocidade,
   qualidade, custo, experiência, previsibilidade) e severidade (baixa,
   moderada, alta, crítica), separados do peso da opção. Sem score único.
5. Hipóteses concorrentes no first screen do detalhe; causa vencedora não
   apaga as demais.

O grão analítico é observação agregada (perspectiva, unidade elegível,
volume). Não é `interview / role / team` por pessoa.

**Base de conhecimento.** `assessment-model.md` (bloqueios e abrangência),
`organizational-model.md` (prevalência ≠ contenção),
`recommendation-model.md` (contrato do finding), `domain-model.md`.

**Saída.** Dois recortes com a mesma nota podem mostrar mecanismos e
contenções diferentes, e o texto diz o que falta para escolher.

---

### Onda 4 — Contratos causais restantes

Trabalho já aberto em `decision-report-plan.md`: padrões fora do tronco
continuam diagnosticáveis e não prescrevem até ter mecanismo, fundamento,
métrica e critério. Esta onda não muda de objetivo — só deixa de tratar
isso como “completar o framework de maturidade”.

Piloto cognitivo dos textos novos permanece no mesmo plano e no
[`instrument-evolution-plan.md`](instrument-evolution-plan.md).

---

## Critério de pronto da evolução

Tudo abaixo, junto:

- README, visão e AGENTS descrevem diagnóstico de engenharia.
- First screen do relatório não vende nível.
- Nenhum cenário novo pontua causa; probes discriminam.
- Finding publica mecanismo, contenção, evidência faltante e impacto sem
  identificar pessoa.
- Árvore de oito pilares inalterada em quantidade; pilar 8 lido como
  meta-sistema.
- Piloto humano (onda 2 do plano do instrumento) ainda é o gate empírico.
  Esta evolução não o substitui e não autoriza recalibrar priors.

## Riscos

- Trocar a palavra e manter o radar como troféu: o usuário continua
  comprando nível. Mitigação: onda 1 antes da 3.
- Reescrever o catálogo inteiro de uma vez. Mitigação: três ramos na onda 2.
- “Direcionar tecnicamente” virar inventário. Mitigação: recusa explícita
  acima; auditoria do instrumento.
- Anonimato no grão de observação. Mitigação: só agregado elegível.

## Menor experimento

Onda 1 num único recorte do showcase (esteira versus coordenação): gestão
e engenharia leem só o first screen e reformulam o problema com as
próprias palavras. Se citarem “nível 2” como resultado, a onda 1 não
fechou.
