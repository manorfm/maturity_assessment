import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptPath = path.join(repoRoot, 'scripts', 'run-real-flow-cohort.ts');
const COHORT_TIMEOUT_MS = 180_000;

type CohortCliSummary = {
  caseId: string;
  completed: number;
  totalPeople: number;
  outcomeKind: string;
  patterns: string[];
  overridesApplied: Array<{ nodeId: string; optionId: string }>;
};

function runCohortCli(args: string[]): Promise<{
  exitCode: number | null;
  stdout: string;
  stderr: string;
}> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ['--import', 'tsx', scriptPath, ...args],
      { cwd: repoRoot, env: process.env },
    );
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`cohort CLI timed out after ${COHORT_TIMEOUT_MS}ms`));
    }, COHORT_TIMEOUT_MS);
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk: string) => {
      stderr += chunk;
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (exitCode) => {
      clearTimeout(timer);
      resolve({ exitCode, stdout, stderr });
    });
  });
}

function parseSummary(stdout: string): CohortCliSummary {
  const line = stdout
    .trim()
    .split('\n')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith('{'));
  assert.ok(line, `expected JSON line on stdout; got: ${stdout}`);
  return JSON.parse(line) as CohortCliSummary;
}

function assertNoAdminSecret(stdout: string, stderr: string): void {
  assert.equal(/adminSecret/i.test(stdout), false, 'stdout must not contain adminSecret');
  assert.equal(stdout.includes('adminSecret'), false, 'stdout must not contain adminSecret substring');
  assert.equal(/adminSecret/i.test(stderr), false, 'stderr must not contain adminSecret');
}

test(
  'CLI real-flow cohort baseline exits 0 with war-room pattern',
  { timeout: COHORT_TIMEOUT_MS },
  async () => {
    const { exitCode, stdout, stderr } = await runCohortCli([]);
    assert.equal(exitCode, 0, `expected exit 0; stderr=${stderr}`);
    const summary = parseSummary(stdout);
    assert.equal(summary.caseId, 'engineering-practice');
    assert.equal(summary.completed, summary.totalPeople);
    assert.ok(
      summary.patterns.includes('war-room-como-gestao'),
      `expected war-room-como-gestao; got ${summary.patterns.join(', ')}`,
    );
    assert.deepEqual(summary.overridesApplied, []);
    assertNoAdminSecret(stdout, stderr);
  },
);

test(
  'CLI real-flow cohort override omits war-room pattern',
  { timeout: COHORT_TIMEOUT_MS },
  async () => {
    const { exitCode, stdout, stderr } = await runCohortCli([
      '--case',
      'engineering-practice',
      '--override',
      'team-pressure=system-learning',
    ]);
    assert.equal(exitCode, 0, `expected exit 0; stderr=${stderr}`);
    const summary = parseSummary(stdout);
    assert.ok(
      !summary.patterns.includes('war-room-como-gestao'),
      `must not contain war-room-como-gestao; got ${summary.patterns.join(', ')}`,
    );
    assert.deepEqual(summary.overridesApplied, [
      { nodeId: 'team-pressure', optionId: 'system-learning' },
    ]);
    assertNoAdminSecret(stdout, stderr);
  },
);

test(
  'CLI real-flow cohort unknown case exits non-zero',
  { timeout: COHORT_TIMEOUT_MS },
  async () => {
    const { exitCode } = await runCohortCli(['--case', 'not-a-real-case']);
    assert.notEqual(exitCode, 0, 'unknown case must exit non-zero');
  },
);
