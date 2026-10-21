import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const artifactDir = 'artifacts/tests/adopt-me';
await mkdir(artifactDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));

await page.goto(`https://preview.saturnity.site/adopt-me/?demo=1&audit=${Date.now()}`, { waitUntil: 'networkidle' });
await page.locator('.zr-app').waitFor();
await page.locator('.sv-global-switcher, .sv-global-nav').waitFor();
const workspaceTrigger = page.locator('.sv-global-trigger');
await workspaceTrigger.click();
if (await page.locator('.sv-global-menu a').count() !== 7) throw new Error('Global workspace navigation should expose only active top-level workspaces');
if (await page.locator('.sv-global-menu a[href="/bulk-lookup"]').count()) throw new Error('Bulk Lookup should live under Account Ops/Vault review, not global top-level nav');
await page.screenshot({ path: `${artifactDir}/adoptme-global-navigation.png`, fullPage: true });
await page.keyboard.press('Escape');
if (await workspaceTrigger.getAttribute('aria-expanded') !== 'false') throw new Error('Global workspace navigation did not close with Escape');
const labels = await page.locator('.zr-side nav button span').allTextContents();
if (labels.join('|') !== 'Main|Accounts') throw new Error(`Adopt Me Watcher must expose only Main and Accounts, found: ${labels.join(', ')}`);
const boundaryCopy = await page.locator('.zr-page-head p').first().innerText();
if (!/read-only watcher|Read-only account, farm, inventory, and owner watcher/.test(boundaryCopy)) throw new Error('Watcher read-only/API-pending boundary copy is missing');
if (!await page.getByText('Farm Performance', { exact: true }).count()) throw new Error('Main dashboard should include Farm Performance');
if (!await page.getByText('Bots online', { exact: true }).count()) throw new Error('Farm Performance should expose Bots online series');
if (!await page.getByText('Account roster', { exact: true }).count()) throw new Error('Main dashboard should expose a compact account roster preview');
const rosterRows = await page.locator('.zr-main-roster-grid>button').evaluateAll(nodes => nodes.map(node => ({ text: node.innerText, box: node.getBoundingClientRect().toJSON() })));
if (rosterRows.length !== 6) throw new Error(`Main account roster should show six preview rows, found ${rosterRows.length}`);
if (rosterRows.some(row => row.box.height > 88 || !/Active/.test(row.text))) throw new Error('Main account roster rows are not compact active account previews');
await page.getByRole('button', { name: /Open Accounts/i }).first().click();
await page.locator('.zr-account-watch-table').waitFor();
await page.getByRole('button', { name: 'Main', exact: true }).click();
if (!await page.locator('.zr-filter-menu').filter({ hasText: 'Age' }).count()) throw new Error('Inventory age filter is missing');
if (await page.getByRole('button', { name: 'Sessions', exact: true }).count()) throw new Error('Sessions should be hidden from Adopt Me Watcher');
if (await page.getByRole('button', { name: 'Config', exact: true }).count()) throw new Error('Config should be hidden from Adopt Me Watcher');
if (await page.getByRole('button', { name: 'Exporter', exact: true }).count()) throw new Error('Exporter should be hidden from Adopt Me Watcher');
const inventoryBoxes = await page.locator('.zr-inventory-grid>button').evaluateAll(nodes => nodes.slice(0, 8).map(node => node.getBoundingClientRect().toJSON()));
if (inventoryBoxes.length < 8) throw new Error('Main dashboard inventory should show a dense first page of items');
if (inventoryBoxes.some(box => box.height > 210)) throw new Error('Inventory tiles are too tall for watcher density');
if (!await page.getByText('View owners', { exact: true }).count()) throw new Error('Inventory tiles should expose an owner-popup affordance');
const desktopOwnerReadability = await page.locator('.zr-inventory-grid>button').first().evaluate(node => {
  const card = node.getBoundingClientRect();
  const owner = node.querySelector('.zr-owner-cta').getBoundingClientRect();
  const count = node.querySelector('strong').getBoundingClientRect();
  const ownerStyle = getComputedStyle(node.querySelector('.zr-owner-cta'));
  return { card: card.toJSON(), owner: owner.toJSON(), count: count.toJSON(), ownerText: node.querySelector('.zr-owner-cta').textContent.trim(), ownerBg: ownerStyle.backgroundColor, ownerColor: ownerStyle.color, ownerBorder: ownerStyle.borderTopColor, ownerRadius: parseFloat(ownerStyle.borderTopLeftRadius), ownerShadow: ownerStyle.boxShadow, ownerDisplay: ownerStyle.display, ownerTransform: ownerStyle.textTransform, ownerWeight: Number(ownerStyle.fontWeight), ownerSize: parseFloat(ownerStyle.fontSize), overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
});
if (desktopOwnerReadability.ownerText !== 'View owners' || !desktopOwnerReadability.ownerDisplay.includes('flex') || desktopOwnerReadability.owner.width < 82 || desktopOwnerReadability.owner.height < 20 || desktopOwnerReadability.owner.right > desktopOwnerReadability.count.left - 4 || desktopOwnerReadability.ownerBg !== 'rgb(16, 16, 19)' || desktopOwnerReadability.ownerColor !== 'rgb(216, 209, 200)' || desktopOwnerReadability.ownerBorder !== 'rgb(48, 48, 53)' || desktopOwnerReadability.ownerRadius < 10 || desktopOwnerReadability.ownerShadow !== 'none' || desktopOwnerReadability.ownerTransform !== 'uppercase' || desktopOwnerReadability.ownerWeight < 700 || desktopOwnerReadability.ownerSize < 7.5 || desktopOwnerReadability.overflow > 2) throw new Error(`Desktop inventory owner affordance should read as a compact operation pill: ${JSON.stringify(desktopOwnerReadability)}`);
if (!await page.getByRole('button', { name: /Open owners for/ }).count()) throw new Error('Inventory tiles should have owner-popup accessible names');
await page.locator('.zr-filter-menu').filter({ hasText: 'Age' }).locator('>button').click();
await page.locator('.zr-filter-popover').waitFor();
if (!await page.getByText('Full Grown', { exact: true }).count()) throw new Error('Age filter should include proper Adopt Me age options');
await page.screenshot({ path: `${artifactDir}/adoptme-age-filter-popover.png`, fullPage: true });
await page.keyboard.press('Escape');
await page.locator('.zr-inventory-grid>button').first().click();
await page.locator('.zr-item-modal').waitFor();
await page.waitForTimeout(250);
if (!await page.getByText('Copy all owners', { exact: true }).count()) throw new Error('Item popup should copy all owner usernames');
if (!await page.getByText('Copy active', { exact: true }).count()) throw new Error('Item popup should copy active owner usernames');
if (!await page.getByText('Tick mode', { exact: true }).count()) throw new Error('Item popup should expose tick mode');
await page.getByText('Tick mode', { exact: true }).click();
await page.locator('.zr-owner-list article').first().click();
if (!await page.getByText(/1 selected/).count()) throw new Error('Tick mode should select owner rows');
await page.getByText('Pin selection', { exact: true }).click();
if (!await page.getByText(/1 pinned/).count()) throw new Error('Pin selection should stage selected owner usernames');
await page.screenshot({ path: `${artifactDir}/adoptme-item-inspector.png`, fullPage: true });
await page.getByRole('button', { name: 'Close', exact: true }).last().click();
await page.getByRole('button', { name: 'Accounts', exact: true }).click();
await page.locator('.zr-account-watch-table').waitFor();
if (await page.locator('.zr-account-watch-row').count() !== 50) throw new Error('Accounts should render only the first paginated page by default');
if (!/Showing 1-50 of 2187/.test(await page.locator('.zr-pagination').innerText())) throw new Error('Account pagination summary is incorrect');
if (!await page.locator('.zr-page-head .zr-filter-menu').filter({ hasText: 'Sort' }).count()) throw new Error('Accounts should expose sort menu');
await page.getByRole('button', { name: '100', exact: true }).click();
if (await page.locator('.zr-account-watch-row').count() !== 100) throw new Error('Page-size selector should render 100 account rows');
await page.getByRole('button', { name: 'Next', exact: true }).click();
if (!/Showing 101-200 of 2187/.test(await page.locator('.zr-pagination').innerText())) throw new Error('Next page did not advance account pagination');
await page.screenshot({ path: `${artifactDir}/adoptme-accounts-paginated.png`, fullPage: true });
await page.waitForTimeout(900);
await page.screenshot({ path: `${artifactDir}/adoptme-standalone-desktop.png`, fullPage: true });

const tablet = await browser.newPage({ viewport: { width: 820, height: 1180 }, deviceScaleFactor: 1 });
tablet.on('pageerror', error => errors.push(error.message));
await tablet.goto(`https://preview.saturnity.site/adopt-me/?demo=1&audit=${Date.now()}`, { waitUntil: 'networkidle' });
await tablet.locator('.zr-app').waitFor();
const tabletInventoryBoxes = await tablet.locator('.zr-inventory-grid>button').evaluateAll(nodes => nodes.slice(0, 6).map(node => node.getBoundingClientRect().toJSON()));
const tabletInventoryReadability = await tablet.locator('.zr-inventory-grid>button').first().evaluate(node => {
  const card = node.getBoundingClientRect();
  const owner = node.querySelector('.zr-owner-cta').getBoundingClientRect();
  const title = node.querySelector('b').getBoundingClientRect();
  const meta = node.querySelector('small').getBoundingClientRect();
  const pet = node.querySelector('.pet').getBoundingClientRect();
  const ownerStyle = getComputedStyle(node.querySelector('.zr-owner-cta'));
  return { card: card.toJSON(), owner: owner.toJSON(), title: title.toJSON(), meta: meta.toJSON(), pet: pet.toJSON(), ownerText: node.querySelector('.zr-owner-cta').textContent.trim(), ownerRadius: parseFloat(ownerStyle.borderRadius), ownerBg: ownerStyle.backgroundColor, ownerColor: ownerStyle.color, ownerBorder: ownerStyle.borderTopColor, ownerShadow: ownerStyle.boxShadow, ownerDisplay: ownerStyle.display, ownerTransform: ownerStyle.textTransform, ownerWeight: Number(ownerStyle.fontWeight), overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
});
if (tabletInventoryBoxes.length < 6) throw new Error('Tablet inventory should show at least six item cards for density review');
if (tabletInventoryBoxes.some(box => box.height > 132 || box.width < 240)) throw new Error(`Tablet inventory cards are not readable three-column tiles: ${tabletInventoryBoxes.map(box => `${Math.round(box.width)}x${Math.round(box.height)}`).join(', ')}`);
if (new Set(tabletInventoryBoxes.slice(0, 3).map(box => Math.round(box.y))).size !== 1 || Math.round(tabletInventoryBoxes[3].y) === Math.round(tabletInventoryBoxes[0].y)) throw new Error('Tablet inventory should render as three readable columns');
if (tabletInventoryReadability.ownerText !== 'View owners' || !tabletInventoryReadability.ownerDisplay.includes('flex') || tabletInventoryReadability.owner.width < 94 || tabletInventoryReadability.owner.height < 24 || tabletInventoryReadability.owner.top > tabletInventoryReadability.title.top || tabletInventoryReadability.owner.bottom > tabletInventoryReadability.pet.top || tabletInventoryReadability.ownerRadius < 10 || !/rgb\(16, 16, 19\)/.test(tabletInventoryReadability.ownerBg) || tabletInventoryReadability.ownerColor !== 'rgb(216, 209, 200)' || tabletInventoryReadability.ownerBorder !== 'rgb(48, 48, 53)' || tabletInventoryReadability.ownerShadow !== 'none' || tabletInventoryReadability.ownerTransform !== 'uppercase' || tabletInventoryReadability.ownerWeight < 700 || tabletInventoryReadability.overflow > 2) throw new Error(`Tablet inventory owner affordance should read as a compact operation pill: ${JSON.stringify(tabletInventoryReadability)}`);
const tabletOverflow = await tablet.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
if (tabletOverflow > 2) throw new Error(`Tablet Adopt Me page overflows horizontally by ${tabletOverflow}px`);
await tablet.screenshot({ path: `${artifactDir}/adoptme-standalone-tablet.png`, fullPage: true });

const mobile = await browser.newPage({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 1 });
mobile.on('pageerror', error => errors.push(error.message));
await mobile.goto(`https://preview.saturnity.site/adopt-me/?demo=1&audit=${Date.now()}`, { waitUntil: 'networkidle' });
await mobile.locator('.zr-app').waitFor();
if ((await mobile.locator('.zr-side nav button span').allTextContents()).join('|') !== 'Main|Accounts') throw new Error('Mobile Adopt Me nav should show only Main and Accounts');
const mobileRosterRows = await mobile.locator('.zr-main-roster-grid>button').evaluateAll(nodes => nodes.filter(node => getComputedStyle(node).display !== 'none').map(node => node.getBoundingClientRect().toJSON()));
if (mobileRosterRows.length !== 4) throw new Error(`Mobile main account roster should show four compact preview rows, found ${mobileRosterRows.length}`);
if (mobileRosterRows.some(box => box.height > 70 || box.width < 160)) throw new Error(`Mobile roster rows are not compact two-column previews: ${mobileRosterRows.map(box => `${Math.round(box.width)}x${Math.round(box.height)}`).join(', ')}`);
if (mobileRosterRows[0].y > 720) throw new Error(`Mobile account roster starts too late in the first viewport: y=${Math.round(mobileRosterRows[0].y)}`);
await mobile.locator('.zr-main-roster-grid>button').first().click();
await mobile.locator('.zr-account-watch-table').waitFor();
await mobile.getByRole('button', { name: 'Main', exact: true }).evaluate(button => button.click());
const mobileInventoryBoxes = await mobile.locator('.zr-inventory-grid>button').evaluateAll(nodes => nodes.slice(0, 6).map(node => node.getBoundingClientRect().toJSON()));
const mobileInventoryTop = await mobile.locator('.zr-inventory-watch').evaluate(node => Math.round(node.getBoundingClientRect().top));
const mobileInventoryReadability = await mobile.locator('.zr-inventory-grid>button').first().evaluate(node => {
  const card = node.getBoundingClientRect();
  const title = node.querySelector('b').getBoundingClientRect();
  const meta = node.querySelector('small').getBoundingClientRect();
  const owner = node.querySelector('.zr-owner-cta').getBoundingClientRect();
  const pet = node.querySelector('.pet').getBoundingClientRect();
  const titleStyle = getComputedStyle(node.querySelector('b'));
  const metaStyle = getComputedStyle(node.querySelector('small'));
  const ownerStyle = getComputedStyle(node.querySelector('.zr-owner-cta'));
  return {
    card: card.toJSON(),
    title: title.toJSON(),
    meta: meta.toJSON(),
    owner: owner.toJSON(),
    pet: pet.toJSON(),
    titleSize: parseFloat(titleStyle.fontSize),
    metaSize: parseFloat(metaStyle.fontSize),
    ownerSize: parseFloat(ownerStyle.fontSize),
    ownerWeight: Number(ownerStyle.fontWeight),
    ownerColor: ownerStyle.color,
    ownerBorder: ownerStyle.borderTopColor,
  };
});
if (mobileInventoryBoxes.length < 6) throw new Error('Mobile inventory should show at least six item cards for density review');
if (mobileInventoryTop > 805) throw new Error(`Mobile inventory watchlist starts too late for first-viewport review: y=${mobileInventoryTop}`);
if (mobileInventoryBoxes.some(box => box.height > 104 || box.width < 300)) throw new Error(`Mobile inventory cards are not readable one-column owner cards: ${mobileInventoryBoxes.map(box => `${Math.round(box.width)}x${Math.round(box.height)}`).join(', ')}`);
if (Math.round(mobileInventoryBoxes[0].y) === Math.round(mobileInventoryBoxes[1].y) || Math.round(mobileInventoryBoxes[1].y) === Math.round(mobileInventoryBoxes[2].y)) throw new Error('Mobile inventory should render as one readable column');
if (mobileInventoryReadability.titleSize < 13 || mobileInventoryReadability.metaSize < 10 || mobileInventoryReadability.ownerSize < 9 || mobileInventoryReadability.ownerWeight < 800 || mobileInventoryReadability.ownerColor !== 'rgb(216, 209, 200)' || mobileInventoryReadability.ownerBorder !== 'rgb(48, 48, 53)') throw new Error(`Mobile inventory item type is too small: ${JSON.stringify(mobileInventoryReadability)}`);
if (mobileInventoryReadability.pet.width < 38 || mobileInventoryReadability.pet.height < 38 || mobileInventoryReadability.title.right > mobileInventoryReadability.owner.left - 8 || mobileInventoryReadability.owner.height < 30 || mobileInventoryReadability.owner.width < 102 || mobileInventoryReadability.owner.left < mobileInventoryReadability.meta.right || mobileInventoryReadability.owner.right > mobileInventoryReadability.card.right - 8 || mobileInventoryReadability.owner.bottom > mobileInventoryReadability.card.bottom - 7 || mobileInventoryReadability.owner.top < mobileInventoryReadability.title.bottom - 2) throw new Error(`Mobile inventory item layout is not readable: ${JSON.stringify(mobileInventoryReadability)}`);
if (!await mobile.getByText('View owners', { exact: true }).count()) throw new Error('Mobile inventory tiles should expose an owner-popup affordance');
const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
if (overflow > 2) throw new Error(`Mobile page overflows horizontally by ${overflow}px`);
await mobile.click('.sv-mobile-topbar button');
await mobile.keyboard.press('Escape');
await mobile.locator('.zr-inventory-grid>button').first().click();
await mobile.locator('.zr-item-modal').waitFor();
const itemOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
if (itemOverflow > 2) throw new Error(`Mobile item inspector overflows horizontally by ${itemOverflow}px`);
await mobile.getByRole('button', { name: 'Close', exact: true }).last().click();
await mobile.getByRole('button', { name: 'Accounts', exact: true }).evaluate(button => button.click());
await mobile.locator('.zr-account-watch-table').waitFor();
const mobileAccountToolbar = await mobile.locator('.zr-account-watch-toolbar').evaluate(node => {
  const box = node.getBoundingClientRect();
  const search = node.querySelector('.zr-search').getBoundingClientRect();
  const menus = [...node.querySelectorAll('.zr-filter-menu>button,.zr-page-size')].map(button => button.getBoundingClientRect().toJSON());
  return { box: box.toJSON(), search: search.toJSON(), menus, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
});
if (mobileAccountToolbar.box.height > 140 || mobileAccountToolbar.search.height > 36 || mobileAccountToolbar.menus.some(box => box.height > 42 || box.width < 70) || mobileAccountToolbar.overflow > 2) throw new Error(`Mobile accounts toolbar is not compact and readable: ${JSON.stringify(mobileAccountToolbar)}`);
const mobileAccountRows = await mobile.locator('.zr-account-watch-row').evaluateAll(nodes => nodes.slice(0, 4).map(node => node.getBoundingClientRect().toJSON()));
if (mobileAccountRows.length < 4) throw new Error('Mobile accounts table should render dense rows');
if (mobileAccountRows.some(box => box.height > 48)) throw new Error(`Mobile account rows are too tall: ${mobileAccountRows.map(box => Math.round(box.height)).join(', ')}`);
const accountsOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
if (accountsOverflow > 2) throw new Error(`Mobile accounts page overflows horizontally by ${accountsOverflow}px`);
await mobile.screenshot({ path: `${artifactDir}/adoptme-standalone-mobile.png`, fullPage: true });

const signedOut = await browser.newPage({ viewport: { width: 1000, height: 760 } });
await signedOut.goto('https://preview.saturnity.site/adopt-me/', { waitUntil: 'domcontentloaded' });
await signedOut.getByText(/Opening the watcher|Back to the circus/).waitFor();

await browser.close();
if (errors.length) throw new Error(`Browser errors: ${errors.join(' | ')}`);
console.log(JSON.stringify({ ok: true, labels, mobileOverflow: overflow }));
