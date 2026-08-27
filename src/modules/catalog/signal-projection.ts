import type { Signal } from './assessment-graph.js';

export const capabilityDetailLabels: Record<string, string> = {
  'product-direction': 'Direção e alinhamento', 'discovery-validation': 'Descoberta e validação', 'portfolio-management': 'Gestão de portfólio',
  'planning-refinement': 'Planejamento e refinamento', 'work-management': 'Fluxo de trabalho', 'continuous-integration': 'Integração contínua', 'release-feedback': 'Release e feedback',
  'sustainable-design': 'Design e sustentabilidade do código', 'quality-strategy': 'Estratégia de qualidade', 'sdlc-automation': 'Automação do SDLC', 'software-security': 'Segurança de software', 'technical-capability': 'Capacidade técnica',
  'domain-alignment': 'Alinhamento ao domínio', 'architecture-decisions': 'Decisões arquiteturais', evolvability: 'Evolutibilidade', 'integration-data': 'Integração e dados',
  'observability-practice': 'Observabilidade', 'reliability-practice': 'Confiabilidade', 'incident-management': 'Gestão de incidentes', 'platform-autonomy': 'Plataforma e autonomia',
  'reproducible-infrastructure': 'Infraestrutura reproduzível', 'cloud-security': 'Segurança e identidade', 'cloud-reliability': 'Confiabilidade de infraestrutura', 'cloud-efficiency': 'Eficiência, custos e sustentabilidade',
  'team-ownership': 'Estrutura e ownership', 'enabling-governance': 'Governança habilitadora', 'leadership-management': 'Liderança e gestão', collaboration: 'Colaboração', 'organizational-learning': 'Aprendizado e adaptação',
};

const defaultDetailCapability: Record<string, string> = {
  fluxo: 'work-management', entrega: 'release-feedback', engenharia: 'sustainable-design', qualidade: 'quality-strategy',
  arquitetura: 'evolvability', confiabilidade: 'reliability-practice', observabilidade: 'observability-practice',
  plataforma: 'platform-autonomy', organizacao: 'team-ownership', governanca: 'enabling-governance', aprendizado: 'organizational-learning',
};

export function resolveSignalDetails(signal: Signal): string[] {
  if (signal.details?.length) return [...new Set(signal.details)];
  const { capability, pattern } = signal;
  const details = new Set<string>();
  if (/descoberta|feedback-tardio|cascata|solucao-entregue|hipotese/.test(pattern)) details.add('discovery-validation');
  if (/prazo|resultado|objetivo|prioridade|foco/.test(pattern)) details.add('product-direction');
  if (/portfolio|sobrecarga|capacidade|trabalho-em-andamento/.test(pattern)) details.add('portfolio-management');
  if (/iteracao|refin|qualidade-tardia|solucao-entregue/.test(pattern)) details.add('planning-refinement');
  if (/bloqueio|espera|sobrecarga|coordenacao|fila-de-trabalho/.test(pattern)) details.add('work-management');
  if (/integracao|mudanca-isolada|fonte-nao|verificacao-concorrente|mudanca-sobrescrita/.test(pattern)) details.add('continuous-integration');
  if (/release|entrega|empacotamento|pressao|deploy/.test(pattern)) details.add('release-feedback');
  if (/divida|codigo|dados|design/.test(pattern)) details.add('sustainable-design');
  if (/qualidade|verificacao|teste|regressao/.test(pattern)) details.add('quality-strategy');
  if (/automacao|feedback-tecnico|ferramental|fonte/.test(pattern)) details.add('sdlc-automation');
  if (/seguranca|privacidade|dado-pessoal|vulnerab|segredo/.test(pattern)) details.add('software-security');
  if (/competencia|memoria|heroi/.test(pattern)) details.add('technical-capability');
  if (/dominio|linguagem|ownership-fragmentado|limites-sem-ownership/.test(pattern)) details.add('domain-alignment');
  if (/decisao|trade-off|inercia|solucao-entregue/.test(pattern)) details.add('architecture-decisions');
  if (/acoplamento|evolucao|dependencia-arquitetural|fronteira-compartilhada/.test(pattern)) details.add('evolvability');
  if (/contrato|correlacao-arquitetural|dados|schema/.test(pattern)) details.add('integration-data');
  if (/observ|telemetria|impacto-invisivel|limiar|deteccao/.test(pattern)) details.add('observability-practice');
  if (/confiabilidade|recorrencia|mitigacao|ambiente-inconsistente/.test(pattern)) details.add('reliability-practice');
  if (/incidente|severidade|diagnostico|correcao/.test(pattern)) details.add('incident-management');
  if (/plataforma|provisionamento|autosserv|acesso|especialista/.test(pattern)) details.add('platform-autonomy');
  if (/reproduz|infraestrutura|console|configuracao/.test(pattern)) details.add('reproducible-infrastructure');
  if (/seguranca|privacidade|permissao|identidade/.test(pattern) && capability === 'plataforma') details.add('cloud-security');
  if (/ownership|fronteira-times|estrutura|carga|superficie/.test(pattern)) details.add('team-ownership');
  if (/governanca|controle|politica|permissao|aprovacao|excecao/.test(pattern)) details.add('enabling-governance');
  if (/centraliz|lideranca|culpa|ocupacao/.test(pattern)) details.add('leadership-management');
  if (/colabor|comunicacao|handoff|coordenacao|escalada/.test(pattern)) details.add('collaboration');
  if (/aprendizado|melhoria|retrospectiva|acao|adaptacao|cerimonia/.test(pattern)) details.add('organizational-learning');
  if (!details.size) details.add(defaultDetailCapability[capability] ?? 'technical-capability');
  return [...details];
}

export function inferEvidenceLayer(signal: Signal): NonNullable<Signal['layer']> {
  if (signal.layer) return signal.layer;
  if (signal.pattern.startsWith('causa-')) return 'system';
  if (/resultado|efeito|impacto|aprendizado/.test(signal.pattern)) return 'outcome';
  if (/competencia|memoria|heroi/.test(signal.pattern)) return 'knowledge';
  return 'practice';
}
