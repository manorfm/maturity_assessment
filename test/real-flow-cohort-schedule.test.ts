import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

test('crontab example agenda a coorte real sem engolir falhas', () => {
  const crontabExample = readFileSync(
    new URL('../scripts/cron/real-flow-cohort.crontab.example', import.meta.url),
    'utf8',
  );
  const packageJson = JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
  ) as { scripts: Record<string, string> };

  assert.match(
    crontabExample,
    /simulate:cohort|run-real-flow-cohort\.ts/,
  );
  assert.match(crontabExample, /\/private\/tmp\/maturity-assessment-real-flow-/);
  assert.doesNotMatch(crontabExample, /\|\| true/);
  assert.match(
    packageJson.scripts['simulate:cohort']!,
    /run-real-flow-cohort\.ts/,
  );
});
