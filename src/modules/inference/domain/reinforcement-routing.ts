import { capabilityFamilyCatalog } from './capability-family.js';

const probesByHypothesis: Record<string, readonly string[]> = {
  'caminho-de-versao-sem-origem': ['batch-or-frontier', 'delivery-cause', 'deployment-probe'],
  'identidade-sem-autorizacao-no-recurso': ['war-room-thread', 'blocked-cause', 'credential-practice'],
  'reversao-nao-reproduzivel': ['war-room-thread', 'incident-remediation'],
  'postmortem-sem-efeito': ['improvement-cause'],
  'war-room-como-gestao': ['war-room-thread', 'incident-remediation', 'delivery-cause', 'blocked-cause'],
};

const funnelTriggers: ReadonlyArray<{ patterns: readonly string[]; probes: readonly string[] }> = [
  { patterns: ['fonte-nao-confiavel', 'caminho-de-versao-sem-origem', 'empacotamento-manual'], probes: ['batch-or-frontier', 'delivery-cause'] },
  { patterns: ['prioridade-sem-foco', 'ocupacao-como-progresso', 'sobrecarga-silenciosa'], probes: ['priority-containment'] },
  { patterns: ['war-room-como-gestao', 'culpa-e-controle'], probes: ['war-room-thread'] },
];

export function openedFamilyHypotheses(observedPatterns: readonly string[]): string[] {
  const observed = new Set(observedPatterns);
  return capabilityFamilyCatalog
    .filter((pack) => observed.has(pack.hypothesis) || pack.facts.some((fact) => observed.has(fact)))
    .map((pack) => pack.hypothesis);
}

export function preferredProbeIds(observedPatterns: readonly string[]): string[] {
  const observed = new Set(observedPatterns);
  const preferred = new Set<string>();
  for (const hypothesis of openedFamilyHypotheses(observedPatterns)) {
    for (const probe of probesByHypothesis[hypothesis] ?? []) preferred.add(probe);
  }
  for (const trigger of funnelTriggers) {
    if (trigger.patterns.some((pattern) => observed.has(pattern))) {
      for (const probe of trigger.probes) preferred.add(probe);
    }
  }
  return [...preferred];
}
