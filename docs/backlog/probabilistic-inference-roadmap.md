# Piloto, calibração e aprendizado supervisionado

O software do piloto já está no produto: limiares pré-declarados, persistência de
rótulos cegos e entrevistas cognitivas, métricas (Brier, ECE, falso positivo,
parada incorreta, discordância) e um gate que recusa publicar priors
automaticamente. A especificação vigente está em
[`recommendation-model.md`](../knowledge-base/recommendation-model.md).

Este backlog contém somente o trabalho humano que o código não pode inventar.

## Trabalho restante

- Entrevistas cognitivas reais, 5–8 por perspectiva, incluindo saídas de
  visibilidade, registradas como `item_reviews`.
- Revisão cega de 50–100 jornadas com especialistas de disciplinas diferentes,
  gravada em `pilot_labels` com `case_key` opaco.
- Piloto controlado com diversidade de organização, perspectiva e contexto;
  volume concentrado não substitui diversidade.
- Só então, se o gate abrir, revisar priors/likelihoods numa versão `draft` e
  publicá-la explicitamente após revisão humana.

Não tratar clique nem aceitação de recomendação como rótulo. Não executar este
trabalho sobre um grafo anterior a `evidence-anamnesis-v13`.
