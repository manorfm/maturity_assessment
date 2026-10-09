import type { ConstraintKind, EvidenceLayer, Option, Signal } from './assessment-graph.js';

export type AnchorStage = 0 | 1 | 2 | 3 | 4;
export type Discrimination = 'low' | 'medium' | 'high';
export type Appropriation = 'ritual' | 'heroism';

/** Linha da matriz Q (04 §4.1). `pattern` e `pillar` sustentam o adaptador m1 até WP5. */
export type EvidenceLink = {
  capability: string;
  pattern: string;
  pillar: string;
  anchorStage: AnchorStage;
  discrimination: Discrimination;
  layer: EvidenceLayer;
  appropriation?: Appropriation;
  constraint: ConstraintKind;
  role: 'primary' | 'effect';
};

export type OptionEvidence = Option & { evidence: EvidenceLink[] };

const heroismPattern = /her[oó]i|dependencia-de-heroi/i;
const ritualPattern = /war-room|cerim[oô]n|ritual|reunir-e-anotar|retrospectiva-sem/i;

export function weightToAnchorStage(weight: number): AnchorStage {
  if (weight <= -2) return 0;
  if (weight === -1) return 1;
  if (weight === 0) return 2;
  if (weight === 1) return 3;
  return 4;
}

export function anchorStageToWeight(stage: AnchorStage): number {
  return ({ 0: -2, 1: -1, 2: 0, 3: 1, 4: 2 } as const)[stage];
}

export function signalToEvidenceLinks(signal: Signal): EvidenceLink[] {
  const leaves = signal.details.length ? signal.details : [signal.capability];
  const appropriation = appropriationFor(signal.pattern);
  // Âncora segue a tabela 04 §4.2. Appropriation marca ritual/heroísmo para revisão
  // de conteúdo (subir −2 → 1) sem alterar o peso m1 nesta migração.
  const anchorStage = weightToAnchorStage(signal.weight);
  return leaves.map((leaf, index) => ({
    capability: leaf,
    pattern: signal.pattern,
    pillar: signal.capability,
    anchorStage,
    discrimination: 'medium',
    layer: signal.layer,
    ...(appropriation ? { appropriation } : {}),
    constraint: signal.constraint,
    role: index === 0 ? 'primary' : 'effect',
  }));
}

export function evidenceToSignal(link: EvidenceLink): Signal {
  return {
    capability: link.pillar,
    pattern: link.pattern,
    weight: anchorStageToWeight(link.anchorStage),
    details: [link.capability],
    layer: link.layer,
    constraint: link.constraint,
  };
}

/** Reagrupa folhas da mesma evidência num Signal m1 (um padrão, várias details). */
export function evidenceToSignals(links: EvidenceLink[]): Signal[] {
  const groups = new Map<string, EvidenceLink[]>();
  for (const link of links) {
    const key = `${link.pattern}|${link.pillar}|${link.anchorStage}|${link.layer}|${link.constraint}|${link.appropriation ?? ''}`;
    const group = groups.get(key) ?? [];
    group.push(link);
    groups.set(key, group);
  }
  return [...groups.values()].map((group) => {
    const primary = group.find((link) => link.role === 'primary') ?? group[0]!;
    return {
      capability: primary.pillar,
      pattern: primary.pattern,
      weight: anchorStageToWeight(primary.anchorStage),
      details: group.map((link) => link.capability),
      layer: primary.layer,
      constraint: primary.constraint,
    };
  });
}

export function normalizeOptionEvidence(option: Option & { evidence?: EvidenceLink[] }): OptionEvidence {
  const evidence = option.evidence?.length
    ? option.evidence
    : option.signals.flatMap(signalToEvidenceLinks);
  return { ...option, evidence, signals: evidenceToSignals(evidence) };
}

function appropriationFor(pattern: string): Appropriation | undefined {
  if (heroismPattern.test(pattern)) return 'heroism';
  if (ritualPattern.test(pattern)) return 'ritual';
  return undefined;
}
