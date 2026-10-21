import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const output = 'artifacts/tests/redfinger';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors = [];

async function open(width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`https://preview.saturnity.site/redfinger.html?demo=1&audit=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  await page.locator('.rf-grid').waitFor();
  return page;
}

async function setDensity(page, value) {
  await page.locator('#density').evaluate((input, next) => {
    input.value = String(next);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

const desktop = await open(1920, 1080);
if (await desktop.locator('.rf-card').count() !== 40) throw new Error('Expected forty mock devices on the preview page');
if (await desktop.locator('.rf-card .rf-screen').count() !== 40) throw new Error('Every device must expose a passive last-capture preview');
if (await desktop.locator('.rf-session').count() !== 5) throw new Error('Expected five VPS session slots');
if (await desktop.locator('.rf-scan-brief').evaluate(node => getComputedStyle(node).display) !== 'none') throw new Error('Passive scan brief should stay mobile-only on desktop');
if (await desktop.locator('.rf-card').first().getByRole('img', { name: /Online|Offline|Rebooting/ }).count() !== 1) throw new Error('Device status must be an accessible icon');
if ((await desktop.locator('.rf-card .rf-device-name').first().textContent()).trim() !== '001') throw new Error('Device cards must use three-digit device names');
if (await desktop.locator('.rf-card .rf-device-meta').first().textContent() !== 'S1 · HK · A12') throw new Error('Session, region, and OS must share the device-name line');
if (await desktop.locator('.rf-card .rf-progress').count()) throw new Error('Remaining-time progress strips must not be rendered');
const remainingFont = Number.parseFloat(await desktop.locator('.rf-expiry b').first().evaluate(node => getComputedStyle(node).fontSize));
if (remainingFont > 13) throw new Error(`Remaining-days type is too large: ${remainingFont}px`);
const desktopCaption = await desktop.locator('.rf-expiry').first().evaluate(node => {
  const label = node.querySelector('small'), date = node.querySelector('span'), days = node.querySelector('b');
  const labelStyle = getComputedStyle(label), dateStyle = getComputedStyle(date), daysStyle = getComputedStyle(days);
  return { labelDisplay: labelStyle.display, dateColor: dateStyle.color, dateWeight: Number(dateStyle.fontWeight), daysColor: daysStyle.color, daysShadow: daysStyle.textShadow };
});
if (desktopCaption.labelDisplay !== 'none' || desktopCaption.dateColor !== 'rgb(170, 167, 161)' || desktopCaption.dateWeight < 600 || desktopCaption.daysColor !== 'rgb(241, 238, 231)' || desktopCaption.daysShadow === 'none') throw new Error(`Desktop passive card caption is not readable: ${JSON.stringify(desktopCaption)}`);
if (await desktop.locator('.rf-card').first().locator('footer .rf-btn').count() !== 3) throw new Error('Each device must have Log, Reboot, and Renew actions');
if (Number.parseFloat(await desktop.locator('.rf-card footer .rf-btn').first().evaluate(node => getComputedStyle(node).borderTopWidth)) !== 0) throw new Error('Card action buttons must blend into the card without borders');
if (await desktop.locator('.rf-sticky').evaluate(node => getComputedStyle(node).position) !== 'sticky') throw new Error('Fleet dashboard controls are not sticky');
const passiveStrip = await desktop.locator('.rf-passive-strip').evaluate(node => {
  const box = node.getBoundingClientRect();
  const cards = [...node.querySelectorAll('article')].map(card => {
    const rect = card.getBoundingClientRect();
    return { top: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) };
  });
  return { display: getComputedStyle(node).display, text: node.innerText, height: Math.round(box.height), rows: new Set(cards.map(card => card.top)).size, minWidth: Math.min(...cards.map(card => card.width)), maxHeight: Math.max(...cards.map(card => card.height)) };
});
if (passiveStrip.display === 'none' || passiveStrip.rows !== 1 || passiveStrip.height > 60 || passiveStrip.minWidth < 200 || passiveStrip.maxHeight > 56 || !/Server-owned/.test(passiveStrip.text) || !/Passive only/.test(passiveStrip.text) || !/Confirmation-gated/.test(passiveStrip.text)) throw new Error(`Passive operation boundary is not visible and compact: ${JSON.stringify(passiveStrip)}`);
if (await desktop.getByRole('button', { name: /Renewal queue/ }).count()) throw new Error('Toolbar must not advertise a provider renewal queue command in demo/read-only mode');
if (await desktop.getByRole('button', { name: /Sync now/ }).count()) throw new Error('Toolbar must describe passive snapshot refresh, not an active provider sync command');
const toolbarActions = await desktop.locator('.rf-actions .rf-btn').evaluateAll(nodes => nodes.map(node => { const box = node.getBoundingClientRect(); const style = getComputedStyle(node); return { text: node.textContent.trim(), height: Math.round(box.height), bg: style.backgroundColor, color: style.color, border: style.borderTopColor, radius: parseFloat(style.borderTopLeftRadius), shadow: style.boxShadow, weight: Number(style.fontWeight), textTransform: style.textTransform }; }));
if (toolbarActions.length !== 3 || !toolbarActions.every(action => action.height >= 34 && action.bg === 'rgb(13, 13, 15)' && action.color === 'rgb(230, 223, 211)' && action.border === 'rgb(52, 52, 56)' && action.radius >= 16 && action.shadow === 'none' && action.weight >= 700 && action.textTransform === 'none')) throw new Error(`Toolbar passive actions are not compact dark operation pills: ${JSON.stringify(toolbarActions)}`);
if (await desktop.getByRole('button', { name: /Review renewal/ }).evaluate(node => node.classList.contains('primary'))) throw new Error('Toolbar renewal review must stay neutral; device Renew remains confirmation-gated');
await desktop.getByRole('button', { name: /Review renewal/ }).click();
if (!/review confirmation/i.test(await desktop.locator('#toast').textContent())) throw new Error('Toolbar renewal review must explain the confirmation path');
const toolbarTop = await desktop.locator('.rf-toolbar').evaluate(node => node.getBoundingClientRect().top);
const commandStripTop = await desktop.locator('.rf-command-strip').evaluate(node => node.getBoundingClientRect().top);
if (toolbarTop >= commandStripTop) throw new Error('Search and fleet filters must sit above status summaries');
const firstRow = await desktop.locator('.rf-card').evaluateAll(nodes => nodes.slice(0, 10).map(node => Math.round(node.getBoundingClientRect().top)));
if (new Set(firstRow).size !== 1) throw new Error('Wide desktop layout does not fit ten device cards per row');
if (await desktop.locator('#density').getAttribute('min') !== '2' || await desktop.locator('#density').getAttribute('max') !== '20') throw new Error('Density control must provide every value from 2 through 20');
await desktop.locator('#densityTrigger').click();
if (!await desktop.locator('#densityMenu').evaluate(node => node.classList.contains('open'))) throw new Error('Professional density popover did not open');
await desktop.screenshot({ path: `${output}/redfinger-density-menu.png`, fullPage: true });
await desktop.locator('#densityTrigger').click();
for (const value of [2, 5, 10, 15, 20]) {
  await setDensity(desktop, value);
  const invariants = await desktop.locator('.rf-card').first().evaluate(card => {
    const screen = card.querySelector('.rf-screen').getBoundingClientRect();
    const buttons = [...card.querySelectorAll('footer .rf-btn')].map(node => node.getBoundingClientRect().width);
    const expiry = card.querySelector('.rf-expiry span');
    const box = card.getBoundingClientRect();
    const meta = card.querySelector('.rf-device-meta').getBoundingClientRect();
    const header = card.querySelector('header').getBoundingClientRect(), footer = card.querySelector('footer').getBoundingClientRect();
    return { ratio: screen.width / screen.height, cardRatio: box.width / box.height, actionDelta: Math.max(...buttons) - Math.min(...buttons), expiryVisible: getComputedStyle(expiry).display !== 'none', centerDelta: Math.abs(box.left + box.width / 2 - (meta.left + meta.width / 2)), proportions: [header.height / box.height, screen.top / box.height - box.top / box.height, screen.height / box.height, footer.height / box.height] };
  });
  const horizontal = await desktop.evaluate(() => ({ overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, offenders: [...document.querySelectorAll('body *')].map(node => ({ node: `${node.tagName}.${node.className}`, right: Math.round(node.getBoundingClientRect().right), width: Math.round(node.getBoundingClientRect().width) })).filter(item => item.right > innerWidth + 2).slice(0, 8) }));
  if (invariants.ratio < 1.7 || invariants.ratio > 1.85 || Math.abs(invariants.cardRatio - 1) > .02 || invariants.actionDelta > 1 || !invariants.expiryVisible || invariants.centerDelta > 4) throw new Error(`Card structure changed at ${value} columns: ${JSON.stringify(invariants)}`);
  if (horizontal.overflow > 2) throw new Error(`Horizontal overflow at ${value} columns: ${JSON.stringify(horizontal)}`);
  await desktop.evaluate(() => scrollTo(0, 0));
  await desktop.screenshot({ path: `${output}/redfinger-density-${value}.png` });
}
await setDensity(desktop, 10);
const commandStripTops = await desktop.locator('.rf-command-strip .rf-stat, .rf-command-strip .rf-session').evaluateAll(nodes => nodes.map(node => Math.round(node.getBoundingClientRect().top)));
if (new Set(commandStripTops).size !== 1) throw new Error('Fleet statistics and sessions must share one desktop row');
await setDensity(desktop, 20);
const twentyTops = await desktop.locator('.rf-card').evaluateAll(nodes => nodes.slice(0, 20).map(node => Math.round(node.getBoundingClientRect().top)));
if (new Set(twentyTops).size !== 1) throw new Error('Maximum density must render twenty devices per row');
await setDensity(desktop, 2);
const twoTops = await desktop.locator('.rf-card').evaluateAll(nodes => nodes.slice(0, 3).map(node => Math.round(node.getBoundingClientRect().top)));
if (twoTops[0] !== twoTops[1] || twoTops[1] === twoTops[2]) throw new Error('Minimum density must render two devices per row');
await setDensity(desktop, 10);
const identity = await desktop.locator('.rf-card').first().evaluate(card => {
  const cardBox = card.getBoundingClientRect(), nameNode = card.querySelector('.rf-device-name'), metaNode = card.querySelector('.rf-device-meta'), name = nameNode.getBoundingClientRect(), meta = metaNode.getBoundingClientRect(), status = card.querySelector('.rf-status').getBoundingClientRect();
  return { cardCenter: cardBox.left + cardBox.width / 2, metaCenter: meta.left + meta.width / 2, nameLeft: name.left, statusRight: status.right, cardLeft: cardBox.left, cardRight: cardBox.right, nameFont: Number.parseFloat(getComputedStyle(nameNode).fontSize), metaFont: Number.parseFloat(getComputedStyle(metaNode).fontSize), metaFits: metaNode.scrollWidth <= metaNode.clientWidth + 1 };
});
if (Math.abs(identity.cardCenter - identity.metaCenter) > 4 || identity.nameLeft - identity.cardLeft > 12 || identity.cardRight - identity.statusRight > 12) throw new Error('Device identity row is not left/center/right symmetrical');
if (identity.nameFont > 13 || identity.metaFont > 10 || !identity.metaFits) throw new Error(`Dense identity labels are not readable in ten-column mode: ${JSON.stringify(identity)}`);
const actionWidths = await desktop.locator('.rf-card').first().locator('footer .rf-btn').evaluateAll(nodes => nodes.map(node => Math.round(node.getBoundingClientRect().width)));
if (Math.max(...actionWidths) - Math.min(...actionWidths) > 1) throw new Error(`Card action controls are not evenly sized: ${actionWidths.join(', ')}`);
await desktop.locator('.rf-card').first().click({ position: { x: 30, y: 90 } });
await desktop.locator('.rf-device-modal').getByRole('heading', { name: /^001$/ }).waitFor();
if (await desktop.locator('.rf-detail-capture').evaluate(node => node.getBoundingClientRect().height) < 230) throw new Error('Expanded passive preview is vertically collapsed');
const detailRatio = await desktop.locator('.rf-detail-capture').evaluate(node => node.getBoundingClientRect().width / node.getBoundingClientRect().height);
if (detailRatio < 1.7 || detailRatio > 1.85) throw new Error(`Expanded preview must remain landscape 16:9; received ${detailRatio}`);
if (!await desktop.locator('.rf-detail-capture img').count()) throw new Error('Expanded detail must display the dummy screen capture');
for (const action of ['Log', 'Reboot', 'Renew', 'Refresh passive capture']) {
  if (await desktop.locator('.rf-device-modal').getByRole('button', { name: action }).count() !== 1) throw new Error(`Expanded device is missing ${action}`);
}
await desktop.locator('.rf-device-modal').getByRole('button', { name: 'Refresh passive capture' }).click();
if (!/just now/i.test(await desktop.locator('#detailCaptureTime').textContent())) throw new Error('Passive capture refresh did not update its timestamp');
await desktop.screenshot({ path: `${output}/redfinger-device-detail.png`, fullPage: true });
await desktop.locator('.rf-device-modal').getByRole('button', { name: 'Close' }).click();
await desktop.locator('.rf-card').first().getByRole('button', { name: 'Log' }).click();
await desktop.locator('.rf-log-modal').waitFor();
await desktop.locator('.rf-log-modal').getByRole('button', { name: 'Close' }).click();
await desktop.locator('.rf-card').first().getByRole('button', { name: 'Reboot' }).click();
await desktop.getByRole('heading', { name: 'Reboot device?' }).waitFor();
await desktop.getByRole('button', { name: 'Cancel' }).click();
await desktop.getByRole('button', { name: 'Activity log' }).click();
if (await desktop.locator('.rf-log-row').count() < 4) throw new Error('Timestamped fetch and command log is incomplete');
await desktop.getByRole('button', { name: 'Close' }).click();
await desktop.locator('.rf-card').nth(5).getByRole('button', { name: 'Renew' }).click();
await desktop.getByRole('heading', { name: 'Add device to renewal queue' }).waitFor();
await desktop.getByRole('button', { name: 'Cancel' }).click();
await desktop.screenshot({ path: `${output}/redfinger-desktop.png`, fullPage: true });

const medium = await open(1440, 900);
const mediumTops = await medium.locator('.rf-card').evaluateAll(nodes => nodes.slice(0, 11).map(node => Math.round(node.getBoundingClientRect().top)));
if (new Set(mediumTops.slice(0,10)).size !== 1 || mediumTops[9] === mediumTops[10]) throw new Error('Standard desktop default must use ten device cards per row');

const tablet = await open(820, 1180);
const tabletTops = await tablet.locator('.rf-card').evaluateAll(nodes => nodes.slice(0, 3).map(node => Math.round(node.getBoundingClientRect().top)));
if (tabletTops[0] !== tabletTops[1] || tabletTops[1] === tabletTops[2]) throw new Error(`Tablet Redfinger grid must cap at two readable columns: ${tabletTops.join(', ')}`);
const tabletDensityLabel = (await tablet.locator('#densityTriggerText').textContent()).trim();
if (!/2 columns \/ 10 requested/.test(tabletDensityLabel)) throw new Error(`Tablet density label is misleading: ${tabletDensityLabel}`);
const tabletCard = await tablet.locator('.rf-card').first().evaluate(card => {
  const box = card.getBoundingClientRect(), name = card.querySelector('.rf-device-name'), meta = card.querySelector('.rf-device-meta'), actions = [...card.querySelectorAll('footer button')].map(button => button.getBoundingClientRect());
  return { width: Math.round(box.width), height: Math.round(box.height), nameFont: Number.parseFloat(getComputedStyle(name).fontSize), metaFont: Number.parseFloat(getComputedStyle(meta).fontSize), minActionHeight: Math.min(...actions.map(action => Math.round(action.height))) };
});
if (tabletCard.width < 330 || tabletCard.height < 320 || tabletCard.height > 370 || tabletCard.nameFont < 12 || tabletCard.metaFont < 9 || tabletCard.minActionHeight < 36) throw new Error(`Tablet Redfinger cards are not compact readable capture cards: ${JSON.stringify(tabletCard)}`);
await tablet.screenshot({ path: `${output}/redfinger-tablet.png`, fullPage: true });

const mobile = await open(360, 800);
const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
if (overflow > 2) throw new Error(`Mobile layout overflows by ${overflow}px`);
if (await mobile.getByRole('button', { name: /Sync now/ }).count()) throw new Error('Mobile Redfinger toolbar must not advertise an active sync command');
if (await mobile.getByRole('button', { name: /Refresh snapshot/ }).count() !== 1 || await mobile.getByRole('button', { name: /Review renewal/ }).count() !== 1) throw new Error('Mobile Redfinger toolbar is missing passive snapshot/review wording');
const mobileActions = await mobile.locator('.rf-actions').evaluate(node => { const box = node.getBoundingClientRect(); const buttons = [...node.querySelectorAll('button')].map(button => button.getBoundingClientRect()); return { width: Math.round(box.width), height: Math.round(box.height), rows: new Set(buttons.map(button => Math.round(button.top))).size, minWidth: Math.min(...buttons.map(button => Math.round(button.width))), maxHeight: Math.max(...buttons.map(button => Math.round(button.height))) }; });
if (mobileActions.rows !== 1 || mobileActions.height > 40 || mobileActions.minWidth < 100 || mobileActions.maxHeight > 36) throw new Error(`Mobile Redfinger toolbar is not a compact passive action row: ${JSON.stringify(mobileActions)}`);
const mobileDensityLabel = (await mobile.locator('#densityTriggerText').textContent()).trim();
if (!/Mobile list \/ 2 requested/.test(mobileDensityLabel) || /shown/.test(mobileDensityLabel)) throw new Error(`Mobile density label is misleading: ${mobileDensityLabel}`);
const mobileStrip = await mobile.locator('.rf-command-strip').evaluate(node => {
  const box = node.getBoundingClientRect();
  const items = [...node.querySelectorAll('.rf-stat,.rf-session')].map(item => {
    const b = item.getBoundingClientRect();
    return { top: Math.round(b.top), width: Math.round(b.width), height: Math.round(b.height) };
  });
  return { height: Math.round(box.height), rows: new Set(items.map(item => item.top)).size, minWidth: Math.min(...items.map(item => item.width)), maxHeight: Math.max(...items.map(item => item.height)) };
});
if (mobileStrip.height > 124 || mobileStrip.rows !== 2 || mobileStrip.minWidth < 60 || mobileStrip.maxHeight > 58) throw new Error(`Mobile command strip is not a compact scan summary: ${JSON.stringify(mobileStrip)}`);
const mobileScanBrief = await mobile.locator('.rf-scan-brief').evaluate(node => ({ display: getComputedStyle(node).display, text: node.innerText, height: Math.round(node.getBoundingClientRect().height) }));
if (mobileScanBrief.display === 'none' || mobileScanBrief.height > 90 || !/Passive scan list/.test(mobileScanBrief.text) || !/40 visible · 40 total · passive captures only/.test(mobileScanBrief.text) || !/confirmation-gated/.test(mobileScanBrief.text)) throw new Error(`Mobile passive scan brief is missing or not compact: ${JSON.stringify(mobileScanBrief)}`);
if (await mobile.locator('.rf-passive-strip').evaluate(node => getComputedStyle(node).display) !== 'none') throw new Error('Desktop passive boundary strip must collapse into the mobile scan brief');
const mobileCards = await mobile.locator('.rf-card').evaluateAll(nodes => nodes.slice(0, 2).map(node => {
  const box = node.getBoundingClientRect();
  return { top: Math.round(box.top), width: Math.round(box.width), height: Math.round(box.height) };
}));
if (mobileCards[0].top === mobileCards[1].top) throw new Error('Mobile Redfinger cards must stack into one readable scan column');
if (mobileCards[0].top > 620 || mobileCards[1].top > 770) throw new Error(`Mobile Redfinger cards start too low in the first viewport: ${JSON.stringify(mobileCards)}`);
if (mobileCards[0].width < 320 || mobileCards[0].height < 128 || mobileCards[0].height > 142) throw new Error(`Mobile Redfinger cards are not compact readable scan rows: ${JSON.stringify(mobileCards[0])}`);
const mobileCard = await mobile.locator('.rf-card').first().evaluate(card => {
  const box = card.getBoundingClientRect(), capture = card.querySelector('.rf-screen span b'), screen = card.querySelector('.rf-screen').getBoundingClientRect();
  const affordance = getComputedStyle(card, '::after');
  const expiryDateVisible = getComputedStyle(card.querySelector('.rf-expiry span')).display !== 'none';
  return { ratio: box.width / box.height, captureFont: Number.parseFloat(getComputedStyle(capture).fontSize), screenRatio: screen.width / screen.height, screenHeight: screen.height, captureText: capture.textContent.trim(), expiryDateVisible, affordance: affordance.content, affordanceHeight: Number.parseFloat(affordance.minHeight), affordanceDisplay: affordance.display, affordanceSize: Number.parseFloat(affordance.fontSize), affordanceRadius: Number.parseFloat(affordance.borderTopLeftRadius), affordanceTextTransform: affordance.textTransform };
});
if (mobileCard.ratio < 2.35 || mobileCard.ratio > 2.75 || mobileCard.captureFont < 6 || mobileCard.screenRatio < 1.7 || mobileCard.screenHeight < 68 || mobileCard.expiryDateVisible || mobileCard.affordanceDisplay !== 'flex' || mobileCard.affordanceHeight < 28 || mobileCard.affordanceSize < 9 || mobileCard.affordanceRadius < 14 || mobileCard.affordanceTextTransform !== 'none' || !/Open passive detail/.test(mobileCard.affordance) || !/CAPTURE|NO CAPTURE/.test(mobileCard.captureText)) throw new Error(`Mobile Redfinger cards are not readable passive scan rows: ${JSON.stringify(mobileCard)}`);
await mobile.locator('#statusFilter').selectOption('Offline');
if (!await mobile.locator('.rf-card.offline').count() || await mobile.locator('.rf-card:not(.offline)').count()) throw new Error('Status filtering is not functional');
await mobile.screenshot({ path: `${output}/redfinger-mobile.png`, fullPage: true });

await browser.close();
if (errors.length) throw new Error(`Browser errors: ${errors.join(' | ')}`);
console.log(JSON.stringify({ ok: true, previewDevices: 40, fleetTotal: 200, densityRange: '2-20', wideColumns: 10, standardColumns: 10, mobileColumns: 1, mobileOverflow: overflow }));
