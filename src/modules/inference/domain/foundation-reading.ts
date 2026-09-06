export type FoundationRef = { source: string; principle: string; why: string };

export type FoundationReading = {
  reading: string;
  sourceLabel: string;
};

const everyday: Record<string, FoundationReading> = {
  'SRE / blameless postmortem': {
    reading: 'Investigar o incidente sem procurar culpado. O aprendizado vale quando o próximo evento equivalente muda o sistema, não a pessoa.',
    sourceLabel: 'investigação de incidente sem culpa',
  },
  'Team Topologies': {
    reading: 'Deixar explícito quem decide, quem executa e como os times se pedem trabalho. Fronteira clara reduz espera e crise.',
    sourceLabel: 'desenho de fronteiras entre times',
  },
  'Arquitetura evolutiva / DDD': {
    reading: 'O desenho acompanha o domínio do trabalho. Uma mudança deve permanecer local quando o recorte está certo.',
    sourceLabel: 'desenho alinhado ao domínio',
  },
  'Well-Architected / platform engineering': {
    reading: 'O caminho compartilhado tem limite e tempo visível. Time, portal ou console não são maturidade por existirem.',
    sourceLabel: 'caminho compartilhado com limite',
  },
  'Well-Architected — Security': {
    reading: 'Identidade e permissão valem no recurso, neste momento, com trilha. Autenticar não é autorizar.',
    sourceLabel: 'autorização no recurso',
  },
  'Continuous Delivery / SLSA': {
    reading: 'A promoção usa uma origem e o mesmo artefato. Sem isso, a versão mora na memória de alguém.',
    sourceLabel: 'origem e promoção do mesmo artefato',
  },
  'Lean portfolio management': {
    reading: 'Não comprometer o ciclo seguinte sem gente para rever o resultado anterior.',
    sourceLabel: 'capacidade reservada para rever o resultado',
  },
};

export function plainFoundation(foundation: FoundationRef): FoundationReading {
  const known = everyday[foundation.source];
  if (known) return { reading: foundation.why ? `${known.reading} ${foundation.why}` : known.reading, sourceLabel: known.sourceLabel };
  return {
    reading: [foundation.why, foundation.principle].filter(Boolean).join(' '),
    sourceLabel: everydayLabel(foundation.source),
  };
}

function everydayLabel(source: string): string {
  return source.replace(/\s*\/\s*blameless[^\s,]*/i, '').replace(/\bblameless\b/i, '').replace(/\s{2,}/g, ' ').replace(/\s*\/\s*$/, '').trim() || 'referência do caminho';
}
