import assert from 'node:assert/strict';
import { test } from 'node:test';
import { disciplineColumns, projectPerspectiveMatrix, projectStructureMatrix } from '../src/modules/inference/domain/map-matrix.js';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import { renderMapPage } from '../src/modules/projects/diagnostic-report-view.js';
import { layout } from '../src/shared/html.js';

const columns = disciplineColumns(OrganizationalAreaProjector.empty());

function cssRuleBody(served: string, selector: RegExp): string {
  const match = served.match(selector);
  assert.ok(match?.[1], `regra CSS não encontrada: ${selector}`);
  return match[1]!.replace(/\s+/g, '');
}

function structureFixture() {
  return projectStructureMatrix({
    minimum: 5,
    columns,
    units: [
      { path: 'Org/Gama', completed: 2, capabilities: [] },
      { path: 'Org/Delta', completed: 9, capabilities: [{ id: 'work-management', coverage: 1 }] },
    ],
  });
}

function perspectiveFixture() {
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

test('célula coberta (unpublished) ganha marca accent ChartMark, sem %', () => {
  const structure = structureFixture();
  const html = renderMapPage({
    map: OrganizationalAreaProjector.empty(),
    cut: 'est',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    structure,
  });
  const delta = html.slice(html.indexOf('Delta'));
  assert.match(delta, /coverage-cell/);
  assert.match(delta, /índice não publicado/);

  const served = layout('Mapa', '');
  const cell = cssRuleBody(served, /\.coverage-cell\s*\{([^}]+)\}/);
  assert.match(cell, /var\(--accent(?:-soft)?\)/);
  assert.match(cell, /border-radius:4px/);

  assert.doesNotMatch(html, /0%/);
  assert.doesNotMatch(html, /13%/);
  assert.doesNotMatch(html, /24%/);
  assert.doesNotMatch(html, /45%/);
  assert.doesNotMatch(html, /Orbital/);
});

test('uncovered e swatch NA permanecem SCobertura', () => {
  const structure = structureFixture();
  const html = renderMapPage({
    map: OrganizationalAreaProjector.empty(),
    cut: 'est',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    structure,
  });
  const gama = html.slice(html.indexOf('Gama'), html.indexOf('Delta'));
  assert.match(gama, /coverage-gap/);

  const served = layout('Mapa', '');
  const gap = cssRuleBody(served, /\.coverage-gap\s*\{([^}]+)\}/);
  assert.match(gap, /var\(--na\)/);
  assert.match(gap, /border-radius:4px/);

  const swatch = cssRuleBody(served, /\.coverage-swatch\s*\{([^}]+)\}/);
  assert.match(swatch, /var\(--na\)/);
  assert.match(swatch, /border-radius:4px/);
});

test('divergência marca ◆ + outline ink', () => {
  const perspectives = perspectiveFixture();
  const html = renderMapPage({
    map: OrganizationalAreaProjector.empty(),
    cut: 'per',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    perspectives,
  });
  assert.match(html, /divergence-cell/);
  assert.match(html, /<[^>]+aria-hidden="true"[^>]*>◆<\/[^>]+>/);
  assert.match(html, /Gestão descreve um sistema mais folgado/);
  assert.match(html, /Engenharia descreve a restrição no mesmo recorte/);

  const served = layout('Mapa', '');
  const cell = cssRuleBody(served, /\.divergence-cell\s*\{([^}]+)\}/);
  assert.match(cell, /outline/);
  assert.match(cell, /var\(--ink\)/);
  assert.match(cell, /var\(--accent(?:-soft)?\)/);

  assert.doesNotMatch(html, /Orbital/);
  assert.doesNotMatch(html, /13%/);
  assert.doesNotMatch(html, /24%/);
  assert.doesNotMatch(html, /45%/);
});

test('legenda estrutural: swatch coberto + swatch NA', () => {
  const structure = structureFixture();
  const html = renderMapPage({
    map: OrganizationalAreaProjector.empty(),
    cut: 'est',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    structure,
  });
  assert.match(html, /coverage-swatch/);
  assert.match(html, /covered-swatch/);

  const served = layout('Mapa', '');
  const na = cssRuleBody(served, /\.coverage-swatch\s*\{([^}]+)\}/);
  assert.match(na, /var\(--na\)/);

  const covered = cssRuleBody(served, /\.covered-swatch\s*\{([^}]+)\}/);
  assert.match(covered, /var\(--accent(?:-soft)?\)/);
});
