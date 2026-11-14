import { createDatabase } from '../src/shared/database.js';
import { runRealFlowCohort } from '../src/modules/inference/domain/real-flow-cohort.js';
import { uniqueFindingsByPattern } from '../src/modules/inference/domain/report-outcome.js';
import type { SyntheticCaseId } from '../src/modules/inference/domain/organizational-synthetic.js';

type Override = { nodeId: string; optionId: string };

function parseArgs(argv: string[]): {
  caseId: string;
  overrides: Override[];
} {
  let caseId = 'engineering-practice';
  const overrides: Override[] = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]!;
    if (arg === '--case') {
      const value = argv[++index];
      if (!value || value.startsWith('--')) {
        throw new Error('Missing value for --case');
      }
      caseId = value;
      continue;
    }
    if (arg === '--override') {
      const value = argv[++index];
      if (!value || value.startsWith('--')) {
        throw new Error('Missing value for --override');
      }
      const separator = value.indexOf('=');
      if (separator <= 0 || separator === value.length - 1) {
        throw new Error(`Invalid --override ${value}; expected nodeId=optionId`);
      }
      overrides.push({
        nodeId: value.slice(0, separator),
        optionId: value.slice(separator + 1),
      });
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return { caseId, overrides };
}

function main(): number {
  try {
    const { caseId, overrides } = parseArgs(process.argv.slice(2));
    const db = createDatabase(':memory:');
    const { plan, report } = runRealFlowCohort(db, {
      caseId: caseId as SyntheticCaseId,
      optionOverrides: overrides,
    });
    const patterns = uniqueFindingsByPattern(report.findings).map((finding) => finding.pattern);
    const summary = {
      caseId,
      completed: report.completed,
      totalPeople: plan.totalPeople,
      outcomeKind: report.outcome.kind,
      patterns,
      overridesApplied: overrides,
    };
    process.stdout.write(`${JSON.stringify(summary)}\n`);
    return report.completed === plan.totalPeople ? 0 : 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    return 1;
  }
}

process.exitCode = main();
