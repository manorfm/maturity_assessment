import { capabilityFamilyCatalog, type CapabilityFamily } from './capability-family.js';
import { guidanceFor } from './solution-guidance.js';
import type { OutcomeFinding } from './report-outcome.js';

export type DiagnosticFrontId = 'product' | 'engineering' | 'operations' | 'management';

export type FrontInventoryRow = {
  front: DiagnosticFrontId;
  label: string;
  mechanism: string;
  relativeBelief: string;
  action: string;
  pattern: string;
};

export type OrgDesignFork = {
  institute: string;
  dismantle: string;
  antiPattern: string;
  preserveObligation: string;
};

export type PolicyBriefing = {
  pattern: string;
  produces: string;
  stopAuthorizing: string;
  smallestTest: string;
  howToKnow: string;
  technicalPath: string;
};

export type FrontInventory = {
  version: 'front-inventory-v1';
  rows: FrontInventoryRow[];
  orgDesignFork?: OrgDesignFork;
  policyBriefing?: PolicyBriefing;
};

const fronts: ReadonlyArray<{ id: DiagnosticFrontId; label: string; containmentKey: string }> = [
  { id: 'product', label: 'Produto', containmentKey: 'portfolio' },
  { id: 'engineering', label: 'Engenharia', containmentKey: 'engineering' },
  { id: 'operations', label: 'Operação', containmentKey: 'operations' },
  { id: 'management', label: 'Gestão', containmentKey: 'leadership' },
];

const leafFront: Record<string, DiagnosticFrontId> = {
  'product-direction': 'product',
  'discovery-validation': 'product',
  'portfolio-management': 'product',
  'planning-refinement': 'product',
  'work-management': 'engineering',
  'continuous-integration': 'engineering',
  'release-feedback': 'engineering',
  'sustainable-design': 'engineering',
  'quality-strategy': 'engineering',
  'sdlc-automation': 'engineering',
  'technical-capability': 'engineering',
  'domain-alignment': 'engineering',
  'architecture-decisions': 'engineering',
  evolvability: 'engineering',
  'integration-data': 'engineering',
  'platform-autonomy': 'engineering',
  'reproducible-infrastructure': 'engineering',
  'cloud-efficiency': 'engineering',
  'software-security': 'engineering',
  'cloud-security': 'engineering',
  'observability-practice': 'operations',
  'reliability-practice': 'operations',
  'incident-management': 'operations',
  'cloud-reliability': 'operations',
  'team-ownership': 'management',
  'enabling-governance': 'management',
  'leadership-management': 'management',
  collaboration: 'management',
  'organizational-learning': 'management',
};

export function packForPattern(pattern: string): CapabilityFamily | undefined {
  return capabilityFamilyCatalog.find((pack) => pack.hypothesis === pattern || pack.facts.includes(pattern));
}

export function projectFrontInventory(findings: OutcomeFinding[]): FrontInventory {
  const unique = [...findings].sort((left, right) => right.priority - left.priority || right.confidence - left.confidence);
  const rows = fronts.flatMap((front) => {
    const candidates = unique.filter((finding) => frontsForFinding(finding).includes(front.id));
    const finding = candidates[0];
    if (!finding) return [];
    const pack = packForPattern(finding.pattern);
    const action = pack?.actionsByContainment[front.containmentKey]
      ?? finding.experiment?.action
      ?? finding.intervention;
    const mechanism = guidanceFor(finding.pattern, finding.foundation, finding.title).plainExplanation;
    return [{
      front: front.id,
      label: front.label,
      mechanism,
      relativeBelief: relativeBelief(finding, unique),
      action,
      pattern: finding.pattern,
    }];
  });
  const orgDesign = unique.map((finding) => orgDesignFork(finding.pattern)).find((item) => item);
  const policy = unique.map((finding) => policyBriefingFor(finding.pattern)).find((item) => item);
  return {
    version: 'front-inventory-v1',
    rows,
    ...(orgDesign ? { orgDesignFork: orgDesign } : {}),
    ...(policy ? { policyBriefing: policy } : {}),
  };
}

export function orgDesignFork(pattern: string): OrgDesignFork | undefined {
  const guidance = guidanceFor(pattern);
  const design = guidance.solutionKind === 'org-design' || /sustentacao|fronteira-times|ownership-fragmentado|heroi-troca/i.test(pattern);
  if (!design) return undefined;
  return {
    institute: 'Instituir capacidade compartilhada com autoridade sobre o resultado — não uma fila com outro nome.',
    dismantle: 'Desfazer a fronteira (sustentação) só se ela opera a mesma fila sem autoridade sobre o resultado.',
    antiPattern: /sustentacao|fronteira-times|ownership-fragmentado/i.test(pattern)
      ? 'Plataforma que opera a mesma fila; “somos modernos, logo não tem N2”.'
      : guidance.antiPattern,
    preserveObligation: 'Segregação exigida por obrigação permanece controle proporcional.',
  };
}

export function policyBriefingFor(pattern: string): PolicyBriefing | undefined {
  if (pattern !== 'war-room-como-gestao' && pattern !== 'culpa-e-controle') return undefined;
  const reversal = packForPattern('reversao-nao-reproduzivel');
  return {
    pattern,
    produces: 'Esconder o erro e gerir por reunião de crise atrasa o relato, concentra a decisão só quando já quebrou e come a análise com a próxima iniciativa.',
    stopAuthorizing: 'Parar de autorizar caça ao culpado, meta que pune relato e celebração só de quem salvou.',
    smallestTest: 'Reconstruir um incidente recente sem nome; uma mudança no sistema com dono e revisão de efeito.',
    howToKnow: 'Relato mais cedo, condição antes omitida, ação sistêmica e reunião de crise menos frequente.',
    technicalPath: reversal?.actionsByContainment.engineering ?? 'Tornar a reversão um passo do caminho, não um hotfix artesanal.',
  };
}

function frontsForFinding(finding: OutcomeFinding): DiagnosticFrontId[] {
  const pack = packForPattern(finding.pattern);
  const fromPack = fronts.filter((front) => pack?.actionsByContainment[front.containmentKey]).map((front) => front.id);
  const fromLeaf = leafFront[finding.detailCapability];
  return [...new Set([...fromPack, ...(fromLeaf ? [fromLeaf] : [])])];
}

function relativeBelief(finding: OutcomeFinding, findings: OutcomeFinding[]): string {
  const pack = packForPattern(finding.pattern);
  const crossSupport = Boolean(pack && findings.some((item) => item.pattern !== finding.pattern && (item.pattern === pack.hypothesis || pack.facts.includes(item.pattern) || item.recommendationEvidence?.patterns.some((pattern) => pack.facts.includes(pattern) || pattern === pack.hypothesis))));
  if (finding.confidence >= .85 && crossSupport) return 'crença relativa alta (provisória)';
  if (finding.confidence >= .6) return 'crença relativa moderada (provisória)';
  return 'crença relativa inicial (provisória)';
}
