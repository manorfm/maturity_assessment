# 08 — Diagnóstico e tratamento

> Da causa provável à conduta, ao prognóstico e ao acompanhamento. A cadeia
> vigente (`fato → efeito → hipótese → contenção → autoridade → capacidade
> necessária → experimento`) é mantida. A v0.5 acrescenta cinco ferramentas para
> **escolher, sequenciar e justificar** o tratamento.

## 1. As cinco ferramentas

| Ferramenta | Pergunta que responde | Fonte |
|---|---|---|
| **Diagnóstico diferencial** | Quais causas competem pela explicação e com que sustentação? | Camada noisy-OR (05 §8) |
| **Arquétipo sistêmico** | Por que o problema se repete e o que acontece se nada mudar? | Senge (1990); Kim (1992); Meadows (2008) |
| **Restrição principal** | Por onde começar? | Teoria das Restrições (Goldratt, 1984) |
| **Domínio Cynefin** | Que tipo de tratamento cabe: prática conhecida, análise ou experimento? | Snowden & Boone (2007) |
| **Ciclo PDSA com grau de evidência** | Qual o menor experimento, com que base, e como saber se funcionou? | Modelo de Melhoria (Langley et al., 2009); escala inspirada no GRADE |

## 2. Diagnóstico diferencial

Cada achado publica até **três causas** com a escala verbal de 01 §7, e para
cada uma:

- evidência a favor (sintomas, com prevalência agregada);
- evidência contra ou ausente (o que se esperaria ver e não apareceu);
- o que faria mudar a conclusão (próximo exame complementar).

Quando nenhuma causa passa de 0,5, o achado é publicado como **"sintoma
confirmado, mecanismo em investigação"**, com a conduta "investigar" (regra
vigente).

## 3. Arquétipos sistêmicos

Um arquétipo é uma estrutura de realimentação recorrente. Ele explica **por que o
problema se repete** e dá o **prognóstico** sem inventar números. A biblioteca
inicial:

| Arquétipo | Estrutura | Sinais típicos (Anexo A §4) | Prognóstico sem tratamento | Alavanca |
|---|---|---|---|---|
| **Consertos que falham** | A correção rápida gera efeito colateral que piora o problema | S08 (mais aprovação após incidente → lotes maiores → mais incidente), S17 | O controle cresce e o problema também | Tratar a causa; medir a eficácia do controle |
| **Transferência do fardo** | Uma solução sintomática atrofia a capacidade fundamental | S10 (heroísmo de madrugada no lugar de autoscaling), S27 (plataforma vira fila) | Dependência de heróis; perda de capacidade | Reduzir o sintomático aos poucos e construir o fundamental |
| **Metas que erodem** | A distância entre meta e realidade é fechada baixando a meta | S24 (*watermelon*), S31 | Normalização do desempenho baixo | Âncora externa para a meta; investigar a distância |
| **Armadilha da capacidade** | Sem tempo para melhorar, trabalha-se mais, e sobra menos tempo para melhorar | S40, S10, P (Anexo A §3.2) | Toil crescente, burnout | Reservar capacidade protegida para melhoria (Repenning & Sterman, 2001) |
| **Limites ao crescimento** | Um processo cresce até bater num limite não tratado | S02, S36 (coordenação cresce com o número de times) | Estagnação apesar de esforço | Remover o limite (arquitetura, topologia), não empurrar mais |
| **Escalada** | Duas áreas reagem uma à outra com mais controle | S08 + S30 (segurança × produto) | Cada lado aumenta a restrição | Objetivo compartilhado; direito de decisão explícito |
| **Sucesso para os bem-sucedidos** | Recursos vão para quem já vai bem | S39, S42 | Concentração e fragilidade das demais áreas | Alocar por necessidade e potencial |
| **Tragédia dos comuns** | Recurso compartilhado sem dono é consumido | S11 (nuvem sem dono), S13 | Custo e incidente crescem | Dono e guardrail no recurso comum |

**Regra:** o arquétipo é publicado como **hipótese de estrutura**, só quando os
sinais de pelo menos dois dos seus elos foram observados, e com a frase "padrão
provável" (P4).

## 4. Restrição principal

Adaptação dos cinco passos da Teoria das Restrições para o portfólio de achados:

1. **Identificar:** para cada causa publicada, contar quantos achados ela explica
   (arestas `explica`/`amplifica` no grafo causal), ponderado por severidade e
   pela posterior da causa.
2. **Explorar:** a causa com maior escore é a **restrição principal**. A primeira
   conduta ataca ela.
3. **Subordinar:** condutas que aumentam a carga sobre a restrição (mais trabalho
   passando pelo mesmo gargalo) são adiadas.
4. **Elevar:** se a conduta de 30 dias não for suficiente, a estrutural entra no
   horizonte seguinte.
5. **Repetir:** na reavaliação, a restrição pode ter mudado de lugar. Isso é
   esperado e deve ser comunicado como progresso.

```text
escore(causa) = P(causa) × Σ_{achados explicados} severidade(achado) × alcance(achado)
```

## 5. Domínio Cynefin e modo de tratamento

| Domínio | Como reconhecer no diagnóstico | Modo de tratamento |
|---|---|---|
| **Claro** | Causa única com posterior alta; conduta com grau de evidência A ou B; contexto padrão | Aplicar a prática conhecida; medir |
| **Complicado** | Causa identificada, mas a solução depende de análise técnica específica (arquitetura, segurança) | Análise de especialista antes da conduta |
| **Complexo** | Várias causas interagindo; arquétipo sistêmico; forte componente de clima, incentivo ou poder | Vários experimentos pequenos e seguros em paralelo; amplificar o que funciona |
| **Caótico** | Incidentes frequentes e graves, burnout alto, perda de pessoas-chave em curso | Estabilizar primeiro (conter, proteger pessoas); só depois diagnosticar |

A maior parte dos achados organizacionais (D10–D12) é **complexa**. O relatório
não deve vender "boas práticas" para problemas complexos. Nesses casos, a conduta
é um portfólio de experimentos.

## 6. Biblioteca de condutas

### 6.1 Contrato de uma conduta

Evolução de `intervention-foundations` e `solution-guidance`:

| Campo | Conteúdo |
|---|---|
| `mechanism` | O que a conduta muda no sistema (não o nome da prática) |
| `targets` | Causas (famílias noisy-OR) que ela ataca |
| `preconditions` | Capacidades necessárias e estado mínimo (prontidão vigente: não demonstrada … adaptativa) |
| `containment`, `authority` | Onde se resolve e quem decide |
| `cynefin` | Domínio em que a conduta se aplica |
| `horizon` | 0–30 dias · 1–3 meses · 3–12 meses |
| `smallestExperiment` | Ciclo PDSA: o que fazer, onde, por quanto tempo |
| `leadingIndicator`, `outcomeIndicator` | Indicador antecedente (muda primeiro) e de resultado |
| `successCriterion` | Critério declarado **antes** do experimento |
| `sideEffects`, `riskDisplacement` | Efeitos colaterais e risco deslocado |
| `reversibility`, `cost` | Qualitativos |
| `evidenceGrade` | A · B · C · D (§6.2) |
| `grounding` | Fundamentos e referências (vigente) |
| `archetype` | Arquétipo que a conduta rompe, quando houver |
| `learningMode` | Modalidade de aprendizado (23 §5): curso, prática guiada, imersão, par, kata, comunidade, rodízio. Só curso, sem mudança de ambiente, gera aviso de baixa transferência |
| `unlocks` | Arestas do grafo de habilitação que a conduta pretende destravar (23 §3) |

### 6.2 Grau de evidência da conduta

Inspirado na lógica do GRADE: o quanto se sabe que **esta conduta** produz
**este efeito** em contextos parecidos.

| Grau | Base | Exemplo |
|---|---|---|
| **A** | Achado empírico replicado em vários estudos ou anos (estudos transversais grandes e repetidos, longitudinais, experimentos) | Substituir aprovação externa por revisão por par e controles automatizados (DORA, vários anos) |
| **B** | Estudos observacionais ou múltiplos casos documentados | Plataforma como produto (casos, CNCF) |
| **C** | Consenso de especialistas ou prática amplamente relatada, sem estudo sistemático | Reservar % fixo de capacidade para melhoria |
| **D** | Hipótese plausível do autor do instrumento | Condutas novas ainda sem casos |

O relatório mostra o grau ao lado da conduta. Condutas D só aparecem como
experimento explícito, nunca como recomendação principal.

### 6.3 Modelo de Melhoria (PDSA)

Cada conduta responde às três perguntas do Modelo de Melhoria antes do ciclo:

1. **O que estamos tentando alcançar?** (resultado, em linguagem de efeito)
2. **Como saberemos que a mudança é uma melhoria?** (indicadores e critério)
3. **Que mudança podemos fazer que resultará em melhoria?** (o menor experimento)

## 7. Prognóstico e acompanhamento

- **Prognóstico sem tratamento:** vem do arquétipo (§3), em linguagem
  qualitativa. Números só depois de calibração com dados longitudinais.
- **Prognóstico com tratamento:** qual indicador deve mudar primeiro e em que
  horizonte (o antecedente), e depois o resultado.
- **Pulso:** 3 a 6 itens-âncora dos nós tratados, a cada 4–8 semanas, para as
  mesmas unidades. Publica mudança só com `P(melhora) ≥ 0,8` (05 §9).
- **Reavaliação:** completa, a cada 6–12 meses.
- **Limite de transformações simultâneas:** no máximo 3 condutas ativas por nível
  de autoridade. Transformação também é trabalho em progresso.

## 8. Exemplo completo de conduta

| Campo | Valor |
|---|---|
| Achado | Mudanças prontas esperam 6–15 dias por aprovação de várias pessoas |
| Causa (posterior) | Aprovação externa desproporcional ao risco — sustentação forte |
| Arquétipo | Consertos que falham |
| Restrição principal? | Sim: explica 3 dos 5 achados publicados |
| Cynefin | Complicado (a classificação de risco exige análise de segurança e operação) → depois claro |
| Mecanismo | Separar decisão por risco; gerar evidência automática no próprio fluxo |
| Menor experimento | Por 6 semanas, num serviço, mudanças classificadas como baixo risco saem com revisão por par e evidência do pipeline; as demais seguem o fluxo atual |
| Pré-condições | Pipeline registra testes e origem da versão (prontidão ≥ "local") |
| Autoridade | Direção de tecnologia + segurança (política); time do serviço (execução) |
| Indicador antecedente | Tempo de espera por aprovação nas mudanças de baixo risco |
| Indicador de resultado | Lead time; taxa de falha de mudança (não pode subir) |
| Critério de sucesso | Espera mediana < 1 dia sem aumento da taxa de falha em 6 semanas |
| Efeitos colaterais | Classificação de risco virar novo formulário (ritual) |
| Reversibilidade | Alta (volta ao fluxo atual por decisão) |
| Grau de evidência | A (*Accelerate*; DORA, vários anos) |
| Fundamentos | Forsgren, Humble & Kim (2018); DORA "streamlining change approval" |
