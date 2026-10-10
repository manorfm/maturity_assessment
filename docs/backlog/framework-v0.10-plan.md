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
  `measurement_model` (padrão `m2`, schema 25); runtime mede folhas pela
  matriz Q, publica índice com regra de publicação, aceite dos sintéticos
  e partial pooling hierárquico (unidade ← irmãos via mãe) no
  `measureIndex`. Fechado no motor.
- WP10 (parcial): `icc.ts` com ICC(1)/ICC(2), k para 0,70, `omegaFromIcc1` e
  `omegaForLeaf` no runtime; `lab/README` aponta protótipos e o fluxo de
  exportar `pooling` no JSON m2. Estimação Bayesian (κ, δ, ρ, ψ) e E0 com
  PyMC/Stan permanecem abertos.
- WP5 (parcial): `causal-catalog-v11` cobre `late-integration` (§8.4) e os
  demais sistemas de `diagnosticSystemCatalog` em noisy-OR (hipótese/unknown
  → causas/λ₀), com runtime no `inference-service`. Elicitação SHELF dos λ
  permanece aberta.
- WP6 (fechado no motor): seletor por bits/min; cobertura matricial no caminho
  quente (`selectAfterTerminal` = `selectWithUnitCoverage`); vinheta com
  rodízio. Simulador de unidade e §8.2 de aceitação de campo permanecem como
  validação empírica.
- WP7 (fechado no motor de tipos): vinheta, leitura, referente de grupo e
  técnica de lista no tronco; texto livre com flag off, PII, livro de códigos,
  fila de revisão no painel e κ ≥ 0,7. Ligar texto livre ao tronco da entrevista
  quando a flag estiver ligada permanece hipótese aberta.
- WP9 (fechado no motor de contrato): Cynefin, grau A–D com
  `foundationIsReplicated`, arquétipos `systemic-archetypes-v1`, restrição
  principal por escore, pulso (`pulse-*` / `selectPulseItems`) no plano de
  tratamento. Publicar mudança com P(melhora) ≥ 0,8 e reavaliação 6–12 meses
  permanecem no ciclo de evolução (WP16).
- WP12 a WP14, WP16 a WP19: sofisticação, capacidades novas, Laya, exames, reescrita do banco, dossiês.
- WP15: comparador de duas leituras com faixa. Sem duas fotografias de índice, a página diz a lacuna.
- WP20: prontidão calculada quando há `p_k`. Chaos engineering, AI-DLC e service mesh aparecem sem posterior.
- WP21: fronteira quando houver arestas elicitadas. O grafo de habilitação ainda não entrou no conteúdo.

WP4 no runtime está fechado; fórmulas ICC→ω no motor; E0/PyMC no WP10.
