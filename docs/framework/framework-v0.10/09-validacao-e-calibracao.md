# 09 — Validação e calibração

> Validade não é propriedade do instrumento, e sim dos **usos** que se fazem dos
> resultados (Messick, 1989; Kane, 2013). A pergunta certa é: "a leitura que o
> relatório propõe, para a decisão que ele orienta, está sustentada?".

## 1. Argumento de interpretação e uso (Kane)

A cadeia de inferências do produto, cada uma com a evidência que a sustenta:

| # | Inferência | Afirmação | Evidência necessária | Estudo |
|---|---|---|---|---|
| I1 | **Pontuação** | A resposta foi entendida como pretendido e a regra de evidência a traduz corretamente | Entrevistas cognitivas; auditoria do instrumento; revisão da matriz Q por especialistas | E1, E2 |
| I2 | **Generalização** | As respostas de uma amostra de pessoas e eventos representam o estado da unidade | Confiabilidade entre respondentes (ICC, estudo G); teste-reteste; recuperação de parâmetros | E4, E7, E10 |
| I3 | **Extrapolação** | O estágio estimado corresponde ao comportamento real da unidade fora da entrevista | Relação com telemetria (lead time, taxa de falha), com escalas validadas e com avaliação de especialistas | E5, E6, E2 |
| I4 | **Explicação causal** | A causa publicada é a causa mais provável | Calibração das posteriores causais contra adjudicação cega de especialistas | E8 |
| I5 | **Decisão e consequência** | Seguir a conduta produz melhora sem dano | Acompanhamento de organizações tratadas; efeitos colaterais; uso indevido (P8) | E9 |

Cada uso do relatório (01 §2) depende de um subconjunto: priorizar condutas
depende de I1–I4; medir evolução depende de I1–I2 e da equivalência entre versões
(§6); comparar unidades depende de I2 e da invariância (§5).

## 2. As cinco fontes de evidência de validade

Segundo os *Standards for Educational and Psychological Testing* (AERA, APA e
NCME, 2014):

| Fonte | No produto |
|---|---|
| Conteúdo | Rubricas revisadas por especialistas; crosswalk com DORA, SRE e demais referenciais (Anexo A §9) |
| Processo de resposta | Entrevistas cognitivas; tempo de resposta; análise de "não observo" |
| Estrutura interna | Dimensionalidade por domínio; DIF; ajuste do modelo (verificação preditiva posterior) |
| Relações com outras variáveis | Telemetria; escalas validadas (07 §9); avaliação de especialistas |
| Consequências | Efeito das condutas; uso indevido; percepção de justiça pelos respondentes |

## 3. Programa de estudos

| Estudo | Objetivo | Desenho mínimo | Critério |
|---|---|---|---|
| **E0 Simulação e recuperação** | O modelo recupera parâmetros conhecidos? | Laboratório: gerar respostas a partir do modelo com parâmetros conhecidos; estimar; comparar | Viés < 0,1 estágio; cobertura do intervalo de 90% entre 85% e 95% |
| **E1 Entrevistas cognitivas** (vigente) | Os itens são entendidos como pretendido | 5–8 pessoas por perspectiva; inclui vinhetas | Nenhum item com erro de interpretação recorrente |
| **E2 Rótulos cegos** (vigente, ampliado) | Especialistas concordam com o estágio e a causa | 50–100 jornadas; 2 especialistas por disciplina | κ ponderado especialista × especialista ≥ 0,6 |
| **E3 Piloto de campo** | Aplicação real e diversa | 8–12 organizações de portes e setores diferentes; ≥ 3 unidades por organização; ≥ 10 respondentes por unidade | Taxa de conclusão ≥ 70%; tempo mediano ≤ 18 min |
| **E4 Teste-reteste** | Estabilidade sem intervenção | Subconjunto reaplicado após 2–4 semanas | κ ponderado entre leituras da unidade ≥ 0,6 |
| **E5 Convergente e discriminante** | Os sinais de clima convergem com escalas validadas | Subconjunto curto de itens de referência (07 §9) no piloto | Correlações na direção esperada; discriminantes baixas |
| **E6 Critério** | O estágio de entrega acompanha a telemetria | ≥ 2 organizações com Git + CI/CD conectados | Correlação de posto negativa entre estágio de fluxo e lead time |
| **E7 Invariância e DIF** | Os itens funcionam igual entre perspectivas, portes e idiomas | Análise de DIF ordinal; invariância de medida | Itens com DIF grande revisados ou modelados |
| **E8 Calibração causal** | A posterior das causas é honesta | Posteriores × adjudicação cega (E2) | ECE ≤ 0,08; Brier melhor que a linha de base (prior) |
| **E9 Consequência** | Tratar melhora sem dano | Acompanhar organizações por 6–12 meses após a conduta | Melhora nos indicadores antecedentes; nenhum uso punitivo relatado |
| **E10 Estudo G** | Quantos respondentes e eventos são necessários | Decomposição da variância (unidade, perspectiva, pessoa, testlet) | Plano de amostragem por tipo de folha (§4) |

**E0 pode e deve começar antes de qualquer pessoa real responder**: se o modelo
não recupera os próprios parâmetros em dados simulados, nenhum piloto vai salvá-lo.

## 4. Quantos respondentes por unidade

O limiar de 5 protege o anonimato, mas não garante precisão (o repositório já
diz isso). A confiabilidade da média da unidade, `ICC(2)`, depende do número de
respondentes `k` e da proporção de variância entre unidades, `ICC(1)` (Bliese,
2000):

```text
ICC(2) = k · ICC(1) / (1 + (k − 1) · ICC(1))
```

| ICC(1) da capacidade | k = 5 | k = 8 | k = 10 | k = 15 | k = 20 | k para ICC(2) ≥ 0,70 |
|---|---|---|---|---|---|---|
| 0,05 | 0,21 | 0,30 | 0,34 | 0,44 | 0,51 | 45 |
| 0,10 | 0,36 | 0,47 | 0,53 | 0,62 | 0,69 | 21 |
| 0,15 | 0,47 | 0,59 | 0,64 | 0,73 | 0,78 | 14 |
| 0,20 | 0,56 | 0,67 | 0,71 | 0,79 | 0,83 | 10 |
| 0,30 | 0,68 | 0,77 | 0,81 | 0,87 | 0,90 | 6 |

Na literatura de clima, o ICC(1) costuma ficar entre 0,05 e 0,20. **Recomendação
inicial:** 10–15 respondentes por unidade para folhas organizacionais; 6–10 para
folhas de entrega com eventos concretos (que tendem a ter ICC maior). O estudo E10
substitui estes números por valores estimados. O relatório mostra, por unidade, se
a amostra atinge o recomendado ("amostra abaixo do recomendado para esta leitura").

## 5. Invariância e comparação

Comparar unidades, perspectivas ou empresas exige que os itens meçam a mesma
coisa nos grupos (invariância de medida; Meredith, 1993). Procedimento:

1. testar DIF por perspectiva, porte e idioma (E7);
2. itens com DIF são revisados ou recebem parâmetro específico por grupo;
3. vinhetas de ancoragem corrigem a diferença de escala entre perspectivas
   (05 §4);
4. benchmark entre empresas (R16) só com itens invariantes e amostras comparáveis.

## 6. Versões do instrumento e comparação no tempo

- Uma reavaliação com a **mesma versão** compara diretamente (05 §9).
- Com **versão nova**, a comparação exige **itens-âncora comuns** (desenho de
  grupos não equivalentes com itens comuns) e ligação das escalas no laboratório.
  Sem essa ponte, o relatório não publica "evolução".
- Não publicar versão nova no meio de um piloto (R26).

## 7. Verificação do modelo

- **Verificação preditiva posterior:** simular respostas a partir da posterior e
  comparar com as observadas (proporções por opção, discordância entre
  perspectivas). Discrepância sistemática indica modelo errado, não "organização
  estranha".
- **Recuperação de parâmetros** em dados simulados (E0) a cada mudança de modelo.
- **Sensibilidade a priors:** relatório técnico com o efeito de variar κ, ψ, γ e ω
  em ±50%. Conclusões que mudam de lado são marcadas como frágeis.

## 8. Gate de calibração (atualização do gate vigente)

O modelo passa de "provisório" para "calibrado" quando **todos** os critérios
valem, com massa rotulada do piloto:

| Critério | Limiar |
|---|---|
| E0 recuperação | viés < 0,1 estágio; cobertura 85–95% |
| ECE das causas | ≤ 0,08 |
| Brier das causas | melhor que o prior em ≥ 15% |
| Falso positivo de causa publicada | ≤ 20% (vigente: pré-declarado) |
| Parada incorreta | dentro do limiar vigente |
| κ ponderado modelo × especialistas (estágio) | ≥ 0,6 |
| Teste-reteste (E4) | κ ponderado ≥ 0,6 |

Quando o gate abre, os parâmetros estimados viram uma versão `draft` do arquivo de
parâmetros e só são publicados após revisão humana (vigente).

## 9. Ética, privacidade e LGPD

| Tema | Regra |
|---|---|
| Base legal | Definida com a organização contratante; respondente informado do propósito (vigente) e da impossibilidade de uso individual |
| Minimização | Sem e-mail no primeiro corte (vigente); senioridade e tempo de casa só em faixas; texto livre com PII removida e original descartado |
| Relatório de impacto | Relatório de impacto à proteção de dados (RIPD) por projeto quando houver texto livre ou temas de pessoas (D11) |
| Retenção | Prazo configurável e exclusão (backlog vigente) |
| Reidentificação | Supressão por partição (vigente); teste de interseção entre filtros; arredondamento de contagens pequenas. Ruído de privacidade diferencial como opção futura para contagens publicadas |
| Temas sensíveis | Técnica de lista só com ≥ 40 pessoas; nenhum item pede nome, time pequeno ou data precisa |
| Revisão ética | Obrigatória para itens `[pesquisa]` de D11 (pessoa-função, disfunção) antes de entrar no grafo |
