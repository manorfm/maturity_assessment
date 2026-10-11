# Plano: framework v0.10 ainda aberto

A cópia de trabalho está em `docs/framework/framework-v0.10/`. Não é
comportamento vigente além do que a base de conhecimento já descreve.

O laudo, o chrome, o mapa de quatro sistemas, a ficha, o plano, a visão
por público e o walkthrough já projetam o que o motor sustenta e declaram
lacuna no resto. Os módulos abaixo existem e têm teste de referência. O
produto em execução usa `m2` como padrão de projeto novo; `m1` permanece
selecionável.

## Aberto

- WP3 (fechado): grafo `v21` com `evidence[]`, adaptador m1, `taskFamily`/
  `testlet`, auditoria, ritual/heroísmo em âncora 1 com peso m1 −1, folhas
  publicáveis com ≥ 2 testlets + âncora baixa + caminho até topo.
- WP4: módulo `measurement` reproduz 05 §5.1/§7.3; projetos têm
  `measurement_model` (padrão `m2`, schema 27); runtime mede folhas pela
  matriz Q, publica índice com regra de publicação, aceite dos sintéticos
  e partial pooling hierárquico (unidade ← irmãos via mãe) no
  `measureIndex`. Fechado no motor.
- WP10 (parcial): `icc.ts` com ICC(1)/ICC(2), k para 0,70, `omegaFromIcc1` e
  `omegaForLeaf` no runtime; `lab/README` aponta protótipos e o fluxo de
  exportar `pooling` no JSON m2. Estimação Bayesian (κ, δ, ρ, ψ) e E0 com
  PyMC/Stan permanecem abertos.
- WP5 (parcial): `causal-catalog-v11` em noisy-OR com proveniência tipada,
  `applyShelfSession` / `lambdaFromHundred` e auditoria no
  `audit:instrument`. Aplicar sessões SHELF reais (3–5 especialistas) às
  famílias e substituir λ provisórios permanece aberto.
- WP6 (fechado no motor): seletor por bits/min; cobertura matricial no caminho
  quente (`selectAfterTerminal` = `selectWithUnitCoverage`); vinheta com
  rodízio. Simulador de unidade e §8.2 de aceitação de campo permanecem como
  validação empírica.
- WP7 (fechado no motor): vinheta, leitura, referente de grupo, técnica de
  lista e texto livre no tronco quando `free_text_enabled`; PII, livro de
  códigos, fila de revisão e κ ≥ 0,7. Validação empírica de κ em campo
  permanece aberta.
- WP9 (fechado no motor de contrato): Cynefin, grau A–D com
  `foundationIsReplicated`, arquétipos `systemic-archetypes-v1`, restrição
  principal por escore, pulso (`pulse-*` / `selectPulseItems`) no plano de
  tratamento.
- WP15 (fechado no motor): `change-detection` com P ≥ 0,8 (inclui estável);
  schema 27 `index_readings` + `context_json`; histórico com
  `evolution-report-v1` e correspondência de unidades; walkthrough
  `area-walkthrough-v1`. Validação empírica do ciclo 6–12 meses permanece
  de campo.
- WP12 (parcial): `EvidenceLink.sophistication` F0–F5; matriz de 4
  quadrantes; walkthrough mostra F × apropriação; F fora do índice (R28);
  posterior discreta P(F=0..5) por folha/unidade com o modelo de 05;
  padrões das trilhas 12 §3.1–3.10 e 3.12 no grafo com F baixo e alto.
  Folha/itens dedicados da trilha 3.11 (IA) e perguntas de evento
  exclusivas de sofisticação ainda abertas.
- WP13, WP14, WP16 a WP19: capacidades novas, Laya, exames, reescrita do banco, dossiês.
- WP20 (parcial): `advancedPracticeCatalog` com chaos, QA, AI-DLC e service
  mesh; `p_k = P(S ≥ mínimo)` a partir da posterior ou nível provisório das
  folhas; rota de prontidão usa `projectCatalogReadiness`. Sofisticação F nas
  trilhas e biblioteca completa de 22 §5 ainda abertas.
- WP21 (parcial): `enablementCatalog` com arestas de 23 §3.3;
  `P(desbloqueado)` por produto das essenciais; fronteira/perto/bloqueado;
  walkthrough restringe próxima fase à fronteira; condutas com
  `learningMode`, `unlocks` e aviso de baixa transferência (curso).
  Elicitação SHELF do restante do grafo ainda aberta.

WP4 no runtime está fechado; fórmulas ICC→ω no motor; E0/PyMC no WP10.
