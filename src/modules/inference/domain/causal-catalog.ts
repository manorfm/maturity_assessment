import type { CausalFamily } from './causal-family.js';
import { causalFamilyFromSystem } from './causal-family-from-system.js';
import { diagnosticSystemCatalog } from './problem-system.js';

export const CAUSAL_CATALOG_VERSION = 'causal-catalog-v11';

/**
 * Família de referência 05 §8.4 (integração tardia / explaining away).
 * λ e priors do protótipo anexo-B; proveniência explícita (provisória até SHELF).
 * Substitui o sistema diagnóstico `integration-feedback` no catálogo v11.
 */
export const lateIntegrationFamily: CausalFamily = {
  id: 'late-integration',
  capability: 'continuous-integration',
  causes: [
    {
      id: 'feedback-lento',
      label: 'Feedback técnico lento',
      prior: 0.3,
      aliases: ['causa-ferramental-feedback'],
    },
    {
      id: 'aprovacao-externa',
      label: 'Aprovação ou política de lote',
      prior: 0.3,
      aliases: ['causa-processo-lote'],
    },
    {
      id: 'fronteira-de-times',
      label: 'Fronteira de times',
      prior: 0.2,
      aliases: ['causa-fronteira-times'],
    },
  ],
  symptoms: [
    {
      id: 'pr-espera',
      leak: 0.05,
      lambda: { 'feedback-lento': 0.6, 'aprovacao-externa': 0.4, 'fronteira-de-times': 0.2 },
      aliases: ['integracao-tardia', 'mudanca-isolada', 'integracao-por-janela'],
    },
    {
      id: 'aprovacao-necessaria',
      leak: 0.05,
      lambda: { 'feedback-lento': 0.02, 'aprovacao-externa': 0.8, 'fronteira-de-times': 0.1 },
      aliases: ['causa-processo-lote', 'controle-sem-proposito'],
    },
    {
      id: 'conflito-mesmo-servico',
      leak: 0.05,
      lambda: { 'feedback-lento': 0.05, 'aprovacao-externa': 0.05, 'fronteira-de-times': 0.7 },
      aliases: ['causa-fronteira-times', 'causa-acoplamento-entrega', 'acoplamento-coordenado'],
    },
  ],
  reporting: { p1: 0.6, p0: 0.1, phi: 10 },
  provenance: {
    author: 'framework-v0.10/05 §8.4',
    date: '2026-10-09',
    rationale: 'Parâmetros do protótipo de referência (anexo-B causal.py); provisórios até elicitação SHELF.',
  },
};

const migratedFamilies: CausalFamily[] = diagnosticSystemCatalog
  .filter((system) => system.id !== 'integration-feedback')
  .map(causalFamilyFromSystem);

export const causalCatalog: CausalFamily[] = [lateIntegrationFamily, ...migratedFamilies];

export function causalFamilyById(id: string): CausalFamily | undefined {
  return causalCatalog.find((family) => family.id === id);
}
