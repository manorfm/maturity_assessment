import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CapabilityReference,
  capabilityReferenceCatalog,
  capabilityReferenceVersion,
} from '../src/modules/inference/domain/capability-reference.js';
import { DomainValidationError } from '../src/shared/errors.js';

const initialCapabilities = [
  'discovery-validation',
  'sdlc-automation',
  'platform-autonomy',
  'release-feedback',
  'organizational-system',
  'technical-capability',
  'software-security',
  'evolvability',
  'organizational-learning',
  'team-ownership',
  'enabling-governance',
  'leadership-management',
  'collaboration',
  'product-direction',
  'portfolio-management',
  'work-management',
  'planning-refinement',
  'continuous-integration',
  'sustainable-design',
  'quality-strategy',
  'domain-alignment',
];

test('catálogo publica vinte e uma referências comportamentais versionadas', () => {
  assert.equal(capabilityReferenceVersion, 'capability-reference-v18');
  assert.deepEqual(Object.keys(capabilityReferenceCatalog), initialCapabilities);

  for (const capabilityId of initialCapabilities) {
    const reference = capabilityReferenceCatalog[capabilityId]!;
    assert.equal(reference.capabilityId, capabilityId);
    assert.equal(reference.assessmentBasis, 'behavior-and-effect-only');
    assert.deepEqual(reference.stages.map((stage) => stage.level), [0, 1, 2, 3, 4]);
    assert.ok(reference.purpose.length >= 60, capabilityId);
    assert.ok(reference.evidenceRequired.length >= 2, capabilityId);
    assert.ok(reference.enablingConditions.length >= 2, capabilityId);
    assert.ok(reference.regressionSignals.length >= 2, capabilityId);
    assert.ok(reference.interpretationLimits.length >= 2, capabilityId);
    for (const stage of reference.stages) {
      assert.ok(stage.behavior.length >= 50, `${capabilityId}/${stage.level}/behavior`);
      assert.ok(stage.effect.length >= 40, `${capabilityId}/${stage.level}/effect`);
      assert.ok(stage.underPressure.length >= 40, `${capabilityId}/${stage.level}/underPressure`);
    }
  }
});

test('alinhamento ao domínio mede significado na mudança, não vocabulário nominal', () => {
  const reference = capabilityReferenceCatalog['domain-alignment'];
  assert.ok(reference);
  assert.match(reference.stage(1).behavior, /termo|significado|conflito|glossário|ownership|especialista/i);
  assert.match(reference.stage(3).behavior, /linguagem|limite|respons|mudança|exemplo/i);
  assert.match(`${reference.stage(4).behavior} ${reference.stage(4).effect}`, /feedback|mudança seguinte|conflito|custo|aprend/i);
  assert.doesNotMatch(reference.stages.map((item) => `${item.behavior} ${item.effect}`).join(' '), /DDD|bounded context|event storming|EventStorming|Ubiquitous Language/i);
  assert.ok(reference.interpretationLimits.some((item) => /DDD|bounded context|event storming|glossário|diagrama|ferramenta/i.test(item)));
  assert.ok(reference.interpretationLimits.some((item) => /divergência|desacordo|fronteira|tradução/i.test(item)));
});

test('estratégia de qualidade mede proteção proporcional, não volume de testes', () => {
  const reference = capabilityReferenceCatalog['quality-strategy'];
  assert.ok(reference);
  assert.match(reference.stage(1).behavior, /QA|etapa|memória|regressão|checklist/i);
  assert.match(reference.stage(3).behavior, /risco|impacto|exemplo|feedback|respons/i);
  assert.match(`${reference.stage(4).behavior} ${reference.stage(4).effect}`, /escape|incidente|resultado|estratégia|aprend/i);
  assert.doesNotMatch(reference.stages.map((item) => `${item.behavior} ${item.effect}`).join(' '), /shift-left|pirâmide de testes|Sonar|Selenium/i);
  assert.ok(reference.interpretationLimits.some((item) => /cobertura|suíte|scanner|ferramenta|quantidade/i.test(item)));
  assert.ok(reference.interpretationLimits.some((item) => /QA|especialista|etapa/i.test(item)));
});

test('design sustentável mede custo da mudança seguinte, não estilo arquitetural', () => {
  const reference = capabilityReferenceCatalog['sustainable-design'];
  assert.ok(reference);
  assert.match(reference.stage(1).behavior, /contorno|especialista|tentativa|reescrita|dívida/i);
  assert.match(reference.stage(3).behavior, /pequen|segur|test|revers|mudança/i);
  assert.match(`${reference.stage(4).behavior} ${reference.stage(4).effect}`, /feedback|defeito|custo|mudança seguinte|aprend/i);
  assert.doesNotMatch(reference.stages.map((item) => `${item.behavior} ${item.effect}`).join(' '), /SOLID|Clean Architecture|hexagonal|microsserviço/i);
  assert.ok(reference.interpretationLimits.some((item) => /SOLID|Clean Architecture|padrão|linguagem|ferramenta/i.test(item)));
  assert.ok(reference.interpretationLimits.some((item) => /antiga|legado|idade|tecnologia/i.test(item)));
});

test('integração contínua mede composição e correção, não branch ou ferramenta', () => {
  const reference = capabilityReferenceCatalog['continuous-integration'];
  assert.ok(reference);
  assert.match(reference.stage(1).behavior, /isolad|conflito|janela|acumul/i);
  assert.match(reference.stage(3).behavior, /pequen|compartilh|feedback|corrig/i);
  assert.match(`${reference.stage(4).behavior} ${reference.stage(4).effect}`, /feedback|falha|tempo|mudança seguinte|aprend/i);
  assert.doesNotMatch(reference.stages.map((item) => `${item.behavior} ${item.effect}`).join(' '), /GitHub|GitLab|Jenkins|trunk-based|pull request/i);
  assert.ok(reference.interpretationLimits.some((item) => /Git|branch|pipeline|servidor|ferramenta/i.test(item)));
});

test('planejamento e refinamento reduzem incerteza sem fingir definição completa', () => {
  const reference = capabilityReferenceCatalog['planning-refinement'];
  assert.ok(reference);
  assert.match(reference.stage(1).behavior, /critério|risco|dependência|solução|compromisso/i);
  assert.match(reference.stage(3).behavior, /problema|exemplo|risco|dependência|revers/i);
  assert.match(`${reference.stage(4).behavior} ${reference.stage(4).effect}`, /feedback|incerteza|resultado|retrabalho|aprend/i);
  assert.doesNotMatch(reference.stages.map((item) => `${item.behavior} ${item.effect}`).join(' '), /Scrum|SAFe|Jira|sprint planning|story points/i);
  assert.ok(reference.interpretationLimits.some((item) => /backlog|refinement|estimativa|cerimônia|ferramenta/i.test(item)));
  assert.ok(reference.interpretationLimits.some((item) => /incerteza|definição completa|antecip/i.test(item)));
});

test('gestão do trabalho mede conclusão e espera, não ocupação ou método', () => {
  const reference = capabilityReferenceCatalog['work-management'];
  assert.ok(reference);
  assert.match(reference.stage(1).behavior, /ocupação|inicia|espera|bloqueio|fila/i);
  assert.match(reference.stage(3).behavior, /limite|concluir|bloqueio|compromisso|fluxo/i);
  assert.match(`${reference.stage(4).behavior} ${reference.stage(4).effect}`, /feedback|tempo|espera|resultado|fluxo/i);
  assert.doesNotMatch(reference.stages.map((item) => `${item.behavior} ${item.effect}`).join(' '), /Kanban|Scrum|Jira|sprint/i);
  assert.ok(reference.interpretationLimits.some((item) => /quadro|sprint|método|ferramenta/i.test(item)));
});

test('portfólio exige escolhas de capacidade e interrupção, não uma fila priorizada', () => {
  const reference = capabilityReferenceCatalog['portfolio-management'];
  assert.ok(reference);
  assert.match(reference.stage(1).behavior, /paralel|patroc|fila|iniciativa|urgência/i);
  assert.match(reference.stage(3).behavior, /capacidade|custo de atraso|interromp|trade-off|investimento/i);
  assert.match(`${reference.stage(4).behavior} ${reference.stage(4).effect}`, /feedback|resultado|investimento|capacidade|interromp/i);
  assert.doesNotMatch(reference.stages.map((item) => `${item.behavior} ${item.effect}`).join(' '), /PMO|OKR|Jira|SAFe/i);
  assert.ok(reference.interpretationLimits.some((item) => /PMO|comitê|orçamento|OKR|ferramenta/i.test(item)));
});

test('direção de produto exige autoridade para rever investimento pelo resultado', () => {
  const reference = capabilityReferenceCatalog['product-direction'];
  assert.ok(reference);
  assert.match(reference.stage(1).behavior, /solução|prazo|escopo|urgência|pedido/i);
  assert.match(reference.stage(3).behavior, /problema|resultado|prioridade|investimento|decis/i);
  assert.match(`${reference.stage(4).behavior} ${reference.stage(4).effect}`, /feedback|efeito|resultado|investimento|interromp/i);
  assert.doesNotMatch(reference.stages.map((item) => `${item.behavior} ${item.effect}`).join(' '), /OKR|roadmap|product manager|Scrum/i);
  assert.ok(reference.interpretationLimits.some((item) => /OKR|roadmap|cargo|cerimônia/i.test(item)));
});

test('colaboração resolve dependência e transfere capacidade, não premia proximidade', () => {
  const reference = capabilityReferenceCatalog.collaboration;
  assert.ok(reference);
  assert.match(reference.stage(1).behavior, /handoff|escal|coordena|fila/i);
  assert.match(reference.stage(3).behavior, /decis|contexto|explícit|capacidade/i);
  assert.match(`${reference.stage(4).behavior} ${reference.stage(4).effect}`, /feedback|efeito|trabalho seguinte|dependência|aprend/i);
  assert.doesNotMatch(reference.stages.map((item) => `${item.behavior} ${item.effect}`).join(' '), /Slack|Microsoft Teams|Team Topologies|daily/i);
  assert.ok(reference.interpretationLimits.some((item) => /ferramenta|reunião|cerimônia|proximidade/i.test(item)));
  assert.ok(reference.interpretationLimits.some((item) => /conflito|divergência|variação/i.test(item)));
});

test('liderança é avaliada pelas decisões sobre restrições, não pelo cargo', () => {
  const reference = capabilityReferenceCatalog['leadership-management'];
  assert.ok(reference);
  assert.match(reference.stage(1).behavior, /culpa|pressão|ocupação|centraliz|prazo/i);
  assert.match(reference.stage(3).behavior, /risco|carga|capacidade|restriç|decis/i);
  assert.match(`${reference.stage(4).behavior} ${reference.stage(4).effect}`, /feedback|efeito|resultado|aprend|incentivo/i);
  assert.doesNotMatch(reference.stages.map((item) => `${item.behavior} ${item.effect}`).join(' '), /one-on-one|Tuckman|transformacional|servant leadership/i);
  assert.ok(reference.interpretationLimits.some((item) => /cargo|one-on-one|modelo|cerimônia/i.test(item)));
  assert.ok(reference.interpretationLimits.some((item) => /indivíduo|pessoa|cultura|sistema/i.test(item)));
});

test('governança distingue risco e efeito sem premiar controle nominal', () => {
  const reference = capabilityReferenceCatalog['enabling-governance'];
  assert.ok(reference);
  assert.match(reference.stage(1).behavior, /aprovaç|fila|relacion|indiferenci/i);
  assert.match(reference.stage(3).behavior, /risco|evidência|proporcional|autonomia/i);
  assert.match(`${reference.stage(4).behavior} ${reference.stage(4).effect}`, /efeito|feedback|risco|espera|exceç/i);
  assert.doesNotMatch(reference.stages.map((item) => `${item.behavior} ${item.effect}`).join(' '), /comitê|auditoria|policy as code/i);
  assert.ok(reference.interpretationLimits.some((item) => /comitê|política|auditoria|ferramenta/i.test(item)));
  assert.ok(reference.interpretationLimits.some((item) => /obrigaç|segregaç|independente/i.test(item)));
});

test('ownership exige autoridade e consequência, não declaração de estrutura', () => {
  const reference = capabilityReferenceCatalog['team-ownership'];
  assert.ok(reference);
  assert.match(reference.stage(1).behavior, /pessoa|escal|fragment|coordena/i);
  assert.match(reference.stage(3).behavior, /autoridade|responsabilidade|ponta a ponta/i);
  assert.match(`${reference.stage(4).behavior} ${reference.stage(4).effect}`, /feedback|efeito|carga|fronteira/i);
  assert.doesNotMatch(reference.stages.map((item) => `${item.behavior} ${item.effect}`).join(' '), /RACI|Team Topologies|stream-aligned/i);
  assert.ok(reference.interpretationLimits.some((item) => /RACI|Team Topologies|owner|nome do time/i.test(item)));
});

test('aprendizado organizacional exige efeito revisto no evento seguinte', () => {
  const reference = capabilityReferenceCatalog['organizational-learning'];
  assert.ok(reference);
  assert.match(reference.stage(1).behavior, /crise|aç[oõ]es|reativ/i);
  assert.match(reference.stage(3).behavior, /efeito|evento seguinte|revis/i);
  assert.match(`${reference.stage(4).behavior} ${reference.stage(4).effect}`, /feedback|aprend|sistema/i);
  assert.doesNotMatch(reference.stages.map((item) => `${item.behavior} ${item.effect}`).join(' '), /retrospectiva|post-mortem|treinamento|repositório/i);
  assert.ok(reference.interpretationLimits.some((item) => /retrospectiva|post-mortem|treinamento|repositório/i.test(item)));
});

test('evolutibilidade é avaliada pelo custo da mudança seguinte, não pelo estilo arquitetural', () => {
  const reference = capabilityReferenceCatalog.evolvability;
  assert.ok(reference);
  assert.match(reference.stage(1).behavior, /coorden|contorno|grande/i);
  assert.match(reference.stage(3).behavior, /limite|contrato|mudança/i);
  assert.match(`${reference.stage(4).behavior} ${reference.stage(4).effect}`, /feedback|efeito|aprend|mudança seguinte/i);
  assert.doesNotMatch(reference.stages.map((item) => `${item.behavior} ${item.effect}`).join(' '), /DDD|microsserviç|TOGAF/i);
  assert.ok(reference.interpretationLimits.some((item) => /DDD|microsserviç|arquitetura|documentaç/i.test(item)));
});

test('segurança é avaliada pela decisão sobre risco, não pela presença de controle', () => {
  const reference = capabilityReferenceCatalog['software-security'];
  assert.ok(reference);
  assert.match(reference.stage(1).behavior, /tardi|incidente|especialista/i);
  assert.match(reference.stage(3).behavior, /risco|desenho|decis[aã]o/i);
  assert.match(`${reference.stage(4).behavior} ${reference.stage(4).effect}`, /feedback|efeito|aprend|exceç/i);
  assert.doesNotMatch(reference.stages.map((item) => `${item.behavior} ${item.effect}`).join(' '), /SAST|scanner|checklist|AppSec/i);
  assert.ok(reference.interpretationLimits.some((item) => /SAST|scanner|checklist|especialista/i.test(item)));
});

test('competência é avaliada pelo trabalho distribuído, não por formação declarada', () => {
  const reference = capabilityReferenceCatalog['technical-capability'];
  assert.ok(reference);
  assert.match(reference.stage(1).behavior, /concentr|ausente|especialista/i);
  assert.match(reference.stage(3).behavior, /mais pessoas|distribu|trabalho/i);
  assert.match(`${reference.stage(4).behavior} ${reference.stage(4).effect}`, /efeito|feedback|aprend|distribui/i);
  assert.doesNotMatch(reference.stages.map((item) => `${item.behavior} ${item.effect}`).join(' '), /certificaç[aã]o|matriz de compet[eê]ncia|cargo/i);
  assert.ok(reference.interpretationLimits.some((item) => /curso|certificaç[aã]o|cargo|matriz/i.test(item)));
});

test('release é avaliado por decisão, efeito e aprendizado, não por mecanismo nominal', () => {
  const reference = capabilityReferenceCatalog['release-feedback'];
  assert.ok(reference);
  assert.match(reference.stage(3).behavior, /decis[aã]o|mudança|exposiç[aã]o/i);
  assert.match(`${reference.stage(4).behavior} ${reference.stage(4).effect}`, /feedback|efeito|aprend/i);
  assert.doesNotMatch(reference.stages.map((item) => `${item.behavior} ${item.effect}`).join(' '), /GitOps|Argo|Jenkins|Kubernetes/i);
  assert.ok(reference.interpretationLimits.some((item) => /ferramenta|pipeline|estrat[eé]gia/i.test(item)));
});

test('nível quatro exige adaptação por efeito e não adoção nominal', () => {
  for (const reference of Object.values(capabilityReferenceCatalog)) {
    const adaptive = reference.stage(4);
    assert.match(`${adaptive.behavior} ${adaptive.effect}`, /feedback|resultado|efeito|aprend/i, reference.capabilityId);
    assert.doesNotMatch(`${adaptive.behavior} ${adaptive.effect}`, /possui|adotou|implantou|usa (?:uma|um|o|a)/i, reference.capabilityId);
  }
});

test('referência rejeita estágios incompletos e base de pontuação nominal', () => {
  const labels = ['Opaco', 'Reativo', 'Repetível', 'Gerenciado', 'Adaptativo'] as const;
  const validStage = (level: 0 | 1 | 2 | 3 | 4) => ({
    level,
    label: labels[level],
    behavior: 'Um comportamento suficientemente observável é reconstruído no trabalho recente.',
    effect: 'O efeito produzido no sistema de trabalho pode ser verificado.',
    underPressure: 'Sob pressão, a reação do sistema continua sendo observável.',
  });
  const input = {
    capabilityId: 'example',
    title: 'Exemplo',
    purpose: 'Explicar com detalhe suficiente o propósito operacional desta capacidade no fluxo.',
    assessmentBasis: 'behavior-and-effect-only' as const,
    stages: [0, 1, 2, 3].map((level) => validStage(level as 0 | 1 | 2 | 3 | 4)),
    evidenceRequired: ['Um evento recente.', 'Uma consequência observada.'],
    enablingConditions: ['Autoridade compatível.', 'Retorno observável.'],
    regressionSignals: ['Dependência pessoal reaparece.', 'O retorno deixa de alterar decisões.'],
    compatiblePractices: ['Prática condicionada ao diagnóstico.'],
    optionalToolFamilies: ['Família opcional.'],
    interpretationLimits: ['Presença nominal não pontua.', 'Ausência nominal não penaliza.'],
  };

  assert.throws(() => CapabilityReference.create(input), DomainValidationError);
  assert.throws(() => CapabilityReference.create({
    ...input,
    assessmentBasis: 'nominal-adoption' as never,
    stages: [0, 1, 2, 3, 4].map((level) => validStage(level as 0 | 1 | 2 | 3 | 4)),
  }), DomainValidationError);
});
