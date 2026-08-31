import { graph, nodeVariants, profiles } from '../src/modules/catalog/assessment-graph.js';
import { auditInstrumentVersion } from '../src/modules/catalog/instrument-audit.js';
import { evolutionCatalog, interventionCatalog } from '../src/modules/inference/inference-service.js';
import { interventionFoundations } from '../src/modules/inference/domain/intervention-foundations.js';

const interventions = { ...interventionCatalog, ...evolutionCatalog };
const report = auditInstrumentVersion({ graph, nodeVariants, profiles, interventions, foundations: interventionFoundations });
console.log(JSON.stringify({ questions: graph.length, interventions: Object.keys(interventions).length, ...report }, null, 2));
process.exitCode = report.errors > 0 ? 1 : 0;
