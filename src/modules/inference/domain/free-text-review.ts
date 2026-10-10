import type { Database } from '../../../shared/database.js';
import { id } from '../../../shared/ids.js';
import { freeTextPipeline, stripPii } from '../../catalog/item-catalog.js';

export type FreeTextCode = {
  id: string;
  label: string;
  definition: string;
};

/** Livro de códigos 07 §6 — strategy-purpose-v1. */
export const strategyPurposeCodebook = {
  version: 'strategy-purpose-v1',
  codes: [
    {
      id: 'outcome-linked',
      label: 'Ligado a resultado',
      definition: 'A frase conecta o trabalho a um efeito observável para cliente, risco ou capacidade.',
    },
    {
      id: 'delivery-only',
      label: 'Só entrega',
      definition: 'A frase descreve entrega, atividade ou artefato sem efeito esperado.',
    },
    {
      id: 'unclear',
      label: 'Ambíguo',
      definition: 'Não dá para classificar o propósito com a frase dada.',
    },
    {
      id: 'unrelated',
      label: 'Fora de escopo',
      definition: 'A frase não responde ao propósito do trabalho recente.',
    },
  ] satisfies FreeTextCode[],
};

export type ReviewReason = 'low_confidence' | 'rare_code' | 'random_sample' | 'required';

export type FreeTextEntry = {
  id: string;
  projectId: string;
  unitId: string;
  nodeId: string;
  codebookVersion: string;
  sanitizedText: string;
  proposedCode: string | null;
  proposedConfidence: number | null;
  reviewReason: ReviewReason;
  status: 'pending' | 'coded' | 'discarded';
};

export type CodingPair = { a: string; b: string };

export type FreeTextAgreement = {
  overallKappa?: number;
  pairs: number;
  perCodeKappa: Record<string, number | undefined>;
  publishableCodes: string[];
  reason?: string;
};

/**
 * κ de Cohen para pares de códigos categóricos (07 §6).
 * Retorna 0 com menos de 2 pares.
 */
export function cohenKappa(pairs: readonly CodingPair[]): number {
  if (pairs.length < 2) return 0;
  const labels = [...new Set(pairs.flatMap((pair) => [pair.a, pair.b]))];
  const n = pairs.length;
  let agree = 0;
  const countA = new Map<string, number>();
  const countB = new Map<string, number>();
  for (const label of labels) {
    countA.set(label, 0);
    countB.set(label, 0);
  }
  for (const pair of pairs) {
    if (pair.a === pair.b) agree += 1;
    countA.set(pair.a, (countA.get(pair.a) ?? 0) + 1);
    countB.set(pair.b, (countB.get(pair.b) ?? 0) + 1);
  }
  const pO = agree / n;
  let pE = 0;
  for (const label of labels) {
    pE += ((countA.get(label) ?? 0) / n) * ((countB.get(label) ?? 0) / n);
  }
  if (pE >= 1) return 1;
  return Number(((pO - pE) / (1 - pE)).toFixed(3));
}

/** κ binário por código (código vs demais). */
export function cohenKappaForCode(pairs: readonly CodingPair[], code: string): number {
  return cohenKappa(pairs.map((pair) => ({
    a: pair.a === code ? code : `not:${code}`,
    b: pair.b === code ? code : `not:${code}`,
  })));
}

export function reviewReasonFor(input: {
  entryId: string;
  proposedCode?: string;
  proposedConfidence?: number;
  codeFrequency?: number;
}): ReviewReason {
  if (input.proposedConfidence === undefined || input.proposedConfidence < 0.6) return 'low_confidence';
  if ((input.codeFrequency ?? 1) < 0.05) return 'rare_code';
  let hash = 0;
  for (let index = 0; index < input.entryId.length; index += 1) {
    hash = (hash + input.entryId.charCodeAt(index)) % 100;
  }
  if (hash < freeTextPipeline.randomReviewRate * 100) return 'random_sample';
  return 'required';
}

export class FreeTextReviewService {
  constructor(private readonly db: Database) {}

  enqueue(input: {
    projectId: string;
    unitId: string;
    nodeId: string;
    rawText: string;
    proposedCode?: string;
    proposedConfidence?: number;
    codebookVersion?: string;
  }): FreeTextEntry {
    const entryId = id();
    const sanitizedText = stripPii(input.rawText.trim()).slice(0, 280);
    if (!sanitizedText) throw new Error('Texto livre vazio após sanitização.');
    const reviewReason = reviewReasonFor({
      entryId,
      proposedCode: input.proposedCode,
      proposedConfidence: input.proposedConfidence,
    });
    const now = new Date().toISOString();
    const codebookVersion = input.codebookVersion ?? strategyPurposeCodebook.version;
    this.db.prepare(`
      INSERT INTO free_text_entries (
        id, project_id, unit_id, node_id, codebook_version, sanitized_text,
        proposed_code, proposed_confidence, review_reason, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(
      entryId,
      input.projectId,
      input.unitId,
      input.nodeId,
      codebookVersion,
      sanitizedText,
      input.proposedCode ?? null,
      input.proposedConfidence ?? null,
      reviewReason,
      now,
    );
    return this.getEntry(entryId)!;
  }

  listPending(projectId: string): FreeTextEntry[] {
    const rows = this.db.prepare(`
      SELECT id, project_id, unit_id, node_id, codebook_version, sanitized_text,
        proposed_code, proposed_confidence, review_reason, status
      FROM free_text_entries
      WHERE project_id = ? AND status = 'pending'
      ORDER BY created_at
    `).all(projectId) as unknown as Array<Record<string, string | number | null>>;
    return rows.map(mapEntry);
  }

  recordCoding(entryId: string, raterKey: string, code: string): void {
    const entry = this.getEntry(entryId);
    if (!entry || entry.status !== 'pending') throw new Error('Entrada de texto livre indisponível para codificação.');
    if (!strategyPurposeCodebook.codes.some((item) => item.id === code)) {
      throw new Error('Código fora do livro de códigos.');
    }
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO free_text_codings (id, entry_id, rater_key, code, created_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(entry_id, rater_key) DO UPDATE SET code = excluded.code, created_at = excluded.created_at
    `).run(id(), entryId, raterKey, code, now);

    const raters = this.db.prepare('SELECT COUNT(DISTINCT rater_key) total FROM free_text_codings WHERE entry_id = ?')
      .get(entryId) as { total: number };
    if (Number(raters.total) >= 2) {
      this.db.prepare("UPDATE free_text_entries SET status = 'coded' WHERE id = ?").run(entryId);
    }
  }

  agreement(projectId: string): FreeTextAgreement {
    const rows = this.db.prepare(`
      SELECT c.entry_id, c.rater_key, c.code
      FROM free_text_codings c
      JOIN free_text_entries e ON e.id = c.entry_id
      WHERE e.project_id = ? AND e.status = 'coded'
      ORDER BY c.entry_id, c.rater_key
    `).all(projectId) as unknown as Array<{ entry_id: string; rater_key: string; code: string }>;

    const byEntry = new Map<string, string[]>();
    for (const row of rows) {
      const codes = byEntry.get(row.entry_id) ?? [];
      codes.push(row.code);
      byEntry.set(row.entry_id, codes);
    }
    const pairs: CodingPair[] = [];
    for (const codes of byEntry.values()) {
      if (codes.length < 2) continue;
      pairs.push({ a: codes[0]!, b: codes[1]! });
    }
    if (pairs.length < 2) {
      return {
        pairs: pairs.length,
        perCodeKappa: {},
        publishableCodes: [],
        reason: 'Concordância de texto livre exige pelo menos dois pares codificados.',
      };
    }
    const overallKappa = cohenKappa(pairs);
    const perCodeKappa: Record<string, number | undefined> = {};
    const publishableCodes: string[] = [];
    for (const code of strategyPurposeCodebook.codes) {
      const used = pairs.some((pair) => pair.a === code.id || pair.b === code.id);
      if (!used) {
        perCodeKappa[code.id] = undefined;
        continue;
      }
      const kappa = cohenKappaForCode(pairs, code.id);
      perCodeKappa[code.id] = kappa;
      if (kappa >= freeTextPipeline.minCohenKappa) publishableCodes.push(code.id);
    }
    return { overallKappa, pairs: pairs.length, perCodeKappa, publishableCodes };
  }

  private getEntry(entryId: string): FreeTextEntry | undefined {
    const row = this.db.prepare(`
      SELECT id, project_id, unit_id, node_id, codebook_version, sanitized_text,
        proposed_code, proposed_confidence, review_reason, status
      FROM free_text_entries WHERE id = ?
    `).get(entryId) as unknown as Record<string, string | number | null> | undefined;
    return row ? mapEntry(row) : undefined;
  }
}

function mapEntry(row: Record<string, string | number | null>): FreeTextEntry {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    unitId: String(row.unit_id),
    nodeId: String(row.node_id),
    codebookVersion: String(row.codebook_version),
    sanitizedText: String(row.sanitized_text),
    proposedCode: row.proposed_code === null || row.proposed_code === undefined ? null : String(row.proposed_code),
    proposedConfidence: row.proposed_confidence === null || row.proposed_confidence === undefined
      ? null
      : Number(row.proposed_confidence),
    reviewReason: row.review_reason as ReviewReason,
    status: row.status as FreeTextEntry['status'],
  };
}
