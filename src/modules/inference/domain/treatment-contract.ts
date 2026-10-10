export type CynefinDomain = 'clear' | 'complicated' | 'complex' | 'chaotic';
export type EvidenceGrade = 'A' | 'B' | 'C' | 'D';

export type TreatmentConduct = {
  action: string;
  owner: string;
  success: string;
  horizon: '0-30' | '1-3' | '3-12';
  authority: 'direction' | 'management' | 'team' | 'specialist';
  cynefin?: CynefinDomain;
  evidenceGrade?: EvidenceGrade;
  doesNotSolve?: string;
  archetype?: string;
  prognosisWithoutTreatment?: string;
};

export function classifyCynefin(input: {
  mechanism?: string;
  authority?: string;
  severity?: string;
  prescription?: string;
}): CynefinDomain {
  if (input.severity === 'critical' || input.mechanism === 'external-dependency' && input.prescription === 'investigate') return 'chaotic';
  if (input.authority === 'architecture' || input.authority === 'platform') return 'complicated';
  if (input.prescription === 'ready' && (input.mechanism === 'process' || input.mechanism === 'tooling')) return 'clear';
  return 'complex';
}

/** Grau da conduta (08 §6.2): o quanto se sabe que esta prática produz o efeito, não o suporte local da amostra. */
export function classifyEvidenceGrade(input: {
  foundationSource?: string;
  matureReference?: string;
  replicated?: boolean;
}): EvidenceGrade {
  const text = `${input.foundationSource ?? ''} ${input.matureReference ?? ''}`.trim().toLowerCase();
  if (!text) return 'D';
  const strong = /dora|accelerate|continuous delivery|slsa|sre\b/.test(text);
  if (strong && input.replicated) return 'A';
  if (strong) return 'B';
  if (/consenso|prática amplamente|plataforma como produto|cncf|lean\b/.test(text)) return 'C';
  if (input.foundationSource || input.matureReference) return 'C';
  return 'D';
}

export const cynefinReading: Record<CynefinDomain, string> = {
  clear: 'A resposta é conhecida: aplicar',
  complicated: 'Exige análise de especialista',
  complex: 'Só se descobre testando: experimento pequeno',
  chaotic: 'Agir primeiro para estabilizar',
};

export const evidenceGradeReading: Record<EvidenceGrade, string> = {
  A: 'Vários estudos consistentes',
  B: 'Estudos observacionais consistentes',
  C: 'Consenso de prática, ainda sem estudo forte',
  D: 'Opinião ou analogia; tratar como hipótese',
};
