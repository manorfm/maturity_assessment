import type { OutcomeFinding } from './report-outcome.js';

export type DiagnosticSystem<T extends OutcomeFinding = OutcomeFinding> = { id: string; label: string; findings: T[] };

const patternSystems: Record<string, { id: string; label: string }> = Object.fromEntries([
  system('integration-feedback', 'Integração e feedback tardios', ['mudanca-isolada', 'integracao-tardia', 'integracao-por-janela', 'causa-ferramental-feedback', 'automacao-sem-feedback', 'empacotamento-manual', 'regressao-crescente']),
  system('ownership-boundaries', 'Ownership, dependências e fronteiras', ['ownership-fragmentado', 'causa-fronteira-times', 'acoplamento-coordenado', 'dependencia-coordenada', 'causa-prioridade-entre-times', 'causa-dependencia-arquitetural']),
  system('learning-closure', 'Melhoria sem fechamento e capacidade', ['acao-sem-fechamento', 'causa-melhoria-sem-capacidade', 'causa-melhoria-sem-autonomia', 'retrospectiva-sem-fechamento']),
  system('product-feedback', 'Decisão de produto sem evidência antecipada', ['feedback-tardio', 'prazo-sem-aprendizado', 'prioridade-sem-foco', 'solucao-pronta']),
  system('platform-path', 'Ambientes, acesso e capacidade compartilhada', ['provisionamento-em-fila', 'acesso-artesanal', 'ambiente-inconsistente', 'causa-permissao-sem-autonomia']),
  system('risk-control', 'Risco e controles no fluxo', ['controle-indiferenciado', 'controle-sem-feedback', 'controle-sem-proposito', 'seguranca-tardia']),
  system('operational-response', 'Detecção, resposta e recuperação', ['deteccao-tardia', 'incidente-detectado-por-cliente', 'incidente-depende-do-autor', 'causa-lacuna-telemetria']),
].flat());

const fallbackByCapability: Record<string, { id: string; label: string }> = {
  'product-direction': { id: 'product-value', label: 'Direção, descoberta e investimento' },
  'discovery-validation': { id: 'product-value', label: 'Direção, descoberta e investimento' },
  'portfolio-management': { id: 'product-value', label: 'Direção, descoberta e investimento' },
  'planning-refinement': { id: 'delivery-flow', label: 'Planejamento e fluxo de entrega' },
  'work-management': { id: 'delivery-flow', label: 'Planejamento e fluxo de entrega' },
  'continuous-integration': { id: 'integration-feedback', label: 'Integração e feedback tardios' },
  'release-feedback': { id: 'integration-feedback', label: 'Integração e feedback tardios' },
  'sustainable-design': { id: 'technical-change', label: 'Sustentabilidade técnica da mudança' },
  'quality-strategy': { id: 'technical-change', label: 'Sustentabilidade técnica da mudança' },
  'sdlc-automation': { id: 'technical-change', label: 'Sustentabilidade técnica da mudança' },
  'technical-capability': { id: 'technical-change', label: 'Sustentabilidade técnica da mudança' },
  'domain-alignment': { id: 'ownership-boundaries', label: 'Ownership, dependências e fronteiras' },
  'architecture-decisions': { id: 'architecture-evolution', label: 'Decisão e evolução arquitetural' },
  evolvability: { id: 'architecture-evolution', label: 'Decisão e evolução arquitetural' },
  'integration-data': { id: 'architecture-evolution', label: 'Decisão e evolução arquitetural' },
  'observability-practice': { id: 'operational-response', label: 'Detecção, resposta e recuperação' },
  'reliability-practice': { id: 'operational-response', label: 'Detecção, resposta e recuperação' },
  'incident-management': { id: 'operational-response', label: 'Detecção, resposta e recuperação' },
  'cloud-reliability': { id: 'operational-response', label: 'Detecção, resposta e recuperação' },
  'platform-autonomy': { id: 'platform-path', label: 'Ambientes, acesso e capacidade compartilhada' },
  'reproducible-infrastructure': { id: 'platform-path', label: 'Ambientes, acesso e capacidade compartilhada' },
  'cloud-efficiency': { id: 'platform-path', label: 'Ambientes, acesso e capacidade compartilhada' },
  'software-security': { id: 'risk-control', label: 'Risco e controles no fluxo' },
  'cloud-security': { id: 'risk-control', label: 'Risco e controles no fluxo' },
  'team-ownership': { id: 'ownership-boundaries', label: 'Ownership, dependências e fronteiras' },
  'enabling-governance': { id: 'risk-control', label: 'Risco e controles no fluxo' },
  'leadership-management': { id: 'organizational-decision', label: 'Decisão, colaboração e aprendizado organizacional' },
  collaboration: { id: 'organizational-decision', label: 'Decisão, colaboração e aprendizado organizacional' },
  'organizational-learning': { id: 'learning-closure', label: 'Melhoria sem fechamento e capacidade' },
};

export function groupFindingsByDiagnosticSystem<T extends OutcomeFinding>(findings: T[]): DiagnosticSystem<T>[] {
  const grouped = new Map<string, DiagnosticSystem<T>>();
  for (const finding of findings) {
    const definition = patternSystems[finding.pattern] ?? fallbackByCapability[finding.detailCapability] ?? { id: 'other', label: 'Outros padrões ainda não conectados' };
    const current = grouped.get(definition.id) ?? { ...definition, findings: [] };
    current.findings.push(finding);
    grouped.set(definition.id, current);
  }
  return [...grouped.values()].sort((left, right) => right.findings.length - left.findings.length || left.label.localeCompare(right.label));
}

function system(id: string, label: string, patterns: string[]): Array<[string, { id: string; label: string }]> {
  return patterns.map((pattern) => [pattern, { id, label }]);
}
