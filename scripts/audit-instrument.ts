import { graph } from '../src/modules/catalog/assessment-graph.js';
import { auditInstrument } from '../src/modules/catalog/instrument-audit.js';
import { evolutionCatalog, interventionCatalog } from '../src/modules/inference/inference-service.js';

const issues = auditInstrument(graph, { ...interventionCatalog, ...evolutionCatalog });
const counts = issues.reduce<Record<string, number>>((result, item) => ({ ...result, [item.code]: (result[item.code] ?? 0) + 1 }), {});
console.log(JSON.stringify({ questions: graph.length, interventions: Object.keys({ ...interventionCatalog, ...evolutionCatalog }).length, errors: issues.filter((item) => item.severity === 'error').length, warnings: issues.filter((item) => item.severity === 'warning').length, counts, issues }, null, 2));
process.exitCode = issues.some((item) => item.severity === 'error') ? 1 : 0;
