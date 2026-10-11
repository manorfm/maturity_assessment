import type { EvidenceLink } from '../../catalog/evidence-contract.js';

export type SophisticationPhase = 0 | 1 | 2 | 3 | 4 | 5;

export type SophisticationQuadrant =
  | 'tool-without-culture'
  | 'full-maturity'
  | 'beginning'
  | 'culture-without-tool';

export type SophisticationReading = {
  leafId: string;
  label: string;
  phase: SophisticationPhase;
  appropriation: number;
  quadrant: SophisticationQuadrant;
  reading: string;
};

const quadrantReading: Record<SophisticationQuadrant, string> = {
  'tool-without-culture': 'Ferramenta sem cultura — tratar propósito, uso e confiança',
  'full-maturity': 'Maturidade plena — preservar e vigiar regressão',
  beginning: 'Início — construir mecanismo e entendimento juntos',
  'culture-without-tool': 'Cultura sem ferramenta — investir no mecanismo',
};

/** Sofisticação alta = F3–F5; apropriação alta = estágio 3–4 (12 §1). */
export function classifySophisticationQuadrant(input: {
  phase: number;
  appropriation: number;
}): SophisticationQuadrant {
  const highF = input.phase >= 3;
  const highA = input.appropriation >= 3;
  if (highF && !highA) return 'tool-without-culture';
  if (highF && highA) return 'full-maturity';
  if (!highF && highA) return 'culture-without-tool';
  return 'beginning';
}

/** R28: sofisticação não entra no índice — só a âncora de apropriação. */
export function sophisticationOutsideIndex(link: EvidenceLink): boolean {
  return link.sophistication !== undefined;
}

export function measureSophisticationPhase(phases: readonly number[]): SophisticationPhase {
  if (!phases.length) return 0;
  const mean = phases.reduce((sum, value) => sum + value, 0) / phases.length;
  return Math.max(0, Math.min(5, Math.round(mean))) as SophisticationPhase;
}

export function projectSophisticationMatrix(
  items: Array<{ leafId: string; label: string; phase: number; appropriation: number }>,
): SophisticationReading[] {
  return items.map((item) => {
    const phase = Math.max(0, Math.min(5, Math.floor(item.phase))) as SophisticationPhase;
    const appropriation = Math.max(0, Math.min(4, Math.floor(item.appropriation)));
    const quadrant = classifySophisticationQuadrant({ phase, appropriation });
    return {
      leafId: item.leafId,
      label: item.label,
      phase,
      appropriation,
      quadrant,
      reading: `${item.label}: F${phase} · apropriação ${appropriation} — ${quadrantReading[quadrant]}`,
    };
  });
}

export function clampSophisticationPhase(value: number): SophisticationPhase {
  return Math.max(0, Math.min(5, Math.floor(value))) as SophisticationPhase;
}
