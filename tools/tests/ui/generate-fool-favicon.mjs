import { chromium } from 'playwright';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const svgPath = path.join(root, 'assets', 'the-fool-mark.svg');
const pngPath = path.join(root, 'assets', 'the-fool-favicon.png');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
await page.setContent(`<!doctype html><html><head><style>html,body{margin:0;width:512px;height:512px;background:transparent}body{display:grid;place-items:center}img{width:512px;height:512px;object-fit:contain}</style></head><body><img src="${pathToFileURL(svgPath).href}" alt=""></body></html>`);
await page.screenshot({ path: pngPath, omitBackground: true });
await browser.close();
console.log(pngPath);
