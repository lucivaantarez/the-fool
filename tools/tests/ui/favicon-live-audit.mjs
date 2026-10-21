import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const hosts = [
  'https://saturnity.site/',
  'https://fool.saturnity.site/',
  'https://preview.saturnity.site/'
];
const viewports = [
  { name: 'desktop', width: 1440, height: 1000, isMobile: false },
  { name: 'mobile', width: 390, height: 844, isMobile: true }
];
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = path.join(process.cwd(), 'artifacts', 'visual-audit', stamp);
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const summary = [];
  for (const base of hosts) {
    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile,
        deviceScaleFactor: 1,
        serviceWorkers: 'block',
        ignoreHTTPSErrors: true
      });
      const page = await context.newPage();
      const requests = [];
      page.on('request', req => {
        if (/favicon|the-fool|manifest|apple-touch/i.test(req.url())) requests.push({ type: 'request', url: req.url(), resourceType: req.resourceType() });
      });
      page.on('response', async res => {
        if (/favicon|the-fool|manifest|apple-touch/i.test(res.url())) {
          requests.push({ type: 'response', url: res.url(), status: res.status(), contentType: res.headers()['content-type'] || '', cache: res.headers()['cache-control'] || '' });
        }
      });
      const url = base + (base.includes('?') ? '&' : '?') + `audit=${Date.now()}`;
      let navError = null;
      try { await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }); }
      catch (err) { navError = String(err.message || err); }
      await page.waitForTimeout(1400);
      const info = await page.evaluate(() => ({
        title: document.title,
        url: location.href,
        links: [...document.querySelectorAll('link[rel]')].filter(l => /icon|manifest/i.test(l.rel)).map(l => ({ rel: l.rel, href: l.href, type: l.type || '', sizes: l.sizes?.value || '' })),
        bodyText: document.body?.innerText?.slice(0, 1400) || '',
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight,
        xOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
        activeImages: [...document.images].slice(0, 20).map(img => ({ src: img.currentSrc || img.src, alt: img.alt, w: img.naturalWidth, h: img.naturalHeight }))
      }));
      const legacyPreviewMark = base.includes('preview.saturnity.site') && info.activeImages.some(img => /the-fool-mark\.jpg(?:$|\?)/.test(img.src));
      const file = path.join(outDir, `${new URL(base).hostname}-${vp.name}.png`);
      await page.screenshot({ path: file, fullPage: false });
      summary.push({ base, viewport: vp.name, screenshot: file, navError, info, requests });
      await context.close();
      if (legacyPreviewMark) throw new Error(`${base} ${vp.name} loaded legacy jpg fool mark instead of canonical transparent mark`);
    }
  }
  await browser.close();
  fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log(path.join(outDir, 'summary.json'));
})();
