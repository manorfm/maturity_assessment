export type CynefinDomain = 'clear' | 'complicated' | 'complex' | 'chaotic';
export type EvidenceGrade = 'A' | 'B' | 'C' | 'D';

/** Modalidade de aprendizado da conduta (23 §5). */
export type LearningMode =
  | 'course'
  | 'guided-practice'
  | 'immersion'
  | 'pair'
  | 'kata'
  | 'community'
  | 'rotation'
  | 'work-experiment';

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
  learningMode?: LearningMode;
  /** Degraus que esta conduta ajuda a desbloquear (23 §6). */
  unlocks?: string[];
  /** Curso/treinamento sem mudança de ambiente (23 §5). */
  lowTransferWarning?: boolean;
  /** “sem dependência” ou “depende de …” a partir do portfólio. */
  dependency?: string;
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

/**
 * Grau A exige achado empírico replicado (08 §6.2).
 * `replicated: true` no fundamento, ou corpus Accelerate/DORA multi-ano.
 */
export function foundationIsReplicated(foundation?: { source?: string; replicated?: boolean }): boolean {
  if (foundation?.replicated === true) return true;
  if (foundation?.replicated === false) return false;
  return /\b(accelerate|dora)\b/i.test(foundation?.source ?? '');
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

const cynefinLabel: Record<CynefinDomain, string> = {
  clear: 'Claro',
  complicated: 'Complicado',
  complex: 'Complexo',
  chaotic: 'Caótico',
};

const cynefinVerb: Record<CynefinDomain, string> = {
  clear: 'aplicar',
  complicated: 'analisar',
  complex: 'experimentar',
  chaotic: 'estabilizar',
};

export function cynefinLine(domain: CynefinDomain): string {
  return `${cynefinLabel[domain]} — ${cynefinVerb[domain]}`;
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

export const learningModeReading: Record<LearningMode, string> = {
  course: 'Curso ou treinamento isolado — transferência baixa sem mudar o ambiente',
  'guided-practice': 'Prática guiada no trabalho real',
  immersion: 'Imersão (dojo) no próprio trabalho',
  pair: 'Trabalho em par ou em grupo',
  kata: 'Kata — rotina curta e repetida',
  community: 'Comunidade de prática',
  rotation: 'Rodízio de pessoas',
  'work-experiment': 'Experimento no trabalho real',
};

/** Classifica a modalidade a partir do texto da conduta (23 §5). */
export function classifyLearningMode(action: string): LearningMode {
  const text = action.toLowerCase();
  if (/\b(curso|treinamento|workshop|certifica)/i.test(text)) return 'course';
  if (/\b(dojo|imers[aã]o)\b/i.test(text)) return 'immersion';
  if (/\bkata\b/i.test(text)) return 'kata';
  if (/\b(em par|pair|mob)\b/i.test(text)) return 'pair';
  if (/\b(rod[ií]zio|rota[cç][aã]o)\b/i.test(text)) return 'rotation';
  if (/\b(comunidade|guilda)\b/i.test(text)) return 'community';
  if (/\b(coach|coacha|habilita[cç]|acompanh)/i.test(text)) return 'guided-practice';
  return 'work-experiment';
}

export function transferWarningFor(mode: LearningMode): boolean {
  return mode === 'course';
}

export type TreatmentMatrixCellKey = TreatmentConduct['horizon'];

export type TreatmentMatrixRow = {
  authority: TreatmentConduct['authority'];
  label: string;
  subtitle: string;
  activeCount: number;
  totalCount: number;
  cells: Record<TreatmentMatrixCellKey, TreatmentConduct[]>;
};

export type TreatmentMatrix = {
  rows: TreatmentMatrixRow[];
  horizonHeaders: Record<TreatmentMatrixCellKey, string>;
};

const MATRIX_AUTHORITIES = ['direction', 'management', 'team', 'specialist'] as const;

const MATRIX_LABELS: Record<(typeof MATRIX_AUTHORITIES)[number], string> = {
  direction: 'Direção',
  management: 'Gestão',
  team: 'Times',
  specialist: 'Especialistas',
};

const MATRIX_SUBTITLES: Record<(typeof MATRIX_AUTHORITIES)[number], string> = {
  direction: 'decisão, política, investimento',
  management: 'processo e prioridades',
  team: 'prática do dia a dia',
  specialist: 'plataforma, SRE, segurança',
};

const MATRIX_HORIZON_HEADERS: Record<TreatmentMatrixCellKey, string> = {
  '0-30': '0–30 dias',
  '1-3': '1–3 meses',
  '3-12': '3–12 meses',
};

const MATRIX_HORIZONS = ['0-30', '1-3', '3-12'] as const;

/** Agrupa condutas publicadas em linhas de autoridade × colunas de horizonte. */
export function projectTreatmentMatrix(conducts: TreatmentConduct[]): TreatmentMatrix {
  const rows = MATRIX_AUTHORITIES.map((authority) => {
    const cells: Record<TreatmentMatrixCellKey, TreatmentConduct[]> = {
      '0-30': [],
      '1-3': [],
      '3-12': [],
    };
    for (const item of conducts) {
      if (item.authority === authority) cells[item.horizon].push(item);
    }
    const totalCount = MATRIX_HORIZONS.reduce((sum, horizon) => sum + cells[horizon].length, 0);
    return {
      authority,
      label: MATRIX_LABELS[authority],
      subtitle: MATRIX_SUBTITLES[authority],
      activeCount: cells['0-30'].length,
      totalCount,
      cells,
    };
  });
  return { rows, horizonHeaders: { ...MATRIX_HORIZON_HEADERS } };
}
