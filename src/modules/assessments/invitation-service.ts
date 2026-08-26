import { inTransaction, type Database } from '../../shared/database.js';
import { hashSecret, id, secret } from '../../shared/ids.js';
import { GRAPH_VERSION } from '../catalog/assessment-graph.js';
import { CatalogService } from '../catalog/catalog-service.js';
import { InvitationQuantity } from './domain/invitation.js';
import { ConflictError, DomainValidationError, ResourceNotFoundError } from '../../shared/errors.js';

type InvitationBatchResult = { batchId: string; tokens: string[] };
type InvitationBatchSummary = {
  id: string; unitPath: string; quantity: number;
  status: 'issued' | 'partially_used' | 'claimed' | 'revoked' | 'expired';
  createdAt: string;
};

export class InvitationService {
  private readonly catalog: CatalogService;
  constructor(private readonly db: Database) { this.catalog = new CatalogService(db); }

  createBatch(projectId: string, unitId: string, count: number, reissuedFrom?: string): InvitationBatchResult {
    const quantity = InvitationQuantity.create(count);
    const unitExists = this.db.prepare('SELECT 1 FROM organization_units WHERE id = ? AND project_id = ?').get(unitId, projectId);
    if (!unitExists) throw new ResourceNotFoundError('Unidade organizacional não encontrada.');
    const hasChildren = this.db.prepare('SELECT 1 FROM organization_units WHERE parent_id = ? LIMIT 1').get(unitId);
    if (hasChildren) throw new DomainValidationError('Convites devem ser gerados para uma unidade final da estrutura.');
    const batchId = id();
    const tokens: string[] = [];
    const now = new Date();
    const expiry = new Date(now.getTime() + 30 * 864e5).toISOString();
    inTransaction(this.db, () => {
      this.db.prepare('INSERT INTO invitation_batches (id, project_id, unit_id, profile, quantity, created_at, reissued_from) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(batchId, projectId, unitId, 'self-selected', quantity.value, now.toISOString(), reissuedFrom ?? null);
      for (let index = 0; index < quantity.value; index += 1) {
        const token = secret();
        this.db.prepare('INSERT INTO invitations (id, project_id, unit_id, profile, token_hash, expires_at, created_at, batch_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
          .run(id(), projectId, unitId, 'self-selected', hashSecret(token), expiry, now.toISOString(), batchId);
        tokens.push(token);
      }
    });
    return { batchId, tokens };
  }

  revokeBatch(projectId: string, batchId: string): number {
    const batch = this.findBatch(projectId, batchId);
    if (!batch) throw new ResourceNotFoundError('Lote de convites não encontrado.');
    return Number(this.db.prepare("UPDATE invitations SET status = 'revoked' WHERE batch_id = ? AND status = 'issued'").run(batchId).changes);
  }

  reissueBatch(projectId: string, batchId: string): InvitationBatchResult {
    const batch = this.findBatch(projectId, batchId);
    if (!batch) throw new ResourceNotFoundError('Lote de convites não encontrado.');
    if (this.db.prepare('SELECT 1 FROM invitation_batches WHERE reissued_from = ?').get(batchId)) {
      throw new ConflictError('Este lote já foi reemitido.');
    }
    const unavailable = Number((this.db.prepare("SELECT COUNT(*) total FROM invitations WHERE batch_id = ? AND (status = 'revoked' OR (status = 'issued' AND expires_at < ?))").get(batchId, new Date().toISOString()) as { total: number }).total);
    if (!unavailable) throw new ConflictError('Este lote não possui convites revogados ou expirados para reemitir.');
    return this.createBatch(projectId, batch.unit_id, unavailable, batchId);
  }

  listBatches(projectId: string): InvitationBatchSummary[] {
    const rows = this.db.prepare(`
      SELECT b.id, b.quantity, b.created_at, u.path,
        SUM(CASE WHEN i.status = 'issued' AND i.expires_at >= ? THEN 1 ELSE 0 END) issued,
        SUM(CASE WHEN i.status = 'claimed' THEN 1 ELSE 0 END) claimed,
        SUM(CASE WHEN i.status = 'revoked' THEN 1 ELSE 0 END) revoked,
        SUM(CASE WHEN i.status = 'issued' AND i.expires_at < ? THEN 1 ELSE 0 END) expired
      FROM invitation_batches b JOIN organization_units u ON u.id = b.unit_id
      JOIN invitations i ON i.batch_id = b.id
      WHERE b.project_id = ? GROUP BY b.id ORDER BY b.rowid
    `).all(new Date().toISOString(), new Date().toISOString(), projectId) as unknown as Array<{
      id: string; quantity: number; created_at: string; path: string;
      issued: number; claimed: number; revoked: number; expired: number;
    }>;
    return rows.map((row) => ({
      id: row.id,
      unitPath: row.path,
      quantity: Number(row.quantity),
      status: batchStatus(row),
      createdAt: row.created_at,
    }));
  }

  claim(token: string): { resumeToken: string } | 'used' | 'invalid' {
    const invitation = this.db.prepare('SELECT * FROM invitations WHERE token_hash = ?').get(hashSecret(token)) as {
      id: string; project_id: string; unit_id: string;
      status: string; expires_at: string;
    } | undefined;
    if (!invitation || invitation.status === 'revoked' || new Date(invitation.expires_at) < new Date()) return 'invalid';
    if (invitation.status !== 'issued') return 'used';

    const resumeToken = secret();
    return inTransaction(this.db, () => {
      const changed = this.db.prepare("UPDATE invitations SET status = 'claimed', claimed_at = ? WHERE id = ? AND status = 'issued'")
        .run(new Date().toISOString(), invitation.id);
      if (changed.changes !== 1) return 'used';
      this.db.prepare('INSERT INTO participations (id, project_id, unit_id, profile, resume_hash, graph_version, current_node, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(id(), invitation.project_id, invitation.unit_id, 'unselected', hashSecret(resumeToken), GRAPH_VERSION, this.catalog.entryNode(GRAPH_VERSION), new Date().toISOString());
      return { resumeToken };
    }, 'IMMEDIATE');
  }

  private findBatch(projectId: string, batchId: string): { unit_id: string } | undefined {
    return this.db.prepare('SELECT unit_id FROM invitation_batches WHERE id = ? AND project_id = ?')
      .get(batchId, projectId) as { unit_id: string } | undefined;
  }
}

function batchStatus(counts: { quantity: number; issued: number; claimed: number; revoked: number; expired: number }): InvitationBatchSummary['status'] {
  if (Number(counts.revoked) === Number(counts.quantity)) return 'revoked';
  if (Number(counts.claimed) === Number(counts.quantity)) return 'claimed';
  if (Number(counts.expired) === Number(counts.quantity)) return 'expired';
  if (Number(counts.issued) === Number(counts.quantity)) return 'issued';
  return 'partially_used';
}
