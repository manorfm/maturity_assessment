import type { OutcomeFinding } from './report-outcome.js';

export type FindingNarrativeSectionId = 'decision' | 'observation' | 'importance' | 'capability' | 'evidence' | 'mechanism' | 'containment' | 'existing-strength' | 'experiment' | 'investigation' | 'technical-options' | 'methodology';
export type FindingNarrativeSection = { id: FindingNarrativeSectionId; title: string; body: string };
export type FindingNarrative = { version: 'finding-narrative-v1'; sections: FindingNarrativeSection[] };

const impactLabels: Record<string, string> = {
  security: 'segurança', reliability: 'confiabilidade', 'delivery-speed': 'velocidade de entrega', quality: 'qualidade', cost: 'custo',
  'customer-experience': 'experiência do cliente', 'engineering-experience': 'experiência de engenharia', 'change-capability': 'capacidade de mudança', predictability: 'previsibilidade',
};
const mechanismLabels: Record<string, string> = {
  undetermined: 'ainda não determinado', knowledge: 'conhecimento acessível', capacity: 'capacidade disponível', process: 'processo', policy: 'política', tooling: 'feedback ou ferramenta',
  platform: 'capacidade compartilhada ou plataforma', access: 'acesso', architecture: 'arquitetura', organization: 'estrutura organizacional', governance: 'governança', incentive: 'incentivo',
  priority: 'prioridade ou alocação de capacidade', 'external-dependency': 'dependência externa', culture: 'explicação ainda não discriminada', none: 'ainda não determinado',
};
const containmentLabels: Record<string, string> = {
  team: 'time', 'shared-service': 'serviço compartilhado', 'organizational-policy': 'política organizacional', 'organizational-structure': 'estrutura organizacional', external: 'fornecedor ou regulador externo', undetermined: 'ainda não determinada',
};
const authorityLabels: Record<string, string> = {
  team: 'liderança e pessoas do time', 'cross-team': 'responsáveis dos times envolvidos', platform: 'plataforma ou responsável pela capacidade compartilhada', architecture: 'responsáveis pelas fronteiras arquiteturais',
  'organizational-governance': 'governança e liderança organizacional', 'portfolio-leadership': 'liderança de produto, portfólio e orçamento', 'external-owner': 'responsável pela relação externa', undetermined: 'ainda não determinada',
};
const profileLabels: Record<string, string> = { management: 'Gestão', product: 'Produto', quality: 'Qualidade / QA', engineering: 'Engenharia', platform: 'Plataforma / Operações', architecture: 'Arquitetura', security: 'Segurança', data: 'Dados', design: 'Design / Experiência' };

export function projectFindingNarrative(finding: OutcomeFinding): FindingNarrative {
  const ready = finding.prescription?.status === 'ready' || (!finding.prescription && Boolean(finding.experiment || finding.technicalDirection));
  const sections: FindingNarrativeSection[] = [
    section('observation', 'O que está acontecendo', finding.title),
    section('mechanism', 'Por que isso se repete', mechanismBody(finding)),
  ];
  if (ready) sections.push(section('decision', 'O que fazer agora', decisionBody(finding)));
  sections.push(
    section('importance', 'Por que importa', importanceBody(finding)),
    section('capability', 'Por que este recorte', capabilityBody(finding)),
  );
  if (ready) {
    if (finding.experiment) sections.push(section('experiment', 'Como saber se funcionou', `${finding.experiment.action} Responsável: ${finding.experiment.owner}. Revisão ${finding.experiment.reviewHorizon}. Indicador: ${finding.experiment.metric}. Critério: ${finding.experiment.successCriterion}`));
  } else {
    sections.push(section('investigation', 'O que ainda precisamos esclarecer', `${finding.prescription?.reason ?? 'Ainda falta discriminar o mecanismo e a contenção.'} ${finding.missingEvidence ?? ''}`.trim()));
  }
  sections.push(
    section('evidence', 'O que sustenta ou contradiz', evidenceBody(finding)),
    section('containment', 'Onde a restrição está contida', containmentBody(finding)),
    section('existing-strength', 'O que já funciona', existingStrengthBody(finding)),
  );
  if (ready && finding.technicalDirection) sections.push(section('technical-options', 'Opções técnicas', `${finding.technicalDirection.practiceTarget}. ${finding.technicalDirection.enablingMechanism}`));
  sections.push(section('methodology', 'Detalhes metodológicos', methodologyBody(finding)));
  return { version: 'finding-narrative-v1', sections };
}

function section(id: FindingNarrativeSectionId, title: string, body: string): FindingNarrativeSection { return { id, title, body }; }

function decisionBody(finding: OutcomeFinding): string {
  const action = finding.experiment?.action ?? finding.intervention;
  const authority = authorityLabels[finding.decisionAuthority ?? 'undetermined'] ?? finding.decisionAuthority ?? 'ainda não determinada';
  const horizon = finding.experiment?.reviewHorizon;
  return horizon
    ? `${action} Quem autoriza: ${authority}. Horizonte: ${horizon}.`
    : `${action} Quem autoriza: ${authority}.`;
}

function importanceBody(finding: OutcomeFinding): string {
  const measured = finding.severity && finding.severity !== 'undetermined' && (finding.impacts?.length ?? 0) > 0;
  if (measured) {
    const impacts = (finding.impacts ?? []).map((impact) => impactLabels[impact] ?? impact);
    return `A consequência alcança ${joinNatural(impacts)} no recorte observado.`;
  }
  const authority = authorityLabels[finding.decisionAuthority ?? 'undetermined'] ?? finding.decisionAuthority ?? 'ainda não determinada';
  return `Se o padrão continuar, a decisão fica com ${authority}. O impacto ainda não foi medido nas entrevistas.`;
}

function capabilityBody(finding: OutcomeFinding): string {
  const authority = authorityLabels[finding.decisionAuthority ?? 'undetermined'] ?? finding.decisionAuthority ?? 'ainda não determinada';
  const containment = containmentLabels[finding.containment ?? 'undetermined'] ?? finding.containment ?? 'ainda não determinada';
  if (finding.containment === 'organizational-policy' || finding.containment === 'organizational-structure' || finding.decisionAuthority === 'portfolio-leadership') {
    return `A restrição é ${containment}. Quem autoriza a mudança é ${authority}, não o time ocupado.`;
  }
  return `A evidência e o tratamento se ligam a este recorte. Quem autoriza: ${authority}.`;
}

function evidenceBody(finding: OutcomeFinding): string {
  const evidence = finding.recommendationEvidence;
  if (!evidence) return 'A evidência agregada ainda não foi detalhada para esta leitura.';
  const unclassified = evidence.unclassifiedParticipants ?? Math.max(0, evidence.applicablePopulation - evidence.supportingParticipants - evidence.contradictingParticipants);
  const contradiction = evidence.contradictingParticipants
    ? `${evidence.contradictingParticipants} ${evidence.contradictingParticipants === 1 ? 'pessoa relatou' : 'pessoas relataram'} uma situação que contradiz especificamente a leitura.`
    : 'Nenhuma contradição específica atingiu o limiar de publicação; isso não significa que as demais pessoas concordaram com a hipótese.';
  const remainder = unclassified ? ` ${unclassified} ${unclassified === 1 ? 'pessoa não aparece' : 'pessoas não aparecem'} neste agregado como apoio nem como contradição específica e ${unclassified === 1 ? 'não produziu' : 'não produziram'} sinal publicável em nenhuma direção.` : '';
  const patternCount = evidence.patterns.length;
  const perspectives = evidence.profiles.map((profile) => profileLabels[profile] ?? profile).join(' · ') || 'não diferenciadas';
  return `${evidence.supportingParticipants} de ${evidence.applicablePopulation} pessoas que poderiam observar essa situação relataram ${patternCount} ${patternCount === 1 ? 'padrão de resposta relacionado' : 'padrões de resposta relacionados'} ao comportamento. Perspectivas: ${perspectives}. ${contradiction}${remainder}`;
}

export function compactMechanismBody(finding: OutcomeFinding): string {
  const raw = mechanismBody(finding).split(' Hipóteses concorrentes:')[0] ?? '';
  const withoutHedge = raw.split(' Ainda falta:')[0]!.split(' Limite:')[0]!.trim();
  const title = finding.title?.trim();
  if (!title) return withoutHedge;
  if (withoutHedge === title) {
    return finding.cause && finding.cause !== title ? finding.cause : withoutHedge;
  }
  if (withoutHedge.startsWith(title)) {
    const rest = withoutHedge.slice(title.length).replace(/^[,;:\s]+(então\s+)?/i, '').trim();
    if (rest.length >= 24) return rest.charAt(0).toUpperCase() + rest.slice(1);
  }
  return withoutHedge;
}

function mechanismBody(finding: OutcomeFinding): string {
  const causal = finding.causalAnalysis;
  const hypothesis = causal?.hypothesis || finding.cause || 'A hipótese causal ainda não foi discriminada.';
  const alternatives = causal?.alternatives.length ? ` Hipóteses concorrentes: ${causal.alternatives.join(' · ')}.` : '';
  const missing = causal?.missingEvidence || finding.missingEvidence;
  const limitation = causal?.limitations;
  return `${hypothesis}${alternatives}${missing ? ` Ainda falta: ${missing}.` : ''}${limitation ? ` Limite: ${limitation}.` : ''}`;
}

function containmentBody(finding: OutcomeFinding): string {
  const mechanism = mechanismLabels[finding.mechanism ?? 'undetermined'] ?? finding.mechanism ?? 'ainda não determinado';
  const containment = containmentLabels[finding.containment ?? 'undetermined'] ?? finding.containment ?? 'ainda não determinada';
  const authority = authorityLabels[finding.decisionAuthority ?? 'undetermined'] ?? finding.decisionAuthority ?? 'ainda não determinada';
  return `Mecanismo observado: ${mechanism}. Contenção provável: ${containment}. Autoridade para decidir: ${authority}. A recorrência não amplia essa contenção automaticamente.`;
}

function existingStrengthBody(finding: OutcomeFinding): string {
  const readiness = finding.solutionReadiness;
  const virtuous = finding.causalAnalysis?.sociotechnicalPattern?.kind === 'virtuous' ? finding.causalAnalysis.sociotechnicalPattern : undefined;
  const readinessText = readiness ? `${readiness.label}: ${readiness.explanation}` : 'Ainda não há capacidade de solução demonstrada neste recorte.';
  return virtuous
    ? `${readinessText} Condição que sustenta: ${virtuous.enablingCondition}. Sinal de regressão: ${virtuous.regressionSignal}`
    : readinessText;
}

function methodologyBody(finding: OutcomeFinding): string {
  const strength = finding.recommendationEvidence?.strength;
  const version = finding.causalAnalysis?.knowledgeVersion ?? 'biblioteca causal não informada';
  return `Versão narrativa finding-narrative-v1; conhecimento ${version}.${strength ? ` Estado da evidência: ${strength.executiveStatus}; convergência ${strength.convergence}, amplitude ${strength.populationBreadth}, diversidade ${strength.perspectiveDiversity} e cobertura causal ${strength.causalCoverage}.` : ''}`;
}

function joinNatural(items: string[]): string { return items.length < 2 ? items[0] ?? '' : `${items.slice(0, -1).join(', ')} e ${items.at(-1)}`; }
