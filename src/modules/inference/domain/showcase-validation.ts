export type WaveSixShowcaseCaseId =
  | 'low-autonomy-handoffs'
  | 'full-cycle-without-sre'
  | 'specialist-organization'
  | 'same-symptom-different-causes'
  | 'unknown-technology-estate'
  | 'strong-practice-simple-tool';

export type ShowcaseMechanism = 'tooling-feedback' | 'batch-policy' | 'architecture-coupling';

export type WaveSixShowcaseCase = {
  id: WaveSixShowcaseCaseId;
  title: string;
  observation: string;
  expectedDistinction: string;
  nonInference: string;
  expectedMechanisms?: ShowcaseMechanism[];
};

export const WAVE_SIX_SHOWCASE_CASES: readonly WaveSixShowcaseCase[] = [
  {
    id: 'low-autonomy-handoffs',
    title: 'Baixa autonomia e muitos handoffs',
    observation: 'Uma mudança recente espera ambiente, aprovação, qualidade ou operação fora do fluxo do time.',
    expectedDistinction: 'Separa capacidade do time da espera imposta por acesso, política, prioridade ou dependência externa.',
    nonInference: 'Não atribui fragilidade pela existência de especialistas nem pela ausência de autosserviço nominal.',
  },
  {
    id: 'full-cycle-without-sre',
    title: 'Time full-cycle sem SRE dedicado',
    observation: 'Desenvolvimento entrega, opera e recupera o serviço com limites seguros e aprendizado demonstrável.',
    expectedDistinction: 'Reconhece autonomia e responsabilidade exercidas sem exigir um cargo especializado.',
    nonInference: 'Não pontua a ausência de SRE nem presume que autonomia significa acesso irrestrito.',
  },
  {
    id: 'specialist-organization',
    title: 'Organização com especialidades',
    observation: 'Plataforma, segurança e arquitetura participam de mudanças por modos de interação observáveis.',
    expectedDistinction: 'Avalia tempo, adequação, efeito, retorno e fronteira decisória das interações.',
    nonInference: 'Não concede capacidade pela presença nominal das áreas ou de seus processos.',
  },
  {
    id: 'same-symptom-different-causes',
    title: 'Mesmo sintoma, causas diferentes',
    observation: 'Mudanças permanecem isoladas apesar de tentativas concretas de integrar mais cedo.',
    expectedDistinction: 'Publica intervenções e autoridades diferentes para feedback instável, política de lote e acoplamento arquitetural.',
    nonInference: 'Não recomenda uma esteira apenas porque a entrega é lenta.',
    expectedMechanisms: ['tooling-feedback', 'batch-policy', 'architecture-coupling'],
  },
  {
    id: 'unknown-technology-estate',
    title: 'Parque tecnológico desconhecido',
    observation: 'Numa mudança concreta, impacto, dependências ou autoridade não podem ser reconstruídos.',
    expectedDistinction: 'Orienta mapa mínimo usado na decisão e mede tempo para localizar impacto e ownership.',
    nonInference: 'Não transforma inventário, catálogo ou diagrama existente em evidência de capacidade.',
  },
  {
    id: 'strong-practice-simple-tool',
    title: 'Prática forte com ferramenta simples',
    observation: 'O comportamento resiste à urgência, produz retorno e modifica o trabalho mesmo com mecanismo técnico simples.',
    expectedDistinction: 'Preserva a prática pelo efeito observado e pelo ciclo de aprendizado.',
    nonInference: 'Não reduz capacidade pela ausência de produto sofisticado ou marca homologada.',
  },
] as const;

export const COGNITIVE_VALIDATION_PROTOCOL = {
  version: 'cognitive-validation-v1',
  minimumInterviewsPerPerspective: 5,
  syntheticEvidenceAccepted: false,
  observations: [
    'scenario-comprehension',
    'concrete-event-retrieval',
    'option-fit',
    'option-overlap',
    'artificial-terms',
    'desirable-answer-bias',
    'autonomy-recognition',
    'guidance-utility-and-explanation',
  ],
} as const;

export type ShowcaseCoverageReport = {
  syntheticCoverageComplete: boolean;
  humanValidationSatisfied: false;
  coveredCaseIds: WaveSixShowcaseCaseId[];
  missingCaseIds: WaveSixShowcaseCaseId[];
};

export function evaluateShowcaseCoverage(caseIds: readonly WaveSixShowcaseCaseId[]): ShowcaseCoverageReport {
  const known = new Set(WAVE_SIX_SHOWCASE_CASES.map((item) => item.id));
  const coveredCaseIds = [...new Set(caseIds)].filter((id) => known.has(id));
  const covered = new Set(coveredCaseIds);
  const missingCaseIds = WAVE_SIX_SHOWCASE_CASES.map((item) => item.id).filter((id) => !covered.has(id));
  return {
    syntheticCoverageComplete: missingCaseIds.length === 0,
    humanValidationSatisfied: false,
    coveredCaseIds,
    missingCaseIds,
  };
}
