import {chromium} from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const published=process.env.UI_PUBLISHED==='1';
const out=`artifacts/anti-slop/${published?'published':'implemented'}`;fs.mkdirSync(out,{recursive:true});
const routes=[['login','/',false],['shared','/?shared-preview=1',false],['dashboard','/dashboard',true],['inbox','/inbox',true],['vault','/vault',true],['accounts','/account-tools',true],['comparator','/account-tools/comparator',true],['splitter','/account-tools/splitter',true],['usernames','/account-tools/username-extractor',true],['ps-links','/account-tools/ps-links',true],['validator','/account-tools/validator',true],['cookies','/cookie-tools',true],['extractor','/cookie-tools/extractor',true],['bulk','/cookie-tools/bulk-lookup',true],['data','/data-center',true],['scripts','/scripts',true],['adoptme','/adopt-me/?demo=1',false],['redfinger','/redfinger.html?demo=1',false]];
const browser=await chromium.launch();const rows=[];
async function contextFor(viewport,fixture=true){
 const context=await browser.newContext({viewport,ignoreHTTPSErrors:true,serviceWorkers:'block',permissions:['clipboard-read','clipboard-write']});
 await context.route('https://preview.saturnity.site/**',async r=>{
  const u=new URL(r.request().url()),p=u.pathname;
  if(p.startsWith('/api/')){
   const data=p==='/api/me'&&fixture?{username:'synthetic-ui-test'}:p==='/api/health'?{ok:true,needsSetup:false}:p==='/api/vault'&&fixture?{revision:0,vault:[]}:null;
   return r.fulfill({status:data?200:503,contentType:'application/json',body:JSON.stringify(data||{error:'Synthetic unavailable state; private API blocked'})});
  }
  if(published)return r.continue();
  const file=p.startsWith('/assets/')?p.slice(1):p==='/favicon.ico'?'favicon.ico':p.startsWith('/adopt-me')?'adopt-me.html':p.startsWith('/redfinger')?'redfinger.html':'index.html';
  assert(!file.includes('..'));const mime={'.html':'text/html','.css':'text/css','.js':'application/javascript','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'}[path.extname(file)]||'application/octet-stream';
  return r.fulfill({status:200,contentType:mime,body:fs.readFileSync(file)});
 });
 return context;
}
for(const [vp,width,height] of [['desktop',1440,900],['tablet',820,1180],['mobile',390,844]])for(const [name,route,fixture] of routes.filter(r=>!process.env.UI_ROUTE||r[0]===process.env.UI_ROUTE)){
 const context=await contextFor({width,height},fixture),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.stack));
 let error;try{await page.goto('https://preview.saturnity.site'+route,{waitUntil:'domcontentloaded'});await page.waitForTimeout(600);await page.screenshot({path:`${out}/${name}-${vp}.png`,fullPage:true});}catch(e){error=e.message;}
 const info=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,headings:[...document.querySelectorAll('h1,h2,h3')].filter(e=>e.getBoundingClientRect().height).map(e=>({text:e.textContent,size:getComputedStyle(e).fontSize})),mainWidth:document.querySelector('.zr-main')?.getBoundingClientRect().width,cardWidth:document.querySelector('.rf-card')?.getBoundingClientRect().width,text:document.body.innerText.slice(0,12000)}));
 rows.push({name,vp,fixture,error,errors,info,screenshot:`${out}/${name}-${vp}.png`});fs.writeFileSync(`${out}/summary.json`,JSON.stringify(rows,null,2));await context.close();
}
const summary={captured:rows.length,errors:rows.filter(r=>r.error||r.errors.length).map(r=>({name:r.name,vp:r.vp,error:r.error,errors:r.errors})),overflow:rows.filter(r=>r.info.scroll>r.info.width).map(r=>r.name+'-'+r.vp)};console.log(JSON.stringify(summary));
await browser.close();assert.equal(rows.length,process.env.UI_ROUTE?3:54);assert.deepEqual(summary.errors,[]);assert.deepEqual(summary.overflow,[]);
