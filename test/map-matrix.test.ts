import assert from 'node:assert/strict';
import { test } from 'node:test';
import { disciplineColumns, projectMapLegend, projectPerspectiveMatrix, projectStructureMatrix } from '../src/modules/inference/domain/map-matrix.js';
import { projectSystemTiles } from '../src/modules/inference/domain/organizational-areas.js';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';

const columns = disciplineColumns(OrganizationalAreaProjector.empty());
const entrega = columns.find((column) => column.id === 'delivery');
const direcao = columns.find((column) => column.id === 'product-direction');

test('célula de estrutura nasce da cobertura da disciplina, não de um texto único para a linha', () => {
  assert.ok(entrega);
  assert.ok(direcao);
  const matrix = projectStructureMatrix({
    minimum: 5,
    columns,
    units: [
      { path: 'Org/Gama', completed: 2, capabilities: [] },
      { path: 'Org/Delta', completed: 9, capabilities: [{ id: 'work-management', coverage: 1 }] },
    ],
  });
  const gama = matrix.rows.find((row) => row.label === 'Gama');
  const delta = matrix.rows.find((row) => row.label === 'Delta');
  assert.ok(gama);
  assert.ok(delta);
  assert.ok(gama.cells.every((cell) => cell.kind === 'uncovered'));
  const deltaEntrega = delta.cells[columns.findIndex((column) => column.id === 'delivery')];
  const deltaDirecao = delta.cells[columns.findIndex((column) => column.id === 'product-direction')];
  assert.equal(deltaEntrega?.kind, 'unpublished');
  assert.equal(deltaDirecao?.kind, 'uncovered');
  assert.equal(JSON.stringify(matrix).includes('0%'), false);
});

test('perspectiva abaixo do limiar não ganha linha e divergência não publica vencedor nem índice', () => {
  assert.ok(entrega);
  const matrix = projectPerspectiveMatrix({
    minimum: 5,
    columns,
    samples: [
      { label: 'Gestão', completed: 6, readings: [{ capabilityId: 'work-management', signals: 4, mean: 1.4 }] },
      { label: 'Engenharia', completed: 6, readings: [{ capabilityId: 'work-management', signals: 4, mean: -1.2 }] },
      { label: 'Dados', completed: 3, readings: [{ capabilityId: 'work-management', signals: 2, mean: 0 }] },
    ],
  });
  assert.deepEqual(matrix.rows.map((row) => row.label), ['Gestão', 'Engenharia']);
  assert.deepEqual(matrix.withoutOwnRow, [{ label: 'Dados', completed: 3 }]);
  assert.match(matrix.withheld ?? '', /Dados teve menos de 5 pessoas/);
  assert.match(matrix.withheld ?? '', /entram só no total/);
  const cell = matrix.rows[0]?.cells[columns.findIndex((column) => column.id === 'delivery')];
  assert.equal(cell?.kind, 'divergence');
  if (cell?.kind !== 'divergence') return;
  assert.match(cell.left, /Gestão/);
  assert.match(cell.right, /Engenharia/);
  assert.match(matrix.notice, /Não mostra quem está certo/);
  assert.equal(`${cell.left} ${cell.right}`.includes('%'), false);
  const security = matrix.rows[0]?.cells[columns.findIndex((column) => column.id === 'security')];
  assert.equal(security?.kind, 'uncovered');
});

test('sistema observado abre disciplinas e o não atravessado não publica nota', () => {
  const map = OrganizationalAreaProjector.project({
    capabilities: [{ id: 'work-management', label: 'Fluxo', level: 1, confidence: .8, evidence: 4, hasContradiction: false, coverage: 1 }],
    findings: [],
  });
  const tiles = projectSystemTiles(map);
  const engineering = tiles.find((tile) => tile.id === 'engineering');
  const product = tiles.find((tile) => tile.id === 'product');
  assert.equal(engineering?.observed, true);
  assert.ok(engineering?.disciplines.some((discipline) => discipline.label === 'Entrega'));
  assert.equal(product?.observed, false);
  assert.equal(product?.status, 'entrevista não atravessou');
  assert.deepEqual(product?.disciplines, []);
});

test('legenda publica estimativa e faixa, e o alvo só quando o modelo o publica', () => {
  const missing = projectMapLegend(undefined);
  assert.deepEqual(missing.marks, []);
  assert.match(missing.gap ?? '', /estimativa/i);
  assert.match(missing.gap ?? '', /alvo/i);
  assert.equal((missing.gap ?? '').includes('%'), false);
  const withoutTarget = projectMapLegend({ published: true, index: 27, band: [21, 34], coverage: .7 });
  assert.deepEqual(withoutTarget.marks.map((mark) => mark.id), ['estimate', 'band']);
  const withTarget = projectMapLegend({ published: true, index: 27, band: [21, 34], coverage: .7, target: 40 });
  assert.equal(withTarget.marks.find((mark) => mark.id === 'target')?.value, '40%');
  assert.equal(withTarget.gap, null);
});
