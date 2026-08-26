import type { Database } from '../../shared/database.js';
import { graph } from '../catalog/assessment-graph.js';

type AggregateResponse = { node_id: string; option_id: string; total: number };
export type Finding = { pattern: string; title: string; evidence: number; intervention: string };

const recommendations: Record<string, { title: string; intervention: string }> = {
  'sobrecarga-silenciosa': { title: 'Mudanças entram sem ajuste explícito de capacidade', intervention: 'Experimente tornar a troca de prioridade visível: para cada urgência, registre conjuntamente o que sai, o risco aceito e quando revisar o efeito.' },
  'coordenacao-centralizada': { title: 'O fluxo depende de coordenação central', intervention: 'Mapeie as decisões repetidamente escaladas e delegue uma delas com limites, informação e caminho de exceção claros.' },
  'decisao-opaca': { title: 'Decisões variam e o impacto aparece tarde', intervention: 'Reconstrua uma decisão recente com participantes e tempos de espera; defina um critério pequeno e observável para a próxima.' },
  'integracao-tardia': { title: 'Partes da entrega se encontram tarde', intervention: 'Reduza o intervalo até a primeira integração verificável e acompanhe retrabalho e tempo de diagnóstico antes de escolher uma ferramenta.' },
  'dependencia-coordenada': { title: 'Dependências exigem combinação manual', intervention: 'Identifique o contrato mais instável e teste uma fonte reproduzível com verificação antecipada entre os grupos.' },
  'feedback-em-producao': { title: 'Incompatibilidades são descobertas por usuários', intervention: 'Escolha uma interface crítica e crie uma verificação conjunta antes da liberação, com ownership e reação definidos.' },
  'empacotamento-manual': { title: 'Preparação e transporte de versões concentram espera', intervention: 'Registre cada passo manual de uma entrega e automatize primeiro o mais frequente e sujeito a variação, preservando uma origem única do artefato.' },
  'qualidade-como-fase': { title: 'Qualidade acumula fila ao final', intervention: 'Inclua qualidade na definição de risco de uma pequena entrega e prepare dados e verificações enquanto ela é construída.' },
  'controle-sem-feedback': { title: 'Controles adicionam espera sem mudar com evidências', intervention: 'Selecione uma aprovação recorrente, explicite o risco que controla e teste guardrails automáticos para casos de baixo risco.' },
  'limiar-sem-contexto': { title: 'Indicadores são interpretados por limites isolados', intervention: 'Conecte um sinal técnico a impacto, distribuição e mudança recente; revise falsos positivos e decisões tomadas.' },
  'dependencia-de-heroi': { title: 'Diagnóstico depende de conhecimento concentrado', intervention: 'Durante o próximo diagnóstico, capture hipóteses, consultas e decisões em um caminho reproduzível por outra pessoa.' },
  'deteccao-tardia': { title: 'O cliente é parte principal da detecção', intervention: 'Escolha uma jornada crítica e defina um sinal de impacto detectável antes do volume de reclamações.' },
  'acao-sem-fechamento': { title: 'Ações perdem prioridade sem validar efeito', intervention: 'Limite ações pós-incidente, defina dono, prazo e sinal de sucesso; encerre explicitamente o que não será feito.' },
  'mitigacao-sem-prevencao': { title: 'O time melhora reação, mas pouco reduz recorrência', intervention: 'Além do runbook, escolha uma condição do sistema que pode impedir ou detectar antes a mesma classe de falha.' },
  'solucao-local-nao-difundida': { title: 'Soluções locais não se transformam em capacidade compartilhada', intervention: 'Teste a automação local com um segundo time e meça esforço de adoção antes de institucionalizá-la.' },
};

export class InferenceService {
  constructor(private readonly db: Database) {}

  report(projectId: string, minimum: number) {
    const completed = Number((this.db.prepare("SELECT COUNT(*) total FROM participations WHERE project_id = ? AND status = 'completed'").get(projectId) as { total: number }).total);
    if (completed < minimum) return { completed, minimum, findings: [] as Finding[], units: [] };

    const rows = this.db.prepare(`
      SELECT r.node_id, r.option_id, COUNT(*) total
      FROM responses r JOIN participations p ON p.id = r.participation_id
      WHERE p.project_id = ? AND p.status = 'completed'
      GROUP BY r.node_id, r.option_id
    `).all(projectId) as unknown as AggregateResponse[];
    const patternCounts = new Map<string, number>();
    for (const row of rows) {
      const option = graph.find((node) => node.id === row.node_id)?.options.find((item) => item.id === row.option_id);
      for (const signal of option?.signals ?? []) {
        if (signal.weight < 0) patternCounts.set(signal.pattern, (patternCounts.get(signal.pattern) ?? 0) + Number(row.total));
      }
    }
    const findings = [...patternCounts.entries()]
      .filter(([pattern, evidence]) => recommendations[pattern] && evidence >= Math.max(2, Math.ceil(completed * 0.3)))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([pattern, evidence]) => ({ pattern, evidence, ...recommendations[pattern]! }));

    const units = this.db.prepare(`
      SELECT u.path, COUNT(p.id) completed
      FROM organization_units u LEFT JOIN participations p
        ON p.unit_id = u.id AND p.status = 'completed'
      WHERE u.project_id = ? GROUP BY u.id HAVING completed >= ? ORDER BY u.path
    `).all(projectId, minimum) as unknown as Array<{ path: string; completed: number }>;
    return { completed, minimum, findings, units };
  }
}

