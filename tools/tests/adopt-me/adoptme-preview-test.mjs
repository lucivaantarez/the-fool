import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const url = 'https://preview.saturnity.site/adopt-me';
const artifactDir = 'artifacts/tests/adopt-me';
await mkdir(artifactDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors = [];

async function openPreview(page) {
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await page.evaluate(() => {
    const gate = document.querySelector('#pin-screen');
    if (gate) gate.style.display = 'none';
  });
  const route = page.locator('#sv-route-sidebar [data-sv-route="adoptme"]');
  const available = await route.waitFor({ state: 'visible', timeout: 5_000 }).then(() => true, () => false);
  if (!available) return false;
  await route.click();
  await page.locator('.zr-app').waitFor({ state: 'visible' });
  return true;
}

const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
if (!await openPreview(desktop)) {
  console.log(JSON.stringify({ skipped: true, reason: 'Authenticated preview session required.' }));
  await browser.close();
  process.exit(0);
}
const mounted = await desktop.evaluate(() => document.querySelector('[data-sv-page="adoptme"]')?.dataset.reactMounted);
const chartCount = await desktop.locator('.recharts-responsive-container').count();
const routeTitles = {};
for (const label of ['Accounts', 'Sessions', 'Inventory', 'Config', 'Templates', 'Exporter', 'Notifications', 'Item Database', 'Settings']) {
  await desktop.locator(`.zr-side nav button[title="${label}"]`).click();
  routeTitles[label] = await desktop.locator('.zr-page-head h1').innerText();
}
await desktop.getByRole('button', { name: 'Templates', exact: true }).click();
await desktop.locator('.zr-main button').filter({ hasText: 'Create Template' }).click();
const modalVisible = await desktop.locator('.zr-modal').isVisible();
await desktop.locator('.zr-modal header button').click();
await desktop.locator('.zr-side nav button[title="Notifications"]').click();
const drawerVisible = await desktop.locator('.zr-drawer').isVisible();
await desktop.locator('.zr-drawer header button').click();
await desktop.getByTitle('Collapse Adopt Me sidebar').click();
const innerCollapsed = await desktop.locator('.zr-app.side-collapsed').count();
await desktop.getByTitle('Minimize The Fool sidebar').click();
const outerCollapsed = await desktop.locator('body.sv-shell-collapsed').count();
await desktop.getByRole('button', { name: 'Overview', exact: true }).click();
await desktop.locator('[data-sv-outer-collapse]').click();
await desktop.locator('.zr-side > header > button').click();
await desktop.screenshot({ path: `${artifactDir}/adoptme-react-preview.png`, fullPage: true });

const mobile = await browser.newPage({ viewport: { width: 360, height: 800 }, isMobile: true });
await openPreview(mobile);
await mobile.getByRole('button', { name: 'Inventory', exact: true }).click();
const inventoryItems = await mobile.locator('.zr-inventory-grid article').count();
const mobileMetrics = await mobile.evaluate(() => ({
  innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  scrollHeight: document.documentElement.scrollHeight,
  mainClientHeight: document.querySelector('.main')?.clientHeight || 0,
  mainScrollHeight: document.querySelector('.main')?.scrollHeight || 0,
}));
const mobileScrollTop = await mobile.evaluate(() => {
  const main = document.querySelector('.main');
  if (!main) return -1;
  main.scrollTop = 250;
  return main.scrollTop;
});
await mobile.screenshot({ path: `${artifactDir}/adoptme-react-mobile.png`, fullPage: true });

console.log(JSON.stringify({
  mounted,
  chartCount,
  routeTitles,
  modalVisible,
  drawerVisible,
  innerCollapsed,
  outerCollapsed,
  inventoryItems,
  mobileMetrics,
  mobileScrollTop,
  errors,
}, null, 2));

await browser.close();
