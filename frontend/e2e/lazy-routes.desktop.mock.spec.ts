import { readFileSync } from 'node:fs';
import type { Page } from '@playwright/test';
import { test, expect } from './support/mock-fixture.ts';
import { mockLogin } from './support/login.ts';
import { expectNoSeriousA11y } from './support/a11y.ts';

type ManifestEntry = { file: string; isDynamicEntry?: boolean; imports?: string[] };
const manifest = JSON.parse(readFileSync(new URL('../dist/.vite/manifest.json', import.meta.url), 'utf8')) as Record<string, ManifestEntry>;
const files = {
  news: 'src/pages/admin/news/NewsEditorPage.tsx',
  gallery: 'src/pages/admin/gallery/GalleryEditorPage.tsx',
  cms: 'src/pages/admin/cms/CmsHubPage.tsx',
  builder: 'src/pages/admin/cms/CmsPageBuilderPage.tsx',
  club: 'src/pages/admin/club-hub/ClubHubPage.tsx',
  season: 'src/pages/admin/competition-hub/SeasonHubPage.tsx',
  membership: 'src/pages/admin/MembershipAdminPage.tsx',
  ticketing: 'src/pages/admin/TicketingAdminPage.tsx',
};

function asset(key: keyof typeof files) {
  const entry = manifest[files[key]];
  if (!entry?.isDynamicEntry || !entry.file) throw new Error(`Nedostaje dinamički manifest entry: ${files[key]}`);
  return `/${entry.file}`;
}

async function mockEditorLookups(page: Page) {
  await page.route('**/api/v1/gallery*', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/v1/players*', (route) => route.fulfill({ json: [] }));
}

test('osam ruta je dinamički i nisu dio statičkog početnog grafa', async () => {
  const initial = new Set<string>();
  const visit = (key: string) => {
    if (initial.has(key)) return;
    initial.add(key);
    for (const dependency of manifest[key]?.imports ?? []) visit(dependency);
  };
  visit('index.html');
  for (const key of Object.keys(files) as (keyof typeof files)[]) {
    expect(asset(key)).toMatch(/\.js$/);
    const initialFiles = [...initial].map((id) => manifest[id]?.file);
    expect(initialFiles, `${files[key]} ne smije biti početni import`).not.toContain(asset(key).slice(1));
  }
});

test('direktna zaštićena ruta bez prijave ne učitava urednik', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(new URL(request.url()).pathname));
  await page.goto('/admin/news/new');
  await expect(page).toHaveURL(/\/prijava$/);
  await expect(page.getByRole('button', { name: 'Prijavi se' })).toBeVisible();
  expect(requests).not.toContain(asset('news'));
});

test('direktni URL: dostupni status i admin navigacija dok se urednik učitava', async ({ page }) => {
  await mockEditorLookups(page);
  await mockLogin(page);
  let release!: () => void;
  let started!: () => void;
  const wait = new Promise<void>((resolve) => { release = resolve; });
  const requested = new Promise<void>((resolve) => { started = resolve; });
  await page.route(`**${asset('news')}`, async (route) => { started(); await wait; await route.continue(); });
  const navigation = page.goto('/admin/news/new', { waitUntil: 'domcontentloaded' });
  try {
    await requested;
    await expect(page.getByRole('status')).toHaveText('Učitavanje...');
    await expect(page.locator('aside').first().getByRole('link', { name: 'FK Admin' })).toBeVisible();
    await expectNoSeriousA11y(page, 'status učitavanja admin rute');
  } finally {
    release();
  }
  await navigation;
  await expect(page.getByRole('heading', { name: 'Nova vijest' })).toBeVisible();
  await expect(page.getByRole('status')).toHaveCount(0);
  await expect(page.locator('#news-editor-form')).toBeVisible();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.tiptap[contenteditable="true"]')).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('interna navigacija do urednika i povratak zadržavaju URL-ove', async ({ page }) => {
  await mockEditorLookups(page);
  await mockLogin(page);
  await page.goto('/admin/news');
  await page.getByRole('link', { name: 'Nova vijest' }).click();
  await expect(page).toHaveURL(/\/admin\/news\/new$/);
  await expect(page.getByRole('heading', { name: 'Nova vijest' })).toBeVisible();
  await page.getByRole('button', { name: 'Odustani' }).click();
  await expect(page).toHaveURL(/\/admin\/news$/);
});

test('module i permission guard ne preuzimaju onemogućenu ili nedopuštenu rutu', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(new URL(request.url()).pathname));
  await page.route('**/api/v1/settings/module-flags', (route) => route.fulfill({ json: { 'modules.news': 'false' } }));
  await mockLogin(page);
  await page.goto('/admin/news/new');
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Kontrolna tabla' })).toBeVisible();
  await page.goto('/admin/membership');
  await expect(page).toHaveURL(/\/admin$/);
  expect(requests).not.toContain(asset('news'));
  expect(requests).not.toContain(asset('membership'));
});

test('neuspjeli chunk ima poruku i ručni reload koji oporavlja rutu', async ({ page }) => {
  await mockEditorLookups(page);
  await mockLogin(page);
  await page.route(`**${asset('news')}`, (route) => route.abort('failed'), { times: 1 });
  await page.goto('/admin/news/new', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('alert')).toContainText('Stranicu nije moguće učitati');
  await expect(page.locator('aside').first().getByRole('link', { name: 'FK Admin' })).toBeVisible();
  await page.getByRole('button', { name: 'Ponovo učitaj stranicu' }).click();
  await expect(page).toHaveURL(/\/admin\/news\/new$/);
  await expect(page.getByRole('heading', { name: 'Nova vijest' })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});


test('urednik nakon direktnog ulaza i reloada radi i šalje izmijenjeni sadržaj u mock', async ({ page }) => {
  await mockEditorLookups(page);
  let saved: { title?: string; content?: string } | undefined;
  await page.route('**/api/v1/news', async (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    saved = route.request().postDataJSON() as { title?: string; content?: string };
    await route.fulfill({ json: { id: 'mock-news' } });
  });
  await page.route('**/api/v1/news/mock-news', (route) => route.fulfill({ json: {
    id: 'mock-news', title: saved?.title ?? '', slug: 'probna-vijest', content: saved?.content ?? '', tags: [],
  } }));
  await mockLogin(page);
  await page.goto('/admin/news/new');
  await expect(page.locator('.tiptap[contenteditable="true"]')).toBeVisible();
  await page.waitForLoadState('networkidle');
  await page.reload();
  const editor = page.locator('.tiptap[contenteditable="true"]');
  await expect(editor).toBeVisible();
  await page.waitForLoadState('networkidle');
  await page.locator('input[name="title"]').fill('Probna vijest');
  await editor.fill('Ovo je probni sadržaj vijesti.');
  await page.getByRole('button', { name: 'Kreiraj (nacrt)' }).click();
  await expect(page).toHaveURL(/\/admin\/news\/mock-news\/edit$/);
  await expect(page.getByRole('heading', { name: 'Uredi vijest' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Uredi vijest' })).toBeVisible();
  expect(saved?.title).toBe('Probna vijest');
  expect(saved?.content).toContain('Ovo je probni sadržaj vijesti.');
  await expect(page.getByRole('alert')).toHaveCount(0);
});
