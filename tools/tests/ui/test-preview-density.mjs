import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const output = 'artifacts/tests/ui';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors = [];

async function sharedPage(viewport) {
  const page = await browser.newPage({ viewport });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`https://preview.saturnity.site/?shared-preview=1&audit=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await page.locator('#sv-fool-shared-app').waitFor({ state: 'attached' });
  await page.evaluate(() => {
    const gate = document.querySelector('#sv-fool-touch-gate');
    const app = document.querySelector('#sv-fool-shared-app');
    const privateApp = document.querySelector('#app');
    if (privateApp) privateApp.style.display = 'none';
    if (gate) { gate.hidden = true; gate.style.display = 'none'; }
    if (app) { app.hidden = false; app.style.display = 'block'; }
  });
  return page;
}

const desktop = await sharedPage({ width: 1440, height: 900 });
const overflow = await desktop.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
if (overflow > 2) throw new Error(`Shared dashboard overflows by ${overflow}px`);
const mapHeights = await desktop.locator('.sv-shared-dashboard-map>*').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().height));
if (Math.max(...mapHeights) > 150) throw new Error(`Shared dashboard map remains oversized: ${mapHeights.join(', ')}`);
await desktop.screenshot({ path: `${output}/shared-dashboard-compact.png`, fullPage: true });

for (const view of ['usernames', 'splitter', 'pslinks', 'scripts']) {
  await desktop.locator(`[data-fool-view="${view}"]`).click();
  await desktop.locator(`[data-fool-panel="${view}"]`).waitFor();
  const pageOverflow = await desktop.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (pageOverflow > 2) throw new Error(`${view} overflows by ${pageOverflow}px`);
  await desktop.screenshot({ path: `${output}/shared-${view}-compact.png`, fullPage: true });
}

const mobile = await sharedPage({ width: 360, height: 800 });
for (const view of ['dashboard', 'usernames', 'splitter', 'pslinks']) {
  await mobile.locator(`[data-fool-view="${view}"]`).click();
  const pageOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (pageOverflow > 2) throw new Error(`Mobile ${view} overflows by ${pageOverflow}px`);
}
await mobile.screenshot({ path: `${output}/shared-mobile-compact.png`, fullPage: true });

await browser.close();
if (errors.length) throw new Error(`Browser errors: ${errors.join(' | ')}`);
console.log(JSON.stringify({ ok: true, desktopOverflow: overflow, checkedViews: 5, mobileOverflow: 0 }));
