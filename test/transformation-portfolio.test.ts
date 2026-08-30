import assert from 'node:assert/strict';
import test from 'node:test';
import { TransformationPortfolioPlanner } from '../src/modules/inference/domain/transformation-portfolio.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';

function finding(overrides: Partial<OutcomeFinding> & Pick<OutcomeFinding, 'pattern' | 'detailCapability' | 'title'>): OutcomeFinding {
  return {
    kind: 'correction', cause: 'causa', intervention: 'intervenção', confidence: .8, priority: .8,
    mechanism: 'process', containment: 'team', decisionAuthority: 'team',
    prescription: { status: 'ready', reason: 'mecanismo discriminado' },
    solutionReadiness: { stage: 'not-demonstrated', label: 'Não demonstrada', explanation: 'capacidade ainda não demonstrada', evidence: 0 },
    ...overrides,
  };
}

test('sequencia estabilização, feedback, capacidade compartilhada, modelo operacional e adaptação', () => {
  const portfolio = TransformationPortfolioPlanner.plan([
    finding({ pattern: 'reskilling-sem-plano', detailCapability: 'technical-capability', title: 'Competências não acompanham a mudança', mechanism: 'knowledge' }),
    finding({ pattern: 'funding-sem-feedback', detailCapability: 'portfolio-management', title: 'Investimento não responde a resultado', mechanism: 'priority', containment: 'organizational-policy', decisionAuthority: 'portfolio-leadership' }),
    finding({ pattern: 'plataforma-fila', detailCapability: 'platform-autonomy', title: 'Times aguardam a mesma fila', mechanism: 'platform', containment: 'shared-service', decisionAuthority: 'platform' }),
    finding({ pattern: 'integracao-tardia', detailCapability: 'continuous-integration', title: 'Integração encontra conflito tarde' }),
    finding({ pattern: 'servico-sem-owner', detailCapability: 'team-ownership', title: 'Serviço não possui responsável', mechanism: 'organization', containment: 'organizational-structure', decisionAuthority: 'cross-team' }),
  ]);

  assert.deepEqual(portfolio.sequence.map((item) => item.phase), [
    'stabilize', 'shorten-feedback', 'shared-capability', 'operating-model', 'adaptive-capability',
  ]);
  assert.equal(portfolio.sequence[1]?.dependsOn[0], 'servico-sem-owner');
  assert.ok(portfolio.sequence.every((item) => item.prerequisites.length > 0));
  assert.ok(portfolio.sequence.every((item) => item.riskDisplacement.length > 0));
  assert.ok(portfolio.sequence.every((item) => item.cost && item.risk && item.reversibility));
});

test('suspende solução quando mecanismo ou contenção ainda precisa ser investigado', () => {
  const portfolio = TransformationPortfolioPlanner.plan([
    finding({ pattern: 'causa-incerta', detailCapability: 'collaboration', title: 'Coordenação falha', mechanism: 'undetermined', containment: 'undetermined', decisionAuthority: 'undetermined', prescription: { status: 'investigate', reason: 'falta localizar a restrição' } }),
  ]);
  assert.equal(portfolio.sequence.length, 0);
  assert.deepEqual(portfolio.conditioned, [{ pattern: 'causa-incerta', title: 'Coordenação falha', condition: 'falta localizar a restrição' }]);
});

test('não transforma um problema local independente em pré-condição organizacional', () => {
  const portfolio = TransformationPortfolioPlanner.plan([
    finding({ pattern: 'lote-local', detailCapability: 'work-management', title: 'Uma squad acumula trabalho' }),
    finding({ pattern: 'governanca-global', detailCapability: 'enabling-governance', title: 'Política trata riscos iguais', mechanism: 'governance', containment: 'organizational-policy', decisionAuthority: 'organizational-governance' }),
  ]);
  const organizational = portfolio.sequence.find((item) => item.pattern === 'governanca-global');
  assert.deepEqual(organizational?.dependsOn, []);
});

test('não inventa dependência entre intervenções de mecanismos independentes', () => {
  const portfolio = TransformationPortfolioPlanner.plan([
    finding({ pattern: 'policy', detailCapability: 'enabling-governance', title: 'Política acumula mudanças', mechanism: 'policy', containment: 'organizational-policy', decisionAuthority: 'organizational-governance', impacts: ['security'] }),
    finding({ pattern: 'tooling', detailCapability: 'sdlc-automation', title: 'Feedback automatizado é frágil', mechanism: 'tooling', containment: 'shared-service', decisionAuthority: 'platform' }),
  ]);
  assert.deepEqual(portfolio.sequence.find((item) => item.pattern === 'tooling')?.dependsOn, []);
});
