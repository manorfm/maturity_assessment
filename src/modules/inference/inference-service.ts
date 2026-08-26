import type { Database } from '../../shared/database.js';

type AggregateResponse = { pattern: string; weight: number; total: number };
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
  'operacao-manual-fragil': { title: 'A entrega depende de execução manual sensível a contexto', intervention: 'Transforme um passo frequente em operação repetível e verificável, mantendo instruções como apoio e não como controle principal.' },
  'dados-de-teste-fragil': { title: 'Dados e ambientes tornam a validação lenta', intervention: 'Escolha um cenário crítico e crie dados mínimos reproduzíveis, com origem e descarte claros, medindo o tempo poupado na próxima mudança.' },
  'regressao-crescente': { title: 'A regressão cresce mais rápido que a capacidade de verificar', intervention: 'Classifique riscos e escapes recentes; automatize primeiro a verificação repetida que mais bloqueia o fluxo, não a maior suíte possível.' },
  'qualidade-tardia': { title: 'Contexto e risco chegam depois da implementação', intervention: 'Inclua produto, qualidade e engenharia na definição de um pequeno item antes de começar e compare retrabalho e espera.' },
  'controle-indiferenciado': { title: 'Mudanças de riscos diferentes percorrem o mesmo controle', intervention: 'Defina duas classes simples de risco e teste um caminho com guardrails para a classe de baixo impacto.' },
  'governanca-relacional': { title: 'A velocidade da governança depende de relações e escalada', intervention: 'Explicite critérios, tempos e caminho de exceção para que urgência não dependa de acesso pessoal aos aprovadores.' },
  'controle-sem-proposito': { title: 'Não está claro qual risco o controle reduz', intervention: 'Para uma aprovação, documente ameaça, evidência esperada e decisão possível; retire ou redesenhe o passo se nenhuma evidência puder mudar o resultado.' },
};

export class InferenceService {
  constructor(private readonly db: Database) {}

  report(projectId: string, minimum: number) {
    const completed = Number((this.db.prepare("SELECT COUNT(*) total FROM participations WHERE project_id = ? AND status = 'completed'").get(projectId) as { total: number }).total);
    if (completed < minimum) return { completed, minimum, findings: [] as Finding[], scopes: [] as ScopeReport[] };
    const findings = this.findings(projectId, completed);
    const scopes = this.eligibleScopes(projectId, minimum).map((scope) => ({
      ...scope,
      findings: this.findings(projectId, scope.completed, scope.id),
    }));
    return { completed, minimum, findings, scopes };
  }

  private findings(projectId: string, population: number, unitId?: string): Finding[] {
    const unitFilter = unitId ? `AND p.unit_id IN (
      WITH RECURSIVE subtree(id) AS (
        SELECT id FROM organization_units WHERE id = ?
        UNION ALL SELECT u.id FROM organization_units u JOIN subtree s ON u.parent_id = s.id
      ) SELECT id FROM subtree
    )` : '';
    const rows = this.db.prepare(`
      SELECT s.pattern, s.weight, COUNT(*) total
      FROM responses r JOIN participations p ON p.id = r.participation_id
      JOIN assessment_signals s ON s.graph_version = p.graph_version
        AND s.node_key = r.node_id AND s.option_key = r.option_id
      WHERE p.project_id = ? AND p.status = 'completed' ${unitFilter}
      GROUP BY s.pattern, s.weight
    `).all(...(unitId ? [projectId, unitId] : [projectId])) as unknown as AggregateResponse[];
    const patternCounts = new Map<string, number>();
    for (const row of rows) {
      if (Number(row.weight) < 0) patternCounts.set(row.pattern, (patternCounts.get(row.pattern) ?? 0) + Number(row.total));
    }
    return [...patternCounts.entries()]
      .filter(([pattern, evidence]) => recommendations[pattern] && evidence >= Math.max(2, Math.ceil(population * 0.3)))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([pattern, evidence]) => ({ pattern, evidence, ...recommendations[pattern]! }));
  }

  private eligibleScopes(projectId: string, minimum: number): Array<{ id: string; path: string; completed: number }> {
    type UnitCount = { id: string; parent_id: string | null; path: string; direct_count: number; subtree_count: number };
    const rows = this.db.prepare(`
      WITH RECURSIVE descendants(root_id, id) AS (
        SELECT id, id FROM organization_units WHERE project_id = ?
        UNION ALL
        SELECT d.root_id, u.id FROM descendants d JOIN organization_units u ON u.parent_id = d.id
      )
      SELECT root.id, root.parent_id, root.path,
        (SELECT COUNT(*) FROM participations p WHERE p.unit_id = root.id AND p.status = 'completed') direct_count,
        COUNT(p.id) subtree_count
      FROM organization_units root
      JOIN descendants d ON d.root_id = root.id
      LEFT JOIN participations p ON p.unit_id = d.id AND p.status = 'completed'
      WHERE root.project_id = ? GROUP BY root.id ORDER BY root.path
    `).all(projectId, projectId) as unknown as UnitCount[];
    const byParent = new Map<string | null, UnitCount[]>();
    for (const row of rows) byParent.set(row.parent_id, [...(byParent.get(row.parent_id) ?? []), row]);
    const partitionIsSafe = (unit: UnitCount): boolean => {
      const childCounts = (byParent.get(unit.id) ?? []).map((child) => Number(child.subtree_count)).filter((count) => count > 0);
      const direct = Number(unit.direct_count);
      return childCounts.every((count) => count >= minimum) && (direct === 0 || direct >= minimum);
    };
    const chainIsSafe = (unit: UnitCount): boolean => {
      let current: UnitCount | undefined = unit;
      while (current) {
        if (!partitionIsSafe(current)) return false;
        current = current.parent_id ? rows.find((row) => row.id === current!.parent_id) : undefined;
      }
      return true;
    };
    return rows.filter((unit) => Number(unit.subtree_count) >= minimum && chainIsSafe(unit))
      .map((unit) => ({ id: unit.id, path: unit.path, completed: Number(unit.subtree_count) }));
  }
}

export type ScopeReport = { id: string; path: string; completed: number; findings: Finding[] };
