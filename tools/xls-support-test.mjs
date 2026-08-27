import { createRequire } from 'node:module';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const XLSX = require('../assets/xlsx.full.min.js');
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
  ['username'],
  ['alpha_user'],
  ['beta_user'],
]), 'Users');

const fixtures = Object.fromEntries(['xls', 'xlsx'].map(extension => [
  extension,
  XLSX.write(workbook, {
    bookType: extension === 'xls' ? 'biff8' : 'xlsx',
    type: 'base64',
  }),
]));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(process.argv[2] || 'https://preview.saturnity.site', { waitUntil: 'networkidle', timeout: 45_000 });
const results = {};

for (const [extension, base64] of Object.entries(fixtures)) {
  results[extension] = await page.evaluate(async ({ extension, base64 }) => {
    const bytes = Uint8Array.from(atob(base64), character => character.charCodeAt(0));
    const file = new File([bytes], `users.${extension}`);
    return window.SaturnityUsernameExtractor.loadFile(file);
  }, { extension, base64 });
}

await browser.close();
console.log(JSON.stringify(results));
if (JSON.stringify(results.xls) !== JSON.stringify(['alpha_user', 'beta_user'])) process.exit(1);
if (JSON.stringify(results.xlsx) !== JSON.stringify(['alpha_user', 'beta_user'])) process.exit(1);
