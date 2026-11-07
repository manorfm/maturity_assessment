import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDatabase } from '../src/shared/database.js';
import { literacyWipChart } from '../src/modules/catalog/item-catalog.js';
import type { LiteracyItem } from '../src/modules/catalog/item-types.js';
import { InferenceService } from '../src/modules/inference/inference-service.js';
import { runOrganizationalSynthetic } from '../src/modules/inference/domain/organizational-synthetic.js';
import { projectDiagnosticLaudo } from '../src/modules/inference/domain/diagnostic-report.js';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import { renderLaudo } from '../src/modules/projects/diagnostic-report-view.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';

type LiteracySeries = {
  stages: readonly string[];
  values: Readonly<Record<string, readonly number[]>>;
};

test('relatório não desenha a série do estímulo de leitura', () => {
  const db = createDatabase(':memory:');
  const { projectId } = runOrganizationalSynthetic(db, { band: 'medium' });
  const report = new InferenceService(db).report(projectId, 5);

  assert.ok(report.literacy);
  assert.equal(report.literacy.published, true);
  assert.equal('series' in report.literacy, false);
  assert.equal('stages' in report.literacy, false);
  assert.equal('values' in report.literacy, false);
  for (const key of Object.keys(report.literacy)) {
    assert.ok(
      ['published', 'n', 'correctRate', 'incorrectRate', 'absentRate', 'reason'].includes(key),
      `LiteracyPublication não deve carregar ${key} da série do estímulo`,
    );
  }

  const finding: OutcomeFinding = {
    kind: 'correction',
    pattern: 'espera',
    detailCapability: 'work-management',
    title: 'Espera',
    cause: 'fila',
    intervention: 'limitar o trabalho em curso',
    confidence: 0.9,
    priority: 0.8,
  };
  const laudo = projectDiagnosticLaudo({
    outcome: {
      kind: 'correct',
      kindLabel: 'Precisa de correção',
      limiterLabel: 'Fluxo',
      reading: 'espera',
      nextStepTitle: '',
      nextStepBody: '',
      finding,
    },
    findings: [finding],
    organizationalAreas: OrganizationalAreaProjector.empty(),
  });
  const html = renderLaudo(laudo, { capabilityBase: '/c', reportBase: '/r' });
  const serialized = `${html}\n${JSON.stringify(report.literacy)}\n${JSON.stringify(laudo)}`;

  assert.doesNotMatch(serialized, new RegExp(`aria-label="[^"]*${escapeRegExp(literacyWipChart.stimulus)}`, 'i'));
  assert.equal(serialized.includes('"series"'), false);
  assert.doesNotMatch(JSON.stringify(report.literacy), /"values"|"stages"/);

  const series = (literacyWipChart as LiteracyItem & { series?: LiteracySeries }).series;
  if (series) {
    assert.doesNotMatch(html, /role="img"/i);
    for (const stage of series.stages) {
      const chartLegend = new RegExp(`<(?:figcaption|li|span|td)[^>]*>\\s*${escapeRegExp(stage)}`, 'i');
      assert.doesNotMatch(html, chartLegend);
    }
  }
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
