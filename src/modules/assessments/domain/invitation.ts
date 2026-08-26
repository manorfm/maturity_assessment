import { DomainValidationError } from '../../../shared/errors.js';
import { profiles, type Profile } from '../../catalog/assessment-graph.js';

export class AssessmentProfile {
  private constructor(public readonly value: Profile) {}

  static create(raw: string): AssessmentProfile {
    if (!Object.hasOwn(profiles, raw)) throw new DomainValidationError();
    return new AssessmentProfile(raw as Profile);
  }
}

export class InvitationQuantity {
  private constructor(public readonly value: number) {}

  static create(raw: number): InvitationQuantity {
    if (!Number.isInteger(raw) || raw < 1 || raw > 100) throw new DomainValidationError();
    return new InvitationQuantity(raw);
  }
}

