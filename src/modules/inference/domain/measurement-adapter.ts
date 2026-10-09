import type { LeafPublication } from '../../measurement/domain/runtime-bridge.js';
import type { IndexPublication } from './stage-posterior.js';

export function leafPublicationToIndex(publication: LeafPublication): IndexPublication {
  if (publication.publishable === 'published') {
    return {
      published: true,
      index: publication.index,
      band: publication.band,
      coverage: publication.coverage,
    };
  }
  return {
    published: false,
    reason: publication.reason ?? 'Ainda não há amostra suficiente para publicar índice.',
  };
}
