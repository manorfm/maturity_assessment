import type {
  CatalogItem,
  FreeTextItem,
  GroupReferentItem,
  ListTechniqueItem,
  LiteracyItem,
  VignetteItem,
} from './item-types.js';

/** Vinheta 07 §4.3 — aprovação de mudança (âncora autoral 1). */
export const approvalChangeVignette: VignetteItem = {
  id: 'vignette-approval-change',
  kind: 'vignette',
  title: 'Aprovação de mudança (vinheta)',
  scenario: 'Num time, as mudanças ficam prontas na segunda-feira, mas só vão para os usuários na quinta, depois que três pessoas de áreas diferentes assinam um formulário. Quem assina raramente olha o código.',
  prompt: 'Qual destas descrições melhor representa a situação deste time?',
  leafId: 'enabling-governance',
  authorAnchor: 1,
  options: [
    { id: 'opaque', label: 'Ninguém sabe quem decide liberar; a mudança aparece ou some sem explicação.', anchor: 0 },
    { id: 'ritual', label: 'Há assinaturas e formulários, mas a decisão não muda com o que está na mudança.', anchor: 1 },
    { id: 'repeatable', label: 'A aprovação existe com critérios locais, ainda frágeis quando a urgência sobe.', anchor: 2 },
    { id: 'managed', label: 'Critérios e riscos são explícitos; a aprovação muda com evidência.', anchor: 3 },
    { id: 'adaptive', label: 'O time já revisou o próprio processo de aprovação com base no que falhou antes.', anchor: 4 },
  ],
};

/** Leitura 07 §4.2 — quadro de fluxo (WIP). */
export const literacyWipChart: LiteracyItem = {
  id: 'literacy-wip-chart',
  kind: 'literacy',
  title: 'Leitura de fluxo',
  scenario: 'Um quadro mostra, ao longo de oito semanas, quantos itens estão em cada etapa.',
  prompt: 'Se este fosse o quadro do seu time, o que você faria primeiro na segunda-feira?',
  stimulus: 'A faixa "aguardando teste" cresce todas as semanas e a faixa "concluído" quase não sobe.',
  leafId: 'work-management',
  readings: [
    { id: 'stop-starting', label: 'Parar de começar itens novos e ajudar a esvaziar "aguardando teste".', verdict: 'correct' },
    { id: 'faster-dev', label: 'Pedir para o time trabalhar mais rápido em desenvolvimento.', verdict: 'incorrect' },
    { id: 'hire-devs', label: 'Contratar mais desenvolvedores.', verdict: 'incorrect' },
    { id: 'keep-busy', label: 'Não mudar nada; o gráfico mostra que o time está ocupado.', verdict: 'incorrect' },
    { id: 'cannot-read', label: 'Não sei interpretar este gráfico.', verdict: 'literacy-absent' },
  ],
};

/** Referente de grupo 07 §4.1 — clima. */
export const groupErrorReferent: GroupReferentItem = {
  id: 'group-error-climate',
  kind: 'group-referent',
  title: 'Erro no time',
  scenario: 'Pense nas últimas vezes em que algo deu errado neste time.',
  prompt: 'Neste time, quando alguém erra de forma visível, o que costuma acontecer depois?',
  leafId: 'leadership-management',
  options: [
    { id: 'hide', label: 'A pessoa tenta resolver sozinha e o restante do time só fica sabendo se o impacto cresce.', anchor: 0 },
    { id: 'blame', label: 'Buscam quem errou e cobram explicação individual.', anchor: 1 },
    { id: 'local-fix', label: 'Ajustam o procedimento local, sem rever o que no sistema favoreceu o erro.', anchor: 2 },
    { id: 'learn', label: 'Reconstroem condições e mudam algo no fluxo com dono e revisão.', anchor: 3 },
    { id: 'adapt', label: 'Já houve erro parecido; a mudança anterior foi revista para ver se funcionou.', anchor: 4 },
  ],
};

/** Técnica de lista 07 §4.4 — tema sensível organizacional. */
export const metricManipulationList: ListTechniqueItem = {
  id: 'list-metric-manipulation',
  kind: 'list-technique',
  title: 'Lista de práticas de métrica',
  scenario: 'Pense no cotidiano deste time nos últimos três meses.',
  prompt: 'Quantas destas afirmações são verdadeiras neste time?',
  leafId: 'leadership-management',
  neutralStatements: [
    'O time usa um quadro compartilhado para ver o trabalho em andamento.',
    'Reuniões de planejamento acontecem em dia fixo.',
    'Há um canal para pedir ajuda entre times.',
    'Alguém registra decisões de prioridade por escrito.',
  ],
  sensitiveStatement: 'Alguém já ajustou a forma de contar um indicador para parecer melhor do que o trabalho real.',
  minimumSample: 40,
};

export const freeTextStrategy: FreeTextItem = {
  id: 'free-text-strategy-purpose',
  kind: 'free-text',
  title: 'Razão do trabalho',
  scenario: 'Pense no trabalho mais importante que você fez na última semana.',
  prompt: 'Em uma frase, a que objetivo ou resultado ele serve?',
  leafId: 'product-direction',
  maxChars: 280,
  codebookVersion: 'strategy-purpose-v1',
};

export const itemCatalog: CatalogItem[] = [
  approvalChangeVignette,
  literacyWipChart,
  groupErrorReferent,
  metricManipulationList,
  freeTextStrategy,
];

export const freeTextPipeline = {
  enabledByDefault: false,
  requiresHumanReview: true,
  minCohenKappa: 0.7,
  randomReviewRate: 0.2,
};

/** Remove nomes próprios simples, times, clientes e datas precisas (07 §6). */
export function stripPii(text: string): string {
  return text
    .replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, '[data]')
    .replace(/\b(ACME|Pagamentos|Orbital)\b/gi, '[org]')
    .replace(/\b[A-ZÁÉÍÓÚÂÊÔÃÕ][a-záéíóúâêôãõç]+(?:\s+[A-ZÁÉÍÓÚÂÊÔÃÕ][a-záéíóúâêôãõç]+)?\b/g, (match) => {
      const stop = new Set(['Neste', 'Quando', 'Pense', 'Falamos', 'Sobre', 'Para', 'Com', 'Uma', 'Este', 'Esta', 'Depois', 'Antes']);
      return stop.has(match.split(/\s/)[0]!) ? match : '[nome]';
    })
    .replace(/\bequipe\s+\[nome\]/gi, 'equipe [time]')
    .replace(/\bcliente\s+\[org\]/gi, 'cliente [org]');
}

/**
 * δ̂_r = média(resposta − âncora da vinheta), encolhida com n pequeno (05 §4.1).
 */
export function estimatePerspectiveSeverity(input: {
  vignette: VignetteItem;
  choices: Array<{ perspective: string; chosenAnchor: number }>;
}): Record<string, number> {
  const byPerspective = new Map<string, number[]>();
  for (const choice of input.choices) {
    const deltas = byPerspective.get(choice.perspective) ?? [];
    deltas.push(choice.chosenAnchor - input.vignette.authorAnchor);
    byPerspective.set(choice.perspective, deltas);
  }
  const result: Record<string, number> = {};
  for (const [perspective, deltas] of byPerspective) {
    const mean = deltas.reduce((sum, value) => sum + value, 0) / deltas.length;
    const shrink = deltas.length / (deltas.length + 2);
    result[perspective] = Number((mean * shrink).toFixed(3));
  }
  return result;
}

/**
 * Prevalência pela diferença de médias (Blair & Imai). Só publica com n ≥ 40 por braço.
 */
export function estimateListTechniquePrevalence(input: {
  controlMean: number;
  treatmentMean: number;
  controlN: number;
  treatmentN: number;
}): { publishable: boolean; prevalence?: number; interval?: [number, number]; reason?: string } {
  const minimum = metricManipulationList.minimumSample;
  if (input.controlN < minimum || input.treatmentN < minimum) {
    return { publishable: false, reason: `Técnica de lista exige ≥ ${minimum} pessoas por braço.` };
  }
  const prevalence = input.treatmentMean - input.controlMean;
  const se = Math.sqrt((1.5 / input.controlN) + (1.5 / input.treatmentN));
  const margin = 1.645 * se;
  return {
    publishable: true,
    prevalence: Number(prevalence.toFixed(3)),
    interval: [Number((prevalence - margin).toFixed(3)), Number((prevalence + margin).toFixed(3))],
  };
}
