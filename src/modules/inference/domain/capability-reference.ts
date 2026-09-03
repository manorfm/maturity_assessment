import { DomainValidationError } from '../../../shared/errors.js';

export const capabilityReferenceVersion = 'capability-reference-v8' as const;

export type CapabilityStageLevel = 0 | 1 | 2 | 3 | 4;
export type CapabilityStageReference = Readonly<{
  level: CapabilityStageLevel;
  label: 'Opaco' | 'Reativo' | 'Repetível' | 'Gerenciado' | 'Adaptativo';
  behavior: string;
  effect: string;
  underPressure: string;
}>;

export type CapabilityReferenceInput = {
  capabilityId: string;
  title: string;
  purpose: string;
  assessmentBasis: 'behavior-and-effect-only';
  stages: CapabilityStageReference[];
  evidenceRequired: string[];
  enablingConditions: string[];
  regressionSignals: string[];
  compatiblePractices: string[];
  optionalToolFamilies: string[];
  interpretationLimits: string[];
};

export class CapabilityReference {
  readonly version = capabilityReferenceVersion;
  readonly capabilityId: string;
  readonly title: string;
  readonly purpose: string;
  readonly assessmentBasis: 'behavior-and-effect-only';
  readonly stages: readonly CapabilityStageReference[];
  readonly evidenceRequired: readonly string[];
  readonly enablingConditions: readonly string[];
  readonly regressionSignals: readonly string[];
  readonly compatiblePractices: readonly string[];
  readonly optionalToolFamilies: readonly string[];
  readonly interpretationLimits: readonly string[];

  private constructor(input: CapabilityReferenceInput) {
    this.capabilityId = input.capabilityId.trim();
    this.title = input.title.trim();
    this.purpose = input.purpose.trim();
    this.assessmentBasis = input.assessmentBasis;
    this.stages = Object.freeze(input.stages.map((stage) => Object.freeze({ ...stage })));
    this.evidenceRequired = freezeText(input.evidenceRequired);
    this.enablingConditions = freezeText(input.enablingConditions);
    this.regressionSignals = freezeText(input.regressionSignals);
    this.compatiblePractices = freezeText(input.compatiblePractices);
    this.optionalToolFamilies = freezeText(input.optionalToolFamilies);
    this.interpretationLimits = freezeText(input.interpretationLimits);
    Object.freeze(this);
  }

  static create(input: CapabilityReferenceInput): CapabilityReference {
    if (input.assessmentBasis !== 'behavior-and-effect-only') throw new DomainValidationError('A referência só pode avaliar comportamento e efeito observados.');
    if (!input.capabilityId.trim() || !input.title.trim() || input.purpose.trim().length < 40) throw new DomainValidationError('A referência exige identidade, título e propósito operacional.');
    const expectedLevels: CapabilityStageLevel[] = [0, 1, 2, 3, 4];
    if (input.stages.length !== expectedLevels.length || input.stages.some((stage, index) => stage.level !== expectedLevels[index])) {
      throw new DomainValidationError('A referência exige os estágios 0 a 4 em ordem.');
    }
    if (input.stages.some((stage) => !stage.behavior.trim() || !stage.effect.trim() || !stage.underPressure.trim())) {
      throw new DomainValidationError('Cada estágio exige comportamento, efeito e reação sob pressão.');
    }
    for (const items of [input.evidenceRequired, input.enablingConditions, input.regressionSignals, input.interpretationLimits]) {
      if (items.length < 2 || items.some((item) => !item.trim())) throw new DomainValidationError('A referência exige ao menos dois elementos observáveis em cada dimensão obrigatória.');
    }
    return new CapabilityReference(input);
  }

  stage(level: CapabilityStageLevel): CapabilityStageReference {
    const stage = this.stages.find((candidate) => candidate.level === level);
    if (!stage) throw new DomainValidationError(`Estágio ${level} não existe na referência ${this.capabilityId}.`);
    return stage;
  }
}

const stage = (level: CapabilityStageLevel, label: CapabilityStageReference['label'], behavior: string, effect: string, underPressure: string): CapabilityStageReference => ({ level, label, behavior, effect, underPressure });

const definitions: CapabilityReferenceInput[] = [
  {
    capabilityId: 'discovery-validation',
    title: 'Descoberta e validação',
    purpose: 'Reduzir incerteza sobre problema, público e resultado antes e durante a construção, preservando poder real para alterar, reduzir ou interromper a solução.',
    assessmentBasis: 'behavior-and-effect-only',
    stages: [
      stage(0, 'Opaco', 'Não é possível reconstruir qual problema originou a última iniciativa nem qual resultado justificou o compromisso de construção.', 'Entrega e resultado permanecem desconectados, sem evidência para distinguir demanda, hipótese ou preferência de quem patrocinou.', 'Sob pressão, o trabalho começa pela solução solicitada e ninguém consegue explicitar que evidência permitiria rever o compromisso.'),
      stage(1, 'Reativo', 'A equipe procura pessoas usuárias ou dados depois que a solução já foi comprometida, normalmente quando aparece rejeição, atraso ou contestação.', 'O retorno chega tarde e tende a produzir correções no escopo já escolhido, mantendo custo e risco de construir a resposta errada.', 'Sob pressão, validação é removida do fluxo e patrocínio, prazo ou opinião substituem a dúvida que ainda precisava ser testada.'),
      stage(2, 'Repetível', 'Algumas iniciativas testam problema e alternativas antes da construção, mas a prática depende do produto, da liderança ou de pessoas específicas.', 'Parte das decisões muda com o retorno, enquanto outros compromissos seguem protegidos mesmo quando a hipótese perde sustentação.', 'Sob pressão, a descoberta encurta até refinar a solução dada ou acontece em paralelo sem autoridade para mudar prioridade e investimento.'),
      stage(3, 'Gerenciado', 'Problema, público, resultado esperado e incertezas orientam experimentos antes do maior investimento, com decisão explícita sobre continuar, alterar ou parar.', 'Evidência reduz desperdício e muda recorte, prioridade ou solução antes que o custo de reversão se torne alto.', 'Sob pressão, o grupo reduz o tamanho do teste e preserva a decisão por evidência em vez de eliminar o contato com o problema.'),
      stage(4, 'Adaptativo', 'Feedback de uso e resultado reabre continuamente problema, solução, prioridade e investimento, incluindo a possibilidade observável de interromper uma direção.', 'O aprendizado realimenta produto e portfólio, melhorando a qualidade das apostas e reduzindo tempo e capacidade consumidos sem valor demonstrado.', 'Sob pressão, a menor experiência reversível preserva aprendizado e a urgência também pode ser contestada quando não existe resultado que a sustente.'),
    ],
    evidenceRequired: ['Um evento recente ligando dúvida, teste, decisão e mudança de direção.', 'Uma consequência observável no recorte, prioridade, investimento ou encerramento da iniciativa.'],
    enablingConditions: ['Acesso a pessoas afetadas e sinais de uso em tempo de decisão.', 'Autoridade explícita para alterar ou interromper uma solução comprometida.'],
    regressionSignals: ['Discovery volta a apenas detalhar uma solução previamente escolhida.', 'Métricas são coletadas, mas não alteram prioridade, recorte ou investimento.'],
    compatiblePractices: ['Discovery contínuo orientado a hipóteses e resultados.', 'Inception enxuta que explicita problema, risco, alternativas e critério de decisão.'],
    optionalToolFamilies: ['Pesquisa e repositório de evidências.', 'Experimentação de produto e análise de uso.'],
    interpretationLimits: ['Cerimônia, canvas ou framework de discovery não produz estágio por presença.', 'Ausência de uma técnica nomeada não penaliza quando a decisão por evidência é demonstrada.'],
  },
  {
    capabilityId: 'sdlc-automation',
    title: 'Feedback técnico repetível',
    purpose: 'Fazer cada mudança receber retorno técnico rápido, confiável e reproduzível enquanto a pessoa responsável ainda consegue corrigir o risco sem ampliar o lote.',
    assessmentBasis: 'behavior-and-effect-only',
    stages: [
      stage(0, 'Opaco', 'Não é possível reconstruir de qual fonte veio o artefato entregue, quais verificações ocorreram ou por que uma execução foi considerada válida.', 'Falha, versão e configuração não podem ser correlacionadas com segurança, impedindo comparação entre mudanças e ambientes.', 'Sob pressão, pessoas recorrem a arquivos, máquinas ou acessos individuais e o caminho executado deixa pouca evidência recuperável.'),
      stage(1, 'Reativo', 'Build, verificação ou empacotamento dependem de passos manuais, memória e intervenção especializada, especialmente perto da entrega.', 'Variação entre execuções, retorno tardio e retrabalho aumentam o tamanho da mudança e o risco de descobrir defeitos depois.', 'Sob pressão, etapas são ignoradas ou refeitas manualmente e a confiança depende de quem executa em vez de um resultado reproduzível.'),
      stage(2, 'Repetível', 'Há automação para parte do caminho, mas duração, instabilidade, fontes concorrentes ou diferenças entre serviços ainda interrompem o feedback frequente.', 'Alguns defeitos aparecem cedo, enquanto falhas intermitentes e lacunas transferem verificação para especialistas ou etapas posteriores.', 'Sob pressão, o grupo contorna a automação lenta ou instável, acumula mudanças e volta a validar em lote antes da liberação.'),
      stage(3, 'Gerenciado', 'Uma fonte confiável dispara build, verificações e artefato identificável com retorno acionável dentro do ciclo normal da mudança.', 'Defeitos relevantes são encontrados cedo, o mesmo artefato segue pelo caminho e falhas permitem correção sem coordenação excepcional.', 'Sob pressão, o grupo mantém o caminho reproduzível, ajusta escopo da mudança e explicita qualquer exceção temporária que precise ser reconciliada.'),
      stage(4, 'Adaptativo', 'Feedback técnico, escapes e tempo de retorno orientam continuamente quais proteções devem ser criadas, removidas ou reposicionadas no fluxo.', 'Aprendizado reduz recorrência e instabilidade sem aumentar espera, preservando mudanças pequenas, segurança e capacidade de entrega frequente.', 'Sob pressão, o retorno essencial continua rápido e confiável; qualquer simplificação é observada e realimenta a proteção antes da próxima mudança equivalente.'),
    ],
    evidenceRequired: ['Uma mudança recente da fonte ao artefato, com passos, duração, falhas e responsável pelo retorno.', 'Uma consequência observada do feedback no tamanho da mudança, retrabalho, escape ou decisão de liberar.'],
    enablingConditions: ['Fonte e artefato canônicos com ownership do caminho.', 'Verificações estáveis e rápidas o bastante para orientar a mudança atual.'],
    regressionSignals: ['Build ou pacote volta a depender de estação, arquivo ou memória individual.', 'Pessoas passam a ignorar o retorno por lentidão, ruído ou falhas intermitentes.'],
    compatiblePractices: ['Integração contínua com correção imediata do caminho.', 'Build reproduzível, artefato imutável e proteção contínua de riscos.'],
    optionalToolFamilies: ['Integração, build e execução de verificações.', 'Repositório de artefatos e análise automatizada de qualidade ou segurança.'],
    interpretationLimits: ['Pipeline, Git, SAST ou repositório de artefatos não produzem estágio por presença.', 'CVS, FTP ou passo manual só pesam quando seu efeito em variação, risco, espera ou rastreabilidade é observado.'],
  },
  {
    capabilityId: 'platform-autonomy',
    title: 'Capacidades chegam com autonomia e limites seguros',
    purpose: 'Permitir que quem entrega e opera obtenha capacidades recorrentes com contexto, feedback e limites seguros, sem transformar governança ou especialização em fila.',
    assessmentBasis: 'behavior-and-effect-only',
    stages: [
      stage(0, 'Opaco', 'Não é possível reconstruir como uma pessoa obtém ambiente, banco, acesso ou outra capacidade compartilhada nem quem responde pelo resultado.', 'Espera, risco e custo ficam invisíveis e cada grupo aprende por relações pessoais ou tentativas não comparáveis.', 'Sob pressão, acessos diretos e contornos surgem sem registro suficiente para distinguir urgência legítima de incapacidade estrutural.'),
      stage(1, 'Reativo', 'Capacidades recorrentes chegam por tickets, aprovações e execução manual de especialistas, com prazo e resultado dependentes da fila.', 'O time solicitante perde contexto e tempo, enquanto o grupo provedor concentra carga, interrupções e responsabilidade operacional.', 'Sob pressão, prioridade relacional, privilégio amplo ou execução heroica substituem o caminho normal e reforçam a dependência.'),
      stage(2, 'Repetível', 'Alguns casos comuns possuem instrução ou automação local, mas exceções, acesso, adequação e suporte ainda exigem intervenção frequente.', 'O caminho reduz parte da espera, porém adoção varia e consumidores criam contornos quando a capacidade não atende seu trabalho real.', 'Sob pressão, o autosserviço aparente retorna à fila ou cada time mantém uma automação própria sem feedback para a capacidade compartilhada.'),
      stage(3, 'Gerenciado', 'Casos recorrentes são atendidos por caminhos operáveis pelos consumidores dentro de limites seguros, com resultado e responsabilidade claramente devolvidos.', 'Tempo até a capacidade utilizável cai, especialistas deixam de executar o caso comum e exceções produzem aprendizado em vez de dependência permanente.', 'Sob pressão, limites e trilha permanecem verificáveis, e a exceção tem responsável, validade e caminho explícito de reconciliação.'),
      stage(4, 'Adaptativo', 'Feedback de sucesso da tarefa, contornos, adoção e resultado operacional modifica continuamente a capacidade compartilhada e seus limites.', 'Aprendizado reduz carga cognitiva, espera e reinvenção sem retirar ownership dos times nem concentrar todo risco no grupo provedor.', 'Sob pressão, consumidores preservam autonomia segura e o grupo responsável ajusta o caminho a partir do efeito observado, não da quantidade de tickets fechados.'),
    ],
    evidenceRequired: ['Uma solicitação recente reconstruída do primeiro pedido até a capacidade efetivamente utilizável.', 'Tempo, intervenções, contorno, consequência e retorno dado ao responsável pela capacidade.'],
    enablingConditions: ['Ownership de produto para a capacidade compartilhada e seus consumidores.', 'Limites seguros executáveis com feedback claro sobre o resultado da tarefa.'],
    regressionSignals: ['Autosserviço volta a ser formulário que apenas cria ticket para execução manual.', 'Adoção cresce enquanto sucesso da tarefa, espera e contornos deixam de ser observados.'],
    compatiblePractices: ['Platform engineering orientada à experiência e ao resultado do consumidor.', 'Paved paths opcionais, evolutivos e capazes de incorporar exceções relevantes.'],
    optionalToolFamilies: ['Catálogo e APIs de capacidades internas.', 'Provisionamento, identidade, políticas executáveis e feedback operacional.'],
    interpretationLimits: ['Time de plataforma, portal ou IDP não produz estágio por existência.', 'Autonomia não significa liberdade irrestrita; limites seguros e responsabilidade também precisam ser demonstrados.'],
  },
  {
    capabilityId: 'release-feedback',
    title: 'Release e feedback',
    purpose: 'Levar mudanças pequenas e rastreáveis até operação com decisão explícita sobre exposição, evidência rápida do efeito e capacidade segura de conter ou reverter problemas.',
    assessmentBasis: 'behavior-and-effect-only',
    stages: [
      stage(0, 'Opaco', 'Não é possível reconstruir qual versão chegou ao ambiente, quais passos e decisões ocorreram ou como o resultado da liberação foi verificado.', 'Espera, falha e efeito no uso não podem ser ligados à mudança, impedindo distinguir entrega concluída de valor ou risco realmente observado.', 'Sob pressão, arquivos, versões e acessos circulam por caminhos informais e não resta evidência suficiente para explicar o que foi exposto ou corrigido.'),
      stage(1, 'Reativo', 'Empacotamento, transporte, aprovação e exposição dependem de execução manual, filas ou coordenação de especialistas em grandes momentos de liberação.', 'Mudanças esperam, acumulam risco e recebem retorno tarde; uma falha exige localizar versão, responsável e forma de restauração durante o impacto.', 'Sob pressão, verificações são reduzidas, alterações são agrupadas ou acessos excepcionais substituem o caminho comum para cumprir a data.'),
      stage(2, 'Repetível', 'Parte do caminho é repetível e alguns serviços liberam mudanças menores, mas ambiente, aprovação, exposição ou retorno ainda variam conforme o grupo.', 'O tempo e o risco diminuem em casos conhecidos, enquanto dependências e exceções continuam criando lotes, espera ou retorno somente depois da liberação.', 'Sob pressão, implantação e exposição voltam a ser uma decisão única, o lote cresce e o sucesso é inferido pela execução técnica sem observar o efeito esperado.'),
      stage(3, 'Gerenciado', 'Mudanças pequenas percorrem um caminho rastreável e repetível; implantação, exposição e reversão são decisões distintas, com responsável e evidência de resultado.', 'Espera e risco são visíveis, problemas podem ser contidos sem coordenação excepcional e o retorno chega a tempo de confirmar ou ajustar a mudança.', 'Sob pressão, o grupo preserva rastreabilidade e contenção, reduz o tamanho da mudança e registra exceções temporárias com prazo de reconciliação.'),
      stage(4, 'Adaptativo', 'Tempo de espera, falhas, retrabalho, reversões e efeito no uso modificam continuamente políticas, proteções e estratégia de liberação de cada contexto.', 'O sistema aprende a entregar mudanças menores e mais frequentes com estabilidade, reduzindo recorrência sem acrescentar controles indiferenciados ou deslocar risco.', 'Sob pressão, exposição e contenção permanecem graduais e observáveis; o efeito da urgência realimenta o caminho antes da próxima mudança equivalente.'),
    ],
    evidenceRequired: ['Uma mudança recente reconstruída da versão pronta até a exposição, incluindo esperas, decisões, responsáveis e exceções.', 'Uma consequência observável da liberação no uso, risco, retrabalho, contenção, reversão ou decisão seguinte.'],
    enablingConditions: ['Versão e configuração rastreáveis atravessam ambientes por um caminho reproduzível.', 'Times responsáveis conseguem decidir exposição e contenção dentro de limites proporcionais ao risco.'],
    regressionSignals: ['Mudanças voltam a acumular numa janela coordenada ou depender de pacote e transporte manuais.', 'Execução concluída volta a substituir evidência de efeito, e falhas deixam de alterar o caminho seguinte.'],
    compatiblePractices: ['Entrega contínua com mudanças pequenas, reversíveis e verificadas pelo efeito.', 'Exposição progressiva e GitOps quando reduzem variação, preservam rastreabilidade e permitem reconciliação segura.'],
    optionalToolFamilies: ['Orquestração de entrega, promoção e reconciliação declarativa.', 'Gestão de exposição, artefatos, configuração e observação do resultado.'],
    interpretationLimits: ['Pipeline, GitOps, estratégia de ramificação ou ferramenta de implantação não produzem estágio por presença.', 'Frequência declarada não equivale a performance DORA sem telemetria por serviço, estabilidade e contexto comparável.'],
  },
  {
    capabilityId: 'organizational-system',
    title: 'Sistema organizacional',
    purpose: 'Fazer estrutura, liderança, incentivos, autoridade, carga e reação a erros habilitarem fluxo, responsabilidade e aprendizado em vez de exigir compensações locais.',
    assessmentBasis: 'behavior-and-effect-only',
    stages: [
      stage(0, 'Opaco', 'Decisões de prioridade, responsabilidade e mudança de estrutura não podem ser reconstruídas, e os efeitos entre unidades permanecem invisíveis.', 'Conflito, espera, sobrecarga e dependência são tratados como casos individuais sem evidência do sistema que os reproduz.', 'Sob pressão, decisões migram para relações informais e não existe condição explícita para revisar autoridade, incentivo ou distribuição de trabalho.'),
      stage(1, 'Reativo', 'Urgência, escalada, busca de culpado e coordenação por pessoas-chave substituem limites claros, capacidade protegida e aprendizagem com o sistema.', 'Sobrecarga, medo, multitarefa e filas entre grupos aumentam, enquanto resultados são substituídos por ocupação, prazo ou volume entregue.', 'Sob pressão, controle e aprovação aumentam depois da falha, pessoas ocultam risco e heróis são recompensados por sustentar o mesmo arranjo.'),
      stage(2, 'Repetível', 'Alguns times distribuem responsabilidade, limitam trabalho e aprendem sem culpa, mas essas condições dependem de lideranças ou contextos locais.', 'Resultados locais melhoram, porém prioridades conflitantes, serviços disputados e assimetrias de poder continuam limitando difusão e sustentabilidade.', 'Sob pressão, decisões voltam a centralizar, capacidade de melhoria é consumida e práticas saudáveis sobrevivem apenas por negociação local.'),
      stage(3, 'Gerenciado', 'Autoridade acompanha responsabilidade, prioridades limitam demanda, erros geram investigação do sistema e dependências possuem fronteiras e decisões explícitas.', 'Fluxo e bem-estar melhoram porque carga, espera e risco conseguem alterar capacidade, estrutura, política ou compromisso no nível adequado.', 'Sob pressão, liderança torna trade-offs visíveis, protege recuperação e melhoria e evita converter falha em culpa ou controle indiferenciado.'),
      stage(4, 'Adaptativo', 'Feedback sobre resultado, fluxo, carga, segurança e dependências modifica continuamente incentivos, autoridade, funding, estrutura e modos de interação.', 'O aprendizado organizacional reduz recorrência e permite que autonomia e responsabilidade cresçam sem deslocar risco ou sobrecarga entre fronteiras.', 'Sob pressão, decisões preservam segurança para expor risco, reequilibram capacidade e revisam o próprio sistema quando o efeito contradiz a intenção.'),
    ],
    evidenceRequired: ['Eventos recentes ligando decisão organizacional, comportamento local e consequência no fluxo ou nas pessoas.', 'Contraste entre quem observa, recomenda, decide e executa, preservado em agregações elegíveis.'],
    enablingConditions: ['Autoridade compatível com responsabilidade e mecanismo seguro de escalada.', 'Incentivos e capacidade que permitem reduzir demanda, aprender e alterar o sistema.'],
    regressionSignals: ['Falha volta a produzir busca de culpado, controle indiferenciado ou ocultação de risco.', 'Ocupação, volume e heroísmo voltam a prevalecer sobre resultado, fluxo e carga sustentável.'],
    compatiblePractices: ['Cultura generativa e aprendizagem sem culpa baseada em condições do sistema.', 'Limites de trabalho, ownership explícito e modos de interação adequados à dependência.'],
    optionalToolFamilies: ['Visualização de fluxo, carga, dependências e resultados.', 'Registro e acompanhamento de decisões, incidentes e experimentos organizacionais.'],
    interpretationLimits: ['O instrumento não diagnostica pessoa, personalidade ou liderança individual como tóxica.', 'Cultura não é causa terminal; precisa ser decomposta em comportamento, incentivo, poder, prioridade ou reação a erro.'],
  },
  {
    capabilityId: 'technical-capability',
    title: 'Competências necessárias entram no fluxo',
    purpose: 'Fazer o conhecimento necessário chegar ao trabalho real, permitir prática segura e distribuir capacidade de decisão e execução sem criar dependência permanente de especialistas.',
    assessmentBasis: 'behavior-and-effect-only',
    stages: [
      stage(0, 'Opaco', 'Não é possível reconstruir qual conhecimento uma mudança exigiu, quem conseguiu executar nem onde a decisão ficou bloqueada ou foi assumida sem domínio suficiente.', 'Ausência, concentração e impedimento organizacional parecem o mesmo problema, portanto investimento e risco não podem ser direcionados com segurança.', 'Sob pressão, o trabalho muda de responsável por relações informais e ninguém consegue explicar se faltou conhecimento, acesso, tempo ou autoridade.'),
      stage(1, 'Reativo', 'Conhecimento crítico está ausente ou concentrado em especialistas, fornecedores ou pessoas específicas que executam e corrigem o trabalho para preservar o prazo.', 'Filas, interrupções e decisões frágeis crescem; o restante do grupo observa ou tenta avançar sem retorno suficiente para assumir o próximo caso.', 'Sob pressão, o trabalho volta para quem já sabe, aprendizagem é adiada e heroísmo ou dependência externa preservam a concentração.'),
      stage(2, 'Repetível', 'Pessoas aprendem em casos reais por colaboração, exemplos ou tentativa, mas acesso, capacidade protegida e qualidade do retorno variam entre demandas e grupos.', 'Parte do conhecimento se espalha, porém mudanças de maior risco ainda dependem de poucas pessoas e a execução segura não se repete de modo previsível.', 'Sob pressão, pareamento e prática são cortados, revisão vira correção tardia e a pessoa experiente reassume a execução para cumprir o compromisso.'),
      stage(3, 'Gerenciado', 'Mais pessoas executam trabalho equivalente com limites, feedback e autonomia compatíveis; especialistas ampliam capacidade sem permanecer como etapa obrigatória do caso comum.', 'Espera e risco por concentração diminuem, enquanto erros, ajuda necessária e tempo até execução segura orientam o próximo investimento de aprendizagem.', 'Sob pressão, o grupo preserva revisão proporcional e distribuição do trabalho, ajustando escopo ou apoio sem retirar de forma permanente a oportunidade de praticar.'),
      stage(4, 'Adaptativo', 'Feedback sobre demanda futura, incidentes, dependências, tempo de ajuda e distribuição da execução modifica continuamente onde conhecimento, acesso e colaboração precisam evoluir.', 'A capacidade acompanha mudanças do produto e do sistema, reduz pontos únicos de conhecimento e permite assumir novos riscos sem depender de contratação ou treinamento em grande lote.', 'Sob pressão, lacunas emergentes tornam-se visíveis cedo, o apoio muda conforme o risco e o efeito observado realimenta a distribuição antes do próximo trabalho equivalente.'),
    ],
    evidenceRequired: ['Um trabalho recente que exigiu conhecimento novo ou concentrado, com responsáveis, ajuda, acesso, decisão e execução reconstruídos.', 'Uma demanda equivalente posterior mostrando quem conseguiu executar, com qual segurança, tempo, correção e dependência.'],
    enablingConditions: ['Capacidade protegida e trabalho real em que aprender, praticar e receber retorno.', 'Acesso, autoridade e limites seguros compatíveis com a responsabilidade que se pretende distribuir.'],
    regressionSignals: ['Demandas voltam automaticamente para a pessoa mais experiente quando prazo ou risco aumentam.', 'Presença, conhecimento declarado ou material produzido substituem evidência de execução segura por mais pessoas.'],
    compatiblePractices: ['Aprendizagem deliberada no fluxo por pareamento, mentoria, revisão e rotação com contexto.', 'Comunidades de prática e caminhos de desenvolvimento ligados a demandas e efeitos observáveis.'],
    optionalToolFamilies: ['Ambientes de aprendizagem, laboratórios e feedback técnico seguro.', 'Mapeamento de conhecimento, documentação executável e descoberta de especialistas.'],
    interpretationLimits: ['Cargo, curso, certificação, matriz de competência ou quantidade de especialistas não produzem estágio por presença.', 'Baixa distribuição não prova falta individual: acesso, carga, política, autoridade e oportunidade de prática precisam ser discriminados.'],
  },
  {
    capabilityId: 'software-security',
    title: 'Risco muda o caminho da entrega',
    purpose: 'Tornar riscos relevantes observáveis cedo o bastante para mudar desenho, escopo, proteção ou liberação, preservando decisão proporcional e aprendizagem após exceções e falhas.',
    assessmentBasis: 'behavior-and-effect-only',
    stages: [
      stage(0, 'Opaco', 'Não é possível reconstruir qual risco uma mudança introduziu, quais evidências foram consideradas, quem decidiu aceitá-lo ou que proteção chegou ao uso real.', 'Registros, aprovações e incidentes não podem ser ligados à decisão, portanto conformidade aparente não demonstra redução nem conhecimento do risco.', 'Sob pressão, mudanças e acessos seguem por caminhos informais e nenhuma pessoa consegue explicar qual risco foi aceito ou como seria percebido.'),
      stage(1, 'Reativo', 'Risco recebe atenção depois da implementação, perto da liberação ou após incidente, geralmente quando uma pessoa reconhece o tema e aciona um especialista.', 'Achados provocam retrabalho tardio, correção apenas do caso visível ou aceite sem proteção verificável, enquanto riscos semelhantes permanecem desconhecidos.', 'Sob pressão, revisão é ignorada, transferida para depois ou convertida em exceção sem condição clara de retorno, responsável e validade.'),
      stage(2, 'Repetível', 'Verificações comuns e orientações cobrem parte das mudanças, mas julgamento de contexto, tratamento de alertas e participação especializada ainda variam entre grupos.', 'Alguns riscos recebem retorno cedo, porém listas e resultados técnicos nem sempre alteram desenho, escopo ou decisão e exceções tendem a acumular.', 'Sob pressão, a evidência vira etapa de aprovação, alertas são priorizados pelo prazo e aceites temporários são renovados sem verificar mudança do risco.'),
      stage(3, 'Gerenciado', 'Impacto, dado, ameaça e reversibilidade definem proteção proporcional; riscos relevantes mudam desenho ou liberação e exceções possuem evidência, responsável, validade e contenção.', 'O caso comum recebe retorno durante o trabalho, especialistas julgam exceções e a proteção confirmada reduz retrabalho sem criar a mesma fila para todo risco.', 'Sob pressão, o grupo preserva controles essenciais e decisão rastreável, reduz escopo quando necessário e reconcilia exceções dentro do horizonte assumido.'),
      stage(4, 'Adaptativo', 'Feedback de incidentes, escapes, falsos alertas, exceções e efeito sobre o fluxo modifica continuamente ameaças consideradas, proteções e limites de decisão.', 'A organização reduz recorrência e exposição sem aumentar controle indiferenciado, distribuindo capacidade de decisão à medida que evidência e contexto evoluem.', 'Sob pressão, risco e impacto continuam alterando o caminho; qualquer simplificação é observada e realimenta a proteção antes de uma mudança equivalente.'),
    ],
    evidenceRequired: ['Uma mudança recente em que um risco foi reconhecido, avaliado e ligado a uma decisão de desenho, escopo, proteção, exceção ou liberação.', 'Uma consequência observada da decisão e o tratamento posterior de escape, alerta, exceção ou risco equivalente.'],
    enablingConditions: ['Retorno de segurança durante o trabalho, com risco e evidência compreensíveis para quem decide a mudança.', 'Autoridade e competência distribuídas para tratar casos comuns, com julgamento especializado acessível para exceções.'],
    regressionSignals: ['Revisão volta a ocorrer apenas perto da liberação ou depois de incidente.', 'Quantidade de verificações, aprovações ou auditorias volta a substituir evidência de decisão e eficácia.'],
    compatiblePractices: ['Modelagem de ameaças proporcional e segurança integrada ao desenho e à mudança.', 'Proteção contínua com gestão explícita de exceções, aprendizado de escapes e revisão de eficácia.'],
    optionalToolFamilies: ['Análise de código, dependências, artefatos, segredos e configuração.', 'Gestão de vulnerabilidades, políticas executáveis, evidência, exceções e monitoramento de risco.'],
    interpretationLimits: ['SAST, scanner, checklist, certificação ou time especializado não produzem estágio por presença.', 'Segregação de responsabilidade e obrigação legítima não são fragilidade quando risco, evidência, decisão e efeito permanecem proporcionais e verificáveis.'],
  },
  {
    capabilityId: 'evolvability',
    title: 'Evolutibilidade',
    purpose: 'Permitir que mudanças frequentes permaneçam pequenas, seguras e compreensíveis, ajustando limites e contratos quando coordenação, espera ou risco crescem de forma recorrente.',
    assessmentBasis: 'behavior-and-effect-only',
    stages: [
      stage(0, 'Opaco', 'Não é possível reconstruir quais partes e responsáveis uma mudança atravessou, por que precisaram mudar juntos ou qual custo reapareceu no caso seguinte.', 'Acoplamento, desconhecimento e bloqueio organizacional ficam indistintos, impedindo escolher entre aprender, ajustar contrato, mudar limite ou remover dependência.', 'Sob pressão, o grupo segue relações e sequências informais sem conseguir explicar impacto, responsabilidade ou condição para revisar o desenho.'),
      stage(1, 'Reativo', 'Mudanças comuns exigem coordenação manual, conhecimento de poucas pessoas, contornos locais ou espera por uma iniciativa arquitetural de grande porte.', 'Lotes, conflitos e retrabalho crescem; cada nova necessidade absorve o custo da estrutura existente sem reduzir a próxima coordenação equivalente.', 'Sob pressão, mais reuniões, calendário e responsáveis compensam o acoplamento, ou o time contorna a fronteira e transfere custo para mudanças futuras.'),
      stage(2, 'Repetível', 'Alguns limites, contratos e verificações permitem mudanças locais, mas a autonomia varia e dependências relevantes ainda exigem alinhamento ou intervenção entre grupos.', 'Parte do fluxo melhora, enquanto áreas críticas continuam acumulando coordenação e iniciativas estruturais competem com entregas sem efeito comparado.', 'Sob pressão, o caminho volta à coordenação conhecida, a simplificação é adiada e exceções locais permanecem sem alterar o limite compartilhado.'),
      stage(3, 'Gerenciado', 'Impacto e custo de coordenação são observáveis; grupos testam limites ou contratos menores e verificam na mudança seguinte se partes, esperas e responsáveis diminuíram.', 'Mudanças frequentes permanecem menores, responsabilidades ficam claras e risco pode ser isolado sem depender de sincronização excepcional entre unidades.', 'Sob pressão, o grupo preserva contratos verificáveis e mudanças reversíveis, reduzindo escopo ou explicitando exceção em vez de ampliar silenciosamente o lote.'),
      stage(4, 'Adaptativo', 'Feedback sobre tempo de mudança, conflitos, falhas, contornos e carga entre grupos modifica continuamente limites, contratos e distribuição de responsabilidade.', 'O sistema reduz o custo da mudança seguinte e evolui sua estrutura sem programas permanentes de reescrita, coordenação ou padronização indiferenciada.', 'Sob pressão, decisões locais preservam impacto observável e qualquer coordenação extraordinária realimenta o desenho antes do próximo caso equivalente.'),
    ],
    evidenceRequired: ['Uma mudança recente reconstruída através de partes, contratos, responsáveis, esperas, conflitos e decisões de risco.', 'Uma mudança equivalente posterior mostrando se coordenação, contorno, retrabalho e quantidade de partes realmente mudaram.'],
    enablingConditions: ['Ownership e impacto arquitetural visíveis no fluxo de mudança, não apenas em documentação separada.', 'Capacidade e autoridade para testar limites ou contratos menores e revisar a decisão pelo efeito.'],
    regressionSignals: ['Reuniões, calendário ou um coordenador voltam a ser a principal forma de tornar a mudança segura.', 'Contornos e projetos futuros se acumulam sem reduzir o custo observado na mudança seguinte.'],
    compatiblePractices: ['Arquitetura evolutiva com decisões reversíveis e comparação explícita do custo de mudança.', 'Mapeamento de dependências, contratos verificáveis e modelagem colaborativa de limites de domínio.'],
    optionalToolFamilies: ['Mapeamento arquitetural, dependências, ownership e impacto de mudança.', 'Verificação de contratos, compatibilidade, observabilidade de fluxo e registros de decisão.'],
    interpretationLimits: ['DDD, microsserviços, arquitetura formal, TOGAF, diagrama ou documentação não produzem estágio por presença.', 'Monólito ou tecnologia antiga não reduzem estágio quando mudanças permanecem pequenas, seguras e capazes de adaptar limites pelo efeito.'],
  },
  {
    capabilityId: 'organizational-learning',
    title: 'Aprendizado e adaptação',
    purpose: 'Transformar eventos, falhas e experimentos em mudanças verificáveis no trabalho e no sistema, preservando autoria, capacidade e revisão do efeito no caso seguinte.',
    assessmentBasis: 'behavior-and-effect-only',
    stages: [
      stage(0, 'Opaco', 'Não é possível reconstruir qual evento provocou uma tentativa de melhoria, quem decidiu a mudança, que efeito era esperado ou se o tema voltou à decisão.', 'Registro, intenção e resultado permanecem desconectados, impedindo distinguir ausência de ação, bloqueio externo, perda de prioridade ou efeito contrário.', 'Sob pressão, decisões e contornos desaparecem em conversas informais e não existe condição explícita para revisar a interpretação.'),
      stage(1, 'Reativo', 'Mudanças surgem após crise ou cobrança, geram muitas ações sem foco ou apenas orientação para reagir melhor, sem retorno consistente ao problema equivalente.', 'O sistema repete o comportamento e acumula pendências; esforço local pode aliviar o caso sem alterar as condições que o reproduzem.', 'Sob pressão, toda capacidade retorna à entrega urgente, responsáveis somem e a melhoria reaparece somente depois de nova falha ou escalada.'),
      stage(2, 'Repetível', 'Alguns grupos escolhem mudanças pequenas e verificam resultados, mas fechamento, capacidade e poder para alterar causas sistêmicas variam conforme liderança e contexto.', 'Há aprendizado local demonstrável, enquanto ações que atravessam fronteiras perdem prioridade ou permanecem como compensações sem difusão.', 'Sob pressão, revisão de efeito é adiada, a prática virtuosa fica dependente de pessoas e o grupo mantém contornos por não conseguir mudar o sistema.'),
      stage(3, 'Gerenciado', 'Poucas mudanças possuem responsável, capacidade, efeito esperado e revisão no evento seguinte; bloqueios externos são escalados com autoridade e decisão explícitas.', 'A organização mantém, ajusta ou desfaz ações conforme o efeito e distingue melhoria ineficaz de melhoria válida impedida pelo sistema.', 'Sob pressão, liderança protege correção e aprendizagem, limita novas ações e torna explícito qual compromisso ou política precisa mudar para fechar o ciclo.'),
      stage(4, 'Adaptativo', 'Feedback de resultados, fluxo, risco, carga e recorrência modifica continuamente práticas, prioridades, políticas e capacidades no nível capaz de remover a restrição.', 'O sistema reduz recorrência e difunde aprendizagem útil sem transformar todo evento em padronização, controle adicional ou programa de mudança em grande lote.', 'Sob pressão, o efeito continua sendo revisto, sinais contrários podem desfazer a intervenção e o aprendizado altera o sistema antes do próximo caso equivalente.'),
    ],
    evidenceRequired: ['Um evento recente ligado a uma mudança escolhida, responsável, capacidade, efeito esperado e decisão posterior.', 'O evento equivalente seguinte ou evidência contrária mostrando manutenção, ajuste, reversão, bloqueio ou ausência de efeito.'],
    enablingConditions: ['Capacidade protegida para melhorar o sistema junto ao trabalho de entrega e operação.', 'Autoridade ou escalada efetiva para tratar restrições além da autonomia do grupo observador.'],
    regressionSignals: ['A conversa volta a gerar listas extensas sem responsável, prioridade, efeito ou encerramento.', 'Registro e comunicação substituem verificação no caso seguinte, enquanto a recorrência permanece sem alterar decisões.'],
    compatiblePractices: ['Revisão de eventos e melhoria contínua com poucas hipóteses, ownership e ciclo de efeito fechado.', 'Experimentos organizacionais reversíveis, aprendizagem sem culpa e difusão condicionada ao contexto.'],
    optionalToolFamilies: ['Registro de decisões, experimentos, ações e evidências de efeito.', 'Análise de fluxo, incidentes, recorrência, carga e aprendizagem compartilhada.'],
    interpretationLimits: ['Retrospectiva, post-mortem, treinamento, repositório ou comunidade não produzem estágio por presença.', 'Ação local bloqueada por prioridade, política ou autoridade não prova incapacidade do grupo; contenção e poder de decisão precisam ser discriminados.'],
  },
  {
    capabilityId: 'team-ownership',
    title: 'Estrutura e ownership',
    purpose: 'Fazer responsabilidade pelo resultado vir acompanhada de autoridade, capacidade e fronteiras compreensíveis, reduzindo espera e coordenação sem concentrar risco em pessoas específicas.',
    assessmentBasis: 'behavior-and-effect-only',
    stages: [
      stage(0, 'Opaco', 'Não é possível reconstruir quem podia decidir prioridade, risco e mudança de um serviço nem onde a responsabilidade terminava quando apareceu impacto.', 'Ajuda pontual, responsabilidade formal e autoridade real ficam indistintas, impedindo localizar quem pode remover espera, conflito ou risco.', 'Sob pressão, o caso circula por relações informais e nenhuma pessoa consegue explicar quem decide, executa e responde pela consequência completa.'),
      stage(1, 'Reativo', 'Responsabilidade é fragmentada entre áreas, depende de uma pessoa ou exige coordenação e escalada a cada ocorrência para formar uma decisão completa.', 'Trabalho espera, especialistas acumulam interrupções e decisões locais transferem risco para operação, dados, produto ou outro grupo sem responsável pelo todo.', 'Sob pressão, a pessoa mais experiente assume, a liderança coordena os envolvidos ou cada parte protege sua própria prioridade para concluir o caso.'),
      stage(2, 'Repetível', 'Alguns serviços possuem grupos capazes de conduzir mudanças e incidentes, mas fronteiras, prioridades compartilhadas e autoridade variam conforme contexto e relacionamento.', 'Casos conhecidos fluem, enquanto superfícies compartilhadas e dependências ainda exigem alinhamento manual, contornos ou apoio recorrente.', 'Sob pressão, responsabilidade volta a se concentrar, decisões atravessam escaladas e fronteiras saudáveis dependem da negociação local.'),
      stage(3, 'Gerenciado', 'Responsabilidade pelo resultado possui autoridade ponta a ponta para prioridade, risco, mudança e acompanhamento, com interações explícitas onde a fronteira é compartilhada.', 'Espera e conflito diminuem porque decisões comuns ocorrem no grupo responsável e dependências devolvem um resultado claro sem apagar responsabilidades entre partes.', 'Sob pressão, autoridade e limites permanecem claros, carga pode alterar compromisso e colaboração temporária não transforma especialistas em donos permanentes.'),
      stage(4, 'Adaptativo', 'Feedback sobre fluxo, carga, incidentes, conflitos e resultado modifica fronteiras, autoridade e modos de interação com participação das pessoas afetadas.', 'A estrutura reduz coordenação e pontos únicos sem criar silos, permitindo que responsabilidade acompanhe a evolução do produto e do sistema.', 'Sob pressão, mudanças de carga ou dependência tornam-se visíveis cedo e ajustam capacidade ou fronteira antes de reforçar heroísmo e escalada.'),
    ],
    evidenceRequired: ['Um evento recente reconstruindo quem observou, decidiu prioridade e risco, executou a mudança e respondeu pelo resultado.', 'Uma ocorrência equivalente posterior mostrando espera, conflito, carga, escalada e continuidade sem pessoas específicas.'],
    enablingConditions: ['Autoridade e capacidade compatíveis com a responsabilidade atribuída pelo resultado.', 'Fronteiras e modos de interação explícitos, revisáveis e observáveis no trabalho real.'],
    regressionSignals: ['Decisões comuns voltam a exigir escalada, calendário ou uma pessoa coordenadora para reunir responsabilidade fragmentada.', 'Ausência ou pressão devolve trabalho à pessoa especialista e interrompe continuidade, aprendizagem ou resposta pelo resultado.'],
    compatiblePractices: ['Ownership de serviço ou produto ponta a ponta com limites e consequências observáveis.', 'Revisão de fronteiras, carga cognitiva e modos de interação orientada por fluxo e resultado.'],
    optionalToolFamilies: ['Mapeamento de serviços, ownership, dependências e fluxo de trabalho.', 'Catálogos, registros de decisão, carga, incidentes e resultados por serviço.'],
    interpretationLimits: ['Nome do time, owner declarado, matriz RACI ou modelo Team Topologies não produzem estágio por presença.', 'Responsabilidade compartilhada não é fragilidade quando autoridade, decisão e consequência entre as partes são explícitas e sustentáveis.'],
  },
  {
    capabilityId: 'enabling-governance',
    title: 'Governança habilitadora',
    purpose: 'Fazer obrigações e riscos alterarem decisões por evidência proporcional, preservando autonomia segura, retorno no fluxo e revisão contínua da eficácia e do custo dos controles.',
    assessmentBasis: 'behavior-and-effect-only',
    stages: [
      stage(0, 'Opaco', 'Não é possível reconstruir qual risco ou obrigação originou o controle, que evidência foi examinada, quem podia decidir ou qual consequência deveria ser evitada.', 'Cumprimento, espera e redução de risco permanecem indistintos, impedindo avaliar se a etapa protege o sistema ou apenas transfere responsabilidade.', 'Sob pressão, decisões circulam por relações e exceções informais sem trilha suficiente para explicar o risco aceito, mitigado ou deslocado.'),
      stage(1, 'Reativo', 'Aprovações indiferenciadas, filas e escaladas relacionais tratam casos distintos pelo mesmo caminho, normalmente sem evidência capaz de mudar a decisão.', 'O trabalho espera ou cria contornos, enquanto especialistas concentram responsabilidade formal sem contexto, capacidade ou retorno sobre a consequência real.', 'Sob pressão, urgência pessoal acelera a fila, controles são ignorados ou novas etapas são adicionadas depois da falha sem rever as anteriores.'),
      stage(2, 'Repetível', 'Alguns riscos possuem critérios e caminhos conhecidos, mas proporcionalidade, autonomia, exceções e qualidade da evidência ainda variam entre grupos e situações.', 'Casos comuns avançam com menos espera, enquanto decisões ambíguas retornam à aprovação manual ou acumulam aceites temporários sem tratamento sustentado.', 'Sob pressão, a classificação perde efeito, a exceção se prolonga ou a segurança volta a depender da disponibilidade e confiança de pessoas específicas.'),
      stage(3, 'Gerenciado', 'Risco, impacto e reversibilidade determinam proteção proporcional; evidência confiável devolve decisão no fluxo e permite autonomia dentro de limites verificáveis.', 'Obrigações legítimas preservam separação de responsabilidade e rastreabilidade, enquanto casos comuns deixam de esperar por julgamento que não mudaria seu resultado.', 'Sob pressão, exceções possuem autoridade, validade, proteção compensatória e reconciliação explícitas, sem ocultar nem transferir o risco para outra etapa.'),
      stage(4, 'Adaptativo', 'Feedback sobre efeito no risco, espera, falhas, exceções e contornos modifica critérios, proteções e limites, incluindo retirar controles que não demonstram eficácia.', 'O sistema melhora simultaneamente segurança e fluxo, reduz compensações por baixa confiança e amplia autonomia segura conforme a evidência operacional se fortalece.', 'Sob pressão, a decisão continua proporcional e verificável; sinais contrários ajustam rapidamente proteção e autoridade antes que a exceção vire o novo caminho normal.'),
    ],
    evidenceRequired: ['Uma decisão recente reconstruída do risco ou obrigação até a evidência examinada, autoridade, espera, exceção e consequência.', 'Um caso posterior ou sinal contrário mostrando se o controle foi mantido, alterado, automatizado, simplificado ou retirado pelo efeito.'],
    enablingConditions: ['Critérios de risco, responsabilidade e evidência compreensíveis por quem solicita e por quem decide.', 'Feedback técnico confiável e limites executáveis que permitam decidir casos comuns no próprio fluxo.'],
    regressionSignals: ['O mesmo caminho volta a tratar riscos diferentes e a principal evidência passa a ser concluir a etapa ou registrar o aceite.', 'Exceções, revisões e aprovações se acumulam sem prazo, reconciliação ou comparação entre redução de risco e espera criada.'],
    compatiblePractices: ['Governança baseada em risco com controles proporcionais, automatizáveis e decisão explícita sobre exceções.', 'Revisão de eficácia do controle e de seu custo no fluxo, com autonomia segura dentro de limites observáveis.'],
    optionalToolFamilies: ['Políticas executáveis, trilhas de decisão, evidência de controle e gestão de exceções.', 'Telemetria de risco, fluxo, identidade, conformidade, falhas e eficácia de proteções.'],
    interpretationLimits: ['Comitê, política, auditoria, certificação ou ferramenta de policy não produzem estágio por presença.', 'Obrigação, segregação ou revisão independente legítima não penaliza o estágio quando risco, evidência, autoridade e efeito são proporcionais e verificáveis.'],
  },
];

export const capabilityReferenceCatalog: Readonly<Record<string, CapabilityReference>> = Object.freeze(Object.fromEntries(
  definitions.map((definition) => {
    const reference = CapabilityReference.create(definition);
    return [reference.capabilityId, reference];
  }),
));

function freezeText(items: string[]): readonly string[] {
  return Object.freeze(items.map((item) => item.trim()));
}
