import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDatabase } from '../src/shared/database.js';
import { resolveArchetypeDecisionClient } from '../src/modules/inference/domain/archetype-laya-wire.js';
import {
  ORG_ARCHETYPES,
  runArchetypeCohort,
  type OrgArchetypeId,
  type OrgArchetypeLevel,
} from '../src/modules/inference/domain/org-archetype.js';
import { runRealFlowCohort } from '../src/modules/inference/domain/real-flow-cohort.js';
import { uniqueFindingsByPattern } from '../src/modules/inference/domain/report-outcome.js';
import type { SyntheticCaseId } from '../src/modules/inference/domain/organizational-synthetic.js';

type Override = { nodeId: string; optionId: string };

const ARCHETYPE_IDS = new Set<string>(ORG_ARCHETYPES.map((entry) => entry.id));
const LEVEL_IDS = new Set<string>(['junior', 'pleno', 'senior']);

export type ParsedArgs =
  | {
      mode: 'case';
      caseId: string;
      overrides: Override[];
      noLaya?: boolean;
    }
  | {
      mode: 'archetype';
      archetypeId: OrgArchetypeId;
      level?: OrgArchetypeLevel;
      noLaya?: boolean;
    };

function requireValue(flag: string, value: string | undefined): string {
  if (!value || value.startsWith('--')) {
    throw new Error(`Missing value for ${flag}`);
  }
  return value;
}

export function parseArgs(argv: string[]): ParsedArgs {
  let caseId = 'engineering-practice';
  let caseProvided = false;
  const overrides: Override[] = [];
  let archetypeId: string | undefined;
  let level: string | undefined;
  let noLaya = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]!;
    if (arg === '--case') {
      caseId = requireValue('--case', argv[++index]);
      caseProvided = true;
      continue;
    }
    if (arg === '--override') {
      const value = requireValue('--override', argv[++index]);
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
    if (arg === '--archetype') {
      archetypeId = requireValue('--archetype', argv[++index]);
      continue;
    }
    if (arg === '--level') {
      level = requireValue('--level', argv[++index]);
      continue;
    }
    if (arg === '--no-laya') {
      noLaya = true;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (level !== undefined && archetypeId === undefined) {
    throw new Error('--level requires --archetype');
  }

  if (archetypeId !== undefined) {
    if (caseProvided) {
      throw new Error('--archetype cannot be combined with --case');
    }
    if (overrides.length > 0) {
      throw new Error('--archetype cannot be combined with --override');
    }
    if (!ARCHETYPE_IDS.has(archetypeId)) {
      throw new Error(`Unknown archetype: ${archetypeId}`);
    }
    if (level !== undefined && !LEVEL_IDS.has(level)) {
      throw new Error(`Unknown level: ${level}`);
    }
    return {
      mode: 'archetype',
      archetypeId: archetypeId as OrgArchetypeId,
      ...(level !== undefined ? { level: level as OrgArchetypeLevel } : {}),
      ...(noLaya ? { noLaya: true } : {}),
    };
  }

  return {
    mode: 'case',
    caseId,
    overrides,
    ...(noLaya ? { noLaya: true } : {}),
  };
}

function main(): number {
  try {
    const args = parseArgs(process.argv.slice(2));
    const db = createDatabase(':memory:');

    if (args.mode === 'archetype') {
      const decisionClient = resolveArchetypeDecisionClient({
        mode: args.mode,
        env: process.env,
        noLaya: args.noLaya === true,
      });
      const { plan, report } = runArchetypeCohort(db, {
        archetypeId: args.archetypeId,
        ...(args.level !== undefined ? { level: args.level } : {}),
        ...(decisionClient !== undefined ? { decisionClient } : {}),
      });
      const patterns = uniqueFindingsByPattern(report.findings).map((finding) => finding.pattern);
      const summary: Record<string, unknown> = {
        archetypeId: args.archetypeId,
        completed: report.completed,
        totalPeople: plan.totalPeople,
        outcomeKind: report.outcome.kind,
        patterns,
      };
      if (args.level !== undefined) {
        summary.level = args.level;
      }
      process.stdout.write(`${JSON.stringify(summary)}\n`);
      return report.completed === plan.totalPeople ? 0 : 1;
    }

    const { plan, report } = runRealFlowCohort(db, {
      caseId: args.caseId as SyntheticCaseId,
      optionOverrides: args.overrides,
    });
    const patterns = uniqueFindingsByPattern(report.findings).map((finding) => finding.pattern);
    const summary = {
      caseId: args.caseId,
      completed: report.completed,
      totalPeople: plan.totalPeople,
      outcomeKind: report.outcome.kind,
      patterns,
      overridesApplied: args.overrides,
    };
    process.stdout.write(`${JSON.stringify(summary)}\n`);
    return report.completed === plan.totalPeople ? 0 : 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    return 1;
  }
}

const invokedAsCli =
  process.argv[1] !== undefined &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (invokedAsCli) {
  process.exitCode = main();
}
