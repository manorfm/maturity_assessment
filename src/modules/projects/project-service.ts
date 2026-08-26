import { inTransaction, type Database } from '../../shared/database.js';
import { hashSecret, id, secret } from '../../shared/ids.js';
import { ProjectDraft } from './domain/project.js';

type Unit = { id: string; name: string; unit_type: string; path: string };

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
    return this.db.prepare('SELECT id, name, unit_type, path FROM organization_units WHERE project_id = ? ORDER BY path')
      .all(projectId) as unknown as Unit[];
  }
}
