import type { OutcomeFinding } from './report-outcome.js';

export type DiagnosticSystemDefinition = {
  id: string;
  label: string;
  symptoms: string[];
  hypotheses: string[];
  amplifiers: string[];
};
export type DiagnosticSystem<T extends OutcomeFinding = OutcomeFinding> = DiagnosticSystemDefinition & { findings: T[] };

export const diagnosticSystemCatalog: DiagnosticSystemDefinition[] = [
  defineSystem('integration-feedback', 'Integração e feedback tardios',
    ['mudanca-isolada', 'integracao-tardia', 'integracao-por-janela', 'empacotamento-manual', 'caminho-de-versao-sem-origem'],
    ['causa-ferramental-feedback', 'causa-processo-lote', 'causa-fronteira-times', 'causa-acoplamento-entrega', 'fonte-nao-confiavel'],
    ['automacao-sem-feedback', 'regressao-crescente']),
  defineSystem('ownership-boundaries', 'Ownership, dependências e fronteiras',
    ['ownership-fragmentado', 'dependencia-coordenada', 'servico-sem-responsavel', 'responsabilidade-limitada-ao-codigo'],
    ['causa-fronteira-times', 'causa-prioridade-entre-times', 'causa-dependencia-arquitetural', 'responsabilidade-compartilhada-sem-decisao'],
    ['acoplamento-coordenado', 'responsabilidade-depende-de-especialista']),
  defineSystem('learning-closure', 'Melhoria sem fechamento e capacidade',
    ['acao-sem-fechamento', 'retrospectiva-sem-fechamento', 'postmortem-sem-efeito'],
    ['causa-melhoria-sem-capacidade', 'causa-melhoria-sem-autonomia', 'causa-acoes-sem-foco', 'causa-baixa-seguranca-psicologica'],
    ['cerimonia-sem-adaptacao', 'melhoria-reativa']),
  defineSystem('product-feedback', 'Decisão de produto sem evidência antecipada',
    ['feedback-tardio', 'prazo-sem-aprendizado', 'prioridade-sem-foco', 'solucao-pronta'],
    ['causa-funding-temporario', 'causa-responsabilidade-encerra-no-aceite', 'causa-capacidade-tomada-pela-proxima-iniciativa', 'causa-resultado-sem-autoridade'],
    ['entrega-substitui-resultado', 'portfolio-sem-feedback']),
  defineSystem('platform-adoption', 'Capacidade compartilhada difícil de usar ou evoluir',
    ['caminho-desconhecido', 'caminho-conhecido-inacessivel', 'caminho-inadequado-ao-caso', 'caminho-depende-de-ajuda-recorrente'],
    ['capacidade-nova-por-ticket-heroi', 'documentacao-substitui-caminho', 'caminhos-equivalentes-fragmentados', 'suporte-substitui-feedback-de-produto-interno'],
    ['adocao-do-caminho-nao-observada', 'excecoes-nao-retornam-ao-caminho']),
  defineSystem('governance-trust', 'Governança compensando confiança insuficiente',
    ['controle-indiferenciado', 'controle-sem-feedback', 'controle-sem-proposito', 'seguranca-tardia', 'identidade-sem-autorizacao-no-recurso'],
    ['governanca-compensa-feedback-tecnico', 'governanca-compensa-ownership', 'segregacao-por-fila-manual', 'aprovacao-sem-evidencia-decisoria'],
    ['compliance-substitui-eficacia', 'incidente-apenas-adiciona-controle']),
  defineSystem('workforce-capability', 'Competência inacessível ao trabalho',
    ['competencia-inexistente', 'competencia-concentrada', 'competencia-bloqueada-por-acesso'],
    ['aprendizado-sem-oportunidade-pratica', 'competencia-dependente-de-fornecedor', 'aprendizado-impedido-por-carga'],
    ['capacitacao-medida-por-presenca', 'matriz-de-competencia-sem-aplicacao', 'desenvolvimento-reforca-especialista']),
  defineSystem('legacy-continuity', 'Legado, continuidade e conhecimento recuperável',
    ['legado-sem-modelo-recuperavel', 'legado-muda-por-tentativa'],
    ['legado-congelado-ate-reescrita', 'legado-dependente-de-fornecedor'],
    ['codigo-depende-de-especialista', 'mudanca-aguarda-especialista']),
  defineSystem('operational-response', 'Detecção, resposta e recuperação',
    ['deteccao-tardia', 'incidente-detectado-por-cliente', 'incidente-depende-do-autor', 'reversao-nao-reproduzivel', 'war-room-como-gestao'],
    ['causa-lacuna-telemetria', 'causa-ferramenta-observabilidade', 'causa-correlacao-arquitetural', 'causa-privacidade-operacional'],
    ['dependencia-de-heroi', 'diagnostico-por-acesso-direto']),
  defineSystem('quality-in-flow', 'Qualidade tratada depois da construção',
    ['qualidade-como-fase', 'qualidade-tardia', 'qualidade-como-handoff'],
    ['estrategia-de-qualidade-concentrada-no-qa', 'qualidade-por-suite-padrao', 'causa-dados-teste'],
    ['regressao-crescente', 'verificacao-dependente-de-memoria']),
  defineSystem('cognitive-load', 'Carga cognitiva e fragmentação do trabalho',
    ['sobrecarga-silenciosa', 'acumulo-silencioso-de-tipos', 'heroi-troca-contexto'],
    ['coordenacao-compensa-carga', 'causa-capacidade-tomada-pela-proxima-iniciativa'],
    ['caminhos-equivalentes-fragmentados', 'portfolio-paralelo-fragmenta-capacidade']),
];

const patternSystems = new Map<string, DiagnosticSystemDefinition>();
for (const definition of diagnosticSystemCatalog) {
  for (const pattern of [...definition.symptoms, ...definition.hypotheses, ...definition.amplifiers]) patternSystems.set(pattern, definition);
}

export function diagnosticSystemFor(pattern: string): DiagnosticSystemDefinition | undefined {
  return patternSystems.get(pattern);
}

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
    const definition = diagnosticSystemFor(finding.pattern) ?? fallbackDefinition(finding.detailCapability);
    const current = grouped.get(definition.id) ?? { ...definition, findings: [] };
    current.findings.push(finding);
    grouped.set(definition.id, current);
  }
  return [...grouped.values()].sort((left, right) => right.findings.length - left.findings.length || left.label.localeCompare(right.label));
}

function defineSystem(id: string, label: string, symptoms: string[], hypotheses: string[], amplifiers: string[]): DiagnosticSystemDefinition {
  return { id, label, symptoms, hypotheses, amplifiers };
}

function fallbackDefinition(capability: string): DiagnosticSystemDefinition {
  const fallback = fallbackByCapability[capability] ?? { id: 'other', label: 'Outros padrões ainda não conectados' };
  return { ...fallback, symptoms: [], hypotheses: [], amplifiers: [] };
}
