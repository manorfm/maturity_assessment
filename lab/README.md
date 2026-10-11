# Laboratório de modelo (WP10)

Cálculos offline que **não** entram no runtime de entrevista. O produto carrega
só o JSON de parâmetros versionado (`measurement-params-m2.json`).

## O que já existe em TypeScript

| Artefato | Papel |
|---|---|
| `src/modules/measurement/domain/icc.ts` | ICC(1), ICC(2), k para ICC(2)≥0,70, `ω = 1 − ICC(1)` |
| `src/modules/measurement/domain/e0-recovery.ts` | E0: simula respostas e recupera S (09 §3) |
| `test/icc-omega.test.ts` / `test/e0-recovery.test.ts` | Aceite |
| `docs/framework/framework-v0.10/anexo-B-prototipos/` | Protótipos Python de referência (05 §5.1 / §8.4) |

## E0 — simulação e recuperação

```bash
npx tsx --test test/e0-recovery.test.ts
python3 lab/e0_recovery.py   # orquestra a mesma função TS
```

Critérios vigentes para S discreto: `|viés| < 0,1`, `MAE < 0,25`, cobertura do
intervalo 90% ≥ 0,85. O teto 85–95% da cobertura aplica-se à calibração de
parâmetros contínuos (κ, δ, ρ, ψ) quando houver PyMC/Stan.

## Fluxo pretendido

1. Rodar E0 a cada mudança do modelo de observação.
2. Estimar ICC(1) por folha a partir de pilotos (one-way / hierárquico).
3. Derivar `ω` por folha (`omegaFromIcc1`) e gravar em `pooling` no JSON m2.
4. Runtime usa `omegaForLeaf` no partial pooling (05 §7.1).
5. Estimação Bayesian completa (κ, δ, ρ, ψ) fica para PyMC/Stan aqui quando
   houver massa de piloto.

## Protótipos

Os números de referência do documento 05 estão em:

- [`../docs/framework/framework-v0.10/anexo-B-prototipos/model.py`](../docs/framework/framework-v0.10/anexo-B-prototipos/model.py)
- [`../docs/framework/framework-v0.10/anexo-B-prototipos/causal.py`](../docs/framework/framework-v0.10/anexo-B-prototipos/causal.py)
