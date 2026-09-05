# Base de conhecimento

Esta pasta é a memória versionada do modelo de avaliação. Toda mudança relevante
no instrumento deve atualizar estes documentos junto com código, perguntas e
regras de inferência.

Estes arquivos descrevem exclusivamente o comportamento vigente e são a fonte
normativa para novas implementações. Registro cronológico pertence a `docs/history`;
ideias ainda não entregues pertencem a `docs/backlog`. Nenhum dos dois é especificação
do comportamento atual.

## Documentos

- `product-vision.md`: propósito, usuários e limites do produto.
- `assessment-model.md`: pilares, evidências, inferências e estágio auxiliar.
- `question-design.md`: como criar cenários capazes de reduzir vieses.
- `recommendation-model.md`: cadeia diagnóstica, confiança, prioridade e experimentos.
- `domain-model.md`: conceitos centrais e fronteiras do monólito modular.
- `open-decisions.md`: decisões que ainda precisam ser tomadas em conjunto.
- `technical-architecture.md`: arquitetura técnica vigente e seus critérios.
- `organizational-model.md`: hierarquias configuráveis, anonimato e agregações.
- `adaptive-assessment-graph.md`: jornada dinâmica, inferências e recomendações.
- `profiles-and-triangulation.md`: cenários por perfil e síntese sociotécnica.
- `mvp-scope.md`: critérios verificáveis para declarar o MVP concluído.
- `api.md`: autenticação, operações e contrato de erros da API administrativa.

Ideias ainda não incorporadas ao modelo vigente pertencem ao
[`docs/backlog`](../backlog/README.md), para que hipótese futura e decisão atual não
se confundam.

O motor probabilístico vigente está consolidado em `recommendation-model.md` e
`adaptive-assessment-graph.md`. O
[`roadmap restante`](../backlog/probabilistic-inference-roadmap.md) contém somente
entrevistas, revisão cega e piloto com pessoas reais. O gate de calibração já está
no produto. O que ainda falta para declarar o instrumento robusto (massa rotulada,
validação de linguagem com as disciplinas, evidência externa) está no
[`plano de evolução`](../backlog/instrument-evolution-plan.md). A decisão de
apresentar o produto como diagnóstico de engenharia — e não como framework de
maturidade — está no
[`plano de diagnóstico`](../backlog/engineering-diagnostic-plan.md).
A home já projeta Produto, Engenharia e Operação. O cartão já fecha
decisão sem fabricar impacto. A sequência aberta do relatório
apresentável (UX e sintéticos de validação, sem calibração) está no
[`plano de apresentação`](../backlog/report-presentation-plan.md). A evolução
aberta para tornar explícita a distância entre o comportamento observado e uma
referência de alta performance está no
[`plano comparativo`](../backlog/comparative-diagnostic-plan.md). O plano de amostra
do experimento real está em `organizational-model.md`.

## Princípio central

Uma capacidade não é sustentada porque existe nominalmente. O diagnóstico procura a
cadeia completa:

`contexto -> decisão -> comportamento -> evidência -> resultado -> aprendizado`

Por exemplo, “temos alertas” é um sinal fraco. Quem recebe, como prioriza, quanto
tempo leva para agir, o que acontece após recorrência e como o aprendizado muda o
sistema são sinais mais fortes.

Da mesma forma, Kafka, Kubernetes, cloud, DORA ou um time de plataforma não geram
pontos. Essas informações podem selecionar cenários relevantes; somente decisões,
comportamentos, restrições, resultados e aprendizado sustentam inferências.

O produto não precisa escolher entre causa e comparação. O finding causal é a
leitura principal; o estágio 0–4 resume, de modo secundário, a distância entre o
comportamento demonstrado e uma referência específica da capacidade. Práticas e
famílias de ferramentas podem aparecer como direção quando atacam o mecanismo
observado, mas sua existência nominal continua sem produzir pontos.
