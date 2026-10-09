import type { EvidenceLink } from '../../catalog/evidence-contract.js';
import type { AnchoredResponse, Stage } from './stage-posterior.js';

const discriminationWeight = { low: 0.7, medium: 1, high: 1.4 } as const;

/** Converte uma linha da matriz Q em observação ancorada para o modelo m2. */
export function evidenceToAnchoredResponse(link: EvidenceLink, perspectiveReliability = 1): AnchoredResponse {
  return {
    anchor: link.anchorStage as Stage,
    options: [0, 1, 2, 3, 4],
    discrimination: discriminationWeight[link.discrimination],
    perspectiveReliability,
    severity: link.appropriation ? 0.5 : 0,
  };
}
