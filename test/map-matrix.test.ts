import assert from 'node:assert/strict';
import { test } from 'node:test';
import { disciplineColumns, projectPerspectiveMatrix, projectStructureMatrix } from '../src/modules/inference/domain/map-matrix.js';
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
