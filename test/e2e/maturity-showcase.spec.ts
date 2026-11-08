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
      'First screen lista problemas por área com caminho, não uma decisão única.',
    ],
    decision: /Achados|laudo/i,
  },
  medium: {
    id: 'poc-media',
    expectedOutcome: 'Mostrar prática intermediária com findings e ações, distinta da organização frágil e da sustentada.',
    lookFor: [
      'Vários pilares publicados, sem inventar nível onde a entrevista curta não passou.',
      'Diretoria e áreas recebem texto acionável.',
      'O índice traz causa e caminho por dor, não uma disputa de explicações.',
    ],
    decision: /Achados|laudo/i,
  },
  high: {
    id: 'poc-alta',
    expectedOutcome: 'Preservar o comportamento observado sem exigir cargo, ferramenta sofisticada ou transformação organizacional.',
    lookFor: [
      'Prática forte com uma evolução publicada, não preservação vazia.',
      'Folhas fortes com cobertura, pilares sem dois padrões continuam não avaliados.',
      'A melhoria é o resto observado, não um programa genérico.',
    ],
    decision: /Achados|laudo/i,
  },
};

test('apresenta três casos depois de percorrer o produto e validar os relatórios', async ({ browser, page, baseURL }) => {
  test.setTimeout(180_000);
  const seeded = JSON.parse(readFileSync(manifestPath, 'utf8')) as SeededOrg[];
  const banded = seeded.filter((org) => isBandedCase(org));
  const boundary = seeded.find((org) => org.caseId === 'boundary');
  const engineeringPractice = seeded.find((org) => org.caseId === 'engineering-practice');
  const securityGovernance = seeded.find((org) => org.caseId === 'security-governance');
  expect(banded.map((entry) => entry.band)).toEqual(['low', 'medium', 'high']);
  expect(boundary, 'showcase seed must include the team-boundary contrast').toBeTruthy();
  expect(engineeringPractice, 'showcase seed must include the low-engineering-practice contrast').toBeTruthy();
  expect(securityGovernance, 'showcase seed must include the security-governance contrast').toBeTruthy();
  await walkApplicationLoop(page);
  const collected = await Promise.all(banded.map((org) => inspectSeededOrg(browser, org, baseURL)));
  const readings = collected.map((entry) => `${entry.observed?.decision}|${entry.observed?.limiter}|${entry.observed?.reading}`);
  expect(new Set(readings).size).toBe(3);
  expect(collected[0]?.observed?.decision ?? '').toMatch(/laudo/i);
  expect(collected[0]?.observed?.decision ?? '').not.toMatch(/Pode evoluir|Manter o que funciona/i);
  expect(collected[2]?.observed?.decision ?? '').toMatch(/laudo/i);
  expect(collected[2]?.observed?.decision ?? '').not.toMatch(/Manter o que funciona/i);
  await inspectBoundaryOrg(browser, boundary!, baseURL);
  await inspectEngineeringPracticeOrg(browser, engineeringPractice!, baseURL);
  await inspectSecurityGovernanceOrg(browser, securityGovernance!, baseURL);

  writeFileSync(SHOWCASE_GUIDE_PATH, buildShowcaseGuide(collected));
  await page.goto('/showcase');
  await expect(page.getByRole('heading', { name: 'Simulações do relatório' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Como o sistema funciona' })).toBeVisible();
  await expect(page.getByText(/organizações simuladas|organização simulada/)).toBeVisible();
  await expect(page.getByText('Menos madura').first()).toBeVisible();
  await expect(page.getByText('Intermediária').first()).toBeVisible();
  await expect(page.getByText('Madura').first()).toBeVisible();
  await expect(page.getByText('18 pessoas em duas unidades').first()).toBeVisible();
  await expect(page.getByText(/Validação humana pendente/)).toHaveCount(0);
  for (const entry of collected) await expect(page.getByRole('heading', { name: entry.title })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'POC — segurança distinta de governança' })).toHaveCount(0);
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
  await expect(page.getByRole('heading', { name: 'Diagnóstico da área de tecnologia' })).toBeVisible();
  if (org.band === 'high') {
    await expect(page.getByText(/emergência é reconciliada/i).first()).toBeVisible();
  }
  await expect(page.getByText(/Amostra desta leitura/).first()).toBeVisible();
  await expect(page.getByText(/18 pessoas em 2 unidades/).first()).toBeVisible();
  await expect(page.getByText('Aguarde mais respostas')).toHaveCount(0);
  if (org.band !== 'high') {
    await expect(page.getByRole('heading', { name: 'Como as disciplinas se cruzam' })).toHaveCount(0);
    await expect(page.getByText('O que este caminho não resolve').first()).toBeVisible();
  }
  await expect(page.getByText('posterior exibido permanece provisório')).not.toBeVisible();
  const observed = await observeReport(page);
  if (expected.decision) expect(observed.decision).toMatch(expected.decision);
  expect(observed.decision).toMatch(/Laudo/i);
  expect(observed.limiter).not.toMatch(/e mais/i);
  expect(observed.reading.length).toBeGreaterThan(40);
  if (org.band === 'high') {
    expect(observed.reading).toMatch(/emergência(?:\s+é)?\s+reconciliada/i);
  }
  if (org.band !== 'high') {
    await page.getByRole('link', { name: 'Visão por público' }).click();
    await expect(page.getByRole('heading', { level: 1, name: /mesmo achado/i })).toBeVisible();
  }
  await page.getByRole('link', { name: 'Mapa' }).click();
  await expect(page.getByRole('heading', { name: 'Sistemas da organização' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Por capacidade' })).toBeVisible();
  await page.getByRole('link', { name: 'Plano de tratamento' }).click();
  await expect(page.getByRole('heading', { name: 'Quem faz o quê, e em que ordem' })).toBeVisible();
  await page.getByRole('link', { name: 'Área: Operação' }).click();
  await expect(page.getByRole('heading', { name: /Operação/ })).toBeVisible();
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
  const fact = (await page.locator('.report-finding-fact').first().textContent())?.trim() ?? '';
  const narrative = (await page.locator('.report-block').filter({ has: page.getByRole('heading', { name: 'Leitura geral' }) }).locator('p').last().textContent())?.trim() ?? '';
  const reading = (fact.length > 40 ? fact : narrative.length > 40 ? narrative : fact || narrative).trim();
  const limiter = (await page.locator('.report-finding').first().textContent())?.trim() ?? '';
  const decision = (await page.locator('a[aria-current="page"]').first().textContent())?.trim() ?? '';
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
  await expect(page.getByRole('heading', { name: 'Novo diagnóstico' })).toBeVisible();
  await page.getByLabel('Nome do projeto').fill('Demonstração ao vivo');
  const names = page.locator('[data-hierarchy-tree] input');
  await names.nth(0).fill('Organização demonstração');
  await names.nth(1).fill('Time Alfa');
  await expect(page.getByRole('button', { name: 'Criar projeto' })).toBeEnabled();
  await page.getByRole('button', { name: 'Criar projeto' }).click();
  await expect(page.getByText('Operação do piloto')).toBeVisible();
  const pilotOps = page.locator('details').filter({ has: page.getByText('Operação do piloto', { exact: true }) }).first();
  if (!(await pilotOps.evaluate((el) => (el as HTMLDetailsElement).open))) {
    await pilotOps.locator('summary').click();
  }
  await expect(page.getByRole('button', { name: 'Gerar links' })).toBeVisible();
  await page.getByRole('button', { name: 'Gerar links' }).click();
  await expect(page.getByRole('heading', { name: 'Distribua um link por pessoa' })).toBeVisible();
  const invite = page.locator('#invitation-links code').first();
  await expect(invite).toBeVisible();
  const href = (await invite.textContent())?.trim() ?? '';
  expect(href).toMatch(/\/invite\//);
  await page.goto(new URL(href).pathname);
  await page.getByRole('button', { name: 'Começar' }).click();
  for (let step = 0; step < 80; step += 1) {
    if (await page.getByRole('heading', { name: 'Obrigado.' }).count()) break;
    const freeText = page.locator('textarea[name="freeText"]');
    if (await freeText.count()) {
      await freeText.fill('Um exemplo anônimo do que costuma acontecer no time.');
      await page.getByRole('button', { name: 'Continuar' }).click();
      continue;
    }
    const choice = page.locator('.interview-choice').first();
    await expect(choice).toBeVisible();
    await choice.click();
    await page.getByRole('button', { name: 'Continuar' }).click();
  }
  await expect(page.getByRole('heading', { name: 'Obrigado.' })).toBeVisible();
}

async function inspectBoundaryOrg(browser: Browser, org: SeededOrg, baseURL: string | undefined): Promise<void> {
  const context = await browser.newContext(baseURL ? { baseURL } : {});
  const page = await context.newPage();
  try {
    await page.goto(org.adminPath);
    await page.getByRole('link', { name: 'Mapa' }).click();
    await expect(page.getByRole('heading', { name: 'Sistemas da organização' })).toBeVisible();
    await expect(page.locator('.area-tile.observed a', { hasText: 'Engenharia' })).toBeVisible();
    await expect(page.locator('.area-tile a', { hasText: 'Organização' })).toBeVisible();
    await expect(page.getByText(/responsab|fronteira|ownership/i).first()).toBeVisible();
    await walkHomeToLeaf(page);
  } finally {
    await context.close();
  }
}

async function inspectSecurityGovernanceOrg(browser: Browser, org: SeededOrg, baseURL: string | undefined): Promise<void> {
  const context = await browser.newContext(baseURL ? { baseURL } : {});
  const page = await context.newPage();
  try {
    await page.goto(org.adminPath);
    await page.getByRole('link', { name: 'Mapa' }).click();
    await expect(page.getByRole('heading', { name: 'Sistemas da organização' })).toBeVisible();
    await expect(page.getByText(/Segurança/i).first()).toBeVisible();
    await expect(page.getByText(/Governança/i).first()).toBeVisible();
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
    await expect(page.getByRole('heading', { name: 'Como as disciplinas se cruzam' })).toHaveCount(0);
    await expect(page.getByText(/autoriza o recurso|identidade|credencial/i).first()).toBeVisible();
    await page.getByRole('link', { name: 'Visão por público' }).click();
    await expect(page.getByRole('heading', { level: 1, name: /mesmo achado/i })).toBeVisible();
    await expect(page.getByText(/adote blameless/i)).toHaveCount(0);
    await walkHomeToLeaf(page);
  } finally {
    await context.close();
  }
}

async function walkHomeToLeaf(page: Page): Promise<void> {
  if (!page.url().includes('/report/map')) await page.getByRole('link', { name: 'Mapa' }).click();
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
