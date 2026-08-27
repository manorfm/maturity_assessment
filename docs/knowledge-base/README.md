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
- `assessment-model.md`: pilares, evidências, inferências e pontuação.
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
piloto, calibração e aprendizado supervisionado que dependem de massa real. O que
ainda falta para declarar o instrumento robusto (calibração, ramos extras, evidência
externa) está no [`plano de evolução`](../backlog/instrument-evolution-plan.md).

## Princípio central

Uma capacidade não é madura porque existe nominalmente. A avaliação procura a
cadeia completa:

`contexto -> decisão -> comportamento -> evidência -> resultado -> aprendizado`

Por exemplo, “temos alertas” é um sinal fraco. Quem recebe, como prioriza, quanto
tempo leva para agir, o que acontece após recorrência e como o aprendizado muda o
sistema são sinais mais fortes.

Da mesma forma, Kafka, Kubernetes, cloud, DORA ou um time de plataforma não geram
pontos. Essas informações podem selecionar cenários relevantes; somente decisões,
comportamentos, restrições, resultados e aprendizado sustentam inferências.
