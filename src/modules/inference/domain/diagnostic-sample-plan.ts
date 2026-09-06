import { graph, interviewTrackPath, type Profile } from '../../catalog/assessment-graph.js';
import { RespondentWorkContext, type WorkContextOptionId } from '../../assessments/domain/respondent-work-context.js';
import { capabilityPillarIds, leavesOfPillar, pillarIdForLeaf } from './capability-taxonomy.js';

export const SAMPLE_POLICY = {
  anonymityMinimum: 5,
  languageCheck: 8,
  findingSupport: 2,
  leafPatterns: 2,
  triangulationPerPerspective: 5,
  calibrationJourneys: 50,
} as const;

export type SampleGate = 'language-check' | 'unit-diagnosis' | 'cross-unit-comparison' | 'organizational-diagnostic' | 'perspective-triangulation' | 'calibration';
export type SampleRole = { profile: Profile; workContext: WorkContextOptionId };
export type SampleUnitPlan = { id: string; people: number; roles: SampleRole[] };

export type DiagnosticSamplePlan = {
  gate: SampleGate;
  totalPeople: number;
  units: SampleUnitPlan[];
  observablePillars: string[];
  unpublishedPillars: string[];
  extraAxesDoNotIncreasePrecision: true;
  calibrationReady: false;
  summary: string;
  why: string[];
  blockers: string[];
};

export const COVERAGE_ROLES: readonly SampleRole[] = [
  { profile: 'engineering', workContext: 'build-focused' },
  { profile: 'engineering', workContext: 'build-and-operate' },
  { profile: 'platform', workContext: 'shared-capability' },
  { profile: 'quality', workContext: 'quality-and-risk' },
  { profile: 'security', workContext: 'quality-and-risk' },
  { profile: 'architecture', workContext: 'architecture-and-boundaries' },
  { profile: 'product', workContext: 'product-and-outcomes' },
  { profile: 'management', workContext: 'people-and-portfolio' },
  { profile: 'data', workContext: 'data-and-experience' },
];

export type SampleProgress = {
  target: DiagnosticSamplePlan;
  invited: number;
  completed: number;
  eligibleUnits: number;
  readyToDiagnose: boolean;
  blockers: string[];
  summary: string;
};

export class DiagnosticSamplePlanner {
  static forGate(gate: SampleGate, options: { unitCount?: number } = {}): DiagnosticSamplePlan {
    if (gate === 'language-check') return languageCheckPlan();
    if (gate === 'unit-diagnosis') return packRoles([COVERAGE_ROLES[0]!, COVERAGE_ROLES[0]!, COVERAGE_ROLES[0]!, COVERAGE_ROLES[2]!, COVERAGE_ROLES[6]!], 1, gate);
    if (gate === 'cross-unit-comparison') {
      const delivery = [COVERAGE_ROLES[0]!, COVERAGE_ROLES[0]!, COVERAGE_ROLES[0]!, COVERAGE_ROLES[6]!, COVERAGE_ROLES[7]!];
      return packRoles([...delivery, ...delivery], 2, gate);
    }
    if (gate === 'perspective-triangulation') return triangulationPlan(options.unitCount ?? 1);
    if (gate === 'calibration') return calibrationPlan();
    return organizationalPlan(options.unitCount ?? 2);
  }

  static evaluate(input: { gate: SampleGate; units: Array<{ id: string; roles: SampleRole[] }> }): DiagnosticSamplePlan {
    const target = DiagnosticSamplePlanner.forGate(input.gate, { unitCount: Math.max(1, input.units.length) });
    const roles = input.units.flatMap((unit) => unit.roles);
    const pillars = observablePillars(roles);
    const smallUnits = input.units.filter((unit) => unit.roles.length > 0 && unit.roles.length < SAMPLE_POLICY.anonymityMinimum);
    const blockers = [
      ...target.blockers,
      ...(roles.length < target.totalPeople ? [`Ainda faltam ${target.totalPeople - roles.length} pessoas para o gate ${gateLabel(input.gate)}.`] : []),
      ...smallUnits.map((unit) => `A unidade ${unit.id} tem ${unit.roles.length} pessoas; o limiar de anonimato é ${SAMPLE_POLICY.anonymityMinimum}.`),
    ];
    const unpublished = capabilityPillarIds.filter((pillar) => !pillars.includes(pillar));
    return {
      ...target,
      units: input.units.map((unit) => ({ id: unit.id, people: unit.roles.length, roles: unit.roles })),
      totalPeople: roles.length,
      observablePillars: pillars,
      unpublishedPillars: unpublished,
      blockers,
      summary: blockers.length
        ? `A alocação ainda não sustenta ${gateLabel(input.gate)}.`
        : target.summary,
    };
  }

  static progress(units: Array<{ id: string; invited: number; completed: number }>): SampleProgress {
    const target = DiagnosticSamplePlanner.forGate('organizational-diagnostic');
    const invited = units.reduce((total, unit) => total + unit.invited, 0);
    const completed = units.reduce((total, unit) => total + unit.completed, 0);
    const eligibleUnits = units.filter((unit) => unit.completed >= SAMPLE_POLICY.anonymityMinimum || unit.invited >= SAMPLE_POLICY.anonymityMinimum).length;
    const completedEligible = units.filter((unit) => unit.completed >= SAMPLE_POLICY.anonymityMinimum).length;
    const blockers = [
      ...(eligibleUnits < 2 ? ['O experimento real precisa de duas unidades com pelo menos cinco pessoas em cada uma.'] : []),
      ...(invited < target.totalPeople ? [`Ainda faltam ${target.totalPeople - invited} convites para o diagnóstico organizacional (${target.totalPeople} pessoas).`] : []),
      ...(completed < target.totalPeople || completedEligible < 2 ? ['A leitura organizacional só se publica com 18 respostas, sendo pelo menos cinco em cada uma de duas unidades.'] : []),
    ];
    const readyToDiagnose = completed >= target.totalPeople && completedEligible >= 2;
    return {
      target,
      invited,
      completed,
      eligibleUnits,
      readyToDiagnose,
      blockers: readyToDiagnose ? [] : blockers,
      summary: readyToDiagnose
        ? 'A amostra atinge o diagnóstico organizacional. Calibração e triangulação das nove lentes continuam gates separados.'
        : `Para o experimento real: ${target.totalPeople} pessoas em duas unidades, com trilhas complementares — não um radar de quinze eixos.`,
    };
  }
}

export function observableLeavesForRole(role: SampleRole): string[] {
  const track = RespondentWorkContext.fromOption(role.workContext).interviewTrack;
  const leaves = new Set<string>();
  for (const nodeId of interviewTrackPath(track, role.profile)) {
    const node = graph.find((candidate) => candidate.id === nodeId);
    for (const option of node?.options ?? []) {
      if (option.observation && option.observation !== 'practice') continue;
      for (const signal of option.signals) for (const detail of signal.details) {
        if (pillarIdForLeaf(detail)) leaves.add(detail);
      }
    }
  }
  return [...leaves].sort();
}

export function observablePillars(roles: readonly SampleRole[]): string[] {
  const leaves = new Set(roles.flatMap((role) => observableLeavesForRole(role)));
  return capabilityPillarIds.filter((pillar) => {
    const required = Math.ceil(leavesOfPillar(pillar).length / 2);
    const observed = leavesOfPillar(pillar).filter((leaf) => leaves.has(leaf)).length;
    return observed >= required;
  });
}

function languageCheckPlan(): DiagnosticSamplePlan {
  const roles = Array.from({ length: SAMPLE_POLICY.languageCheck }, () => COVERAGE_ROLES[0]!);
  return {
    gate: 'language-check',
    totalPeople: SAMPLE_POLICY.languageCheck,
    units: [{ id: 'unidade-unica', people: SAMPLE_POLICY.languageCheck, roles }],
    observablePillars: observablePillars(roles),
    unpublishedPillars: capabilityPillarIds.filter((pillar) => !observablePillars(roles).includes(pillar)),
    extraAxesDoNotIncreasePrecision: true,
    calibrationReady: false,
    summary: 'Oito pessoas em uma unidade sustentam checagem de linguagem. Não publicam os oito pilares nem comparam squads.',
    why: [
      'O limiar de anonimato é cinco; oito pessoas numa unidade permitem leitura agregada inicial.',
      'Cada pessoa percorre de dois a quatro eventos, não o catálogo inteiro.',
      'Mais eixos no radar não aumentam precisão: sem trilhas complementares os pilares continuam não avaliados.',
    ],
    blockers: [],
  };
}

function triangulationPlan(unitCount: number): DiagnosticSamplePlan {
  const perspectives: Profile[] = ['management', 'product', 'quality', 'engineering', 'platform', 'architecture', 'security', 'data', 'design'];
  const roles = perspectives.flatMap((profile) => Array.from({ length: SAMPLE_POLICY.triangulationPerPerspective }, () => ({
    profile,
    workContext: defaultContextFor(profile),
  })));
  return packRoles(roles, unitCount, 'perspective-triangulation');
}

function calibrationPlan(): DiagnosticSamplePlan {
  return {
    gate: 'calibration',
    totalPeople: SAMPLE_POLICY.calibrationJourneys,
    units: [{ id: 'coorte-rotulada', people: SAMPLE_POLICY.calibrationJourneys, roles: [] }],
    observablePillars: [...capabilityPillarIds],
    unpublishedPillars: [],
    extraAxesDoNotIncreasePrecision: true,
    calibrationReady: false,
    summary: 'Calibração exige 50 a 100 jornadas rotuladas por especialistas. Não é o gate do primeiro experimento real.',
    why: [
      'Rótulos cegos e entrevistas cognitivas humanas não podem ser substituídos por massa sintética.',
      'O primeiro experimento real é o diagnóstico organizacional, não a calibração do posterior.',
    ],
    blockers: ['Calibração permanece bloqueada até rótulos humanos; sintéticos não abrem este gate.'],
  };
}

function organizationalPlan(unitCount: number): DiagnosticSamplePlan {
  const withSupport = COVERAGE_ROLES.flatMap((role) => [role, role]);
  return packRoles(withSupport, unitCount, 'organizational-diagnostic');
}

function packRoles(roles: SampleRole[], unitCount: number, gate: SampleGate): DiagnosticSamplePlan {
  const padded = padForAnonymity(roles, unitCount);
  const units = splitUnits(padded, unitCount);
  const pillars = observablePillars(padded);
  const unpublished = capabilityPillarIds.filter((pillar) => !pillars.includes(pillar));
  return {
    gate,
    totalPeople: padded.length,
    units,
    observablePillars: pillars,
    unpublishedPillars: unpublished,
    extraAxesDoNotIncreasePrecision: true,
    calibrationReady: false,
    summary: summaryFor(gate, padded.length, unitCount, pillars.length, unpublished.length),
    why: [
      'Precisão vem de padrões independentes, trilhas complementares e concordância — não de mais eixos no radar.',
      'Um finding exige pelo menos duas pessoas no mesmo padrão; um pilar exige metade das folhas com dois padrões cada.',
      `O gate ${gateLabel(gate)} precisa de ${padded.length} pessoas em ${unitCount} unidade(s).`,
      'Um diretor recebe o resultado das entrevistas quando há problemas publicados ou uma leitura de preservar. Discriminar no detalhe significa causa ainda não amarrada — mais pessoas ou mais eixos não resolvem isso sozinhos.',
      'A entrevista curta (dois a quatro eventos) não visita os aprofundamentos de perfil; produto, plataforma cloud e qualidade profunda podem permanecer não avaliados mesmo com amostra suficiente.',
      ...(unpublished.length ? [`Com o catálogo de opções das trilhas, ${unpublished.map(pillarLabel).join(', ')} continuam fora do alcance.`] : []),
    ],
    blockers: unpublished.length && gate === 'organizational-diagnostic'
      ? [`O instrumento ainda não observa ${unpublished.length} pilar(es) com esta mistura de trilhas.`]
      : [],
  };
}

function padForAnonymity(roles: SampleRole[], unitCount: number): SampleRole[] {
  const minimum = unitCount * SAMPLE_POLICY.anonymityMinimum;
  const padded = [...roles];
  while (padded.length < minimum) padded.push(COVERAGE_ROLES[0]!);
  return padded;
}

function splitUnits(roles: SampleRole[], unitCount: number): SampleUnitPlan[] {
  const units = Array.from({ length: unitCount }, (_, index) => ({ id: `unidade-${index + 1}`, roles: [] as SampleRole[] }));
  roles.forEach((role, index) => units[index % unitCount]!.roles.push(role));
  return units.filter((unit) => unit.roles.length).map((unit) => ({ id: unit.id, people: unit.roles.length, roles: unit.roles }));
}

function defaultContextFor(profile: Profile): WorkContextOptionId {
  if (profile === 'management') return 'people-and-portfolio';
  if (profile === 'product') return 'product-and-outcomes';
  if (profile === 'quality' || profile === 'security') return 'quality-and-risk';
  if (profile === 'platform') return 'shared-capability';
  if (profile === 'architecture') return 'architecture-and-boundaries';
  if (profile === 'data' || profile === 'design') return 'data-and-experience';
  return 'build-focused';
}

function summaryFor(gate: SampleGate, people: number, units: number, pillars: number, unpublished: number): string {
  if (gate === 'unit-diagnosis') return `${people} pessoas em uma unidade podem publicar findings locais. Não comparam squads nem cobrem os oito pilares.`;
  if (gate === 'cross-unit-comparison') return `${people} pessoas em ${units} unidades permitem separar problema local de restrição compartilhada.`;
  if (gate === 'perspective-triangulation') return `${people} pessoas sustentam triangulação das nove perspectivas (cinco em cada lente).`;
  if (unpublished === 0) return `${people} pessoas em ${units} unidades sustentam diagnóstico organizacional com os oito pilares observáveis.`;
  return `${people} pessoas em ${units} unidades sustentam diagnóstico organizacional com ${pillars} pilares observáveis; ${unpublished} permanecem não avaliados.`;
}

function gateLabel(gate: SampleGate): string {
  if (gate === 'language-check') return 'checagem de linguagem';
  if (gate === 'unit-diagnosis') return 'diagnóstico de uma unidade';
  if (gate === 'cross-unit-comparison') return 'comparação entre unidades';
  if (gate === 'organizational-diagnostic') return 'diagnóstico organizacional';
  if (gate === 'perspective-triangulation') return 'triangulação por perspectiva';
  return 'calibração empírica';
}

function pillarLabel(id: string): string {
  return id;
}
