import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import { renderMapPage } from '../src/modules/projects/diagnostic-report-view.js';

test('matriz de estrutura pinta célula abaixo do limiar como sem cobertura e não como zero', () => {
  const html = renderMapPage({
    map: OrganizationalAreaProjector.empty(),
    cut: 'est',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    units: [{ path: 'Org/Gama', completed: 2 }, { path: 'Org/Delta', completed: 9 }],
    perspectives: [],
  });
  assert.match(html, /Times × capacidades, na ordem da estrutura, não por resultado/);
  assert.match(html, /Fluxo de trabalho|Entrega/);
  assert.match(html, /class="coverage-gap"/);
  assert.match(html, /sem cobertura/);
  assert.match(html, /índice não publicado/);
  assert.doesNotMatch(html, /0%/);
  assert.doesNotMatch(html, />0</);
  assert.doesNotMatch(html, /agregado/);
  const gama = html.slice(html.indexOf('Gama'), html.indexOf('Delta'));
  assert.match(gama, /coverage-gap/);
  assert.doesNotMatch(gama, /índice não publicado/);
});
