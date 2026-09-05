export type CapabilityFamilyId =
  | 'version-promotion'
  | 'cloud-access-change'
  | 'incident-reversal'
  | 'ceremony-with-effect'
  | 'error-climate-leadership';

export type InterviewBranch = 'delivery' | 'inception' | 'access' | 'security' | 'incident' | 'operation' | 'ceremony' | 'portfolio' | 'leadership';

export type Reinforcement = { fact: string; branch: InterviewBranch; hypothesis: string };

export type CapabilityFamily = {
  id: CapabilityFamilyId;
  label: string;
  path: string;
  facts: string[];
  hypothesis: string;
  reinforces: Reinforcement[];
  practiceTarget: string;
  toolFamilies: string[];
  foundation: { source: string; principle: string };
  actionsByContainment: Record<string, string>;
};

export type BranchSignal = { pattern: string; branch: InterviewBranch; participantId: string };

export type HypothesisSupport = {
  hypothesis: string;
  weight: number;
  reinforced: boolean;
  branches: InterviewBranch[];
};

export type CeremonyObservation = {
  ritePresent: boolean;
  nextEquivalentEventChanged: boolean;
  actionHadOwner: boolean;
};

export type CeremonyLearning = {
  scoresLearning: boolean;
  pattern: 'aprendizado-blameless' | 'postmortem-sem-efeito';
};

export type FamilyEvent = {
  family: CapabilityFamilyId;
  eventOccurred: boolean;
  pathPresent: boolean;
};

export type FamilyGap = {
  kind: 'missing-family';
  family: CapabilityFamilyId;
  pattern: string;
  title: string;
  explanation: string;
  toolFamilies: string[];
};

export const capabilityFamilyCatalog: CapabilityFamily[] = [
  {
    id: 'version-promotion',
    label: 'Origem e promoção da versão',
    path: 'Caminho governado e identificável da versão: origem, artefato, imagem e esteira de build.',
    facts: ['empacotamento-manual', 'fonte-nao-confiavel'],
    hypothesis: 'caminho-de-versao-sem-origem',
    reinforces: [
      { fact: 'empacotamento-manual', branch: 'delivery', hypothesis: 'caminho-de-versao-sem-origem' },
      { fact: 'fonte-nao-confiavel', branch: 'inception', hypothesis: 'caminho-de-versao-sem-origem' },
    ],
    practiceTarget: 'Uma origem única promove o mesmo artefato com proveniência verificável.',
    toolFamilies: ['repositório de código', 'repositório de artefatos', 'registro de imagens', 'esteira de build'],
    foundation: { source: 'Continuous Delivery / SLSA', principle: 'Proveniência e promoção do mesmo artefato' },
    actionsByContainment: {
      engineering: 'Tornar a origem e a promoção reproduzíveis, sem caminho paralelo na máquina de alguém.',
      operations: 'Promover o mesmo artefato; recusar versão sem identificador.',
      leadership: 'Parar de financiar duas esteiras para o mesmo caminho.',
    },
  },
  {
    id: 'cloud-access-change',
    label: 'Acesso e mudança em nuvem',
    path: 'Identidade prova quem é; autorização decide se aquela identidade altera este recurso.',
    facts: ['causa-permissao-sem-autonomia', 'credencial-em-configuracao'],
    hypothesis: 'identidade-sem-autorizacao-no-recurso',
    reinforces: [
      { fact: 'causa-permissao-sem-autonomia', branch: 'access', hypothesis: 'identidade-sem-autorizacao-no-recurso' },
      { fact: 'credencial-em-configuracao', branch: 'security', hypothesis: 'identidade-sem-autorizacao-no-recurso' },
    ],
    practiceTarget: 'Acesso mínimo, temporário e autorizado no recurso que a mudança toca.',
    toolFamilies: ['identidade e acesso', 'política como código', 'auditoria de operação'],
    foundation: { source: 'NIST Zero Trust / Well-Architected Security', principle: 'Autenticação não é autorização' },
    actionsByContainment: {
      engineering: 'Checar se a identidade da mudança cobre o recurso alterado.',
      operations: 'Reduzir blast radius do token ao recurso e ao tempo da operação.',
      leadership: 'Não tratar “temos nuvem” como controle; pedir evidência de autorização no recurso.',
    },
  },
  {
    id: 'incident-reversal',
    label: 'Incidente e reversão',
    path: 'Quem vê o impacto, quem age e como a versão volta sem depender de um herói.',
    facts: ['correcao-direta-na-producao', 'dependencia-de-heroi'],
    hypothesis: 'reversao-nao-reproduzivel',
    reinforces: [
      { fact: 'correcao-direta-na-producao', branch: 'incident', hypothesis: 'reversao-nao-reproduzivel' },
      { fact: 'dependencia-de-heroi', branch: 'operation', hypothesis: 'reversao-nao-reproduzivel' },
    ],
    practiceTarget: 'Mitigar primeiro por um caminho reproduzível; depois aprender.',
    toolFamilies: ['entrega e promoção', 'observação da mudança'],
    foundation: { source: 'SRE', principle: 'Mitigação antes da causa; reversão no caminho da mudança' },
    actionsByContainment: {
      engineering: 'Tornar a reversão um passo do caminho, não um hotfix artesanal.',
      operations: 'Quem observa o impacto consegue iniciar a reversão sem achar a pessoa certa.',
      leadership: 'Parar de celebrar só quem salva; medir tempo até mitigação reproduzível.',
    },
  },
  {
    id: 'ceremony-with-effect',
    label: 'Cerimônia com efeito',
    path: 'Daily, retro, review e post-mortem só contam se o próximo evento equivalente mudou.',
    facts: ['cerimonia-sem-adaptacao', 'retrospectiva-sem-fechamento'],
    hypothesis: 'postmortem-sem-efeito',
    reinforces: [
      { fact: 'cerimonia-sem-adaptacao', branch: 'ceremony', hypothesis: 'postmortem-sem-efeito' },
      { fact: 'retrospectiva-sem-fechamento', branch: 'ceremony', hypothesis: 'postmortem-sem-efeito' },
    ],
    practiceTarget: 'Uma mudança no sistema com dono, capacidade e revisão no caso seguinte.',
    toolFamilies: [],
    foundation: { source: 'SRE / blameless postmortem', principle: 'Aprendizado é mudança revista, não o rito' },
    actionsByContainment: {
      operations: 'Reconstruir o último incidente sem nome e fechar uma mudança sistêmica.',
      leadership: 'Não usar o registro para desempenho individual.',
      engineering: 'Tratar ação sem dono como trabalho não iniciado.',
    },
  },
  {
    id: 'error-climate-leadership',
    label: 'Reação a erro, clima e liderança',
    path: 'Erro e risco podem ser ditos; a restrição sobe para quem pode removê-la; war room não é o modo de gestão.',
    facts: ['culpa-e-controle', 'causa-capacidade-tomada-pela-proxima-iniciativa'],
    hypothesis: 'war-room-como-gestao',
    reinforces: [
      { fact: 'culpa-e-controle', branch: 'leadership', hypothesis: 'war-room-como-gestao' },
      { fact: 'causa-capacidade-tomada-pela-proxima-iniciativa', branch: 'portfolio', hypothesis: 'war-room-como-gestao' },
    ],
    practiceTarget: 'Investigação protegida; o reconhecimento deixa de premiar só o herói do incidente.',
    toolFamilies: [],
    foundation: { source: 'SRE / blameless postmortem', principle: 'Culpa local preserva as condições do erro' },
    actionsByContainment: {
      leadership: 'Parar de autorizar caça ao culpado e meta que pune relato.',
      operations: 'Registrar condições do sistema, não a pessoa.',
      portfolio: 'Reservar capacidade para aprender; não comer a análise com a próxima iniciativa.',
    },
  },
];

const reinforcements = capabilityFamilyCatalog.flatMap((pack) => pack.reinforces);

export function supportForHypothesis(hypothesis: string, signals: BranchSignal[]): HypothesisSupport {
  const matching = signals.filter((signal) =>
    reinforcements.some((edge) => edge.hypothesis === hypothesis && edge.fact === signal.pattern && edge.branch === signal.branch),
  );
  const branches = [...new Set(matching.map((signal) => signal.branch))];
  const participants = new Set(matching.map((signal) => signal.participantId));
  const weight = participants.size + Math.max(0, branches.length - 1);
  return { hypothesis, weight, reinforced: branches.length >= 2, branches };
}

export function ceremonyLearning(observation: CeremonyObservation): CeremonyLearning {
  if (observation.ritePresent && observation.nextEquivalentEventChanged && observation.actionHadOwner) {
    return { scoresLearning: true, pattern: 'aprendizado-blameless' };
  }
  return { scoresLearning: false, pattern: 'postmortem-sem-efeito' };
}

export function familyGapFromEvent(event: FamilyEvent): FamilyGap | undefined {
  if (!event.eventOccurred || event.pathPresent) return undefined;
  const pack = capabilityFamilyCatalog.find((item) => item.id === event.family);
  if (!pack) return undefined;
  return {
    kind: 'missing-family',
    family: pack.id,
    pattern: pack.hypothesis,
    title: pack.path,
    explanation: `O evento ocorreu e o caminho esperado não apareceu. ${pack.practiceTarget}`,
    toolFamilies: pack.toolFamilies,
  };
}

export function reinforcementEdges(): Array<{ from: string; relation: 'reinforces'; to: string }> {
  return reinforcements.map((edge) => ({
    from: `fact:${edge.fact}`,
    relation: 'reinforces' as const,
    to: `cause:${edge.hypothesis}`,
  }));
}
