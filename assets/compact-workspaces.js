/* Preview presentation adapter. Existing nodes/handlers own data and confirmations. */
(() => {
  if (location.hostname !== 'preview.saturnity.site') return;
  const $ = selector => document.querySelector(selector);
  const all = selector => [...document.querySelectorAll(selector)];
  const text = (selector, value) => { const node = $(selector); if (node) node.textContent = value; };
  const toolbar = (before, nodes) => { if (!before) return; const bar = document.createElement('div'); bar.className = 'sv-result-toolbar'; before.before(bar); nodes.filter(Boolean).forEach(node => bar.append(node)); return bar; };
  const label = (id, name) => { const input = document.getElementById(id); if (!input || input.closest('label')) return; const el = document.createElement('label'); el.htmlFor = id; el.className = 'sv-input-label'; el.textContent = name; input.before(el); };
  const iconPaths = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>', clear: '<path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/>', copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>', move: '<path d="M4 7h7l2 2h7v8a2 2 0 0 1-2 2H4z"/><path d="M13 13h6"/><path d="m16 10 3 3-3 3"/>', list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>', split: '<path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="m15 15 6 6"/><path d="M4 4l5 5"/>', filter: '<path d="M3 5h18"/><path d="M7 12h10"/><path d="M10 19h4"/>', compare: '<path d="M6 8h12"/><path d="m14 4 4 4-4 4"/><path d="M18 16H6"/><path d="m10 12-4 4 4 4"/>', link: '<path d="M10 13a5 5 0 0 0 7.07 0l2-2a5 5 0 0 0-7.07-7.07l-1.14 1.14"/><path d="M14 11a5 5 0 0 0-7.07 0l-2 2A5 5 0 0 0 12 20.07l1.14-1.14"/>', shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>', cookie: '<path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-4-4 4 4 0 0 1-4-4 4 4 0 0 1-2-2"/><path d="M8.5 8.5h.01"/><path d="M16 15.5h.01"/><path d="M12 12h.01"/>', database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>', tray: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z"/>'
  };
  const icon = name => `<svg class="sv-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name] || iconPaths.search}</svg>`;
  const addIcon = (node, name, cls = '') => { if (!node || node.querySelector('.sv-icon')) return; node.insertAdjacentHTML('afterbegin', icon(name).replace('class="sv-icon"', `class="sv-icon${cls ? ` ${cls}` : ''}"`)); };

  // Unavailable is presentation state, not an alternative authentication path.
  const status = $('#sv-fool-touch-status');
  if (status) {
    const gate = $('#sv-fool-touch-gate'), retry = document.createElement('button');
    retry.type = 'button'; retry.className = 'sv-fool-touch-open'; retry.textContent = 'Retry'; retry.hidden = true;
    retry.onclick = () => location.reload(); status.after(retry);
    const update = () => {
      const unavailable = /unavailable|not configured/i.test(status.textContent);
      gate.dataset.unavailable = String(unavailable); retry.hidden = !unavailable;
      if (unavailable) $('#sv-fool-touch-open').disabled = true;
    };
    new MutationObserver(update).observe(status, { childList: true, subtree: true, characterData: true }); update();
    // Block the existing document-level PIN shortcuts only while unavailable.
    document.addEventListener('keydown', event => {
      if (gate.dataset.unavailable === 'true' && !gate.hidden && (/^\d$/.test(event.key) || event.key === 'Backspace' || event.key === 'Enter' && event.target !== retry)) { event.preventDefault(); event.stopImmediatePropagation(); }
    }, true);
    return;
  }
  if (!document.body.classList.contains('sv-route-preview')) return;
  document.body.classList.add('sv-compact');
  const hero = $('.sv-dashboard-hero');
  if (hero) {
    hero.className = 'sv-dashboard-heading';
    const heading = hero.querySelector('h1'); heading.textContent = 'Dashboard';
    hero.querySelectorAll('.sv-dashboard-eyebrow,.sv-dashboard-mark,p,[data-sv-dash-go="data"]').forEach(node => node.remove());
    const session = $('#sv-dash-server'); if (session) heading.after(session);
  }
  text('.sv-dashboard-actions [data-sv-dash-go="vault"]', 'Open Vault');
  text('.sv-dashboard-actions [data-sv-fool-link]', 'Shared tools');
  text('.sv-dashboard-activity .sv-dashboard-panel-head b', 'Recent activity');
  text('.sv-dashboard-quick .sv-dashboard-panel-head b', 'Workspaces');
  const dashboard = $('.sv-dashboard');
  const pages = $('#sv-workspace-pages');
  if (pages && !pages.querySelector('[data-sv-page="inbox"]')) {
    const inbox = document.createElement('section');
    inbox.className = 'sv-workspace-page'; inbox.dataset.svPage = 'inbox';
    inbox.innerHTML = '<div class="sv-inbox"><header class="sv-inbox-head"><div><span>PRIVATE OPERATIONS · REVIEW QUEUE</span><h1>Inbox</h1><p>A single starting point for work that needs review. This preview shows available workflows, not invented task records.</p></div><small>SAFE EMPTY STATE</small></header><section class="sv-inbox-empty"><strong>Nothing is waiting for review</strong><p>When a workflow produces a reviewable result, it will belong here. For now, start from one of the existing operations below.</p></section><section class="sv-inbox-actions"><a href="/account-tools/splitter"><span>ACCOUNT</span><b>Account splitter</b><small>Turn raw account lines into a reviewable UP, UC, UPC, or UPCE result.</small><em>Open →</em></a><a href="/cookie-tools/extractor"><span>VAULT REVIEW</span><b>Cookie extractor</b><small>Find stored records from a username list before copying or exporting.</small><em>Open →</em></a><a href="/data-center"><span>DATA CONTROL</span><b>Data center</b><small>Review recovery, import, integrity, and encrypted sync controls.</small><em>Open →</em></a></section><section class="sv-inbox-state" aria-label="Inbox review boundaries"><article><span>Source</span><b>Workflow output only</b><p>No synthetic task records are shown in this preview.</p></article><article><span>Review</span><b>Operator starts action</b><p>Open a workflow to produce copy, export, or recovery results.</p></article><article><span>Privacy</span><b>No raw vault data</b><p>Saved cookies, scripts, and credentials stay out of the review queue.</p></article></section></div>';
    pages.append(inbox);
    const style = document.createElement('style');
    style.textContent = 'body.sv-route-preview[data-sv-workspace="inbox"] [data-sv-workspace-item],body.sv-route-preview[data-sv-workspace="inbox"] .sv-workspace-page:not([data-sv-page="inbox"]){display:none!important}body.sv-route-preview[data-sv-workspace="inbox"] .sv-workspace-page[data-sv-page="inbox"]{display:block}';
    document.head.append(style);
  }
  const vaultList = $('#vault');
  if (vaultList && !$('#sv-vault-cookie-ops')) {
    const cookieOps = document.createElement('section');
    cookieOps.id = 'sv-vault-cookie-ops'; cookieOps.className = 'sv-vault-cookie-ops'; cookieOps.dataset.svWorkspaceItem = 'vault';
    cookieOps.innerHTML = '<header><div><span>VAULT OPERATIONS</span><h2>Cookie operations</h2><p>Paste usernames, cookies, UPC, or UPCE lines to find vault records. Screen values stay masked; copy, export, and move actions require explicit intent.</p></div><small>MASKED BY DEFAULT</small></header><div class="sv-vault-cookie-stats"><span><b id="sv-vault-cookie-groups">0</b> groups</span><span><b id="sv-vault-cookie-records">0</b> records</span><span><b id="sv-vault-cookie-missing">0</b> missing cookies</span><span><b id="sv-vault-cookie-recent">0</b> updated recently</span><span><b id="sv-vault-cookie-mixed">0</b> mixed coverage</span><span><b id="sv-vault-cookie-selected">0</b> selected</span></div><section class="sv-vault-triage" aria-label="Vault cookie triage"><div class="sv-vault-triage-input"><label for="sv-vault-triage-input">Paste or search vault</label><textarea id="sv-vault-triage-input" spellcheck="false" placeholder="FixtureUser&#10;username:password:cookie:email&#10;_|WARNING:raw-cookie"></textarea><div class="sv-vault-triage-chips"><span>username</span><span>cookie</span><span>UPC</span><span>UPCE</span></div><div class="sv-vault-triage-run"><button class="bsm" id="sv-vault-triage-search" type="button">Search vault</button><button class="bsm b-ghost" id="sv-vault-triage-clear" type="button">Clear</button><small id="sv-vault-triage-detected">0 lines ready</small></div></div><div class="sv-vault-triage-results"><div class="sv-vault-triage-head"><b id="sv-vault-triage-summary">No search yet</b><small>All vault</small></div><div class="sv-vault-triage-list" id="sv-vault-triage-list"><div class="sv-vault-triage-empty"><b>No records searched yet.</b><span>Paste usernames, raw cookies, UPC, or UPCE lines on the left. Matching checks usernames and exact cookie values across the current vault.</span></div></div><div class="sv-vault-triage-actions"><button class="bsm" id="sv-vault-triage-copy-upce" type="button" disabled>Copy UPCE</button><button class="bsm b-ghost" id="sv-vault-triage-move-today" type="button" disabled>Move to today</button><button class="bsm b-ghost" id="sv-vault-triage-open-bulk" type="button" disabled>Open Bulk Lookup</button></div></div></section><p id="sv-vault-cookie-selection-help">Select one or more Vault groups to copy, export, extract, or clear selection actions.</p><div class="sv-vault-cookie-actions"><button class="bsm" id="sv-vault-copy-selected" type="button" disabled>Copy cookies</button><button class="bsm b-ghost" id="sv-vault-export-selected" type="button" disabled>Export selected</button><button class="bsm b-ghost" id="sv-vault-extract-selected" type="button" disabled>Extract selected</button><button class="bsm b-ghost" id="sv-vault-clear-selection" type="button" disabled>Clear selection</button><a class="bsm" href="/cookie-tools/extractor">Check coverage</a><a class="bsm b-ghost" href="/cookie-tools/bulk-lookup">Bulk lookup</a><a class="bsm b-ghost" href="/cookie-tools">Advanced Cookie Tools →</a></div>';
    vaultList.before(cookieOps);
    [['#sv-vault-triage-search','search'],['#sv-vault-triage-clear','clear'],['#sv-vault-triage-copy-upce','copy'],['#sv-vault-triage-move-today','move'],['#sv-vault-triage-open-bulk','list'],['#sv-vault-copy-selected','cookie'],['#sv-vault-export-selected','database'],['#sv-vault-extract-selected','search'],['#sv-vault-clear-selection','clear']].forEach(([selector, name]) => addIcon(cookieOps.querySelector(selector), name));
    const updateCookieOps = () => { const groups = typeof vault === 'undefined' ? [] : vault, now = Date.now(), recentWindow = 30 * 24 * 60 * 60 * 1000, records = groups.reduce((total, group) => total + (Array.isArray(group.cookies) ? group.cookies.length : 0), 0), missing = groups.reduce((total, group) => total + (Array.isArray(group.cookies) ? group.cookies.filter(cookie => !cookie.cookie).length : 0), 0), recent = groups.reduce((total, group) => total + (Array.isArray(group.cookies) ? group.cookies.filter(cookie => cookie.cookie && Number.isFinite(cookie.updatedAt) && now - cookie.updatedAt <= recentWindow).length : 0), 0), mixed = groups.filter(group => { const cookies = Array.isArray(group.cookies) ? group.cookies : []; return cookies.some(cookie => cookie.cookie) && cookies.some(cookie => !cookie.cookie); }).length, selected = typeof bulkSelected === 'undefined' ? 0 : bulkSelected.size; text('#sv-vault-cookie-groups', groups.length); text('#sv-vault-cookie-records', records); text('#sv-vault-cookie-missing', missing); text('#sv-vault-cookie-recent', recent); text('#sv-vault-cookie-mixed', mixed); text('#sv-vault-cookie-selected', selected); text('#sv-vault-cookie-selection-help', selected ? `${selected} group${selected === 1 ? '' : 's'} selected. Copy, export, extract, or clear the group selection below.` : 'Select one or more Vault groups, or select triage rows above, to copy, export, extract, or move records.'); cookieOps.classList.toggle('sv-vault-cookie-no-selection', !selected); ['copy-selected','export-selected','extract-selected','clear-selection'].forEach(action => { const button = $(`#sv-vault-${action}`); if (button) button.disabled = !selected; }); };
    let triageRows = [], triageSelected = new Set();
    const maskValue = value => value ? `${String(value).slice(0, 10)}••••${String(value).slice(-4)}` : '—';
    const lineParts = line => { const parts = line.split(':'); return {username: (parts[0] || '').trim(), cookie: (parts.length >= 3 ? parts.slice(2, -1).join(':') || parts[2] : line).trim()}; };
    const selectedTriageRows = () => [...triageSelected].map(index => triageRows[index]).filter(row => row?.status === 'matched');
    const setTriageActions = () => { const count = selectedTriageRows().length; ['copy-upce','move-today','open-bulk'].forEach(id => { const button = $(`#sv-vault-triage-${id}`); if (button) button.disabled = !count; }); };
    const renderTriage = () => { const list = $('#sv-vault-triage-list'), matched = triageRows.filter(row => row.status === 'matched').length, missingRows = triageRows.length - matched; cookieOps.classList.toggle('sv-vault-triage-empty-state', !triageRows.length); text('#sv-vault-triage-summary', triageRows.length ? `${matched} matched · ${missingRows} missing · ${triageSelected.size} selected` : 'No search yet'); list.innerHTML = triageRows.length ? '' : '<div class="sv-vault-triage-empty"><b>No records searched yet.</b><span>Paste usernames, raw cookies, UPC, or UPCE lines on the left. Matching checks usernames and exact cookie values across the current vault.</span></div>'; triageRows.forEach((row, index) => { const item = document.createElement('label'); item.className = `sv-vault-triage-row ${row.status}`; item.style.setProperty('--row-index', Math.min(index, 8)); item.innerHTML = row.status === 'matched' ? `<input type="checkbox" ${triageSelected.has(index) ? 'checked' : ''}><i></i><span><b>${row.cookie.username ? row.cookie.username.replace(/[&<>"']/g, '') : 'anonymous'}</b><small>${row.group.name.replace(/[&<>"']/g, '') || 'Unnamed source group'}</small></span><em>${row.cookie.email ? (typeof maskEmail === 'function' ? maskEmail(row.cookie.email) : 'email') : 'no email'}</em><code>${maskValue(row.cookie.cookie)}</code>` : `<input type="checkbox" disabled><i></i><span><b>${row.query.replace(/[&<>"']/g, '')}</b><small>No matching username or exact cookie found in this vault.</small></span><em>missing</em><code>—</code>`; item.querySelector('input').onchange = event => { if (event.target.checked) triageSelected.add(index); else triageSelected.delete(index); renderTriage(); }; if (row.status === 'matched') item.ondblclick = () => { if (typeof openPanel === 'function') openPanel(row.group.id); }; list.append(item); }); setTriageActions(); };
    const runTriage = () => { const lines = $('#sv-vault-triage-input').value.split(/\r?\n/).map(line => line.trim()).filter(Boolean), pool = (typeof vault === 'undefined' ? [] : vault).flatMap(group => (group.cookies || []).map(cookie => ({group, cookie}))); triageSelected.clear(); triageRows = lines.map(line => { const parsed = lineParts(line), username = parsed.username.toLowerCase(), cookieValue = parsed.cookie; const found = pool.find(({cookie}) => (cookie.username || '').toLowerCase() === username || cookie.cookie === cookieValue || cookie.cookie === line); return found ? {status:'matched', query:line, ...found} : {status:'missing', query:line}; }); renderTriage(); };
    $('#sv-vault-triage-input').addEventListener('input', event => text('#sv-vault-triage-detected', `${event.target.value.split(/\r?\n/).filter(line => line.trim()).length} lines ready`));
    $('#sv-vault-triage-search').onclick = runTriage;
    $('#sv-vault-triage-clear').onclick = () => { $('#sv-vault-triage-input').value = ''; triageRows = []; triageSelected.clear(); text('#sv-vault-triage-detected', '0 lines ready'); renderTriage(); };
    $('#sv-vault-triage-copy-upce').onclick = () => { const lines = selectedTriageRows().map(row => typeof fmtLine === 'function' ? fmtLine(row.cookie, 'user:pass:cookie:email') : '').filter(Boolean); if (!lines.length) return; copyText(lines.join('\n'), () => toast(`Copied ${lines.length} UPCE line${lines.length === 1 ? '' : 's'}`, 'ok'), () => toast('Copy failed', 'err')); };
    $('#sv-vault-triage-open-bulk').onclick = () => { const input = $('#bl-ta'), names = selectedTriageRows().map(row => row.cookie.username).filter(Boolean); if (!input || !names.length) return; input.value = names.join('\n'); input.dispatchEvent(new Event('input', {bubbles:true})); document.querySelector('[data-sv-tool-route="/cookie-tools/bulk-lookup"]')?.click(); };
    $('#sv-vault-triage-move-today').onclick = async () => { const rows = selectedTriageRows(); if (!rows.length) return; const ok = typeof customConfirm === 'function' ? await customConfirm(`Move ${rows.length} selected record${rows.length === 1 ? '' : 's'} to today's group? Records leave their source groups and are added to the dated destination.`, 'Move') : confirm('Move selected records to today?'); if (!ok) return; const d = new Date(), dd = String(d.getDate()).padStart(2, '0'), mm = String(d.getMonth() + 1).padStart(2, '0'), yy = String(d.getFullYear()).slice(-2), name = `${dd}/${mm}/${yy}`; let target = vault.find(group => group.name === name && !group.banned); if (!target) { target = {id: Date.now().toString(36) + Math.random().toString(36).slice(2,5), name, serverName:null, banned:false, pinned:false, createdAt:Date.now(), alternatives:[], cookies:[], changelog:[]}; vault.push(target); if (typeof logChange === 'function') logChange(target, 'Created from Vault triage move'); } let moved = 0; rows.forEach(row => { if (row.group.id === target.id) return; const index = row.group.cookies.indexOf(row.cookie); if (index < 0) return; const [cookie] = row.group.cookies.splice(index, 1); if (typeof addCookieTimelineEntry === 'function') addCookieTimelineEntry(cookie, 'moved', `Moved to "${target.name}" via Vault triage`); target.cookies.push(cookie); moved++; }); if (moved && typeof logChange === 'function') logChange(target, `Received ${moved} cookies via Vault triage`); saveVault(); render(); triageRows = []; triageSelected.clear(); $('#sv-vault-triage-input').value = ''; renderTriage(); toast(`Moved ${moved} record${moved === 1 ? '' : 's'} to "${target.name}"`, 'ok'); };
    renderTriage();
    $('#sv-vault-copy-selected').onclick = () => $('#bulk-bar-copy')?.click();
    $('#sv-vault-export-selected').onclick = () => $('#bulk-bar-export')?.click();
    $('#sv-vault-extract-selected').onclick = () => { const selectedGroups = typeof getBulkGroups === 'function' ? getBulkGroups() : []; const usernames = [...new Set(selectedGroups.flatMap(group => (group.cookies || []).map(cookie => cookie.username).filter(Boolean)))]; const input = $('#cx-ta'); if (!usernames.length || !input) return; closePanel(); input.value = usernames.join('\n'); input.dispatchEvent(new Event('input', { bubbles: true })); const extractor = document.querySelector('[data-sv-tool-route="/cookie-tools/extractor"]'); if (extractor) extractor.click(); };
    $('#sv-vault-clear-selection').onclick = () => $('#bulk-bar-cancel')?.click();
    const bulkBar = $('#bulk-bar'), bulkCount = $('#bulk-bar-count');
    const updateBulkEmpty = () => bulkBar?.classList.toggle('sv-bulk-empty', /^0\s+selected/i.test((bulkCount?.textContent || '').trim()));
    if (bulkCount) new MutationObserver(updateBulkEmpty).observe(bulkCount, {childList:true,subtree:true,characterData:true});
    new MutationObserver(updateCookieOps).observe(vaultList, {childList:true,subtree:true}); document.addEventListener('click', event => { if (event.target.closest('.gcard-chk,#bulk-bar-cancel,#bulk-bar-copy,#bulk-bar-export')) setTimeout(() => { updateCookieOps(); updateBulkEmpty(); }, 0); }); updateCookieOps(); updateBulkEmpty();
  }
  if (dashboard && !dashboard.querySelector('.sv-dashboard-changelog')) {
    const changelog = document.createElement('section');
    changelog.className = 'sv-dashboard-changelog';
    changelog.innerHTML = '<div class="sv-dashboard-changelog-head"><div><span>BOUNDARIES</span><b>Operating state</b></div><small>Honest preview</small></div><div class="sv-changelog-list"><article><strong>Local</strong><b>Vault metrics only</b><p>Counts come from the loaded vault fixture/session and stay at zero when no records are present.</p></article><article><strong>Separate</strong><b>Shared tools isolated</b><p>The shared surface remains split from private vault controls, scripts, and server administration.</p></article><article><strong>Read-only</strong><b>Adopt Me watcher</b><p>Watcher screens show sample/provider-boundary data unless a live integration proves otherwise.</p></article><article><strong>Hidden</strong><b>Provider balance</b><p>Unavailable provider values are removed instead of showing fake account or billing status.</p></article></div>';
    const grid = dashboard.querySelector('.sv-dashboard-grid');
    const start = document.createElement('section');
    start.className = 'sv-dashboard-start';
    start.innerHTML = '<div class="sv-dashboard-start-head"><div><span>START HERE</span><b>Choose your next operation</b></div><small>Active workspaces</small></div><div class="sv-start-list"><a href="/vault" data-sv-start-icon="cookie"><strong>01</strong><span><b>Run Vault Triage</b><small>Copy UPCE or move matched records.</small></span><em>Open</em></a><a href="/account-tools" data-sv-start-icon="split"><strong>02</strong><span><b>Open Account Ops</b><small>Split, compare, extract, validate, lookup.</small></span><em>Open</em></a><a href="/adopt-me/" data-sv-start-icon="database"><strong>03</strong><span><b>Watch Adopt Me</b><small>Read-only pets, inventory, and accounts.</small></span><em>Open</em></a><a href="/data-center" data-sv-start-icon="database"><strong>04</strong><span><b>Open Data Center</b><small>Recovery, import, integrity, and sync.</small></span><em>Open</em></a></div>';
    start.querySelectorAll('a').forEach(link => { addIcon(link, link.dataset.svStartIcon || 'search', 'sv-start-icon'); link.addEventListener('click', () => { link.dataset.selected = 'true'; }); });
    if (grid) {
      grid.before(start);
      grid.after(changelog);
    } else {
      dashboard.lastElementChild?.after(start);
      start.after(changelog);
    }
  }
  const syncProviderMetric = () => {
    const value = $('#sv-dash-points'), card = value?.closest('article'), note = $('#sv-dash-points-note');
    if (!card) return;
    const unavailable = /^(?:—|-)?$/.test((value?.textContent || '').trim()) || /checking saved key|balance unavailable|not configured|saved key/i.test(note?.textContent || '');
    card.dataset.svProviderMetric = unavailable ? 'hidden' : 'live';
    card.hidden = unavailable;
    card.toggleAttribute('aria-hidden', unavailable);
  };
  if (dashboard) {
    const metrics = dashboard.querySelector('.sv-dashboard-metrics');
    if (metrics) new MutationObserver(syncProviderMetric).observe(metrics, {childList:true,subtree:true,characterData:true});
    syncProviderMetric();
  }
  all('.sv-dashboard-panel-head span,.sv-dashboard-metrics small:not([id]),.sv-dashboard-quick i').forEach(node => node.remove());
  text('[data-sv-page="accounts"] .sv-tool-suite-head h1', 'Account Ops');
  text('[data-sv-page="cookies"] .sv-tool-suite-head h1', 'Cookie Operations');
  all('.sv-tool-return').forEach(button => { button.textContent = '← All Tools'; });
  all('.sv-tool-suite-head p,.sv-tool-suite-head>span,.sv-tool-page-head>span,.sv-tool-page-head>small').forEach(node => node.remove());
  const descriptions = { comparator: 'Compare username lists locally.', splitter: 'Convert account lines.', 'username-extractor': 'Extract usernames from files.', 'ps-links': 'Pair usernames with server links.', validator: 'Check names against vault groups.', extractor: 'Review masked cookie coverage.', 'bulk-lookup': 'Match usernames before moving.' };
  const toolIcons = { comparator: 'compare', splitter: 'split', 'username-extractor': 'filter', 'ps-links': 'link', validator: 'shield', extractor: 'cookie', 'bulk-lookup': 'search' };
  all('.sv-tool-launch-grid button').forEach(button => {
    const key = button.dataset.svToolRoute.split('/').pop();
    addIcon(button, toolIcons[key] || 'search', 'sv-tool-launch-icon');
    button.querySelector('span').textContent = descriptions[key];
    const kind = button.querySelector('i'), boundary = button.querySelector('small');
    if (kind) { kind.className = 'sv-tool-kind'; kind.textContent = ['validator', 'extractor', 'bulk-lookup'].includes(key) ? 'vault review' : 'browser utility'; }
    if (boundary) { boundary.className = 'sv-tool-boundary'; boundary.textContent = ['validator', 'extractor', 'bulk-lookup'].includes(key) ? 'reads existing vault' : 'local processing'; }
  });
  all('.sv-tool-detail').forEach(section => {
    const key = section.dataset.svToolDetail;
    const note = section.querySelector('.sv-tool-page-head p'); if (note) note.textContent = descriptions[key];
    section.querySelectorAll('.sv-dedicated-tool-card>h3,.sv-dedicated-tool-card>.sv-note,.sv-ps-links-card>header').forEach(node => node.remove());
    section.querySelectorAll('button').forEach(button => { if (/^close$/i.test(button.textContent.trim())) button.hidden = true; });
  });
  const splitterDetail = $('[data-sv-tool-detail="splitter"]');
  if (splitterDetail && !splitterDetail.dataset.svSplitEmptyGuard) {
    splitterDetail.dataset.svSplitEmptyGuard = '1';
    const input = splitterDetail.querySelector('#sv-splitter-input'), count = splitterDetail.querySelector('#sv-splitter-count'), preview = splitterDetail.querySelector('#sv-split-preview');
    if (preview && !preview.getAttribute('placeholder')) preview.setAttribute('placeholder', 'Valid records appear here after parsing.');
    const updateSplitterEmpty = () => splitterDetail.classList.toggle('sv-split-empty', !input?.value.trim() && /^0\s+(records|extracted)/i.test(count?.textContent || '0 records'));
    input?.addEventListener('input', () => requestAnimationFrame(updateSplitterEmpty));
    if (count) new MutationObserver(updateSplitterEmpty).observe(count, { childList: true, characterData: true, subtree: true });
    updateSplitterEmpty();
  }
  const accountIndex = $('[data-sv-page="accounts"] .sv-tool-launch-grid');
  if (accountIndex) {
    const accountPage = accountIndex.closest('[data-sv-page="accounts"]');
    if (accountPage && !accountPage.querySelector('.sv-account-ops-brief')) {
      const brief = document.createElement('section');
      brief.className = 'sv-account-ops-brief';
      brief.innerHTML = '<div><span>ACCOUNT WORKFLOW</span><b>Local transforms first, vault review only when needed.</b><p>Use browser utilities for paste, compare, split, and file parsing. Vault review tools read saved groups and keep copy or move steps behind the existing review flow.</p></div><ol><li><strong>1</strong><span>Prepare locally.</span></li><li><strong>2</strong><span>Validate vault.</span></li><li><strong>3</strong><span>Review staged records.</span></li></ol>';
      accountIndex.before(brief);
    }
    const browser = document.createElement('div'); browser.className = 'sv-tool-launch-group';
    const browserTitle = document.createElement('h2'); browserTitle.className = 'sv-index-group'; browserTitle.textContent = 'Browser utilities';
    const vault = document.createElement('div'); vault.className = 'sv-tool-launch-group';
    const vaultTitle = browserTitle.cloneNode(); vaultTitle.textContent = 'Vault review';
    const cookieIndex = $('[data-sv-page="cookies"] .sv-tool-launch-grid');
    const browserGrid = accountIndex.cloneNode(false), vaultGrid = accountIndex.cloneNode(false);
    browserGrid.className = vaultGrid.className = 'sv-tool-launch-grid';
    [...accountIndex.children].forEach(button => (button.dataset.svToolRoute.endsWith('/validator') ? vaultGrid : browserGrid).append(button));
    cookieIndex?.querySelectorAll('button[data-sv-tool-route]').forEach(button => { const clone = button.cloneNode(true); clone.onclick = () => [...document.querySelectorAll(`[data-sv-tool-route="${clone.dataset.svToolRoute}"]`)].find(node => node !== clone && node.onclick)?.click(); vaultGrid.append(clone); });
    browser.append(browserTitle, browserGrid); vault.append(vaultTitle, vaultGrid); accountIndex.replaceWith(browser, vault);
  }
  const cookieIndex = $('[data-sv-page="cookies"] .sv-tool-launch-grid');
  if (cookieIndex) {
    const cookiePage = cookieIndex.closest('[data-sv-page="cookies"]');
    if (cookiePage && !cookiePage.querySelector('.sv-cookie-ops-brief')) {
      const brief = document.createElement('section');
      brief.className = 'sv-cookie-ops-brief';
      brief.innerHTML = '<div><span>VAULT REVIEW FLOW</span><b>Masked coverage before copy or move.</b><p>Use these routes when the work starts from existing vault records. Results stay masked until copied or explicitly moved through the existing confirmation flow.</p></div><ol><li><strong>1</strong><span>Inspect grouped cookie coverage.</span></li><li><strong>2</strong><span>Match pasted usernames locally.</span></li><li><strong>3</strong><span>Copy, export, or move only after review.</span></li></ol>';
      cookieIndex.before(brief);
    }
    const heading = document.createElement('h2'); heading.className = 'sv-index-group'; heading.textContent = 'Vault review'; cookieIndex.before(heading);
    if (cookiePage && !cookiePage.querySelector('.sv-cookie-review-state')) {
      const state = document.createElement('section');
      state.className = 'sv-cookie-review-state';
      state.setAttribute('aria-label', 'Cookie operation boundaries');
      state.innerHTML = '<article><span>Source</span><b>Vault records only</b><p>Use these tools after records are already saved in the private vault.</p></article><article><span>Output</span><b>Masked until action</b><p>Coverage and lookup results stay reviewed before copy, export, or move.</p></article><article><span>Moves</span><b>Confirmation-gated</b><p>Group changes keep the existing acknowledgement and cancel flow.</p></article>';
      cookieIndex.after(state);
    }
  }
  // Secondary workspaces keep their existing action and confirmation owners.
  const data = $('[data-sv-page="data"]');
  if (data) {
    const heading = data.querySelector('.sv-workspace-heading');
    heading.innerHTML = '<h1>Data Center</h1><p id="sv-data-sync" role="status"></p>';
    const sync = $('#sv-dash-server');
    const update = () => text('#sv-data-sync', sync?.textContent || 'Server sync state unavailable');
    if (sync) new MutationObserver(update).observe(sync, {childList:true,subtree:true,characterData:true}); update();
    if (!data.querySelector('.sv-data-brief')) {
      const brief = document.createElement('section');
      brief.className = 'sv-data-brief';
      brief.innerHTML = '<div><span>RECOVERY WORKFLOW</span><b>Export first, review imports, then sync deliberately.</b><p>Data Center keeps destructive choices behind the existing recovery and review flows. No provider data is shown here.</p></div><ol><li><strong>1</strong><span>Download recovery first.</span></li><li><strong>2</strong><span>Review imports before applying.</span></li><li><strong>3</strong><span>Sync only after private sign-in.</span></li></ol>';
      heading.after(brief);
    }
    const names = {recovery:['Export recovery copy','Download the current { version, exported, vault } recovery file.','Download recovery →'],import:['Import vault','Review an import file before applying anything.','Open review →'],data:['Check local data','Review local vault integrity and recovery guidance.','Check integrity →']};
    const rows = data.querySelector('.sv-workspace-cards'); rows.classList.add('sv-data-actions'); rows.setAttribute('aria-label','Data Center actions');
    for (const key of ['recovery','import','data']) {
      const button = rows.querySelector(`[data-sv-open="${key}"]`); if (!button) continue;
      button.querySelector('b').textContent = names[key][0]; button.querySelector('span').textContent = names[key][1]; let action = button.querySelector('.sv-data-action-label'); if (!action) { action = document.createElement('em'); action.className = 'sv-data-action-label'; button.append(action); } action.textContent = names[key][2]; rows.append(button);
    }
    if (!data.querySelector('.sv-data-state')) {
      const state = document.createElement('section');
      state.className = 'sv-data-state';
      state.innerHTML = '<article><span>RECOVERY</span><b>Browser-local export</b><p>Download a recovery copy before import or sync work.</p></article><article><span>IMPORT</span><b>No import staged</b><p>Imported files open in the existing review modal before vault writes.</p></article><article><span>SYNC</span><b>Private sign-in required</b><p>No provider data is shown in this preview fixture.</p></article>';
      rows.after(state);
    }
  }
  const repo = $('.sv-repo');
  if (repo) {
    repo.querySelector('header span')?.remove(); repo.querySelector('header p')?.remove();
    const main = repo.querySelector('.sv-repo-layout>main');
    const empty = document.createElement('section'); empty.id = 'sv-repo-empty'; empty.className = 'sv-repo-empty-panel'; empty.innerHTML = '<b>No script open</b><span>Select a private Lua file or create one. Raw URLs and Fool sharing stay locked until the script is saved.</span><small>Encrypted repository controls appear here only when you are editing a real script.</small><a class="sv-repo-empty-action" href="/data">Open Data Center →</a>'; main.before(empty);
    const recovery = document.createElement('section'); recovery.className = 'sv-repo-recovery-strip'; recovery.setAttribute('aria-label', 'Scripts recovery boundaries'); recovery.innerHTML = '<article><span>Repository</span><b>Unavailable</b><small>No private Lua files are listed.</small></article><article><span>Editor</span><b>Locked</b><small>Create, raw URL, and publish controls stay hidden.</small></article><article><span>Recovery</span><b>Data Center</b><small>Use recovery/export tools before retrying the API.</small></article>'; empty.after(recovery);
    const sharing = document.createElement('details'); sharing.className = 'sv-repo-distribution'; sharing.innerHTML = '<summary>Sharing and raw URLs</summary>'; main.append(sharing);
    main.querySelectorAll('.sv-repo-publish,#sv-repo-url-area,#sv-repo-tokens').forEach(node => sharing.append(node));
    const syntax = document.createElement('details'); syntax.className = 'sv-repo-syntax'; syntax.innerHTML = '<summary>Syntax preview</summary>'; $('.sv-repo-code-preview').before(syntax); syntax.append($('.sv-repo-code-preview'));
    label('sv-repo-name', 'File name'); label('sv-repo-source', 'Lua source');
    let creating = false;
    const update = () => {
      const unavailable = Boolean(repo.querySelector('.sv-repo-api-unavailable')) || /Private scripts unavailable/i.test($('#sv-repo-list')?.textContent || '');
      if (unavailable) creating = false;
      const selected = Boolean(repo.querySelector('[data-repo-script].on')) && !/Create a script/.test($('#sv-repo-meta').textContent);
      const editing = selected || creating;
      main.hidden = !editing; empty.hidden = editing; recovery.hidden = editing || !unavailable; sharing.hidden = !selected;
      $('#sv-repo-delete').disabled = !selected;
      const newButton = $('#sv-repo-new'); if (newButton) { newButton.disabled = unavailable; newButton.textContent = unavailable ? 'Scripts Unavailable' : 'New Script'; newButton.setAttribute('aria-disabled', String(unavailable)); }
      const emptyAction = empty.querySelector('.sv-repo-empty-action'); if (emptyAction) emptyAction.hidden = !unavailable;
      if (unavailable && !empty.hidden) { empty.querySelector('b').textContent = 'Script editor locked'; empty.querySelector('span').textContent = 'Private script storage is unavailable in this session. Sign in or restart the private API before creating encrypted Lua files.'; empty.querySelector('small').textContent = 'No demo records or raw URLs are shown while the repository API is unavailable.'; }
      else { empty.querySelector('b').textContent = 'No script open'; empty.querySelector('span').textContent = 'Select a private Lua file or create one. Raw URLs and Fool sharing stay locked until the script is saved.'; empty.querySelector('small').textContent = 'Encrypted repository controls appear here only when you are editing a real script.'; }
      // Preserve the list's actual loading/error message; never invent records.
    };
    $('#sv-repo-new').addEventListener('click', event => { if ($('#sv-repo-new').disabled) { event.preventDefault(); return; } creating = true; sharing.open = false; update(); $('#sv-repo-name').focus(); });
    $('#sv-repo-list').addEventListener('click', () => { creating = false; });
    new MutationObserver(update).observe($('#sv-repo-list'), {childList:true,subtree:true,attributes:true,attributeFilter:['class']}); update();
  }
  // Rehouse controls, never recreate their handlers or tool models.
  const cmp = $('#sv-tool-host-comparator');
  if (cmp) {
    ['left', 'right'].forEach(side => { const input = $(`#sv-cmp-${side}`), fileButton = input.parentElement.querySelector(`label[for="sv-cmp-${side}-file"]`), clearButton = $(`#sv-cmp-clear-${side}`), row = document.createElement('div'); label(input.id, `${side === 'left' ? 'Left' : 'Right'} input`); clearButton.textContent = `Clear ${side === 'left' ? 'Left' : 'Right'}`; row.className = 'sv-cmp-source-actions'; if (fileButton) row.append(fileButton); row.append(clearButton); input.parentElement.append(row); });
    const exportButton = document.createElement('button'); exportButton.id = 'sv-cmp-export'; exportButton.className = 'bsm'; exportButton.textContent = 'Export TXT'; exportButton.type = 'button';
    exportButton.onclick = () => { const names = [...new Set(all('#sv-cmp-results .sv-cmp-row span').map(node => node.textContent))]; if (names.length) SaturnitySplitter.download(names.join('\n'), 'comparison.txt'); };
    const cmpToolbar = toolbar($('#sv-cmp-results'), [$('#sv-cmp-summary'), $('#sv-cmp-filter'), $('#sv-cmp-copy-selected'), $('#sv-cmp-copy-all'), exportButton]);
    const cmpFrame = document.createElement('section'); cmpFrame.className = 'sv-cmp-result-frame';
    cmpFrame.innerHTML = '<header><b>Comparison results</b><small id="sv-cmp-frame-status">No comparison run</small></header><p class="sv-cmp-empty">Add two sources, then compare. Matches and one-sided usernames stay browser-local until copied or exported.</p>';
    cmpToolbar.before(cmpFrame); cmpFrame.append(cmpToolbar, $('#sv-cmp-results'));
    $('#sv-cmp-filter').setAttribute('aria-label', 'Result category');
    text('#sv-cmp-run', 'Compare');
    const selection = document.createElement('span'); selection.id = 'sv-cmp-selection'; selection.textContent = '0 selected'; $('#sv-cmp-summary').after(selection);
    const update = () => { const rows = all('#sv-cmp-results .sv-cmp-row'); const n = all('#sv-cmp-results input:checked').length; selection.textContent = `${n} selected`; $('#sv-cmp-copy-selected').disabled = !n; $('#sv-cmp-copy-all').disabled = !rows.length; exportButton.disabled = !rows.length; cmpFrame.classList.toggle('sv-cmp-has-results', !!rows.length); $('#sv-cmp-frame-status').textContent = rows.length ? `${rows.length} visible` : 'No output yet'; };
    new MutationObserver(update).observe($('#sv-cmp-results'), {childList:true,subtree:true}); cmp.addEventListener('change', update); update();
  }
  const splitter = $('#sv-tool-host-splitter');
  if (splitter) {
    label('sv-splitter-input', 'Account lines');
    const report = splitter.querySelector('.sv-report-grid');
    if (report && !splitter.querySelector('#sv-splitter-upce')) report.insertAdjacentHTML('beforeend', '<span>UPCE</span><b id="sv-splitter-upce">0</b>');
    const copies = [...splitter.querySelectorAll('[data-sv-copy]')], exports = [...splitter.querySelectorAll('[data-sv-export]')];
    const result = document.createElement('section'); result.className = 'sv-splitter-result';
    result.innerHTML = '<div class="sv-result-toolbar"><label>Copy format <select id="sv-split-format"><option>UPC</option><option>UC</option><option>UP</option><option>UPCE</option></select></label><label>Phone groups <select id="sv-split-groups"><option value="4" selected>4 groups</option><option value="3">3 groups</option><option value="2">2 groups</option><option value="1">1 group</option></select></label><button class="bsm" id="sv-split-copy">Copy all</button><label>Export format <select id="sv-split-export"><option value="txt">TXT (UPC)</option><option value="json">JSON (all fields)</option><option value="csv">CSV (all fields)</option></select></label><button class="bsm" id="sv-split-download">Export</button></div><p id="sv-split-summary" class="sv-split-summary" role="status">Auto-converts while you type. Paste valid account lines above to unlock copy and export.</p><label class="sv-input-label" for="sv-split-preview">Output preview</label><textarea id="sv-split-preview" readonly></textarea><div class="sv-split-groups" aria-live="polite"></div>';
    splitter.querySelector('.sv-dedicated-tool-card').append(result);
    copies.concat(exports).forEach(button => button.hidden = true);
    let copiedThrough = -1;
    const update = () => { const format = $('#sv-split-format').value, records = SaturnitySplitter.getRecords(), lines = SaturnitySplitter.textFor(format).split(/\r?\n/).map(line => line.trim()).filter(Boolean), groups = Number($('#sv-split-groups').value), size = Math.ceil(lines.length / groups), chunks = Array.from({length: groups}, (_, index) => lines.slice(index * size, (index + 1) * size)), empty = !records.length, sourceLines = $('#sv-splitter-input').value.split(/\r?\n/).map(line => line.trim()).filter(Boolean), rejected = Math.max(0, sourceLines.length - records.length), lengths = chunks.map(chunk => chunk.join('\n').length), largest = Math.max(0, ...lengths); text('#sv-splitter-upce', records.filter(row => row.format === 'UPCE').length); $('#sv-split-preview').value = lines.join('\n'); $('#sv-split-summary').textContent = empty ? 'Auto-converts while you type. Paste valid account lines above to unlock copy and export.' : `${records.length} valid · ${rejected} rejected · ${groups} groups · largest group ${largest} characters`; $('.sv-split-groups').innerHTML = chunks.map((chunk, index) => { const chars = chunk.join('\n').length, warning = chars > 8000 ? '<span class="sv-split-warning">Large clipboard group — consider a smaller group size.</span>' : '', copied = index <= copiedThrough, next = index === copiedThrough + 1; return `<article class="sv-split-group"><header><b>Group ${index + 1} of ${groups}</b><small>${chunk.length} records · ${chars} characters</small></header>${warning}<textarea readonly aria-label="Group ${index + 1} output">${chunk.join('\n')}</textarea><button class="bsm sv-split-group-copy${next ? ' sv-split-next' : ''}" type="button" data-group="${index}"${!chunk.length ? ' disabled' : ''}>${copied ? `Copied group ${index + 1}` : next ? `Copy next · group ${index + 1}` : `Copy group ${index + 1}`}</button></article>`; }).join(''); $('#sv-split-copy').disabled = empty; $('#sv-split-download').disabled = empty; $('.sv-split-groups').querySelectorAll('.sv-split-group-copy').forEach(button => button.onclick = () => { SaturnityClipboard.copy(chunks[Number(button.dataset.group)].join('\n'), `Copied group ${Number(button.dataset.group) + 1}`); copiedThrough = Math.max(copiedThrough, Number(button.dataset.group)); update(); }); };
    $('#sv-split-copy').onclick = () => SaturnityClipboard.copy(SaturnitySplitter.textFor($('#sv-split-format').value), 'Copied account lines');
    $('#sv-split-download').onclick = () => exports.find(button => button.dataset.svExport === $('#sv-split-export').value).click();
    const reset = () => { copiedThrough = -1; update(); };
    $('#sv-split-format').onchange = reset; $('#sv-split-groups').onchange = reset; $('#sv-splitter-input').addEventListener('input', reset);
    new MutationObserver(update).observe($('#sv-splitter-count'), {childList:true,subtree:true}); update();
  }
  const usernames = $('#sv-tool-host-username-extractor');
  if (usernames && !usernames.dataset.svUsernameFrame) {
    usernames.dataset.svUsernameFrame = '1';
    const card = usernames.querySelector('.sv-dedicated-tool-card'), file = $('#sv-username-csv'), picker = document.querySelector('label[for="sv-username-csv"]'), count = $('#sv-username-count'), actions = card?.querySelector('.sv-extension-actions');
    if (card && file && count && actions) {
      const frame = document.createElement('section'); frame.className = 'sv-username-frame';
      frame.innerHTML = '<div class="sv-username-import"><b>File import</b><p>Add CSV, TXT, JSON, XML, XLS, or XLSX. Parsing stays in this browser and does not touch vault data.</p></div><section class="sv-username-output"><header><b>Extracted usernames</b><small id="sv-username-frame-status">No files parsed</small></header><p class="sv-username-empty">Choose a supported file to parse unique usernames locally. Copy and TXT export unlock only after usernames are extracted.</p><textarea id="sv-username-preview" readonly placeholder="Unique usernames appear here after file import."></textarea></section>';
      file.before(frame); frame.querySelector('.sv-username-import').append(file); if (picker) frame.querySelector('.sv-username-import').append(picker); frame.querySelector('.sv-username-import').append(count); frame.querySelector('.sv-username-output').append(actions);
      const preview = $('#sv-username-preview'), status = $('#sv-username-frame-status');
      const update = () => { const values = SaturnityUsernameExtractor.get(); preview.value = values.join('\n'); const hasValues = !!values.length; frame.querySelector('.sv-username-output').classList.toggle('sv-username-has-output', hasValues); status.textContent = hasValues ? `${values.length} ready to copy/export` : 'No files parsed'; actions.querySelectorAll('button').forEach(button => button.disabled = !hasValues); };
      new MutationObserver(update).observe(count, {childList:true,characterData:true,subtree:true}); file.addEventListener('change', () => setTimeout(update, 120)); update();
    }
  }
  const ps = $('#sv-tool-host-ps-links');
  if (ps) {
    const allow = $('#sv-ps-allow').closest('label'), toggle = $('#sv-ps-filter').closest('label');
    const disclosure = document.createElement('details'); disclosure.className = 'sv-allowlist'; disclosure.innerHTML = '<summary>Filter by allowlist</summary>'; ps.querySelector('.sv-ps-grid').after(disclosure); disclosure.append(toggle, allow);
    const psToolbar = toolbar($('#sv-ps-output'), [$('#sv-ps-status'), $('#sv-ps-copy'), $('#sv-ps-download'), $('#sv-ps-send')]); label('sv-ps-output', 'Extracted links'); const outputLabel = document.querySelector('label[for="sv-ps-output"]');
    const psFrame = document.createElement('section'); psFrame.className = 'sv-ps-result-frame';
    psFrame.innerHTML = '<header><b>Extraction result</b><small id="sv-ps-frame-status">Nothing processed</small></header><p class="sv-ps-empty">Run extraction to pair usernames with private-server links. Output remains browser-local until copied, downloaded, or sent to Link Generator.</p>';
    psToolbar.before(psFrame); psFrame.append(psToolbar); if (outputLabel) psFrame.append(outputLabel); psFrame.append($('#sv-ps-output'));
    const update = () => ['sv-ps-copy','sv-ps-download','sv-ps-send'].forEach(id => document.getElementById(id).disabled = !$('#sv-ps-output').value);
    const updateFrame = () => { const hasOutput = !!$('#sv-ps-output').value.trim(); psFrame.classList.toggle('sv-ps-has-output', hasOutput); $('#sv-ps-frame-status').textContent = hasOutput ? 'Ready to copy/export' : 'Nothing processed'; update(); };
    $('#sv-ps-run').addEventListener('click', () => requestAnimationFrame(updateFrame)); $('#sv-ps-output').addEventListener('input', updateFrame); updateFrame();
  }
  const validator = $('#sv-tool-host-validator');
  if (validator && !validator.dataset.svValidatorFrame) {
    validator.dataset.svValidatorFrame = '1';
    const card = validator.querySelector('.sv-dedicated-tool-card'), input = $('#bv-input'), run = $('#bv-run'), results = $('#bv-results');
    if (card && input && run && results) {
      card.querySelectorAll(':scope>p').forEach(node => node.remove());
      const inputFrame = document.createElement('section'); inputFrame.className = 'sv-validator-input-frame';
      inputFrame.innerHTML = '<header><b>Username intake</b><small>Vault read-only</small></header><p>Paste names one per line. Validation reads the loaded vault only and never writes records.</p>';
      input.before(inputFrame); inputFrame.append(input, run);
      const frame = document.createElement('section'); frame.className = 'sv-validator-frame';
      frame.innerHTML = '<header><b>Vault validation result</b><small id="sv-validator-frame-status">Not validated</small></header><p class="sv-validator-empty">Run validation to classify pasted usernames as found, missing, or banned. This reads the loaded vault only and does not write to vault data.</p>';
      results.before(frame); frame.append(results);
      const update = () => { const visible = results.style.display !== 'none'; frame.classList.toggle('sv-validator-has-results', visible); $('#sv-validator-frame-status').textContent = visible ? 'Results ready to review/copy' : 'Not validated'; };
      run.addEventListener('click', () => requestAnimationFrame(update)); input.addEventListener('input', () => { if (!input.value.trim()) { results.style.display = 'none'; update(); } }); update();
    }
  }
  all('.sv-file-button').forEach(node => { node.textContent = 'Add files'; node.tabIndex = 0; node.setAttribute('role','button'); node.onkeydown = event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); document.getElementById(node.htmlFor).click(); } }; });
})();
