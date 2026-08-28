export type EvidenceLayer = 'knowledge' | 'practice' | 'consistency' | 'system' | 'outcome';
export type ConstraintKind = 'none' | 'knowledge' | 'process' | 'tooling' | 'access' | 'architecture' | 'organization' | 'governance' | 'culture';
export type GroupSignal = { participantId: string; profile?: string; detailCapability: string; pattern: string; weight: number; layer: EvidenceLayer; constraint: ConstraintKind };
export type InterventionFoundation = { source: string; principle: string; why: string };
export type InterventionSeed = { title: string; intervention: string; foundation?: InterventionFoundation };
export type InterventionDefinition = InterventionSeed & { cause: string; action: string; owner: string; metric: string; reviewHorizon: string; successCriterion: string; evidencePatterns: string[]; contradictionPatterns: string[]; foundation: InterventionFoundation };
export type RecommendationPopulation = { total: number; applicableByCapability: Record<string, number> };
export type RecommendationEvidence = { supportingParticipants: number; applicablePopulation: number; contradictingParticipants: number; patterns: string[]; layers: EvidenceLayer[]; profiles: string[] };
export type RankedIntervention = InterventionDefinition & { kind: 'correction' | 'evolution'; detailCapability: string; pattern: string; constraint: ConstraintKind; support: number; confidence: number; priority: number; reasons: string[]; evidence: RecommendationEvidence; experiment: Pick<InterventionDefinition, 'action' | 'owner' | 'metric' | 'reviewHorizon' | 'successCriterion'> };
export type InterventionEvidenceRule = { evidencePatterns?: string[]; contradictionPatterns?: string[]; owner?: string; metric?: string; reviewHorizon?: string; successCriterion?: string };

export function defineInterventionCatalog(seeds: Record<string, InterventionSeed>, rules: Record<string, InterventionEvidenceRule> = {}): Record<string, InterventionDefinition> {
  return Object.fromEntries(Object.entries(seeds).map(([pattern, seed]) => {
    const rule = rules[pattern] ?? {};
    const foundation = seed.foundation ?? foundationFor(pattern);
    return [pattern, {
      ...seed, cause: causeFor(foundation, seed.title), action: seed.intervention, foundation, ...experimentDefaults('none', pattern), ...rule,
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
      return catalog[signal.pattern] ? [signal.pattern] : [];
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
      const contextualDefaults = experimentDefaults(constraint, pattern);
      const evidence: RecommendationEvidence = { supportingParticipants: supporters.size, applicablePopulation, contradictingParticipants: contradictors.size, patterns, layers, profiles };
      const reasons = [
        `Padrão sustentado por ${supporters.size} de ${applicablePopulation} jornadas aplicáveis.`,
        `Posterior bayesiano formado por ${patterns.length} evidência(s), ${layers.length} camada(s) e ${profiles.length || 1} perspectiva(s).`,
        ...(contradictors.size ? [`Contradição específica em ${contradictors.size} jornada(s).`] : []),
        ...(constraint !== 'none' ? [`Restrição observada: ${constraint}.`] : []),
      ];
      return [{ ...definition, kind, detailCapability: capability, pattern, constraint, support: clamp(support), confidence, priority: priorityOf(sourceSignals, support), reasons, evidence, experiment: { action: definition.action, owner: definition.owner === 'Responsável pela capacidade com o time' ? contextualDefaults.owner : definition.owner, metric: definition.metric, reviewHorizon: definition.reviewHorizon, successCriterion: definition.successCriterion } }];
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
function experimentDefaults(constraint: ConstraintKind, pattern = ''): Pick<InterventionDefinition, 'owner' | 'metric' | 'reviewHorizon' | 'successCriterion'> {
  const owners: Record<ConstraintKind, string> = { none: 'Responsável pela capacidade com o time', knowledge: 'Liderança técnica com a disciplina habilitadora', process: 'Responsável pelo fluxo com as pessoas que executam o processo', tooling: 'Engenharia com plataforma', access: 'Plataforma e segurança com representantes dos times', architecture: 'Times proprietários com liderança de arquitetura', organization: 'Liderança organizacional com os times afetados', governance: 'Responsável pela governança com executores do fluxo', culture: 'Liderança de pessoas com o grupo afetado' };
  return { owner: owners[constraint], metric: metricFor(pattern), reviewHorizon: horizonFor(pattern), successCriterion: successFor(pattern) };
}
function causeFor(foundation: InterventionFoundation, observedEffect: string): string {
  const causes: Record<string, string> = {
    'Continuous Delivery': 'O caminho de mudança não produz feedback pequeno, frequente e reproduzível sob as condições observadas.',
    'Qualidade no fluxo': 'O risco entra tarde ou depende de uma etapa especializada, impedindo feedback durante a construção.',
    'SRE / blameless postmortem': 'Impacto, responsabilidade, diagnóstico e aprendizado não formam um ciclo operacional contínuo.',
    'Team Topologies': 'Fronteiras, prioridades ou carga cognitiva exigem coordenação fora do fluxo para concluir o trabalho.',
    'Governança habilitadora': 'O controle não diferencia risco com evidências capazes de mudar o caminho ou a decisão.',
    'Well-Architected / platform engineering': 'A capacidade depende de intervenção especializada em vez de um caminho suportado e repetível.',
    'Well-Architected — Security': 'Identidade ou acesso dependem de concessão artesanal sem escopo, validade e trilha adequados.',
    'Lean / Accelerate': 'Incentivos e capacidade favorecem iniciar ou concluir trabalho, sem reconciliar resultado e custo de atraso.',
    'Arquitetura evolutiva / DDD': 'O limite ou significado compartilhado permanece implícito e transfere custo para coordenação e mudanças futuras.',
    'Dados como produto': 'O significado ou contrato do dado muda sem ownership e compatibilidade visíveis aos consumidores.',
    'Discovery e evidência de uso': 'A experiência entra depois da decisão e não possui evidência com poder para reabrir o investimento.',
    'Data literacy / SRE': 'A decisão usa um agregado sem considerar denominador, distribuição e incerteza do recorte.',
    'Resilience engineering / SRE': 'Espera, repetição e isolamento da dependência não foram definidos pelo impacto aceitável.',
    'Uso responsável de assistência': 'A assistência entra no fluxo sem supervisão, rastreabilidade ou proteção proporcional ao risco.',
    'Melhoria contínua': 'O problema é reconhecido, mas não recebe ownership, capacidade e revisão de efeito suficientes para mudar o sistema.',
  };
  const mechanism = causes[foundation.source] ?? 'A condição observada permanece sem um mecanismo estável de feedback e revisão de efeito.';
  return `${mechanism} Neste recorte, o efeito observado é: ${lowerFirst(observedEffect)}.`;
}
function metricFor(pattern: string): string {
  if (/reconhecimento|incentivo/.test(pattern)) return 'decisões de reconhecimento que citam efeito observado e diferença entre trabalho iniciado e resultado alcançado';
  if (/incidente|diagnostico|telemetria|observ|deteccao/.test(pattern)) return 'tempo até detectar, formar hipótese e mitigar; recorrência da mesma classe de falha';
  if (/integracao|release|deploy|entrega|empacotamento/.test(pattern)) return 'lead time, espera até feedback e taxa de falha ou retrabalho da mudança';
  if (/qualidade|teste|regressao|seguranca|vulnerab/.test(pattern)) return 'tempo de feedback, escapes por risco e retrabalho após a verificação';
  if (/produto|discovery|resultado|portfolio|prioridade/.test(pattern)) return 'tempo até evidência, decisões alteradas e trabalho interrompido por hipótese invalidada';
  if (/governanca|controle|permissao|acesso|aprovacao/.test(pattern)) return 'tempo de espera, exceções e proporção de decisões realmente alteradas pelo controle';
  if (/cloud|infraestrutura|plataforma|provisionamento/.test(pattern)) return 'tempo de provisão ou recuperação, falhas manuais e adoção do caminho suportado';
  if (/dado|contrato|schema|significado|numero|reconciliacao/.test(pattern)) return 'consumidores impactados, divergências de definição e tempo até reconciliar o significado';
  if (/design|interface|experiencia|jornada/.test(pattern)) return 'conclusão da jornada, abandono e retrabalho de interface após evidência de uso';
  if (/arquitet|acoplamento|fronteira|termo|glossario|complexidade|camada/.test(pattern)) return 'grupos envolvidos, espera de coordenação e esforço da próxima mudança equivalente';
  if (/aprend|melhoria|acao|cerimonia|recorrencia/.test(pattern)) return 'ações com efeito revisado, recorrência do padrão e tempo até incorporar o aprendizado';
  if (isAssistancePattern(pattern)) return 'retrabalho, achados de revisão e mudanças assistidas explicáveis por outra pessoa';
  if (/carga|heroi|ownership|coordenacao|dependencia/.test(pattern)) return 'tempo bloqueado, trocas de contexto e intervenções externas para concluir o fluxo';
  return 'tempo de espera, recorrência e efeito observado na capacidade afetada';
}
function successFor(pattern: string): string {
  if (/reconhecimento|incentivo/.test(pattern)) return 'o próximo ciclo de reconhecimento usa evidência de efeito sem premiar volume, heroísmo ou risco oculto';
  if (/incidente|diagnostico|telemetria|observ|deteccao/.test(pattern)) return 'o próximo evento é detectado e mitigado mais cedo sem ampliar acesso ou exposição de dados';
  if (/produto|discovery|resultado|portfolio|prioridade/.test(pattern)) return 'a próxima revisão altera continuidade, escopo ou capacidade a partir de evidência do resultado, não apenas do plano concluído';
  if (/integracao|release|deploy|entrega/.test(pattern)) return 'a próxima mudança atravessa o fluxo em lote menor, com feedback mais cedo e sem aumento de falhas';
  if (/governanca|controle|permissao|aprovacao/.test(pattern)) return 'casos de baixo risco fluem mais rápido e decisões de alto risco preservam evidência e auditoria';
  if (/dado|contrato|schema|significado|numero/.test(pattern)) return 'a próxima mudança preserva significado e compatibilidade sem reconciliação posterior dos consumidores';
  if (/design|interface|experiencia|jornada/.test(pattern)) return 'evidência de uso altera a próxima decisão e reduz abandono ou retrabalho sem ocultar outro segmento';
  if (/arquitet|acoplamento|fronteira|termo|complexidade|camada/.test(pattern)) return 'a próxima mudança equivalente envolve menos coordenação sem deslocar acoplamento para outro limite';
  if (/aprend|melhoria|acao|cerimonia|recorrencia/.test(pattern)) return 'a ação é revisada por efeito e reduz a recorrência observada, não apenas concluída';
  if (isAssistancePattern(pattern)) return 'outra pessoa explica e revisa a próxima mudança assistida sem ampliar retrabalho ou exposição de dados';
  return 'a métrica escolhida melhora no período sem deslocar risco ou espera para outra etapa';
}
function horizonFor(pattern: string): string {
  if (/incidente|diagnostico|telemetria|deteccao|resilien/.test(pattern)) return 'no próximo exercício controlado ou incidente equivalente';
  if (/portfolio|incentivo|lideranca|resultado/.test(pattern)) return 'no próximo ciclo de decisão de investimento';
  if (/cloud|plataforma|provisionamento|credencial|acesso/.test(pattern)) return 'nas próximas cinco utilizações do caminho';
  return 'na próxima mudança equivalente, com revisão em até 30 dias';
}
function isAssistancePattern(pattern: string): boolean {
  return pattern.startsWith('ia-') || pattern.includes('assistencia-de-modelo');
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
