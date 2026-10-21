(() => {
  if (location.hostname !== 'preview.saturnity.site') return;

  const groups = [
    ['Core', [['Dashboard', '/dashboard'], ['Inbox', '/inbox'], ['Vault', '/vault']]],
    ['Operations', [['Adopt Me Watcher', '/adopt-me/'], ['Scripts', '/scripts']]],
    ['Data', [['Account Ops', '/account-tools'], ['Data center', '/data-center']]]
  ];

  function mount() {
    const host = document.querySelector('.zr-side, .rf-side, #sv-route-sidebar');
    if (!host || host.querySelector('.sv-global-nav')) return false;
    const current = location.pathname;
    const nav = document.createElement('div');
    nav.className = 'sv-global-nav';
    nav.innerHTML = `<button class="sv-global-trigger" type="button" aria-expanded="false"><span class="sv-global-grid" aria-hidden="true">••<br>••</span><span><small>Workspace</small><b>Switch workspace</b></span><i aria-hidden="true">⌄</i></button><div class="sv-global-menu" hidden>${groups.map(([label, links]) => `<section><h3>${label}</h3>${links.map(([name, href]) => `<a href="${href}"${current === href || (href !== '/dashboard' && current.startsWith(href)) ? ' class="active"' : ''}><span>${name}</span><small>Open →</small></a>`).join('')}</section>`).join('')}</div>`;
    const anchor = host.querySelector('header, .rf-brand, .sv-route-brand');
    (anchor || host.firstChild).after(nav);
    const trigger = nav.querySelector('.sv-global-trigger');
    const menu = nav.querySelector('.sv-global-menu');
    const close = () => { menu.hidden = true; trigger.setAttribute('aria-expanded', 'false'); };
    trigger.addEventListener('click', event => {
      event.stopPropagation();
      const opening = menu.hidden;
      menu.hidden = !opening;
      trigger.setAttribute('aria-expanded', String(opening));
    });
    document.addEventListener('click', event => { if (!nav.contains(event.target)) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) { close(); trigger.focus(); } });
    const commands = [
      ['Dashboard', 'Home and recent activity', '/dashboard'], ['Inbox', 'Review-ready workflows and unfinished work', '/inbox'], ['Vault', 'Stored groups and cookies', '/vault'],
      ['Account Ops', 'Compare, split, validate, and review cookie data', '/account-tools'], ['Account splitter', 'Convert UP, UC, UPC, or UPCE', '/account-tools/splitter'],
      ['Username extractor', 'Extract clean usernames from files', '/account-tools/username-extractor'], ['PS link workspace', 'Pair usernames with private-server links', '/account-tools/ps-links'],
      ['Cookie extractor', 'Review cookie coverage inside Account Ops', '/cookie-tools/extractor'], ['Cookie bulk lookup', 'Match usernames against stored cookies', '/cookie-tools/bulk-lookup'],
      ['Data center', 'Recovery, imports, and server sync', '/data-center'], ['Scripts', 'Private script workspace', '/scripts'],
      ['Adopt Me Watcher', 'Read-only inventory and account watcher', '/adopt-me/']
    ];
    const commandButton = document.createElement('button');
    commandButton.className = 'sv-global-command'; commandButton.type = 'button'; commandButton.textContent = 'Search'; commandButton.setAttribute('aria-label', 'Open command palette');
    nav.insertBefore(commandButton, menu);
    const palette = document.createElement('div'); palette.className = 'sv-command-palette'; palette.hidden = true;
    palette.innerHTML = '<div class="sv-command-dialog" role="dialog" aria-modal="true" aria-label="Command palette"><div class="sv-command-head"><span>COMMAND PALETTE</span><kbd>ESC</kbd></div><input id="sv-command-input" type="search" autocomplete="off" placeholder="Search workflows and pages"><div class="sv-command-results" role="listbox"></div><small class="sv-command-foot">Searches safe workspace metadata only</small></div>';
    document.body.append(palette);
    const commandInput = palette.querySelector('#sv-command-input'), results = palette.querySelector('.sv-command-results');
    const renderCommands = () => {
      const query = commandInput.value.trim().toLowerCase();
      const matches = commands.filter(([name, description]) => !query || `${name} ${description}`.toLowerCase().includes(query));
      results.innerHTML = matches.length ? matches.map(([name, description, href]) => `<a href="${href}"><span><b>${name}</b><small>${description}</small></span><em>Open</em></a>`).join('') : '<div class="sv-command-empty">No matching workspace</div>';
    };
    const closePalette = restore => { palette.hidden = true; if (restore) commandButton.focus(); };
    const openPalette = () => { close(); palette.hidden = false; commandInput.value = ''; renderCommands(); commandInput.focus(); };
    commandButton.onclick = openPalette; commandInput.addEventListener('input', renderCommands);
    palette.addEventListener('click', event => { if (event.target === palette) closePalette(true); else if (event.target.closest('a')) closePalette(false); });
    document.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openPalette(); }
      else if (event.key === 'Escape' && !palette.hidden) { event.preventDefault(); closePalette(true); }
    });
    // Shared responsive shell contract without changing route ownership.
    host.classList.add('sv-drawer-nav');
    host.dataset.svNavShortcut = 'Ctrl+B';
    const media = matchMedia('(max-width: 980px)');
    const shell = host.closest('.zr-app, .rf-shell') || document.body;
    const setCollapsed = value => {
      const collapsed = Boolean(value && !media.matches);
      host.classList.toggle('side-collapsed', collapsed);
      shell.classList.toggle('side-collapsed', collapsed);
      document.body.classList.toggle('sv-shell-collapsed', collapsed);
      host.setAttribute('aria-label', collapsed ? 'Navigation collapsed. Press Control B to expand.' : 'Navigation expanded. Press Control B to collapse.');
    };
    const topbar = document.createElement('div'); topbar.className = 'sv-mobile-topbar';
    topbar.innerHTML = '<button type="button" aria-expanded="false" title="Menu · Ctrl+B">Menu</button><b>The Fool</b><small>Ctrl+B</small>';
    const toggle = topbar.querySelector('button');
    const backdrop = document.createElement('button'); backdrop.className = 'sv-nav-backdrop'; backdrop.type = 'button'; backdrop.setAttribute('aria-label', 'Close navigation'); backdrop.hidden = true;
    const dismiss = document.createElement('button'); dismiss.className = 'sv-nav-dismiss'; dismiss.type = 'button'; dismiss.textContent = 'Close menu'; host.prepend(dismiss);
    document.body.append(topbar, backdrop);
    let opened = false;
    const setOpen = value => {
      opened = Boolean(value && media.matches); host.classList.toggle('sv-nav-open', opened);
      host.inert = media.matches && !opened; backdrop.hidden = !opened;
      toggle.setAttribute('aria-expanded', String(opened));
      document.body.classList.toggle('sv-nav-is-open', opened);
      if (opened) dismiss.focus(); else toggle.focus({preventScroll:true});
    };
    toggle.onclick = () => setOpen(!opened); dismiss.onclick = () => setOpen(false); backdrop.onclick = () => setOpen(false);
    host.addEventListener('click', event => { if (opened && event.target.closest('nav button,nav a,[data-sv-tool-route],.sv-global-menu a')) setOpen(false); });
    document.addEventListener('keydown', event => {
      if (!opened) return;
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
      if (event.key === 'Tab') {
        const items = [...host.querySelectorAll('a,button,input,select,[tabindex="0"]')].filter(node => !node.disabled && node.getClientRects().length);
        const first = items[0], last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    const resize = () => { if (media.matches) setCollapsed(false); if (!media.matches) { opened=false; host.classList.remove('sv-nav-open'); backdrop.hidden=true; document.body.classList.remove('sv-nav-is-open'); toggle.setAttribute('aria-expanded','false'); } host.inert=media.matches&&!opened; };
    media.addEventListener('change',resize); resize();
    document.addEventListener('keydown', event => {
      const target = event.target;
      if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey || event.key.toLowerCase() !== 'b') return;
      if (target?.closest?.('input,textarea,select,[contenteditable="true"]')) return;
      event.preventDefault();
      close();
      if (media.matches) setOpen(!opened);
      else setCollapsed(!host.classList.contains('side-collapsed'));
    });
    return true;
  }

  if (!mount()) new MutationObserver((_, observer) => { if (mount()) observer.disconnect(); }).observe(document.documentElement, { childList: true, subtree: true });
})();
