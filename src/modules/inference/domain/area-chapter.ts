import { findAreaPath, type OrganizationalAreaMap, type OrganizationalAreaNode } from './organizational-areas.js';
import { projectDisciplineCrossings } from './discipline-crossing.js';
import { disciplineScope } from './discipline-brief.js';
import { uniqueFindingsByPattern, type OutcomeFinding } from './report-outcome.js';
import { guidanceFor } from './solution-guidance.js';
import { supportBandFor, type SupportBand } from './interview-report.js';
import { CapabilityTaxonomy } from './capability-taxonomy.js';

export type AreaChapterArrival = {
  areaId: string;
  areaLabel: string;
  localTitle: string;
};

export type AreaChapterProblem = {
  pattern: string;
  capabilityId: string;
  capabilityLabel: string;
  localTitle: string;
  action: string;
  supportBand: SupportBand;
  arrivals: AreaChapterArrival[];
};

export type AreaChapter = {
  version: 'area-chapter-v1';
  areaId: string;
  areaLabel: string;
  observes: string;
  problems: AreaChapterProblem[];
};

export function projectAreaChapter(input: {
  area: OrganizationalAreaNode;
  findings: OutcomeFinding[];
  organizationalAreas: OrganizationalAreaMap;
}): AreaChapter {
  const leaves = new Set(leavesOf(input.area));
  const published = uniqueFindingsByPattern(input.findings);
  const local = published.filter((finding) => leaves.has(finding.detailCapability));
  const crossings = projectDisciplineCrossings(published);
  const problems = local.map((finding) => {
    const guidance = guidanceFor(finding.pattern, finding.foundation, finding.title);
    const arrivals = arrivalsFor(finding, crossings, published, input.organizationalAreas, input.area.id);
    return {
      pattern: finding.pattern,
      capabilityId: finding.detailCapability,
      capabilityLabel: CapabilityTaxonomy.labelFor(finding.detailCapability),
      localTitle: guidance.plainExplanation,
      action: finding.experiment?.action ?? finding.intervention,
      supportBand: supportBandFor(finding.confidence),
      arrivals,
    };
  });
  return {
    version: 'area-chapter-v1',
    areaId: input.area.id,
    areaLabel: input.area.label,
    observes: disciplineScope(input.area.id).treats,
    problems,
  };
}

function arrivalsFor(
  finding: OutcomeFinding,
  crossings: ReturnType<typeof projectDisciplineCrossings>,
  published: OutcomeFinding[],
  map: OrganizationalAreaMap,
  areaId: string,
): AreaChapterArrival[] {
  const seen = new Set<string>();
  return crossings.flatMap((edge) => {
    const here = edge.fromPattern === finding.pattern || edge.toPattern === finding.pattern;
    if (!here) return [];
    const otherPattern = edge.fromPattern === finding.pattern ? edge.toPattern : edge.fromPattern;
    const other = published.find((item) => item.pattern === otherPattern);
    if (!other) return [];
    const area = areaFor(other.detailCapability, map);
    if (!area || area.id === areaId || seen.has(other.pattern)) return [];
    seen.add(other.pattern);
    return [{
      areaId: area.id,
      areaLabel: area.label,
      localTitle: guidanceFor(other.pattern, other.foundation, other.title).plainExplanation,
    }];
  });
}

function leavesOf(node: OrganizationalAreaNode): string[] {
  const ids: string[] = [];
  const walk = (item: OrganizationalAreaNode) => {
    if (item.leafId) ids.push(item.leafId);
    item.children.forEach(walk);
  };
  walk(node);
  return [...new Set(ids)];
}

function areaFor(capabilityId: string, map: OrganizationalAreaMap): { id: string; label: string } | undefined {
  const path = findAreaPath(map, capabilityId);
  const root = path?.[0];
  return root ? { id: root.id, label: root.label } : undefined;
}
