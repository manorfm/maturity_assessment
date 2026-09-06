import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OrganizationalAreaProjector } from '../src/modules/inference/domain/organizational-areas.js';
import { AudienceReportProjector } from '../src/modules/inference/domain/audience-report.js';
import { TransformationPortfolioPlanner } from '../src/modules/inference/domain/transformation-portfolio.js';
import { projectFrontInventory } from '../src/modules/inference/domain/multi-front-inventory.js';
import { decideReportOutcome } from '../src/modules/inference/domain/report-outcome.js';
import {
  renderAudienceBriefs,
  renderCapabilityDiagnosis,
  renderFirstScreen,
  renderOutcome,
} from '../src/modules/projects/project-routes.js';
import type { OutcomeFinding } from '../src/modules/inference/domain/report-outcome.js';

const ready = (pattern: string, title: string, detailCapability: string, extras: Partial<OutcomeFinding> = {}): OutcomeFinding => ({
  kind: 'correction',
  pattern,
  detailCapability,
  title,
  cause: title,
  intervention: extras.intervention ?? 'Testar a contenção deste recorte.',
  confidence: extras.confidence ?? .9,
  priority: extras.priority ?? .9,
  mechanism: extras.mechanism ?? 'organization',
  containment: extras.containment ?? 'organizational-policy',
  decisionAuthority: extras.decisionAuthority ?? 'organizational-governance',
  prescription: extras.prescription ?? { status: 'ready', reason: 'Mecanismo e contenção discriminados.' },
  experiment: extras.experiment ?? {
    action: extras.intervention ?? 'Testar a contenção deste recorte.',
    owner: 'Grupo responsável pelo recorte',
    metric: 'efeito no próximo evento equivalente',
    reviewHorizon: 'no próximo evento equivalente',
    successCriterion: 'o próximo evento equivalente muda',
  },
  ...extras,
});

const warRoom = ready('war-room-como-gestao', 'O war room virou o modo de gestão', 'leadership-management', {
  intervention: 'Pare de autorizar caça ao culpado no próximo incidente.',
});
const versionPath = ready('caminho-de-versao-sem-origem', 'A versão promovida não tem origem', 'release-feedback', {
  priority: .85, mechanism: 'process', containment: 'team', decisionAuthority: 'team',
});
const postmortem = ready('postmortem-sem-efeito', 'A análise não fecha solução', 'organizational-learning', {
  priority: .8, mechanism: 'process',
});
const sustentacao = ready('causa-fronteira-sustentacao', 'Sustentação transfere contexto sem autoridade', 'organizational-learning', {
  mechanism: 'organization', containment: 'organizational-structure',
});

test('inventário publica uma ação por frente com crença relativa provisória', () => {
  const inventory = projectFrontInventory([warRoom, versionPath, postmortem]);
  assert.equal(inventory.version, 'front-inventory-v1');
  assert.deepEqual(inventory.rows.map((row) => row.label), ['Produto', 'Engenharia', 'Operação', 'Gestão']);
  const product = inventory.rows.find((row) => row.front === 'product')!;
  const engineering = inventory.rows.find((row) => row.front === 'engineering')!;
  const operations = inventory.rows.find((row) => row.front === 'operations')!;
  const management = inventory.rows.find((row) => row.front === 'management')!;
  assert.match(product.action, /capacidade para aprender|próxima iniciativa/i);
  assert.match(engineering.action, /origem e a promoção|caminho paralelo/i);
  assert.match(operations.action, /incidente sem nome|condições do sistema/i);
  assert.match(management.action, /caça ao culpado|desempenho individual/i);
  assert.match(management.relativeBelief, /provisório/);
  assert.doesNotMatch(inventory.rows.map((row) => row.action).join(' '), /JFrog|blameless workshop/i);
});

test('first screen coloca o inventário abaixo da decisão e lista causas com suporte', () => {
  const findings = [warRoom, versionPath, postmortem];
  const html = renderFirstScreen({
    outcome: {
      kind: 'correct', kindLabel: 'Precisa de correção', limiterLabel: 'Liderança',
      reading: warRoom.title, nextStepTitle: warRoom.title, nextStepBody: warRoom.intervention, finding: warRoom,
    },
    classification: { level: 1, label: 'Reativo', limitingCapabilities: ['Liderança'] },
    organizationalAreas: OrganizationalAreaProjector.project({
      capabilities: [
        { id: 'leadership-management', label: 'Liderança', level: 1, confidence: .8, evidence: 4, hasContradiction: false, coverage: 1 },
        { id: 'release-feedback', label: 'Publicação', level: 1, confidence: .8, evidence: 4, hasContradiction: false, coverage: 1 },
      ],
      findings,
    }),
    findings,
    scopes: [],
    areaBase: '/areas',
    capabilityBase: '/capabilities',
  });
  const decision = html.indexOf('O que fazer agora');
  const crossing = html.indexOf('Como as disciplinas se cruzam');
  const systems = html.indexOf('Sistemas da organização');
  assert.ok(decision >= 0 && crossing > decision && systems > crossing);
  assert.match(html, /Produto/);
  assert.match(html, /Engenharia/);
  assert.match(html, /Operação/);
  assert.match(html, /Gestão/);
  assert.match(html, /Como as disciplinas se cruzam/);
  assert.match(html, /origem da versão|próximo incidente|crise/i);
  assert.doesNotMatch(html, /Inventário por frente/);
  assert.doesNotMatch(html, /Ainda é provisório/);
  assert.doesNotMatch(html, /impede escolher|inconclusivo até discriminar/i);
});

test('contradição no mesmo evento publica a causa líder e não impede escolher', () => {
  const outcome = decideReportOutcome({
    classification: { level: 1, label: 'Reativo', limitingCapabilities: ['Aprendizado e adaptação'] },
    branches: [{
      id: 'organizational-learning', label: 'Aprendizado e adaptação', level: 1.7, confidence: .4, evidence: 8,
      hasContradiction: true, assessed: true, coverage: 1, children: [],
    }],
    findings: [postmortem, versionPath],
  });
  assert.equal(outcome.kind, 'correct');
  assert.equal(outcome.finding?.pattern, 'postmortem-sem-efeito');
  assert.doesNotMatch(outcome.reading, /impede escolher/i);
  assert.match(outcome.reading, /adoção desigual|hipóteses competem/i);

  const mixedCard = renderOutcome({
    kind: 'discriminate', kindLabel: 'Entender a causa antes de agir', limiterLabel: 'Aprendizado',
    reading: 'Aprendizado está em reativo, mas as evidências deste elo ainda se misturam.',
    nextStepTitle: 'Discriminar', nextStepBody: 'Reconstrua um evento.',
  });
  assert.match(mixedCard, /adoção desigual|direções opostas/i);
  assert.doesNotMatch(mixedCard, /impede escolher uma causa/);
});

test('briefing de política descreve o que parar de autorizar e o caminho técnico', () => {
  const findings = [warRoom, versionPath];
  const reports = AudienceReportProjector.project({ findings, portfolio: TransformationPortfolioPlanner.plan(findings) });
  const html = renderAudienceBriefs(reports, '/capabilities');
  assert.match(html, /Briefing de política/);
  assert.match(html, /caça ao culpado|meta que pune relato/i);
  assert.match(html, /incidente recente sem nome/i);
  assert.match(html, /Relato mais cedo|reunião de crise menos frequente/i);
  assert.match(html, /reversão um passo do caminho|caminho técnico/i);
  assert.doesNotMatch(html, /adote blameless/i);
});

test('mecanismo de desenho oferece instituir capacidade ou desfazer fronteira', () => {
  const inventory = projectFrontInventory([sustentacao]);
  assert.ok(inventory.orgDesignFork);
  assert.match(inventory.orgDesignFork!.institute, /capacidade compartilhada/i);
  assert.match(inventory.orgDesignFork!.dismantle, /desfazer a fronteira|sustentação/i);
  assert.match(inventory.orgDesignFork!.antiPattern, /fila/i);
  assert.match(inventory.orgDesignFork!.preserveObligation, /obrigação|proporcional/i);
});

test('folha com sinais opostos lista adoção desigual, não inconclusivo', () => {
  const html = renderCapabilityDiagnosis([], {
    id: 'organizational-learning', label: 'Aprendizado', level: 1, confidence: .4, evidence: 4,
    hasContradiction: true, assessed: true, coverage: 1, children: [],
  });
  assert.match(html, /adoção desigual/i);
  assert.doesNotMatch(html, /inconclusivo até discriminar|impede escolher/i);
});
