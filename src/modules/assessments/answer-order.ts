import { createHash } from 'node:crypto';
import type { Option } from '../catalog/assessment-graph.js';

export function orderAssessmentOptions(options: Option[], participationKey: string, nodeKey: string): Option[] {
  const practice = options.filter((option) => (option.observation ?? 'practice') === 'practice');
  const observational = options.filter((option) => (option.observation ?? 'practice') !== 'practice');
  return [...practice].sort((left, right) => rank(participationKey, nodeKey, left.id) - rank(participationKey, nodeKey, right.id)).concat(observational);
}

function rank(participationKey: string, nodeKey: string, optionKey: string): number {
  return createHash('sha256').update(`${participationKey}:${nodeKey}:${optionKey}`).digest().readUInt32BE(0);
}
