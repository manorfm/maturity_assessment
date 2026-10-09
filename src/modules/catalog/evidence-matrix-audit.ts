import type { AssessmentNode } from './assessment-graph.js';
import type { EvidenceLink } from './evidence-contract.js';
import type { InstrumentIssue } from './instrument-audit.js';

const presenceOnly = /\b(temos|existe|existem|usamos|adotamos)\b/i;

export function auditEvidenceMatrix(nodes: AssessmentNode[]): InstrumentIssue[] {
  const issues: InstrumentIssue[] = [];
  const byLeaf = new Map<string, { testlets: Set<string>; links: EvidenceLink[]; labels: string[] }>();

  for (const node of nodes) {
    if (node.id === 'respondent-context' || node.id === 'work-context') continue;
    for (const option of node.options) {
      const practice = (option.observation ?? 'practice') === 'practice' && option.id !== 'finish';
      if (!practice) continue;
      const subject = `${node.id}/${option.id}`;
      const evidence = option.evidence ?? [];
      if (!evidence.length && option.signals.length) {
        issues.push(issue('error', 'missing-evidence', subject, 'Opção de prática sem evidence[]; a matriz Q é obrigatória.'));
        continue;
      }
      if (!evidence.length) continue;
      const primary = evidence.find((link) => link.role === 'primary') ?? evidence[0]!;
      if (primary.anchorStage === 4 && presenceOnly.test(option.label)) {
        issues.push(issue('warning', 'presence-as-stage-4', subject, 'Âncora 4 não pode descrever só presença de prática.'));
      }
      for (const link of evidence) {
        const row = byLeaf.get(link.capability) ?? { testlets: new Set<string>(), links: [], labels: [] };
        row.testlets.add(node.testlet ?? node.id);
        row.links.push(link);
        row.labels.push(option.label);
        byLeaf.set(link.capability, row);
      }
    }

    const practiceOptions = node.options.filter((option) => (option.observation ?? 'practice') === 'practice' && (option.evidence?.length ?? 0) > 0);
    const seenOnNode = new Set<string>();
    for (const option of practiceOptions) {
      const primary = option.evidence!.find((link) => link.role === 'primary') ?? option.evidence![0]!;
      const key = `${primary.anchorStage}|${primary.layer}`;
      if (seenOnNode.has(key)) {
        issues.push(issue('warning', 'redundant-anchor-layer', `${node.id}/${option.id}`, 'Mais de uma opção com a mesma âncora e camada neste nó.'));
      }
      seenOnNode.add(key);
    }
  }

  for (const [leaf, row] of byLeaf) {
    if (row.testlets.size < 2) {
      issues.push(issue('warning', 'sparse-testlets', leaf, 'Folha com menos de dois testlets distintos.'));
    }
    const hasLow = row.links.some((link) => link.anchorStage <= 1);
    if (!hasLow) {
      issues.push(issue('warning', 'missing-fragility-anchor', leaf, 'Folha sem opção de âncora 0–1 para detectar fragilidade.'));
    }
    const reachesTop = row.links.some((link) => (
      (link.anchorStage >= 3 && link.layer === 'consistency')
      || (link.anchorStage === 4 && (link.layer === 'outcome' || link.layer === 'system'))
    ));
    if (!reachesTop) {
      issues.push(issue('warning', 'missing-top-anchor', leaf, 'Folha sem caminho até âncora alta com camada consistency/outcome.'));
    }
  }

  return issues;
}

function issue(severity: InstrumentIssue['severity'], code: string, subject: string, message: string): InstrumentIssue {
  return { severity, code, subject, message };
}
