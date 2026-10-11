import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  classifySophisticationQuadrant,
  measureSophisticationPhase,
  projectSophisticationMatrix,
  sophisticationOutsideIndex,
} from '../src/modules/inference/domain/sophistication-matrix.js';
import { evidenceToAnchoredResponse } from '../src/modules/inference/domain/evidence-observation.js';
import type { EvidenceLink } from '../src/modules/catalog/evidence-contract.js';
import { projectAreaWalkthrough } from '../src/modules/inference/domain/area-walkthrough.js';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import { renderWalkthrough } from '../src/modules/projects/diagnostic-report-view.js';

test('matriz classifica os quatro quadrantes de 12 §1', () => {
  assert.equal(classifySophisticationQuadrant({ phase: 4, appropriation: 1 }), 'tool-without-culture');
  assert.equal(classifySophisticationQuadrant({ phase: 4, appropriation: 3 }), 'full-maturity');
  assert.equal(classifySophisticationQuadrant({ phase: 1, appropriation: 0 }), 'beginning');
  assert.equal(classifySophisticationQuadrant({ phase: 1, appropriation: 3 }), 'culture-without-tool');
});

test('comprar ferramenta (F sobe) não altera a âncora de apropriação do índice', () => {
  const appropriationOnly: EvidenceLink = {
    capability: 'observability-practice',
    pattern: 'deteccao-tardia',
    pillar: 'observabilidade',
    anchorStage: 1,
    discrimination: 'medium',
    layer: 'practice',
    constraint: 'none',
    role: 'primary',
  };
  const withTool: EvidenceLink = { ...appropriationOnly, sophistication: 4 };
  const a = evidenceToAnchoredResponse(appropriationOnly);
  const b = evidenceToAnchoredResponse(withTool);
  assert.equal(a.anchor, b.anchor);
  assert.equal(a.anchor, 1);
  assert.equal(sophisticationOutsideIndex(withTool), true);
  assert.equal(measureSophisticationPhase([4, 4, 4]), 4);
  assert.equal(measureSophisticationPhase([1]), 1);
});

test('walkthrough publica a matriz sofisticação × apropriação', () => {
  const findings = [{
    kind: 'correction' as const,
    pattern: 'incidente-detectado-por-cliente',
    detailCapability: 'incident-management',
    title: 'Incidente pelo cliente',
    cause: 'detecção tarde',
    intervention: 'plantão e telemetria',
    confidence: 0.9,
    priority: 0.8,
  }];
  const capabilities = [
    { id: 'incident-management', label: 'Incidentes', level: 1, coverage: 1 },
    { id: 'reliability-practice', label: 'Confiabilidade', level: 3, coverage: 1 },
  ];
  const map = OrganizationalAreaProjector.project({ capabilities: capabilities.map((c) => ({ ...c, confidence: 0.8, evidence: 3, hasContradiction: false })), findings });
  const operations = map.systems.find((system) => system.id === 'operations')!;
  const walk = projectAreaWalkthrough({
    area: operations,
    findings,
    capabilities,
    organizationalAreas: map,
    outcomeKind: 'correct',
    conducts: [],
    pulse: [],
    sophistication: [
      { leafId: 'incident-management', phase: 4, appropriation: 1 },
      { leafId: 'reliability-practice', phase: 1, appropriation: 3 },
    ],
  });
  const matrix = projectSophisticationMatrix([
    { leafId: 'incident-management', label: 'Incidentes', phase: 4, appropriation: 1 },
    { leafId: 'reliability-practice', label: 'Confiabilidade', phase: 1, appropriation: 3 },
  ]);
  assert.equal(matrix[0]?.quadrant, 'tool-without-culture');
  assert.equal(matrix[1]?.quadrant, 'culture-without-tool');
  assert.ok(walk.sections.where.some((line) => /F4|ferramenta sem cultura/i.test(line)));
  const html = renderWalkthrough(walk);
  assert.match(html, /F4|ferramenta sem cultura|Cultura sem ferramenta/i);
});
