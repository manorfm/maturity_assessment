import { inTransaction, type Database } from '../../shared/database.js';
import { hashSecret, id, secret } from '../../shared/ids.js';
import { DomainValidationError, ResourceNotFoundError } from '../../shared/errors.js';
import { ProjectDraft } from './domain/project.js';

type Unit = { id: string; name: string; unit_type: string; path: string; isLeaf: boolean };

export class ProjectService {
  constructor(private readonly db: Database) {}

  create(name: string, hierarchy: string): { publicId: string; adminSecret: string } {
    const draft = ProjectDraft.create(name, hierarchy);
    const projectId = id();
    const publicId = secret().slice(0, 12);
    const adminSecret = secret();
    const now = new Date().toISOString();
    inTransaction(this.db, () => {
      this.db.prepare('INSERT INTO projects (id, public_id, name, admin_secret_hash, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(projectId, publicId, draft.name.value, hashSecret(adminSecret), now);

      const unitByPath = new Map<string, string>();
      for (const organizationPath of draft.organizationPaths) {
        let parentId: string | null = null;
        let currentPath = '';
        organizationPath.segments.forEach((segment, index) => {
          currentPath = currentPath ? `${currentPath}/${segment}` : segment;
          const existing = unitByPath.get(currentPath);
          if (existing) { parentId = existing; return; }
          const unitId = id();
          const type = index === organizationPath.segments.length - 1 ? 'team' : index === 0 ? 'organization' : 'group';
          this.db.prepare('INSERT INTO organization_units (id, project_id, parent_id, name, unit_type, path) VALUES (?, ?, ?, ?, ?, ?)')
            .run(unitId, projectId, parentId, segment, type, currentPath);
          unitByPath.set(currentPath, unitId);
          parentId = unitId;
        });
      }
    });
    return { publicId, adminSecret };
  }

  authorize(publicId: string, adminSecret: string) {
    return this.db.prepare('SELECT * FROM projects WHERE public_id = ? AND admin_secret_hash = ?')
      .get(publicId, hashSecret(adminSecret)) as Record<string, unknown> | undefined;
  }

  measurementModel(projectId: string): 'm1' | 'm2' {
    const row = this.db.prepare('SELECT measurement_model FROM projects WHERE id = ?').get(projectId) as { measurement_model: string } | undefined;
    return row?.measurement_model === 'm2' ? 'm2' : 'm1';
  }

  setMeasurementModel(projectId: string, model: 'm1' | 'm2'): void {
    this.db.prepare('UPDATE projects SET measurement_model = ? WHERE id = ?').run(model, projectId);
  }

  setFreeTextEnabled(projectId: string, enabled: boolean): void {
    this.db.prepare('UPDATE projects SET free_text_enabled = ? WHERE id = ?').run(enabled ? 1 : 0, projectId);
  }

  freeTextEnabled(projectId: string): boolean {
    const row = this.db.prepare('SELECT free_text_enabled FROM projects WHERE id = ?').get(projectId) as { free_text_enabled: number } | undefined;
    return Number(row?.free_text_enabled) === 1;
  }

  listUnits(projectId: string): Unit[] {
    const rows = this.db.prepare(`
      SELECT u.id, u.name, u.unit_type, u.path,
        NOT EXISTS (SELECT 1 FROM organization_units child WHERE child.parent_id = u.id) is_leaf
      FROM organization_units u WHERE u.project_id = ? ORDER BY u.path
    `).all(projectId) as unknown as Array<Omit<Unit, 'isLeaf'> & { is_leaf: number }>;
    return rows.map(({ is_leaf, ...unit }) => ({ ...unit, isLeaf: Boolean(is_leaf) }));
  }

  structureBoard(projectId: string): Array<{
    id: string;
    name: string;
    path: string;
    depth: number;
    canAdd: boolean;
    canRemove: boolean;
  }> {
    const units = this.listUnits(projectId);
    const active = new Set((this.db.prepare(`
      SELECT unit_id FROM invitations WHERE project_id = ?
      UNION SELECT unit_id FROM participations WHERE project_id = ?
    `).all(projectId, projectId) as unknown as Array<{ unit_id: string }>).map((row) => row.unit_id));
    return units.map((unit) => ({
      id: unit.id,
      name: unit.name,
      path: unit.path,
      depth: unit.path.split('/').length - 1,
      canAdd: !active.has(unit.id),
      canRemove: unit.isLeaf && !active.has(unit.id) && units.length > 1,
    }));
  }

  addUnit(projectId: string, parentPath: string, name: string): void {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 80 || trimmed.includes('/')) {
      throw new DomainValidationError('O nome da unidade precisa ser curto e sem barra.');
    }
    const parent = this.db.prepare('SELECT id, path FROM organization_units WHERE project_id = ? AND path = ?')
      .get(projectId, parentPath) as { id: string; path: string } | undefined;
    if (!parent) throw new ResourceNotFoundError('Unidade não encontrada.');
    if (parent.path.split('/').length + 1 > 12) throw new DomainValidationError('A estrutura pode ter no máximo 12 níveis.');
    if (this.unitHasActivity(projectId, parent.id)) {
      throw new DomainValidationError('Convites já nasceram nesta unidade. Ela permanece final.');
    }
    const path = `${parent.path}/${trimmed}`;
    if (this.db.prepare('SELECT 1 FROM organization_units WHERE project_id = ? AND path = ?').get(projectId, path)) {
      throw new DomainValidationError('Já existe uma unidade com esse caminho.');
    }
    this.db.prepare('INSERT INTO organization_units (id, project_id, parent_id, name, unit_type, path) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id(), projectId, parent.id, trimmed, 'team', path);
    this.db.prepare("UPDATE organization_units SET unit_type = 'group' WHERE id = ? AND unit_type = 'team'").run(parent.id);
  }

  removeUnit(projectId: string, path: string): void {
    const unit = this.db.prepare('SELECT id FROM organization_units WHERE project_id = ? AND path = ?')
      .get(projectId, path) as { id: string } | undefined;
    if (!unit) throw new ResourceNotFoundError('Unidade não encontrada.');
    if (this.db.prepare('SELECT 1 FROM organization_units WHERE parent_id = ?').get(unit.id)) {
      throw new DomainValidationError('Remova as unidades abaixo antes.');
    }
    if (this.unitHasActivity(projectId, unit.id)) throw new DomainValidationError('Há convites ou respostas neste recorte.');
    const total = Number((this.db.prepare('SELECT COUNT(*) total FROM organization_units WHERE project_id = ?').get(projectId) as { total: number }).total);
    if (total <= 1) throw new DomainValidationError('A estrutura precisa de ao menos uma unidade.');
    this.db.prepare('DELETE FROM organization_units WHERE id = ?').run(unit.id);
  }

  private unitHasActivity(projectId: string, unitId: string): boolean {
    const invites = Number((this.db.prepare('SELECT COUNT(*) total FROM invitations WHERE project_id = ? AND unit_id = ?').get(projectId, unitId) as { total: number }).total);
    const people = Number((this.db.prepare('SELECT COUNT(*) total FROM participations WHERE project_id = ? AND unit_id = ?').get(projectId, unitId) as { total: number }).total);
    return invites + people > 0;
  }
}
