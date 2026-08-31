export type PilotUnitAllocation = {
  id: string;
  invited: number;
  completed: number;
};

export type CognitivePilotStatus = 'needs_invitations' | 'ready_to_collect' | 'collecting_complete' | 'unsafe_allocation';
export type SupportedPilotScope = 'none' | 'single-unit' | 'cross-unit';

export type CognitivePilotReadinessReport = {
  status: CognitivePilotStatus;
  supportedScope: SupportedPilotScope;
  invitedParticipants: number;
  completedParticipants: number;
  calibrationReady: false;
  summary: string;
  blockers: string[];
};

export class CognitivePilotReadiness {
  static evaluate(input: { targetParticipants: number; minimumGroupSize: number; units: PilotUnitAllocation[] }): CognitivePilotReadinessReport {
    assertPositiveInteger(input.targetParticipants, 'targetParticipants');
    assertPositiveInteger(input.minimumGroupSize, 'minimumGroupSize');
    input.units.forEach((unit) => {
      assertNonNegativeInteger(unit.invited, 'invited');
      assertNonNegativeInteger(unit.completed, 'completed');
      if (!unit.id.trim()) throw new Error('Pilot unit requires an identifier');
      if (unit.completed > unit.invited) throw new Error('Completed participants cannot exceed invitations');
    });

    const invitedParticipants = sum(input.units, 'invited');
    const completedParticipants = sum(input.units, 'completed');
    const invitedEligibleUnits = input.units.filter((unit) => unit.invited >= input.minimumGroupSize);
    const completedEligibleUnits = input.units.filter((unit) => unit.completed >= input.minimumGroupSize);
    const fragmented = invitedParticipants >= input.targetParticipants && invitedEligibleUnits.length === 0;
    const supportedScope: SupportedPilotScope = completedEligibleUnits.length >= 2 || invitedEligibleUnits.length >= 2
      ? 'cross-unit'
      : completedEligibleUnits.length === 1 || invitedEligibleUnits.length === 1
        ? 'single-unit'
        : 'none';
    const blockers = fragmented
      ? [`A distribuição não alcança o mínimo de ${input.minimumGroupSize} participantes por unidade; o relatório não poderá comparar squads com segurança.`]
      : invitedParticipants < input.targetParticipants
        ? [`Ainda faltam ${input.targetParticipants - invitedParticipants} convites para o piloto inicial.`]
        : [];
    const status: CognitivePilotStatus = fragmented
      ? 'unsafe_allocation'
      : invitedParticipants < input.targetParticipants
        ? 'needs_invitations'
        : completedParticipants >= input.targetParticipants
          ? 'collecting_complete'
          : 'ready_to_collect';
    const summary = supportedScope === 'cross-unit'
      ? 'A alocação sustenta leitura global e comparação entre unidades elegíveis.'
      : supportedScope === 'single-unit'
        ? 'A alocação sustenta um piloto cognitivo em uma unidade; não promete comparação entre squads.'
        : 'A alocação ainda não sustenta um recorte agregado elegível.';

    return { status, supportedScope, invitedParticipants, completedParticipants, calibrationReady: false, summary, blockers };
  }
}

function sum(units: PilotUnitAllocation[], field: 'invited' | 'completed'): number {
  return units.reduce((total, unit) => total + unit[field], 0);
}

function assertPositiveInteger(value: number, field: string): void {
  if (!Number.isInteger(value) || value < 1) throw new Error(`${field} must be a positive integer`);
}

function assertNonNegativeInteger(value: number, field: string): void {
  if (!Number.isInteger(value) || value < 0) throw new Error(`${field} must be a non-negative integer`);
}
