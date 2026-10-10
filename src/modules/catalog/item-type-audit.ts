import type { CatalogItem } from './item-types.js';

export type ItemTypeIssue = {
  severity: 'error' | 'warning';
  code: string;
  subject: string;
  message: string;
};

const groupReferent = /\b(neste time|neste grupo|neste local|quando alguém|as pessoas daqui)\b/i;
const selfReferent = /\b(quando eu|eu erro|meu chefe|minha gestora?)\b/i;
const identityAsk = /\b(nome da pessoa|qual colega|quem foi o responsável pelo erro|cargo de)\b/i;

export function auditItemCatalog(items: CatalogItem[]): ItemTypeIssue[] {
  return items.flatMap(auditItem);
}

function auditItem(item: CatalogItem): ItemTypeIssue[] {
  const issues: ItemTypeIssue[] = [];
  if (identityAsk.test(`${item.scenario} ${item.prompt}`)) {
    issues.push(issue('error', 'identity-ask', item.id, 'O item não pode pedir identificação de pessoa, cargo único ou time nomeado.'));
  }

  if (item.kind === 'vignette') {
    if (item.authorAnchor < 0 || item.authorAnchor > 4) {
      issues.push(issue('error', 'vignette-anchor-range', item.id, 'A vinheta precisa de âncora autoral entre 0 e 4.'));
    }
    if (item.options.length < 3) {
      issues.push(issue('error', 'vignette-options', item.id, 'A vinheta precisa de pelo menos três opções ancoradas.'));
    }
    const anchors = new Set(item.options.map((option) => option.anchor));
    if (!anchors.has(item.authorAnchor)) {
      issues.push(issue('warning', 'vignette-anchor-missing-option', item.id, 'Nenhuma opção usa a âncora autoral da vinheta.'));
    }
  }

  if (item.kind === 'literacy') {
    const verdicts = new Set(item.readings.map((reading) => reading.verdict));
    if (!verdicts.has('correct')) issues.push(issue('error', 'literacy-missing-correct', item.id, 'O item de leitura precisa de uma opção correta.'));
    if (!verdicts.has('literacy-absent')) issues.push(issue('error', 'literacy-missing-absent', item.id, 'O item de leitura precisa permitir declarar que não sabe interpretar.'));
    if (!item.stimulus.trim()) issues.push(issue('error', 'literacy-missing-stimulus', item.id, 'O item de leitura precisa de um estímulo.'));
  }

  if (item.kind === 'group-referent') {
    if (!groupReferent.test(`${item.scenario} ${item.prompt}`)) {
      issues.push(issue('error', 'group-referent-missing', item.id, 'Pergunta de clima/cultura deve usar referente de grupo, não o indivíduo.'));
    }
    if (selfReferent.test(`${item.scenario} ${item.prompt}`)) {
      issues.push(issue('error', 'self-referent', item.id, 'Pergunta de grupo não deve usar referente individual.'));
    }
  }

  if (item.kind === 'list-technique') {
    if (item.neutralStatements.length < 3) {
      issues.push(issue('error', 'list-too-short', item.id, 'A lista de controle precisa de pelo menos três afirmações neutras.'));
    }
    if (!item.sensitiveStatement.trim()) {
      issues.push(issue('error', 'list-missing-sensitive', item.id, 'A técnica de lista precisa da afirmação sensível.'));
    }
    if (item.minimumSample < 40) {
      issues.push(issue('error', 'list-sample-floor', item.id, 'A técnica de lista só pode publicar com mínimo 40 por braço.'));
    }
  }

  if (item.kind === 'free-text') {
    if (item.maxChars < 40 || item.maxChars > 500) {
      issues.push(issue('warning', 'free-text-length', item.id, 'Texto livre deve ficar entre 40 e 500 caracteres.'));
    }
    if (!item.codebookVersion.trim()) {
      issues.push(issue('error', 'free-text-codebook', item.id, 'Texto livre precisa de livro de códigos versionado.'));
    }
  }

  return issues;
}

function issue(severity: ItemTypeIssue['severity'], code: string, subject: string, message: string): ItemTypeIssue {
  return { severity, code, subject, message };
}
