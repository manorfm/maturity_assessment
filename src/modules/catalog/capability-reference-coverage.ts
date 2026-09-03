import type { AssessmentNode, EvidenceLayer, NodeVariant, Profile, Signal } from './assessment-graph.js';
import type { CapabilityReference } from '../inference/domain/capability-reference.js';

export const capabilityReferenceCoverageVersion = 'capability-reference-coverage-v1' as const;

type EvidenceCount = { nodes: number; patterns: number };
export type CapabilityReferenceCoverage = {
  capabilityId: string;
  status: 'minimum-covered' | 'partial' | 'missing';
  direct: EvidenceCount;
  indirect: EvidenceCount;
  layers: EvidenceLayer[];
  perspectives: Array<Profile | 'shared'>;
  singlePerspective: boolean;
  mixedFactAndCause: number;
  desirabilityCues: number;
  gaps: string[];
};

export type CapabilityReferenceCoverageMatrix = {
  version: typeof capabilityReferenceCoverageVersion;
  references: CapabilityReferenceCoverage[];
};

const organizationalLeaves = new Set(['team-ownership', 'enabling-governance', 'leadership-management', 'collaboration', 'organizational-learning']);
const desirableLanguage = /\b(maduro|ideal|corret[oa]mente|correto|melhor pr[aá]tica|excel[eê]ncia)\b/i;

export function mapCapabilityReferenceCoverage(
  nodes: AssessmentNode[],
  variants: NodeVariant[],
  references: Readonly<Record<string, CapabilityReference>>,
): CapabilityReferenceCoverageMatrix {
  return {
    version: capabilityReferenceCoverageVersion,
    references: Object.values(references).map((reference) => coverageFor(reference, nodes, variants)),
  };
}

function coverageFor(reference: CapabilityReference, nodes: AssessmentNode[], variants: NodeVariant[]): CapabilityReferenceCoverage {
  const direct = observationsFor(nodes, (signal) => signal.details.includes(reference.capabilityId));
  const indirect = reference.capabilityId === 'organizational-system'
    ? observationsFor(nodes, (signal) => !signal.details.includes(reference.capabilityId) && signal.details.some((id) => organizationalLeaves.has(id)))
    : emptyObservations();
  const observations = [...direct.items, ...indirect.items];
  const layers = unique(observations.map((item) => item.signal.layer));
  const nodeIds = new Set(observations.map((item) => item.node.id));
  const perspectives = perspectiveCoverage(nodeIds, variants);
  const patterns = new Set(observations.map((item) => item.signal.pattern));
  const hasOutcome = layers.includes('outcome');
  const hasPressure = observations.some(({ node }) => /press[aã]o|urg[eê]n|prazo|incidente/i.test(`${node.title} ${node.scenario} ${node.prompt}`));
  const singlePerspective = !perspectives.includes('shared') && perspectives.length === 1;
  const mixedFactAndCause = observations.filter(({ node, signal }) => (node.type ?? 'scenario') === 'scenario' && signal.pattern.startsWith('causa-')).length;
  const desirabilityCues = observations.filter(({ optionLabel }) => desirableLanguage.test(optionLabel)).length;
  const gaps: string[] = [];
  if (patterns.size < 2) gaps.push('Menos de dois padrões independentes observam a referência.');
  if (!layers.some((layer) => layer === 'practice' || layer === 'consistency' || layer === 'system')) gaps.push('Falta observação do comportamento ou do sistema habilitador.');
  if (!hasOutcome) gaps.push('Falta consequência em camada de resultado ou aprendizado.');
  if (!hasPressure) gaps.push('Falta observar se o comportamento resiste a pressão ou urgência.');
  if (singlePerspective) gaps.push('A referência depende de uma única perspectiva explícita.');
  if (mixedFactAndCause) gaps.push('Há cenário factual emitindo hipótese causal prematuramente.');
  if (desirabilityCues) gaps.push('Há alternativa com pista de resposta socialmente desejável.');
  const status = observations.length === 0 ? 'missing' : gaps.length === 0 ? 'minimum-covered' : 'partial';
  return {
    capabilityId: reference.capabilityId,
    status,
    direct: count(direct),
    indirect: count(indirect),
    layers,
    perspectives,
    singlePerspective,
    mixedFactAndCause,
    desirabilityCues,
    gaps,
  };
}

type Observation = { node: AssessmentNode; optionLabel: string; signal: Signal };
type Observations = { items: Observation[]; nodeIds: Set<string>; patterns: Set<string> };

function observationsFor(nodes: AssessmentNode[], matches: (signal: Signal) => boolean): Observations {
  const items = nodes.flatMap((node) => node.options.flatMap((option) => option.signals
    .filter(matches)
    .map((signal) => ({ node, optionLabel: option.label, signal }))));
  return { items, nodeIds: new Set(items.map((item) => item.node.id)), patterns: new Set(items.map((item) => item.signal.pattern)) };
}

function emptyObservations(): Observations {
  return { items: [], nodeIds: new Set(), patterns: new Set() };
}

function count(observations: Observations): EvidenceCount {
  return { nodes: observations.nodeIds.size, patterns: observations.patterns.size };
}

function perspectiveCoverage(nodeIds: Set<string>, variants: NodeVariant[]): Array<Profile | 'shared'> {
  const result = new Set<Profile | 'shared'>();
  for (const nodeId of nodeIds) {
    const nodeProfiles = variants.filter((variant) => variant.nodeId === nodeId).map((variant) => variant.profile);
    if (nodeProfiles.length === 0) result.add('shared');
    else nodeProfiles.forEach((profile) => result.add(profile));
  }
  return [...result].sort();
}

function unique<T extends string>(values: T[]): T[] {
  return [...new Set(values)].sort();
}
