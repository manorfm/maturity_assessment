import { CapabilityTaxonomy } from './capability-taxonomy.js';
import { systemicEffectFor } from './hierarchical-problems.js';
import { findAreaPath, type OrganizationalAreaMap } from './organizational-areas.js';
import { diagnosticSystemFor } from './problem-system.js';
import { uniqueFindingsByPattern, type OutcomeFinding } from './report-outcome.js';
import { guidanceFor, hasExplicitGuidance } from './solution-guidance.js';

export type SupportBand = 'alta' | 'média' | 'baixa';

export type InterviewSolution = {
  pattern: string;
  action: string;
  explanation: string;
  whyItFits: string;
  foundation: { source: string; principle: string; why: string };
  expectedImpact: string;
  doesNotSolve: string;
  supportBand: SupportBand;
  posterior: number;
  leading: boolean;
  published: boolean;
};

export type InterviewProblem = {
  pattern: string;
  capabilityId: string;
  capabilityLabel: string;
  areaId: string;
  areaLabel: string;
  title: string;
  mechanism: string;
  evidence: string[];
  effects: string[];
  solutions: InterviewSolution[];
  investigate: boolean;
};

export type InterviewChapter = {
  areaId: string;
  areaLabel: string;
  problems: InterviewProblem[];
};

export type InterviewReport = {
  version: 'interview-report-v1';
  problemCount: number;
  chapters: InterviewChapter[];
};

const chapterOrder = ['product', 'engineering', 'operations', 'management'] as const;

export function supportBandFor(posterior: number): SupportBand {
  if (posterior >= .75) return 'alta';
  if (posterior >= .6) return 'média';
  return 'baixa';
}

export function projectInterviewReport(input: {
  findings: OutcomeFinding[];
  organizationalAreas: OrganizationalAreaMap;
}): InterviewReport {
  const published = uniqueFindingsByPattern(input.findings);
  const problems = published.flatMap((finding) => {
    const area = areaFor(finding.detailCapability, input.organizationalAreas);
    if (!area) return [];
    return [toProblem(finding, published, area)];
  });
  const chapters = chapterOrder.flatMap((areaId) => {
    const items = problems.filter((problem) => problem.areaId === areaId);
    if (!items.length) return [];
    return [{ areaId, areaLabel: items[0]!.areaLabel, problems: items }];
  });
  return { version: 'interview-report-v1', problemCount: problems.length, chapters };
}

function toProblem(finding: OutcomeFinding, published: OutcomeFinding[], area: { id: string; label: string }): InterviewProblem {
  const guidance = guidanceFor(finding.pattern, finding.foundation, finding.title);
  const leading = toSolution(finding, guidance, true, true);
  const alternatives = alternativeFindings(finding, published).map((item) => (
    toSolution(item, guidanceFor(item.pattern, item.foundation, item.title), false, true)
  ));
  const related = finding.affectedCapabilities?.filter((id) => id !== finding.detailCapability) ?? [];
  return {
    pattern: finding.pattern,
    capabilityId: finding.detailCapability,
    capabilityLabel: CapabilityTaxonomy.labelFor(finding.detailCapability),
    areaId: area.id,
    areaLabel: area.label,
    title: guidance.plainExplanation,
    mechanism: guidance.mechanism,
    evidence: evidenceLines(finding),
    effects: [
      systemicEffectFor(finding),
      ...related.map((id) => `No recorte de ${CapabilityTaxonomy.labelFor(id)} o mesmo mecanismo chega com outro nome.`),
    ],
    solutions: [leading, ...alternatives].slice(0, 3),
    investigate: finding.prescription?.status === 'investigate',
  };
}

function toSolution(finding: OutcomeFinding, guidance: ReturnType<typeof guidanceFor>, leading: boolean, published: boolean): InterviewSolution {
  const foundation = finding.foundation ?? { source: guidance.matureReference, principle: guidance.solutionClass, why: guidance.whyItWorks };
  return {
    pattern: finding.pattern,
    action: finding.experiment?.action ?? finding.intervention,
    explanation: `${guidance.solutionClass}. ${guidance.whyItWorks}`,
    whyItFits: guidance.whyItWorks,
    foundation: { source: foundation.source, principle: foundation.principle, why: foundation.why },
    expectedImpact: finding.experiment?.successCriterion ?? guidance.successCriterion,
    doesNotSolve: guidance.doesNotSolve,
    supportBand: supportBandFor(finding.confidence),
    posterior: finding.confidence,
    leading,
    published,
  };
}

function alternativeFindings(lead: OutcomeFinding, published: OutcomeFinding[]): OutcomeFinding[] {
  const system = diagnosticSystemFor(lead.pattern);
  if (!system) return [];
  return published.filter((item) => (
    item.pattern !== lead.pattern
    && diagnosticSystemFor(item.pattern)?.id === system.id
    && hasExplicitGuidance(item.pattern)
  )).sort((left, right) => right.confidence - left.confidence || right.priority - left.priority);
}

function evidenceLines(finding: OutcomeFinding): string[] {
  const evidence = finding.recommendationEvidence;
  const lines: string[] = [];
  if (evidence) {
    lines.push(`${evidence.supportingParticipants} de ${evidence.applicablePopulation} relatos aplicáveis sustentam este mecanismo.`);
    if (evidence.contradictingParticipants) {
      lines.push(`${evidence.contradictingParticipants} relatos aplicáveis apontam em outra direção no mesmo evento.`);
    }
  }
  const prose = finding.causalAnalysis?.evidenceFor.filter((item) => !/^[a-z0-9-]+$/.test(item)) ?? [];
  return [...lines, ...prose].slice(0, 3);
}

function areaFor(capabilityId: string, map: OrganizationalAreaMap): { id: string; label: string } | undefined {
  const path = findAreaPath(map, capabilityId);
  const root = path?.[0];
  return root ? { id: root.id, label: root.label } : undefined;
}
