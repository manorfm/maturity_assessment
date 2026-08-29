import { writeFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { graph, profileIds, type Profile } from '../../src/modules/catalog/assessment-graph.js';
import { buildShowcaseGuide, SHOWCASE_GUIDE_PATH, type ShowcaseGuideCase } from './showcase-guide.js';

type Stance = 'fragile' | 'emerging' | 'adaptive' | 'pipeline-fragile' | 'coordination-fragile';

const mixedSquad: Profile[] = ['quality', 'management', 'product', 'engineering', 'platform', 'architecture', 'design'];
const tenPersonTeam: Profile[] = ['platform', 'engineering', 'engineering', 'engineering', 'engineering', 'quality', 'product', 'architecture', 'product', 'management'];
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
    'leadership-enablement': 'escalation-followup', 'management-portfolio': 'parallel-initiatives',
  },
  emerging: { 'integration-cadence': 'integrated-few-days' },
  adaptive: { 'integration-cadence': 'integrated-daily' },
};

test('gera casos inspecionáveis com textos, resultados e convites manuais', async ({ page }) => {
  test.setTimeout(420_000);
  const collected: ShowcaseGuideCase[] = [];
  const levels: Record<string, number> = {};

  collected.push(await buildFragileCase(page, levels));
  collected.push(await buildEmergingCase(page, levels));
  collected.push(await buildAdaptiveCase(page, levels));
  collected.push(await buildDivergenceCase(page));

  expect(levels.fragile!).toBeLessThan(levels.emerging!);
  expect(levels.emerging!).toBeLessThan(levels.adaptive!);
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
  for (const entry of collected) await expect(page.getByRole('heading', { name: entry.title })).toBeVisible();

  console.log(`[showcase] índice: ${inspectHost}/showcase`);
  for (const entry of collected) console.log(`[showcase] ${entry.id}: ${entry.adminUrl}`);
});

async function buildFragileCase(page: Page, levels: Record<string, number>): Promise<ShowcaseGuideCase> {
  const org = 'Linha de produto sob pressão';
  const adminUrl = await createProject(page, 'Frágil — linha sob pressão', org, ['Squad Alfa', 'Squad Beta']);
  const alfa = await createInvitations(page, tenPersonTeam.length, `${org}/Squad Alfa`);
  await page.getByRole('link', { name: 'Voltar ao painel' }).click();
  const beta = await createInvitations(page, tenPersonTeam.length, `${org}/Squad Beta`);
  for (const [index, link] of alfa.entries()) await completeAssessment(page, link, 'pipeline-fragile', tenPersonTeam[index]!, index);
  for (const [index, link] of beta.entries()) await completeAssessment(page, link, 'coordination-fragile', tenPersonTeam[index]!, index);

  await page.goto(adminUrl);
  await expect(page.getByText('Resumo executivo').first()).toBeVisible();
  await expect(page.getByText('Próxima decisão').first()).toBeVisible();
  await expect(page.locator('.executive-facts dd').first()).not.toContainText('e mais');
  await expect(page.locator('.executive-facts dd').first()).not.toContainText('Confiabilidade de infraestrutura');
  await expect(page.locator('.executive-facts dd').first()).not.toContainText('Infraestrutura reproduzível');
  await expect(page.locator('.classification-level').first()).toContainText('0 · Opaco');
  await expect(page.getByRole('heading', { name: 'Panorama de problemas confirmados' })).toBeVisible();
  await expect(page.getByText(/prioridade 1 de \d+ problemas confirmados/i).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mapa por estrutura' })).toBeVisible();
  const alfaReport = page.locator('details.scope-report', { hasText: 'Squad Alfa' });
  const betaReport = page.locator('details.scope-report', { hasText: 'Squad Beta' });
  await expect(alfaReport.locator(':scope > summary')).toBeVisible();
  await expect(betaReport.locator(':scope > summary')).toBeVisible();
  await alfaReport.locator(':scope > summary').click();
  await expect(alfaReport.getByText('Próxima decisão')).toBeVisible();
  await expect(alfaReport.getByRole('heading', { name: 'Panorama de problemas confirmados' })).toBeVisible();
  await betaReport.locator(':scope > summary').click();
  await expect(betaReport.getByText('Próxima decisão')).toBeVisible();
  await expect(betaReport.getByRole('heading', { name: 'Panorama de problemas confirmados' })).toBeVisible();
  await page.locator('.radar-drill-link', { hasText: 'Operação e confiabilidade' }).first().click();
  await page.goto(adminUrl);
  await page.locator('.radar-drill-link', { hasText: 'Plataforma e experiência de engenharia' }).first().click();
  await page.locator('.radar-drill-link', { hasText: 'Capacidades chegam com autonomia' }).click();
  await expect(page.getByText('Próxima decisão').first()).toBeVisible();
  await expect(page.locator('.outcome-card .tag')).toHaveText(/Corrigir o limitador|Evoluir a prática|Discriminar antes de intervir|Preservar a prática/);
  await page.goto(adminUrl);
  const observed = await observeReport(page);
  levels.fragile = Number(observed.classification.split('·')[0]?.trim());

  return {
    id: 'fragil',
    title: 'Frágil — linha sob pressão',
    story: 'Dois times de dez pessoas compartilham a mesma linha de produto. No Squad Alfa, a esteira, a regressão e os ambientes atrasam o feedback. No Squad Beta, dependências, ownership e decisões centralizadas exigem coordenação constante.',
    lookFor: [
      'Uma próxima decisão e um único limitador — não cloud aninhada por default.',
      'Cartão com o problema, a restrição e a classe de solução; radar em segundo plano.',
      'Panorama visível com problemas de esteira, comunicação, gestão e fronteiras além da decisão principal.',
      'Mapa por estrutura compara os dois times sem expor respostas individuais.',
    ],
    adminUrl: toInspectUrl(adminUrl),
    publicUrl: publicUrlFromAdmin(adminUrl),
    observed,
  };
}

async function buildEmergingCase(page: Page, levels: Record<string, number>): Promise<ShowcaseGuideCase> {
  const org = 'Produto com prática local';
  const adminUrl = await createProject(page, 'Emergente — prática local', org, ['Time de produto']);
  const links = await createInvitations(page, mixedSquad.length);
  for (const [index, link] of links.entries()) await completeAssessment(page, link, 'emerging', mixedSquad[index]!, index);
  await page.goto(adminUrl);
  await expect(page.getByText('Resumo executivo').first()).toBeVisible();
  await expect(page.getByText('Próxima decisão').first()).toBeVisible();
  await expect(page.locator('.executive-facts dd').first()).not.toContainText('e mais');
  const observed = await observeReport(page);
  levels.emerging = Number(observed.classification.split('·')[0]?.trim());
  return {
    id: 'emergente',
    title: 'Emergente — prática local',
    story: 'Sete perspectivas descrevem rotina intermediária: há acordo local, mas ainda falta evidência de sistema. Serve para comparar a leitura executiva e as evoluções recomendadas com os extremos frágil e adaptativo.',
    lookFor: [
      'Classificação entre o caso frágil e o adaptativo.',
      'Um limitador, um desfecho e um próximo passo — sem “e mais N” nem três prioridades do mesmo texto.',
      'Instrumento e calibração no rodapé, sem competir com a decisão.',
    ],
    adminUrl: toInspectUrl(adminUrl),
    publicUrl: publicUrlFromAdmin(adminUrl),
    observed,
  };
}

async function buildAdaptiveCase(page: Page, levels: Record<string, number>): Promise<ShowcaseGuideCase> {
  const org = 'Operação sustentável';
  const adminUrl = await createProject(page, 'Adaptativo — nove perspectivas', org, ['Plataforma']);
  const completed = await createInvitations(page, profileIds.length);
  await page.getByRole('link', { name: 'Voltar ao painel' }).click();
  const unused = await createInvitations(page, 3);
  for (const [index, link] of completed.entries()) await completeAssessment(page, link, 'adaptive', profileIds[index]!, index);

  await page.goto(adminUrl);
  await expect(page.getByText('Resumo executivo').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Radar de capacidades' }).first()).toBeVisible();
  await page.locator('.radar-drill-link', { hasText: 'Operação e confiabilidade' }).first().click();
  await expect(page.getByRole('heading', { name: 'Operação e confiabilidade' })).toBeVisible();
  await expect(page.locator('.outcome-card .tag')).toHaveText('Preservar a prática');
  await page.goto(adminUrl);
  await page.locator('.radar-drill-link', { hasText: 'Plataforma e experiência de engenharia' }).first().click();
  await expect(page.getByRole('heading', { name: 'Plataforma e experiência de engenharia' })).toBeVisible();
  const infrastructure = page.locator('.radar-drill-link', { hasText: 'Infraestrutura pode ser reproduzida' });
  if (await infrastructure.evaluate((element) => element.tagName === 'A')) {
    await infrastructure.click();
    await expect(page.getByRole('heading', { level: 1, name: 'Infraestrutura pode ser reproduzida' })).toBeVisible();
  } else {
    await expect(infrastructure).toHaveAttribute('aria-disabled', 'true');
    await expect(infrastructure).not.toHaveAttribute('href', /.+/);
  }
  await expect(page.getByRole('link', { name: 'Voltar' })).toBeVisible();
  await expect(page.locator('.classification-level')).toContainText('Adaptativo');
  await expect(page.locator('.classification-level')).not.toContainText('/ 4');
  await page.getByText('Ver evidências da avaliação', { exact: true }).click();
  await expect(page.locator('details.methodology[open]').getByText(/cobertura temática/i)).toBeVisible();
  await page.goto(adminUrl);
  await page.locator('.radar-drill-link', { hasText: 'Sistema organizacional' }).first().click();
  await page.locator('.radar-drill-link', { hasText: 'Governança habilitadora' }).click();
  await expect(page.locator('.classification-level')).toContainText('Gerenciado');
  await expect(page.getByText('Próxima decisão').first()).toBeVisible();
  await expect(page.locator('.outcome-card .tag')).toHaveText(/Evoluir a prática|Corrigir o limitador|Discriminar antes de intervir|Preservar a prática/);
  await page.goto(adminUrl);
  const observed = await observeReport(page);
  levels.adaptive = Number(observed.classification.split('·')[0]?.trim());

  return {
    id: 'adaptativo',
    title: 'Adaptativo — nove perspectivas',
    story: 'As nove lentes descrevem replanejamento conjunto, evidência e aprendizado. Três convites permanecem abertos para percorrer à mão os ramos de arquitetura, segurança, dados e design.',
    lookFor: [
      'Nas páginas de capacidade, a leitura executiva usa estágios qualitativos; o ordinal permanece auditável nos detalhes.',
      'O resumo executivo pode ficar em Gerenciado: o elo limitante não é inflado pelas folhas altas.',
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
    await completeAssessment(page, link, index < 5 ? 'adaptive' : 'fragile', profile, index);
  }
  await page.goto(adminUrl);
  await expect(page.getByText('divergência agregada').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /Triangular a divergência/i })).toBeVisible();
  const observed = await observeReport(page);
  return {
    id: 'divergencia',
    title: 'Divergência — gestão e engenharia',
    story: 'Cinco jornadas de gestão descrevem prática sustentável no mesmo fluxo em que cinco de engenharia descrevem restrição. A triangulação atinge o grupo mínimo nas duas lentes; a divergência não deve ser lida automaticamente como baixa maturidade.',
    lookFor: [
      'Tag “divergência agregada” e o texto que pede investigar visibilidade, fronteiras e autonomia.',
      'Próxima decisão de discriminar: diferença de perspectiva é o finding, não uma nota baixa automática.',
      'Compare com o caso adaptativo homogêneo e com o frágil homogêneo.',
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
  if (teams[1]) {
    await page.getByRole('button', { name: 'Adicionar unidade abaixo' }).first().click();
    await page.getByLabel('Nome da unidade').nth(2).fill(teams[1]);
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

async function observeReport(page: Page) {
  const classification = (await page.locator('.classification-level').first().textContent())?.trim() ?? '';
  const reading = (await page.locator('.executive-reading').first().textContent())?.trim() ?? '';
  const limiter = (await page.locator('.executive-facts dd').first().textContent())?.trim() ?? '';
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
  const narrativeChoice = narrativeChoices[stance]?.[nodeId];
  if (narrativeChoice) {
    const selected = options.find((option) => option.id === narrativeChoice);
    if (selected) return selected;
  }
  const practice = options.filter((option) => (option.observation ?? 'practice') === 'practice');
  const pool = practice.length ? practice : options;
  const scored = pool.map((option) => ({ option, score: option.signals.reduce((total, signal) => total + signal.weight, 0) }));
  if (stance === 'fragile') {
    const fragile = scored.filter((candidate) => candidate.score < 0).sort((left, right) => left.score - right.score);
    return (fragile[participantIndex % fragile.length] ?? scored.sort((left, right) => left.score - right.score)[0])!.option;
  }
  if (stance === 'adaptive') {
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
