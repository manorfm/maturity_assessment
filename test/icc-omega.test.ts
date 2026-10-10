import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  estimateIcc1,
  icc2,
  omegaForLeaf,
  omegaFromIcc1,
  respondentsForIcc2,
} from '../src/modules/measurement/domain/icc.js';

/** Tabela 09 §4 — ICC(2) por ICC(1) e k. */
const table09: Array<{ icc1: number; k: number; icc2: number; kFor70: number }> = [
  { icc1: 0.05, k: 5, icc2: 0.21, kFor70: 45 },
  { icc1: 0.05, k: 8, icc2: 0.30, kFor70: 45 },
  { icc1: 0.05, k: 10, icc2: 0.34, kFor70: 45 },
  { icc1: 0.05, k: 15, icc2: 0.44, kFor70: 45 },
  { icc1: 0.05, k: 20, icc2: 0.51, kFor70: 45 },
  { icc1: 0.1, k: 5, icc2: 0.36, kFor70: 21 },
  { icc1: 0.1, k: 8, icc2: 0.47, kFor70: 21 },
  { icc1: 0.1, k: 10, icc2: 0.53, kFor70: 21 },
  { icc1: 0.1, k: 15, icc2: 0.62, kFor70: 21 },
  { icc1: 0.1, k: 20, icc2: 0.69, kFor70: 21 },
  { icc1: 0.15, k: 5, icc2: 0.47, kFor70: 14 },
  { icc1: 0.15, k: 10, icc2: 0.64, kFor70: 14 },
  { icc1: 0.15, k: 15, icc2: 0.73, kFor70: 14 },
  { icc1: 0.2, k: 5, icc2: 0.56, kFor70: 10 },
  { icc1: 0.2, k: 10, icc2: 0.71, kFor70: 10 },
  { icc1: 0.3, k: 5, icc2: 0.68, kFor70: 6 },
  { icc1: 0.3, k: 8, icc2: 0.77, kFor70: 6 },
  { icc1: 0.3, k: 10, icc2: 0.81, kFor70: 6 },
];

test('ICC(2) e k para alvo 0,70 reproduzem a tabela 09 §4', () => {
  for (const row of table09) {
    assert.equal(Number(icc2(row.icc1, row.k).toFixed(2)), row.icc2, `icc2(${row.icc1},${row.k})`);
    assert.equal(respondentsForIcc2(row.icc1, 0.7), row.kFor70, `k(${row.icc1})`);
  }
});

test('ω cai quando ICC(1) sobe (pooling fraco entre unidades distintas)', () => {
  assert.equal(omegaFromIcc1(0), 1);
  assert.equal(omegaFromIcc1(0.3), 0.7);
  assert.equal(omegaFromIcc1(0.5), 0.5);
  assert.equal(omegaFromIcc1(1), 0);
});

test('estimateIcc1 sobe quando unidades divergem e cai quando são iguais', () => {
  const similar = [
    [2, 2, 2, 2],
    [2, 2, 2, 2],
    [2, 2, 2, 2],
  ];
  const divergent = [
    [0, 0, 0, 0],
    [2, 2, 2, 2],
    [4, 4, 4, 4],
  ];
  assert.ok(estimateIcc1(similar) < 0.05);
  assert.ok(estimateIcc1(divergent) > 0.8);
  assert.ok(omegaFromIcc1(estimateIcc1(divergent)) < omegaFromIcc1(estimateIcc1(similar)));
});

test('omegaForLeaf usa pooling por folha quando o lab exportou ω', () => {
  assert.equal(omegaForLeaf({ poolingDefault: 0.5 }, 'release-feedback'), 0.5);
  assert.equal(omegaForLeaf({
    poolingDefault: 0.5,
    pooling: { 'release-feedback': 0.8, 'leadership-management': 0.65 },
  }, 'release-feedback'), 0.8);
  assert.equal(omegaForLeaf({
    poolingDefault: 0.5,
    pooling: { 'release-feedback': 0.8 },
  }, 'work-management'), 0.5);
});
