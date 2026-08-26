import { inTransaction, type Database } from '../../shared/database.js';
import { hashSecret, id, secret } from '../../shared/ids.js';
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

  listUnits(projectId: string): Unit[] {
    const rows = this.db.prepare(`
      SELECT u.id, u.name, u.unit_type, u.path,
        NOT EXISTS (SELECT 1 FROM organization_units child WHERE child.parent_id = u.id) is_leaf
      FROM organization_units u WHERE u.project_id = ? ORDER BY u.path
    `).all(projectId) as unknown as Array<Omit<Unit, 'isLeaf'> & { is_leaf: number }>;
    return rows.map(({ is_leaf, ...unit }) => ({ ...unit, isLeaf: Boolean(is_leaf) }));
  }
}
