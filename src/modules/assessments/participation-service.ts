import type { Database } from '../../shared/database.js';
import { hashSecret, id } from '../../shared/ids.js';
import { nodeById } from '../catalog/assessment-graph.js';

export type Participation = { id: string; profile: string; status: string; current_node: string };

export class ParticipationService {
  constructor(private readonly db: Database) {}

  find(resumeToken: string): Participation | undefined {
    return this.db.prepare('SELECT id, profile, status, current_node FROM participations WHERE resume_hash = ?')
      .get(hashSecret(resumeToken)) as unknown as Participation | undefined;
  }

  answer(resumeToken: string, optionId: string): 'next' | 'complete' | 'invalid' {
    const participation = this.find(resumeToken);
    if (!participation || participation.status !== 'in_progress') return 'invalid';
    const node = nodeById(participation.current_node);
    const option = node?.options.find((item) => item.id === optionId);
    if (!node || !option) return 'invalid';
    const now = new Date().toISOString();
    this.db.exec('BEGIN IMMEDIATE');
    try {
      this.db.prepare('INSERT INTO responses (id, participation_id, node_id, option_id, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(id(), participation.id, node.id, option.id, now);
      if (node.next) {
        this.db.prepare('UPDATE participations SET current_node = ? WHERE id = ?').run(node.next, participation.id);
      } else {
        this.db.prepare("UPDATE participations SET status = 'completed', completed_at = ? WHERE id = ?").run(now, participation.id);
      }
      this.db.exec('COMMIT');
      return node.next ? 'next' : 'complete';
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }
}
