(()=>{
  const released=/^(?:preview\.)?saturnity\.site$/i.test(location.hostname);
  if(!released)return;

  const iconPaths={
    gamepad:'<path d="M6 11h4M8 9v4M15 10h.01M18 12h.01"/><path d="M5.2 6.5h13.6a3 3 0 0 1 2.9 3.8l-1.6 5.6a2.5 2.5 0 0 1-4.1 1.2l-1.7-1.6H9.7L8 17.1a2.5 2.5 0 0 1-4.1-1.2l-1.6-5.6a3 3 0 0 1 2.9-3.8Z"/>',
    overview:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    accounts:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    sessions:'<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    inventory:'<path d="m21 8-9 5-9-5 9-5 9 5Z"/><path d="m3 8 9 5 9-5v8l-9 5-9-5Z"/>',
    config:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"/><path d="M1 14h6M9 8h6M17 16h6"/>',
    templates:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
    joiner:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    exporter:'<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>',
    manager:'<rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01M7 17h.01"/>',
    notifications:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    items:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9v-.09A1.7 1.7 0 0 0 7.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 3.2 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H1.4V9h.09A1.7 1.7 0 0 0 3 7.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 7.4 3.2a1.7 1.7 0 0 0 1-.6A1.7 1.7 0 0 0 8.8 1.5V1.4h4.6v.09A1.7 1.7 0 0 0 14.8 3a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.8 7.4a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.1.4h.1v4.6h-.09A1.7 1.7 0 0 0 20 14.8a1.7 1.7 0 0 0-.6.2Z"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    refresh:'<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    filter:'<path d="M4 4h16l-6 7v6l-4 2v-8Z"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
    chevron:'<path d="m9 18 6-6-6-6"/>'
  };
  const svg=name=>`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name]||iconPaths.chevron}</svg>`;
  const labels={overview:'Overview',accounts:'Accounts',sessions:'Sessions',inventory:'Inventory',config:'Config',templates:'Templates',joiner:'Joiner',exporter:'Exporter',manager:'Account Manager',notifications:'Notifications',items:'Item Database',settings:'Settings'};

  const install=()=>{
    const page=document.querySelector('[data-sv-page="adoptme"]');
    if(!page||!page.querySelector('.am2-shell')||page.dataset.amFidelity)return false;
    page.dataset.amFidelity='1';
    page.querySelector('.am2-brand').insertAdjacentHTML('afterbegin',`<i class="amx-game">${svg('gamepad')}</i>`);
    page.querySelectorAll('[data-am2]').forEach(button=>{const id=button.dataset.am2;const old=button.querySelector('i');if(old)old.innerHTML=svg(id);button.title=labels[id];});
    page.querySelectorAll('.am2-page-tools button,.am2-tools button').forEach(button=>{const text=button.textContent.trim();const name=/refresh/i.test(text)?'refresh':/filter|group|range|account|rarit|type|age/i.test(text)?'filter':/create|new/i.test(text)?'plus':'chevron';button.insertAdjacentHTML('afterbegin',svg(name));});
    page.querySelectorAll('.am2-search').forEach(input=>{if(input.previousElementSibling?.classList.contains('amx-search-icon'))return;input.insertAdjacentHTML('beforebegin',`<span class="amx-search-icon">${svg('search')}</span>`);});
    const templateHeader=page.querySelector('[data-am2-panel="templates"] .am2-block>header');templateHeader?.querySelector(':scope>button')?.remove();
    const accountHeader=page.querySelector('[data-am2-panel="accounts"] .am2-block>header');[...(accountHeader?.children||[])].find(node=>node.tagName==='BUTTON')?.remove();
    page.querySelector('[data-am2-panel="config"] .am2-config main>.am2-cards')?.remove();
    const notificationHeader=page.querySelector('[data-am2-panel="notifications"] .am2-block>header');notificationHeader?.querySelector(':scope>button')?.remove();
    page.querySelectorAll('button[disabled]').forEach(button=>{button.disabled=false;if(!button.dataset.am2Action)button.dataset.am2Action=button.textContent.trim()||'Preview action';});
    const drawer=document.createElement('aside');drawer.className='amx-drawer';drawer.hidden=true;drawer.innerHTML=`<header>${svg('notifications')}<div><b>Notifications</b><small>4 unread sample events</small></div><button type="button" data-amx-close>${svg('close')}</button></header><nav><button class="on">All</button><button>System</button><button>Connection</button><button>Config</button></nav><main>${[['Inventory loaded','18.6K sample items indexed','system'],['Accounts connected','842 sample routes online','connection'],['Template applied','Main assigned to Farm','config'],['Route needs review','Reserve 005 is idle','accounts']].map(([a,b,c])=>`<article><i></i><div><b>${a}</b><p>${b}</p><small>${c} · just now</small></div></article>`).join('')}</main><footer><button type="button" data-amx-read>Mark all read</button><button type="button" data-amx-clear>Clear all</button></footer>`;document.body.append(drawer);
    const action=document.createElement('section');action.className='amx-action';action.hidden=true;action.innerHTML='<div><header><div><small>ADOPT ME PREVIEW</small><h2></h2></div><button type="button" data-amx-close>'+svg('close')+'</button></header><p data-amx-copy></p><div data-amx-content></div><footer><button type="button" data-amx-cancel>cancel</button><button type="button" data-amx-apply>apply sample</button></footer></div>';document.body.append(action);
    const closeAll=()=>{drawer.hidden=true;action.hidden=true;document.body.classList.remove('amx-overlay-open');};drawer.querySelector('[data-amx-close]').onclick=closeAll;action.querySelectorAll('[data-amx-close],[data-amx-cancel]').forEach(button=>button.onclick=closeAll);
    const openAction=label=>{const title=action.querySelector('h2'),copy=action.querySelector('[data-amx-copy]'),content=action.querySelector('[data-amx-content]');title.textContent=label;copy.textContent='Interactive dummy control. It does not contact ZekeHub, change accounts, or write to The Fool vault.';const isTemplate=/template|import/i.test(label),isExport=/export|csv|json/i.test(label),isConnection=/connection/i.test(label);content.innerHTML=isTemplate?'<label>Template name<input value="New farm template"></label><label>Apply to<select><option>No groups</option><option>Farm</option><option>Trade queue</option></select></label>':isExport?'<label>Format<select><option>CSV</option><option>JSON</option><option>TXT</option></select></label><label>Rows<input value="All filtered rows"></label>':isConnection?'<section class="amx-provider"><button>FarmSync<small>not connected</small></button><button>AccountOps<small>not connected</small></button></section>':'<label>Sample selection<select><option>All</option><option>Farm</option><option>Trade queue</option></select></label><label>Preview value<input value="No live change"></label>';action.hidden=false;document.body.classList.add('amx-overlay-open');};
    action.querySelector('[data-amx-apply]').onclick=()=>{closeAll();toast?.('Preview updated locally','ok');};drawer.querySelector('[data-amx-read]').onclick=()=>toast?.('Sample notifications marked read','ok');drawer.querySelector('[data-amx-clear]').onclick=()=>toast?.('Sample notifications cleared','ok');
    page.addEventListener('click',event=>{const button=event.target.closest('[data-am2-action]');if(!button)return;event.preventDefault();event.stopImmediatePropagation();openAction(button.dataset.am2Action||button.textContent.trim());},true);
    const notifications=page.querySelector('[data-am2="notifications"]');if(notifications)notifications.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();drawer.hidden=false;document.body.classList.add('amx-overlay-open');},true);
    const settings=page.querySelector('[data-am2="settings"]');if(settings)settings.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();page.querySelector('[data-am2-settings]')?.click();},true);
    page.querySelectorAll('.am2-modal label span button').forEach(button=>button.onclick=()=>{button.parentElement.querySelectorAll('button').forEach(item=>item.classList.toggle('on',item===button));});
    return true;
  };
  if(!install())new MutationObserver((_,observer)=>{if(install())observer.disconnect();}).observe(document.documentElement,{childList:true,subtree:true});
})();
