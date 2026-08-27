import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const sessionDir = resolve(process.cwd(), 'zekehub-session');
const outputDir = resolve(process.cwd(), 'zekehub-captures', 'ui-audit');
const sections = ['Overview','Accounts','Sessions','Inventory','Config','Templates','Joiner','Exporter','Account Manager','Item Database','Settings'];
const safeMenus = {
  Accounts: ['Actions','Filters','Name','Select','Columns','Group','Ranges','50'],
  Inventory: ['All Accounts','All Groups','All Rarities','All Types','All Ages','Ages: Split','Rate /hr'],
};
const redact = value => String(value || '')
  .replace(/\b(?:api|access|secret|cookie)\s*(?:key|token)?\s*[:=]\s*\S+/gi, '[redacted credential]')
  .replace(/\b[A-Za-z0-9_-]{32,}\b/g, '[redacted value]');

await mkdir(outputDir, { recursive: true });
const context = await chromium.launchPersistentContext(sessionDir, { headless: true, viewport: { width: 1440, height: 1000 } });
const page = context.pages()[0] || await context.newPage();
await page.goto('https://zekehub.com/dashboard/adoptme', { waitUntil: 'networkidle', timeout: 45_000 });
if (/discord\.com|\/login/i.test(page.url())) throw new Error('Saved ZekeHub session has expired.');
await page.getByRole('button', { name: /close tour/i }).click({ timeout: 3_000 }).catch(() => {});

const records = [];
const snapshot = async (section, suffix = '') => {
  const data = await page.evaluate(() => ({
    headings: [...document.querySelectorAll('h1,h2,h3,h4')].filter(node => node.offsetParent).map(node => node.textContent?.trim()).filter(Boolean),
    buttons: [...document.querySelectorAll('button')].filter(node => node.offsetParent).map(node => node.textContent?.trim() || node.getAttribute('aria-label') || node.title).filter(Boolean),
    controls: [...document.querySelectorAll('input,select,textarea')].filter(node => node.offsetParent).map(node => ({ type: node.type || node.tagName, label: node.getAttribute('aria-label') || node.placeholder || node.name || '' })),
    text: document.body.innerText,
  }));
  const safe = { section, suffix, headings: data.headings.map(redact), buttons: data.buttons.map(redact), controls: data.controls.map(control => ({ ...control, label: redact(control.label) })), visibleText: redact(data.text) };
  records.push(safe);
  const name = `${section.toLowerCase().replace(/[^a-z0-9]+/g, '-')}${suffix ? `-${suffix}` : ''}`;
  await writeFile(resolve(outputDir, `${name}.json`), JSON.stringify(safe, null, 2));
  await page.screenshot({ path: resolve(outputDir, `${name}.png`), fullPage: true });
};

for (const section of sections) {
  await page.getByRole('button', { name: section, exact: true }).first().click();
  await page.waitForTimeout(350);
  await snapshot(section);
  for (const label of safeMenus[section] || []) {
    const trigger = page.getByRole('button', { name: new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$)`) }).first();
    if (!await trigger.isVisible().catch(() => false)) continue;
    const before = await page.locator('body').innerText();
    await trigger.click();
    await page.waitForTimeout(150);
    const after = await page.locator('body').innerText();
    const additions = after.split('\n').filter(line => line.trim() && !before.includes(line)).map(redact);
    records.push({ section, suffix: `menu:${label}`, additions });
    await page.keyboard.press('Escape');
  }
}

await page.getByRole('button', { name: /^Notifications/ }).first().click();
await page.waitForTimeout(250);
await snapshot('Notifications');
await writeFile(resolve(outputDir, 'index.json'), JSON.stringify(records, null, 2));
await context.close();
console.log(JSON.stringify(records.map(record => ({ section: record.section, suffix: record.suffix, headings: record.headings, buttons: record.buttons, additions: record.additions })), null, 2));
