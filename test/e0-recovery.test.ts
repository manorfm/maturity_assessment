import assert from 'node:assert/strict';
import { test } from 'node:test';
import { runE0Recovery } from '../src/modules/measurement/domain/e0-recovery.js';

test('E0 recupera estágio com viés < 0,1, MAE < 0,25 e cobertura 90% ≥ 0,85', () => {
  const report = runE0Recovery({
    replications: 200,
    respondents: 12,
    testlets: 3,
    seed: 42,
  });
  assert.ok(report.absBias < 0.1, `viés absoluto ${report.absBias}`);
  assert.ok(report.mae < 0.25, `MAE ${report.mae}`);
  assert.ok(report.coverage90 >= 0.85, `cobertura ${report.coverage90}`);
  assert.equal(report.passes, true);
  assert.equal(report.replications, 200);
});

test('E0 com amostra mínima demais falha o MAE de recuperação', () => {
  const weak = runE0Recovery({
    replications: 120,
    respondents: 2,
    testlets: 1,
    seed: 7,
  });
  assert.ok(weak.mae >= 0.25, `MAE fraco ${weak.mae}`);
  assert.equal(weak.passes, false);
});
