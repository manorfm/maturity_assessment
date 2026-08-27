import { expect, test, type Page } from '@playwright/test';
import { graph } from '../../src/modules/catalog/assessment-graph.js';
import type { Profile } from '../../src/modules/catalog/assessment-graph.js';

type Scenario = 'poor' | 'medium' | 'elite';
const squadProfiles: Profile[] = ['quality', 'management', 'product', 'engineering', 'engineering', 'engineering', 'platform'];

test('gera projetos ruim, mediano e elite para inspeção manual', async ({ page }) => {
  const paths: Record<Scenario, string> = { poor: '', medium: '', elite: '' };
  const classifications: Record<Scenario, number> = { poor: -1, medium: -1, elite: -1 };

  for (const scenario of ['poor', 'medium', 'elite'] as const) {
    paths[scenario] = await createProject(page, scenario);
    const invitationLinks = await createInvitations(page, squadProfiles.length);
    for (const [index, link] of invitationLinks.entries()) await completeAssessment(page, link, scenario, squadProfiles[index]!, index);
    await page.goto(paths[scenario]);
    await expect(page.getByText('Resumo executivo').first()).toBeVisible();
    await expect(page.getByText('Risco gerencial').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Radar de capacidades' }).first()).toBeVisible();
    await page.locator('.radar-drill-link', { hasText: 'Operação, confiabilidade e plataforma' }).first().click();
    await expect(page.getByRole('heading', { name: 'Operação, confiabilidade e plataforma' })).toBeVisible();
    await page.locator('.radar-drill-link', { hasText: 'Cloud e infraestrutura' }).click();
    await expect(page.getByRole('heading', { name: 'Cloud e infraestrutura' })).toBeVisible();
    const infrastructure = page.locator('.radar-drill-link', { hasText: 'Infraestrutura reproduzível' });
    if (await infrastructure.evaluate((element) => element.tagName === 'A')) {
      await infrastructure.click();
      await expect(page.getByRole('heading', { level: 1, name: 'Infraestrutura reproduzível' })).toBeVisible();
    } else {
      await expect(infrastructure).toHaveAttribute('aria-disabled', 'true');
      await expect(infrastructure).not.toHaveAttribute('href', /.+/);
    }
    await expect(page.getByRole('link', { name: 'Voltar' })).toBeVisible();
    await expect(page.getByText(/Cobertura temática/)).toBeVisible();
    if (scenario === 'elite') {
      await expect(page.locator('.classification-level')).toContainText('4 / 4');
      await expect(page.locator('.classification-level')).not.toContainText('4.0 / 4');
    }
    if (scenario === 'poor') {
      await expect(page.getByText(/Evidência insuficiente/).first()).toBeVisible();
      await page.getByRole('link', { name: 'Operação, confiabilidade e plataforma' }).click();
      await page.locator('.radar-drill-link', { hasText: 'Plataforma e autonomia' }).click();
      await expect(page.getByRole('heading', { name: 'Prioridades e próximos passos' })).toBeVisible();
      await expect(page.getByText('Impacto no negócio').first()).toBeVisible();
      await expect(page.getByText(/força do diagnóstico \d+%/).first()).toBeVisible();
      await expect(page.getByText('Ação recomendada').first()).toBeVisible();
    }
    await page.goto(paths[scenario]);
    if (scenario === 'elite') {
      await page.locator('.radar-drill-link', { hasText: 'Sistema organizacional' }).first().click();
      await page.locator('.radar-drill-link', { hasText: 'Governança habilitadora' }).click();
      const governanceLevel = Number((await page.locator('.classification-level').textContent())?.split('/')[0]?.trim());
      expect(governanceLevel).toBeGreaterThan(2);
      expect(governanceLevel).toBeLessThan(4);
      await expect(page.getByRole('heading', { name: 'Evoluções recomendadas' })).toBeVisible();
      await page.goto(paths[scenario]);
    }
    const classification = await page.locator('.classification-level').first().textContent();
    classifications[scenario] = Number(classification?.split('·')[0]?.trim());
  }

  for (const scenario of ['poor', 'medium', 'elite'] as const) console.log(`[showcase] ${scenario}: http://127.0.0.1:3217${new URL(paths[scenario]).pathname}`);
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

async function completeAssessment(page: Page, invitationLink: string, scenario: Scenario, profile: Profile, participantIndex: number): Promise<void> {
  await page.goto(invitationLink);
  while (await page.locator('form[data-assessment-node]').count()) {
    const form = page.locator('form[data-assessment-node]');
    const nodeId = await form.getAttribute('data-assessment-node');
    const node = graph.find((candidate) => candidate.id === nodeId);
    if (!node) throw new Error(`Assessment node not found: ${nodeId}`);
    const available = await form.locator('input[name="optionId"]').evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));
    const option = chooseOption(node.options.filter((candidate) => available.includes(candidate.id)), scenario, node.id, profile, participantIndex);
    await form.locator(`input[value="${option.id}"]`).check();
    await Promise.all([page.waitForLoadState('domcontentloaded'), form.getByRole('button', { name: 'Continuar' }).click()]);
  }
  await expect(page.getByRole('heading', { name: 'Obrigado pela participação' })).toBeVisible();
}

function chooseOption(options: typeof graph[number]['options'], scenario: Scenario, nodeId: string, profile: Profile, participantIndex: number) {
  if (nodeId === 'respondent-context') return options.find((option) => option.id === profile)!;
  const scored = options.map((option) => ({ option, score: option.signals.reduce((total, signal) => total + signal.weight, 0) }));
  if (scenario === 'poor') {
    const fragile = scored.filter((candidate) => candidate.score < 0).sort((left, right) => left.score - right.score);
    return (fragile[participantIndex % fragile.length] ?? scored.sort((left, right) => left.score - right.score)[0])!.option;
  }
  if (scenario === 'elite') {
    const strong = scored.sort((left, right) => negativeCost(left.option) - negativeCost(right.option) || right.score - left.score);
    const safest = strong.filter((candidate) => negativeCost(candidate.option) === negativeCost(strong[0]!.option));
    return safest[participantIndex % safest.length]!.option;
  }
  const neutral = scored.find((candidate) => candidate.score === 0);
  const emerging = scored.filter((candidate) => candidate.score > 0).sort((left, right) => left.score - right.score)[0];
  return (neutral ?? emerging ?? scored.sort((left, right) => right.score - left.score)[0])!.option;
}

function negativeCost(option: typeof graph[number]['options'][number]): number {
  return option.signals.reduce((cost, signal) => cost + Math.max(0, -signal.weight), 0);
}
