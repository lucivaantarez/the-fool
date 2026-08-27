import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));

await page.goto('https://preview.saturnity.site/adopt-me/?demo=1', { waitUntil: 'networkidle' });
await page.locator('.zr-app').waitFor();
const labels = await page.locator('.zr-side nav button span').allTextContents();
if (labels.includes('Joiner') || labels.includes('Account Manager')) throw new Error(`Removed navigation returned: ${labels.join(', ')}`);
if (labels.length !== 10) throw new Error(`Expected 10 navigation items, found ${labels.length}`);
for (const label of ['Accounts', 'Inventory', 'Config', 'Templates', 'Exporter', 'Item Database']) {
  await page.getByRole('button', { name: label, exact: true }).click();
  await page.waitForTimeout(40);
}
await page.getByRole('button', { name: 'Inventory', exact: true }).click();
await page.locator('.zr-inventory-grid>button').first().click();
await page.locator('.zr-item-modal').waitFor();
await page.waitForTimeout(250);
await page.screenshot({ path: '../adoptme-item-inspector.png', fullPage: true });
await page.getByRole('button', { name: 'Close', exact: true }).last().click();
await page.getByRole('button', { name: 'Templates', exact: true }).click();
await page.getByRole('button', { name: 'Create Template', exact: true }).click();
await page.locator('.zr-template-builder').waitFor();
await page.waitForTimeout(250);
await page.screenshot({ path: '../adoptme-template-builder.png', fullPage: true });
await page.getByRole('button', { name: 'Cancel', exact: true }).click();
await page.getByRole('button', { name: 'Exporter', exact: true }).click();
await page.locator('.zr-export-layout').waitFor();
if (await page.locator('.zr-column-groups section').count() !== 6) throw new Error('Exporter column groups are incomplete');
await page.screenshot({ path: '../adoptme-exporter-dense.png', fullPage: true });
await page.getByRole('button', { name: 'Overview', exact: true }).click();
await page.screenshot({ path: '../adoptme-standalone-desktop.png', fullPage: true });

const mobile = await browser.newPage({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 1 });
mobile.on('pageerror', error => errors.push(error.message));
await mobile.goto('https://preview.saturnity.site/adopt-me/?demo=1', { waitUntil: 'networkidle' });
await mobile.locator('.zr-app').waitFor();
const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
if (overflow > 2) throw new Error(`Mobile page overflows horizontally by ${overflow}px`);
await mobile.getByRole('button', { name: 'Inventory', exact: true }).click();
await mobile.locator('.zr-inventory-grid>button').first().click();
await mobile.locator('.zr-item-modal').waitFor();
const itemOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
if (itemOverflow > 2) throw new Error(`Mobile item inspector overflows horizontally by ${itemOverflow}px`);
await mobile.getByRole('button', { name: 'Close', exact: true }).last().click();
await mobile.screenshot({ path: '../adoptme-standalone-mobile.png', fullPage: true });

const signedOut = await browser.newPage({ viewport: { width: 1000, height: 760 } });
await signedOut.goto('https://preview.saturnity.site/adopt-me/', { waitUntil: 'domcontentloaded' });
await signedOut.getByText(/Opening the menagerie|Back to the circus/).waitFor();

await browser.close();
if (errors.length) throw new Error(`Browser errors: ${errors.join(' | ')}`);
console.log(JSON.stringify({ ok: true, labels, mobileOverflow: overflow }));
