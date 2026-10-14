import type { ReportOutcomeKind } from './report-outcome.js';
import { disciplineScope } from './discipline-brief.js';
import { classifySophisticationQuadrant, type SophisticationQuadrant } from './sophistication-matrix.js';

export type NodeDefinition = { what: string; why: string };

export type StagePublication =
  | { published: false; gap: string }
  | { published: true; shares: readonly [number, number, number, number, number] };

export type QuadrantPublication =
  | { published: false }
  | { published: true; quadrant: SophisticationQuadrant; conduct: string };

export type HowItIs = { stage: StagePublication; quadrant: QuadrantPublication };

export type PreservePublication = { shown: boolean; body: string };

const stageGap = 'Ainda não publicamos a distribuição de estágio 0–4.';

const conductByQuadrant: Record<SophisticationQuadrant, string> = {
  'culture-without-tool': 'Neste quadrante, a conduta começa pelo meio, não por treinamento.',
  'tool-without-culture': 'Neste quadrante, a conduta começa pelo hábito, não por mais ferramenta.',
  beginning: 'Nem o hábito nem o meio sustentam a prática sozinhos.',
  'full-maturity': 'As pessoas querem e o meio ajuda. A conduta é preservar.',
};

export function projectNodeDefinition(id: string): NodeDefinition {
  const scope = disciplineScope(id);
  return { what: scope.covers, why: scope.treats };
}

export function projectHowItIs(input: {
  stageDistribution?: readonly [number, number, number, number, number];
  phase?: number;
  appropriation?: number;
}): HowItIs {
  const stage: StagePublication = input.stageDistribution
    ? { published: true, shares: input.stageDistribution }
    : { published: false, gap: stageGap };
  if (input.phase === undefined || input.appropriation === undefined) return { stage, quadrant: { published: false } };
  const quadrant = classifySophisticationQuadrant({ phase: input.phase, appropriation: input.appropriation });
  return { stage, quadrant: { published: true, quadrant, conduct: conductByQuadrant[quadrant] } };
}

export function projectPreserve(kind?: ReportOutcomeKind, body?: string): PreservePublication {
  if (kind === 'preserve' && body) return { shown: true, body };
  return { shown: false, body: 'O que já funciona entra quando a leitura é de preservação.' };
}
