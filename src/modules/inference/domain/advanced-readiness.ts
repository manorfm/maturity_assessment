import { peakedDistribution } from '../../measurement/domain/hierarchical-pooling.js';
import type { StageDistribution } from '../../measurement/domain/measurement-params.js';

export type ReadinessBand = 'ready' | 'near' | 'not-ready';

export type PrerequisitePosterior = {
  id: string;
  label: string;
  essential: boolean;
  probability: number;
};

export type ReadinessAssessment = {
  probability: number;
  comfort: number;
  band: ReadinessBand;
  bottleneckId?: string;
  premature: boolean;
  missing: string[];
};

export type PracticePrerequisite = {
  id: string;
  label: string;
  leafId: string;
  minimumStage: number;
  essential: boolean;
};

export type AdvancedPractice = {
  id: string;
  label: string;
  prerequisites: PracticePrerequisite[];
};

export type LeafEvidence = {
  distribution?: StageDistribution;
  level?: number;
  coverage?: number;
};

/** P(S ≥ mínimo) a partir da posterior 0–4 (22 §1.1). */
export function probabilityStageAtLeast(distribution: StageDistribution, minimum: number): number {
  const floor = Math.max(0, Math.min(4, Math.floor(minimum)));
  let total = 0;
  for (let stage = floor; stage <= 4; stage += 1) total += distribution[stage]!;
  return round2(total);
}

export function assessReadiness(input: {
  prerequisites: PrerequisitePosterior[];
  technicalPhase?: number;
}): ReadinessAssessment {
  const essential = input.prerequisites.filter((item) => item.essential);
  const comfort = input.prerequisites.filter((item) => !item.essential);
  const probability = round2(essential.reduce((product, item) => product * item.probability, 1));
  const comfortMean = comfort.length
    ? comfort.reduce((sum, item) => sum + item.probability, 0) / comfort.length
    : 1;
  const bottleneck = [...essential].sort((left, right) => left.probability - right.probability)[0];
  const premature = (input.technicalPhase ?? 0) >= 3 && essential.some((item) => item.probability < 0.3);
  const band: ReadinessBand = probability >= 0.6 ? 'ready' : probability >= 0.25 ? 'near' : 'not-ready';
  return {
    probability,
    comfort: round2(probability * comfortMean),
    band,
    ...(bottleneck ? { bottleneckId: bottleneck.id } : {}),
    premature,
    missing: essential.filter((item) => item.probability < 0.7).map((item) => item.label),
  };
}

export function projectPracticeReadiness(
  practice: AdvancedPractice,
  prerequisites: PrerequisitePosterior[],
  technicalPhase?: number,
): ReadinessAssessment {
  return assessReadiness({
    prerequisites,
    ...(technicalPhase !== undefined ? { technicalPhase } : {}),
  });
}

/**
 * Resolve p_k por folha. Sem evidência em algum essencial, devolve undefined
 * (prontidão não inventa posterior).
 */
export function resolvePrerequisitePosteriors(
  practice: AdvancedPractice,
  leaves: Record<string, LeafEvidence>,
): PrerequisitePosterior[] | undefined {
  const resolved: PrerequisitePosterior[] = [];
  for (const prerequisite of practice.prerequisites) {
    const evidence = leaves[prerequisite.leafId];
    const distribution = distributionFor(evidence);
    if (!distribution) {
      if (prerequisite.essential) return undefined;
      continue;
    }
    resolved.push({
      id: prerequisite.id,
      label: prerequisite.label,
      essential: prerequisite.essential,
      probability: probabilityStageAtLeast(distribution, prerequisite.minimumStage),
    });
  }
  if (!resolved.some((item) => item.essential)) return undefined;
  return resolved;
}

function distributionFor(evidence?: LeafEvidence): StageDistribution | undefined {
  if (!evidence) return undefined;
  if (evidence.distribution) return evidence.distribution;
  if (evidence.coverage !== undefined && evidence.coverage < 1) return undefined;
  if (evidence.level === undefined) return undefined;
  const index = Math.max(0, Math.min(100, (evidence.level / 4) * 100));
  return peakedDistribution(index);
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

const prereq = (
  id: string,
  label: string,
  leafId: string,
  minimumStage: number,
  essential: boolean,
): PracticePrerequisite => ({ id, label, leafId, minimumStage, essential });

/** Biblioteca inicial 22 §5 — chaos, QA, AI-DLC e service mesh. */
export const advancedPracticeCatalog: AdvancedPractice[] = [
  {
    id: 'chaos-engineering',
    label: 'Chaos engineering',
    prerequisites: [
      prereq('observability', 'Observabilidade', 'observability-practice', 3, true),
      prereq('steady-state', 'Estado estável', 'reliability-practice', 3, true),
      prereq('incident-response', 'Resposta a incidentes', 'incident-management', 2, true),
      prereq('rollback', 'Reversão', 'release-feedback', 3, true),
      prereq('learning', 'Aprendizado com incidentes', 'organizational-learning', 3, true),
      prereq('infra', 'Infraestrutura reproduzível', 'reproducible-infrastructure', 3, false),
      prereq('deps', 'Mapa de dependências', 'integration-data', 2, false),
    ],
  },
  {
    id: 'quality-automation',
    label: 'Automação de qualidade',
    prerequisites: [
      prereq('design', 'Testabilidade no design', 'sustainable-design', 2, true),
      prereq('ci', 'Integração contínua', 'continuous-integration', 3, true),
      prereq('owner', 'Quem escreve o código escreve os testes', 'quality-strategy', 2, true),
      prereq('feedback', 'Feedback técnico no pipeline', 'sdlc-automation', 3, true),
      prereq('env', 'Ambientes reproduzíveis', 'reproducible-infrastructure', 2, false),
      prereq('obs', 'Observabilidade para verificar em produção', 'observability-practice', 2, false),
    ],
  },
  {
    id: 'ai-dlc',
    label: 'AI-DLC',
    prerequisites: [
      prereq('gates', 'Verificação automatizada', 'sdlc-automation', 3, true),
      prereq('batches', 'Lotes pequenos e integração frequente', 'continuous-integration', 3, true),
      prereq('done', 'Critérios de conclusão explícitos', 'planning-refinement', 3, true),
      prereq('identity', 'Identidade e segredos para agentes', 'cloud-security', 2, true),
      prereq('platform', 'Plataforma com guardrails', 'platform-autonomy', 2, false),
      prereq('ops', 'Observabilidade na operação', 'observability-practice', 3, false),
    ],
  },
  {
    id: 'service-mesh',
    label: 'Service mesh',
    prerequisites: [
      prereq('orch', 'Orquestração estável', 'reproducible-infrastructure', 3, true),
      prereq('obs', 'Observabilidade', 'observability-practice', 3, true),
      prereq('platform', 'Plataforma com dono', 'platform-autonomy', 2, true),
      prereq('ownership', 'Ownership por serviço', 'team-ownership', 2, true),
    ],
  },
];

/** Exemplo numérico 22 §1.2 (p_k fixos para o teste de referência). */
export const chaosEngineeringExample: PrerequisitePosterior[] = [
  { id: 'observability', label: 'Observabilidade', essential: true, probability: 0.35 },
  { id: 'steady-state', label: 'Estado estável', essential: true, probability: 0.2 },
  { id: 'incident-response', label: 'Resposta a incidentes', essential: true, probability: 0.7 },
  { id: 'rollback', label: 'Reversão', essential: true, probability: 0.5 },
  { id: 'learning', label: 'Aprendizado com incidentes', essential: true, probability: 0.4 },
];
