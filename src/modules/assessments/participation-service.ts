import { inTransaction, type Database } from '../../shared/database.js';
import { hashSecret, id } from '../../shared/ids.js';
import { CatalogService } from '../catalog/catalog-service.js';
import { AssessmentProfile } from './domain/invitation.js';
import { AdaptiveJourneyService } from './adaptive-journey-service.js';

type Participation = { id: string; profile: string; status: string; current_node: string; graph_version: string };

export class ParticipationService {
  private readonly catalog: CatalogService;
  private readonly adaptiveJourney: AdaptiveJourneyService;
  constructor(private readonly db: Database) { this.catalog = new CatalogService(db); this.adaptiveJourney = new AdaptiveJourneyService(db); }

  find(resumeToken: string): Participation | undefined {
    return this.db.prepare('SELECT id, profile, status, current_node, graph_version FROM participations WHERE resume_hash = ?')
      .get(hashSecret(resumeToken)) as unknown as Participation | undefined;
  }

  answeredCount(participationId: string): number {
    return Number((this.db.prepare('SELECT COUNT(*) total FROM responses WHERE participation_id = ?').get(participationId) as { total: number }).total);
  }

  answer(resumeToken: string, optionId: string): 'next' | 'complete' | 'invalid' {
    const participation = this.find(resumeToken);
    if (!participation || participation.status !== 'in_progress') return 'invalid';
    const node = this.catalog.getNode(participation.graph_version, participation.current_node, participation.profile);
    const option = node?.options.find((item) => item.id === optionId);
    if (!node || !option) return 'invalid';
    const now = new Date().toISOString();
    return inTransaction(this.db, () => {
      this.db.prepare('INSERT INTO responses (id, participation_id, node_id, option_id, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(id(), participation.id, node.id, option.id, now);
      if (node.id === 'respondent-context') {
        const profile = AssessmentProfile.create(option.id);
        this.db.prepare('UPDATE participations SET profile = ? WHERE id = ?').run(profile.value, participation.id);
      }
      const effectiveProfile = node.id === 'respondent-context' ? option.id : participation.profile;
      const declarativeNext = this.catalog.nextNode(participation.graph_version, node.id, option.id, effectiveProfile);
      const next = declarativeNext && !this.hasAnswered(participation.id, declarativeNext)
        ? declarativeNext
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
