export type InvestigationNarrative = {
  uncertainty: string;
  nextObservation: string;
};

const investigations: Record<string, InvestigationNarrative> = {
  'observability-practice': {
    uncertainty: 'As respostas mostram dificuldade para investigar impacto, mas ainda não distinguem se a restrição está na telemetria, no acesso às informações ou na distribuição do conhecimento.',
    nextObservation: 'Reconstrua um incidente recente: qual pergunta precisava ser respondida, quais dados estavam acessíveis, quem conseguiu interpretá-los e onde a investigação parou.',
  },
  'cloud-efficiency': {
    uncertainty: 'As respostas indicam decisões operacionais sem uma leitura comum de custo e efeito, mas ainda não distinguem falta de dados, autoridade ou rotina de revisão.',
    nextObservation: 'Reconstrua uma decisão recente de capacidade ou custo e registre qual informação existia, quem podia decidir e qual efeito foi revisto depois.',
  },
  'software-security': {
    uncertainty: 'As respostas mostram que o risco nem sempre altera o caminho da mudança, mas ainda não isolam se falta reconhecimento, autoridade ou um meio acessível de proteção.',
    nextObservation: 'Reconstrua uma mudança recente com risco relevante: quando ele apareceu, quem podia mudar o desenho e qual proteção foi aplicada ou dispensada.',
  },
  'release-feedback': {
    uncertainty: 'As respostas mostram retorno após a entrega, mas ainda não distinguem se ele chega tarde, não é confiável ou não consegue reabrir a decisão.',
    nextObservation: 'Reconstrua uma liberação recente: qual foi o primeiro sinal de efeito, quando ele chegou e qual decisão concreta mudou por causa dele.',
  },
};

export function investigationFor(capabilityId: string, label: string): InvestigationNarrative {
  return investigations[capabilityId] ?? {
    uncertainty: `As respostas indicam fragilidade em ${label}, mas ainda não permitem escolher entre capacidade, autonomia, processo ou estrutura como explicação principal.`,
    nextObservation: `Reconstrua um evento recente relacionado a ${label}: decisão tomada, espera encontrada, consequência observada e autoridade disponível para agir.`,
  };
}

export function preservationFor(label: string): { reading: string; nextStep: string } {
  return {
    reading: `As respostas mostram execução consistente em ${label}, inclusive com revisão de efeito e adaptação do modo de trabalhar.`,
    nextStep: `Preserve esse comportamento, não acrescente intervenção sem um problema observado e acompanhe o sinal de regressão: decisões voltarem a depender de exceção, coordenação manual ou uma única pessoa.`,
  };
}
