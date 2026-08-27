import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const dashboardUrl = 'https://zekehub.com/dashboard/adoptme';
const sessionDir = resolve(process.cwd(), 'zekehub-session');
const captureDir = resolve(process.cwd(), 'zekehub-captures');
const captureMode = process.argv.includes('--capture');
const loginMode = process.argv.includes('--login');

if (!captureMode && !loginMode) {
  throw new Error('Use --login to sign in manually, or --capture to reuse the saved session.');
}

const redact = value => value
  .replace(/\b(?:api|auth|access|secret|session)\s*(?:key|token|id)?\s*[:=]\s*\S+/gi, '[redacted credential]')
  .replace(/\b[A-Za-z0-9_-]{32,}\b/g, '[redacted value]');

const context = await chromium.launchPersistentContext(sessionDir, {
  headless: captureMode,
  viewport: { width: 1440, height: 1000 },
});
const page = context.pages()[0] || await context.newPage();

if (loginMode) {
  await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });
  console.log('A Chromium window is open. Sign in with Discord yourself, then close the browser window to save the session.');
  await new Promise(resolveClose => context.once('close', resolveClose));
  process.exit(0);
}

await mkdir(captureDir, { recursive: true });
await page.goto(dashboardUrl, { waitUntil: 'networkidle', timeout: 45_000 });
if (/discord\.com|login/i.test(page.url())) {
  await context.close();
  throw new Error('No active ZekeHub session found. Run npm run zekehub:login first.');
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const screenshotPath = resolve(captureDir, `dashboard-${timestamp}.png`);
const dataPath = resolve(captureDir, `dashboard-${timestamp}.json`);
const visibleText = redact((await page.locator('body').innerText()).trim());
const headings = await page.locator('h1,h2,h3').allTextContents();
const buttons = await page.locator('button:visible').allTextContents();
await page.screenshot({ path: screenshotPath, fullPage: true });
await writeFile(dataPath, JSON.stringify({
  capturedAt: new Date().toISOString(),
  url: page.url(),
  title: await page.title(),
  headings: headings.map(redact),
  buttons: buttons.map(redact),
  visibleText,
}, null, 2));
await context.close();
console.log(`Saved ${screenshotPath}`);
console.log(`Saved ${dataPath}`);
