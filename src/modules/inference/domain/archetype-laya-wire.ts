import type { DecisionClient } from './decision-client.js';
import { isAllowedLayaBaseUrl } from './laya-base-url.js';
import {
  createLayaDecisionClient,
  type CreateLayaDecisionClientOptions,
} from './laya-decision-client-factory.js';

export type ResolveArchetypeDecisionClientInput = {
  mode: 'archetype' | 'case';
  env: NodeJS.Dict<string>;
  noLaya: boolean;
  createClient?: (options: CreateLayaDecisionClientOptions) => DecisionClient | null;
};

/** Resolves optional Laya DecisionClient for archetype CLI. */
export function resolveArchetypeDecisionClient(
  input: ResolveArchetypeDecisionClientInput,
): DecisionClient | undefined {
  if (input.mode !== 'archetype' || input.noLaya) {
    return undefined;
  }

  const baseUrl = input.env.LAYA_BASE_URL;
  if (!baseUrl || !isAllowedLayaBaseUrl(baseUrl)) {
    return undefined;
  }

  const createClient = input.createClient ?? createLayaDecisionClient;
  const client = createClient({ baseUrl });
  return client ?? undefined;
}
