import { graph, type Profile } from '../../catalog/assessment-graph.js';
import { normalizeOptionEvidence, type EvidenceLink } from '../../catalog/evidence-contract.js';
import type { Discrimination, Stage } from './measurement-params.js';
import type { RespondentBundle, TestletItem } from './observation-model.js';

export type ResponseObservation = {
  participantId: string;
  unitId: string;
  profile: Profile | string;
  nodeId: string;
  optionId: string;
};

type OptionLookup = {
  evidence: EvidenceLink[];
  testlet: string;
};

const optionLookup: Map<string, OptionLookup> = (() => {
  const map = new Map<string, OptionLookup>();
  for (const node of graph) {
    for (const option of node.options) {
      const normalized = normalizeOptionEvidence(option);
      map.set(`${node.id}:${option.id}`, {
        evidence: normalized.evidence,
        testlet: node.testlet ?? node.id,
      });
    }
  }
  return map;
})();

const discriminationRank: Record<Discrimination, number> = { low: 1, medium: 2, high: 3 };

/**
 * Agrupa respostas por folha e participante em RespondentBundle[] (05 §3.5).
 * Por testlet fica a ligação de maior discriminação; entre testlets, independência.
 */
type ParticipantDraft = {
  perspective: string;
  unitId: string;
  byTestlet: Map<string, TestletItem>;
};

export function bundlesByLeaf(observations: ResponseObservation[]): Map<string, RespondentBundle[]> {
  const byLeaf = bundlesByLeafAndUnit(observations);
  const result = new Map<string, RespondentBundle[]>();
  for (const [leaf, byUnit] of byLeaf) {
    result.set(leaf, [...byUnit.values()].flat());
  }
  return result;
}

/** Agrupa por folha e unidade organizacional (05 §7.1). */
export function bundlesByLeafAndUnit(
  observations: ResponseObservation[],
): Map<string, Map<string, RespondentBundle[]>> {
  const byLeafParticipant = new Map<string, Map<string, ParticipantDraft>>();

  for (const observation of observations) {
    const lookup = optionLookup.get(`${observation.nodeId}:${observation.optionId}`);
    if (!lookup?.evidence.length) continue;
    for (const link of lookup.evidence) {
      if (link.role !== 'primary' && lookup.evidence.some((candidate) => candidate.role === 'primary' && candidate.capability === link.capability)) {
        continue;
      }
      const leafKey = link.capability;
      const participants = byLeafParticipant.get(leafKey) ?? new Map();
      const current = participants.get(observation.participantId) ?? {
        perspective: observation.profile,
        unitId: observation.unitId,
        byTestlet: new Map<string, TestletItem>(),
      };
      const item: TestletItem = {
        chosen: link.anchorStage as Stage,
        anchors: [0, 1, 2, 3, 4],
        discrimination: link.discrimination,
        testletId: lookup.testlet,
      };
      const existing = current.byTestlet.get(lookup.testlet);
      if (!existing || discriminationRank[item.discrimination] > discriminationRank[existing.discrimination]) {
        current.byTestlet.set(lookup.testlet, item);
      }
      participants.set(observation.participantId, current);
      byLeafParticipant.set(leafKey, participants);
    }
  }

  const result = new Map<string, Map<string, RespondentBundle[]>>();
  for (const [leaf, participants] of byLeafParticipant) {
    const byUnit = new Map<string, RespondentBundle[]>();
    for (const participant of participants.values()) {
      const bundle: RespondentBundle = {
        perspective: participant.perspective,
        items: [...participant.byTestlet.values()],
      };
      byUnit.set(participant.unitId, [...(byUnit.get(participant.unitId) ?? []), bundle]);
    }
    result.set(leaf, byUnit);
  }
  return result;
}

/**
 * Coleta fases F0–F5 declaradas nas evidências (12), por folha.
 * Fora do índice (R28): não usa âncora de apropriação.
 */
export function sophisticationPhasesByLeaf(
  observations: ResponseObservation[],
  unitId?: string,
): Map<string, number[]> {
  const byLeaf = new Map<string, number[]>();
  for (const observation of observations) {
    if (unitId !== undefined && observation.unitId !== unitId) continue;
    const lookup = optionLookup.get(`${observation.nodeId}:${observation.optionId}`);
    if (!lookup?.evidence.length) continue;
    for (const link of lookup.evidence) {
      if (link.sophistication === undefined) continue;
      if (link.role !== 'primary' && lookup.evidence.some((candidate) => candidate.role === 'primary' && candidate.capability === link.capability)) {
        continue;
      }
      const phases = byLeaf.get(link.capability) ?? [];
      phases.push(link.sophistication);
      byLeaf.set(link.capability, phases);
    }
  }
  return byLeaf;
}
