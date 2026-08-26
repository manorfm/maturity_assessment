import type { Database } from '../../shared/database.js';
import { hashSecret, id, secret } from '../../shared/ids.js';
import { GRAPH_VERSION, type Profile } from '../catalog/assessment-graph.js';
import { CatalogService } from '../catalog/catalog-service.js';

export class InvitationService {
  private readonly catalog: CatalogService;
  constructor(private readonly db: Database) { this.catalog = new CatalogService(db); }

  issue(projectId: string, unitId: string, profile: Profile, count: number): string[] {
    const tokens: string[] = [];
    const now = new Date();
    const expiry = new Date(now.getTime() + 30 * 864e5).toISOString();
    for (let index = 0; index < Math.min(Math.max(count, 1), 100); index += 1) {
      const token = secret();
      this.db.prepare('INSERT INTO invitations (id, project_id, unit_id, profile, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(id(), projectId, unitId, profile, hashSecret(token), expiry, now.toISOString());
      tokens.push(token);
    }
    return tokens;
  }

  claim(token: string): { resumeToken: string } | 'used' | 'invalid' {
    const invitation = this.db.prepare('SELECT * FROM invitations WHERE token_hash = ?').get(hashSecret(token)) as {
      id: string; project_id: string; unit_id: string; profile: string;
      status: string; expires_at: string;
    } | undefined;
    if (!invitation || new Date(invitation.expires_at) < new Date()) return 'invalid';
    if (invitation.status !== 'issued') return 'used';

    const resumeToken = secret();
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const changed = this.db.prepare("UPDATE invitations SET status = 'claimed', claimed_at = ? WHERE id = ? AND status = 'issued'")
        .run(new Date().toISOString(), invitation.id);
      if (changed.changes !== 1) { this.db.exec('ROLLBACK'); return 'used'; }
      this.db.prepare('INSERT INTO participations (id, project_id, unit_id, profile, resume_hash, graph_version, current_node, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(id(), invitation.project_id, invitation.unit_id, invitation.profile, hashSecret(resumeToken), GRAPH_VERSION, this.catalog.entryNode(GRAPH_VERSION), new Date().toISOString());
      this.db.exec('COMMIT');
      return { resumeToken };
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }
}
