import { readFileSync, writeFileSync } from 'node:fs';
import { expect, test, type Browser, type Page } from '@playwright/test';
import { buildShowcaseGuide, SHOWCASE_GUIDE_PATH, type ShowcaseGuideCase } from './showcase-guide.js';
import type { MaturityBand } from '../../src/modules/inference/domain/organizational-synthetic.js';

const inspectHost = process.env.SHOWCASE_PUBLIC_URL ?? 'http://127.0.0.1:3217';
const manifestPath = process.env.SHOWCASE_MANIFEST ?? '/private/tmp/maturity-assessment-showcase-poc.json';

type SeededOrg = {
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
    decision: /Corrigir|Evoluir/i,
  },
  medium: {
    id: 'poc-media',
    expectedOutcome: 'Mostrar prática intermediária com findings e ações, distinta da organização frágil e da sustentada.',
    lookFor: [
      'Vários pilares publicados, sem inventar nível onde a entrevista curta não passou.',
      'Diretoria e áreas recebem texto acionável.',
      'O cartão principal tem causa e experimento, não disputa de explicações.',
    ],
    decision: /Evoluir|Corrigir/i,
  },
  high: {
    id: 'poc-alta',
    expectedOutcome: 'Preservar o comportamento observado sem exigir cargo, ferramenta sofisticada ou transformação organizacional.',
    lookFor: [
      'Decisão de preservar a prática.',
      'Folhas fortes com cobertura, pilares sem dois padrões continuam não avaliados.',
      'Não converte ausência de problema em lista de evoluções genéricas.',
    ],
    decision: /Preservar/i,
  },
};

test('gera relatórios organizacionais de baixa, média e alta para inspeção da POC', async ({ browser, page, baseURL }) => {
  const seeded = JSON.parse(readFileSync(manifestPath, 'utf8')) as SeededOrg[];
  expect(seeded.map((entry) => entry.band)).toEqual(['low', 'medium', 'high']);
  const collected = await Promise.all(seeded.map((org) => inspectSeededOrg(browser, org, baseURL)));
  const readings = collected.map((entry) => `${entry.observed?.decision}|${entry.observed?.limiter}|${entry.observed?.reading}`);
  expect(new Set(readings).size).toBe(3);
  expect(collected[0]?.observed?.decision ?? '').not.toMatch(/Preservar/i);
  expect(collected[2]?.observed?.decision ?? '').toMatch(/Preservar/i);

  writeFileSync(SHOWCASE_GUIDE_PATH, buildShowcaseGuide(collected));
  await page.goto('/showcase');
  await expect(page.getByRole('heading', { name: 'Índice de inspeção' })).toBeVisible();
  await expect(page.getByText('não substituem calibração')).toBeVisible();
  await expect(page.getByText('3 de 3 relatórios organizacionais da POC com coerência sintética.')).toBeVisible();
  await expect(page.getByText(/Validação humana pendente/)).toBeVisible();
  for (const entry of collected) await expect(page.getByRole('heading', { name: entry.title })).toBeVisible();

  console.log(`[showcase] índice: ${inspectHost}/showcase`);
  for (const entry of collected) console.log(`[showcase] ${entry.id}: ${entry.adminUrl}`);
});

async function inspectSeededOrg(browser: Browser, org: SeededOrg, baseURL: string | undefined): Promise<ShowcaseGuideCase> {
  const context = await browser.newContext({ baseURL });
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
  await expect(page.getByText('Próxima decisão').first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sistemas da organização' })).toBeVisible();
  const observed = await observeReport(page);
  if (expected.decision) expect(observed.decision).toMatch(expected.decision);
  expect(observed.limiter).not.toMatch(/e mais/i);
  expect(observed.reading.length).toBeGreaterThan(40);
  if (org.band !== 'high') {
    await expect(page.getByText('O que esta decisão não resolve').first()).toBeVisible();
    await page.getByText('Leituras por público').click();
    await expect(page.getByRole('heading', { name: 'Briefing para diretoria' })).toBeVisible();
  }
  return {
    id: expected.id,
    scenarioIds: [],
    title: org.title,
    story: org.story,
    expectedOutcome: expected.expectedOutcome,
    lookFor: expected.lookFor,
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
