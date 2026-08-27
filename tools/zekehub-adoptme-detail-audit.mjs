import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const output = resolve(process.cwd(), 'zekehub-captures', 'detail-audit');
const context = await chromium.launchPersistentContext(resolve(process.cwd(), 'zekehub-session'), {
  headless: true,
  viewport: { width: 1440, height: 1000 },
});
const page = context.pages()[0] || await context.newPage();
await mkdir(output, { recursive: true });
await page.goto('https://zekehub.com/dashboard/adoptme', { waitUntil: 'networkidle', timeout: 45_000 });
if (/discord\.com|\/login/i.test(page.url())) throw new Error('Saved ZekeHub session has expired.');
await page.getByRole('button', { name: /close tour/i }).click({ timeout: 2500 }).catch(() => {});

const clean = value => String(value || '')
  .replace(/\b(?:api|access|secret|cookie)\s*(?:key|token)?\s*[:=]\s*\S+/gi, '[redacted]')
  .replace(/\b[A-Za-z0-9_-]{32,}\b/g, '[redacted]');
const save = async name => {
  const data = await page.evaluate(() => ({
    headings: [...document.querySelectorAll('h1,h2,h3,h4')].filter(x => x.offsetParent).map(x => x.textContent?.trim()).filter(Boolean),
    buttons: [...document.querySelectorAll('button')].filter(x => x.offsetParent).map(x => x.textContent?.trim() || x.ariaLabel || x.title).filter(Boolean),
    controls: [...document.querySelectorAll('input,select,textarea')].filter(x => x.offsetParent).map(x => ({ type: x.type || x.tagName, label: x.ariaLabel || x.placeholder || x.name || '' })),
    text: document.body.innerText,
  }));
  const safe = { headings: data.headings.map(clean), buttons: data.buttons.map(clean), controls: data.controls.map(x => ({ ...x, label: clean(x.label) })), text: clean(data.text) };
  await writeFile(resolve(output, `${name}.json`), JSON.stringify(safe, null, 2));
  await page.screenshot({ path: resolve(output, `${name}.png`), fullPage: true });
};
const nav = async label => {
  await page.getByRole('button', { name: label, exact: true }).first().click();
  await page.waitForTimeout(300);
};
const openAndSave = async (locator, name) => {
  if (!await locator.isVisible().catch(() => false)) return false;
  await locator.click();
  await page.waitForTimeout(250);
  await save(name);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(120);
  return true;
};

await nav('Inventory');
const inventoryCard = page.locator('button').filter({ hasText: /Mouse/ }).filter({ hasText: /Newborn/ }).last();
await openAndSave(inventoryCard, 'inventory-item-detail');

await nav('Templates');
await openAndSave(page.getByRole('button', { name: 'Create Template', exact: true }), 'template-create');
await openAndSave(page.getByRole('button', { name: 'Import', exact: true }), 'template-import');
await openAndSave(page.getByRole('button', { name: /2 groups/i }).last(), 'template-auto-apply');

await nav('Exporter');
await openAndSave(page.getByRole('button', { name: /Import credentials/i }).last(), 'exporter-credentials');
await openAndSave(page.getByRole('button', { name: /Filters/i }).last(), 'exporter-filters');

await nav('Item Database');
await save('item-database-page');
await nav('Settings');
await save('settings-page');

await context.close();
console.log('Adopt Me detail audit captured.');
