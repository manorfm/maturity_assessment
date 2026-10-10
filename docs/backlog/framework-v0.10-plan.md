# Plano: framework v0.10 ainda aberto

A cópia de trabalho está em `docs/framework/framework-v0.10/`. Não é
comportamento vigente além do que a base de conhecimento já descreve.

O laudo, o chrome, o mapa de quatro sistemas, a ficha, o plano, a visão
por público e o walkthrough já projetam o que o motor sustenta e declaram
lacuna no resto. Os módulos abaixo existem e têm teste de referência. O
produto em execução continua em `m1` até os sintéticos passarem no modelo
novo.

## Aberto

- WP3 (parcial): grafo `v21` publica `evidence[]` em toda opção de prática,
  com adaptador m1 (`evidenceToSignals`), `taskFamily`/`testlet` e auditoria
  da matriz Q. Revisar âncoras de ritual/heroísmo (−2 → 1) e folhas com
  testlets ou topo escassos ainda é conteúdo aberto.
- WP4 (parcial): módulo `measurement` reproduz 05 §5.1/§7.3; projetos
  têm `measurement_model` (padrão `m1`); em `m2` o runtime mede folhas
  pela matriz Q e só publica índice quando a regra de publicação passa.
  Aceite dos sintéticos do showcase em m2 e promoção a padrão ainda
  abertos. Partial pooling hierárquico entre unidades mãe/filha ainda
  não entra no caminho do relatório.
- WP5 (parcial): `CausalFamily` + `causal-catalog-v11` com a família
  `late-integration` (05 §8.4) e runtime noisy-OR no `inference-service`.
  Converter as demais famílias do motor legado (hipótese/unknown → causas/λ₀)
  e elicitação SHELF dos λ ainda estão abertos.
- WP6 e WP7: seletor por utilidade e vinhetas.
- WP9: Cynefin e grau A–D classificam a conduta pela base da prática
  (`classifyEvidenceGrade`). A ainda exige `replicated`; biblioteca de
  arquétipos e restrição por escore de 08 §4 continuam abertas.
- WP12 a WP14, WP16 a WP19: sofisticação, capacidades novas, Laya, exames, reescrita do banco, dossiês.
- WP15: comparador de duas leituras com faixa. Sem duas fotografias de índice, a página diz a lacuna.
- WP20: prontidão calculada quando há `p_k`. Chaos engineering, AI-DLC e service mesh aparecem sem posterior.
- WP21: fronteira quando houver arestas elicitadas. O grafo de habilitação ainda não entrou no conteúdo.

Hipótese, não compromisso: promover `m2` como padrão de projeto novo só depois dos sintéticos do showcase.
