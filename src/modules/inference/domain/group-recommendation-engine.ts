import { assessSolutionReadiness, type SolutionReadiness } from './solution-readiness.js';

export type EvidenceLayer = 'knowledge' | 'practice' | 'consistency' | 'system' | 'outcome';
export type ConstraintKind = 'none' | 'knowledge' | 'process' | 'tooling' | 'access' | 'architecture' | 'organization' | 'governance' | 'culture';
export type GroupSignal = { participantId: string; profile?: string; detailCapability: string; pattern: string; weight: number; layer: EvidenceLayer; constraint: ConstraintKind };
export type InterventionFoundation = { source: string; principle: string; why: string };
export type InterventionSeed = { title: string; intervention: string; foundation?: InterventionFoundation };
export type InterventionDefinition = InterventionSeed & { cause: string; action: string; owner: string; metric: string; reviewHorizon: string; successCriterion: string; evidencePatterns: string[]; contradictionPatterns: string[]; foundation: InterventionFoundation; guidance?: SolutionGuidance; guidanceStatus?: 'explicit' | 'fallback' };
export type RecommendationPopulation = { total: number; applicableByCapability: Record<string, number> };
export type RecommendationEvidence = { supportingParticipants: number; applicablePopulation: number; contradictingParticipants: number; patterns: string[]; layers: EvidenceLayer[]; profiles: string[] };
export type RankedIntervention = InterventionDefinition & { kind: 'correction' | 'evolution'; detailCapability: string; pattern: string; constraint: ConstraintKind; support: number; confidence: number; priority: number; reasons: string[]; evidence: RecommendationEvidence; solutionCapability: string; solutionReadiness: SolutionReadiness; experiment: Pick<InterventionDefinition, 'action' | 'owner' | 'metric' | 'reviewHorizon' | 'successCriterion'> };
export type InterventionEvidenceRule = { evidencePatterns?: string[]; contradictionPatterns?: string[]; owner?: string; metric?: string; reviewHorizon?: string; successCriterion?: string };

export function defineInterventionCatalog(seeds: Record<string, InterventionSeed>, rules: Record<string, InterventionEvidenceRule> = {}): Record<string, InterventionDefinition> {
  return Object.fromEntries(Object.entries(seeds).map(([pattern, seed]) => {
    const rule = rules[pattern] ?? {};
    const baseFoundation = seed.foundation ?? foundationFor(pattern);
    const foundation = { ...baseFoundation, why: specificFoundationWhy(baseFoundation, seed.title) };
    const guidance = guidanceFor(pattern, foundation, seed.title);
    return [pattern, {
      ...seed, cause: causeFromGuidance(guidance, seed.title), action: seed.intervention, foundation, guidance,
      guidanceStatus: hasExplicitGuidance(pattern) ? 'explicit' : 'fallback',
      ...experimentDefaults('none', pattern, foundation, guidance), ...rule,
      evidencePatterns: rule.evidencePatterns ?? [pattern], contradictionPatterns: rule.contradictionPatterns ?? [],
    }];
  }));
}

export class GroupRecommendationEngine {
  constructor(private readonly correctionCatalog: Record<string, InterventionDefinition>, private readonly evolutionCatalog: Record<string, InterventionDefinition> = {}) {}

  rank(signals: GroupSignal[], population: number | RecommendationPopulation): RankedIntervention[] {
    const model = typeof population === 'number' ? { total: population, applicableByCapability: {} } : population;
    return [...groupBy(signals, (signal) => signal.detailCapability).values()].flatMap((items) => this.rankCapability(items, model));
  }

  private rankCapability(signals: GroupSignal[], population: RecommendationPopulation): RankedIntervention[] {
    const capability = signals[0]?.detailCapability;
    if (!capability) return [];
    const applicablePopulation = population.applicableByCapability[capability] ?? population.total;
    if (applicablePopulation < 3) return [];
    const minimumSupport = Math.max(2, Math.ceil(applicablePopulation * .2));
    const candidates = unique(signals.flatMap((signal) => {
      const catalog = signal.weight < 0 ? this.correctionCatalog : signal.weight < 2 ? this.evolutionCatalog : {};
      const definition = catalog[signal.pattern];
      return definition && definition.guidanceStatus !== 'fallback' ? [signal.pattern] : [];
    }));
    const posterior = posteriorByPattern(signals, candidates, this.correctionCatalog, this.evolutionCatalog, applicablePopulation);
    return candidates.flatMap((pattern) => {
      const sourceSignals = signals.filter((signal) => signal.pattern === pattern);
      const kind: RankedIntervention['kind'] = sourceSignals[0]!.weight < 0 ? 'correction' : 'evolution';
      const definition = (kind === 'correction' ? this.correctionCatalog : this.evolutionCatalog)[pattern]!;
      const relevant = signals.filter((signal) => definition.evidencePatterns.includes(signal.pattern));
      const supporters = new Set(relevant.map((signal) => signal.participantId));
      if (supporters.size < minimumSupport) return [];
      const contradictions = signals.filter((signal) => definition.contradictionPatterns.includes(signal.pattern));
      const contradictors = new Set(contradictions.map((signal) => signal.participantId));
      const layers = unique(relevant.map((signal) => signal.layer));
      const profiles = unique(relevant.flatMap((signal) => signal.profile ? [signal.profile] : []));
      const patterns = unique(relevant.map((signal) => signal.pattern));
      const support = supporters.size / Math.max(1, applicablePopulation);
      const confidence = roundConfidence(posterior.get(pattern) ?? 0);
      if (confidence < .5) return [];
      const constraint: ConstraintKind = mode(sourceSignals.map((signal) => signal.constraint).filter((item) => item !== 'none')) ?? 'none';
      const contextualOwner = ownerForConstraint(constraint, definition.foundation);
      const solutionReadiness = assessSolutionReadiness(signals, applicablePopulation);
      const solutionCapability = definition.guidance?.solutionClass ?? `Capacidade coletiva para reduzir ${definition.title.toLocaleLowerCase('pt-BR')}`;
      const evidence: RecommendationEvidence = { supportingParticipants: supporters.size, applicablePopulation, contradictingParticipants: contradictors.size, patterns, layers, profiles };
      const reasons = [
        `Padrão sustentado por ${supporters.size} de ${applicablePopulation} jornadas aplicáveis.`,
        `Posterior bayesiano formado por ${patterns.length} evidência(s), ${layers.length} camada(s) e ${profiles.length || 1} perspectiva(s).`,
        ...(contradictors.size ? [`Contradição específica em ${contradictors.size} jornada(s).`] : []),
        ...(constraint !== 'none' ? [`Restrição observada: ${constraint}.`] : []),
      ];
      return [{ ...definition, kind, detailCapability: capability, pattern, constraint, support: clamp(support), confidence, priority: priorityOf(sourceSignals, support), reasons, evidence, solutionCapability, solutionReadiness, experiment: { action: definition.action, owner: definition.owner === 'Responsável pela capacidade com o time' ? contextualOwner : definition.owner, metric: definition.metric, reviewHorizon: definition.reviewHorizon, successCriterion: definition.successCriterion } }];
    }).sort((left, right) => right.priority - left.priority || right.confidence - left.confidence || right.support - left.support).slice(0, 3);
  }
}

function posteriorByPattern(signals: GroupSignal[], candidates: string[], corrections: Record<string, InterventionDefinition>, evolutions: Record<string, InterventionDefinition>, population: number): Map<string, number> {
  if (!candidates.length) return new Map();
  const definitions = Object.fromEntries(candidates.map((pattern) => [pattern, corrections[pattern] ?? evolutions[pattern]!]));
  const probabilities = new Map<string, number>();
  for (const pattern of candidates) {
    const definition = definitions[pattern]!;
    const hypotheses: HypothesisDefinition[] = [{ id: pattern, label: definition.cause, prior: .5 }, { id: 'unknown', label: 'Evidência insuficiente', prior: .5 }];
    const evidence: EvidenceDefinition[] = [];
    const observed: string[] = [];
    const related = signals.filter((signal) => definition.evidencePatterns.includes(signal.pattern));
    if (related.length) {
      const supporters = new Set(related.map((signal) => signal.participantId)).size;
      const layers = new Set(related.map((signal) => signal.layer)).size;
      const profiles = new Set(related.flatMap((signal) => signal.profile ? [signal.profile] : [])).size;
      const reliability = Math.min(.95, .55 + .25 * Math.min(1, supporters / Math.max(1, population)) + .05 * Math.min(2, layers - 1) + .05 * Math.min(2, profiles - 1) + (related.some((signal) => signal.layer === 'outcome') ? .05 : 0));
      const evidencePattern = `supports:${pattern}`;
      evidence.push({ pattern: evidencePattern, group: `support:${pattern}`, likelihoods: { [pattern]: reliability, unknown: .35 } });
      observed.push(evidencePattern);
    }
    const contradicted = signals.some((signal) => definition.contradictionPatterns.includes(signal.pattern));
    if (contradicted) {
      const evidencePattern = `contradicts:${pattern}`;
      evidence.push({ pattern: evidencePattern, group: `contradiction:${pattern}`, likelihoods: { [pattern]: .1, unknown: .75 } });
      observed.push(evidencePattern);
    }
    const model = DiagnosticModel.create({ version: 'group-bayesian-v2', families: [{ id: `${signals[0]!.detailCapability}:${pattern}`, capability: signals[0]!.detailCapability, hypotheses, evidence }] });
    const result = new BayesianInferenceEngine().infer(model, observed)[0]!;
    probabilities.set(pattern, result.hypotheses.find((item) => item.id === pattern)!.probability);
  }
  return probabilities;
}

export function foundationFor(pattern: string): InterventionFoundation {
  const foundation = interventionFoundations[pattern];
  if (!foundation) throw new Error(`Intervention foundation is missing: ${pattern}`);
  return foundation;
}
function experimentDefaults(constraint: ConstraintKind, pattern = '', foundation?: InterventionFoundation, guidance?: SolutionGuidance): Pick<InterventionDefinition, 'owner' | 'metric' | 'reviewHorizon' | 'successCriterion'> {
  if (!guidance) throw new Error(`Solution guidance is missing: ${pattern}`);
  return { owner: ownerForConstraint(constraint, foundation), metric: guidance.metric, reviewHorizon: horizonFor(pattern), successCriterion: guidance.successCriterion };
}
function ownerForConstraint(constraint: ConstraintKind, foundation?: InterventionFoundation): string {
  const owners: Record<ConstraintKind, string> = { none: 'Responsável pela capacidade com o time', knowledge: 'Liderança técnica com a disciplina habilitadora', process: 'Responsável pelo fluxo com as pessoas que executam o processo', tooling: 'Engenharia com plataforma', access: 'Plataforma e segurança com representantes dos times', architecture: 'Times proprietários com liderança de arquitetura', organization: 'Liderança organizacional com os times afetados', governance: 'Responsável pela governança com executores do fluxo', culture: 'Liderança de pessoas com o grupo afetado' };
  return constraint === 'none' ? ownerFor(foundation?.source) : owners[constraint];
}
function ownerFor(source?: string): string {
  const owners: Record<string, string> = {
    'Continuous Delivery': 'Liderança de engenharia e pessoas que operam o fluxo', 'Qualidade no fluxo': 'Engenharia e qualidade com produto',
    'SRE / blameless postmortem': 'Responsáveis pelo serviço com operação', 'Team Topologies': 'Liderança organizacional e times afetados',
    'Governança habilitadora': 'Responsável pelo controle e pessoas que percorrem o fluxo', 'Well-Architected / platform engineering': 'Plataforma com os times consumidores',
    'Well-Architected — Security': 'Segurança, plataforma e responsáveis pelo serviço', 'Lean / Accelerate': 'Liderança de produto e engenharia',
    'Arquitetura evolutiva / DDD': 'Times responsáveis e liderança de arquitetura', 'Dados como produto': 'Responsáveis pelo dado e consumidores afetados',
    'Discovery e evidência de uso': 'Produto, design e engenharia', 'Data literacy / SRE': 'Responsável pela decisão e pela medição',
    'Resilience engineering / SRE': 'Responsáveis pelo serviço e suas dependências', 'Uso responsável de assistência': 'Responsável pelo fluxo com segurança e engenharia',
    'Melhoria contínua': 'Liderança do fluxo e pessoas afetadas pelo problema',
  };
  return owners[source ?? ''] ?? 'Liderança do fluxo e pessoas afetadas pelo problema';
}
function specificFoundationWhy(foundation: InterventionFoundation, title: string): string {
  if (foundation.why !== 'A intervenção ataca o comportamento observado, não um inventário de práticas.') return foundation.why;
  return `O princípio orienta um experimento para reduzir “${lowerFirst(title)}” e verificar o efeito antes de institucionalizar a solução.`;
}
function horizonFor(pattern: string): string {
  if (/incidente|diagnostico|telemetria|deteccao|resilien/.test(pattern)) return 'no próximo exercício controlado ou incidente equivalente';
  if (/portfolio|incentivo|lideranca|resultado/.test(pattern)) return 'no próximo ciclo de decisão de investimento';
  if (/cloud|plataforma|provisionamento|credencial|acesso/.test(pattern)) return 'nas próximas cinco utilizações do caminho';
  return 'na próxima mudança equivalente, com revisão em até 30 dias';
}
function lowerFirst(value: string): string {
  return value.charAt(0).toLocaleLowerCase('pt-BR') + value.slice(1).replace(/[.]$/, '');
}
function priorityOf(signals: GroupSignal[], support: number): number { const severity = Math.min(1, Math.abs(Math.min(...signals.map((signal) => signal.weight))) / 3); return Number((.65 * severity + .35 * Math.min(1, support)).toFixed(2)); }
function mode<T extends string>(values: T[]): T | undefined { const counts = new Map<T, number>(); for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1); return [...counts].sort((left, right) => right[1] - left[1])[0]?.[0]; }
function groupBy<T, K>(values: T[], keyOf: (value: T) => K): Map<K, T[]> { const grouped = new Map<K, T[]>(); for (const value of values) { const key = keyOf(value); grouped.set(key, [...(grouped.get(key) ?? []), value]); } return grouped; }
function unique<T>(values: T[]): T[] { return [...new Set(values)]; }
function roundConfidence(value: number): number { return Math.round(clamp(value) * 20) / 20; }
function clamp(value: number): number { return Math.max(0, Math.min(1, value)); }
import { BayesianInferenceEngine } from './bayesian-inference-engine.js';
import { DiagnosticModel, type EvidenceDefinition, type HypothesisDefinition } from './diagnostic-model.js';
import { interventionFoundations } from './intervention-foundations.js';
import { causeFromGuidance, guidanceFor, hasExplicitGuidance, type SolutionGuidance } from './solution-guidance.js';
