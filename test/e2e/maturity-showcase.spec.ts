import { readFileSync, writeFileSync } from 'node:fs';
import { expect, test, type Browser, type Page } from '@playwright/test';
import { buildShowcaseGuide, SHOWCASE_GUIDE_PATH, type ShowcaseGuideCase } from './showcase-guide.js';
import type { MaturityBand, SyntheticCaseId } from '../../src/modules/inference/domain/organizational-synthetic.js';

const inspectHost = process.env.SHOWCASE_PUBLIC_URL ?? 'http://127.0.0.1:3217';
const manifestPath = process.env.SHOWCASE_MANIFEST ?? '/private/tmp/maturity-assessment-showcase-poc.json';

type SeededOrg = {
  caseId?: SyntheticCaseId;
  band: MaturityBand;
  title: string;
  story: string;
  expectedOutcome: string;
  lookFor: string[];
  adminPath: string;
  publicPath: string;
};

const expectations: Record<MaturityBand, { id: string; expectedOutcome: string; lookFor: string[]; decision?: RegExp }> = {
  low: {
    id: 'poc-baixa',
    expectedOutcome: 'Publicar limitador, decisão de diretoria e ação por unidade, sem contradizer o elo frágil.',
    lookFor: [
      'Amostra de 18 pessoas em duas unidades.',
      'Briefing de diretoria com decisão ou restrição compartilhada.',
      'Cada unidade com ação local, restrição recebida ou escalada.',
      'First screen fecha corrigir ou evoluir — não “distinguir explicações”.',
    ],
    decision: /Precisa de correção|Pode evoluir/i,
  },
  medium: {
    id: 'poc-media',
    expectedOutcome: 'Mostrar prática intermediária com findings e ações, distinta da organização frágil e da sustentada.',
    lookFor: [
      'Vários pilares publicados, sem inventar nível onde a entrevista curta não passou.',
      'Diretoria e áreas recebem texto acionável.',
      'O cartão principal tem causa e experimento, não disputa de explicações.',
    ],
    decision: /Pode evoluir|Precisa de correção/i,
  },
  high: {
    id: 'poc-alta',
    expectedOutcome: 'Preservar o comportamento observado sem exigir cargo, ferramenta sofisticada ou transformação organizacional.',
    lookFor: [
      'Decisão de preservar a prática.',
      'Folhas fortes com cobertura, pilares sem dois padrões continuam não avaliados.',
      'Não converte ausência de problema em lista de evoluções genéricas.',
    ],
    decision: /Manter o que funciona/i,
  },
};

test('apresenta três casos depois de percorrer o produto e validar os relatórios', async ({ browser, page, baseURL }) => {
  test.setTimeout(180_000);
  const seeded = JSON.parse(readFileSync(manifestPath, 'utf8')) as SeededOrg[];
  const banded = seeded.filter((org) => isBandedCase(org));
  const boundary = seeded.find((org) => org.caseId === 'boundary');
  const engineeringPractice = seeded.find((org) => org.caseId === 'engineering-practice');
  expect(banded.map((entry) => entry.band)).toEqual(['low', 'medium', 'high']);
  expect(boundary, 'showcase seed must include the team-boundary contrast').toBeTruthy();
  expect(engineeringPractice, 'showcase seed must include the low-engineering-practice contrast').toBeTruthy();
  await walkApplicationLoop(page);
  const collected = await Promise.all(banded.map((org) => inspectSeededOrg(browser, org, baseURL)));
  const readings = collected.map((entry) => `${entry.observed?.decision}|${entry.observed?.limiter}|${entry.observed?.reading}`);
  expect(new Set(readings).size).toBe(3);
  expect(collected[0]?.observed?.decision ?? '').not.toMatch(/Manter o que funciona/i);
  expect(collected[2]?.observed?.decision ?? '').toMatch(/Manter o que funciona/i);
  await inspectBoundaryOrg(browser, boundary!, baseURL);
  await inspectEngineeringPracticeOrg(browser, engineeringPractice!, baseURL);

  writeFileSync(SHOWCASE_GUIDE_PATH, buildShowcaseGuide(collected));
  await page.goto('/showcase');
  await expect(page.getByRole('heading', { name: 'Diagnóstico de engenharia' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Como o sistema funciona' })).toBeVisible();
  await expect(page.getByText('3 de 3 casos concluídos')).toBeVisible();
  await expect(page.getByText('entrevistas simuladas')).toBeVisible();
  await expect(page.getByText('18 pessoas em duas unidades').first()).toBeVisible();
  await expect(page.getByText(/Validação humana pendente/)).toHaveCount(0);
  for (const entry of collected) await expect(page.getByRole('heading', { name: entry.title })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Abrir relatório' })).toHaveCount(3);

  console.log(`[showcase] apresentação: ${inspectHost}/showcase`);
  for (const entry of collected) console.log(`[showcase] ${entry.id}: ${entry.adminUrl}`);
});

async function inspectSeededOrg(browser: Browser, org: SeededOrg, baseURL: string | undefined): Promise<ShowcaseGuideCase> {
  const context = await browser.newContext(baseURL ? { baseURL } : {});
  const page = await context.newPage();
  try {
    return await readSeededOrg(page, org);
  } finally {
    await context.close();
  }
}

async function readSeededOrg(page: Page, org: SeededOrg): Promise<ShowcaseGuideCase> {
  const expected = expectations[org.band];
  await page.goto(org.adminPath);
  await expect(page.getByText('O que as entrevistas mostraram').first()).toBeVisible();
  await expect(page.getByText(/Amostra desta leitura/).first()).toBeVisible();
  await expect(page.getByText(/18 pessoas em 2 unidades/).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sistemas da organização' })).toBeVisible();
  await expect(page.getByText('Mapa de contraste e cobertura').first()).toBeVisible();
  await expect(page.getByText('Aguarde mais respostas')).toHaveCount(0);
  if (org.band !== 'high') {
    await expect(page.getByRole('heading', { name: 'Outras restrições' })).toBeVisible();
    await expect(page.getByText(/mecanismo distinto/)).toBeVisible();
  }
  await expect(page.getByText('Instrumento e calibração')).not.toBeVisible();
  const observed = await observeReport(page);
  if (expected.decision) expect(observed.decision).toMatch(expected.decision);
  expect(observed.limiter).not.toMatch(/e mais/i);
  expect(observed.reading.length).toBeGreaterThan(40);
  if (org.band !== 'high') {
    await expect(page.getByText('O que esta decisão não resolve').first()).toBeVisible();
    await page.getByText('Leituras por público').click();
    await expect(page.getByRole('heading', { name: 'Briefing para diretoria' })).toBeVisible();
  }
  await walkHomeToLeaf(page);
  return {
    id: expected.id,
    scenarioIds: [],
    title: org.title,
    story: org.story,
    expectedOutcome: expected.expectedOutcome,
    lookFor: org.lookFor?.length ? org.lookFor : expected.lookFor,
    adminUrl: toInspectUrl(org.adminPath),
    publicUrl: toInspectUrl(org.publicPath),
    observed,
  };
}

async function observeReport(page: Page) {
  const reading = (await page.locator('.executive-reading').first().textContent())?.trim() ?? '';
  const limiter = (await page.locator('.outcome-scope').first().textContent())?.replace(/^Onde aparece:\s*/i, '').trim() ?? '';
  const decision = (await page.locator('.outcome-card > .tag').first().textContent())?.trim() ?? '';
  const classificationLocator = page.locator('.classification-level').first();
  const classification = await classificationLocator.count()
    ? await classificationLocator.evaluate((el) => el.textContent?.trim() ?? '')
    : 'Sem classificação ordinal por cobertura insuficiente';
  return { decision, classification, reading, limiter };
}

function toInspectUrl(path: string): string {
  return `${inspectHost}${path}`;
}

function isBandedCase(org: SeededOrg): boolean {
  return (org.caseId ?? org.band) === org.band;
}

async function walkApplicationLoop(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Crie um mapa do sistema de trabalho' })).toBeVisible();
  await page.getByLabel('Nome do projeto').fill('Demonstração ao vivo');
  const names = page.locator('[data-hierarchy-tree] input');
  await names.nth(0).fill('Organização demonstração');
  await names.nth(1).fill('Time Alfa');
  await expect(page.getByRole('button', { name: 'Criar projeto' })).toBeEnabled();
  await page.getByRole('button', { name: 'Criar projeto' }).click();
  await expect(page.getByRole('heading', { name: 'Demonstração ao vivo' })).toBeVisible();
  await expect(page.getByText('Operação do piloto')).toBeVisible();
  await page.getByText('Operação do piloto').click();
  await page.getByRole('button', { name: 'Gerar links' }).click();
  await expect(page.getByRole('heading', { name: 'Distribua um link por pessoa' })).toBeVisible();
  const invite = page.locator('#invitation-links code').first();
  await expect(invite).toBeVisible();
  const href = (await invite.textContent())?.trim() ?? '';
  expect(href).toMatch(/\/invite\//);
  await page.goto(new URL(href).pathname);
  for (let step = 0; step < 80; step += 1) {
    if (await page.getByRole('heading', { name: 'Obrigado pela participação' }).count()) break;
    const option = page.locator('input[name="optionId"]').first();
    await expect(option).toBeVisible();
    await option.check();
    await page.getByRole('button', { name: 'Continuar' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Obrigado pela participação' })).toBeVisible();
}

async function inspectBoundaryOrg(browser: Browser, org: SeededOrg, baseURL: string | undefined): Promise<void> {
  const context = await browser.newContext(baseURL ? { baseURL } : {});
  const page = await context.newPage();
  try {
    await page.goto(org.adminPath);
    await expect(page.getByRole('heading', { name: 'Sistemas da organização' })).toBeVisible();
    await expect(page.locator('.area-tile.observed a', { hasText: 'Engenharia' })).toBeVisible();
    await expect(page.locator('.area-band', { hasText: 'Gestão' })).toBeVisible();
    await expect(page.getByText(/responsab|fronteira|ownership/i).first()).toBeVisible();
    await walkHomeToLeaf(page);
  } finally {
    await context.close();
  }
}

async function inspectEngineeringPracticeOrg(browser: Browser, org: SeededOrg, baseURL: string | undefined): Promise<void> {
  const context = await browser.newContext(baseURL ? { baseURL } : {});
  const page = await context.newPage();
  try {
    await page.goto(org.adminPath);
    await expect(page.getByRole('heading', { name: 'Inventário por frente' })).toBeVisible();
    await expect(page.getByText(/origem|artefato|autorização no recurso|war room|post-mortem/i).first()).toBeVisible();
    await page.getByText('Leituras por público').click();
    await expect(page.getByRole('heading', { name: 'Briefing de política' })).toBeVisible();
    await expect(page.getByText(/O que parar de autorizar/)).toBeVisible();
    await expect(page.getByText(/adote blameless/i)).toHaveCount(0);
    await walkHomeToLeaf(page);
  } finally {
    await context.close();
  }
}

async function walkHomeToLeaf(page: Page): Promise<void> {
  const system = page.locator('.area-tile.observed a').first();
  await expect(system).toBeVisible();
  await system.click();
  await expect(page.getByText('Mapa de contraste e cobertura').first()).toBeVisible();
  await expect(page.locator('nav.capability-navigation')).toBeVisible();
  const next = page.locator('.area-index-link').first();
  if (await next.count()) {
    await next.click();
    await expect(page.locator('h1')).toBeVisible();
  }
  if (page.url().includes('/areas/') && await page.locator('.area-index-link').count()) {
    await page.locator('.area-index-link').first().click();
    await expect(page.locator('h1')).toBeVisible();
  }
  expect(page.url()).toMatch(/\/(areas|capabilities)\//);
}
