import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const sessionDir = resolve(process.cwd(), 'zekehub-session');
const outputDir = resolve(process.cwd(), 'zekehub-captures', 'audit');
const startPaths = ['/dashboard/documentation', '/dashboard/adoptme'];
const redact = value => String(value || '')
  .replace(/\b(?:api|auth|access|secret|session|cookie)\s*(?:key|token|id)?\s*[:=]\s*\S+/gi, '[redacted credential]')
  .replace(/\b[A-Za-z0-9_-]{32,}\b/g, '[redacted value]');
const slug = pathname => pathname.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]+/gi, '-') || 'home';

await mkdir(outputDir, { recursive: true });
const context = await chromium.launchPersistentContext(sessionDir, {
  headless: true,
  viewport: { width: 1440, height: 1000 },
});
const page = context.pages()[0] || await context.newPage();
const queue = [...startPaths];
const seen = new Set();
const audit = [];

while (queue.length) {
  const pathname = queue.shift();
  if (seen.has(pathname)) continue;
  seen.add(pathname);
  await page.goto(`https://zekehub.com${pathname}`, { waitUntil: 'networkidle', timeout: 45_000 });
  if (/discord\.com|\/login/i.test(page.url())) throw new Error('Saved ZekeHub session has expired.');

  const record = await page.evaluate(() => ({
    title: document.title,
    headings: [...document.querySelectorAll('h1,h2,h3,h4')].map(node => node.textContent?.trim()).filter(Boolean),
    links: [...document.querySelectorAll('a[href]')].map(link => ({
      text: link.textContent?.trim() || link.getAttribute('aria-label') || '',
      href: link.href,
    })),
    buttons: [...document.querySelectorAll('button')].map(button => ({
      text: button.textContent?.trim() || button.getAttribute('aria-label') || button.title || '',
      disabled: button.disabled,
    })).filter(button => button.text),
    controls: [...document.querySelectorAll('input,select,textarea')].map(control => ({
      type: control.type || control.tagName.toLowerCase(),
      label: control.getAttribute('aria-label') || control.placeholder || control.name || '',
      options: control.tagName === 'SELECT' ? [...control.options].map(option => option.textContent?.trim()) : undefined,
    })),
    text: document.body.innerText,
  }));

  const links = record.links.map(link => {
    try {
      const url = new URL(link.href);
      return { text: redact(link.text), href: url.origin === 'https://zekehub.com' ? url.pathname : url.href };
    } catch { return { text: redact(link.text), href: '' }; }
  });
  for (const link of links) {
    if (/^\/dashboard\/(?:documentation|adoptme)(?:\/|$)/.test(link.href) && !seen.has(link.href)) queue.push(link.href);
  }

  const safe = {
    pathname,
    title: redact(record.title),
    headings: record.headings.map(redact),
    links,
    buttons: record.buttons.map(button => ({ ...button, text: redact(button.text) })),
    controls: record.controls.map(control => ({ ...control, label: redact(control.label), options: control.options?.map(redact) })),
    visibleText: redact(record.text),
  };
  audit.push(safe);
  await writeFile(resolve(outputDir, `${slug(pathname)}.json`), JSON.stringify(safe, null, 2));
  await page.screenshot({ path: resolve(outputDir, `${slug(pathname)}.png`), fullPage: true });
}

await writeFile(resolve(outputDir, 'index.json'), JSON.stringify(audit.map(({ pathname, headings, buttons, links }) => ({ pathname, headings, buttons, links })), null, 2));
await context.close();
console.log(JSON.stringify(audit.map(record => ({
  pathname: record.pathname,
  headings: record.headings,
  buttons: record.buttons.map(button => button.text),
  internalLinks: record.links.filter(link => /^\/dashboard\/(?:documentation|adoptme)/.test(link.href)),
})), null, 2));
