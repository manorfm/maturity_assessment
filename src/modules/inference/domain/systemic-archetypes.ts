export const ARCHETYPE_CATALOG_VERSION = 'systemic-archetypes-v1';

export type SystemicArchetype = {
  id: string;
  label: string;
  structure: string;
  prognosisWithoutTreatment: string;
  leverage: string;
  /** Padrões do grafo que formam os elos; exige ≥ 2 observados (08 §3). */
  linkPatterns: string[];
};

export type ArchetypeMatch = SystemicArchetype & {
  observedLinks: string[];
  reading: string;
};

/** Biblioteca inicial 08 §3 — hipótese de estrutura, nunca certeza. */
export const systemicArchetypes: SystemicArchetype[] = [
  {
    id: 'fixes-that-fail',
    label: 'Consertos que falham',
    structure: 'A correção rápida gera efeito colateral que piora o problema.',
    prognosisWithoutTreatment: 'O controle cresce e o problema também.',
    leverage: 'Tratar a causa; medir a eficácia do controle.',
    linkPatterns: ['controle-sem-feedback', 'controle-indiferenciado', 'integracao-tardia', 'causa-processo-lote', 'incidente-apenas-adiciona-controle'],
  },
  {
    id: 'shifting-the-burden',
    label: 'Transferência do fardo',
    structure: 'Uma solução sintomática atrofia a capacidade fundamental.',
    prognosisWithoutTreatment: 'Dependência de heróis; perda de capacidade.',
    leverage: 'Reduzir o sintomático aos poucos e construir o fundamental.',
    linkPatterns: ['dependencia-de-heroi', 'caminho-depende-de-ajuda-recorrente', 'capacidade-nova-por-ticket-heroi', 'war-room-como-gestao'],
  },
  {
    id: 'eroding-goals',
    label: 'Metas que erodem',
    structure: 'A distância entre meta e realidade é fechada baixando a meta.',
    prognosisWithoutTreatment: 'Normalização do desempenho baixo.',
    leverage: 'Âncora externa para a meta; investigar a distância.',
    linkPatterns: ['prazo-sem-aprendizado', 'entrega-substitui-resultado', 'portfolio-sem-feedback', 'limiar-sem-contexto'],
  },
  {
    id: 'capability-trap',
    label: 'Armadilha da capacidade',
    structure: 'Sem tempo para melhorar, trabalha-se mais e sobra menos tempo para melhorar.',
    prognosisWithoutTreatment: 'Toil crescente e burnout.',
    leverage: 'Reservar capacidade protegida para melhoria.',
    linkPatterns: ['sobrecarga-silenciosa', 'dependencia-de-heroi', 'ocupacao-como-progresso', 'aprendizado-impedido-por-carga'],
  },
  {
    id: 'limits-to-growth',
    label: 'Limites ao crescimento',
    structure: 'Um processo cresce até bater num limite não tratado.',
    prognosisWithoutTreatment: 'Estagnação apesar de esforço.',
    leverage: 'Remover o limite (arquitetura, topologia), não empurrar mais.',
    linkPatterns: ['coordenacao-centralizada', 'acoplamento-coordenado', 'causa-fronteira-times', 'dependencia-coordenada'],
  },
  {
    id: 'escalation',
    label: 'Escalada',
    structure: 'Duas áreas reagem uma à outra com mais controle.',
    prognosisWithoutTreatment: 'Cada lado aumenta a restrição.',
    leverage: 'Objetivo compartilhado; direito de decisão explícito.',
    linkPatterns: ['controle-sem-feedback', 'seguranca-tardia', 'aprovacao-sem-evidencia-decisoria', 'governanca-compensa-feedback-tecnico'],
  },
  {
    id: 'success-to-the-successful',
    label: 'Sucesso para os bem-sucedidos',
    structure: 'Recursos vão para quem já vai bem.',
    prognosisWithoutTreatment: 'Concentração e fragilidade das demais áreas.',
    leverage: 'Alocar por necessidade e potencial.',
    linkPatterns: ['prioridade-sem-foco', 'causa-funding-temporario', 'portfolio-paralelo-fragmenta-capacidade', 'causa-prioridade-entre-times'],
  },
  {
    id: 'tragedy-of-the-commons',
    label: 'Tragédia dos comuns',
    structure: 'Recurso compartilhado sem dono é consumido.',
    prognosisWithoutTreatment: 'Custo e incidente crescem.',
    leverage: 'Dono e guardrail no recurso comum.',
    linkPatterns: ['ownership-fragmentado', 'servico-sem-responsavel', 'ambiente-inconsistente', 'correcao-direta-na-producao'],
  },
];

export function matchArchetypes(observedPatterns: readonly string[]): ArchetypeMatch[] {
  const observed = new Set(observedPatterns);
  return systemicArchetypes.flatMap((archetype) => {
    const observedLinks = archetype.linkPatterns.filter((pattern) => observed.has(pattern));
    if (observedLinks.length < 2) return [];
    return [{
      ...archetype,
      observedLinks,
      reading: `Padrão provável: ${archetype.label}. ${archetype.prognosisWithoutTreatment}`,
    }];
  });
}

export function primaryArchetypeFor(patterns: readonly string[]): ArchetypeMatch | undefined {
  return matchArchetypes(patterns)[0];
}
