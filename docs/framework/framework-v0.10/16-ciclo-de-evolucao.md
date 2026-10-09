# 16 — Ciclo de evolução: fotografia, direção, walkthrough e reavaliação

> Pergunta: o modelo acompanha a evolução da organização por melhoria contínua?
> **Sim, em dois ciclos.** O ciclo da organização (fotografar → direcionar →
> tratar → verificar → reavaliar) e o ciclo do próprio modelo (calibrar, revisar
> premissas, aposentar o que expirou). Os dois precisam girar para que a
> reavaliação seja comparável e continue verdadeira.

## 1. Os dois ciclos

```text
CICLO DA ORGANIZAÇÃO                          CICLO DO MODELO
─────────────────────                         ────────────────
1 Fotografia (avaliação completa)             a Calibração com os dados do ciclo
2 Walkthrough por área                        b Revisão de rubricas, sinais e condutas
3 Direção: próxima fase                       c Aposentadoria do que expirou
4 Condutas (PDSA)                             d Nova versão com itens-âncora comuns
5 Pulsos (4–8 semanas)                              │
6 Reavaliação (6–12 meses) ─────────────────────────┘
7 Revisão de alvo e premissas (circuito duplo) → volta a 2
```

O passo 7 é o **circuito duplo** de Argyris: além de perguntar "melhoramos?", a
organização pergunta "o alvo e as premissas ainda fazem sentido?". É aqui que
entra "o que fazia sentido antes e não faz mais".

## 2. Fotografia

É o laudo e as fichas de 01, com data, versão do instrumento, versão do modelo e
mapa da estrutura organizacional naquele momento. A fotografia é **imutável**:
reavaliações não a sobrescrevem.

## 3. Walkthrough por área

Para cada área (Produto; Engenharia e suas subáreas; Operação; Organização), um
roteiro guiado, lido pela liderança da área com os times:

| # | Seção | Conteúdo |
|---|---|---|
| 1 | **Onde estamos** | Índice e faixa da área; matriz sofisticação × apropriação das práticas principais (12); até 3 achados |
| 2 | **Como chegamos aqui** | O arquétipo sistêmico provável e os eventos que o ilustram (agregados) |
| 3 | **O que já funciona** | Práticas fortes a preservar e seus sinais de regressão |
| 4 | **Próxima fase** | Para cada capacidade priorizada: os comportamentos do **próximo estágio** da rubrica, e a próxima fase de sofisticação quando fizer sentido. "Quando chegarmos lá, veremos…" |
| 5 | **Caminho** | Condutas sequenciadas em 30, 90 e 180 dias, com dono provável e dependências |
| 6 | **Marcos de verificação** | Itens de pulso e indicadores antecedentes, com critério de sucesso |
| 7 | **Riscos de regressão** | O que pode desfazer o avanço (troca de liderança, pressão de prazo, reorganização) |
| 8 | **Premissas a revisar** | Padrões, práticas e metas da área que podem ter expirado (14 §8) |

### 3.1 Regra da próxima fase

```text
próxima fase da capacidade c = min(alvo_c, estágio_atual_c + 1)
```

Um degrau por vez, e só entre os degraus desbloqueados pela **fronteira de aprendizado** (23 §6). Saltos de estágio falham porque o degrau intermediário
constrói a capacidade que o seguinte usa: não há consistência (3) sem prática
repetível (2), nem adaptação (4) sem consistência. Na sofisticação, a mesma regra:
F2 → F3, não F1 → F5.

### 3.2 Exemplo resumido: Operação

```text
ONDE ESTAMOS
  Operação 29% (18–38%)
  Observabilidade: F2 · apropriação 1        → início: mecanismo e uso ainda baixos
  Resposta a incidentes: F1 · apropriação 3  → cultura sem ferramenta: investir no mecanismo
  Achado: investigar depende de 2 pessoas com acesso ao cluster

COMO CHEGAMOS AQUI
  Transferência do fardo: heróis resolvem, a capacidade do time não cresce

O QUE JÁ FUNCIONA
  Revisões de incidente com participação ampla (preservar; regressão: queda de participação)

PRÓXIMA FASE
  Observabilidade 1 → 2: qualquer dev investiga um problema do seu serviço sem acesso privilegiado
  Resposta a incidentes F1 → F2: plantão definido, severidades e runbooks escritos

CAMINHO
  30 dias: telemetria correlacionada num serviço crítico; runbook dos 3 incidentes mais frequentes
  90 dias: acesso de leitura seguro para todos os devs; plantão com rodízio
  180 dias: alertas por sintoma e SLO em 3 serviços

MARCOS
  Pulso: "quem conseguiu investigar o último problema?" (meta: ≥ 4 pessoas diferentes)
  Indicador: tempo até a hipótese de causa nos incidentes

RISCOS DE REGRESSÃO
  Saída de uma das 2 pessoas antes da difusão

PREMISSAS A REVISAR
  "Acesso ao cluster só para SRE" — nasceu de um incidente de 2022; hoje há alternativa segura
```

## 4. Pulsos

- 3 a 6 itens-âncora por capacidade tratada, a cada 4–8 semanas, 5 minutos.
- Mesma unidade, sem exigir as mesmas pessoas (a medida é da unidade).
- Publica mudança só quando `P(melhora) ≥ 0,8` (05 §9); caso contrário,
  "ainda sem mudança detectável".
- Indicadores de telemetria, quando conectados, acompanham entre os pulsos.

## 5. Reavaliação

### 5.1 Relatório de evolução

| Estado do nó | Critério | Leitura |
|---|---|---|
| **Avançou** | `P(S_t2 > S_t1) ≥ 0,8` | Mostrar qual conduta foi aplicada e se o indicador antecedente mudou antes |
| **Regrediu** | `P(S_t2 < S_t1) ≥ 0,8` | Mostrar sinais de regressão e mudanças de contexto |
| **Estável** | `P(|S_t2 − S_t1| < 1) ≥ 0,8` | Preservado ou sem efeito, conforme havia conduta |
| **Incerto** | nenhum dos anteriores | Precisa de mais evidência; não publicar direção |

E ainda:

- **achados encerrados** (o sintoma deixou de aparecer) e **achados novos**;
- **a restrição principal mudou de lugar?** (esperado quando a anterior foi
  tratada; é progresso, 08 §4);
- **o que mudou no contexto** (porte, estrutura, liderança, estratégia).

### 5.2 Atribuição com cautela

Melhorar depois de uma conduta não prova que a conduta causou a melhora. O
relatório diz "melhorou após a conduta X". A afirmação causal ("por causa de")
só aparece com comparação entre unidades tratadas e não tratadas (15, E4).

### 5.3 Estrutura organizacional que mudou

Reorganizações são comuns entre leituras. A reavaliação exige uma **tabela de
correspondência** entre unidades antigas e novas (renomeada, fundida, dividida,
extinta, nova). Sem correspondência, a unidade aparece como nova e não se publica
evolução para ela.

## 6. Revisão de alvo e de premissas (circuito duplo)

Na reavaliação, antes de definir a próxima fase:

1. **O contexto mudou?** (porte, estratégia, regulação, estágio de IA). Se sim, os
   alvos de 02 R14 são revistos.
2. **Alguma premissa expirou?** Padrões sem revisão (S46), práticas marcadas como
   datadas no catálogo, metas que viraram alvo (Goodhart).
3. **O que era diferencial virou commodity?** (Wardley). Aquilo que exigia
   construção interna pode ser comprado; o que era padrão obrigatório pode virar
   opcional.

## 7. Ciclo do modelo

| Etapa | O que acontece | Regra |
|---|---|---|
| Calibração | Dados do ciclo entram no laboratório (15 §6) | Nunca em produção sem revisão (gate) |
| Revisão de conteúdo | Rubricas, sinais, condutas e graus de evidência atualizados pelo que se aprendeu | Com proveniência e versão |
| Aposentadoria | Práticas, sinais e condutas que expiraram saem, como num radar de tecnologia | Registrado no histórico |
| Nova versão | Instrumento novo mantém **itens-âncora comuns** com o anterior | Sem âncoras, não se publica evolução (09 §6) |

## 8. Cadência sugerida

| Evento | Frequência |
|---|---|
| Fotografia completa | Linha de base; depois a cada 6–12 meses |
| Walkthrough por área | Após cada fotografia |
| Pulso | 4–8 semanas, só nas capacidades tratadas |
| Revisão de condutas (PDSA) | No fim de cada experimento |
| Revisão de premissas | Em toda reavaliação |
| Versão do modelo | No máximo 1 por ciclo; nunca durante um piloto (R26) |
