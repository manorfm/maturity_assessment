# Plano de evolução do instrumento

Status: hipóteses ainda abertas após a higiene e o conteúdo aplicável de 2026-08-27.
O comportamento vigente está na [base de conhecimento](../knowledge-base/README.md).

Já incorporados (não repetir como trabalho futuro): três estados observacionais,
saídas que não pontuam, opções ouro desempacotadas, catálogo de intervenção sem
regras órfãs, fundamento versionado, contexto→cenário para identidade, resiliência
de dependência, incentivo, assistência de modelo, complexidade acidental e sinal
ruidoso, persistência de experimento e comparação de capturas sem identificar
pessoas, limiares de piloto pré-declarados, rótulos cegos e gate que impede
recalibrar o modelo publicado sozinho. Grafo vigente: `evidence-anamnesis-v12`.

Itens de plataforma (SSO, editor, PostgreSQL) e pesquisa de longo prazo continuam
em [`future-evolution.md`](future-evolution.md). Calibração que depende de massa
real continua em
[`probabilistic-inference-roadmap.md`](probabilistic-inference-roadmap.md).

## O que este plano recusa

- Perguntar se a organização usa Vault, IAM, Kubernetes, Copilot ou OKR.
- Criar eixos “IAM”, “IA” ou “FinOps” desconectados da taxonomia de seis
  capacidades.
- Calibrar priors em cima de um grafo anterior à higiene observacional.
- Importar métricas DORA ou dashboards antes de o instrumento comportamental
  estar estável e calibrado.
- Tratar reaplicação como ranking de pessoas ou de times.

## Dependência entre o que resta

```text
Onda 2  piloto e calibração   (roadmap probabilístico)
   ├─► Onda 4  perspectivas e profundidade
   └─► Onda 5  evidência externa e plataforma
```

Não avançar a onda seguinte sem o critério de saída da anterior. A onda 4
pode preparar autoria em paralelo à 2, mas não publica catálogo novo no meio
do piloto.

---

## Onda 2 — Piloto e calibração

A infraestrutura está no produto. Falta o trabalho com pessoas reais descrito em
[`probabilistic-inference-roadmap.md`](probabilistic-inference-roadmap.md):
entrevistas cognitivas, revisão cega e piloto diverso **sobre o grafo
`evidence-anamnesis-v12`**.

Não tratar clique nem aceitação de recomendação como rótulo. Não publicar o
posterior como probabilidade empírica até o gate abrir e uma versão draft ser
revisada e publicada explicitamente.

**Saída.** Limiares de falso positivo e parada incorreta (já pré-declarados)
atendidos com massa rotulada, ou o grafo volta de versão.

---

## Onda 4 — Perspectivas e profundidade

Só depois de o instrumento higienizado ter piloto. Publicar ramo novo no meio
da calibração mistura versões.

Prioridade dentro da onda:

1. Ramos de **segurança** e **arquitetura** (hoje o tronco e o perfil
   engenharia/plataforma carregam os dois de forma rasa).
2. Ramos de **dados** e **design** (UX/Design System só como comportamento de
   fronteira produto–engenharia, não como ferramenta Figma).
3. Team Topologies: carga cognitiva e modos de interação, sem perguntar o
   nome do modelo.
4. DDD: linguagem e limite visíveis na mudança, sem “vocês fazem DDD?”.
5. DX / plataforma como produto: tempo até capacidade, não “temos IDP”.
6. Separar performance, custo e sustentabilidade quando cada uma tiver
   sinais independentes suficientes (Well-Architected + FinOps como lentes).

**Saída.** Cada ramo novo com ≥2 padrões independentes por folha tocada;
linguagem validada com a disciplina antes de publicar.

---

## Onda 5 — Evidência externa e plataforma

Não começa enquanto a onda 2 não tiver uma versão calibrada.

- Importar DORA, incidentes ou observabilidade como **resultado por
  serviço**, nunca como nota de framework e nunca no lugar da entrevista.
- Editor de grafo, SSO, retenção, API pública: ver `future-evolution.md`.
- IRT, consistência interna e depreciação de itens: só com centenas de
  jornadas diversas.

---

## Critério para declarar o modelo robusto

Todos os itens abaixo, juntos:

- Três estados observacionais em produção, com triangulação de visibilidade
  entre perfis elegíveis.
- Identidade/credencial, resiliência de dependência e IA avaliados só quando
  aplicáveis; folhas não aplicáveis permanecem “não avaliado”.
- Nenhuma pergunta de inventário pontua; nenhuma recomendação cita
  ferramenta sem problema demonstrado e fundamento.
- Posterior apresentado como provisório até calibração; depois, ECE e Brier
  dentro do limiar pré-definido.
- Reaplicação compara padrões, não pessoas.
- Ausência de perspectiva continua lacuna, não zero.

Enquanto a onda 2 não concluir, o veredito permanece **Adequado**: o raio-X
comportamental cobre SDLC, identidade aplicável, resiliência, incentivo e
assistência de modelo, mas o posterior ainda não é probabilidade empírica.
