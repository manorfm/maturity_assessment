import assert from 'node:assert/strict';
import { test } from 'node:test';
import { disciplineColumns, projectStructureMatrix } from '../src/modules/inference/domain/map-matrix.js';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import { renderMapPage } from '../src/modules/projects/diagnostic-report-view.js';
import { layout } from '../src/shared/html.js';

function cssRuleBody(served: string, selector: RegExp): string {
  const match = served.match(selector);
  assert.ok(match?.[1], `regra CSS não encontrada: ${selector}`);
  return match[1]!.replace(/\s+/g, '');
}

test('célula uncovered e swatch amarram SCobertura (--na e radius 4px)', () => {
  const served = layout('Mapa', '');
  const gap = cssRuleBody(served, /\.coverage-gap\s*\{([^}]+)\}/);
  assert.match(gap, /var\(--na\)/);
  assert.match(gap, /var\(--na-ink\)/);
  assert.match(gap, /border-radius:4px/);

  const swatch = cssRuleBody(served, /\.coverage-swatch\s*\{([^}]+)\}/);
  assert.match(swatch, /var\(--na\)/);
  assert.match(swatch, /border-radius:4px/);
});

test('eixo não avaliado do radar usa --na, não --unknown', () => {
  const served = layout('Mapa', '');
  const root = cssRuleBody(served, /:root\s*\{([^}]+)\}/);
  assert.match(root, /--na:#B9B2A7/i);
  assert.match(root, /--na-ink:#5E584E/i);

  const marker = cssRuleBody(served, /\.radar-marker-unassessed\s+circle\s*\{([^}]+)\}/);
  assert.match(marker, /stroke:var\(--na\)/);
  assert.doesNotMatch(marker, /var\(--unknown\)/);

  const question = cssRuleBody(served, /\.radar-question\s*\{([^}]+)\}/);
  assert.match(question, /fill:var\(--na\)/);
  assert.doesNotMatch(question, /var\(--unknown\)/);

  const axis = cssRuleBody(served, /\.radar-axis-unassessed\s*\{([^}]+)\}/);
  assert.match(axis, /fill:var\(--na\)/);
  assert.doesNotMatch(axis, /var\(--unknown\)/);
});

test('mapa estrutural sem cobertura usa coverage-gap e não inventa exemplo', () => {
  const columns = disciplineColumns(OrganizationalAreaProjector.empty());
  const structure = projectStructureMatrix({
    minimum: 5,
    columns,
    units: [
      { path: 'Org/Gama', completed: 2, capabilities: [] },
      { path: 'Org/Delta', completed: 9, capabilities: [{ id: 'work-management', coverage: 1 }] },
    ],
  });
  const html = renderMapPage({
    map: OrganizationalAreaProjector.empty(),
    cut: 'est',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    structure,
  });
  const gama = html.slice(html.indexOf('Gama'), html.indexOf('Delta'));
  assert.match(gama, /coverage-gap/);
  assert.doesNotMatch(gama, /índice não publicado/);
  const delta = html.slice(html.indexOf('Delta'));
  assert.match(delta, /index-gap/);
  assert.match(delta, /coverage-gap/);
  assert.doesNotMatch(html, /Orbital/);
  assert.doesNotMatch(html, /13%/);
});
