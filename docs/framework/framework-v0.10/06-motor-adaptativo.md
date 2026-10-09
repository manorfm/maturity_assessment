# 06 — Motor adaptativo

> Pergunta que o motor responde a cada passo: **qual é a próxima pergunta que mais
> reduz a incerteza sobre a unidade, por minuto do respondente, respeitando
> cobertura, anonimato e o limite de tempo?**

## 1. Situação atual

- Trilhas declarativas por contexto de trabalho (8 trilhas), tronco comum e
  variantes por perspectiva: **manter**.
- Até 5 probes extras escolhidos por um escore linear: 0,4·ganho de informação +
  0,2·cobertura + 0,15·validação + 0,1·valor causal + 0,1·equilíbrio de
  perspectiva + 0,05·(1 − custo) − 0,1·repetição + 0,2 se reforça hipótese:
  **substituir**.
- O ganho de informação é calculado sobre as causas de uma família, para aquele
  respondente: **ampliar** para a unidade e para a capacidade.

**Problema do escore linear:** soma grandezas de naturezas diferentes (bits,
proporções, custos) com pesos arbitrários. Na literatura de testes adaptativos, o
padrão é **maximizar informação sujeito a restrições** (van der Linden, 2005): o
que é obrigatório vira restrição, não peso.

## 2. Objetivo

Diferença central para testes educacionais: o alvo da medição é **a unidade**, não
a pessoa. Então a informação de uma resposta é avaliada pelo quanto ela reduz a
incerteza **da posterior da unidade**, dado o que os outros respondentes já
disseram.

```text
U(i | j, u) = [ Σ_c w_c · ΔH(S_{u,c} | resposta de j a i)  +  β · ΔH(C_família | resposta) ] / t_i
```

- `ΔH`: redução esperada de entropia (bits), calculada com a posterior atual da
  unidade e o modelo de observação da perspectiva de `j` (05 §3–4);
- `w_c`: peso da capacidade no contexto (alvo);
- `β`: peso relativo do diagnóstico causal (inicial 1,0);
- `t_i`: tempo estimado do item em minutos. A unidade da utilidade é **bits por
  minuto**, o que torna custo e informação comparáveis sem pesos arbitrários.

## 3. Restrições (em vez de pesos)

Um item só é candidato se satisfaz todas:

| Restrição | Regra |
|---|---|
| Elegibilidade | Perspectiva e contexto do respondente podem observar o evento (vigente) |
| Aplicabilidade | O evento existe na unidade (nós de contexto; vigente) |
| Tronco mínimo | Cada respondente passa pelo tronco comum da trilha (vigente) |
| Cobertura da unidade | Folhas com < 2 testlets na unidade têm prioridade de restrição sobre as demais |
| Repetição | Não repetir o mesmo testlet; no máximo 2 itens seguidos da mesma folha |
| Vinheta | 1–2 vinhetas de ancoragem por respondente, em rodízio |
| Tempo | Orçamento do respondente (§5) |
| Anonimato | A sequência não pode depender de atributos que identifiquem a pessoa (só perspectiva, contexto em faixas e estado da unidade) |

É uma versão simplificada do método de **testes-sombra** (*shadow tests*): a cada
passo, escolhe-se o melhor item entre os que ainda permitem completar uma
entrevista válida.

## 4. Amostragem matricial dentro da unidade

Como a unidade é o alvo, **nem todo mundo precisa responder a tudo**. Com a
utilidade da §2 calculada sobre a posterior da unidade, o motor passa a preferir,
naturalmente, as folhas que ainda estão pouco cobertas **naquela unidade**.
Resultado:

- cada pessoa responde a um subconjunto (tronco + aprofundamentos);
- o conjunto das pessoas cobre as folhas com ≥ 2 testlets e ≥ 2 perspectivas;
- a entrevista individual fica mais curta, o que reduz fadiga e *satisficing*
  (Krosnick, 1991).

Este é o princípio dos desenhos de **dados faltantes planejados** usados em
avaliações de larga escala como o NAEP (Graham, Taylor, Olchowski & Cumsille,
2006). A estimação da unidade continua correta porque a falta é planejada e não
depende das respostas.

**Cuidado de anonimato:** a ordem de chegada dos respondentes muda o percurso de
cada um. Isso não expõe ninguém (o relatório não mostra percursos individuais),
mas o motor não deve usar horário, dispositivo ou qualquer atributo fora da
perspectiva e do contexto em faixas.

## 5. Regras de parada

| Nível | Regra |
|---|---|
| Item | Não oferecer item com `U < 0,01` bit/min (vigente: 0,01 bit) |
| Folha na unidade | Parar de priorizar quando a faixa de 90% ≤ 1 estágio **e** ≥ 3 testlets **e** ≥ 2 perspectivas |
| Respondente | Alvo de 15 minutos; máximo de 25 minutos; aviso de tempo restante (vigente) |
| Probes causais | Continuam após a trilha enquanto `U` ≥ limiar, até 5 (vigente) |

## 6. Aprofundamento conversacional com LLM (opcional, R11 e R23)

Pesquisas recentes mostram que LLMs fazem bem perguntas de aprofundamento e sabem
quando não perguntar, mas precisam de supervisão humana e ainda não têm evidência
sobre a qualidade diagnóstica final (Scientific Reports, 2026). A v0.5 permite
LLM **apenas** assim:

| Permitido | Proibido |
|---|---|
| Pedir um exemplo concreto depois de uma escolha ("pode descrever o último caso em uma frase?") | Escolher o próximo nó do grafo |
| Pedir esclarecimento quando a resposta aberta é ambígua | Produzir sinal, estágio, causa ou conduta |
| Reformular a pergunta na linguagem da perspectiva, a partir de variantes aprovadas | Perguntar nomes de pessoas, times ou clientes |
| | Sugerir a resposta "certa" |

- Os prompts são versionados como conteúdo do instrumento e auditados como os nós.
- O texto livre é codificado depois (07 §6), nunca pontuado em tempo real.
- A funcionalidade fica atrás de uma flag por projeto e é desligada por padrão.

## 7. Pseudocódigo

```text
ao iniciar respondente j na unidade u:
  perspectiva, contexto ← nós de contexto (sem sinal)
  fila ← tronco da trilha (restrição)

enquanto tempo_j < orçamento e há candidato:
  candidatos ← itens elegíveis que satisfazem as restrições (§3)
  se há folha da unidade com < 2 testlets:
     candidatos ← candidatos que cobrem essas folhas (se não vazio)
  para cada item i em candidatos:
     U(i) ← [Σ_c w_c ΔH(S_{u,c}) + β ΔH(causas)] / t_i
  escolher argmax U; registrar motivo (versão, U, restrição ativa)
  se max U < limiar: sair
  apresentar item; atualizar posterior da unidade (05)
```

## 8. Critérios de aceite para a implementação

1. Com uma unidade sintética de 10 respondentes e 29 folhas elegíveis, cada folha
   aplicável recebe ≥ 2 testlets e ≥ 2 perspectivas, com entrevista média ≤ 18 min.
2. O mesmo cenário com o seletor atual e com o novo mostra, com o novo, largura
   média da faixa menor em pelo menos 20% para o mesmo tempo total.
3. Nenhum item escolhido viola restrição (teste de propriedade).
4. O motivo da escolha é persistido sem dados individuais expostos no relatório
   (vigente).
