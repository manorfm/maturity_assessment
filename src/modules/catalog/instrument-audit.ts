import type { AssessmentNode } from './assessment-graph.js';
import type { InterventionDefinition } from '../inference/domain/group-recommendation-engine.js';
import { allowsImprovementFoundation } from '../inference/domain/solution-guidance.js';

export type InstrumentIssue = {
  severity: 'error' | 'warning';
  code: string;
  subject: string;
  message: string;
};

const abstractLanguage = /\b(capacidade|evid[eê]ncia|contexto|hip[oó]tese|fronteira|reconcili\w*|reproduz[ií]vel|correlacion\w*)\b/i;
const desirableLanguage = /\b(maduro|ideal|corret[oa]mente|correto|melhor pr[aá]tica|excel[eê]ncia)\b/i;
const observableAnchor = /(últim[oa]|últimas?|recent[ea]|nesta semana|neste ciclo|depois de|quando|durante)/i;

export function auditInstrument(nodes: AssessmentNode[], interventions: Record<string, InterventionDefinition>): InstrumentIssue[] {
  return [...auditQuestions(nodes), ...auditInterventions(interventions)];
}

function auditQuestions(nodes: AssessmentNode[]): InstrumentIssue[] {
  return nodes.flatMap((node) => {
    if (node.id === 'respondent-context') return [];
    const issues: InstrumentIssue[] = [];
    if (!observableAnchor.test(`${node.scenario} ${node.prompt}`)) issues.push(issue('warning', 'missing-observation-anchor', node.id, 'O cenário não ancora a resposta em um evento ou período recuperável.'));
    if (abstractLanguage.test(node.prompt)) issues.push(issue('warning', 'abstract-prompt', node.id, 'A pergunta usa abstração que pode exigir tradução pela pessoa respondente.'));
    for (const option of node.options.filter((item) => (item.observation ?? 'practice') === 'practice')) {
      const subject = `${node.id}/${option.id}`;
      const clauses = option.label.split(/[;.]|\bmas\b|\bporém\b/i).filter((part) => part.trim()).length;
      if (clauses > 2) issues.push(issue('error', 'compound-option', subject, 'A alternativa reúne mais de dois comportamentos ou consequências.'));
      if (desirableLanguage.test(option.label)) issues.push(issue('error', 'desirability-cue', subject, 'A alternativa revela julgamento ou resposta socialmente desejável.'));
      if (option.signals.length > 4) issues.push(issue('warning', 'signal-overload', subject, 'Uma escolha produz sinais demais e pode preencher capacidades não observadas.'));
      if (node.type === 'scenario' && option.signals.some((signal) => signal.pattern.startsWith('causa-'))) {
        issues.push(issue('error', 'premature-causal-signal', subject, 'A alternativa do cenário deve registrar fato ou comportamento; hipótese causal pertence a um probe de discriminação.'));
      }
      if (node.type === 'probe' && option.signals.some((signal) => signal.pattern.startsWith('causa-') && (signal.constraint === 'none' || signal.constraint === 'undetermined'))) {
        issues.push(issue('error', 'missing-causal-constraint', subject, 'Uma hipótese causal discriminada precisa declarar o mecanismo de restrição observado.'));
      }
    }
    return issues;
  });
}

function auditInterventions(interventions: Record<string, InterventionDefinition>): InstrumentIssue[] {
  return Object.entries(interventions).flatMap(([pattern, item]) => {
    const issues: InstrumentIssue[] = [];
    if (/^a métrica escolhida melhora/i.test(item.successCriterion)) issues.push(issue('error', 'generic-success', pattern, 'O critério não informa uma decisão verificável.'));
    if (item.metric === 'tempo de espera, recorrência e efeito observado na capacidade afetada') issues.push(issue('error', 'generic-metric', pattern, 'A métrica não identifica o fenômeno específico a acompanhar.'));
    if (item.owner === 'Responsável pela capacidade com o time') issues.push(issue('warning', 'generic-owner', pattern, 'O responsável ainda depende de contextualização no diagnóstico.'));
    if (item.foundation.why === 'A intervenção ataca o comportamento observado, não um inventário de práticas.') issues.push(issue('warning', 'generic-foundation', pattern, 'O fundamento não explica por que a intervenção atua neste mecanismo.'));
    if (/registre a recorrência de/i.test(item.metric)) issues.push(issue('error', 'title-reciting-metric', pattern, 'A métrica recita o título em vez de nomear o comportamento a acompanhar.'));
    if (item.foundation.source === 'Melhoria contínua' && !allowsImprovementFoundation(pattern)) {
      issues.push(issue('error', 'misplaced-improvement-foundation', pattern, 'Melhoria contínua só cabe quando o mecanismo é ciclo de melhoria sem dono, capacidade ou revisão de efeito.'));
    }
    return issues;
  });
}

function issue(severity: InstrumentIssue['severity'], code: string, subject: string, message: string): InstrumentIssue {
  return { severity, code, subject, message };
}
