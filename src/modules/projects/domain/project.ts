import { DomainValidationError } from '../../../shared/errors.js';

export class ProjectName {
  private constructor(public readonly value: string) {}

  static create(raw: string): ProjectName {
    const value = raw.trim();
    if (!value || value.length > 100) throw new DomainValidationError();
    return new ProjectName(value);
  }
}

export class OrganizationPath {
  private constructor(public readonly segments: readonly string[]) {}

  static create(raw: string): OrganizationPath {
    const rawSegments = raw.split('/');
    if (rawSegments.some((segment) => !segment.trim())) throw new DomainValidationError();
    const segments = rawSegments.map((segment) => segment.trim());
    if (segments.length < 1 || segments.length > 12 || segments.some((segment) => segment.length > 80)) throw new DomainValidationError();
    return new OrganizationPath(segments);
  }

  get value(): string { return this.segments.join('/'); }
}

export class ProjectDraft {
  private constructor(
    public readonly name: ProjectName,
    public readonly organizationPaths: readonly OrganizationPath[],
  ) {}

  static create(rawName: string, rawHierarchy: string): ProjectDraft {
    const paths = rawHierarchy.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map(OrganizationPath.create);
    if (!paths.length || paths.length > 200) throw new DomainValidationError();
    const unique = new Map(paths.map((path) => [path.value, path]));
    return new ProjectDraft(ProjectName.create(rawName), [...unique.values()]);
  }
}

