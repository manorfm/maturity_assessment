import { capabilityFamilyCatalog } from './capability-family.js';
import { diagnosticSystemFor } from './problem-system.js';
import { systemicEffectFor } from './hierarchical-problems.js';
import { CapabilityTaxonomy } from './capability-taxonomy.js';
import type { OutcomeFinding } from './report-outcome.js';

export type DisciplineCrossing = {
  fromId: string;
  fromLabel: string;
  fromTitle: string;
  fromPattern: string;
  toId: string;
  toLabel: string;
  toTitle: string;
  toPattern: string;
  generates: string;
};

/** Campos que o cruzamento lê; achados publicados no relatório podem omitir padrão e disciplina. */
export type CrossingSource = Pick<OutcomeFinding, 'title'> & Partial<Pick<OutcomeFinding, 'pattern' | 'detailCapability'>>;

type LocatedFinding = Pick<OutcomeFinding, 'title' | 'pattern' | 'detailCapability'>;

type Feed = { from: string; to: string; because: string };

const FEEDS: Feed[] = [
  { from: 'provisionamento-em-fila', to: 'espera-normalizada', because: 'Pedido na fila gera mais trabalho em aberto.' },
  { from: 'espera-normalizada', to: 'war-room-como-gestao', because: 'O extra só aparece quando já quebrou.' },
  { from: 'espera-normalizada', to: 'causa-capacidade-tomada-pela-proxima-iniciativa', because: 'Mais início come a capacidade de revisar o resultado.' },
  { from: 'provisionamento-em-fila', to: 'causa-capacidade-tomada-pela-proxima-iniciativa', because: 'A fila come o tempo de rever o resultado.' },
  { from: 'provisionamento-em-fila', to: 'war-room-como-gestao', because: 'Fila de ambiente ou permissão vira gestão por crise.' },
  { from: 'empacotamento-manual', to: 'caminho-de-versao-sem-origem', because: 'Preparar à mão quebra a origem da versão.' },
  { from: 'empacotamento-manual', to: 'causa-capacidade-tomada-pela-proxima-iniciativa', because: 'A esteira manual come a revisão do resultado.' },
  { from: 'caminho-de-versao-sem-origem', to: 'war-room-como-gestao', because: 'Sem origem da versão, o war room é o mapa.' },
  { from: 'retrospectiva-sem-fechamento', to: 'war-room-como-gestao', because: 'Ação sem dono deixa a crise como único fechamento.' },
  { from: 'retrospectiva-sem-fechamento', to: 'postmortem-sem-efeito', because: 'Lista sem dono não muda o próximo incidente.' },
  { from: 'postmortem-sem-efeito', to: 'war-room-como-gestao', because: 'Sem mudança no próximo evento, a crise volta a gerir.' },
  { from: 'ownership-fragmentado', to: 'war-room-como-gestao', because: 'Fronteira sem dono empurra a decisão para a crise.' },
  { from: 'causa-responsabilidade-encerra-no-aceite', to: 'retrospectiva-sem-fechamento', because: 'Aceite encerra o dono da melhoria.' },
  { from: 'dependencia-de-heroi', to: 'reversao-nao-reproduzivel', because: 'Diagnóstico concentrado impede reversão no caminho.' },
  { from: 'correcao-direta-na-producao', to: 'reversao-nao-reproduzivel', because: 'Hotfix artesanal não devolve o caminho.' },
  { from: 'mudanca-emergencial-reconciliada', to: 'causa-capacidade-tomada-pela-proxima-iniciativa', because: 'Reconciliar emergência come a revisão do resultado.' },
  { from: 'portfolio-sem-feedback', to: 'retrospectiva-sem-fechamento', because: 'Portfólio sem ciclo deixa ação sem fechamento.' },
  { from: 'causa-capacidade-tomada-pela-proxima-iniciativa', to: 'war-room-como-gestao', because: 'Sem capacidade para aprender, a crise vira o modo de gestão.' },
];

export function patternFeeds(): Array<{ from: string; to: string }> {
  return FEEDS.map((feed) => ({ from: feed.from, to: feed.to }));
}

export function publishedIntersections(findings: CrossingSource[]): DisciplineCrossing[] {
  const unique = uniqueLocatedByPattern(findings);
  if (unique.length < 2) return [];
  const byPattern = new Map(unique.map((item) => [item.pattern, item]));
  const best = new Map<string, DisciplineCrossing>();
  const remember = (edge: DisciplineCrossing) => {
    const key = `${edge.fromPattern}->${edge.toPattern}`;
    if (!best.has(key)) best.set(key, edge);
  };

  for (const feed of FEEDS) {
    const from = byPattern.get(feed.from);
    const to = byPattern.get(feed.to);
    if (!from || !to || from.detailCapability === to.detailCapability) continue;
    remember(crossingOf(from, to, feed.because));
  }

  for (const pack of capabilityFamilyCatalog) {
    for (const edge of pack.reinforces) {
      const from = byPattern.get(edge.fact);
      const to = byPattern.get(edge.hypothesis);
      if (!from || !to || from.detailCapability === to.detailCapability) continue;
      remember(crossingOf(from, to, firstSentence(pack.path)));
    }
  }

  return [...best.values()];
}

export function projectDisciplineCrossings(findings: CrossingSource[], primaryPattern?: string): DisciplineCrossing[] {
  const unique = uniqueLocatedByPattern(findings);
  if (unique.length < 2) return [];
  const scored: Array<DisciplineCrossing & { strength: number }> = [
    ...publishedIntersections(findings).map((edge) => ({ ...edge, strength: 3 })),
  ];

  for (let index = 0; index < unique.length; index += 1) {
    for (let next = index + 1; next < unique.length; next += 1) {
      const left = unique[index]!;
      const right = unique[next]!;
      if (left.detailCapability === right.detailCapability) continue;
      const system = diagnosticSystemFor(left.pattern);
      const other = diagnosticSystemFor(right.pattern);
      if (!system || !other || system.id !== other.id) continue;
      const [from, to] = orderToward(left, right, primaryPattern);
      scored.push({ ...crossingOf(from, to, firstSentence(systemicEffectFor(from))), strength: 2 });
    }
  }

  return pickEdges(scored, primaryPattern).slice(0, 3);
}

export function crossingsForCapability(findings: CrossingSource[], capabilityIds: string[], primaryPattern?: string): DisciplineCrossing[] {
  const ids = new Set(capabilityIds.filter(Boolean));
  if (!ids.size) return [];
  return projectDisciplineCrossings(findings, primaryPattern).filter((edge) => ids.has(edge.fromId) || ids.has(edge.toId));
}

function pickEdges(scored: Array<DisciplineCrossing & { strength: number }>, primaryPattern?: string): DisciplineCrossing[] {
  const best = new Map<string, DisciplineCrossing & { strength: number }>();
  for (const edge of scored) {
    const key = `${edge.fromId}->${edge.toId}`;
    const current = best.get(key);
    if (!current || edge.strength > current.strength) best.set(key, edge);
  }
  const ranked = [...best.values()].sort((left, right) => {
    const toward = Number(right.toPattern === primaryPattern) - Number(left.toPattern === primaryPattern);
    if (toward) return toward;
    if (right.strength !== left.strength) return right.strength - left.strength;
    return left.fromLabel.localeCompare(right.fromLabel, 'pt-BR');
  });
  const picked: Array<DisciplineCrossing & { strength: number }> = [];
  const usedFrom = new Set<string>();
  const usedTo = new Set<string>();
  for (const edge of ranked) {
    if (picked.length >= 3) break;
    if (usedFrom.has(edge.fromId) || usedTo.has(edge.toId)) continue;
    picked.push(edge);
    usedFrom.add(edge.fromId);
    usedTo.add(edge.toId);
  }
  for (const edge of ranked) {
    if (picked.length >= 3) break;
    if (picked.includes(edge)) continue;
    picked.push(edge);
  }
  return picked;
}

function orderToward(left: LocatedFinding, right: LocatedFinding, primaryPattern?: string): [LocatedFinding, LocatedFinding] {
  if (primaryPattern && right.pattern === primaryPattern) return [left, right];
  if (primaryPattern && left.pattern === primaryPattern) return [right, left];
  return [left, right];
}

function crossingOf(from: LocatedFinding, to: LocatedFinding, because: string): DisciplineCrossing {
  const fromId = from.detailCapability;
  const toId = to.detailCapability;
  return {
    fromId,
    fromLabel: CapabilityTaxonomy.labelFor(fromId),
    fromTitle: from.title,
    fromPattern: from.pattern,
    toId,
    toLabel: CapabilityTaxonomy.labelFor(toId),
    toTitle: to.title,
    toPattern: to.pattern,
    generates: because,
  };
}

function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]+[.!?]/);
  return (match?.[0] ?? text).trim();
}

/** Primeiro achado de cada padrão; só os que apontam uma disciplina entram no cruzamento. */
function uniqueLocatedByPattern(findings: CrossingSource[]): LocatedFinding[] {
  const seen = new Set<string>();
  const located: LocatedFinding[] = [];
  for (const finding of findings) {
    if (!finding.pattern || seen.has(finding.pattern)) continue;
    seen.add(finding.pattern);
    if (finding.detailCapability) {
      located.push({ title: finding.title, pattern: finding.pattern, detailCapability: finding.detailCapability });
    }
  }
  return located;
}
