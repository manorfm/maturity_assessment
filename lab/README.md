# Laboratório de modelo (WP10)

Cálculos offline que **não** entram no runtime de entrevista. O produto carrega
só o JSON de parâmetros versionado (`measurement-params-m2.json`).

## O que já existe em TypeScript

| Artefato | Papel |
|---|---|
| `src/modules/measurement/domain/icc.ts` | ICC(1), ICC(2), k para ICC(2)≥0,70, `ω = 1 − ICC(1)` |
| `test/icc-omega.test.ts` | Tabela 09 §4 e mapeamento ω |
| `docs/framework/framework-v0.10/anexo-B-prototipos/` | Protótipos Python de referência (05 §5.1 / §8.4) |

## Fluxo pretendido

1. Estimar ICC(1) por folha a partir de pilotos (one-way / hierárquico).
2. Derivar `ω` por folha (`omegaFromIcc1`) e gravar em `pooling` no JSON m2.
3. Runtime usa `omegaForLeaf` no partial pooling (05 §7.1).
4. Estimação Bayesian completa (κ, δ, ρ, ψ) e E0 ficam para PyMC/Stan aqui
   quando houver massa de piloto.

## Protótipos

Os números de referência do documento 05 estão em:

- [`../docs/framework/framework-v0.10/anexo-B-prototipos/model.py`](../docs/framework/framework-v0.10/anexo-B-prototipos/model.py)
- [`../docs/framework/framework-v0.10/anexo-B-prototipos/causal.py`](../docs/framework/framework-v0.10/anexo-B-prototipos/causal.py)
