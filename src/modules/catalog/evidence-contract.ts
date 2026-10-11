import type { ConstraintKind, EvidenceLayer, Option, Signal } from './assessment-graph.js';

export type AnchorStage = 0 | 1 | 2 | 3 | 4;
export type Discrimination = 'low' | 'medium' | 'high';
export type Appropriation = 'ritual' | 'heroism';
/** Fase técnica F0–F5 (12); fora do índice de maturidade (R28). */
export type SophisticationPhase = 0 | 1 | 2 | 3 | 4 | 5;

/** Linha da matriz Q (04 §4.1). `pattern` e `pillar` sustentam o adaptador m1 até WP5. */
export type EvidenceLink = {
  capability: string;
  pattern: string;
  pillar: string;
  anchorStage: AnchorStage;
  discrimination: Discrimination;
  layer: EvidenceLayer;
  appropriation?: Appropriation;
  /** Segundo eixo: mecanismo técnico observado no evento; não altera o índice. */
  sophistication?: SophisticationPhase;
  constraint: ConstraintKind;
  role: 'primary' | 'effect';
};

export type OptionEvidence = Option & { evidence: EvidenceLink[] };

const heroismPattern = /her[oó]i|dependencia-de-heroi/i;
const ritualPattern = /war-room|cerim[oô]n|ritual|reunir-e-anotar|retrospectiva-sem/i;

export function weightToAnchorStage(weight: number): AnchorStage {
  if (weight <= -2) return 0;
  if (weight === -1) return 1;
  if (weight === 0) return 2;
  if (weight === 1) return 3;
  return 4;
}

export function anchorStageToWeight(stage: AnchorStage): number {
  return ({ 0: -2, 1: -1, 2: 0, 3: 1, 4: 2 } as const)[stage];
}

export function signalToEvidenceLinks(signal: Signal): EvidenceLink[] {
  const leaves = signal.details.length ? signal.details : [signal.capability];
  const appropriation = appropriationFor(signal.pattern);
  const sophistication = sophisticationForPattern(signal.pattern);
  // 04 §4.2: ritual/heroísmo são estágio 1 (forma sem função / esforço heroico),
  // não ausência (0). Peso autoral −2 sobe para âncora 1; adaptador m1 deriva −1.
  let anchorStage = weightToAnchorStage(signal.weight);
  if (appropriation && anchorStage === 0) anchorStage = 1;
  return leaves.map((leaf, index) => ({
    capability: leaf,
    pattern: signal.pattern,
    pillar: signal.capability,
    anchorStage,
    discrimination: 'medium',
    layer: signal.layer,
    ...(appropriation ? { appropriation } : {}),
    ...(sophistication !== undefined ? { sophistication } : {}),
    constraint: signal.constraint,
    role: index === 0 ? 'primary' : 'effect',
  }));
}

export function evidenceToSignal(link: EvidenceLink): Signal {
  return {
    capability: link.pillar,
    pattern: link.pattern,
    weight: anchorStageToWeight(link.anchorStage),
    details: [link.capability],
    layer: link.layer,
    constraint: link.constraint,
  };
}

/** Reagrupa folhas da mesma evidência num Signal m1 (um padrão, várias details). */
export function evidenceToSignals(links: EvidenceLink[]): Signal[] {
  const groups = new Map<string, EvidenceLink[]>();
  for (const link of links) {
    const key = `${link.pattern}|${link.pillar}|${link.anchorStage}|${link.layer}|${link.constraint}|${link.appropriation ?? ''}`;
    const group = groups.get(key) ?? [];
    group.push(link);
    groups.set(key, group);
  }
  return [...groups.values()].map((group) => {
    const primary = group.find((link) => link.role === 'primary') ?? group[0]!;
    return {
      capability: primary.pillar,
      pattern: primary.pattern,
      weight: anchorStageToWeight(primary.anchorStage),
      details: group.map((link) => link.capability),
      layer: primary.layer,
      constraint: primary.constraint,
    };
  });
}

export function normalizeOptionEvidence(option: Option & { evidence?: EvidenceLink[] }): OptionEvidence {
  const authored = option.signals;
  const evidence = option.evidence?.length
    ? option.evidence
    : authored.flatMap(signalToEvidenceLinks);
  // Matriz Q e m1 alinhados: ritual/heroísmo → âncora 1 → peso −1.
  return { ...option, evidence, signals: evidenceToSignals(evidence) };
}

function appropriationFor(pattern: string): Appropriation | undefined {
  if (heroismPattern.test(pattern)) return 'heroism';
  if (ritualPattern.test(pattern)) return 'ritual';
  return undefined;
}

/**
 * Trilhas 12 §3: F declarado por padrão de evento no grafo.
 * Independente da âncora de apropriação (R28).
 */
const patternSophistication: Record<string, SophisticationPhase> = {
  // 3.1 Observabilidade
  'deteccao-tardia': 0,
  'causa-impacto-invisivel': 0,
  'causa-lacuna-telemetria': 0,
  'telemetria-fragmentada': 1,
  'causa-ferramenta-observabilidade': 1,
  'celebra-media': 1,
  'ignora-base-pequena': 1,
  'limiar-sem-contexto': 2,
  'limites-escondem-distribuicao': 2,
  'ia-diagnostico-como-fato': 2,
  'diagnostico-correlacionado': 3,
  'sinal-orientado-impacto': 4,
  'distribuicao-interpretada-no-contexto': 4,
  'recusa-concluir-sem-contexto': 4,

  // 3.2 Resposta a incidentes
  'incidente-detectado-por-cliente': 0,
  'servico-sem-responsavel': 0,
  'incidente-na-fila-de-trabalho': 0,
  'incidente-e-unica-evidencia-de-resiliencia': 0,
  'confiabilidade-reativa-a-incidente': 0,
  'diagnostico-por-dado-pessoal': 0,
  'incidente-depende-do-autor': 1,
  'incidente-por-escalada-relacional': 1,
  'diagnostico-por-acesso-direto': 1,
  'correcao-direta-na-producao': 1,
  'correcao-manual-de-dados': 1,
  'reversao-nao-reproduzivel': 1,
  'incidente-sem-aprendizado': 1,
  'war-room-como-gestao': 1,
  'causa-politica-incidente': 1,
  'incidente-apenas-adiciona-controle': 1,
  'responsabilidade-limitada-ao-codigo': 1,
  'incidente-por-handoff': 2,
  'severidade-inconsistente': 2,
  'severidade-operacional': 3,
  'correcao-reproduzivel': 3,
  'incidente-orientado-impacto': 4,
  'responsabilidade-servico-ponta-a-ponta': 4,

  // 3.3 Integração contínua
  'integracao-tardia': 0,
  'causa-processo-lote': 0,
  'mudanca-isolada': 0,
  'conflito-de-integracao-tardio': 0,
  'integracao-por-janela': 1,
  'caminho-de-versao-sem-origem': 1,
  'fonte-nao-confiavel': 1,
  'mudanca-sobrescrita': 1,
  'automacao-sem-feedback': 2,
  'causa-verificacao-concorrente': 2,
  'integracao-frequente-fragil': 3,
  'integracao-frequente': 3,
  'integracao-continua-validada': 4,
  'feedback-tecnico-rapido': 4,

  // 3.4 Entrega e liberação
  'release-em-lote': 0,
  'entrega-substitui-resultado': 0,
  'empacotamento-manual': 1,
  'causa-acoplamento-entrega': 1,
  'maturidade-nao-resiste-urgencia': 1,
  'portfolio-sem-feedback': 1,
  'deploy-igual-release': 2,
  'controles-de-release-acumulados': 2,
  'nao-funcionais-por-campanha': 2,
  'entrega-repetivel': 3,
  'deploy-release-desacoplados': 4,
  'fluxo-seguro-sob-pressao': 4,

  // 3.5 Infraestrutura e ambientes
  'recuperacao-cloud-por-console': 1,
  'caminho-inadequado-ao-caso': 1,
  'infraestrutura-recupera-por-desenho-testado': 4,

  // 3.6 Qualidade e testes
  'qualidade-tardia': 0,
  'qualidade-como-fase': 0,
  'qualidade-como-handoff': 0,
  'nao-funcionais-descobertos-em-producao': 0,
  'verificacao-dependente-de-memoria': 0,
  'estrategia-de-qualidade-concentrada-no-qa': 1,
  'regressao-crescente': 1,
  'dados-de-teste-fragil': 1,
  'legado-muda-por-tentativa': 1,
  'qualidade-por-suite-padrao': 2,
  'governanca-compensa-feedback-tecnico': 2,
  'qualidade-compartilhada': 3,
  'qualidade-proporcional-ao-risco': 4,
  'nao-funcionais-geram-feedback-continuo': 4,
  'ia-revisada-proporcional': 4,

  // 3.7 Segurança no ciclo
  'ameaca-depois-do-incidente': 0,
  'seguranca-tardia': 0,
  'credencial-em-configuracao': 0,
  'identidade-sem-autorizacao-no-recurso': 0,
  'ia-sombra-sem-politica': 0,
  'seguranca-depende-de-reconhecimento-e-especialista': 1,
  'competencia-de-seguranca-inacessivel': 1,
  'achado-na-fila-de-excecao': 1,
  'compliance-substitui-eficacia': 1,
  'aprovacao-sem-evidencia-decisoria': 1,
  'excecao-de-risco-renovada-sem-evidencia': 1,
  'causa-privacidade-operacional': 1,
  'ameaca-so-em-checklist': 2,
  'seguranca-concentrada-em-scanners': 2,
  'achado-corrigido-no-caso': 2,
  'seguranca-habilitadora': 3,
  'seguranca-integrada-a-mudanca': 3,
  'identidade-com-escopo-e-expiracao': 3,
  'obrigacao-com-evidencia-e-segregacao': 3,
  'ameaca-modelada-na-mudanca': 4,
  'achado-altera-o-caminho': 4,
  'controle-contextual-ao-risco': 5,

  // 3.8 Capacidade e escala / resiliência cloud
  'recuperacao-cloud-depende-de-runbook': 2,
  'resiliencia-cloud-validada-periodicamente': 3,
  'resiliencia-cloud-validada-por-experimento': 4,

  // 22 §2.3 Chaos engineering (prática avançada)
  'chaos-nenhum-exercicio': 0,
  'chaos-tabletop': 1,
  'chaos-gameday-teste': 2,
  'chaos-gameday-producao': 3,
  'chaos-automatizado': 4,
  'chaos-alimenta-design': 5,

  // 22 §3.4 Automação de qualidade (prática avançada)
  'qa-so-em-producao': 0,
  'qa-fase-dias-depois': 1,
  'qa-pipeline-horas': 2,
  'qa-minutos-antes-integrar': 3,
  'qa-feedback-por-risco': 4,
  'qa-guiado-por-producao': 5,

  // 3.9 FinOps e custo
  'eficiencia-cloud-reativa-a-fatura': 0,
  'eficiencia-cloud-por-campanha': 1,
  'eficiencia-cloud-sem-decisao-compartilhada': 1,
  'eficiencia-cloud-por-meta-de-custo': 2,
  'eficiencia-cloud-orientada-a-resultado': 4,
  'eficiencia-cloud-com-ciclo-continuo': 5,

  // 3.10 Integração operacional → analytics
  'contrato-implicito-fragil': 0,
  'numero-diverge-sem-dono': 0,
  'redefinicao-silenciosa-de-dado': 0,
  'reconciliacao-artesanal-de-dado': 1,
  'dado-espera-iniciativa': 1,
  'migracao-de-dados-contextual': 1,
  'causa-correlacao-arquitetural': 2,
  'contrato-de-dado-com-consumidores': 3,
  'contrato-e-dados-evoluem-compativeis': 3,
  'significado-de-dado-acordado': 4,

  // 3.11 Operação de modelos e IA (padrões no grafo; sem folha própria ainda)
  'ia-substitui-entendimento': 1,

  // 3.12 Gestão de fluxo
  'espera-normalizada': 0,
  'sobrecarga-silenciosa': 0,
  'portfolio-paralelo-fragmenta-capacidade': 0,
  'bloqueio-depende-de-coordenador': 1,
  'coordenacao-centralizada': 1,
  'coordenacao-compensa-carga': 1,
  'causa-capacidade-tomada-pela-proxima-iniciativa': 1,
  'feedback-integrado': 3,
  'bloqueio-tratado-pelo-sistema': 4,
};

export function declaredSophistication(pattern: string): SophisticationPhase | undefined {
  return patternSophistication[pattern];
}

function sophisticationForPattern(pattern: string): SophisticationPhase | undefined {
  return declaredSophistication(pattern);
}
