import { inTransaction, type Database } from '../../shared/database.js';
import { hashSecret, id } from '../../shared/ids.js';
import { CatalogService } from '../catalog/catalog-service.js';
import { freeTextStrategy, groupErrorReferent } from '../catalog/item-catalog.js';
import { AssessmentProfile } from './domain/invitation.js';
import { AdaptiveJourneyService } from './adaptive-journey-service.js';
import { RespondentWorkContext } from './domain/respondent-work-context.js';
import { FreeTextReviewService } from '../inference/domain/free-text-review.js';

type Participation = { id: string; profile: string; status: string; current_node: string; graph_version: string; workContext: RespondentWorkContext | undefined };

export class ParticipationService {
  private readonly catalog: CatalogService;
  private readonly adaptiveJourney: AdaptiveJourneyService;
  private readonly freeTextReviews: FreeTextReviewService;
  constructor(private readonly db: Database) {
    this.catalog = new CatalogService(db);
    this.adaptiveJourney = new AdaptiveJourneyService(db);
    this.freeTextReviews = new FreeTextReviewService(db);
  }

  find(resumeToken: string): Participation | undefined {
    const row = this.db.prepare('SELECT id, profile, status, current_node, graph_version, work_context_json FROM participations WHERE resume_hash = ?')
      .get(hashSecret(resumeToken)) as unknown as (Omit<Participation, 'workContext'> & { work_context_json: string }) | undefined;
    return row ? { id: row.id, profile: row.profile, status: row.status, current_node: row.current_node, graph_version: row.graph_version, workContext: RespondentWorkContext.fromJSON(row.work_context_json) } : undefined;
  }

  answeredCount(participationId: string): number {
    return Number((this.db.prepare('SELECT COUNT(*) total FROM responses WHERE participation_id = ?').get(participationId) as { total: number }).total);
  }

  answer(resumeToken: string, optionId: string, extras?: { freeText?: string }): 'next' | 'complete' | 'invalid' {
    const participation = this.find(resumeToken);
    if (!participation || participation.status !== 'in_progress') return 'invalid';
    const node = this.catalog.getNode(participation.graph_version, participation.current_node, participation.profile);
    const option = node?.options.find((item) => item.id === optionId);
    if (!node || !option) return 'invalid';
    if (node.id === freeTextStrategy.id && optionId === 'submitted') {
      const text = extras?.freeText?.trim() ?? '';
      if (text.length < 8) return 'invalid';
    }
    const now = new Date().toISOString();
    return inTransaction(this.db, () => {
      this.db.prepare('INSERT INTO responses (id, participation_id, node_id, option_id, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(id(), participation.id, node.id, option.id, now);
      if (node.id === freeTextStrategy.id && optionId === 'submitted' && extras?.freeText) {
        const row = this.db.prepare('SELECT project_id, unit_id FROM participations WHERE id = ?')
          .get(participation.id) as { project_id: string; unit_id: string };
        this.freeTextReviews.enqueue({
          projectId: String(row.project_id),
          unitId: row.unit_id,
          nodeId: freeTextStrategy.id,
          rawText: extras.freeText,
        });
      }
      if (node.id === 'respondent-context') {
        const profile = AssessmentProfile.create(option.id);
        this.db.prepare('UPDATE participations SET profile = ? WHERE id = ?').run(profile.value, participation.id);
      }
      if (node.id === 'work-context' && option.id !== 'cannot-observe') {
        const workContext = RespondentWorkContext.fromOption(option.id);
        this.db.prepare('UPDATE participations SET work_context_json = ? WHERE id = ?').run(JSON.stringify(workContext), participation.id);
      }
      const effectiveProfile = node.id === 'respondent-context' ? option.id : participation.profile;
      const effectiveContext = node.id === 'work-context' && option.id !== 'cannot-observe' ? RespondentWorkContext.fromOption(option.id) : participation.workContext;
      const declarativeNext = this.catalog.nextNode(participation.graph_version, node.id, option.id, effectiveProfile, effectiveContext);
      const rotatedVignette = node.id === 'work-context'
        ? this.adaptiveJourney.selectVignette(participation.id)
        : undefined;
      const listArm = node.id === groupErrorReferent.id
        ? this.adaptiveJourney.selectListTechnique(participation.id)
        : undefined;
      const afterListFreeText = node.id.startsWith('list-')
        ? this.adaptiveJourney.selectFreeText(participation.id)
        : undefined;
      const preferredNext = (listArm && !this.hasAnswered(participation.id, listArm))
        ? listArm
        : (afterListFreeText && !this.hasAnswered(participation.id, afterListFreeText)
          ? afterListFreeText
          : (rotatedVignette && !this.hasAnswered(participation.id, rotatedVignette)
            ? rotatedVignette
            : declarativeNext));
      const next = preferredNext && !this.hasAnswered(participation.id, preferredNext)
        ? preferredNext
        : this.adaptiveJourney.selectAfterTerminal(participation.id, effectiveProfile, participation.graph_version);
      if (next) {
        this.db.prepare('UPDATE participations SET current_node = ? WHERE id = ?').run(next, participation.id);
      } else {
        this.db.prepare("UPDATE participations SET status = 'completed', completed_at = ? WHERE id = ?").run(now, participation.id);
      }
      return next ? 'next' : 'complete';
    }, 'IMMEDIATE');
  }

  private hasAnswered(participationId: string, nodeId: string): boolean {
    return Boolean(this.db.prepare('SELECT 1 FROM responses WHERE participation_id = ? AND node_id = ?').get(participationId, nodeId));
  }
}
