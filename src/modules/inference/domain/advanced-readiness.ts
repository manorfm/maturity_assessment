import { peakedDistribution } from '../../measurement/domain/hierarchical-pooling.js';
import type { StageDistribution } from '../../measurement/domain/measurement-params.js';
import {
  advancedPracticePhaseObservations,
  type ResponseObservation,
} from '../../measurement/domain/response-observation.js';
import type { SophisticationDistribution } from './sophistication-matrix.js';
import { expectedSophistication, modeSophistication, observeSophistication } from './sophistication-matrix.js';

export type ReadinessBand = 'ready' | 'near' | 'not-ready';

export type PrerequisitePosterior = {
  id: string;
  label: string;
  essential: boolean;
  probability: number;
};

export type PrerequisiteChecklistItem = {
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
  /** Checklist 22 §6: p_k de cada pré-requisito. */
  checklist: PrerequisiteChecklistItem[];
};

export type PracticeNextStep = {
  practiceId: string;
  practiceLabel: string;
  bottleneckLabel: string;
  leafId: string;
  probability: number;
  band: ReadinessBand;
  reading: string;
};

export type PracticePrerequisite = {
  id: string;
  label: string;
  leafId: string;
  minimumStage: number;
  /** Fase F mínima (12); p_k multiplica P(F ≥ mínimo) quando presente. */
  minimumPhase?: number;
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
  phaseDistribution?: SophisticationDistribution;
  /** Modo F provisório quando ainda não há posterior de sofisticação. */
  phase?: number;
};

/** P(S ≥ mínimo) a partir da posterior 0–4 (22 §1.1). */
export function probabilityStageAtLeast(distribution: StageDistribution, minimum: number): number {
  const floor = Math.max(0, Math.min(4, Math.floor(minimum)));
  let total = 0;
  for (let stage = floor; stage <= 4; stage += 1) total += distribution[stage]!;
  return round2(total);
}

/** P(F ≥ mínimo) a partir da posterior 0–5 (12 / 22 §1.1). */
export function probabilityPhaseAtLeast(distribution: SophisticationDistribution, minimum: number): number {
  const floor = Math.max(0, Math.min(5, Math.floor(minimum)));
  let total = 0;
  for (let phase = floor; phase <= 5; phase += 1) total += distribution[phase]!;
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
    checklist: input.prerequisites.map((item) => ({
      id: item.id,
      label: item.label,
      essential: item.essential,
      probability: item.probability,
    })),
  };
}

/** O status visível segue o essencial mais fraco. A média dos p_k não decide. */
export function bottleneckStatus(assessment: ReadinessAssessment): { bottleneck: string; band: ReadinessBand; line: string } {
  const essential = assessment.checklist.filter((item) => item.essential);
  const weakest = [...essential].sort((left, right) => left.probability - right.probability)[0];
  const probability = weakest?.probability ?? assessment.probability;
  const band: ReadinessBand = probability >= 0.6 ? 'ready' : probability >= 0.25 ? 'near' : 'not-ready';
  const bottleneck = weakest?.label ?? 'o pré-requisito essencial';
  return {
    bottleneck,
    band,
    line: `O status segue ${bottleneck}, o pré-requisito mais fraco. A média não decide.`,
  };
}

/**
 * Próximo degrau rumo a uma prática avançada (22 §6 / 16): um pré-requisito
 * por vez, o gargalo essencial, sem pular para a prática.
 */
export function nextStepTowardPractice(
  practice: AdvancedPractice,
  leaves: Record<string, LeafEvidence>,
): PracticeNextStep | undefined {
  const prerequisites = resolvePrerequisitePosteriors(practice, leaves);
  if (!prerequisites) {
    const gap = firstEssentialGap(practice, leaves);
    if (!gap) return undefined;
    return {
      practiceId: practice.id,
      practiceLabel: practice.label,
      bottleneckLabel: gap.label,
      leafId: gap.leafId,
      probability: 0,
      band: 'not-ready',
      reading: `Para ${practice.label}: próximo degrau é ${gap.label} (${gap.reason}); um degrau por vez até a prática.`,
    };
  }
  const technicalPhase = technicalPhaseFor(practice, leaves);
  const assessment = assessReadiness({
    prerequisites,
    ...(technicalPhase !== undefined ? { technicalPhase } : {}),
  });
  const bottleneck = practice.prerequisites.find((item) => item.id === assessment.bottleneckId)
    ?? practice.prerequisites.find((item) => item.essential);
  if (!bottleneck) return undefined;
  const probability = prerequisites.find((item) => item.id === bottleneck.id)?.probability ?? 0;
  if (assessment.band === 'ready') {
    return {
      practiceId: practice.id,
      practiceLabel: practice.label,
      bottleneckLabel: bottleneck.label,
      leafId: bottleneck.leafId,
      probability,
      band: assessment.band,
      reading: `${practice.label}: pré-requisitos essenciais no limiar de pronto; comece pequeno e monitore adoção prematura.`,
    };
  }
  return {
    practiceId: practice.id,
    practiceLabel: practice.label,
    bottleneckLabel: bottleneck.label,
    leafId: bottleneck.leafId,
    probability,
    band: assessment.band,
    reading: `Para ${practice.label}: próximo degrau é ${bottleneck.label} (gargalo · p_k ${probability.toFixed(2)}); um degrau por vez até a prática.`,
  };
}

function firstEssentialGap(
  practice: AdvancedPractice,
  leaves: Record<string, LeafEvidence>,
): { label: string; leafId: string; reason: string } | undefined {
  for (const prerequisite of practice.prerequisites.filter((item) => item.essential)) {
    const evidence = leaves[prerequisite.leafId];
    if (!distributionFor(evidence)) {
      return { label: prerequisite.label, leafId: prerequisite.leafId, reason: 'ainda sem evidência de estágio' };
    }
    if (prerequisite.minimumPhase !== undefined && !phaseDistributionFor(evidence)) {
      return {
        label: prerequisite.label,
        leafId: prerequisite.leafId,
        reason: `falta evidência de fase técnica F≥${prerequisite.minimumPhase}`,
      };
    }
  }
  return undefined;
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
 * (prontidão não inventa posterior). Com minimumPhase, exige evidência F.
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
    let probability = probabilityStageAtLeast(distribution, prerequisite.minimumStage);
    if (prerequisite.minimumPhase !== undefined) {
      const phaseDistribution = phaseDistributionFor(evidence);
      if (!phaseDistribution) {
        if (prerequisite.essential) return undefined;
        continue;
      }
      probability = round2(probability * probabilityPhaseAtLeast(phaseDistribution, prerequisite.minimumPhase));
    }
    resolved.push({
      id: prerequisite.id,
      label: prerequisite.label,
      essential: prerequisite.essential,
      probability,
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

function phaseDistributionFor(evidence?: LeafEvidence): SophisticationDistribution | undefined {
  if (!evidence) return undefined;
  if (evidence.phaseDistribution) return evidence.phaseDistribution;
  if (evidence.phase === undefined) return undefined;
  return observeSophistication([evidence.phase]);
}

/** Posterior F da prática avançada a partir das perguntas de evento (22). */
export function advancedPracticePhasesById(
  observations: ResponseObservation[],
  unitId?: string,
): Map<string, { distribution: SophisticationDistribution; phase: number; expected: number }> {
  const phasesByPractice = advancedPracticePhaseObservations(observations, unitId);
  const result = new Map<string, { distribution: SophisticationDistribution; phase: number; expected: number }>();
  for (const [practiceId, phases] of phasesByPractice) {
    const distribution = observeSophistication(phases);
    result.set(practiceId, {
      distribution,
      phase: modeSophistication(distribution),
      expected: expectedSophistication(distribution),
    });
  }
  return result;
}

/** Fase técnica da prática: declaração explícita ou maior F observado nos pré-requisitos. */
export function technicalPhaseFor(
  practice: AdvancedPractice,
  leaves: Record<string, LeafEvidence>,
): number | undefined {
  const declared = leaves[practice.id];
  const declaredDist = phaseDistributionFor(declared);
  if (declaredDist) return modeSophistication(declaredDist);
  if (declared?.phase !== undefined) return Math.max(0, Math.min(5, Math.floor(declared.phase)));

  let max = -1;
  for (const prerequisite of practice.prerequisites) {
    const dist = phaseDistributionFor(leaves[prerequisite.leafId]);
    if (!dist) continue;
    max = Math.max(max, modeSophistication(dist));
  }
  return max >= 0 ? max : undefined;
}

export type PrematureAdoptionFinding = {
  practiceId: string;
  practiceLabel: string;
  technicalPhase: number;
  bottleneckId?: string;
  weakEssentials: string[];
  title: string;
  reading: string;
  action: string;
};

/** Achados 22 §1.1: F da prática ≥ 3 e algum essencial com p_k < 0,3. */
export function detectPrematureAdoptions(
  leaves: Record<string, LeafEvidence>,
  practices: AdvancedPractice[] = advancedPracticeCatalog,
): PrematureAdoptionFinding[] {
  const findings: PrematureAdoptionFinding[] = [];
  for (const practice of practices) {
    const prerequisites = resolvePrerequisitePosteriors(practice, leaves);
    if (!prerequisites) continue;
    const technicalPhase = technicalPhaseFor(practice, leaves);
    if (technicalPhase === undefined) continue;
    const assessment = assessReadiness({ prerequisites, technicalPhase });
    if (!assessment.premature) continue;
    const weakEssentials = prerequisites
      .filter((item) => item.essential && item.probability < 0.3)
      .map((item) => item.label);
    const bottleneck = weakEssentials[0] ?? assessment.missing[0] ?? 'os pré-requisitos essenciais';
    findings.push({
      practiceId: practice.id,
      practiceLabel: practice.label,
      technicalPhase,
      ...(assessment.bottleneckId ? { bottleneckId: assessment.bottleneckId } : {}),
      weakEssentials,
      title: `Adoção prematura: ${practice.label}`,
      reading: `A fase técnica (F${technicalPhase}) está à frente de pré-requisitos essenciais (${bottleneck}). É risco do sistema de trabalho, não culpa de uma pessoa.`,
      action: `Reduzir o escopo de ${practice.label} até os pré-requisitos essenciais subirem; não ampliar automação nem raio de impacto.`,
    });
  }
  return findings;
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
  minimumPhase?: number,
): PracticePrerequisite => ({
  id,
  label,
  leafId,
  minimumStage,
  essential,
  ...(minimumPhase !== undefined ? { minimumPhase } : {}),
});

/** Biblioteca 22 §5 — práticas avançadas com pré-requisitos tipados. */
export const advancedPracticeCatalog: AdvancedPractice[] = [
  {
    id: 'chaos-engineering',
    label: 'Chaos engineering',
    prerequisites: [
      prereq('observability', 'Observabilidade', 'observability-practice', 3, true, 3),
      prereq('steady-state', 'Estado estável', 'reliability-practice', 3, true),
      prereq('incident-response', 'Resposta a incidentes', 'incident-management', 2, true, 2),
      prereq('rollback', 'Reversão', 'release-feedback', 3, true, 3),
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
      prereq('ci', 'Integração contínua', 'continuous-integration', 3, true, 3),
      prereq('owner', 'Quem escreve o código escreve os testes', 'quality-strategy', 2, true),
      prereq('feedback', 'Feedback técnico no pipeline', 'sdlc-automation', 3, true),
      prereq('env', 'Ambientes reproduzíveis', 'reproducible-infrastructure', 2, false),
      prereq('obs', 'Observabilidade para verificar em produção', 'observability-practice', 2, false, 3),
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
    id: 'continuous-delivery',
    label: 'Entrega contínua',
    prerequisites: [
      prereq('tests', 'Testes confiáveis', 'quality-strategy', 3, true, 3),
      prereq('rollback', 'Reversão', 'release-feedback', 3, true),
      prereq('obs', 'Observabilidade', 'observability-practice', 3, true),
      prereq('risk', 'Aprovação por risco', 'enabling-governance', 2, true),
      prereq('ci', 'Integração contínua', 'continuous-integration', 3, false),
    ],
  },
  {
    id: 'trunk-based',
    label: 'Desenvolvimento no tronco',
    prerequisites: [
      prereq('ci', 'CI rápido', 'continuous-integration', 3, true),
      prereq('flags', 'Feature flags / liberação desacoplada', 'release-feedback', 3, true),
      prereq('tests', 'Testes confiáveis', 'quality-strategy', 2, true),
      prereq('feedback', 'Feedback técnico ágil', 'sdlc-automation', 3, true),
    ],
  },
  {
    id: 'slo-error-budget',
    label: 'SLO com política de error budget',
    prerequisites: [
      prereq('obs', 'Observabilidade', 'observability-practice', 3, true),
      prereq('slo', 'Estado estável / SLO', 'reliability-practice', 3, true),
      prereq('product', 'Acordo com produto', 'product-direction', 2, true),
      prereq('authority', 'Autoridade para pausar entregas', 'leadership-management', 2, true),
    ],
  },
  {
    id: 'platform-as-product',
    label: 'Plataforma como produto',
    prerequisites: [
      prereq('self-service', 'Autosserviço com guardrails', 'platform-autonomy', 3, true),
      prereq('product', 'Estratégia de produto da plataforma', 'product-direction', 2, true),
      prereq('consumers', 'Times consumidores definidos', 'team-ownership', 2, true),
      prereq('infra', 'Infraestrutura reproduzível', 'reproducible-infrastructure', 2, false),
    ],
  },
  {
    id: 'aiops-remediation',
    label: 'Remediação automática (AIOps)',
    prerequisites: [
      prereq('obs', 'Observabilidade', 'observability-practice', 3, true, 4),
      prereq('runbooks', 'Resposta a incidentes / runbooks', 'incident-management', 3, true),
      prereq('rollback', 'Reversão', 'release-feedback', 3, true),
      prereq('trust', 'Confiança no alerta', 'reliability-practice', 2, true),
    ],
  },
  {
    id: 'cell-architecture',
    label: 'Arquitetura em células ou microsserviços',
    prerequisites: [
      prereq('ownership', 'Ownership por domínio', 'team-ownership', 3, true),
      prereq('obs', 'Observabilidade distribuída', 'observability-practice', 3, true),
      prereq('deploy', 'Automação de deploy', 'release-feedback', 3, true),
      prereq('contracts', 'Contratos entre serviços', 'integration-data', 2, true),
    ],
  },
  {
    id: 'data-mesh',
    label: 'Data mesh',
    prerequisites: [
      prereq('data', 'Domínios e contratos de dados', 'integration-data', 3, true),
      prereq('ownership', 'Dono por domínio', 'team-ownership', 2, true),
      prereq('governance', 'Governança federada', 'enabling-governance', 2, true),
      prereq('literacy', 'Letramento de dados', 'technical-capability', 2, true),
    ],
  },
  {
    id: 'zero-trust',
    label: 'Zero Trust',
    prerequisites: [
      prereq('identity', 'Identidade forte', 'cloud-security', 3, true),
      prereq('devsec', 'Segurança na entrega', 'software-security', 2, true),
      prereq('access-obs', 'Observabilidade de acesso', 'observability-practice', 2, true),
      prereq('segment', 'Segmentação / infra como código', 'reproducible-infrastructure', 2, true),
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
  {
    id: 'cost-optimization',
    label: 'Otimização automática de custo',
    prerequisites: [
      prereq('tags', 'Tags, dono e unit economics', 'cloud-efficiency', 3, true),
      prereq('ownership', 'Dono do gasto', 'team-ownership', 2, true),
      prereq('guardrails', 'Guardrails de custo', 'enabling-governance', 2, true),
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
