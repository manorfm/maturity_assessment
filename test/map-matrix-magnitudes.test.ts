/**
 * Mapa 6d — matrizes com magnitude + interpretação de divergência (contrato CONTRATO_OK).
 * Critérios UX 11–13 (green UX pós EXPERIENCIA_REPROVADA): CSS text-align left
 * com especificidade sobre a tabela; pts em `.divergence-distance` ≤12px;
 * interpretation fora do empilhamento estreito.
 *
 * APIs/casca:
 * - `MapCell` estimate + divergence tipada
 * - `renderCells` estimate (%) e “divergência · N pts”
 * - CSS `.report-matrix td.divergence-cell` + `.divergence-distance`
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  disciplineColumns,
  mapCopy,
  projectEngineeringDomains,
  projectMapRadars,
  projectPerspectiveMatrix,
  projectStructureMatrix,
  type MapColumn,
  type MapOverview,
  type PerspectiveMatrix,
  type StructureMatrix,
} from '../src/modules/inference/domain/map-matrix.js';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import { renderMapPage } from '../src/modules/projects/diagnostic-report-view.js';
import { layout } from '../src/shared/html.js';

function cssRuleBody(served: string, selector: RegExp): string {
  const match = served.match(selector);
  assert.ok(match?.[1], `regra CSS não encontrada: ${selector}`);
  return match[1]!.replace(/\s+/g, '');
}

type StructureCapability = {
  id: string;
  coverage: number;
  index?: number;
  band?: [number, number];
  level?: number;
};

type StructureUnit = {
  path: string;
  completed: number;
  capabilities: StructureCapability[];
};

type ProjectStructureMatrix = (input: {
  minimum: number;
  columns: MapColumn[];
  units: StructureUnit[];
}) => StructureMatrix;

type PerspectiveReading = {
  capabilityId: string;
  signals: number;
  mean: number;
  index?: number;
};

type PerspectiveSampleInput = {
  label: string;
  completed: number;
  readings: PerspectiveReading[];
};

type ProjectPerspectiveMatrix = (input: {
  minimum: number;
  columns: MapColumn[];
  samples: PerspectiveSampleInput[];
}) => PerspectiveMatrix;

type EstimateCell = {
  kind: 'estimate';
  index: number;
  band?: [number, number];
  coverage?: number;
};

type DivergenceCell = {
  kind: 'divergence';
  left: string;
  right: string;
  distancePoints?: number;
  interpretation?: string;
};

const map = OrganizationalAreaProjector.empty();
const columns = disciplineColumns(map);
const deliveryIndex = columns.findIndex((column) => column.id === 'delivery');

const gapOverview: MapOverview = {
  lead: 'Ainda não há achado publicado para localizar o problema no mapa.',
  technology: { published: false, gap: 'Menos de 5 respondentes neste recorte.' },
  systems: [
    { id: 'product', label: 'Produto', status: 'entrevista não atravessou', gap: 'Sem índice publicado neste sistema.' },
    { id: 'engineering', label: 'Engenharia', status: 'entrevista não atravessou', gap: 'Sem índice publicado neste sistema.' },
    { id: 'operations', label: 'Operação', status: 'entrevista não atravessou', gap: 'Sem índice publicado neste sistema.' },
    { id: 'organization', label: 'Organização', status: 'entrevista não atravessou', gap: 'Sem índice publicado neste sistema.' },
  ],
  method: 'Sistemas na ordem do modelo, não por resultado.',
  notice: 'Este diagnóstico descreve o sistema de trabalho. Não use para avaliar pessoas.',
};

const gapDomains = projectEngineeringDomains({ map });
const gapRadars = projectMapRadars({ map });

function asStructureProjector(): ProjectStructureMatrix {
  return projectStructureMatrix as unknown as ProjectStructureMatrix;
}

function asPerspectiveProjector(): ProjectPerspectiveMatrix {
  return projectPerspectiveMatrix as unknown as ProjectPerspectiveMatrix;
}

function deliveryCell(matrix: StructureMatrix | PerspectiveMatrix) {
  const row = matrix.rows.find((candidate) => candidate.label === 'Delta')
    ?? matrix.rows[0];
  assert.ok(row, 'linha esperada na matriz');
  assert.ok(deliveryIndex >= 0, 'coluna delivery presente');
  return row.cells[deliveryIndex];
}

function structureWithEstimateFixture(): StructureMatrix {
  const uncovered = { kind: 'uncovered' as const };
  const unpublished = { kind: 'unpublished' as const };
  const estimate: EstimateCell = {
    kind: 'estimate',
    index: 41,
    band: [30, 50],
    coverage: 1,
  };
  return {
    columns,
    rows: [
      {
        label: 'Gama',
        completed: 2,
        cells: columns.map(() => uncovered),
      },
      {
        label: 'Delta',
        completed: 9,
        cells: columns.map((column) => (column.id === 'delivery' ? estimate : unpublished)),
      },
    ],
  };
}

function structureWithoutBandFixture(): StructureMatrix {
  const uncovered = { kind: 'uncovered' as const };
  const estimate: EstimateCell = { kind: 'estimate', index: 41, coverage: 1 };
  return {
    columns,
    rows: [
      {
        label: 'Delta',
        completed: 9,
        cells: columns.map((column) => (column.id === 'delivery' ? estimate : uncovered)),
      },
    ],
  };
}

function perspectivesWithDistanceFixture(): PerspectiveMatrix {
  const divergence: DivergenceCell = {
    kind: 'divergence',
    left: 'Gestão descreve um sistema mais folgado.',
    right: 'Engenharia descreve a restrição no mesmo recorte.',
    distancePoints: 17,
    interpretation: 'Quem decide vê mais folga; quem opera vê a restrição no mesmo recorte.',
  };
  return {
    columns,
    rows: [
      {
        label: 'Gestão',
        completed: 6,
        cells: columns.map((column) => (
          column.id === 'delivery' ? divergence : { kind: 'uncovered' as const }
        )),
      },
      {
        label: 'Engenharia',
        completed: 6,
        cells: columns.map((column) => (
          column.id === 'delivery' ? divergence : { kind: 'uncovered' as const }
        )),
      },
    ],
    withoutOwnRow: [{ label: 'Dados', completed: 3 }],
    withheld: 'Dados teve menos de 5 pessoas. As respostas entram só no total.',
    notice: mapCopy.perspectiveLead,
  };
}

function perspectivesTextualFixture() {
  return projectPerspectiveMatrix({
    minimum: 5,
    columns,
    samples: [
      { label: 'Gestão', completed: 6, readings: [{ capabilityId: 'work-management', signals: 4, mean: 1.4 }] },
      { label: 'Engenharia', completed: 6, readings: [{ capabilityId: 'work-management', signals: 4, mean: -1.2 }] },
      { label: 'Dados', completed: 3, readings: [] },
    ],
  });
}

function regressionStructureFixture() {
  return projectStructureMatrix({
    minimum: 5,
    columns,
    units: [
      { path: 'Org/Gama', completed: 2, capabilities: [] },
      { path: 'Org/Delta', completed: 9, capabilities: [{ id: 'work-management', coverage: 1 }] },
    ],
  });
}

test('estrutura com index publicado vira estimate; coberta sem index fica unpublished', () => {
  const project = asStructureProjector();
  const withIndex = project({
    minimum: 5,
    columns,
    units: [
      {
        path: 'Org/Delta',
        completed: 9,
        capabilities: [{ id: 'work-management', coverage: 1, index: 41, band: [30, 50] }],
      },
    ],
  });
  const estimateCell = deliveryCell(withIndex) as EstimateCell | { kind: string };
  assert.equal(estimateCell.kind, 'estimate');
  assert.equal((estimateCell as EstimateCell).index, 41);

  const withoutIndex = project({
    minimum: 5,
    columns,
    units: [
      {
        path: 'Org/Delta',
        completed: 9,
        capabilities: [{ id: 'work-management', coverage: 1 }],
      },
    ],
  });
  assert.equal(deliveryCell(withoutIndex)?.kind, 'unpublished');

  const belowMinimum = project({
    minimum: 5,
    columns,
    units: [
      {
        path: 'Org/Gama',
        completed: 2,
        capabilities: [{ id: 'work-management', coverage: 1, index: 41, band: [30, 50] }],
      },
    ],
  });
  const gama = belowMinimum.rows.find((row) => row.label === 'Gama');
  assert.ok(gama);
  assert.equal(gama.cells[deliveryIndex]?.kind, 'uncovered');
});

test('estimate nunca inventa index a partir de level ou coverage', () => {
  const project = asStructureProjector();
  const matrix = project({
    minimum: 5,
    columns,
    units: [
      {
        path: 'Org/Delta',
        completed: 9,
        capabilities: [{ id: 'work-management', coverage: 1, level: 2 }],
      },
    ],
  });
  const cell = deliveryCell(matrix);
  assert.notEqual(cell?.kind, 'estimate');
  assert.equal(cell?.kind, 'unpublished');
  assert.equal(JSON.stringify(matrix).includes('%'), false);
  assert.equal(JSON.stringify(matrix).includes('"index"'), false);
});

test('estimate carrega band e coverage opcionais sem inventar', () => {
  const project = asStructureProjector();
  const withBand = project({
    minimum: 5,
    columns,
    units: [
      {
        path: 'Org/Delta',
        completed: 9,
        capabilities: [{ id: 'work-management', coverage: 1, index: 41, band: [30, 50] }],
      },
    ],
  });
  const cell = deliveryCell(withBand) as EstimateCell;
  assert.equal(cell.kind, 'estimate');
  assert.equal(cell.index, 41);
  assert.deepEqual(cell.band, [30, 50]);
  assert.equal(cell.coverage, 1);

  const withoutBand = project({
    minimum: 5,
    columns,
    units: [
      {
        path: 'Org/Delta',
        completed: 9,
        capabilities: [{ id: 'work-management', coverage: 1, index: 58 }],
      },
    ],
  });
  const bare = deliveryCell(withoutBand) as EstimateCell;
  assert.equal(bare.kind, 'estimate');
  assert.equal(bare.index, 58);
  assert.equal('band' in bare && bare.band !== undefined, false);
  assert.notDeepEqual(bare.band, [0, 0]);
});

test('divergência com magnitudes opcionais publica distancePoints arredondado e interpretation', () => {
  const project = asPerspectiveProjector();
  const matrix = project({
    minimum: 5,
    columns,
    samples: [
      {
        label: 'Gestão',
        completed: 6,
        readings: [{ capabilityId: 'work-management', signals: 4, mean: 1.4, index: 58 }],
      },
      {
        label: 'Engenharia',
        completed: 6,
        readings: [{ capabilityId: 'work-management', signals: 4, mean: -1.2, index: 41 }],
      },
    ],
  });
  const cell = deliveryCell(matrix) as DivergenceCell;
  assert.equal(cell.kind, 'divergence');
  assert.equal(cell.distancePoints, 17);
  assert.ok(typeof cell.interpretation === 'string' && cell.interpretation.length > 0);
  assert.match(cell.interpretation, /folga|folgado|restri/i);
  assert.match(cell.interpretation, /Gestão|Engenharia/);
  assert.equal(cell.interpretation.includes('Orbital'), false);
  assert.equal(cell.interpretation.includes('Pix'), false);
  assert.equal(cell.interpretation.includes('Conta Digital'), false);
  assert.equal(cell.interpretation.includes('CTO'), false);
});

test('divergência sem magnitudes permanece textual sem distancePoints', () => {
  const project = asPerspectiveProjector();
  const textual = project({
    minimum: 5,
    columns,
    samples: [
      { label: 'Gestão', completed: 6, readings: [{ capabilityId: 'work-management', signals: 4, mean: 1.4 }] },
      { label: 'Engenharia', completed: 6, readings: [{ capabilityId: 'work-management', signals: 4, mean: -1.2 }] },
    ],
  });
  const cell = deliveryCell(textual) as DivergenceCell;
  assert.equal(cell.kind, 'divergence');
  assert.equal('distancePoints' in cell && cell.distancePoints !== undefined, false);
  assert.equal('interpretation' in cell && cell.interpretation !== undefined, false);
  assert.match(cell.left, /Gestão/);
  assert.match(cell.right, /Engenharia/);
  assert.equal(`${cell.left} ${cell.right}`.includes('%'), false);

  const oneSide = project({
    minimum: 5,
    columns,
    samples: [
      {
        label: 'Gestão',
        completed: 6,
        readings: [{ capabilityId: 'work-management', signals: 4, mean: 1.4, index: 58 }],
      },
      {
        label: 'Engenharia',
        completed: 6,
        readings: [{ capabilityId: 'work-management', signals: 4, mean: -1.2 }],
      },
    ],
  });
  const partial = deliveryCell(oneSide) as DivergenceCell;
  assert.equal(partial.kind, 'divergence');
  assert.equal('distancePoints' in partial && partial.distancePoints !== undefined, false);
  assert.equal('interpretation' in partial && partial.interpretation !== undefined, false);
});

test('mapCopy.structureLead menciona hover e faixa', () => {
  assert.match(mapCopy.structureLead, /mouse|hover|passe/i);
  assert.match(mapCopy.structureLead, /faixa/i);
});

test('renderCells estimate mostra index% e title/aria com faixa e cobertura', () => {
  const html = renderMapPage({
    map,
    cut: 'est',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    overview: gapOverview,
    engineeringDomains: gapDomains,
    mapRadars: gapRadars,
    structure: structureWithEstimateFixture() as StructureMatrix,
  });
  const delta = html.slice(html.indexOf('Delta'));
  assert.match(delta, /41%/);
  assert.match(delta, /title="[^"]*"|aria-label="[^"]*"/);
  assert.match(delta, /30|50|faixa/i);
  assert.match(delta, /cobertura|coverage/i);
  assert.match(html, /coverage-gap/);
  assert.match(html, /índice não publicado|coverage-cell/);

  const withoutBand = renderMapPage({
    map,
    cut: 'est',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    overview: gapOverview,
    engineeringDomains: gapDomains,
    mapRadars: gapRadars,
    structure: structureWithoutBandFixture() as StructureMatrix,
  });
  assert.match(withoutBand, /41%/);
  const titleOrAria = withoutBand.match(/(?:title|aria-label)="([^"]*)"/g)?.join(' ') ?? '';
  assert.equal(/faixa\s*0\s*[–-]\s*0/i.test(titleOrAria), false);
});

test('renderCells divergence mostra losango, textos, divergência · N pts e interpretation', () => {
  const withDistance = renderMapPage({
    map,
    cut: 'per',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    overview: gapOverview,
    engineeringDomains: gapDomains,
    mapRadars: gapRadars,
    perspectives: perspectivesWithDistanceFixture() as PerspectiveMatrix,
  });
  assert.match(withDistance, /divergence-cell/);
  assert.match(withDistance, /<[^>]+aria-hidden="true"[^>]*>◆<\/[^>]+>/);
  assert.match(withDistance, /Gestão descreve um sistema mais folgado/);
  assert.match(withDistance, /Engenharia descreve a restrição no mesmo recorte/);
  assert.match(withDistance, /divergência · 17 pts/);
  // interpretation pode ir para title/aria ou .divergence-interpretation (UX 13)
  assert.match(withDistance, /Quem decide vê mais folga|quem opera vê a restrição/i);

  const textual = renderMapPage({
    map,
    cut: 'per',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    overview: gapOverview,
    engineeringDomains: gapDomains,
    mapRadars: gapRadars,
    perspectives: perspectivesTextualFixture(),
  });
  assert.match(textual, /◆/);
  assert.equal(textual.includes('divergência ·'), false);
});

test('anti-mock: HTML e fixtures sem Orbital, 13%, 24%, Pix, Conta Digital, Integração contínua fixa', () => {
  const structure = structureWithEstimateFixture();
  const perspectives = perspectivesWithDistanceFixture();
  const htmlEst = renderMapPage({
    map,
    cut: 'est',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    overview: gapOverview,
    engineeringDomains: gapDomains,
    mapRadars: gapRadars,
    structure: structure as StructureMatrix,
  });
  const htmlPer = renderMapPage({
    map,
    cut: 'per',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    overview: gapOverview,
    engineeringDomains: gapDomains,
    mapRadars: gapRadars,
    perspectives: perspectives as PerspectiveMatrix,
  });
  const blob = [
    JSON.stringify(structure),
    JSON.stringify(perspectives),
    htmlEst,
    htmlPer,
    mapCopy.structureLead,
  ].join('\n');
  assert.doesNotMatch(blob, /Orbital/);
  assert.doesNotMatch(blob, /13%/);
  assert.doesNotMatch(blob, /24%/);
  assert.doesNotMatch(blob, /\bPix\b/);
  assert.doesNotMatch(blob, /Conta Digital/);
  assert.doesNotMatch(blob, /Integração contínua/);
});

test('regressão: cortes uncovered/unpublished e divergência sem magnitude e withholding <N', () => {
  const structure = regressionStructureFixture();
  const gama = structure.rows.find((row) => row.label === 'Gama');
  const delta = structure.rows.find((row) => row.label === 'Delta');
  assert.ok(gama);
  assert.ok(delta);
  assert.ok(gama.cells.every((cell) => cell.kind === 'uncovered'));
  assert.equal(delta.cells[deliveryIndex]?.kind, 'unpublished');

  const perspectives = perspectivesTextualFixture();
  assert.deepEqual(perspectives.rows.map((row) => row.label), ['Gestão', 'Engenharia']);
  assert.deepEqual(perspectives.withoutOwnRow, [{ label: 'Dados', completed: 3 }]);
  assert.match(perspectives.withheld ?? '', /Dados teve menos de 5 pessoas/);
  assert.match(perspectives.withheld ?? '', /entram só no total/);
  const cell = deliveryCell(perspectives) as DivergenceCell;
  assert.equal(cell.kind, 'divergence');
  assert.equal('distancePoints' in cell && cell.distancePoints !== undefined, false);
  assert.match(perspectives.notice, /Não mostra quem está certo/);

  const htmlEst = renderMapPage({
    map,
    cut: 'est',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    overview: gapOverview,
    engineeringDomains: gapDomains,
    mapRadars: gapRadars,
    structure,
  });
  assert.match(htmlEst, /Gama/);
  assert.match(htmlEst, /Delta/);
  assert.match(htmlEst, /coverage-gap/);
  assert.match(htmlEst, /coverage-cell/);
  assert.equal(htmlEst.includes('41%'), false);

  const htmlPer = renderMapPage({
    map,
    cut: 'per',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    overview: gapOverview,
    engineeringDomains: gapDomains,
    mapRadars: gapRadars,
    perspectives,
  });
  assert.match(htmlPer, /divergence-cell/);
  assert.equal(htmlPer.includes('divergência ·'), false);
  assert.match(htmlPer, /Sem linha própria/);
  assert.match(htmlPer, /Dados/);
});

test('CSS report-matrix td.divergence-cell declara text-align left com especificidade sobre a tabela', () => {
  const served = layout('Mapa', '');
  const rule = cssRuleBody(served, /\.report-matrix\s+td\.divergence-cell\s*\{([^}]+)\}/);
  assert.match(rule, /text-align:\s*left/);
});

test('divergência com magnitudes renderiza pts em divergence-distance com font-size ≤12px', () => {
  const withDistance = renderMapPage({
    map,
    cut: 'per',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    overview: gapOverview,
    engineeringDomains: gapDomains,
    mapRadars: gapRadars,
    perspectives: perspectivesWithDistanceFixture() as PerspectiveMatrix,
  });
  assert.match(withDistance, /class="[^"]*divergence-distance[^"]*"/);
  assert.match(withDistance, /divergência · 17 pts/);

  const served = layout('Mapa', '');
  const rule = cssRuleBody(served, /\.divergence-distance\s*\{([^}]+)\}/);
  const size = rule.match(/font-size:(\d+(?:\.\d+)?)px/);
  assert.ok(size, 'font-size numérico em px esperado em .divergence-distance');
  assert.ok(Number(size![1]) <= 12, `font-size ${size![1]}px deve ser ≤12px`);

  const textual = renderMapPage({
    map,
    cut: 'per',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    overview: gapOverview,
    engineeringDomains: gapDomains,
    mapRadars: gapRadars,
    perspectives: perspectivesTextualFixture(),
  });
  assert.equal(textual.includes('divergence-distance'), false);
});

test('interpretation com magnitudes fica escapada fora do empilhamento estreito', () => {
  const interpretation = 'Quem decide vê mais folga; quem opera vê a restrição no mesmo recorte.';
  const withDistance = renderMapPage({
    map,
    cut: 'per',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    overview: gapOverview,
    engineeringDomains: gapDomains,
    mapRadars: gapRadars,
    perspectives: perspectivesWithDistanceFixture() as PerspectiveMatrix,
  });
  assert.match(withDistance, /Quem decide vê mais folga|quem opera vê a restrição/i);

  const cellOpen = withDistance.match(/<td[^>]*class="[^"]*divergence-cell[^"]*"[^>]*>/);
  assert.ok(cellOpen, 'td.divergence-cell esperado');
  const onCell = /(?:title|aria-label)="[^"]*Quem decide vê mais folga[^"]*"/i.test(cellOpen![0])
    || /(?:title|aria-label)="[^"]*quem opera vê a restrição[^"]*"/i.test(cellOpen![0]);
  const viaClass = /class="[^"]*divergence-interpretation[^"]*"/.test(withDistance);
  assert.ok(onCell || viaClass, 'interpretation em title/aria do td ou .divergence-interpretation');

  assert.doesNotMatch(
    withDistance,
    new RegExp(`<p>\\s*${interpretation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*</p>`),
  );

  const textual = renderMapPage({
    map,
    cut: 'per',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    overview: gapOverview,
    engineeringDomains: gapDomains,
    mapRadars: gapRadars,
    perspectives: perspectivesTextualFixture(),
  });
  assert.equal(textual.includes('divergence-interpretation'), false);
  assert.doesNotMatch(textual, /Quem decide vê mais folga/);
});
