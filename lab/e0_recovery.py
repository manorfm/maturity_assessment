#!/usr/bin/env python3
"""E0 (09 §3) — espelho documental do recovery TypeScript.

A implementação normativa e o teste de aceite estão em
`src/modules/measurement/domain/e0-recovery.ts` e `test/e0-recovery.test.ts`.
Este script só documenta o fluxo offline e aponta para o runtime TS.

Uso:
  npm test -- test/e0-recovery.test.ts
  # ou, com Node:
  npx tsx -e "import { runE0Recovery } from './src/modules/measurement/domain/e0-recovery.ts'; console.log(runE0Recovery())"
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    script = (
        "import { runE0Recovery } from './src/modules/measurement/domain/e0-recovery.ts'; "
        "console.log(JSON.stringify(runE0Recovery({ replications: 200, respondents: 12, testlets: 3, seed: 42 })))"
    )
    result = subprocess.run(
        ["npx", "tsx", "-e", script],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        sys.stderr.write(result.stderr or result.stdout)
        return result.returncode
    report = json.loads(result.stdout.strip().splitlines()[-1])
    print(json.dumps(report, indent=2))
    if not report.get("passes"):
        sys.stderr.write("E0 não passou nos critérios de recuperação.\n")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
