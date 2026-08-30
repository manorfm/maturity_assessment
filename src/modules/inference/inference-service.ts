import type { Database } from '../../shared/database.js';
import { id } from '../../shared/ids.js';
import { profiles, type Profile } from '../catalog/assessment-graph.js';
import { CapabilityAssessment } from './domain/capability-assessment.js';
import { CausalKnowledgeGraph } from './domain/causal-knowledge-graph.js';
import { TeamClassification } from './domain/team-classification.js';
import { CapabilityTaxonomy } from './domain/capability-taxonomy.js';
import { decideReportOutcome, uniqueFindingsByPattern } from './domain/report-outcome.js';
import { defineInterventionCatalog, GroupRecommendationEngine, type ConstraintKind, type EvidenceLayer, type GroupSignal, type InterventionSeed, type RecommendationEvidence } from './domain/group-recommendation-engine.js';
import type { SolutionReadiness } from './domain/solution-readiness.js';
import { BayesianInferenceEngine, type DiagnosticPosterior } from './domain/bayesian-inference-engine.js';
import { DiagnosticModel } from './domain/diagnostic-model.js';
import { PilotEvaluation, type PilotReport } from './domain/pilot-evaluation.js';
import { PilotService } from './pilot-service.js';
import { buildDiagnosticContext, type DiagnosticContext } from './domain/diagnostic-contract.js';

export type Finding = {
  kind: 'correction' | 'evolution'; capability: string; detailCapability: string; pattern: string;
  title: string; cause: string; evidence: number; intervention: string; confidence: number; priority: number;
  priorityFactors: { intensity: number; reach: number };
  constraint: ConstraintKind; reasons: string[];
  recommendationEvidence: RecommendationEvidence;
  experiment: { action: string; owner: string; metric: string; reviewHorizon: string; successCriterion: string };
  foundation: { source: string; principle: string; why: string };
  solutionCapability: string;
  solutionReadiness: SolutionReadiness;
  affectedCapabilities?: string[];
} & DiagnosticContext;
type DiagnosticProblem = {
  kind: 'correction' | 'evolution';
  pattern: string;
  diagnosis: string;
  correction: string;
  evidence: number;
  nature: 'behavior' | 'constraint';
  affectedCapabilities: string[];
  solutionCapability: string;
  solutionReadiness: SolutionReadiness;
};
type DiagnosticArea = { id: string; label: string; problems: DiagnosticProblem[] };
type CapabilityLevel = { id: string; label: string; level: number; confidence: number; evidence: number; hasContradiction: boolean; coverage?: number };
type PerspectiveGap = {
  capability: string;
  title: string;
  strongerProfiles: string[];
  constrainedProfiles: string[];
};
type VisibilityGap = { title: string; profiles: string[]; count: number };
type MeasurementDelta = { previousCompleted: number; capturedAt: string; patternDeltas: Array<{ pattern: string; previous: number; current: number }> };
type QueryScope = { sql: string; parameters: string[] };

const interventionSeeds: Record<string, InterventionSeed> = {
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
  'retrospectiva-sem-fechamento': { title: 'Ações de melhoria perdem dono e continuidade', intervention: 'Limite a próxima reflexão a uma mudança, com responsável, capacidade reservada, sinal de sucesso e revisão marcada.' },
  'melhoria-sem-prioridade': { title: 'Melhoria não compete explicitamente por capacidade', intervention: 'Reserve um limite pequeno de capacidade e compare recorrência, espera ou retrabalho antes e depois da ação.' },
  'cerimonia-sem-adaptacao': { title: 'A reflexão virou cerimônia sem efeito', intervention: 'Suspenda a coleta ampla de opiniões e use um evento recente para escolher uma decisão concreta que o grupo pode revisar.' },
  'processo-sem-autonomia': { title: 'O grupo executa o processo sem poder adaptá-lo', intervention: 'Explicite quais partes são obrigatórias, quais riscos protegem e qual experimento o grupo pode conduzir com segurança.' },
  'melhoria-reativa': { title: 'O sistema só muda depois de crise ou cobrança', intervention: 'Defina um gatilho antecipado de espera, recorrência ou desgaste e revise-o antes do próximo incidente grave.' },
  'mudanca-centralizada': { title: 'Mudanças no modo de trabalhar dependem da liderança', intervention: 'Delegue ao grupo um experimento reversível com limite, prazo e resultado observável.' },
  'causa-melhoria-sem-capacidade': { title: 'Entregas consomem toda capacidade de melhoria', intervention: 'Pare uma iniciativa pequena e use essa capacidade para remover o gargalo recorrente de maior espera.' },
  'causa-melhoria-sem-autonomia': { title: 'Causas reconhecidas estão fora da autonomia do grupo', intervention: 'Crie um caminho de escalada com impacto, responsável sistêmico e prazo de decisão, não apenas status.' },
  'causa-acoes-sem-foco': { title: 'Ações de melhoria excedem a capacidade de concluir', intervention: 'Limite trabalho de melhoria em andamento e encerre explicitamente ações sem dono ou sinal de efeito.' },
  'causa-baixa-seguranca-psicologica': { title: 'Riscos pessoais reduzem a qualidade da reflexão', intervention: 'Use facilitação segura, fatos do sistema e acompanhamento não punitivo; verifique se temas difíceis passam a aparecer.' },
  'mudanca-sobrescrita': { title: 'Mudanças concorrentes podem substituir entregas', intervention: 'Defina uma única origem reproduzível e bloqueie promoção de versões que não incorporam a linha compartilhada verificada.' },
  'fonte-nao-confiavel': { title: 'A versão válida não possui origem inequívoca', intervention: 'Escolha um artefato crítico, torne sua proveniência verificável e remova um caminho alternativo de produção.' },
  'comunicacao-de-mudanca-fragil': { title: 'Segurança da mudança depende de aviso manual', intervention: 'Torne ownership e alterações incompatíveis detectáveis no fluxo, preservando comunicação para decisões e não sincronização básica.' },
  'conflito-de-integracao-tardio': { title: 'Times encontram incompatibilidades perto da liberação', intervention: 'Integre duas mudanças concorrentes enquanto ainda pequenas e adicione a verificação que teria antecipado o último conflito.' },
  'fronteira-compartilhada-acoplada': { title: 'A superfície compartilhada não acompanha ownership', intervention: 'Mapeie frequência de mudança e responsáveis e teste um limite ou contrato que reduza alterações cruzadas.' },
  'concorrencia-coordenada-manualmente': { title: 'Colisões são evitadas por coordenação constante', intervention: 'Automatize uma verificação de concorrência ou contrato e meça a redução de alinhamentos necessários.' },
  'planejamento-compensa-acoplamento': { title: 'Mais planejamento compensa feedback técnico tardio', intervention: 'Reduza o intervalo até a primeira composição verificável antes de adicionar outra cerimônia de alinhamento.' },
  'causa-multiplas-fontes': { title: 'Mais de um caminho produz a versão válida', intervention: 'Eleja uma fonte verificável, registre proveniência e desative gradualmente caminhos paralelos.' },
  'causa-limites-sem-ownership': { title: 'Limites técnicos e de responsabilidade divergem', intervention: 'Teste um ownership alinhado à jornada ou um contrato explícito na área de maior mudança cruzada.' },
  'causa-prioridades-na-superficie': { title: 'Times compartilham código sem compartilhar resultado', intervention: 'Defina objetivo, regra de decisão e responsabilidade comuns para uma mudança concorrente.' },
  'causa-verificacao-concorrente': { title: 'Falta feedback antecipado entre mudanças concorrentes', intervention: 'Adicione uma verificação reproduzível para contrato, configuração ou composição antes da liberação conjunta.' },
  'estrutura-definida-centralmente': { title: 'A estrutura muda sem experimento conduzido pelo grupo', intervention: 'Inclua as pessoas afetadas, explicite hipótese de desenho e revise carga, fluxo e conflitos após a mudança.' },
  'coordenacao-compensa-carga': { title: 'Coordenação cresce no lugar de reduzir carga cognitiva', intervention: 'Identifique uma responsabilidade que pode sair, ser automatizada ou receber fronteira mais clara antes de adicionar papéis.' },
  'estrutura-implicita': { title: 'Responsabilidades mudam informalmente sob pressão', intervention: 'Torne explícito ownership, limites e modo de interação de uma jornada e revise-o após uma entrega real.' },
  'resultado-sem-repriorizacao': { title: 'Resultados são observados sem alterar prioridades', intervention: 'Escolha uma entrega recente, explicite a decisão que cada resultado pode mudar e revise o portfólio em uma data definida.' },
  'entrega-substitui-resultado': { title: 'Aceite de escopo substitui evidência de valor', intervention: 'Defina antes da próxima construção um efeito observável e uma decisão que será tomada depois da entrega.' },
  'portfolio-sem-feedback': { title: 'O portfólio avança sem fechar ciclos de resultado', intervention: 'Limite novas iniciativas até revisar evidência e continuidade de uma entrega anterior relevante.' },
  'causa-funding-temporario': { title: 'O financiamento termina com a entrega, não com o resultado', intervention: 'Escolha um produto relevante e condicione uma parcela pequena de capacidade à revisão de resultado, com opção explícita de continuar, mudar ou encerrar.' },
  'causa-responsabilidade-encerra-no-aceite': { title: 'A responsabilidade termina quando o escopo é aceito', intervention: 'Mantenha um responsável conjunto por negócio e tecnologia até a revisão do resultado e teste essa responsabilidade em uma entrega relevante.' },
  'causa-capacidade-tomada-pela-proxima-iniciativa': { title: 'A próxima iniciativa consome a capacidade de aprender', intervention: 'Antes de iniciar todo o próximo trabalho, reserve capacidade para revisar um resultado anterior e agir sobre a evidência encontrada.' },
  'causa-resultado-sem-autoridade': { title: 'O resultado não tem autoridade sobre o investimento', intervention: 'Dê à próxima revisão uma decisão real — continuar, mudar ou parar — e registre como a evidência alterou capacidade e prioridade.' },
  'divida-sem-capacidade-continua': { title: 'Dívida técnica depende de uma iniciativa futura', intervention: 'Reserve uma melhoria proporcional na próxima mudança da área e acompanhe redução de defeitos, espera ou dependência.' },
  'codigo-depende-de-especialista': { title: 'Código crítico depende de conhecimento concentrado', intervention: 'Faça a próxima mudança com colaboração e verificações reproduzíveis, medindo se outra pessoa consegue evoluir a área com segurança.' },
  'sustentabilidade-em-grande-lote': { title: 'Sustentabilidade foi adiada para uma transformação ampla', intervention: 'Extraia uma melhoria reversível que reduza o custo da próxima mudança sem aguardar reescrita ou migração completa.' },
  'migracao-coordenada-em-lote': { title: 'Evolução de dados exige janela coordenada', intervention: 'Teste uma alteração compatível em duas etapas e verifique consumidores antes de remover a estrutura anterior.' },
  'contrato-implicito-fragil': { title: 'Consumidores compensam contratos implícitos', intervention: 'Formalize um contrato crítico, ownership e compatibilidade e execute a verificação durante a mudança do produtor.' },
  'migracao-de-dados-contextual': { title: 'Migrações dependem do estado encontrado em execução', intervention: 'Transforme a correção recorrente em operação idempotente, verificável e reversível, com casos representativos antes da implantação.' },
  'limites-escondem-distribuicao': { title: 'Limites agregados escondem parte da experiência', intervention: 'Analise distribuição e segmentos de uma jornada e conecte um percentil à decisão e ao impacto que pretende proteger.' },
  'confiabilidade-reativa-a-incidente': { title: 'Confiabilidade recebe prioridade somente após incidentes', intervention: 'Defina um objetivo de serviço e um gatilho anterior ao incidente para negociar capacidade com produto.' },
  'decisao-de-confiabilidade-concentrada': { title: 'Risco operacional depende do julgamento de especialistas', intervention: 'Torne objetivo, distribuição e trade-off visíveis e calibre uma decisão com produto, engenharia e operação.' },
  'lideranca-coordena-handoffs': { title: 'Liderança compensa o sistema coordenando passagens', intervention: 'Escolha o handoff de maior espera e dê ownership ao resultado, com autonomia e condição de sucesso para removê-lo.' },
  'otimizacao-local-pela-gestao': { title: 'Gestão otimiza áreas isoladas diante de um gargalo sistêmico', intervention: 'Meça o fluxo ponta a ponta e atribua ownership ao gargalo compartilhado, evitando metas locais conflitantes.' },
  'mudanca-sistemica-em-grande-lote': { title: 'Mudança sistêmica depende de um projeto amplo', intervention: 'Proteja capacidade para um experimento pequeno no gargalo e revise seu efeito antes de ampliar governança e escopo.' },
  'portfolio-por-prioridade-executiva': { title: 'O portfólio muda sem reconciliar capacidade', intervention: 'Torne explícitos objetivo, capacidade consumida, trabalho interrompido e data de revisão antes de incorporar a próxima prioridade.' },
  'portfolio-paralelo-fragmenta-capacidade': { title: 'Demandas paralelas fragmentam capacidade e direção', intervention: 'Limite iniciativas simultâneas por resultado e reveja o portfólio com dados de fluxo, impacto esperado e custo de atraso.' },
  'risco-visivel-sem-poder-de-decisao': { title: 'Riscos conhecidos não alteram decisões', intervention: 'Defina quem pode parar, reduzir ou reordenar uma iniciativa quando um limiar de risco observável for atingido.' },
  'alerta-de-risco-depende-de-seguranca-pessoal': { title: 'Expor risco depende de segurança pessoal', intervention: 'Crie um mecanismo regular e não punitivo para registrar riscos, resposta esperada e retorno sobre a decisão tomada.' },
  'discovery-refina-solucao-dada': { title: 'Discovery apenas detalha uma solução escolhida', intervention: 'Antes do próximo compromisso, compare hipóteses de problema e alternativas com pessoas afetadas e uma evidência de valor.' },
  'discovery-substituida-por-patrocinio': { title: 'Patrocínio substitui validação', intervention: 'Separe urgência política de evidência e execute o menor teste reversível capaz de invalidar a hipótese principal.' },
  'resultado-gera-ajuste-sem-revisar-direcao': { title: 'Resultados ajustam execução, mas não a direção', intervention: 'Estabeleça um ritual curto para manter, alterar ou encerrar a iniciativa a partir do efeito observado, não apenas do progresso.' },
  'resultado-sem-efeito-no-portfolio': { title: 'Resultados não mudam investimento ou portfólio', intervention: 'Associe cada iniciativa a um resultado e a uma decisão possível de continuar, redirecionar ou encerrar em data definida.' },
  'qualidade-por-suite-padrao': { title: 'A estratégia de qualidade não varia com o risco', intervention: 'Modele os riscos da próxima mudança e escolha verificações, ambientes e observações proporcionais às consequências.' },
  'estrategia-de-qualidade-concentrada-no-qa': { title: 'A estratégia de qualidade está concentrada em uma função', intervention: 'Compartilhe risco e testabilidade desde o refinamento; mantenha QA como especialidade habilitadora, não como fila final.' },
  'nao-funcionais-por-campanha': { title: 'Riscos não funcionais são avaliados em campanhas', intervention: 'Traga um risco relevante de desempenho, segurança ou resiliência para feedback contínuo na esteira e na operação.' },
  'nao-funcionais-descobertos-em-producao': { title: 'Produção revela os limites não funcionais', intervention: 'Escolha uma jornada crítica, defina seu limite e valide carga ou falha representativa antes da próxima exposição relevante.' },
  'seguranca-depende-de-reconhecimento-e-especialista': { title: 'Segurança depende de reconhecimento e especialista', intervention: 'Codifique o risco recorrente em orientação, verificação e caminho de consulta acessíveis no fluxo normal.' },
  'mudanca-aguarda-especialista': { title: 'Mudanças aguardam competência concentrada', intervention: 'Combine colaboração temporária, documentação executável e capacitação até que outra pessoa conclua a mudança com segurança.' },
  'aprendizado-tecnico-sem-caminho-repetivel': { title: 'Aprendizado técnico não vira capacidade repetível', intervention: 'Aplique o aprendizado a uma mudança real e registre exemplos, guardrails e feedback que outra pessoa consiga reutilizar.' },
  'recuperacao-cloud-depende-de-runbook': { title: 'Recuperação cloud depende de execução contextual', intervention: 'Automatize e exercite o passo mais sensível da recuperação, verificando objetivo, dependências e retorno seguro.' },
  'recuperacao-cloud-por-console': { title: 'Recuperação cloud depende de alteração manual', intervention: 'Modele uma recuperação declarativa, auditável e reversível; mantenha acesso emergencial com reconciliação obrigatória.' },
  'resiliencia-cloud-validada-periodicamente': { title: 'A resiliência é validada apenas em ciclos espaçados', intervention: 'Escolha o modo de falha de maior impacto e execute um ensaio menor no fluxo regular; registre responsável, tempo de recuperação, lacunas e a data da próxima validação.' },
  'incidente-e-unica-evidencia-de-resiliencia': { title: 'Incidentes são a única validação de resiliência', intervention: 'Execute um experimento controlado sobre a falha mais relevante e transforme o resultado em melhoria verificável.' },
  'eficiencia-cloud-por-meta-de-custo': { title: 'Eficiência cloud é uma meta isolada de custo', intervention: 'Conecte custo e capacidade a jornada, resultado e risco para evitar otimização local que transfira impacto.' },
  'eficiencia-cloud-reativa-a-fatura': { title: 'Eficiência cloud reage à fatura', intervention: 'Dê visibilidade contínua a ownership, unidade econômica e tendência antes de o desvio virar uma campanha urgente.' },
  'eficiencia-cloud-por-campanha': { title: 'Eficiência cloud ocorre em campanhas', intervention: 'Inclua orçamento, capacidade e descarte no ciclo normal de mudança, com guardrails e revisão do efeito.' },
  'eficiencia-cloud-sem-decisao-compartilhada': { title: 'Trade-offs de eficiência permanecem locais', intervention: 'Crie critérios compartilhados entre produto, engenharia e plataforma para decidir custo, desempenho, risco e sustentabilidade.' },
  'credencial-por-handoff': { title: 'Credencial depende de quem está disponível', intervention: 'Modele o acesso recorrente com identidade de carga ou de pessoa, escopo, expiração e trilha; não comece pelo produto de cofre.' },
  'credencial-em-configuracao': { title: 'Segredo viaja em configuração para destravar a mudança', intervention: 'Tire o valor do artefato de configuração, registre o caminho seguro e meça se outra pessoa consegue autenticar sem herdar acesso permanente.' },
  'identidade-compartilhada': { title: 'Conta ou chave compartilhada desbloqueia o fluxo', intervention: 'Substitua a identidade compartilhada por uma com dono, escopo e revogação; verifique que o trabalho continua sem a conta antiga.' },
  'retry-amplia-falha': { title: 'A insistência automática amplia a falha da dependência', intervention: 'Torne explícitos espera, tentativas e isolamento da dependência mais lenta e valide o efeito com um ensaio pequeno.' },
  'espera-sem-limite': { title: 'Requisições esperam até intervenção humana', intervention: 'Defina um limite de espera revisável e um comportamento de degradação para a dependência mais crítica.' },
  'limite-cosmetico': { title: 'O limite existe no papel e não muda o comportamento', intervention: 'Revise o valor e o motivo do limite com o impacto real; remova ou ajuste o que não altera a falha.' },
  'incentivo-segue-entrega': { title: 'Reconhecimento pesa entrega de itens, não efeito', intervention: 'Inclua um resultado observável no próximo ciclo de reconhecimento e compare com o que o grupo de fato priorizou.' },
  'incentivo-opaco': { title: 'O critério de reconhecimento não é explicável', intervention: 'Torne público um critério pequeno, revisável e ligado a resultado; verifique se a próxima decisão muda com ele.' },
  'ia-sombra-sem-politica': { title: 'Assistência de modelo entra sem política de dado ou risco', intervention: 'Defina o menor caminho suportado (dado permitido, revisão, modelo autorizado) e meça o uso fora dele.' },
  'ia-substitui-entendimento': { title: 'A assistência acelera entrega e enfraquece entendimento', intervention: 'Exija que a próxima mudança assistida seja explicada e alterada por outra pessoa; acompanhe retrabalho e revisão.' },
  'ia-diagnostico-como-fato': { title: 'Texto gerado é tratado como fato operacional', intervention: 'Trate a saída do modelo como hipótese: peça evidência independente antes de agir em incidente ou atendimento.' },
  'camada-sem-revisao': { title: 'Complexidade extra permanece sem motivo revisado', intervention: 'Meça o custo da próxima mudança na camada e teste reduzir ou justificar o limite com um critério explícito.' },
  'prestigio-tecnico': { title: 'A escolha de desenho se sustenta por prestígio', intervention: 'Reconstrua o problema original e compare uma alternativa mais simples com o mesmo resultado de negócio.' },
  'celebra-media': { title: 'A média esconde a experiência da cauda', intervention: 'Antes de comunicar sucesso, revise distribuição, recorte e volume; só então decida se a mudança funcionou.' },
  'ignora-base-pequena': { title: 'O gráfico é tratado como prova com base insuficiente', intervention: 'Exija denominador e tamanho da amostra na próxima decisão de “melhorou”; adie a conclusão se a mistura mudou.' },
  'termo-diverge-entre-times': { title: 'O mesmo conceito significa coisas diferentes entre grupos', intervention: 'Reconstrua o significado com um exemplo da jornada compartilhada e ajuste o limite antes da próxima mudança que atravesse os dois lados.' },
  'glossario-adia-o-limite': { title: 'O alinhamento de linguagem fica para depois da entrega', intervention: 'Trate o termo divergente como parte da mudança atual: um exemplo acordado e um limite revisado valem mais do que um glossário futuro.' },
  'espera-por-modo-implicito': { title: 'A mudança espera um modo de colaboração que ninguém nomeou', intervention: 'Torne explícito se o outro grupo atende por pedido, parceria ou caminho que o próprio time segue, e meça a espera até a próxima mudança comum.' },
  'contorno-para-nao-esperar': { title: 'O time contorna o limite para não esperar o outro grupo', intervention: 'Registre o contorno como custo de espera; teste um modo de colaboração explícito na próxima mudança que dependeria do mesmo grupo.' },
  'ameaca-so-em-checklist': { title: 'O risco de dado ou confiança entra só como lista', intervention: 'Para a próxima mudança que toque dado identificável ou novo caminho, descreva o que pode dar errado e deixe isso alterar teste e evidência antes da lista.' },
  'ameaca-depois-do-incidente': { title: 'Ameaça só é discutida depois de um incidente parecido', intervention: 'Escolha uma mudança comum com dado ou confiança nova e pratique descrever o risco antes de liberar; compare com o último incidente da mesma classe.' },
  'achado-na-fila-de-excecao': { title: 'O achado de segurança entra em fila e a mudança segue', intervention: 'O próximo achado em mudança comum deve poder atrasar, reduzir escopo ou mudar o caminho, com dono e data de revisão — não só um aceite temporário.' },
  'achado-corrigido-no-caso': { title: 'Corrige-se o caso visível sem verificar o padrão', intervention: 'Depois de corrigir o caso, verifique se o mesmo acesso, dependência ou dado exposto existe em um segundo fluxo e registre o resultado.' },
  'numero-diverge-sem-dono': { title: 'Dois números competem sem dono do significado', intervention: 'Nomeie quem reconcilia definição, recorte e tempo do indicador compartilhado; a próxima decisão de negócio espera esse acordo.' },
  'reconciliacao-artesanal-de-dado': { title: 'A reconciliação do indicador é artesanal e pontual', intervention: 'Substitua a planilha da reunião por uma definição reutilizável, com recorte e dono, e verifique se o conflito reaparece na semana seguinte.' },
  'redefinicao-silenciosa-de-dado': { title: 'A definição muda na fonte e o consumidor descobre pelo efeito', intervention: 'Avise consumidores com evidência de compatibilidade e data de fim da definição antiga antes de alterar o significado na fonte.' },
  'dado-espera-iniciativa': { title: 'Corrigir o significado espera uma iniciativa maior', intervention: 'Faça o menor ajuste de definição ou recorte que desbloqueie os dois produtos; não espere o programa de dados para o conflito atual.' },
  'design-chega-como-handoff': { title: 'A experiência entra só para apresentar o que já foi construído', intervention: 'Antes de ampliar a próxima solução, decida junto o critério de uso e a restrição técnica; meça se isso reduziu retrabalho de interface.' },
  'design-como-opiniao': { title: 'Quem desenha opina quando chamado; o critério permanece a entrega técnica', intervention: 'Inclua um critério observável de jornada na definição de pronto da próxima mudança de fluxo, não apenas a opinião quando houver tempo.' },
  'interface-sem-retorno-de-uso': { title: 'O gráfico principal substitui evidência de quem não concluiu a jornada', intervention: 'Antes de encerrar a mudança, revise quem não concluiu o fluxo e deixe isso poder simplificar ou reabrir a interface.' },
  'aprovacao-visual-encerra': { title: 'A aprovação visual encerra o assunto sem comportamento real', intervention: 'Troque o encerramento por evidência de uso em um recorte pequeno; a aprovação visual não substitui quem não conseguiu concluir.' },
  'acumulo-silencioso-de-tipos': { title: 'O mesmo grupo absorve todos os tipos de problema', intervention: 'Torne visíveis os tipos de trabalho da semana e decida explicitamente o que o grupo deixa de absorver; acompanhe espera e erro depois da recusa.' },
  'heroi-troca-contexto': { title: 'A carga depende de quem troca de contexto mais rápido', intervention: 'Separe um tipo de trabalho recorrente para um modo de colaboração explícito e meça se a semana deixa de depender da pessoa que mais troca de contexto.' },
  'capacidade-nova-por-ticket-heroi': { title: 'Usar a capacidade depende de ticket ou de um herói da plataforma', intervention: 'Transforme o pedido recorrente em um caminho que outra pessoa do time consiga seguir, com limite, exemplo e tempo previsível.' },
  'documentacao-substitui-caminho': { title: 'Documentação substitui um caminho que outra pessoa consegue seguir', intervention: 'Peça a uma pessoa que não escreveu o texto para usar a capacidade sem herói; o que travar vira o próximo passo do caminho suportado.' },
  'caminho-desconhecido': { title: 'O caminho existe, mas os times não conseguem encontrá-lo', intervention: 'Observe uma necessidade comum desde a busca inicial e teste um ponto de descoberta ligado ao contexto real do time.' },
  'caminho-conhecido-inacessivel': { title: 'O time conhece o caminho, mas não consegue começar', intervention: 'Reconstrua a última tentativa bloqueada e teste acesso proporcional ao risco para o caso comum, preservando trilha e exceção.' },
  'caminho-inadequado-ao-caso': { title: 'O caminho oferecido não atende uma restrição recorrente', intervention: 'Teste com um time consumidor a menor ampliação que elimina um contorno recorrente sem transformar toda exceção em padrão.' },
  'caminho-depende-de-ajuda-recorrente': { title: 'O caminho só termina com ajuda recorrente da plataforma', intervention: 'Acompanhe uma pessoa nova usando o caminho e transforme o ponto de ajuda mais frequente em feedback executável no próprio fluxo.' },
  'caminhos-equivalentes-fragmentados': { title: 'Alternativas equivalentes fragmentam a experiência de engenharia', intervention: 'Compare dois caminhos equivalentes por demanda atendida, custo de manutenção e adoção; consolide primeiro a sobreposição sem necessidade distinta.' },
  'adocao-do-caminho-nao-observada': { title: 'A plataforma publica capacidades sem observar adoção real', intervention: 'Meça uma jornada desde descoberta até conclusão, incluindo abandono, ajuda e contorno, antes de ampliar o catálogo.' },
  'suporte-substitui-feedback-de-produto-interno': { title: 'Chamados substituem feedback sobre a experiência do caminho', intervention: 'Converse com quem concluiu, abandonou e contornou o mesmo caminho; teste uma mudança e compare necessidade de ajuda.' },
  'excecoes-nao-retornam-ao-caminho': { title: 'Exceções locais não melhoram o caminho compartilhado', intervention: 'Dê validade e canal de retorno a uma exceção recorrente; decida com consumidores se ela deve entrar no padrão ou ser retirada.' },
  'governanca-compensa-feedback-tecnico': { title: 'Aprovação compensa evidência técnica pouco confiável', intervention: 'Nomeie a evidência que o aprovador reconstrói e teste produzi-la de forma repetível no fluxo para uma classe de baixo risco.' },
  'governanca-compensa-ownership': { title: 'Aprovação compensa responsabilidade pouco clara', intervention: 'Reconstrua uma decisão recente e atribua autoridade e responsabilidade ao dono do resultado antes de remover uma passagem de aprovação.' },
  'segregacao-por-fila-manual': { title: 'Separação de responsabilidade virou fila operacional', intervention: 'Preserve quem solicita e quem autoriza, mas teste execução automatizada, limitada e auditável para a operação recorrente.' },
  'aprovacao-sem-evidencia-decisoria': { title: 'A aprovação registra aceite sem alterar a proteção', intervention: 'Para a próxima etapa, explicite qual evidência poderia mudar a decisão e retire ou redesenhe o controle se nenhuma puder.' },
  'compliance-substitui-eficacia': { title: 'Passar na auditoria substitui verificar o efeito do controle', intervention: 'Escolha um controle relevante e compare obrigação atendida, risco residual, falhas e espera antes da próxima revisão.' },
  'excecao-de-risco-renovada-sem-evidencia': { title: 'Aceites temporários são renovados sem reduzir a incerteza', intervention: 'Condicione a próxima renovação a uma evidência nova, responsável e decisão explícita de corrigir, proteger ou encerrar.' },
  'incidente-apenas-adiciona-controle': { title: 'Cada falha adiciona controle sem revisar os anteriores', intervention: 'Ao adicionar a próxima proteção, identifique qual controle existente perdeu propósito e teste a retirada com sinal de risco e fluxo.' },
};

export const interventionCatalog = defineInterventionCatalog(interventionSeeds, {
  'causa-ferramental-feedback': { evidencePatterns: ['causa-ferramental-feedback', 'automacao-sem-feedback'], contradictionPatterns: ['integracao-continua-validada', 'fluxo-seguro-sob-pressao'] },
  'causa-processo-lote': { evidencePatterns: ['causa-processo-lote', 'controle-indiferenciado'], contradictionPatterns: ['governanca-proporcional'] },
  'causa-fronteira-times': { evidencePatterns: ['causa-fronteira-times', 'coordenacao-centralizada'], contradictionPatterns: ['ownership-compartilhado-explicito'] },
  'causa-acoplamento-entrega': { evidencePatterns: ['causa-acoplamento-entrega', 'acoplamento-coordenado'], contradictionPatterns: ['contrato-e-dados-evoluem-compativeis'] },
  'causa-lacuna-telemetria': { evidencePatterns: ['causa-lacuna-telemetria', 'telemetria-fragmentada'], contradictionPatterns: ['diagnostico-correlacionado'] },
  'causa-ferramenta-observabilidade': { evidencePatterns: ['causa-ferramenta-observabilidade', 'diagnostico-por-acesso-direto'], contradictionPatterns: ['diagnostico-correlacionado'] },
  'causa-correlacao-arquitetural': { evidencePatterns: ['causa-correlacao-arquitetural', 'telemetria-fragmentada'], contradictionPatterns: ['diagnostico-correlacionado'] },
  'causa-privacidade-operacional': { evidencePatterns: ['causa-privacidade-operacional', 'diagnostico-por-dado-pessoal'], contradictionPatterns: ['diagnostico-correlacionado'] },
  'causa-permissao-sem-autonomia': { evidencePatterns: ['causa-permissao-sem-autonomia', 'acesso-artesanal'], contradictionPatterns: ['governanca-proporcional'] },
  'causa-prioridade-entre-times': { evidencePatterns: ['causa-prioridade-entre-times', 'espera-normalizada'], contradictionPatterns: ['bloqueio-tratado-pelo-sistema'] },
  'causa-dependencia-arquitetural': { evidencePatterns: ['causa-dependencia-arquitetural', 'dependencia-coordenada'], contradictionPatterns: ['ownership-compartilhado-explicito'] },
});

const evolutionSeeds: Record<string, InterventionSeed> = {
  'excecao-controlada-com-retorno': { title: 'Exceções já possuem dono e retorno planejado', intervention: 'Observe validade e reconciliação das próximas exceções e incorpore ao caminho comum apenas as necessidades que se repetirem.' },
  'automacao-local-consistente': { title: 'Automação ainda é uma capacidade local', intervention: 'Transforme a automação validada em caminho suportado, observável e adotável por outros times, medindo tempo e falhas antes e depois.' },
  'integracao-frequente-fragil': { title: 'Integração frequente ainda depende de condições favoráveis', intervention: 'Remova a principal causa que interrompe a integração sob pressão e valide o fluxo com uma mudança urgente e reversível.' },
  'controles-de-release-acumulados': { title: 'Controles de exposição ainda acumulam estado operacional', intervention: 'Defina validade, responsável, telemetria e remoção automática para cada controle antes de ampliar o uso.' },
  'excecao-controlada': { title: 'O caminho emergencial ainda é uma exceção manual', intervention: 'Transforme a exceção recorrente em fluxo rápido, seguro e auditável, com reconciliação automática e limites proporcionais ao risco.' },
  'mudanca-emergencial-reconciliada': { title: 'A emergência é reconciliada, mas ainda exige trabalho posterior', intervention: 'Automatize a reconciliação e exercite o caminho emergencial para que fonte declarativa, validações e auditoria permaneçam íntegras sob pressão.' },
  'ownership-compartilhado-explicito': { title: 'Ownership compartilhado ainda exige coordenação', intervention: 'Reduza uma passagem recorrente com contrato, limite ou modo de colaboração explícito e valide autonomia ponta a ponta.' },
  'divida-revista-por-efeito': { title: 'Dívida é gerida, mas a prevenção ainda não é sistêmica', intervention: 'Converta a causa mais recorrente em guardrail, teste arquitetural ou padrão de design e acompanhe redução de reincidência.' },
  'seguranca-concentrada-em-scanners': { title: 'Segurança ainda está concentrada na detecção automatizada', intervention: 'Acrescente modelagem proporcional de ameaça, ownership e validação de desenho para riscos que scanners não conseguem interpretar.' },
};

export const evolutionCatalog = defineInterventionCatalog(evolutionSeeds);
export const causalKnowledgeGraph = CausalKnowledgeGraph.from({ ...interventionCatalog, ...evolutionCatalog });

export class InferenceService {
  constructor(private readonly db: Database) {}

  report(projectId: string, minimum: number) {
    const completed = Number((this.db.prepare("SELECT COUNT(*) total FROM participations WHERE project_id = ? AND status = 'completed'").get(projectId) as { total: number }).total);
    const modelVersion = this.modelVersion();
    if (completed < minimum) return { completed, minimum, modelVersion, hypotheses: [] as DiagnosticPosterior[], classification: null, findings: [] as Finding[], areas: [] as DiagnosticArea[], capabilities: [] as CapabilityLevel[], capabilityGroups: [], perspectiveGaps: [] as PerspectiveGap[], visibilityGaps: [] as VisibilityGap[], previousMeasurement: null as MeasurementDelta | null, calibration: this.calibration(modelVersion), scopes: [] as ScopeReport[], outcome: decideReportOutcome({ classification: null, branches: [], findings: [] }) };
    const findings = uniqueFindingsByPattern(this.findings(projectId, completed));
    this.persistTransformation(projectId, completed, findings);
    const areas = this.diagnosticAreas(findings);
    const capabilities = this.capabilityDetails(projectId);
    const organizationalPrior = new Map(capabilities.map((capability) => [capability.id, capability.level]));
    const capabilityGroups = CapabilityTaxonomy.organize(capabilities);
    const perspectiveGaps = this.perspectiveGaps(projectId, minimum);
    const visibilityGaps = this.visibilityGaps(projectId, minimum);
    const previousMeasurement = this.previousMeasurement(projectId);
    const hypotheses = this.diagnosticPosteriors(projectId);
    const rawScopes = this.eligibleScopes(projectId, minimum).map((scope) => ({
      ...scope,
      findings: uniqueFindingsByPattern(this.findings(projectId, scope.completed, scope.id)),
      capabilities: this.capabilityDetails(projectId, scope.id, organizationalPrior),
      perspectiveGaps: this.perspectiveGaps(projectId, minimum, scope.id),
      hypotheses: this.diagnosticPosteriors(projectId, scope.id),
    }));
    const scopes: ScopeReport[] = rawScopes.map((scope) => {
      const local = TeamClassification.from(scope.capabilities);
      const descendants = rawScopes
        .filter((candidate) => candidate.path.startsWith(`${scope.path}/`))
        .map((candidate) => TeamClassification.at(TeamClassification.from(candidate.capabilities).level, [candidate.path]));
      return { ...scope, areas: this.diagnosticAreas(scope.findings), capabilityGroups: CapabilityTaxonomy.organize(scope.capabilities), classification: local.constrainedBy(descendants) };
    });
    const classification = TeamClassification.from(capabilities).constrainedBy(
      rawScopes.map((scope) => TeamClassification.at(TeamClassification.from(scope.capabilities).level, [scope.path])),
    );
    const outcome = decideReportOutcome({ classification, branches: capabilityGroups, findings, perspectiveGaps });
    return { completed, minimum, modelVersion, hypotheses, classification, findings, areas, capabilities, capabilityGroups, perspectiveGaps, visibilityGaps, previousMeasurement, calibration: this.calibration(modelVersion), scopes, outcome };
  }

  private calibration(modelVersion: string | null): PilotReport {
    return modelVersion ? new PilotService(this.db).summarize(modelVersion) : PilotEvaluation.from([]);
  }

  private modelVersion(): string | null {
    return (this.db.prepare("SELECT version FROM inference_model_versions WHERE status = 'published' ORDER BY published_at DESC LIMIT 1").get() as { version: string } | undefined)?.version ?? null;
  }

  private diagnosticPosteriors(projectId: string, unitId?: string): DiagnosticPosterior[] {
    const version = this.modelVersion();
    if (!version) return [];
    const hypotheses = this.db.prepare('SELECT family_key, capability, hypothesis_key, label, prior FROM diagnostic_hypotheses WHERE model_version = ? ORDER BY family_key, hypothesis_key')
      .all(version) as unknown as Array<{ family_key: string; capability: string; hypothesis_key: string; label: string; prior: number }>;
    const likelihoods = this.db.prepare('SELECT family_key, pattern, evidence_group, hypothesis_key, likelihood FROM evidence_likelihoods WHERE model_version = ? ORDER BY family_key, pattern')
      .all(version) as unknown as Array<{ family_key: string; pattern: string; evidence_group: string; hypothesis_key: string; likelihood: number }>;
    const families = [...new Set(hypotheses.map((item) => item.family_key))].map((familyId) => {
      const familyHypotheses = hypotheses.filter((item) => item.family_key === familyId);
      const familyLikelihoods = likelihoods.filter((item) => item.family_key === familyId);
      const patterns = [...new Set(familyLikelihoods.map((item) => item.pattern))];
      return {
        id: familyId, capability: familyHypotheses[0]!.capability,
        hypotheses: familyHypotheses.map((item) => ({ id: item.hypothesis_key, label: item.label, prior: Number(item.prior) })),
        evidence: patterns.map((pattern) => ({
          pattern, group: familyLikelihoods.find((item) => item.pattern === pattern)!.evidence_group,
          likelihoods: Object.fromEntries(familyLikelihoods.filter((item) => item.pattern === pattern).map((item) => [item.hypothesis_key, Number(item.likelihood)])),
        })),
      };
    });
    const scope = this.scope(projectId, unitId);
    const applicability = this.db.prepare(`
      SELECT possible.pattern, COUNT(DISTINCT p.id) applicable
      FROM responses r JOIN participations p ON p.id = r.participation_id
      JOIN assessment_signals possible ON possible.graph_version = p.graph_version AND possible.node_key = r.node_id
      WHERE p.project_id = ? AND p.status = 'completed' ${scope.sql}
      GROUP BY possible.pattern
    `).all(...scope.parameters) as unknown as Array<{ pattern: string; applicable: number }>;
    const applicableByPattern = new Map(applicability.map((item) => [item.pattern, Number(item.applicable)]));
    const observed = this.db.prepare(`
      SELECT s.pattern, COUNT(DISTINCT p.id) support,
        GROUP_CONCAT(DISTINCT p.profile) profiles, GROUP_CONCAT(DISTINCT s.evidence_layer) layers
      FROM responses r JOIN participations p ON p.id = r.participation_id
      JOIN assessment_signals s ON s.graph_version = p.graph_version AND s.node_key = r.node_id AND s.option_key = r.option_id
      WHERE p.project_id = ? AND p.status = 'completed' ${scope.sql}
      GROUP BY s.pattern
    `).all(...scope.parameters) as unknown as Array<{ pattern: string; support: number; profiles: string; layers: string }>;
    const posteriors = new BayesianInferenceEngine().infer(DiagnosticModel.create({ version, families }), observed.map((item) => ({
      pattern: item.pattern, support: Number(item.support), applicablePopulation: applicableByPattern.get(item.pattern) ?? Number(item.support),
      profiles: item.profiles.split(','), layers: item.layers.split(','),
    })));
    const discriminators = this.eligibleDiscriminators(version, projectId, unitId);
    return posteriors.map((posterior) => ({
      ...posterior,
      hypotheses: posterior.hypotheses.map((hypothesis) => ({ ...hypothesis, label: hypothesis.id === 'unknown' ? hypothesis.label : interventionCatalog[hypothesis.id]?.title ?? evolutionCatalog[hypothesis.id]?.title ?? hypothesis.label })),
      ...this.nextDiscriminator(posterior, discriminators),
    }));
  }

  private nextDiscriminator(posterior: DiagnosticPosterior, discriminators: Array<{ key: string; label: string; patterns: string[] }>): Pick<DiagnosticPosterior, 'nextQuestionKey' | 'nextQuestionLabel'> {
    const observedPattern = posterior.evidenceUsed[0];
    if (!observedPattern || posterior.hypotheses[0]?.id !== 'unknown') return {};
    const row = discriminators.find((candidate) => candidate.patterns.includes(observedPattern));
    return row ? { nextQuestionKey: row.key, nextQuestionLabel: row.label } : {};
  }

  private eligibleDiscriminators(modelVersion: string, projectId: string, unitId?: string): Array<{ key: string; label: string; patterns: string[] }> {
    const scope = this.scope(projectId, unitId);
    const rows = this.db.prepare(`
      SELECT q.node_key, n.title, q.applicability_patterns_json
      FROM question_observations q JOIN inference_model_versions m ON m.version = q.model_version
      JOIN assessment_nodes n ON n.graph_version = m.graph_version AND n.node_key = q.node_key
      JOIN participations p ON p.project_id = ? AND p.status = 'completed'
      LEFT JOIN responses r ON r.participation_id = p.id AND r.node_id = q.node_key
      WHERE q.model_version = ? ${scope.sql}
      GROUP BY q.node_key, n.title, q.applicability_patterns_json
      HAVING COUNT(DISTINCT r.participation_id) < COUNT(DISTINCT p.id)
      ORDER BY q.cost, q.node_key
    `).all(projectId, modelVersion, ...scope.parameters.slice(1)) as unknown as Array<{ node_key: string; title: string; applicability_patterns_json: string }>;
    return rows.map((row) => ({ key: row.node_key, label: row.title, patterns: JSON.parse(row.applicability_patterns_json) as string[] }));
  }

  private diagnosticAreas(findings: Finding[]): DiagnosticArea[] {
    const grouped = new Map<string, DiagnosticArea>();
    for (const finding of findings) {
      const details = [...new Set([finding.detailCapability, ...(finding.affectedCapabilities ?? [])])];
      for (const detail of details) {
        const id = rootCapabilityByDetail[detail] ?? 'organizational-system';
        const area = grouped.get(id) ?? { id, label: rootCapabilityLabels[id]!, problems: [] };
        if (area.problems.some((problem) => problem.pattern === finding.pattern)) continue;
        area.problems.push({
          kind: finding.kind,
          pattern: finding.pattern,
          diagnosis: finding.title,
          correction: finding.intervention,
          evidence: finding.evidence,
          nature: finding.pattern.startsWith('causa-') ? 'constraint' : 'behavior',
          affectedCapabilities: finding.affectedCapabilities ?? [finding.detailCapability],
          solutionCapability: finding.solutionCapability,
          solutionReadiness: finding.solutionReadiness,
        });
        grouped.set(id, area);
      }
    }
    return [...grouped.values()].sort((left, right) => left.label.localeCompare(right.label));
  }

  private capabilityDetails(projectId: string, unitId?: string, organizationalPrior?: Map<string, number>): CapabilityLevel[] {
    const scope = this.scope(projectId, unitId);
    const rows = this.db.prepare(`
      SELECT p.id participant_id, s.capability, s.pattern, s.weight, s.detail_capabilities
      FROM responses r JOIN participations p ON p.id = r.participation_id
      JOIN assessment_signals s ON s.graph_version = p.graph_version
        AND s.node_key = r.node_id AND s.option_key = r.option_id
      WHERE p.project_id = ? AND p.status = 'completed' ${scope.sql}
    `).all(...scope.parameters) as unknown as Array<{ participant_id: string; capability: string; pattern: string; weight: number; detail_capabilities: string }>;
    const grouped = new Map<string, { evidence: Array<{ participantId: string; pattern: string; weight: number }>; patterns: Set<string> }>();
    for (const row of rows) {
      const details = JSON.parse(row.detail_capabilities) as string[];
      for (const detail of details) {
        const current = grouped.get(detail) ?? { evidence: [], patterns: new Set<string>() };
        current.evidence.push({ participantId: row.participant_id, pattern: row.pattern, weight: Number(row.weight) });
        current.patterns.add(row.pattern);
        grouped.set(detail, current);
      }
    }
    return [...grouped.entries()].map(([id, evidence]) => ({
      id,
      label: capabilityDetailLabels[id] ?? id,
      ...CapabilityAssessment.fromEvidence(evidence.evidence, organizationalPrior?.has(id) ? { level: organizationalPrior.get(id)!, strength: 1 } : undefined),
      coverage: Math.min(1, evidence.patterns.size / 2),
    }));
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
    const rows = this.db.prepare(`
      SELECT p.profile, s.detail_capabilities, s.weight
      FROM responses r JOIN participations p ON p.id = r.participation_id
      JOIN assessment_signals s ON s.graph_version = p.graph_version
        AND s.node_key = r.node_id AND s.option_key = r.option_id
      WHERE p.project_id = ? AND p.status = 'completed' ${scope.sql}
        AND p.profile IN (${placeholders})
    `).all(...[...scope.parameters, ...profileValues]) as unknown as Array<{ profile: Profile; detail_capabilities: string; weight: number }>;
    const aggregates = new Map<string, { profile: Profile; capability: string; total: number; count: number }>();
    for (const row of rows) {
      for (const capability of JSON.parse(row.detail_capabilities) as string[]) {
        const key = `${row.profile}:${capability}`;
        const current = aggregates.get(key) ?? { profile: row.profile, capability, total: 0, count: 0 };
        current.total += Number(row.weight);
        current.count += 1;
        aggregates.set(key, current);
      }
    }
    const scores = [...aggregates.values()].map((item) => ({ profile: item.profile, capability: item.capability, score: item.total / item.count }));
    const capabilities = [...new Set(scores.map((score) => score.capability))];
    return capabilities.flatMap((capability) => {
      const comparable = scores.filter((score) => score.capability === capability);
      const stronger = comparable.filter((score) => Number(score.score) >= 1).map((score) => profiles[score.profile]);
      const constrained = comparable.filter((score) => Number(score.score) <= -1).map((score) => profiles[score.profile]);
      if (!stronger.length || !constrained.length) return [];
      return [{
        capability,
        title: `Perspectivas divergem na capacidade “${CapabilityTaxonomy.labelFor(capability)}”`,
        strongerProfiles: stronger,
        constrainedProfiles: constrained,
      }];
    });
  }

  private findings(projectId: string, population: number, unitId?: string): Finding[] {
    const scope = this.scope(projectId, unitId);
    const rows = this.db.prepare(`
      SELECT p.id participant_id, p.profile, s.capability, s.pattern, s.weight, s.detail_capabilities,
        s.evidence_layer, s.constraint_kind
      FROM responses r JOIN participations p ON p.id = r.participation_id
      JOIN assessment_signals s ON s.graph_version = p.graph_version
        AND s.node_key = r.node_id AND s.option_key = r.option_id
      WHERE p.project_id = ? AND p.status = 'completed' ${scope.sql}
    `).all(...scope.parameters) as unknown as Array<{ participant_id: string; profile: string; capability: string; pattern: string; weight: number; detail_capabilities: string; evidence_layer: EvidenceLayer; constraint_kind: ConstraintKind }>;
    const signals: GroupSignal[] = rows.flatMap((row) => {
      const affectedCapabilities = JSON.parse(row.detail_capabilities) as string[];
      const primaryDetailCapability = affectedCapabilities[0];
      return affectedCapabilities.map((detailCapability) => ({
        participantId: row.participant_id,
        profile: row.profile,
        detailCapability,
        ...(primaryDetailCapability ? { primaryDetailCapability } : {}),
        affectedCapabilities,
        pattern: row.pattern,
        weight: Number(row.weight),
        layer: row.evidence_layer,
        constraint: row.constraint_kind,
      }));
    });
    const applicableByCapability = Object.fromEntries([...new Set(signals.map((signal) => signal.detailCapability))].map((capability) => [
      capability,
      new Set(signals.filter((signal) => signal.detailCapability === capability).map((signal) => signal.participantId)).size,
    ]));
    return new GroupRecommendationEngine(interventionCatalog, evolutionCatalog).rank(signals, { total: population, applicableByCapability }).map((ranked) => ({
      kind: ranked.kind,
      capability: ranked.detailCapability,
      detailCapability: ranked.detailCapability,
      pattern: ranked.pattern,
      title: ranked.title,
      cause: ranked.cause,
      evidence: Math.round(ranked.support * population),
      intervention: ranked.intervention,
      confidence: ranked.confidence,
      priority: ranked.priority,
      constraint: ranked.constraint,
      reasons: ranked.reasons,
      recommendationEvidence: ranked.evidence,
      experiment: ranked.experiment,
      foundation: ranked.foundation,
      solutionCapability: ranked.solutionCapability,
      solutionReadiness: ranked.solutionReadiness,
      affectedCapabilities: ranked.affectedCapabilities,
      priorityFactors: ranked.priorityFactors,
      ...buildDiagnosticContext({ capability: ranked.detailCapability, constraint: ranked.constraint }),
    }));
  }

  private persistTransformation(projectId: string, completed: number, findings: Finding[]): void {
    const now = new Date().toISOString();
    const patterns = Object.fromEntries(findings.map((finding) => [finding.pattern, finding.evidence]));
    const last = this.db.prepare('SELECT completed FROM diagnostic_snapshots WHERE project_id = ? AND unit_id IS NULL ORDER BY captured_at DESC LIMIT 1')
      .get(projectId) as { completed: number } | undefined;
    if (!last || Number(last.completed) !== completed) {
      this.db.prepare('INSERT INTO diagnostic_snapshots (id, project_id, unit_id, completed, captured_at, patterns_json) VALUES (?, ?, NULL, ?, ?, ?)')
        .run(id(), projectId, completed, now, JSON.stringify(patterns));
    }
    const existing = this.db.prepare('SELECT id FROM transformation_experiments WHERE project_id = ? AND unit_id IS NULL AND pattern = ?');
    const insert = this.db.prepare(`INSERT INTO transformation_experiments
      (id, project_id, unit_id, pattern, title, action, owner, metric, review_horizon, success_criterion, foundation_source, foundation_principle, foundation_why, created_at)
      VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const update = this.db.prepare(`UPDATE transformation_experiments SET title=?, action=?, owner=?, metric=?, review_horizon=?, success_criterion=?,
      foundation_source=?, foundation_principle=?, foundation_why=? WHERE id=?`);
    for (const finding of findings) {
      const row = existing.get(projectId, finding.pattern) as { id: string } | undefined;
      if (row) {
        update.run(finding.title, finding.experiment.action, finding.experiment.owner, finding.experiment.metric, finding.experiment.reviewHorizon, finding.experiment.successCriterion, finding.foundation.source, finding.foundation.principle, finding.foundation.why, row.id);
        continue;
      }
      insert.run(id(), projectId, finding.pattern, finding.title, finding.experiment.action, finding.experiment.owner, finding.experiment.metric, finding.experiment.reviewHorizon, finding.experiment.successCriterion, finding.foundation.source, finding.foundation.principle, finding.foundation.why, now);
    }
  }

  private visibilityGaps(projectId: string, minimum: number, unitId?: string): VisibilityGap[] {
    const scope = this.scope(projectId, unitId);
    const rows = this.db.prepare(`
      SELECT p.profile, COUNT(DISTINCT p.id) observers
      FROM responses r JOIN participations p ON p.id = r.participation_id
      JOIN assessment_options o ON o.graph_version = p.graph_version AND o.node_key = r.node_id AND o.option_key = r.option_id
      WHERE p.project_id = ? AND p.status = 'completed' AND o.observation_kind = 'visibility' ${scope.sql}
      GROUP BY p.profile HAVING COUNT(DISTINCT p.id) >= ?
    `).all(...scope.parameters, minimum) as unknown as Array<{ profile: string; observers: number }>;
    return rows.map((row) => ({
      title: `Parte do fluxo não é observada na perspectiva ${row.profile}`,
      profiles: [row.profile],
      count: Number(row.observers),
    }));
  }

  private previousMeasurement(projectId: string): MeasurementDelta | null {
    const snapshots = this.db.prepare('SELECT completed, captured_at, patterns_json FROM diagnostic_snapshots WHERE project_id = ? AND unit_id IS NULL ORDER BY captured_at DESC LIMIT 2')
      .all(projectId) as unknown as Array<{ completed: number; captured_at: string; patterns_json: string }>;
    if (snapshots.length < 2) return null;
    const current = JSON.parse(snapshots[0]!.patterns_json) as Record<string, number>;
    const previous = JSON.parse(snapshots[1]!.patterns_json) as Record<string, number>;
    const keys = [...new Set([...Object.keys(current), ...Object.keys(previous)])];
    return {
      previousCompleted: Number(snapshots[1]!.completed),
      capturedAt: snapshots[1]!.captured_at,
      patternDeltas: keys
        .map((pattern) => ({ pattern, previous: previous[pattern] ?? 0, current: current[pattern] ?? 0 }))
        .filter((delta) => delta.previous !== delta.current),
    };
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

const capabilityDetailLabels: Record<string, string> = {
  'product-direction': 'Direção e alinhamento', 'discovery-validation': 'Descoberta e validação', 'portfolio-management': 'Gestão de portfólio',
  'planning-refinement': 'Planejamento e refinamento', 'work-management': 'Fluxo de trabalho', 'continuous-integration': 'Integração contínua', 'release-feedback': 'Release e feedback',
  'sustainable-design': 'Design e sustentabilidade do código', 'quality-strategy': 'Estratégia de qualidade', 'sdlc-automation': 'Feedback técnico repetível', 'software-security': 'Segurança de software', 'technical-capability': 'Capacidade técnica',
  'domain-alignment': 'Alinhamento ao domínio', 'architecture-decisions': 'Decisões arquiteturais', evolvability: 'Evolutibilidade', 'integration-data': 'Integração e dados',
  'observability-practice': 'Observabilidade', 'reliability-practice': 'Confiabilidade', 'incident-management': 'Gestão de incidentes', 'platform-autonomy': 'Plataforma e autonomia',
  'reproducible-infrastructure': 'Infraestrutura reproduzível', 'cloud-security': 'Segurança e identidade', 'cloud-reliability': 'Confiabilidade de infraestrutura', 'cloud-efficiency': 'Eficiência, custos e sustentabilidade',
  'team-ownership': 'Estrutura e ownership', 'enabling-governance': 'Governança habilitadora', 'leadership-management': 'Liderança e gestão', collaboration: 'Colaboração', 'organizational-learning': 'Aprendizado e adaptação',
};

const rootCapabilityLabels: Record<string, string> = {
  'product-value': 'Estratégia de produto e valor', 'delivery-flow': 'Fluxo de entrega',
  'engineering-quality': 'Engenharia e qualidade', 'architecture-evolution': 'Arquitetura e evolução',
  'operations-reliability': 'Operação e confiabilidade', 'platform-experience': 'Plataforma e experiência de engenharia',
  'security-risk': 'Segurança e gestão de risco', 'organizational-system': 'Sistema organizacional',
};

const rootCapabilityByDetail = Object.fromEntries([
  ['product-value', ['product-direction', 'discovery-validation', 'portfolio-management']],
  ['delivery-flow', ['planning-refinement', 'work-management', 'continuous-integration', 'release-feedback']],
  ['engineering-quality', ['sustainable-design', 'quality-strategy', 'sdlc-automation', 'technical-capability']],
  ['architecture-evolution', ['domain-alignment', 'architecture-decisions', 'evolvability', 'integration-data']],
  ['operations-reliability', ['observability-practice', 'reliability-practice', 'incident-management', 'cloud-reliability']],
  ['platform-experience', ['platform-autonomy', 'reproducible-infrastructure', 'cloud-efficiency']],
  ['security-risk', ['software-security', 'cloud-security']],
  ['organizational-system', ['team-ownership', 'enabling-governance', 'leadership-management', 'collaboration', 'organizational-learning']],
].flatMap(([root, details]) => (details as string[]).map((detail) => [detail, root]))) as Record<string, string>;

type ScopeReport = { id: string; path: string; completed: number; classification: TeamClassification; findings: Finding[]; areas: DiagnosticArea[]; capabilities: CapabilityLevel[]; capabilityGroups: ReturnType<typeof CapabilityTaxonomy.organize>; perspectiveGaps: PerspectiveGap[]; hypotheses: DiagnosticPosterior[] };
