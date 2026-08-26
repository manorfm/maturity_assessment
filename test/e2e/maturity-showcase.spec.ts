import { expect, test, type Page } from '@playwright/test';
import { graph } from '../../src/modules/catalog/assessment-graph.js';

type Scenario = 'poor' | 'medium' | 'elite';

test('gera projetos ruim, mediano e elite para inspeção manual', async ({ page }) => {
  const paths: Record<Scenario, string> = { poor: '', medium: '', elite: '' };
  const classifications: Record<Scenario, number> = { poor: -1, medium: -1, elite: -1 };

  for (const scenario of ['poor', 'medium', 'elite'] as const) {
    paths[scenario] = await createProject(page, scenario);
    const invitationLinks = await createInvitations(page, 5);
    for (const link of invitationLinks) await completeAssessment(page, link, scenario);
    await page.goto(paths[scenario]);
    await expect(page.getByText('Classificação sociotécnica').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Radar de capacidades' }).first()).toBeVisible();
    await page.locator('.radar-drill-link', { hasText: 'Arquitetura e operação' }).first().click();
    await expect(page.getByRole('heading', { name: 'Arquitetura e operação de produtos' })).toBeVisible();
    await page.locator('.radar-drill-link', { hasText: 'Cloud e plataforma' }).click();
    await expect(page.getByRole('heading', { name: 'Cloud e plataforma' })).toBeVisible();
    await page.locator('.radar-drill-link', { hasText: 'Autosserviço' }).click();
    await expect(page.getByRole('heading', { name: 'Autosserviço e experiência de plataforma' })).toBeVisible();
    await page.goto(paths[scenario]);
    const classification = await page.locator('.classification-level').first().textContent();
    classifications[scenario] = Number(classification?.split('·')[0]?.trim());
  }

  for (const scenario of ['poor', 'medium', 'elite'] as const) console.log(`[showcase] ${scenario}: ${paths[scenario]}`);
  expect(classifications.poor).toBeLessThan(classifications.medium);
  expect(classifications.medium).toBeLessThan(classifications.elite);
});

async function createProject(page: Page, scenario: Scenario): Promise<string> {
  await page.goto('/projects/new');
  await page.getByLabel('Nome do projeto').fill(`Showcase ${scenario} ${Date.now()}`);
  const units = page.getByLabel('Nome da unidade');
  await units.nth(0).fill(`Organização ${scenario}`);
  await units.nth(1).fill(`Unidade ${scenario}`);
  await page.getByRole('button', { name: 'Criar projeto' }).click();
  await expect(page.getByRole('heading', { name: /Showcase/ })).toBeVisible();
  return page.url();
}

async function createInvitations(page: Page, quantity: number): Promise<string[]> {
  await page.getByLabel('Quantidade').fill(String(quantity));
  await page.getByRole('button', { name: 'Gerar links' }).click();
  const links = await page.locator('#invitation-links code').allTextContents();
  expect(links).toHaveLength(quantity);
  return links;
}

async function completeAssessment(page: Page, invitationLink: string, scenario: Scenario): Promise<void> {
  await page.goto(invitationLink);
  while (await page.locator('form[data-assessment-node]').count()) {
    const form = page.locator('form[data-assessment-node]');
    const nodeId = await form.getAttribute('data-assessment-node');
    const node = graph.find((candidate) => candidate.id === nodeId);
    if (!node) throw new Error(`Assessment node not found: ${nodeId}`);
    const available = await form.locator('input[name="optionId"]').evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));
    const option = chooseOption(node.options.filter((candidate) => available.includes(candidate.id)), scenario, node.id);
    await form.locator(`input[value="${option.id}"]`).check();
    await Promise.all([page.waitForLoadState('domcontentloaded'), form.getByRole('button', { name: 'Continuar' }).click()]);
  }
  await expect(page.getByRole('heading', { name: 'Obrigado pela participação' })).toBeVisible();
}

function chooseOption(options: typeof graph[number]['options'], scenario: Scenario, nodeId: string) {
  if (nodeId === 'respondent-context') return options.find((option) => option.id === 'engineering')!;
  if (scenario === 'medium' && nodeId === 'change-verification') return options.find((option) => option.id === 'slow-suite')!;
  const scored = options.map((option) => ({ option, score: option.signals.reduce((total, signal) => total + signal.weight, 0) }));
  if (scenario === 'poor') return scored.sort((left, right) => left.score - right.score)[0]!.option;
  if (scenario === 'elite') return scored.sort((left, right) => right.score - left.score)[0]!.option;
  const fragilePositive = scored.filter((candidate) => candidate.score > 0).sort((left, right) => left.score - right.score)[0];
  return fragilePositive?.option ?? scored.sort((left, right) => right.score - left.score)[0]!.option;
}
