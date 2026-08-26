# Base de conhecimento

Esta pasta é a memória versionada do modelo de avaliação. Toda mudança relevante
no instrumento deve atualizar estes documentos junto com código, perguntas e
regras de inferência.

## Documentos

- `product-vision.md`: propósito, usuários e limites do produto.
- `assessment-model.md`: pilares, evidências, inferências e pontuação.
- `question-design.md`: como criar cenários capazes de reduzir vieses.
- `domain-model.md`: conceitos centrais e fronteiras do monólito modular.
- `open-decisions.md`: decisões que ainda precisam ser tomadas em conjunto.
- `technical-architecture.md`: arquitetura técnica vigente e seus critérios.
- `organizational-model.md`: hierarquias configuráveis, anonimato e agregações.
- `adaptive-assessment-graph.md`: jornada dinâmica, inferências e recomendações.
- `profiles-and-triangulation.md`: cenários por perfil e síntese sociotécnica.

Ideias ainda não incorporadas ao modelo vigente pertencem ao
[`docs/backlog`](../backlog/README.md), para que hipótese futura e decisão atual não
se confundam.

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
