import type { Database } from '../../shared/database.js';
import { hashSecret, id } from '../../shared/ids.js';
import { CatalogService } from '../catalog/catalog-service.js';

export type Participation = { id: string; profile: string; status: string; current_node: string; graph_version: string };

export class ParticipationService {
  private readonly catalog: CatalogService;
  constructor(private readonly db: Database) { this.catalog = new CatalogService(db); }

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
    const node = this.catalog.getNode(participation.graph_version, participation.current_node);
    const option = node?.options.find((item) => item.id === optionId);
    if (!node || !option) return 'invalid';
    const now = new Date().toISOString();
    this.db.exec('BEGIN IMMEDIATE');
    try {
      this.db.prepare('INSERT INTO responses (id, participation_id, node_id, option_id, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(id(), participation.id, node.id, option.id, now);
      const next = this.catalog.nextNode(participation.graph_version, node.id, option.id);
      if (next) {
        this.db.prepare('UPDATE participations SET current_node = ? WHERE id = ?').run(next, participation.id);
      } else {
        this.db.prepare("UPDATE participations SET status = 'completed', completed_at = ? WHERE id = ?").run(now, participation.id);
      }
      this.db.exec('COMMIT');
      return next ? 'next' : 'complete';
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }
}
