import { CatalogService } from '../../catalog/catalog-service.js';
import { InvitationService } from '../../assessments/invitation-service.js';
import { ParticipationService } from '../../assessments/participation-service.js';
import { ProjectService } from '../../projects/project-service.js';
import type { Database } from '../../../shared/database.js';
import { DiagnosticSamplePlanner, type SampleRole } from './diagnostic-sample-plan.js';
import { InferenceService } from '../inference-service.js';
import {
  optionForOrganizationalSynthetic,
  POC_VALIDATION_ORGS,
  type SyntheticCaseId,
} from './organizational-synthetic.js';

export function runRealFlowCohort(
  db: Database,
  options: {
    caseId: SyntheticCaseId;
    optionOverrides?: ReadonlyArray<{ nodeId: string; optionId: string }>;
  },
): {
  plan: ReturnType<typeof DiagnosticSamplePlanner.forGate>;
  created: ReturnType<ProjectService['create']>;
  projectId: string;
  report: ReturnType<InferenceService['report']>;
} {
  const caseId = options.caseId;
  const optionByNode = new Map(
    (options.optionOverrides ?? []).map((override) => [override.nodeId, override.optionId]),
  );
  const spec = POC_VALIDATION_ORGS.find((org) => org.id === caseId);
  if (!spec) throw new Error(`Unknown caseId: ${caseId}`);

  const plan = DiagnosticSamplePlanner.forGate('organizational-diagnostic');
  const projects = new ProjectService(db);
  const invitations = new InvitationService(db);
  const participations = new ParticipationService(db);
  const catalog = new CatalogService(db);

  const created = projects.create(spec.name, spec.hierarchy);
  const project = projects.authorize(created.publicId, created.adminSecret)!;
  const projectId = String(project.id);
  const units = projects.listUnits(projectId).filter((unit) => unit.isLeaf);

  plan.units.forEach((unitPlan, unitIndex) => {
    const unit = units.find((candidate) => candidate.name === spec.units[unitIndex]) ?? units[unitIndex]!;
    const tokens = invitations.createBatch(projectId, unit.id, unitPlan.roles.length).tokens;
    unitPlan.roles.forEach((role, index) => {
      completeProductJourney(
        catalog,
        invitations,
        participations,
        tokens[index]!,
        role,
        unitIndex,
        caseId,
        optionByNode,
      );
    });
  });

  const report = new InferenceService(db).report(projectId, 5);
  return { plan, created, projectId, report };
}

function completeProductJourney(
  catalog: CatalogService,
  invitations: InvitationService,
  participations: ParticipationService,
  token: string,
  role: SampleRole,
  unitIndex: number,
  caseId: SyntheticCaseId,
  optionByNode: ReadonlyMap<string, string>,
): void {
  const claimed = invitations.claim(token) as { resumeToken: string };
  let guard = 0;
  while (participations.find(claimed.resumeToken)?.status === 'in_progress') {
    if (guard++ > 80) {
      throw new Error(`Real-flow journey exceeded 80 answers for ${role.profile}/${role.workContext}`);
    }
    const current = participations.find(claimed.resumeToken)!;
    const node = catalog.getNode(current.graph_version, current.current_node, current.profile)!;
    const option =
      optionByNode.get(node.id) ?? optionForOrganizationalSynthetic(node, role, unitIndex, caseId);
    const result = participations.answer(claimed.resumeToken, option);
    if (result === 'invalid') throw new Error(`Invalid real-flow answer ${option} on ${node.id}`);
  }
}
