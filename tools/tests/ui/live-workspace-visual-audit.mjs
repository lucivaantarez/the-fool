import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const pages = [
  ['preview-adoptme-demo', 'https://preview.saturnity.site/adopt-me/?demo=1'],
  ['preview-redfinger-demo', 'https://preview.saturnity.site/redfinger.html?demo=1'],
  ['preview-root', 'https://preview.saturnity.site/?uiAudit=1'],
  ['preview-shared-hub', 'https://preview.saturnity.site/?shared-preview=1&uiAudit=1'],
  ['preview-account-tools', 'https://preview.saturnity.site/account-tools?uiAudit=1'],
  ['preview-account-comparator', 'https://preview.saturnity.site/account-tools/comparator?uiAudit=1'],
  ['preview-account-splitter', 'https://preview.saturnity.site/account-tools/splitter?uiAudit=1'],
  ['preview-account-username-extractor', 'https://preview.saturnity.site/account-tools/username-extractor?uiAudit=1'],
  ['preview-cookie-tools', 'https://preview.saturnity.site/cookie-tools?uiAudit=1'],
  ['preview-cookie-extractor', 'https://preview.saturnity.site/cookie-tools/extractor?uiAudit=1'],
  ['preview-cookie-bulk-lookup', 'https://preview.saturnity.site/cookie-tools/bulk-lookup?uiAudit=1'],
  ['production-root', 'https://saturnity.site/?uiAudit=1'],
  ['shared-root', 'https://preview.saturnity.site/?shared-preview=1&uiAudit=1']
];
const viewports = [
  ['desktop', 1440, 1000, false],
  ['mobile', 390, 844, true]
];
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = path.join(process.cwd(), 'artifacts', 'visual-audit', `workspace-${stamp}`);
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const summary = [];
for (const [name, url] of pages) {
  for (const [vpName, width, height, isMobile] of viewports) {
    const context = await browser.newContext({ viewport: { width, height }, isMobile, serviceWorkers: 'block', ignoreHTTPSErrors: true });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', msg => { if (['error', 'warning'].includes(msg.type())) consoleErrors.push(`${msg.type()}: ${msg.text()}`); });
    let navError = null;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForLoadState('networkidle', { timeout: 7000 }).catch(() => {});
    } catch (err) { navError = err.message; }
    await page.waitForTimeout(900);
    const info = await page.evaluate(() => ({
      title: document.title,
      url: location.href,
      links: [...document.querySelectorAll('link[rel]')].filter(l => /icon|manifest/i.test(l.rel)).map(l => ({ rel: l.rel, href: l.href, type: l.type || '' })),
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: document.documentElement.clientHeight,
      xOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      text: document.body.innerText.slice(0, 1800)
    }));
    const screenshot = path.join(outDir, `${name}-${vpName}.png`);
    await page.screenshot({ path: screenshot, fullPage: false });
    summary.push({ name, url, viewport: vpName, screenshot, navError, consoleErrors, info });
    await context.close();
  }
}
await browser.close();
const summaryFile = path.join(outDir, 'summary.json');
fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
console.log(summaryFile);
