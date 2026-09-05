import type { ConstraintKind } from './group-recommendation-engine.js';
import type { PrescriptionDecision } from './diagnostic-contract.js';
import type { SolutionReadiness } from './solution-readiness.js';

export type TechnicalLibraryId = 'delivery-feedback' | 'security-in-flow' | 'safe-environment' | 'domain-discovery' | 'architecture-mapping' | 'approved-paths';

export type TechnicalDirection = {
  library: TechnicalLibraryId;
  practiceTarget: string;
  techniques: string[];
  enablingMechanism: string;
  toolFamilies: string[];
  prerequisites: string[];
  doesNotSolve: string;
  qualitativeCost: 'low' | 'medium' | 'high';
  risk: string;
  smallestExperiment: string;
  indicator: string;
  successCriterion: string;
  foundation: { source: string; principle: string; versionOrDate: string; limitation: string };
};

type TechnicalContract = TechnicalDirection & { mechanisms: ConstraintKind[] };

const contracts: Record<string, TechnicalContract> = {
  'causa-ferramental-feedback': {
    library: 'delivery-feedback', mechanisms: ['tooling', 'platform'],
    practiceTarget: 'Feedback técnico confiável durante a mudança',
    techniques: ['Caminho rápido para a verificação crítica', 'Testes de contrato nas fronteiras aplicáveis', 'Quarentena e ownership de verificações instáveis'],
    enablingMechanism: 'Devolver evidência acionável no tempo da decisão da pessoa desenvolvedora.',
    toolFamilies: ['integração e build', 'testes e contratos', 'análise de qualidade', 'observação da mudança'],
    prerequisites: ['Identificar qual verificação altera a decisão', 'Medir duração, instabilidade e resultados ignorados'],
    doesNotSolve: 'Não remove política de lote, aprovação indiferenciada ou acoplamento que obriga mudanças simultâneas.',
    qualitativeCost: 'medium', risk: 'Otimizar duração e reduzir a cobertura do risco que realmente importa.',
    smallestExperiment: 'Escolher a verificação que mais provoca espera e estabilizá-la em uma classe pequena de mudança.',
    indicator: 'Tempo até retorno acionável, instabilidade e mudanças que seguem sem esperar.',
    successCriterion: 'A próxima mudança equivalente usa o retorno no mesmo dia sem aumentar escapes.',
    foundation: { source: 'Continuous Delivery', principle: 'Feedback rápido e confiável', versionOrDate: '2010', limitation: 'O princípio não define qual verificação representa o risco específico do produto.' },
  },
  'automacao-sem-feedback': {
    library: 'delivery-feedback', mechanisms: ['tooling', 'platform'],
    practiceTarget: 'Automação que orienta uma decisão de mudança',
    techniques: ['Separar caminho rápido de verificações demoradas', 'Tornar falha acionável para quem produziu a mudança', 'Medir e retirar instabilidade do caminho crítico'],
    enablingMechanism: 'Fazer o retorno chegar antes de a pessoa acumular outra decisão sobre a mudança.',
    toolFamilies: ['integração e build', 'qualidade automatizada', 'entrega e promoção'],
    prerequisites: ['Conhecer o caminho realmente aguardado pelas pessoas', 'Ter ownership para falhas da própria verificação'],
    doesNotSolve: 'Não corrige risco ausente da estratégia nem uma política externa que exige lote.', qualitativeCost: 'medium',
    risk: 'Aumentar paralelismo e custo sem remover o motivo da espera.', smallestExperiment: 'Reduzir o tempo e os falsos alarmes de uma verificação crítica.',
    indicator: 'Tempo até retorno útil e proporção de execuções ignoradas.', successCriterion: 'A próxima mudança aguarda e usa o retorno sem ampliar o lote.',
    foundation: { source: 'Continuous Delivery', principle: 'Build e testes como feedback', versionOrDate: '2010', limitation: 'Automação não substitui julgamento de risco ou evidência de resultado.' },
  },
  'caminho-de-versao-sem-origem': {
    library: 'delivery-feedback', mechanisms: ['tooling', 'platform'],
    practiceTarget: 'Uma origem única promove o mesmo artefato com proveniência verificável',
    techniques: ['Identificador imutável do artefato', 'Promoção do mesmo artefato entre ambientes', 'Esteira de build a partir da origem compartilhada'],
    enablingMechanism: 'Permitir reconstruir qual fonte produziu a versão em uso, sem a pessoa que empacotou.',
    toolFamilies: ['repositório de código', 'repositório de artefatos', 'registro de imagens', 'esteira de build'],
    prerequisites: ['Evento de promoção observado', 'Remover ou reconciliar o caminho que ainda vive numa máquina'],
    doesNotSolve: 'Não escolhe fornecedor e não cria ownership entre grupos.',
    qualitativeCost: 'medium', risk: 'Comprar o repositório e manter o arquivo paralelo como exceção.',
    smallestExperiment: 'Exigir origem inequívoca para um artefato crítico na próxima promoção.',
    indicator: 'Versões sem origem e caminhos paralelos ainda válidos.',
    successCriterion: 'A próxima promoção só avança com origem, identificador e o mesmo artefato.',
    foundation: { source: 'Continuous Delivery / SLSA', principle: 'Proveniência da cadeia de suprimento', versionOrDate: 'CD 2010; SLSA v1.0, 2023', limitation: 'A família não prova adequação funcional do artefato.' },
  },
  'identidade-sem-autorizacao-no-recurso': {
    library: 'safe-environment', mechanisms: ['access', 'governance'],
    practiceTarget: 'Autorização mínima e temporária no recurso que a mudança toca',
    techniques: ['Checagem de autorização no recurso', 'Expiração do acesso', 'Trilha da operação'],
    enablingMechanism: 'Separar “token válido” de “pode alterar este recurso agora”.',
    toolFamilies: ['identidade e acesso', 'política como código', 'auditoria de operação'],
    prerequisites: ['O evento ocorre em nuvem ou identidade compartilhada', 'Nomear o recurso e o risco protegido'],
    doesNotSolve: 'Não define adequação do ambiente e não autoriza privilégio irrestrito.',
    qualitativeCost: 'medium', risk: 'Validar só o token e chamar isso de zero trust.',
    smallestExperiment: 'Na próxima mudança comum, restringir a identidade ao recurso e ao tempo da operação.',
    indicator: 'Operações em que a identidade não cobria o recurso.',
    successCriterion: 'A próxima mudança comum só altera o recurso autorizado.',
    foundation: { source: 'NIST Zero Trust Architecture', principle: 'Acesso mínimo e decisão explícita', versionOrDate: 'SP 800-207, 2020', limitation: 'Zero trust não escolhe fornecedor de nuvem.' },
  },
  'reversao-nao-reproduzivel': {
    library: 'delivery-feedback', mechanisms: ['tooling', 'platform'],
    practiceTarget: 'Reversão no caminho da mudança, executável por quem observa o impacto',
    techniques: ['Passo de volta no caminho de promoção', 'Critério de mitigação antes da causa', 'Ensaio com mudança pequena'],
    enablingMechanism: 'Mitigar sem esperar a pessoa que “sabe voltar”.',
    toolFamilies: ['entrega e promoção', 'observação da mudança'],
    prerequisites: ['Incidente ou falha de promoção observada', 'Caminho de ida conhecido o suficiente para ensaiar a volta'],
    doesNotSolve: 'Não remove lote grande nem política que proíbe voltar atrás.',
    qualitativeCost: 'medium', risk: 'Documentar rollback e continuar dependendo do hotfix.',
    smallestExperiment: 'Voltar uma mudança pequena pelo caminho, sem a pessoa heroica.',
    indicator: 'Tempo até mitigação e incidentes fechados só com intervenção pessoal.',
    successCriterion: 'O próximo incidente equivalente mitiga pelo caminho.',
    foundation: { source: 'SRE', principle: 'Mitigação antes da causa', versionOrDate: '2016', limitation: 'Reversão não substitui aprendizado sistêmico.' },
  },
  'fonte-nao-confiavel': {
    library: 'delivery-feedback', mechanisms: ['architecture', 'tooling'], practiceTarget: 'Proveniência verificável do artefato promovido',
    techniques: ['Identificador imutável do artefato', 'Promoção do mesmo artefato entre ambientes', 'Registro verificável de origem e composição'],
    enablingMechanism: 'Permitir reconstruir qual fonte e quais verificações produziram a versão em uso.',
    toolFamilies: ['repositório de artefatos', 'proveniência e assinatura', 'entrega e promoção'],
    prerequisites: ['Definir qual artefato é promovido', 'Remover ou reconciliar caminhos paralelos de produção'],
    doesNotSolve: 'Não acelera verificações lentas nem cria ownership entre grupos.', qualitativeCost: 'medium', risk: 'Manter o caminho manual como exceção permanente e produzir proveniência apenas nominal.',
    smallestExperiment: 'Exigir origem inequívoca para um artefato crítico e tentar reconstruí-la na promoção seguinte.', indicator: 'Artefatos sem origem inequívoca e tempo de reconciliação.',
    successCriterion: 'O próximo artefato crítico só avança com origem e composição verificáveis.',
    foundation: { source: 'SLSA', principle: 'Proveniência da cadeia de suprimento', versionOrDate: 'v1.0, 2023', limitation: 'Proveniência reduz incerteza da origem; não prova adequação funcional ou segurança do artefato.' },
  },
  'ameaca-so-em-checklist': {
    library: 'security-in-flow', mechanisms: ['process'], practiceTarget: 'Risco de segurança influenciando desenho e verificação antes da liberação',
    techniques: ['Modelagem de ameaça proporcional à mudança', 'Casos de abuso para a nova fronteira de confiança', 'Teste de comportamento derivado da ameaça'],
    enablingMechanism: 'Tornar explícito o que pode dar errado antes de escolher controle ou ferramenta.', toolFamilies: [],
    prerequisites: ['Mudança aplicável a dado, privilégio ou fronteira de confiança', 'Pessoas capazes de alterar escopo, desenho ou evidência'],
    doesNotSolve: 'Não decide autorização ou acesso por si só e não substitui ownership da decisão de risco.', qualitativeCost: 'low',
    risk: 'Transformar a técnica em checklist genérico sem alterar nenhuma decisão.', smallestExperiment: 'Reconstruir uma ameaça plausível da próxima mudança e derivar uma evidência verificável.',
    indicator: 'Mudanças aplicáveis em que a ameaça altera desenho, escopo ou teste.', successCriterion: 'Uma ameaça concreta muda ao menos uma decisão antes da liberação.',
    foundation: { source: 'NIST Secure Software Development Framework', principle: 'Preparar e produzir software protegido por risco', versionOrDate: 'SP 800-218 v1.1, 2022', limitation: 'O framework orienta práticas; não determina a ameaça específica nem o risco aceito pela organização.' },
  },
  'seguranca-concentrada-em-scanners': {
    library: 'security-in-flow', mechanisms: ['process', 'knowledge'], practiceTarget: 'Estratégia de segurança que combina detecção e julgamento contextual',
    techniques: ['Modelagem de ameaça proporcional', 'Triagem por criticidade e precisão', 'Teste de autorização e comportamento'],
    enablingMechanism: 'Usar a ameaça e o contexto para decidir quais achados e comportamentos alteram a mudança.',
    toolFamilies: ['análise estática', 'composição de dependências', 'detecção de segredo', 'análise de configuração e infraestrutura como código'],
    prerequisites: ['Risco aplicável discriminado', 'Ownership para triagem, exceção e aprendizado'], doesNotSolve: 'Scanners não substituem modelagem de ameaça, teste de autorização ou decisão de risco.',
    qualitativeCost: 'medium', risk: 'Bloquear indiscriminadamente por volume ou ruído e deslocar o trabalho para exceções.',
    smallestExperiment: 'Escolher uma classe de risco e revisar retorno, precisão, dono e decisão produzida por um tipo de análise.', indicator: 'Tempo até retorno, precisão acionável, exceções e reincidência.',
    successCriterion: 'A análise escolhida altera uma decisão aplicável sem ampliar exceções informais.',
    foundation: { source: 'OWASP SAMM', principle: 'Verificação orientada a risco', versionOrDate: 'v2.1, 2023', limitation: 'O modelo organiza capacidades; presença de scanner não demonstra eficácia ou cobertura do risco.' },
  },
  'caminho-conhecido-inacessivel': {
    library: 'safe-environment', mechanisms: ['access'], practiceTarget: 'Autonomia operacional com acesso mínimo, temporário e auditável',
    techniques: ['Acesso mínimo e temporário para o caso comum', 'Elevação explícita para exceção', 'Trilha e revogação verificáveis'],
    enablingMechanism: 'Permitir a primeira execução sem favor pessoal, preservando limite e rastreabilidade.',
    toolFamilies: ['identidade e acesso', 'política como código', 'auditoria de operação'], prerequisites: ['Nomear o risco protegido', 'Separar caso comum de exceção privilegiada'],
    doesNotSolve: 'Não torna o caminho adequado e não autoriza privilégio irrestrito.', qualitativeCost: 'medium', risk: 'Automatizar concessão ampla ou permanente para remover a espera.',
    smallestExperiment: 'Aplicar acesso mínimo e temporário a uma operação frequente com expiração e trilha.', indicator: 'Tempo até primeira execução e liberações pessoais para casos comuns.',
    successCriterion: 'O próximo caso comum começa sem liberação pessoal e sem privilégio permanente.',
    foundation: { source: 'NIST Zero Trust Architecture', principle: 'Acesso mínimo e decisão explícita', versionOrDate: 'SP 800-207, 2020', limitation: 'Zero trust não define a adequação do ambiente nem elimina a necessidade de exceção.' },
  },
  'provisionamento-em-fila': {
    library: 'safe-environment', mechanisms: ['platform'], practiceTarget: 'Provisionamento executável pelo time com limites e reconciliação',
    techniques: ['Self-service para o pedido recorrente', 'Template com isolamento, custo e descarte explícitos', 'Reconciliação declarativa do estado'],
    enablingMechanism: 'Trocar espera de outro grupo por execução segura dentro de limites previamente decididos.', toolFamilies: ['provisionamento declarativo', 'plataforma de autosserviço', 'política e reconciliação'],
    prerequisites: ['Pedido recorrente e caso comum conhecidos', 'Limites de isolamento, custo, acesso e descarte'], doesNotSolve: 'Não torna seguro um padrão cujo risco ainda não foi definido e não elimina suporte para exceções.',
    qualitativeCost: 'high', risk: 'Pavimentar cedo um caso inadequado e multiplicar recursos sem ownership de custo e descarte.', smallestExperiment: 'Pavimentar um único pedido repetido para uma unidade consumidora.',
    indicator: 'Tempo até ambiente utilizável, tickets, abandonos, custo e descarte.', successCriterion: 'O pedido comum é concluído sem fila externa e dentro dos limites definidos.',
    foundation: { source: 'Team Topologies', principle: 'Plataforma reduz carga cognitiva como produto interno', versionOrDate: '2019', limitation: 'Autosserviço não é objetivo isolado; precisa reduzir fricção observada para consumidores reais.' },
  },
  'legado-sem-modelo-recuperavel': {
    library: 'domain-discovery', mechanisms: ['knowledge'], practiceTarget: 'Reconstrução colaborativa de comportamento, regras e fronteiras antes da mudança',
    techniques: ['Event Storming focado no evento recente', 'Exemplos concretos para regras e exceções', 'Context map para relações entre linguagens e ownership'],
    enablingMechanism: 'Tornar conflitos de linguagem, regra e decisão visíveis enquanto ainda podem alterar o recorte da mudança.', toolFamilies: ['quadro colaborativo e registro de decisões'],
    prerequisites: ['Evento, regra ou fronteira não recuperável numa mudança real', 'Participação de quem decide e de quem observa a consequência'],
    doesNotSolve: 'Não remove sozinho acoplamento, falta de autoridade, funding ou feedback técnico.', qualitativeCost: 'medium',
    risk: 'Produzir um mapa amplo e estático sem mudar a decisão atual.', smallestExperiment: 'Reconstruir um único fluxo crítico e uma regra contestada a partir do evento recente.',
    indicator: 'Decisões antes bloqueadas por regra, linguagem ou ownership não reconstruível.', successCriterion: 'A próxima mudança usa uma fronteira ou regra acordada e registra o fato que poderia revisá-la.',
    foundation: { source: 'Domain-Driven Design / EventStorming', principle: 'Conhecimento do domínio construído em colaboração', versionOrDate: 'DDD 2003; EventStorming 2013', limitation: 'A técnica revela conflitos e hipóteses; não prova que a fronteira escolhida seja estável ou financiável.' },
  },
  'servico-sem-responsavel': {
    library: 'architecture-mapping', mechanisms: ['organization'], practiceTarget: 'Mapa arquitetural usado para decidir ownership, impacto e continuidade',
    techniques: ['C4 para contexto e contêineres relevantes', 'Catálogo de serviços com responsável e criticidade', 'Mapa de dependências ligado ao fluxo crítico'],
    enablingMechanism: 'Conectar sistema, dependência, consequência e autoridade numa decisão de mudança ou incidente.', toolFamilies: ['catálogo de serviços', 'modelagem arquitetural', 'descoberta de dependências'],
    prerequisites: ['Serviço ou fluxo sem autoridade recuperável', 'Decisão concreta que dependa do mapa'], doesNotSolve: 'Não concede acesso, não cria mantenedor e não corrige informação desatualizada sem processo de uso e revisão.',
    qualitativeCost: 'medium', risk: 'Inventariar todo o parque sem priorizar criticidade nem incorporar o mapa ao trabalho.', smallestExperiment: 'Mapear um fluxo crítico, seus serviços, dependências e responsáveis e usar o mapa numa mudança.',
    indicator: 'Tempo para localizar impacto e autoridade; dependências críticas sem responsável.', successCriterion: 'A próxima mudança crítica localiza impacto e decisão pelo mapa, e uma divergência encontrada é corrigida.',
    foundation: { source: 'C4 model / Team Topologies', principle: 'Mapa no nível necessário para comunicação e ownership', versionOrDate: 'C4, 2011; Team Topologies, 2019', limitation: 'O mapa é uma representação para decisão, não evidência de que ownership ou dependências funcionem.' },
  },
  'caminho-inadequado-ao-caso': {
    library: 'approved-paths', mechanisms: ['platform'], practiceTarget: 'Caminho homologado evoluído pela jornada real do consumidor',
    techniques: ['Teste de adequação com um consumidor real', 'Comparação entre caminho comum, contorno e abandono', 'Contrato de exceção com retorno ao produto interno'],
    enablingMechanism: 'Fazer homologação reduzir risco sem impedir a necessidade recorrente que o consumidor precisa executar.', toolFamilies: ['catálogo de capacidades', 'portal ou API de plataforma', 'telemetria da jornada do consumidor'],
    prerequisites: ['Jornada do consumidor observada até conclusão, contorno ou abandono', 'Restrição recorrente e risco da homologação explicitados'],
    doesNotSolve: 'Não justifica obrigar adoção, padronizar exceção única ou tratar publicação no catálogo como adequação.', qualitativeCost: 'medium',
    risk: 'Ampliar o caminho por preferência isolada ou usar telemetria de acesso como prova de valor.', smallestExperiment: 'Eliminar uma lacuna recorrente com um consumidor e comparar esforço e risco com o contorno anterior.',
    indicator: 'Conclusão, ajuda, abandono e contorno na jornada comum.', successCriterion: 'O próximo caso equivalente conclui no caminho suportado sem preservar a solução paralela.',
    foundation: { source: 'Platform as a Product', principle: 'Caminhos pavimentados orientados à necessidade do consumidor', versionOrDate: 'Team Topologies, 2019', limitation: 'Adoção não prova adequação; coerção pode aumentar uso enquanto desloca risco e fricção.' },
  },
};

export function hasTechnicalContract(pattern: string): boolean { return Boolean(contracts[pattern]); }

export function technicalDirectionFor(input: {
  pattern: string;
  mechanism: ConstraintKind;
  prescription: PrescriptionDecision;
  readiness: SolutionReadiness;
}): TechnicalDirection | undefined {
  const contract = contracts[input.pattern];
  if (!contract || input.prescription.status !== 'ready' || input.readiness.stage === 'not-demonstrated') return undefined;
  if (!contract.mechanisms.includes(input.mechanism)) return undefined;
  const { mechanisms: _mechanisms, ...direction } = contract;
  return structuredClone(direction);
}
