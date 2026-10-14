import assert from 'node:assert/strict';
import { test } from 'node:test';
import { disciplineColumns, projectMapLegend, projectPerspectiveMatrix, projectStructureMatrix } from '../src/modules/inference/domain/map-matrix.js';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import { renderMapPage } from '../src/modules/projects/diagnostic-report-view.js';

const columns = disciplineColumns(OrganizationalAreaProjector.empty());

test('matriz de estrutura pinta a célula que o domínio publicou e não um zero', () => {
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
  assert.match(html, /Times × capacidades, na ordem da estrutura, não por resultado/);
  assert.match(html, /Entrega/);
  assert.doesNotMatch(html, /0%/);
  assert.doesNotMatch(html, />0</);
  const gama = html.slice(html.indexOf('Gama'), html.indexOf('Delta'));
  assert.match(gama, /coverage-gap/);
  assert.doesNotMatch(gama, /índice não publicado/);
  const delta = html.slice(html.indexOf('Delta'));
  assert.match(delta, /index-gap/);
  assert.match(delta, /coverage-gap/);
});

test('matriz de perspectiva desenha os dois relatos e omite quem ficou abaixo do limiar', () => {
  const perspectives = projectPerspectiveMatrix({
    minimum: 5,
    columns,
    samples: [
      { label: 'Gestão', completed: 6, readings: [{ capabilityId: 'work-management', signals: 4, mean: 1.4 }] },
      { label: 'Engenharia', completed: 6, readings: [{ capabilityId: 'work-management', signals: 4, mean: -1.2 }] },
      { label: 'Dados', completed: 3, readings: [] },
    ],
  });
  const html = renderMapPage({
    map: OrganizationalAreaProjector.empty(),
    cut: 'per',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    perspectives,
  });
  assert.match(html, /Não mostra quem está certo/);
  assert.match(html, /Gestão descreve um sistema mais folgado/);
  assert.match(html, /Engenharia descreve a restrição no mesmo recorte/);
  assert.match(html, /Sem linha própria/);
  assert.match(html, /Dados teve menos de 5 pessoas/);
  assert.doesNotMatch(html, /0%/);
  assert.doesNotMatch(html, /Dados \(3\)/);
});

test('sistema não atravessado não abre disciplinas e a legenda omite o alvo sem publicação', () => {
  const map = OrganizationalAreaProjector.project({
    capabilities: [{ id: 'work-management', label: 'Fluxo', level: 1, confidence: .8, evidence: 4, hasContradiction: false, coverage: 1 }],
    findings: [],
  });
  const html = renderMapPage({
    map,
    cut: 'cap',
    areaBase: '/areas',
    capabilityBase: '/capabilities',
    legend: projectMapLegend(undefined),
  });
  const product = html.slice(html.indexOf('data-area="product"'), html.indexOf('data-area="engineering"'));
  const engineering = html.slice(html.indexOf('data-area="engineering"'), html.indexOf('data-area="operations"'));
  assert.match(product, /entrevista não atravessou/);
  assert.doesNotMatch(product, /area-chip/);
  assert.match(engineering, /area-chip/);
  assert.match(engineering, /Entrega/);
  assert.match(html, /Estimativa, faixa e alvo só entram quando o modelo publicar/);
  assert.doesNotMatch(html, /legend-target/);
  assert.doesNotMatch(html, /45%/);
});
