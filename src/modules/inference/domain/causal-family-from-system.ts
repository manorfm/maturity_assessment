import type { CausalFamily, CausalCause, CausalSymptom } from './causal-family.js';
import type { DiagnosticSystemDefinition } from './problem-system.js';

const DEFAULT_REPORTING = { p1: 0.6, p0: 0.1, phi: 10 } as const;

const capabilityBySystem: Record<string, string> = {
  'integration-feedback': 'continuous-integration',
  'ownership-boundaries': 'team-ownership',
  'learning-closure': 'organizational-learning',
  'product-feedback': 'portfolio-management',
  'platform-adoption': 'platform-autonomy',
  'governance-trust': 'enabling-governance',
  'workforce-capability': 'technical-capability',
  'legacy-continuity': 'sustainable-design',
  'operational-response': 'observability-practice',
  'quality-in-flow': 'quality-strategy',
  'cognitive-load': 'work-management',
};

/** λ discriminativos provisórios para famílias com teste de explaining away. */
const tunedLambda: Record<string, Record<string, Record<string, number>>> = {
  'learning-closure': {
    'acao-sem-fechamento': {
      'causa-acoes-sem-foco': 0.55,
      'causa-melhoria-sem-capacidade': 0.3,
      'causa-melhoria-sem-autonomia': 0.2,
      'causa-baixa-seguranca-psicologica': 0.35,
    },
    'retrospectiva-sem-fechamento': {
      'causa-acoes-sem-foco': 0.55,
      'causa-melhoria-sem-capacidade': 0.3,
      'causa-melhoria-sem-autonomia': 0.25,
      'causa-baixa-seguranca-psicologica': 0.3,
    },
    'postmortem-sem-efeito': {
      'causa-baixa-seguranca-psicologica': 0.82,
      'causa-melhoria-sem-autonomia': 0.4,
      'causa-acoes-sem-foco': 0.04,
      'causa-melhoria-sem-capacidade': 0.08,
    },
  },
  'operational-response': {
    'deteccao-tardia': {
      'causa-lacuna-telemetria': 0.7,
      'causa-ferramenta-observabilidade': 0.35,
      'causa-correlacao-arquitetural': 0.25,
      'causa-privacidade-operacional': 0.1,
    },
    'incidente-detectado-por-cliente': {
      'causa-lacuna-telemetria': 0.55,
      'causa-ferramenta-observabilidade': 0.3,
      'causa-correlacao-arquitetural': 0.2,
      'causa-privacidade-operacional': 0.1,
    },
    'incidente-depende-do-autor': {
      'causa-ferramenta-observabilidade': 0.65,
      'causa-lacuna-telemetria': 0.25,
      'causa-correlacao-arquitetural': 0.35,
      'causa-privacidade-operacional': 0.15,
    },
    'reversao-nao-reproduzivel': {
      'causa-correlacao-arquitetural': 0.5,
      'causa-lacuna-telemetria': 0.2,
      'causa-ferramenta-observabilidade': 0.25,
      'causa-privacidade-operacional': 0.15,
    },
    'war-room-como-gestao': {
      'causa-privacidade-operacional': 0.2,
      'causa-ferramenta-observabilidade': 0.45,
      'causa-lacuna-telemetria': 0.3,
      'causa-correlacao-arquitetural': 0.35,
    },
  },
};

function labelFor(pattern: string): string {
  return pattern
    .replace(/^causa-/, '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function priorFor(count: number): number {
  return Math.min(0.35, Math.round((0.85 / count) * 100) / 100);
}

function heuristicLambda(causes: string[], symptoms: string[]): Record<string, Record<string, number>> {
  const matrix: Record<string, Record<string, number>> = {};
  for (let symptomIndex = 0; symptomIndex < symptoms.length; symptomIndex += 1) {
    const symptom = symptoms[symptomIndex]!;
    matrix[symptom] = {};
    for (let causeIndex = 0; causeIndex < causes.length; causeIndex += 1) {
      const cause = causes[causeIndex]!;
      const primary = causeIndex % symptoms.length === symptomIndex;
      const adjacent = Math.abs(causeIndex - symptomIndex) === 1 || Math.abs(causeIndex - symptomIndex) === symptoms.length - 1;
      matrix[symptom]![cause] = primary ? 0.7 : adjacent ? 0.28 : 0.08;
    }
  }
  return matrix;
}

/**
 * Converte um sistema diagnóstico legado (hipótese vs unknown) em CausalFamily noisy-OR.
 * λ provisórios até elicitação SHELF; "unknown" vira vazamento λ₀.
 */
export function causalFamilyFromSystem(system: DiagnosticSystemDefinition): CausalFamily {
  const causes: CausalCause[] = system.hypotheses.map((id) => ({
    id,
    label: labelFor(id),
    prior: priorFor(system.hypotheses.length),
    aliases: [id],
  }));
  const lambda = tunedLambda[system.id] ?? heuristicLambda(system.hypotheses, system.symptoms);
  const symptoms: CausalSymptom[] = system.symptoms.map((symptomId, index) => {
    const primaryCause = system.hypotheses[index % system.hypotheses.length]!;
    return {
      id: symptomId,
      leak: 0.05,
      lambda: Object.fromEntries(system.hypotheses.map((causeId) => [causeId, lambda[symptomId]?.[causeId] ?? 0.1])),
      aliases: [symptomId, primaryCause, ...(system.amplifiers[index] ? [system.amplifiers[index]!] : [])],
    };
  });
  return {
    id: system.id,
    capability: capabilityBySystem[system.id] ?? system.id,
    causes,
    symptoms,
    reporting: { ...DEFAULT_REPORTING },
    provenance: {
      author: 'framework-v0.10/WP5 migration',
      date: '2026-10-09',
      rationale: `Parâmetros provisórios derivados do sistema diagnóstico ${system.id}; vazamento λ₀ substitui "unknown" até elicitação SHELF.`,
    },
  };
}
