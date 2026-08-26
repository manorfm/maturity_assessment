import type { Database } from '../../shared/database.js';
import { profiles, type Profile } from '../catalog/assessment-graph.js';
import { CapabilityAssessment } from './domain/capability-assessment.js';

type AggregateResponse = { capability: string; pattern: string; weight: number; total: number };
type Finding = { capability: string; pattern: string; title: string; evidence: number; intervention: string };
type CapabilityLevel = { id: string; label: string; level: number; confidence: number; evidence: number; hasContradiction: boolean };
type PerspectiveGap = {
  capability: string;
  title: string;
  strongerProfiles: string[];
  constrainedProfiles: string[];
};

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
  'cascata-fracionada': { title: 'O feedback multidisciplinar chega depois da definição', intervention: 'Escolha uma necessidade pequena e envolva produto, engenharia, qualidade e operação na primeira hipótese, antes de detalhar toda a solução.' },
  'feedback-tardio': { title: 'A solução acumula antes do primeiro feedback conjunto', intervention: 'Reduza o próximo lote até conseguir validar uma suposição relevante antes da demonstração formal.' },
  'prazo-sem-aprendizado': { title: 'O prazo substitui a validação de valor e impacto', intervention: 'Registre a hipótese e um sinal de efeito antes da próxima entrega urgente; reserve uma data curta para decidir com a evidência.' },
  'qualidade-como-handoff': { title: 'Qualidade recebe a mudança como uma etapa posterior', intervention: 'Antecipe a discussão de risco e transforme uma verificação recorrente em feedback compartilhado durante a construção.' },
  'verificacao-dependente-de-memoria': { title: 'A confiança depende dos casos lembrados por quem alterou', intervention: 'Use um escape recente para criar uma verificação pequena e repetível junto à mudança que o provocaria.' },
  'automacao-sem-feedback': { title: 'A automação é lenta ou instável demais para orientar decisões', intervention: 'Meça espera e instabilidade das verificações; isole primeiro a causa que mais incentiva ignorar o retorno.' },
  'provisionamento-em-fila': { title: 'Ambientes e capacidades chegam por fila externa', intervention: 'Mapeie o pedido mais repetido e teste um caminho self-service com limites explícitos e tempo de entrega observável.' },
  'acesso-artesanal': { title: 'Acesso e provisão dependem de coordenação pessoal', intervention: 'Padronize uma necessidade frequente com acesso mínimo, expiração e trilha automática antes de ampliar o escopo.' },
  'ambiente-inconsistente': { title: 'Ambientes compartilhados geram concorrência e diferenças', intervention: 'Torne reproduzível a menor dependência crítica e meça tempo de diagnóstico e conflitos evitados.' },
  'seguranca-tardia': { title: 'Segurança devolve mudanças perto da liberação', intervention: 'Escolha um risco recorrente e mova sua evidência para o início do trabalho, mantendo revisão humana nos casos de julgamento.' },
  'competencia-de-seguranca-inacessivel': { title: 'A competência de segurança chega apenas por exceção', intervention: 'Defina um canal e guardrail para a classe de risco mais comum, com critérios claros de quando envolver especialistas.' },
  'acoplamento-coordenado': { title: 'Mais coordenação compensa fronteiras custosas', intervention: 'Meça uma mudança transversal e teste um contrato ou limite menor capaz de reduzir uma interação recorrente.' },
  'evolucao-em-grande-lote': { title: 'A evolução arquitetural depende de uma iniciativa grande', intervention: 'Extraia um experimento reversível da iniciativa e valide redução de custo de mudança antes de ampliar.' },
  'ownership-fragmentado': { title: 'Prioridade e ownership se fragmentam nas fronteiras', intervention: 'Reconstrua uma mudança transversal, explicite decisão e impacto de ponta a ponta e teste um responsável pelo resultado, não por cada etapa.' },
  'culpa-e-controle': { title: 'Falhas reforçam culpa e controles locais', intervention: 'Reconstrua condições, incentivos e barreiras do próximo incidente sem atribuição individual; escolha uma mudança sistêmica verificável.' },
  'aprendizado-restrito': { title: 'O aprendizado fica restrito a lideranças e especialistas', intervention: 'Compartilhe uma síntese segura das condições e decisões, permitindo contestação e reaproveitamento por outros grupos.' },
  'incidente-sem-aprendizado': { title: 'A urgência encerra o incidente antes do aprendizado', intervention: 'Reserve uma análise curta após estabilizar e limite-a a uma mudança com responsável e sinal de recorrência.' },
  'mudanca-isolada': { title: 'Mudanças permanecem isoladas e encontram o sistema tarde', intervention: 'Reduza uma mudança até integrá-la no mesmo dia e meça conflito, regressão e tempo de correção antes de alterar toda a estratégia.' },
  'integracao-por-janela': { title: 'A integração depende de versões e janelas coordenadas', intervention: 'Escolha uma dependência recorrente e crie uma verificação compatível fora da janela para reduzir o primeiro lote de coordenação.' },
  'causa-ferramental-feedback': { title: 'O feedback automatizado não sustenta integração frequente', intervention: 'Meça duração, instabilidade e lacunas do retorno; corrija primeiro a verificação que mais leva pessoas a acumular mudanças.' },
  'causa-processo-lote': { title: 'Políticas e etapas exigem acumular mudanças', intervention: 'Explicite o risco protegido por uma etapa e teste um caminho proporcional para uma mudança pequena e reversível.' },
  'causa-fronteira-times': { title: 'Fronteiras de times impedem concluir sem coordenação', intervention: 'Mapeie uma entrega ponta a ponta e experimente um modo de colaboração ou ownership que reduza uma passagem recorrente.' },
  'causa-acoplamento-entrega': { title: 'Acoplamento transforma mudanças pequenas em lotes coordenados', intervention: 'Identifique a interface que mais amplia o lote e teste um contrato verificável ou limite mais autônomo.' },
  'controles-de-release-acumulados': { title: 'Controles de exposição acumulam dívida operacional', intervention: 'Defina responsável e validade para um controle existente e automatize sua remoção antes de ampliar o mecanismo.' },
  'deploy-igual-release': { title: 'Implantação e exposição compartilham a mesma decisão', intervention: 'Teste exposição gradual e reversível em uma jornada de baixo risco, com sinal de impacto e responsável claros.' },
  'release-em-lote': { title: 'Mudanças prontas aguardam uma liberação conjunta', intervention: 'Separe uma mudança pequena da próxima janela e registre quais dependências realmente impedem sua liberação independente.' },
  'maturidade-nao-resiste-urgencia': { title: 'O fluxo seguro é abandonado sob pressão', intervention: 'Transforme o atalho mais usado em um caminho rápido, automatizado e auditável; valide-o com uma correção pequena.' },
  'dependencia-operacional-sob-urgencia': { title: 'Urgências dependem de especialistas e acessos', intervention: 'Defina uma operação reversível com acesso mínimo e guardrails para reduzir a espera sem ampliar privilégio permanente.' },
  'incidente-por-handoff': { title: 'Incidentes perdem contexto entre sustentação e produto', intervention: 'Teste uma resposta conjunta para uma jornada crítica, com critérios explícitos de transferência de contexto e autoridade.' },
  'incidente-detectado-por-cliente': { title: 'Clientes participam da detecção operacional', intervention: 'Defina um sinal de impacto para uma jornada crítica que mobilize resposta antes do volume de contatos.' },
  'incidente-depende-do-autor': { title: 'A resposta depende de localizar quem construiu', intervention: 'Torne ownership, sinais e primeiro diagnóstico reproduzíveis por quem está de resposta, sem depender da memória do autor.' },
  'severidade-inconsistente': { title: 'A severidade varia conforme quem interpreta', intervention: 'Reconstrua três incidentes e calibre critérios de impacto, abrangência e urgência com as decisões que realmente mudaram.' },
  'incidente-por-escalada-relacional': { title: 'A prioridade depende de influência pessoal', intervention: 'Crie um caminho de escalada baseado em impacto observável, com responsável e tempo esperado por classe de risco.' },
  'incidente-na-fila-de-trabalho': { title: 'Incidentes competem com a fila comum', intervention: 'Defina critérios mínimos para interromper o fluxo e quem pode mobilizar resposta sem aguardar a próxima priorização.' },
  'causa-ownership-operacional': { title: 'Ownership operacional não acompanha o produto', intervention: 'Mapeie uma jornada crítica até seus responsáveis e valide o roteamento com uma simulação curta.' },
  'causa-impacto-invisivel': { title: 'Sintomas técnicos não mostram impacto e criticidade', intervention: 'Conecte um sinal operacional a jornada, abrangência e mudança recente antes de ampliar dashboards.' },
  'causa-fronteira-sustentacao': { title: 'A fronteira de sustentação transfere contexto e autoridade', intervention: 'Teste um modo de colaboração com desenvolvimento durante um evento e meça tempo até a primeira ação segura.' },
  'causa-politica-incidente': { title: 'A política de incidentes não reflete o risco real', intervention: 'Compare categorias com impacto e decisões recentes; ajuste uma classe e observe roteamento, comunicação e tempo de resposta.' },
  'telemetria-fragmentada': { title: 'O diagnóstico depende de combinar buscas separadas', intervention: 'Escolha uma jornada e propague um identificador técnico entre seus limites, preservando acesso mínimo e retenção adequada.' },
  'diagnostico-por-acesso-direto': { title: 'O diagnóstico depende de acesso ao runtime', intervention: 'Capture a consulta mais recorrente em telemetria central, pesquisável e controlada antes de retirar acessos de emergência.' },
  'diagnostico-por-dado-pessoal': { title: 'Dados pessoais viraram chave operacional de diagnóstico', intervention: 'Introduza um identificador técnico correlacionável e restrinja busca por dado pessoal com propósito, auditoria e minimização.' },
  'causa-lacuna-telemetria': { title: 'Sinais necessários não percorrem a jornada', intervention: 'Instrumente uma hipótese de falha de ponta a ponta e valide se outra pessoa consegue diagnosticá-la sem acesso direto.' },
  'causa-ferramenta-observabilidade': { title: 'A telemetria existe, mas não está acessível no incidente', intervention: 'Remova uma barreira de acesso, licença, usabilidade ou capacitação e simule o diagnóstico no tempo esperado.' },
  'causa-correlacao-arquitetural': { title: 'Limites técnicos quebram a correlação', intervention: 'Defina um contrato mínimo de contexto entre dois componentes e verifique propagação, amostragem e busca.' },
  'causa-privacidade-operacional': { title: 'O desenho operacional empurra buscas para dados pessoais', intervention: 'Modele investigação com identificadores técnicos, controle de acesso e retenção mínima para a jornada mais sensível.' },
  'correcao-direta-na-producao': { title: 'Configuração e infraestrutura divergem da fonte reproduzível', intervention: 'Reconcilie uma alteração emergencial na fonte declarativa e adicione detecção de divergência antes de restringir o console.' },
  'correcao-manual-de-dados': { title: 'Correções de dados dependem de execução contextual', intervention: 'Crie uma operação idempotente, revisável e auditável para a correção mais recorrente, com validação e rollback definidos.' },
  'iteracao-orientada-a-escopo': { title: 'A iteração protege escopo mais do que resultado', intervention: 'Defina um objetivo observável para o próximo período e permita trocar itens mantendo o resultado e o limite de trabalho.' },
  'ocupacao-como-progresso': { title: 'O sistema otimiza ocupação individual', intervention: 'Limite trabalho em andamento e acompanhe uma entrega ponta a ponta, incluindo espera e colaboração, não utilização pessoal.' },
  'prioridade-sem-foco': { title: 'Urgências substituem um objetivo estável', intervention: 'Explicite um resultado corrente e faça cada urgência registrar o que deixa de ser feito e quando o efeito será revisto.' },
  'bloqueio-depende-de-coordenador': { title: 'Bloqueios dependem de uma pessoa coordenadora', intervention: 'Torne caminhos e tempos de dependência visíveis ao grupo e delegue a resolução de uma classe recorrente com limites claros.' },
  'espera-normalizada': { title: 'O time compensa espera iniciando mais trabalho', intervention: 'Pare de iniciar um item ao primeiro bloqueio relevante, meça o tempo e remova a causa antes de aumentar capacidade.' },
  'contorno-acumula-divida': { title: 'Contornos mantêm fluxo local e acumulam divergência', intervention: 'Dê validade, responsável e condição de remoção ao próximo contorno; reserve reconciliação no mesmo fluxo de entrega.' },
  'causa-permissao-sem-autonomia': { title: 'Permissões adicionam espera sem um caminho seguro', intervention: 'Modele uma operação comum com menor privilégio, expiração, guardrails e trilha para testar autosserviço proporcional.' },
  'causa-prioridade-entre-times': { title: 'Dependências não compartilham prioridade pelo resultado', intervention: 'Teste um objetivo e modo de interação comum para uma entrega, com tempo de resposta e decisão de escalada explícitos.' },
  'causa-competencia-inacessivel': { title: 'A competência necessária não entra no fluxo', intervention: 'Disponibilize a competência por colaboração temporária, capacitação ou caminho pavimentado e meça redução de espera e retrabalho.' },
  'causa-dependencia-arquitetural': { title: 'Mudanças comuns atravessam muitos responsáveis', intervention: 'Meça uma mudança e reduza uma passagem por contrato, modularização ou ownership mais alinhado à jornada.' },
  'solucao-entregue-pronta': { title: 'A solução chega pronta para implementação', intervention: 'Inclua negócio, produto e competências técnicas na comparação de opções antes de fechar o próximo desenho relevante.' },
  'decisao-concentrada': { title: 'Decisões dependem de uma referência técnica', intervention: 'Registre contexto e trade-offs de uma decisão e faça outra pessoa conduzir sua revisão usando os mesmos critérios.' },
  'decisao-por-inercia': { title: 'Padrões só são revistos depois que falham', intervention: 'Defina um sinal de custo ou risco que dispara revisão do padrão antes da próxima mudança difícil.' },
};

const capabilityLabels: Record<string, string> = {
  fluxo: 'Fluxo e entrega', entrega: 'Fluxo e entrega',
  engenharia: 'Engenharia e SDLC', qualidade: 'Engenharia e SDLC',
  arquitetura: 'Arquitetura e evolução',
  confiabilidade: 'Confiabilidade e observabilidade', observabilidade: 'Confiabilidade e observabilidade',
  plataforma: 'Plataforma, cloud e segurança',
  organizacao: 'Organização e interação', governanca: 'Governança e estratégia',
  aprendizado: 'Aprendizado e adaptação',
};

export class InferenceService {
  constructor(private readonly db: Database) {}

  report(projectId: string, minimum: number) {
    const completed = Number((this.db.prepare("SELECT COUNT(*) total FROM participations WHERE project_id = ? AND status = 'completed'").get(projectId) as { total: number }).total);
    if (completed < minimum) return { completed, minimum, findings: [] as Finding[], capabilities: [] as CapabilityLevel[], perspectiveGaps: [] as PerspectiveGap[], scopes: [] as ScopeReport[] };
    const findings = this.findings(projectId, completed);
    const capabilities = this.capabilities(projectId);
    const perspectiveGaps = this.perspectiveGaps(projectId, minimum);
    const scopes = this.eligibleScopes(projectId, minimum).map((scope) => ({
      ...scope,
      findings: this.findings(projectId, scope.completed, scope.id),
      capabilities: this.capabilities(projectId, scope.id),
      perspectiveGaps: this.perspectiveGaps(projectId, minimum, scope.id),
    }));
    return { completed, minimum, findings, capabilities, perspectiveGaps, scopes };
  }

  private capabilities(projectId: string, unitId?: string): CapabilityLevel[] {
    const scope = this.scope(projectId, unitId);
    const rows = this.db.prepare(`
      SELECT s.capability, s.weight
      FROM responses r JOIN participations p ON p.id = r.participation_id
      JOIN assessment_signals s ON s.graph_version = p.graph_version
        AND s.node_key = r.node_id AND s.option_key = r.option_id
      WHERE p.project_id = ? AND p.status = 'completed' ${scope.sql}
    `).all(...scope.parameters) as unknown as Array<{ capability: string; weight: number }>;
    const grouped = new Map<string, number[]>();
    for (const row of rows) {
      const label = capabilityLabels[row.capability] ?? row.capability;
      grouped.set(label, [...(grouped.get(label) ?? []), Number(row.weight)]);
    }
    return [...grouped.entries()].map(([label, weights]) => {
      const assessment = CapabilityAssessment.from(weights);
      return { id: Object.entries(capabilityLabels).find(([, candidate]) => candidate === label)?.[0] ?? label, label, ...assessment };
    }).sort((left, right) => left.label.localeCompare(right.label));
  }

  private perspectiveGaps(projectId: string, minimum: number, unitId?: string): PerspectiveGap[] {
    const scope = this.scope(projectId, unitId);
    const eligible = this.db.prepare(`
      SELECT p.profile, COUNT(*) total FROM participations p
      WHERE p.project_id = ? AND p.status = 'completed' ${scope.sql}
      GROUP BY p.profile HAVING total >= ?
    `).all(...[...scope.parameters, minimum]) as unknown as Array<{ profile: Profile; total: number }>;
    if (eligible.length < 2) return [];
    const profileValues = eligible.map((item) => item.profile);
    const placeholders = profileValues.map(() => '?').join(',');
    const scores = this.db.prepare(`
      SELECT p.profile, s.capability, AVG(s.weight) score
      FROM responses r JOIN participations p ON p.id = r.participation_id
      JOIN assessment_signals s ON s.graph_version = p.graph_version
        AND s.node_key = r.node_id AND s.option_key = r.option_id
      WHERE p.project_id = ? AND p.status = 'completed' ${scope.sql}
        AND p.profile IN (${placeholders})
      GROUP BY p.profile, s.capability
    `).all(...[...scope.parameters, ...profileValues]) as unknown as Array<{ profile: Profile; capability: string; score: number }>;
    const capabilities = [...new Set(scores.map((score) => score.capability))];
    return capabilities.flatMap((capability) => {
      const comparable = scores.filter((score) => score.capability === capability);
      const stronger = comparable.filter((score) => Number(score.score) >= 1).map((score) => profiles[score.profile]);
      const constrained = comparable.filter((score) => Number(score.score) <= -1).map((score) => profiles[score.profile]);
      if (!stronger.length || !constrained.length) return [];
      return [{
        capability,
        title: `Perspectivas divergem sobre ${capability}`,
        strongerProfiles: stronger,
        constrainedProfiles: constrained,
      }];
    });
  }

  private findings(projectId: string, population: number, unitId?: string): Finding[] {
    const scope = this.scope(projectId, unitId);
    const rows = this.db.prepare(`
      SELECT s.capability, s.pattern, s.weight, COUNT(*) total
      FROM responses r JOIN participations p ON p.id = r.participation_id
      JOIN assessment_signals s ON s.graph_version = p.graph_version
        AND s.node_key = r.node_id AND s.option_key = r.option_id
      WHERE p.project_id = ? AND p.status = 'completed' ${scope.sql}
      GROUP BY s.capability, s.pattern, s.weight
    `).all(...scope.parameters) as unknown as AggregateResponse[];
    const patternCounts = new Map<string, { capability: string; evidence: number }>();
    for (const row of rows) {
      if (Number(row.weight) < 0) patternCounts.set(row.pattern, { capability: row.capability, evidence: (patternCounts.get(row.pattern)?.evidence ?? 0) + Number(row.total) });
    }
    return [...patternCounts.entries()]
      .filter(([pattern, item]) => recommendations[pattern] && item.evidence >= Math.max(2, Math.ceil(population * 0.3)))
      .sort((a, b) => b[1].evidence - a[1].evidence)
      .slice(0, 8)
      .map(([pattern, item]) => ({ pattern, ...item, ...recommendations[pattern]! }));
  }

  private scope(projectId: string, unitId?: string): QueryScope {
    if (!unitId) return { sql: '', parameters: [projectId] };
    return {
      sql: `AND p.unit_id IN (
        WITH RECURSIVE subtree(id) AS (
          SELECT id FROM organization_units WHERE id = ?
          UNION ALL SELECT u.id FROM organization_units u JOIN subtree s ON u.parent_id = s.id
        ) SELECT id FROM subtree
      )`,
      parameters: [projectId, unitId],
    };
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

type ScopeReport = { id: string; path: string; completed: number; findings: Finding[]; capabilities: CapabilityLevel[]; perspectiveGaps: PerspectiveGap[] };
type QueryScope = { sql: string; parameters: string[] };
