import type { FindingContainment } from './diagnostic-contract.js';

export type DiagnosticPortfolioLevel = 'organizational' | 'shared' | 'local' | 'undetermined';

export function classifyPortfolioLevel(input: { containment?: FindingContainment }): DiagnosticPortfolioLevel {
  if (input.containment === 'organizational-policy' || input.containment === 'organizational-structure') return 'organizational';
  if (input.containment === 'shared-service' || input.containment === 'external') return 'shared';
  if (input.containment === 'team') return 'local';
  return 'undetermined';
}
