# Plano de evolução do instrumento

Status: hipóteses ainda abertas após o conteúdo de perspectivas de 2026-08-27.
O comportamento vigente está na [base de conhecimento](../knowledge-base/README.md).

Já incorporados (não repetir como trabalho futuro): três estados observacionais,
saídas que não pontuam, opções ouro desempacotadas, catálogo de intervenção sem
regras órfãs, fundamento versionado, contexto→cenário para identidade, resiliência
de dependência, incentivo, assistência de modelo, complexidade acidental e sinal
ruidoso, persistência de experimento e comparação de capturas sem identificar
pessoas, limiares de piloto pré-declarados, rótulos cegos e gate que impede
recalibrar o modelo publicado sozinho, ramos de arquitetura, segurança, dados e
design, carga cognitiva, linguagem na mudança e caminho até capacidade de
plataforma, higiene de linguagem, ordem determinística por participação, separação
entre título e mecanismo causal, fundamentos explícitos por padrão e experimentos
contextuais. Grafo pré-piloto vigente: `evidence-anamnesis-pilot-v20`.

A decisão de apresentar o produto como diagnóstico de engenharia — sem expandir
a árvore nem pontuar prática — está em
[`engineering-diagnostic-plan.md`](engineering-diagnostic-plan.md). Este plano
continua dono do piloto humano e da calibração.

Itens de plataforma (SSO, editor, PostgreSQL) e pesquisa de longo prazo continuam
em [`future-evolution.md`](future-evolution.md). Calibração que depende de massa
real continua em
[`probabilistic-inference-roadmap.md`](probabilistic-inference-roadmap.md).

## O que este plano recusa

- Perguntar se a organização usa Vault, IAM, Kubernetes, Copilot, Figma ou OKR.
- Criar eixos “IAM”, “IA” ou “FinOps” desconectados da taxonomia de oito
  capacidades.
- Calibrar priors em cima de um grafo anterior à higiene observacional.
- Importar métricas DORA ou dashboards antes de o instrumento comportamental
  estar estável e calibrado.
- Tratar reaplicação como ranking de pessoas ou de times.
- Publicar uma versão nova do catálogo **no meio** de um piloto com pessoas reais
  já em curso: isso mistura evidência de dois instrumentos. Enquanto o produto
  ainda está sendo construído para apresentar e aplicar, o catálogo publicado
  deve amadurecer; o piloto humano corre sobre a versão vigente.

## Dependência entre o que resta

```text
Onda 2  piloto e calibração   (roadmap probabilístico, sobre pilot-v2)
   └─► Onda 5  evidência externa e plataforma
```

Não misturar versões depois que entrevistas cognitivas e revisão cega tiverem
começado sobre `evidence-anamnesis-pilot-v19`.

---

## Onda 2 — Piloto e calibração

A infraestrutura está no produto. Falta o trabalho com pessoas reais descrito em
[`probabilistic-inference-roadmap.md`](probabilistic-inference-roadmap.md):
entrevistas cognitivas, revisão cega e piloto diverso **sobre o grafo
`evidence-anamnesis-pilot-v19`**, incluindo as nove perspectivas, o contexto de trabalho e as trilhas curtas de evento.

Não tratar clique nem aceitação de recomendação como rótulo. Não publicar o
posterior como probabilidade empírica até o gate abrir e uma versão draft ser
revisada e publicada explicitamente.

**Saída.** Limiares de falso positivo e parada incorreta (já pré-declarados)
atendidos com massa rotulada, ou o grafo volta de versão.

---

## Onda 4 — Perspectivas e profundidade

Itens 1–5 e a higiene de linguagem entregues no grafo
`evidence-anamnesis-pilot-v19`. Resta:

- Validar a linguagem dos ramos novos com cada disciplina (arquitetura, segurança,
  dados, design, plataforma) antes de aplicar em organização real; o painel já
  registra a entrevista cognitiva, o trabalho restante é humano.
- Separar performance, custo e sustentabilidade quando cada uma tiver sinais
  independentes suficientes (Well-Architected + FinOps como lentes).

**Saída do que resta.** Linguagem revisada com a disciplina; folhas de eficiência
só se dividem quando cada recorte tiver ≥2 padrões independentes.

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
- Perspectivas de arquitetura, segurança, dados e design cobrem comportamento
  nessas fronteiras, sem transformar ferramenta ou framework em nota.
- Posterior apresentado como provisório até calibração; depois, ECE e Brier
  dentro do limiar pré-definido.
- Reaplicação compara padrões, não pessoas.
- Ausência de perspectiva continua lacuna, não zero.

Enquanto a onda 2 não concluir, o veredito permanece **Adequado**: o raio-X
comportamental cobre SDLC, identidade aplicável, resiliência, incentivo,
assistência de modelo e as nove perspectivas, mas o posterior ainda não é
probabilidade empírica.
