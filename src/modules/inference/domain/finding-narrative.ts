import type { OutcomeFinding } from './report-outcome.js';

export type FindingNarrativeSectionId = 'observation' | 'importance' | 'evidence' | 'mechanism' | 'containment' | 'existing-strength' | 'experiment' | 'investigation' | 'technical-options' | 'methodology';
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
  const sections: FindingNarrativeSection[] = [
    section('observation', 'O que observamos', finding.title),
    section('importance', 'Por que importa', importanceBody(finding)),
    section('evidence', 'O que sustenta ou contradiz', evidenceBody(finding)),
    section('mechanism', 'O que pode manter o padrão', mechanismBody(finding)),
    section('containment', 'Onde a restrição está contida', containmentBody(finding)),
    section('existing-strength', 'O que já funciona', existingStrengthBody(finding)),
  ];
  const ready = finding.prescription?.status === 'ready' || (!finding.prescription && Boolean(finding.experiment || finding.technicalDirection));
  if (ready) {
    if (finding.experiment) sections.push(section('experiment', 'Próximo experimento', `${finding.experiment.action} Responsável: ${finding.experiment.owner}. Revisão ${finding.experiment.reviewHorizon}. Indicador: ${finding.experiment.metric}. Critério: ${finding.experiment.successCriterion}`));
    if (finding.technicalDirection) sections.push(section('technical-options', 'Opções técnicas', `${finding.technicalDirection.practiceTarget}. ${finding.technicalDirection.enablingMechanism}`));
  } else {
    sections.push(section('investigation', 'Próxima investigação', `${finding.prescription?.reason ?? 'Ainda falta discriminar o mecanismo e a contenção.'} ${finding.missingEvidence ?? ''}`.trim()));
  }
  sections.push(section('methodology', 'Detalhes metodológicos', methodologyBody(finding)));
  return { version: 'finding-narrative-v1', sections };
}

function section(id: FindingNarrativeSectionId, title: string, body: string): FindingNarrativeSection { return { id, title, body }; }

function importanceBody(finding: OutcomeFinding): string {
  const impacts = (finding.impacts ?? []).map((impact) => impactLabels[impact] ?? impact);
  return impacts.length ? `A consequência alcança ${joinNatural(impacts)} no recorte observado.` : 'A consequência e seu alcance ainda precisam ser discriminados no recorte observado.';
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

function mechanismBody(finding: OutcomeFinding): string {
  const causal = finding.causalAnalysis;
  const hypothesis = causal?.hypothesis || finding.cause || 'A hipótese causal ainda não foi discriminada.';
  const alternatives = causal?.alternatives.length ? ` Hipóteses concorrentes: ${causal.alternatives.join(' · ')}.` : '';
  const missing = causal?.missingEvidence || finding.missingEvidence;
  const limitation = causal?.limitations;
  return `Hipótese principal: ${hypothesis}${alternatives}${missing ? ` Ainda falta: ${missing}.` : ''}${limitation ? ` Limite: ${limitation}.` : ''}`;
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
