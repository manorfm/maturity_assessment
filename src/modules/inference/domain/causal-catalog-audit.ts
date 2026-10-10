import type { CausalFamily } from './causal-family.js';

export type CausalCatalogIssue = {
  severity: 'error' | 'warning';
  code: string;
  subject: string;
  message: string;
};

/** Auditoria de famílias noisy-OR e proveniência (05 §8.6 / §12). */
export function auditCausalCatalog(families: readonly CausalFamily[]): CausalCatalogIssue[] {
  return families.flatMap(auditFamily);
}

function auditFamily(family: CausalFamily): CausalCatalogIssue[] {
  const issues: CausalCatalogIssue[] = [];
  const subject = family.id;
  const prov = family.provenance;
  if (!prov.author?.trim() || !prov.date?.trim() || !prov.rationale?.trim()) {
    issues.push(issue('error', 'missing-provenance', subject, 'Família causal precisa de autor, data e justificativa.'));
  }
  if (!prov.method) {
    issues.push(issue('error', 'missing-provenance-method', subject, 'Proveniência precisa declarar method (provisional|prototype|shelf).'));
  }
  if (!prov.version?.trim()) {
    issues.push(issue('warning', 'missing-provenance-version', subject, 'Proveniência sem versão do parâmetro.'));
  }
  if (prov.method === 'shelf') {
    if (prov.experts === undefined || prov.experts < 3 || prov.experts > 5) {
      issues.push(issue('error', 'shelf-experts-range', subject, 'SHELF exige 3 a 5 especialistas registrados.'));
    }
    if (!prov.elicitedAt?.trim()) {
      issues.push(issue('error', 'shelf-missing-date', subject, 'SHELF exige data de elicitação.'));
    }
  }
  if (prov.method === 'provisional' || prov.method === 'prototype') {
    issues.push(issue('warning', 'provisional-lambda', subject, 'λ ainda não passaram por elicitação SHELF (05 §8.6).'));
  }
  if (!family.causes.length) {
    issues.push(issue('error', 'empty-causes', subject, 'Família sem causas.'));
  }
  if (!family.symptoms.length) {
    issues.push(issue('error', 'empty-symptoms', subject, 'Família sem sintomas.'));
  }
  for (const cause of family.causes) {
    if (cause.prior < 0 || cause.prior > 1) {
      issues.push(issue('error', 'prior-range', `${subject}/${cause.id}`, 'Prior da causa fora de [0, 1].'));
    }
  }
  for (const symptom of family.symptoms) {
    if (symptom.leak < 0 || symptom.leak > 1) {
      issues.push(issue('error', 'leak-range', `${subject}/${symptom.id}`, 'Vazamento λ₀ fora de [0, 1].'));
    }
    for (const cause of family.causes) {
      const lambda = symptom.lambda[cause.id];
      if (lambda === undefined) {
        issues.push(issue('error', 'missing-lambda', `${subject}/${symptom.id}`, `Falta λ para causa ${cause.id}.`));
      } else if (lambda < 0 || lambda > 1) {
        issues.push(issue('error', 'lambda-range', `${subject}/${symptom.id}/${cause.id}`, 'λ fora de [0, 1].'));
      }
    }
  }
  return issues;
}

function issue(
  severity: CausalCatalogIssue['severity'],
  code: string,
  subject: string,
  message: string,
): CausalCatalogIssue {
  return { severity, code, subject, message };
}
