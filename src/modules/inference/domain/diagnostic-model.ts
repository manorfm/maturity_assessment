export type HypothesisDefinition = { id: string; label: string; prior: number };
export type EvidenceDefinition = { pattern: string; group: string; likelihoods: Record<string, number> };
export type DiagnosticFamilyDefinition = { id: string; capability: string; hypotheses: HypothesisDefinition[]; evidence: EvidenceDefinition[] };
export type DiagnosticModelDefinition = { version: string; families: DiagnosticFamilyDefinition[] };

export class DiagnosticModel {
  private constructor(readonly version: string, readonly families: DiagnosticFamilyDefinition[]) {}

  static create(definition: DiagnosticModelDefinition): DiagnosticModel {
    if (!definition.version.trim()) throw new Error('Diagnostic model version is required');
    if (!definition.families.length) throw new Error('Diagnostic model requires at least one family');
    const familyIds = new Set<string>();
    for (const family of definition.families) {
      if (familyIds.has(family.id)) throw new Error(`Duplicate diagnostic family: ${family.id}`);
      familyIds.add(family.id);
      if (family.hypotheses.length < 2) throw new Error(`Diagnostic family requires competing hypotheses: ${family.id}`);
      const hypothesisIds = new Set(family.hypotheses.map((item) => item.id));
      if (hypothesisIds.size !== family.hypotheses.length) throw new Error(`Duplicate hypothesis in ${family.id}`);
      const priorTotal = family.hypotheses.reduce((sum, item) => sum + probability(item.prior, `prior ${item.id}`), 0);
      if (Math.abs(priorTotal - 1) > 1e-9) throw new Error(`Priors must sum to one: ${family.id}`);
      const evidencePatterns = new Set<string>();
      for (const evidence of family.evidence) {
        if (evidencePatterns.has(evidence.pattern)) throw new Error(`Duplicate evidence: ${evidence.pattern}`);
        evidencePatterns.add(evidence.pattern);
        for (const hypothesisId of hypothesisIds) probability(evidence.likelihoods[hypothesisId], `likelihood ${evidence.pattern}/${hypothesisId}`);
      }
    }
    return new DiagnosticModel(definition.version, structuredClone(definition.families));
  }
}

function probability(value: number | undefined, name: string): number {
  if (value === undefined || !Number.isFinite(value) || value <= 0 || value >= 1) throw new Error(`${name} must be between zero and one`);
  return value;
}
