import { writeFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { graph, profileIds, type Profile } from '../../src/modules/catalog/assessment-graph.js';
import { buildShowcaseGuide, SHOWCASE_GUIDE_PATH, type ShowcaseGuideCase } from './showcase-guide.js';

type Stance = 'fragile' | 'emerging' | 'adaptive' | 'pipeline-fragile' | 'coordination-fragile' | 'integration-tooling' | 'integration-policy' | 'integration-architecture' | 'local-improvement' | 'divergence-strong' | 'divergence-constrained';

const mixedSquad: Profile[] = ['quality', 'management', 'product', 'engineering', 'platform', 'architecture', 'design'];
const tenPersonTeam: Profile[] = ['platform', 'engineering', 'engineering', 'engineering', 'engineering', 'quality', 'product', 'architecture', 'product', 'management'];
const focusedTeam: Profile[] = ['product', 'product', 'engineering', 'platform', 'management'];
const architectureTeam: Profile[] = ['architecture', 'architecture', 'architecture', 'architecture', 'architecture'];
const inspectHost = process.env.SHOWCASE_PUBLIC_URL ?? 'http://127.0.0.1:3217';
const narrativeChoices: Partial<Record<Stance, Record<string, string>>> = {
  fragile: { 'integration-cadence': 'isolated-days' },
  'pipeline-fragile': {
    'shared-change': 'before-release', 'ready-to-release': 'manual-package', 'deployment-probe': 'local-script',
    'quality-probe': 'regression', 'integration-cadence': 'isolated-days', 'delivery-cause': 'tooling-gap',
    'change-verification': 'slow-suite', 'environment-access': 'ticket-queue', 'incident-diagnosis': 'separate-searches',
  },
  'coordination-fragile': {
    'urgent-change': 'manager-coordinates', 'shared-change': 'coordination', 'integration-cadence': 'coordinated-window',
    'delivery-cause': 'team-boundary', 'blocked-work': 'waiting-external', 'blocked-cause': 'dependency-priority',
    'decision-context': 'expert-decides', 'architecture-pressure': 'ownership-dispute', 'team-pressure': 'private-resolution',
    'improvement-loop': 'action-list-fades', 'shared-surface-risk': 'manual-coordination',
    'service-ownership-continuity': 'no-accountable-group', 'legacy-change-safety': 'unknown-behavior',
    'leadership-enablement': 'escalation-followup', 'management-portfolio': 'parallel-initiatives',
  },
  'integration-tooling': { 'shared-change': 'before-release', 'integration-cadence': 'isolated-days', 'delivery-cause': 'tooling-gap', 'change-verification': 'slow-suite' },
  'integration-policy': { 'shared-change': 'before-release', 'integration-cadence': 'isolated-days', 'delivery-cause': 'process-policy', 'security-change': 'same-checklist' },
  'integration-architecture': {
    'shared-change': 'before-release', 'integration-cadence': 'isolated-days', 'delivery-cause': 'architecture-coupling',
    'architecture-pressure': 'planning-sync', 'architecture-event-consequence': 'meetings-remained',
  },
  'local-improvement': { 'improvement-loop': 'action-list-fades', 'improvement-cause': 'too-many-actions' },
  emerging: { 'integration-cadence': 'integrated-few-days' },
  adaptive: { 'integration-cadence': 'integrated-daily' },
};

test('gera casos inspecionáveis com textos, resultados e convites manuais', async ({ page }) => {
  test.setTimeout(600_000);
  const collected: ShowcaseGuideCase[] = [];
  collected.push(await buildFragileCase(page));
  collected.push(await buildEmergingCase(page));
  collected.push(await buildAdaptiveCase(page));
  collected.push(await buildDivergenceCase(page));
  collected.push(await buildHealthyWithLocalProblemCase(page));
  collected.push(await buildContainmentContrastCase(page));

  const fragileHome = collected[0];
  const emergingHome = collected[1];
  if (!fragileHome?.observed || !emergingHome?.observed) throw new Error('casos frágil e emergente ausentes');
  expect(fragileHome.observed.limiter ?? '').not.toMatch(/infraestrutura|Cloud/i);
  expect(emergingHome.observed.limiter ?? '').not.toMatch(/infraestrutura|Cloud/i);
  expect(`${fragileHome.observed.limiter}|${fragileHome.observed.reading}`).not.toBe(`${emergingHome.observed.limiter}|${emergingHome.observed.reading}`);

  writeFileSync(SHOWCASE_GUIDE_PATH, buildShowcaseGuide(collected));
  await page.goto('/showcase');
  await expect(page.getByRole('heading', { name: 'Índice de inspeção' })).toBeVisible();
  await expect(page.getByText('não substituem calibração')).toBeVisible();
  await expect(page.getByText('6 de 6 contrastes cobertos sinteticamente.')).toBeVisible();
  await expect(page.getByText(/Validação humana pendente/)).toBeVisible();
  for (const entry of collected) await expect(page.getByRole('heading', { name: entry.title })).toBeVisible();

  console.log(`[showcase] índice: ${inspectHost}/showcase`);
  for (const entry of collected) console.log(`[showcase] ${entry.id}: ${entry.adminUrl}`);
});

async function buildFragileCase(page: Page): Promise<ShowcaseGuideCase> {
  const org = 'Linha de produto sob pressão';
  const adminUrl = await createProject(page, 'Frágil — linha sob pressão', org, ['Squad Alfa', 'Squad Beta']);
  const alfa = await createInvitations(page, tenPersonTeam.length, `${org}/Squad Alfa`);
  await page.getByRole('link', { name: 'Voltar ao painel' }).click();
  const beta = await createInvitations(page, tenPersonTeam.length, `${org}/Squad Beta`);
  for (const [index, link] of alfa.entries()) await completeAssessment(page, link, 'pipeline-fragile', tenPersonTeam[index]!, index);
  for (const [index, link] of beta.entries()) await completeAssessment(page, link, 'coordination-fragile', tenPersonTeam[index]!, index);

  await page.goto(adminUrl);
  await expect(page.getByText('Próxima decisão').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'O que está acontecendo' }).first()).toBeVisible();
  await expect(page.locator('.outcome-scope').first()).not.toContainText('e mais');
  await expect(page.locator('.outcome-scope').first()).not.toContainText('Confiabilidade de infraestrutura');
  await expect(page.locator('.outcome-scope').first()).not.toContainText('Infraestrutura reproduzível');
  await revealConsistency(page);
  await expect(page.locator('.classification-level').first()).toHaveText(/^[01] · (Opaco|Reativo)$/);
  await expect(page.getByRole('heading', { name: 'Escolha por onde avaliar' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Briefing para diretoria' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Briefing para liderança de tecnologia' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Leituras por unidade' })).toBeVisible();
  const alfaReport = page.locator('details.scope-report', { hasText: 'Squad Alfa' });
  const betaReport = page.locator('details.scope-report', { hasText: 'Squad Beta' });
  await expect(alfaReport.locator(':scope > summary')).toBeVisible();
  await expect(betaReport.locator(':scope > summary')).toBeVisible();
  await alfaReport.locator(':scope > summary').click();
  await expect(alfaReport.getByText('Leitura da gerência local')).toBeVisible();
  await expect(alfaReport.getByRole('heading', { name: 'O que a unidade pode mudar' })).toBeVisible();
  await expect(alfaReport.getByRole('heading', { name: 'Restrições que a unidade recebe' })).toBeVisible();
  await expect(alfaReport.getByRole('heading', { name: 'O que precisa ser escalado' })).toBeVisible();
  await expect(alfaReport.getByText('Próxima decisão')).toBeVisible();
  await betaReport.locator(':scope > summary').click();
  await expect(betaReport.getByText('Próxima decisão')).toBeVisible();
  await page.locator('.radar-drill-link', { hasText: 'Operação e confiabilidade' }).first().click();
  await page.goto(adminUrl);
  const observed = await observeReport(page);

  return {
    id: 'fragil',
    scenarioIds: ['low-autonomy-handoffs', 'specialist-organization', 'unknown-technology-estate'],
    title: 'Frágil — linha sob pressão',
    story: 'Dois times de dez pessoas compartilham a mesma linha de produto. No Squad Alfa, a esteira, a regressão e os ambientes atrasam o feedback. No Squad Beta, dependências, ownership e decisões centralizadas exigem coordenação constante.',
    lookFor: [
      'Uma próxima decisão e um único limitador — não cloud aninhada por default.',
      'Cartão com o problema, a restrição e o teste; estágio e mapa de contraste em segundo plano.',
      'Panorama visível com problemas de esteira, comunicação, gestão, responsabilidade de serviço e legado além da decisão principal.',
      'Mapa por estrutura compara os dois times sem expor respostas individuais.',
    ],
    adminUrl: toInspectUrl(adminUrl),
    publicUrl: publicUrlFromAdmin(adminUrl),
    observed,
  };
}

async function buildContainmentContrastCase(page: Page): Promise<ShowcaseGuideCase> {
  const org = 'Integração tardia com causas diferentes';
  const adminUrl = await createProject(page, 'Contraste — mesmo sintoma, três contenções', org, ['Squad Tooling', 'Squad Política', 'Squad Arquitetura']);
  const tooling = await createInvitations(page, focusedTeam.length, `${org}/Squad Tooling`);
  await page.getByRole('link', { name: 'Voltar ao painel' }).click();
  const policy = await createInvitations(page, focusedTeam.length, `${org}/Squad Política`);
  await page.getByRole('link', { name: 'Voltar ao painel' }).click();
  const architecture = await createInvitations(page, architectureTeam.length, `${org}/Squad Arquitetura`);
  for (const [index, link] of tooling.entries()) await completeAssessment(page, link, 'integration-tooling', focusedTeam[index]!, index);
  for (const [index, link] of policy.entries()) await completeAssessment(page, link, 'integration-policy', focusedTeam[index]!, index);
  for (const [index, link] of architecture.entries()) await completeAssessment(page, link, 'integration-architecture', architectureTeam[index]!, index);

  await page.goto(adminUrl);
  const portfolio = page.locator('.finding-portfolio').first();
  await expect(portfolio.getByRole('link', { name: 'O feedback automatizado não sustenta integração frequente', exact: true })).toBeVisible();
  const toolingStep = portfolio.locator('.finding-portfolio-group', { hasText: 'O feedback automatizado não sustenta integração frequente' });
  await expect(toolingStep).not.toContainText('Depende de: Políticas e etapas exigem acumular mudanças');
  await expect(page.getByText(/Capacidades compartilhadas/).first()).toBeVisible();
  await expect(page.getByText(/Decisões organizacionais/).first()).toBeVisible();
  const toolingReport = page.locator('details.scope-report', { hasText: 'Squad Tooling' });
  const policyReport = page.locator('details.scope-report', { hasText: 'Squad Política' });
  const architectureReport = page.locator('details.scope-report', { hasText: 'Squad Arquitetura' });
  await toolingReport.locator(':scope > summary').click();
  await expect(toolingReport.getByText(/escalar para .*plataforma/i)).toBeVisible();
  await policyReport.locator(':scope > summary').click();
  await expect(policyReport.getByText(/escalar para .*governança/i)).toBeVisible();
  await architectureReport.locator(':scope > summary').click();
  await architectureReport.locator('.radar-drill-link', { hasText: 'Arquitetura e evolução' }).click();
  await expect(page.locator('body')).toContainText(/acoplamento transforma mudanças pequenas em lotes coordenados/i);
  await page.goto(adminUrl);
  const observed = await observeReport(page);
  return {
    id: 'contraste-contencao',
    scenarioIds: ['same-symptom-different-causes'],
    title: 'Contraste — mesmo sintoma, três contenções',
    story: 'Três squads integram mudanças tarde. Em uma, o retorno automatizado não produz confiança; na segunda, uma política exige acumular e aguardar; na terceira, o acoplamento impede que uma mudança pequena permaneça pequena.',
    lookFor: [
      'O problema de tooling aparece como capacidade compartilhada e pede decisão de plataforma.',
      'O problema de política aparece como decisão organizacional e pede governança.',
      'O acoplamento aparece como restrição arquitetural e não recebe solução de esteira ou política.',
      'A integração tardia não produz uma recomendação única por palavra-chave.',
    ],
    adminUrl: toInspectUrl(adminUrl), publicUrl: publicUrlFromAdmin(adminUrl), observed,
  };
}

async function buildHealthyWithLocalProblemCase(page: Page): Promise<ShowcaseGuideCase> {
  const org = 'Produto sustentável com desvio local';
  const adminUrl = await createProject(page, 'Sustentável — problema local isolado', org, ['Squad Referência', 'Squad Discovery']);
  const reference = await createInvitations(page, focusedTeam.length, `${org}/Squad Referência`);
  await page.getByRole('link', { name: 'Voltar ao painel' }).click();
  const local = await createInvitations(page, focusedTeam.length, `${org}/Squad Discovery`);
  for (const [index, link] of reference.entries()) await completeAssessment(page, link, 'adaptive', focusedTeam[index]!, index);
  for (const [index, link] of local.entries()) await completeAssessment(page, link, 'local-improvement', focusedTeam[index]!, index);

  await page.goto(adminUrl);
  const localReport = page.locator('details.scope-report', { hasText: 'Squad Discovery' });
  await expect(localReport.locator(':scope > summary')).toBeVisible();
  await localReport.locator(':scope > summary').click();
  await expect(localReport.getByRole('heading', { name: 'O que a unidade pode mudar' })).toBeVisible();
  await expect(localReport.locator('.unit-management-report').getByRole('link', { name: 'Ações de melhoria excedem a capacidade de concluir' })).toBeVisible();
  await expect(localReport.getByText('Nenhuma escalada confirmada para este recorte.')).toBeVisible();
  const referenceReport = page.locator('details.scope-report', { hasText: 'Squad Referência' });
  await referenceReport.locator(':scope > summary').click();
  await expect(referenceReport.locator('.unit-management-report')).not.toContainText('Ações de melhoria excedem a capacidade de concluir');
  const executiveBrief = page.locator('#report-executive');
  await expect(executiveBrief.getByText('Nenhuma decisão confirmada para esta autoridade.').first()).toBeVisible();
  const observed = await observeReport(page);
  return {
    id: 'saudavel-local',
    scenarioIds: [],
    title: 'Sustentável — problema local isolado',
    story: 'Os dois times sustentam a maior parte do sistema; apenas a Squad Discovery abre ações de melhoria demais e não consegue concluí-las. O diagnóstico deve permanecer local e não virar transformação organizacional.',
    lookFor: [
      'A ação aparece somente sob autoridade da Squad Discovery.',
      'A Squad Referência não recebe o problema por pertencer à mesma organização.',
      'O briefing executivo não converte o desvio local em decisão de estrutura ou funding.',
    ],
    adminUrl: toInspectUrl(adminUrl), publicUrl: publicUrlFromAdmin(adminUrl), observed,
  };
}

async function buildEmergingCase(page: Page): Promise<ShowcaseGuideCase> {
  const org = 'Produto com prática local';
  const adminUrl = await createProject(page, 'Emergente — prática local', org, ['Time de produto']);
  const links = await createInvitations(page, mixedSquad.length);
  for (const [index, link] of links.entries()) await completeAssessment(page, link, 'emerging', mixedSquad[index]!, index);
  await page.goto(adminUrl);
  await expect(page.getByText('Próxima decisão').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'O que está acontecendo' }).first()).toBeVisible();
  await expect(page.locator('.outcome-scope').first()).not.toContainText('e mais');
  const observed = await observeReport(page);
  return {
    id: 'emergente',
    scenarioIds: [],
    title: 'Emergente — prática local',
    story: 'Sete perspectivas descrevem rotina intermediária: há acordo local, mas ainda falta evidência de sistema. Serve para comparar a leitura executiva e as evoluções recomendadas com os casos sob pressão e sustentável.',
    lookFor: [
      'Consistência do elo limitante entre o caso sob pressão e o sustentável.',
      'Um limitador, um desfecho e um próximo passo — sem “e mais N” nem três prioridades do mesmo texto.',
      'Instrumento e calibração no rodapé, sem competir com a decisão.',
    ],
    adminUrl: toInspectUrl(adminUrl),
    publicUrl: publicUrlFromAdmin(adminUrl),
    observed,
  };
}

async function buildAdaptiveCase(page: Page): Promise<ShowcaseGuideCase> {
  const org = 'Operação sustentável';
  const adminUrl = await createProject(page, 'Sustentável — práticas gerenciadas e adaptativas', org, ['Plataforma']);
  const completed = await createInvitations(page, profileIds.length);
  await page.getByRole('link', { name: 'Voltar ao painel' }).click();
  const unused = await createInvitations(page, 3);
  for (const [index, link] of completed.entries()) await completeAssessment(page, link, 'adaptive', profileIds[index]!, index);

  await page.goto(adminUrl);
  await expect(page.getByText('Próxima decisão').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mapa de contraste e cobertura' }).first()).toBeVisible();
  await expect(page.locator('.outcome-card .tag').first()).toHaveText('Preservar a prática');
  await expect(page.getByText(/Incidentes encontram rapidamente quem pode agir/).first()).toBeVisible();
  await expect(page.getByText(/Ainda não há um padrão problemático com evidência agregada suficiente/)).toBeVisible();
  const observed = await observeReport(page);

  return {
    id: 'adaptativo',
    scenarioIds: ['full-cycle-without-sre', 'strong-practice-simple-tool'],
    title: 'Sustentável — práticas gerenciadas e adaptativas',
    story: 'Um time full-cycle sem SRE dedicado sustenta entrega, operação e recuperação com guardrails, evidência e aprendizado. A capacidade vem do comportamento, inclusive quando o mecanismo é simples; as nove lentes não exigem cargos ou produtos sofisticados. Três convites permanecem abertos para percorrer à mão os ramos de arquitetura, segurança, dados e design.',
    lookFor: [
      'Nas páginas de capacidade, a leitura executiva usa estágios qualitativos; o ordinal permanece auditável nos detalhes.',
      'A consistência do elo limitante pode ficar em Gerenciado: não é inflada pelas folhas altas.',
      'Governança habilitadora abaixo de 4 fecha com uma próxima decisão, não com uma lista de evoluções genéricas.',
      'Use um convite ocioso, escolha Arquitetura, Segurança, Dados ou Design na primeira pergunta e leia o texto do ramo.',
    ],
    adminUrl: toInspectUrl(adminUrl),
    publicUrl: publicUrlFromAdmin(adminUrl),
    observed,
    unusedInvites: unused.map((url, index) => ({
      label: `Percurso manual ${index + 1}. Na primeira pergunta escolha a lente que quer inspecionar; o convite original não reabre depois do primeiro acesso.`,
      url: toInspectUrl(url),
    })),
  };
}

async function buildDivergenceCase(page: Page): Promise<ShowcaseGuideCase> {
  const org = 'Mesmo fluxo, duas leituras';
  const adminUrl = await createProject(page, 'Divergência — gestão e engenharia', org, ['Time compartilhado']);
  const links = await createInvitations(page, 10);
  for (const [index, link] of links.entries()) {
    const profile: Profile = index < 5 ? 'management' : 'engineering';
    await completeAssessment(page, link, index < 5 ? 'divergence-strong' : 'divergence-constrained', profile, index);
  }
  await page.goto(adminUrl);
  await expect(page.getByText('Próxima decisão').first()).toBeVisible();
  const observed = await observeReport(page);
  return {
    id: 'contraste-lentes',
    scenarioIds: [],
    title: 'Contraste — gestão e engenharia no mesmo trabalho',
    story: 'Cinco jornadas de gestão e cinco de engenharia usam lentes distintas, mas declaram a mesma responsabilidade exercida. O caso verifica que perfil adapta linguagem e triangulação sem substituir o contexto real de trabalho.',
    lookFor: [
      'As duas perspectivas atingem o limiar sem expor respostas individuais.',
      'Diferença de perfil não produz fragilidade ou divergência automaticamente.',
      'Compare a decisão publicada com os casos sustentável e sob pressão.',
    ],
    adminUrl: toInspectUrl(adminUrl),
    publicUrl: publicUrlFromAdmin(adminUrl),
    observed,
  };
}

async function createProject(page: Page, name: string, orgName: string, teams: string[]): Promise<string> {
  await page.goto('/projects/new');
  await page.getByLabel('Nome do projeto').fill(name);
  const units = page.getByLabel('Nome da unidade');
  await units.nth(0).fill(orgName);
  await units.nth(1).fill(teams[0]!);
  for (const [index, team] of teams.slice(1).entries()) {
    await page.getByRole('button', { name: 'Adicionar unidade abaixo' }).first().click();
    await page.getByLabel('Nome da unidade').nth(index + 2).fill(team);
  }
  await page.getByRole('button', { name: 'Criar projeto' }).click();
  await expect(page.getByRole('heading', { name })).toBeVisible();
  return page.url();
}

async function createInvitations(page: Page, quantity: number, unitPath?: string): Promise<string[]> {
  const administration = page.locator('details', { hasText: 'Administrar aplicação' });
  if (await administration.count() && !(await administration.evaluate((element) => element.hasAttribute('open')))) {
    await administration.getByText('Administrar aplicação', { exact: true }).click();
  }
  if (unitPath) await page.getByLabel('Unidade final').selectOption({ label: unitPath });
  await page.getByLabel('Quantidade').fill(String(quantity));
  await page.getByRole('button', { name: 'Gerar links' }).click();
  const links = await page.locator('#invitation-links code').allTextContents();
  expect(links).toHaveLength(quantity);
  return links;
}

async function completeAssessment(page: Page, invitationLink: string, stance: Stance, profile: Profile, participantIndex: number): Promise<void> {
  await page.goto(invitationLink);
  while (await page.locator('form[data-assessment-node]').count()) {
    const form = page.locator('form[data-assessment-node]');
    const nodeId = await form.getAttribute('data-assessment-node');
    const node = graph.find((candidate) => candidate.id === nodeId);
    if (!node) throw new Error(`Assessment node not found: ${nodeId}`);
    const available = await form.locator('input[name="optionId"]').evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));
    const option = chooseOption(node.options.filter((candidate) => available.includes(candidate.id)), stance, node.id, profile, participantIndex);
    await form.locator(`input[value="${option.id}"]`).check();
    await Promise.all([page.waitForLoadState('domcontentloaded'), form.getByRole('button', { name: 'Continuar' }).click()]);
  }
  await expect(page.getByRole('heading', { name: 'Obrigado pela participação' })).toBeVisible();
}

async function revealConsistency(page: Page): Promise<void> {
  const detail = page.locator('details.consistency-detail').first();
  if (await detail.count() && !(await detail.getAttribute('open'))) await detail.locator(':scope > summary').click();
}

async function observeReport(page: Page) {
  const reading = (await page.locator('.executive-reading').first().textContent())?.trim() ?? '';
  const limiter = (await page.locator('.outcome-scope').first().textContent())?.replace(/^Onde aparece:\s*/i, '').trim() ?? '';
  const classificationLocator = page.locator('.classification-level').first();
  const classification = await classificationLocator.count()
    ? await classificationLocator.evaluate((el) => el.textContent?.trim() ?? '')
    : 'Sem classificação ordinal por cobertura insuficiente';
  const ignoredTags = new Set(['claimed', 'issued', 'partially_used', 'revoked', 'expired']);
  const highlights = (await page.locator('.tag').allTextContents())
    .map((item) => item.trim())
    .filter((item) => item && !ignoredTags.has(item))
    .filter((item, index, list) => list.indexOf(item) === index)
    .slice(0, 8);
  return { classification, reading, limiter, highlights };
}

function chooseOption(options: typeof graph[number]['options'], stance: Stance, nodeId: string, profile: Profile, participantIndex: number) {
  if (nodeId === 'respondent-context') return options.find((option) => option.id === profile)!;
  if (nodeId === 'work-context') {
    if (stance === 'divergence-strong' || stance === 'divergence-constrained') {
      return options.find((option) => option.id === 'build-focused')!;
    }
    if (stance === 'integration-tooling' || stance === 'integration-policy' || stance === 'integration-architecture') {
      return options.find((option) => option.id === 'build-focused')!;
    }
    const contextByProfile: Record<Profile, string> = {
      management: 'people-and-portfolio', product: 'product-and-outcomes', quality: 'quality-and-risk',
      engineering: stance === 'adaptive' ? 'build-and-operate' : 'build-focused',
      platform: 'shared-capability', architecture: 'architecture-and-boundaries', security: 'quality-and-risk',
      data: 'data-and-experience', design: 'data-and-experience',
    };
    return options.find((option) => option.id === contextByProfile[profile])!;
  }
  const narrativeChoice = narrativeChoices[stance]?.[nodeId];
  if (narrativeChoice) {
    const selected = options.find((option) => option.id === narrativeChoice);
    if (selected) return selected;
  }
  const practice = options.filter((option) => (option.observation ?? 'practice') === 'practice');
  const pool = practice.length ? practice : options;
  const scored = pool.map((option) => ({ option, score: option.signals.reduce((total, signal) => total + signal.weight, 0) }));
  const divergenceNodes = new Set(['shared-change', 'integration-cadence', 'architecture-pressure', 'blocked-work', 'decision-context']);
  const effectiveStance: 'fragile' | 'emerging' | 'adaptive' = stance === 'integration-architecture'
    ? 'fragile'
    : stance === 'pipeline-fragile' || stance === 'coordination-fragile' || stance === 'integration-tooling' || stance === 'integration-policy' || stance === 'local-improvement'
    ? 'adaptive'
    : stance === 'divergence-strong'
      ? divergenceNodes.has(nodeId) ? 'adaptive' : 'emerging'
      : stance === 'divergence-constrained'
        ? divergenceNodes.has(nodeId) ? 'fragile' : 'emerging'
        : stance;
  if (effectiveStance === 'fragile') {
    const fragile = scored.filter((candidate) => candidate.score < 0).sort((left, right) => left.score - right.score);
    return (fragile[participantIndex % fragile.length] ?? scored.sort((left, right) => left.score - right.score)[0])!.option;
  }
  if (effectiveStance === 'adaptive') {
    const strong = scored.sort((left, right) => negativeCost(left.option) - negativeCost(right.option) || right.score - left.score);
    const safest = strong.filter((candidate) => negativeCost(candidate.option) === negativeCost(strong[0]!.option));
    return safest[participantIndex % safest.length]!.option;
  }
  const intermediate = scored.filter((candidate) => candidate.score >= -1 && candidate.score <= 1).sort((left, right) => Math.abs(left.score) - Math.abs(right.score) || left.score - right.score);
  if (intermediate.length) return intermediate[participantIndex % intermediate.length]!.option;
  return scored.sort((left, right) => Math.abs(left.score) - Math.abs(right.score))[0]!.option;
}

function negativeCost(option: typeof graph[number]['options'][number]): number {
  return option.signals.reduce((cost, signal) => cost + Math.max(0, -signal.weight), 0);
}

function toInspectUrl(url: string): string {
  const parsed = new URL(url);
  return `${inspectHost}${parsed.pathname}${parsed.search}${parsed.hash}`;
}

function publicUrlFromAdmin(adminUrl: string): string {
  const parsed = new URL(toInspectUrl(adminUrl));
  return `${inspectHost}/p/${parsed.pathname.split('/')[2]}`;
}
