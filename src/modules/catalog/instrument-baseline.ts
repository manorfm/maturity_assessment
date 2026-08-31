import {
  GRAPH_VERSION,
  SECONDS_PER_SCENARIO,
  typicalSuccessor,
  type AssessmentNode,
  type NodeVariant,
  type Profile,
} from './assessment-graph.js';
import type { InterventionDefinition } from '../inference/domain/group-recommendation-engine.js';
import type { ExplicitFoundation } from '../inference/domain/intervention-foundations.js';

export type BaselineInput = {
  graph: AssessmentNode[];
  nodeVariants: NodeVariant[];
  profiles: Record<Profile, string>;
  interventions: Record<string, InterventionDefinition>;
  foundations: Record<string, ExplicitFoundation>;
};

export type InstrumentBaseline = ReturnType<typeof measureInstrumentBaseline>;

const genericFoundation = 'A intervenção ataca o comportamento observado, não um inventário de práticas.';

export function measureInstrumentBaseline(input: BaselineInput) {
  const profileIds = Object.keys(input.profiles) as Profile[];
  const paths = Object.fromEntries(profileIds.map((profile) => [profile, typicalPath(profile)])) as Record<Profile, string[]>;
  const commonTrunkNodes = intersection(Object.values(paths)).size;
  const byType = countBy(input.graph, (node) => node.type ?? 'scenario');
  const profileVariants = Object.fromEntries(profileIds.map((profile) => [
    profile,
    input.nodeVariants.filter((variant) => variant.profile === profile).length,
  ])) as Record<Profile, number>;
  const routes = Object.fromEntries(profileIds.map((profile) => {
    const scenarios = paths[profile].length;
    return [profile, { scenarios, estimatedMinutes: Math.max(1, Math.ceil((scenarios * SECONDS_PER_SCENARIO) / 60)) }];
  })) as Record<Profile, { scenarios: number; estimatedMinutes: number }>;
  const repeatedFoundationGroups = Object.entries(groupPatternsByFoundation(input.foundations))
    .filter(([, patterns]) => patterns.length > 1)
    .map(([foundation, patterns]) => ({ foundation, count: patterns.length, patterns: [...patterns].sort() }))
    .sort((left, right) => right.count - left.count || left.foundation.localeCompare(right.foundation));
  const patternsWithGenericFoundation = Object.entries(input.foundations)
    .filter(([, foundation]) => foundation.why === genericFoundation)
    .map(([pattern]) => pattern)
    .sort();

  return {
    graphVersion: GRAPH_VERSION,
    nodes: {
      total: input.graph.length,
      byType: {
        context: byType.context ?? 0,
        scenario: byType.scenario ?? 0,
        probe: byType.probe ?? 0,
      },
    },
    routes,
    authorship: {
      commonTrunkNodes,
      commonTrunkRatio: ratio(commonTrunkNodes, input.graph.length),
      profileVariants,
      causalProbeNodes: input.graph.filter((node) => node.type === 'probe' && node.options.some((option) => option.signals.some((signal) => signal.pattern.startsWith('causa-')))).length,
      nodesWithoutVisibilityExit: input.graph.filter((node) => node.id !== 'respondent-context' && !node.options.some((option) => option.observation === 'visibility')).length,
    },
    direction: {
      totalInterventions: Object.keys(input.interventions).length,
      genericFoundations: patternsWithGenericFoundation.length,
      patternsWithGenericFoundation,
      repeatedFoundationGroups,
      withoutExplicitGuidance: Object.values(input.interventions).filter((intervention) => intervention.guidanceStatus !== 'explicit').length,
      withoutPrerequisiteContract: Object.values(input.interventions).filter((intervention) => !Object.hasOwn(intervention, 'prerequisites')).length,
    },
  };
}

function typicalPath(profile: Profile): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  let current: string | undefined = 'respondent-context';
  while (current && !seen.has(current)) {
    result.push(current);
    seen.add(current);
    current = typicalSuccessor(current, profile);
  }
  return result;
}

function intersection(values: string[][]): Set<string> {
  const [first = [], ...rest] = values;
  return new Set(first.filter((value) => rest.every((items) => items.includes(value))));
}

function countBy<T>(values: T[], keyOf: (value: T) => string): Record<string, number> {
  const result: Record<string, number> = {};
  for (const value of values) {
    const key = keyOf(value);
    result[key] = (result[key] ?? 0) + 1;
  }
  return result;
}

function groupPatternsByFoundation(foundations: Record<string, ExplicitFoundation>): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [pattern, item] of Object.entries(foundations)) {
    const foundation = item.why;
    result[foundation] = [...(result[foundation] ?? []), pattern];
  }
  return result;
}

function ratio(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Number((numerator / denominator).toFixed(3));
}

export type InstrumentGapFixture = {
  id: string;
  title: string;
  status: 'known-gap';
  observedFacts: readonly string[];
  currentLimitation: string;
  expectedFutureBehavior: string;
  protectedInvariant: string;
};

export const instrumentGapFixtures: readonly InstrumentGapFixture[] = [
  {
    id: 'full-cycle-without-sre',
    title: 'Time full-cycle sem SRE dedicado',
    status: 'known-gap',
    observedFacts: ['Desenvolvimento recebe alertas e decide contenção.', 'O mesmo grupo altera código, infraestrutura e operação com guardrails.'],
    currentLimitation: 'O perfil amplo não representa simultaneamente construção e operação e pode deixar aprofundamentos relevantes em ramos separados.',
    expectedFutureBehavior: 'Responsabilidades exercidas abrem cenários operacionais sem exigir cargo de SRE e preservam a evidência de autonomia com responsabilidade.',
    protectedInvariant: 'Ausência de SRE não gera fragilidade; somente comportamento, consequência, consistência e aprendizado sustentam o diagnóstico.',
  },
  {
    id: 'late-security-feedback',
    title: 'Feedback de segurança chega tarde',
    status: 'known-gap',
    observedFacts: ['Um achado relevante aparece perto da liberação.', 'A análise automática existe, mas seu retorno ou tratamento não altera a mudança a tempo.'],
    currentLimitation: 'O catálogo reconhece scanners, mas não reconstrói duração, precisão, ownership, bloqueio, exceção e efeito por família de risco.',
    expectedFutureBehavior: 'A entrevista separa o mecanismo tardio e só então condiciona técnica de segurança e família de ferramenta ao risco demonstrado.',
    protectedInvariant: 'Presença ou ausência de SAST não pontua e scanner não substitui modelagem de ameaça, autorização ou decisão contextual de risco.',
  },
  {
    id: 'unsafe-environment-path',
    title: 'Caminho de ambiente sem autonomia segura',
    status: 'known-gap',
    observedFacts: ['Uma validação não planejada precisa de ambiente e dado adequados.', 'A espera ou o contorno mistura acesso, isolamento, concorrência e descarte.'],
    currentLimitation: 'Uma única escolha sobre ambiente comprime mecanismos diferentes e não reconstrói a jornada do pedido até o primeiro aprendizado.',
    expectedFutureBehavior: 'O evento separa provisionamento, acesso, dado, isolamento, custo, descarte, observabilidade e autoridade para evoluir o caminho.',
    protectedInvariant: 'Self-service ou ferramenta de ambiente não pontua; a capacidade depende de execução segura, repetível e útil no tempo da decisão.',
  },
  {
    id: 'unknown-technology-estate',
    title: 'Parque tecnológico e dependências não reconstruíveis',
    status: 'known-gap',
    observedFacts: ['Uma mudança ou incidente não encontra responsável e impacto.', 'Inventários, quando existem, não permitem reconstruir dependências ou criticidade.'],
    currentLimitation: 'Legado e ownership são observados, mas o instrumento não distingue inventário nominal de mapa arquitetural usado para decidir.',
    expectedFutureBehavior: 'A entrevista observa o efeito da falta de mapa e condiciona context map, catálogo de serviços, C4 ou mapa de dependências ao problema.',
    protectedInvariant: 'Não possuir documento ou ferramenta de inventário não reduz capacidade quando impacto, dependência e responsabilidade são reconstruíveis.',
  },
  {
    id: 'unusable-approved-tooling',
    title: 'Ferramenta homologada não produz caminho utilizável',
    status: 'known-gap',
    observedFacts: ['A organização mantém opções homologadas para uma necessidade recorrente.', 'Times não encontram, não acessam ou contornam o caminho aprovado.'],
    currentLimitation: 'O catálogo de plataforma cobre adoção geral, mas não caracteriza de modo explícito a decisão e a evolução do portfólio homologado.',
    expectedFutureBehavior: 'O diagnóstico distingue descoberta, acesso, adequação, suporte, redundância, exceção e retorno do uso antes de orientar consolidação.',
    protectedInvariant: 'Homologação não prova capacidade nem adequação; ferramenta continua contexto até produzir efeito seguro e observável no trabalho.',
  },
] as const;
