import type { SophisticationPhase } from './evidence-contract.js';

/** Padrões de evento que medem a fase técnica de uma prática avançada (22). */
export type AdvancedPracticeEventPhase = {
  practiceId: string;
  phase: SophisticationPhase;
};

/**
 * Trilha de chaos engineering (22 §2.3–§2.5).
 * A apropriação continua na folha tipada do sinal; a fase da prática
 * alimenta prontidão e adoção prematura via `practiceId`.
 */
export const advancedPracticeEventPhases: Record<string, AdvancedPracticeEventPhase> = {
  // Chaos engineering (22 §2.3–§2.5)
  'chaos-nenhum-exercicio': { practiceId: 'chaos-engineering', phase: 0 },
  'chaos-tabletop': { practiceId: 'chaos-engineering', phase: 1 },
  'chaos-gameday-teste': { practiceId: 'chaos-engineering', phase: 2 },
  'chaos-gameday-producao': { practiceId: 'chaos-engineering', phase: 3 },
  'chaos-automatizado': { practiceId: 'chaos-engineering', phase: 4 },
  'chaos-alimenta-design': { practiceId: 'chaos-engineering', phase: 5 },

  // Automação de qualidade (22 §3.4 / 12 §3.6)
  'qa-so-em-producao': { practiceId: 'quality-automation', phase: 0 },
  'qa-fase-dias-depois': { practiceId: 'quality-automation', phase: 1 },
  'qa-pipeline-horas': { practiceId: 'quality-automation', phase: 2 },
  'qa-minutos-antes-integrar': { practiceId: 'quality-automation', phase: 3 },
  'qa-feedback-por-risco': { practiceId: 'quality-automation', phase: 4 },
  'qa-guiado-por-producao': { practiceId: 'quality-automation', phase: 5 },
  // Pressão: gestão de flaky (22 §3.4)
  'qa-flaky-desativado': { practiceId: 'quality-automation', phase: 0 },
  'qa-flaky-rerun': { practiceId: 'quality-automation', phase: 1 },
  'qa-flaky-investigado': { practiceId: 'quality-automation', phase: 3 },
  'qa-flaky-processo': { practiceId: 'quality-automation', phase: 4 },

  // AI-DLC (22 §4.4–§4.6)
  'ai-dlc-sem-verificacao': { practiceId: 'ai-dlc', phase: 0 },
  'ai-dlc-leitura-humana': { practiceId: 'ai-dlc', phase: 1 },
  'ai-dlc-pessoa-integra': { practiceId: 'ai-dlc', phase: 2 },
  'ai-dlc-testes-existentes': { practiceId: 'ai-dlc', phase: 3 },
  'ai-dlc-criterios-antes': { practiceId: 'ai-dlc', phase: 4 },
  'ai-dlc-ciclos-autonomos': { practiceId: 'ai-dlc', phase: 5 },
  // Generalização: infra e dados (22 §4.6)
  'ai-dlc-so-codigo': { practiceId: 'ai-dlc', phase: 1 },
  'ai-dlc-parcial-superficie': { practiceId: 'ai-dlc', phase: 2 },
  'ai-dlc-generaliza-superficies': { practiceId: 'ai-dlc', phase: 4 },

  // Entrega contínua (22 §5 / 12 §3.4)
  'cd-manual-pessoa': { practiceId: 'continuous-delivery', phase: 0 },
  'cd-roteiro-janela': { practiceId: 'continuous-delivery', phase: 1 },
  'cd-script-aprovacao': { practiceId: 'continuous-delivery', phase: 2 },
  'cd-automatizado-reversivel': { practiceId: 'continuous-delivery', phase: 3 },
  'cd-canary-slo': { practiceId: 'continuous-delivery', phase: 4 },
  'cd-promocao-aprendizado': { practiceId: 'continuous-delivery', phase: 5 },

  // Desenvolvimento no tronco (22 §5 / 12 §3.3)
  'trunk-lote-final': { practiceId: 'trunk-based', phase: 0 },
  'trunk-merge-janela': { practiceId: 'trunk-based', phase: 1 },
  'trunk-branches-semana': { practiceId: 'trunk-based', phase: 2 },
  'trunk-diario': { practiceId: 'trunk-based', phase: 3 },
  'trunk-libera-desacoplada': { practiceId: 'trunk-based', phase: 4 },
  'trunk-risco-adaptativo': { practiceId: 'trunk-based', phase: 5 },

  // SLO com política de error budget (22 §5)
  'slo-sem-acordo': { practiceId: 'slo-error-budget', phase: 0 },
  'slo-meta-verbal': { practiceId: 'slo-error-budget', phase: 1 },
  'slo-numero-sem-decisao': { practiceId: 'slo-error-budget', phase: 2 },
  'slo-alerta-conversa': { practiceId: 'slo-error-budget', phase: 3 },
  'slo-pausa-entregas': { practiceId: 'slo-error-budget', phase: 4 },
  'slo-ritmo-continuo': { practiceId: 'slo-error-budget', phase: 5 },

  // Plataforma como produto (22 §5)
  'plat-sem-oferta': { practiceId: 'platform-as-product', phase: 0 },
  'plat-fila-central': { practiceId: 'platform-as-product', phase: 1 },
  'plat-docs-ajuda': { practiceId: 'platform-as-product', phase: 2 },
  'plat-autosservico': { practiceId: 'platform-as-product', phase: 3 },
  'plat-produto-consumidor': { practiceId: 'platform-as-product', phase: 4 },
  'plat-efeito-continuo': { practiceId: 'platform-as-product', phase: 5 },

  // Remediação automática / AIOps (22 §5 / 12 §3.2 F5)
  'aiops-manual-ad-hoc': { practiceId: 'aiops-remediation', phase: 0 },
  'aiops-instrucao-chat': { practiceId: 'aiops-remediation', phase: 1 },
  'aiops-roteiro-humano': { practiceId: 'aiops-remediation', phase: 2 },
  'aiops-humano-dispara': { practiceId: 'aiops-remediation', phase: 3 },
  'aiops-auto-conhecido': { practiceId: 'aiops-remediation', phase: 4 },
  'aiops-humano-melhora': { practiceId: 'aiops-remediation', phase: 5 },

  // Arquitetura em células ou microsserviços (22 §5)
  'cell-monolito-acoplado': { practiceId: 'cell-architecture', phase: 0 },
  'cell-nomes-sem-independencia': { practiceId: 'cell-architecture', phase: 1 },
  'cell-partes-dado-compartilhado': { practiceId: 'cell-architecture', phase: 2 },
  'cell-limite-dono-contrato': { practiceId: 'cell-architecture', phase: 3 },
  'cell-falha-contida': { practiceId: 'cell-architecture', phase: 4 },
  'cell-limites-evoluem': { practiceId: 'cell-architecture', phase: 5 },

  // Data mesh (22 §5)
  'mesh-central-fila': { practiceId: 'data-mesh', phase: 0 },
  'mesh-repositorio-sem-dono': { practiceId: 'data-mesh', phase: 1 },
  'mesh-copias-divergem': { practiceId: 'data-mesh', phase: 2 },
  'mesh-dominio-contrato': { practiceId: 'data-mesh', phase: 3 },
  'mesh-governanca-federada': { practiceId: 'data-mesh', phase: 4 },
  'mesh-efeito-plataforma': { practiceId: 'data-mesh', phase: 5 },

  // Zero Trust (22 §5 / 24 §6.3–§7.3)
  'zt-confianca-rede': { practiceId: 'zero-trust', phase: 0 },
  'zt-perimetro-excecoes': { practiceId: 'zero-trust', phase: 1 },
  'zt-identidade-pessoas': { practiceId: 'zero-trust', phase: 2 },
  'zt-identidade-servicos': { practiceId: 'zero-trust', phase: 3 },
  'zt-contexto-por-chamada': { practiceId: 'zero-trust', phase: 4 },
  'zt-risco-dinamico': { practiceId: 'zero-trust', phase: 5 },

  // Service mesh (22 §5 / 24 §7.2–§8)
  'mesh-chamada-sem-limite': { practiceId: 'service-mesh', phase: 0 },
  'mesh-tratamento-ad-hoc': { practiceId: 'service-mesh', phase: 1 },
  'mesh-biblioteca-padrao': { practiceId: 'service-mesh', phase: 2 },
  'mesh-plataforma-comum': { practiceId: 'service-mesh', phase: 3 },
  'mesh-exposicao-isolamento': { practiceId: 'service-mesh', phase: 4 },
  'mesh-politica-adaptativa': { practiceId: 'service-mesh', phase: 5 },

  // Otimização automática de custo / FinOps (22 §5 / 12 §3.9)
  'cost-fatura-opaca': { practiceId: 'cost-optimization', phase: 0 },
  'cost-analise-manual': { practiceId: 'cost-optimization', phase: 1 },
  'cost-marcacao-relatorio': { practiceId: 'cost-optimization', phase: 2 },
  'cost-visivel-alerta': { practiceId: 'cost-optimization', phase: 3 },
  'cost-por-resultado': { practiceId: 'cost-optimization', phase: 4 },
  'cost-otimizacao-auto': { practiceId: 'cost-optimization', phase: 5 },
};

export function advancedPracticePhaseForPattern(pattern: string): AdvancedPracticeEventPhase | undefined {
  return advancedPracticeEventPhases[pattern];
}
