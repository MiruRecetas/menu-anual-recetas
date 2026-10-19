// Real Chromium service worker; all mutations are isolated HTTP fixtures, never repository data.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'), http=require('node:http'), fs=require('node:fs'), path=require('node:path');
const root=path.resolve(__dirname,'..'), base='/menu-anual-recetas/';
const changes=new Map();let origin, unavailable=false;
const server=http.createServer((req,res)=>{
  if(unavailable){req.socket.destroy();return;}
  const url=new URL(req.url,'http://localhost');
  if(!url.pathname.startsWith(base)){res.writeHead(404);return res.end();}
  let relative=decodeURIComponent(url.pathname.slice(base.length));if(!relative||relative.endsWith('/'))relative+='index.html';
  const file=path.resolve(root,relative);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  const changed=changes.get(relative);
  if(changed?.status){res.writeHead(changed.status);return res.end('failure');}
  try{
    let body=changed?.body??fs.readFileSync(file);
    if(relative.endsWith('.html'))body=body.toString().replaceAll('https://mirurecetas.github.io/menu-anual-recetas',origin+base.slice(0,-1));
    const ext=path.extname(relative),type={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.webp':'image/webp'}[ext]||'application/octet-stream';
    res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(body);
  }catch{res.writeHead(404);res.end('Not found');}
});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true});
  try{
    const context=await browser.newContext();
    await context.route(/https:\/\/(fonts.googleapis.com|fonts.gstatic.com)\//,r=>r.abort());
    const page=await context.newPage();
    await page.goto(origin+base);
    await page.evaluate(()=>navigator.serviceWorker.ready);
    await page.reload();
    await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
    // The same weekly disclosure works under the real worker, online and offline.
    const nutrition=page.locator('#toggle-weekly-nutrition');
    assert.equal(await page.locator('#weekly-charts').isVisible(),false);
    await nutrition.click();assert.equal(await page.locator('#weekly-charts').isVisible(),true);
    await nutrition.click();assert.equal(await nutrition.getAttribute('aria-expanded'),'false');
    unavailable=true;await context.setOffline(true);await page.reload();
    await page.locator('[data-miru-offline]').waitFor();
    assert.equal(await page.locator('header .logo-isotipo').isVisible(),true,'Isotipo de cabecera disponible sin conexión');
    await nutrition.click();assert.equal(await page.locator('#weekly-charts').isVisible(),true);
    await nutrition.click();assert.equal(await page.locator('#weekly-charts').isVisible(),false);
    unavailable=false;await context.setOffline(false);
    const url=origin+base+'recetas/tortilla-de-patata-tradicional-con-cebolla/';
    await page.goto(url);await page.locator('#portion-plus').click();
    const before=await page.locator('#portion-value').innerText();
    const manifest=await page.evaluate(async()=>await(await fetch(document.querySelector('[rel=manifest]').href)).json());
    assert.equal(manifest.scope,base);assert.equal(manifest.display,'standalone');
    const cdp=await context.newCDPSession(page);
    const result=await cdp.send('Page.getAppManifest');assert.equal(result.errors.length,0);
    const installability=await cdp.send('Page.getInstallabilityErrors');assert.deepEqual(installability.installabilityErrors,[]);
    for(const icon of manifest.icons){const r=await context.request.get(origin+base+icon.src);assert.equal(r.status(),200);}
    unavailable=true;await context.setOffline(true);await page.reload();
    await page.locator('[data-miru-offline]').waitFor();
    await page.locator('#portion-plus').click();assert.equal(await page.locator('#portion-value').innerText(),before);
    await page.locator('#flip-button').click();await page.locator('.steps input').first().check();
    await page.locator('#timer-start').click();assert.match(await page.locator('#timer-status').innerText(),/marcha/);
    // The new editable dial works under the real worker while offline.
    await page.locator('#timer-start').click();
    await page.locator('#timer-hours').fill('1');
    await page.locator('#timer-minutes').fill('25');
    await page.locator('#timer-seconds').fill('12');
    await page.locator('#timer-seconds').press('Tab');
    assert.equal(await page.locator('#timer-dial').getAttribute('aria-valuenow'),'5112');
    assert.equal(await page.locator('#timer-dial').getAttribute('data-layer'),'1');
    await page.locator('#timer-reset').click();
    assert.equal(await page.locator('#timer-minutes').inputValue(),'00');
    await page.locator('[data-minutes="10"]').click();
    await page.locator('#timer-start').click();

    await page.goto(origin+base+'recetas/bacalao-a-la-vizcaina/');
    assert.match(await page.locator('h2').innerText(),/no está guardada/);
    unavailable=false;await context.setOffline(false);await page.goto(url);
    assert.equal(await page.locator('[data-miru-offline]').count(),0);
    // Error responses must not replace previously validated HTML.
    changes.set('recetas/tortilla-de-patata-tradicional-con-cebolla/index.html',{status:500});
    await page.reload();await page.locator('[data-miru-offline]').waitFor();changes.clear();
    // Normal publication is visible with the same installed worker, no reinstall.
    for(const [route,needle,replacement] of [
      ['recetario/index.html','El recetario','Catálogo publicado de prueba'],
      ['menus/10-1/lunes/index.html','Lunes','Lunes actualizado de prueba']
    ]){
      await page.goto(origin+base+route);
      changes.set(route,{body:fs.readFileSync(path.join(root,route),'utf8').replaceAll(needle,replacement)});
      await page.reload();assert.ok((await page.content()).includes(replacement));changes.clear();
    }
    // A newly published recipe appears in the embedded catalog and opens immediately.
    const catalogFile='recetario/index.html';
    let catalog=fs.readFileSync(path.join(root,catalogFile),'utf8');
    catalog=catalog.replace(/(<script[^>]+id="recipes-data"[^>]*>)([\s\S]*?)(<\/script>)/,(all,a,json,b)=>{const rows=JSON.parse(json);rows.unshift({...rows[0],slug:'pwa-nueva-receta',nombre:'Receta nueva PWA',imagen:null});return a+JSON.stringify(rows)+b;});
    changes.set(catalogFile,{body:catalog});
    changes.set('recetas/pwa-nueva-receta/index.html',{body:fs.readFileSync(path.join(root,'recetas/tortilla-de-patata-tradicional-con-cebolla/index.html'),'utf8').replaceAll('Tortilla de patata y cebolla','Receta nueva PWA')});
    await page.goto(origin+base+'recetario/');
    assert.ok((await page.content()).includes('Receta nueva PWA'));
    await page.goto(origin+base+'recetas/pwa-nueva-receta/');assert.equal(await page.locator('h1').first().innerText(),'Receta nueva PWA');changes.clear();
    // Valid JSON survives an invalid replacement, preserving official cached bytes.
    await page.goto(origin+base);
    const indexURL=origin+base+'indice-recetas.json';
    const original=await page.evaluate(async u=>await(await fetch(u)).text(),indexURL);
    changes.set('indice-recetas.json',{body:'{invalid'});
    assert.equal(await page.evaluate(async u=>await(await fetch(u)).text(),indexURL),original);changes.clear();
    // Same image URL must reach new bytes; old cached photos aren't served indefinitely.
    const image=fs.readdirSync(path.join(root,'imagenes')).find(x=>x.endsWith('.webp'));
    const imageURL=origin+base+'imagenes/'+image;
    const first=await page.evaluate(async u=>Array.from(new Uint8Array(await(await fetch(u)).arrayBuffer())),imageURL);
    const second=fs.readFileSync(path.join(root,'imagenes',fs.readdirSync(path.join(root,'imagenes')).find(x=>x.endsWith('.webp')&&x!==image)));
    changes.set('imagenes/'+image,{body:second});
    const updated=await page.evaluate(async u=>Array.from(new Uint8Array(await(await fetch(u)).arrayBuffer())),imageURL);
    assert.notDeepEqual(first,updated);changes.clear();
    // Immutable CSS revisions coexist; invalid bytes at an old URL cannot poison it.
    await page.goto(url);
    const cssURL=await page.locator('link[href*="pwa.css"]').getAttribute('href');
    const cssPath=new URL(cssURL).pathname.slice(base.length);
    const cssOriginal=await page.evaluate(async u=>await(await fetch(u)).text(),cssURL);
    changes.set(cssPath,{body:'body{color:red}'});
    assert.equal(await page.evaluate(async u=>await(await fetch(u)).text(),cssURL),cssOriginal);changes.clear();
    const newCSS=cssOriginal+'\nbody{--pwa-test:verified}';
    const hash=require('node:crypto').createHash('sha256').update(newCSS).digest('hex');
    const newCSSPath='assets/revisions/'+hash+'/pwa.css';
    changes.set(newCSSPath,{body:newCSS});
    const newCSSURL=origin+base+newCSSPath+'?v='+hash;
    const recipePath='recetas/tortilla-de-patata-tradicional-con-cebolla/index.html';
    const originalHTML=fs.readFileSync(path.join(root,recipePath),'utf8');
    changes.set(recipePath,{body:originalHTML.replace(/https:\/\/mirurecetas.github.io\/menu-anual-recetas\/assets\/revisions\/[a-f0-9]{64}\/pwa.css\?v=[a-f0-9]{64}/,newCSSURL)});
    await page.reload();assert.equal(await page.evaluate(()=>getComputedStyle(document.body).getPropertyValue('--pwa-test')),'verified');changes.clear();
    // Waiting worker leaves live cooking state untouched, including another tab.
    await page.goto(url);await page.locator('#portion-plus').click();await page.locator('#flip-button').click();await page.locator('.steps input').first().check();await page.locator('#timer-start').click();
    const portions=await page.locator('#portion-value').innerText();
    const other=await context.newPage();await other.goto(url);await other.locator('#portion-plus').click();const otherPortions=await other.locator('#portion-value').innerText();
    changes.set('sw.js',{body:fs.readFileSync(path.join(root,'sw.js'),'utf8')+'\n// QA update\n'});
    await page.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();await reg.update();});
    await page.locator('.pwa-tools button').filter({hasText:'nueva versión'}).waitFor({state:'visible'});
    assert.equal(await page.locator('#portion-value').innerText(),portions);assert.equal(await page.locator('.steps input').first().isChecked(),true);assert.match(await page.locator('#timer-status').innerText(),/marcha/);
    page.once('dialog',d=>d.dismiss());await page.getByRole('button',{name:/nueva versión/}).click();assert.equal(await page.locator('#portion-value').innerText(),portions);
    page.once('dialog',d=>d.accept());await Promise.all([page.waitForEvent('framenavigated'),page.getByRole('button',{name:/nueva versión/}).click()]);
    await page.waitForLoadState();assert.equal(await page.locator('.steps input').first().isChecked(),false);
    assert.equal(await other.locator('#portion-value').innerText(),otherPortions);
    // Cleanup scope, expiry and bounds; other applications' storage survives.
    await page.evaluate(async()=>{await(await caches.open('unrelated-app')).put('/other',new Response('keep'));const c=await caches.open('mirurecetas-pwa-public-v1');await c.put('/expired',new Response('old',{headers:{'X-Miru-Kind':'page','X-Miru-Saved':'1'}}));});
    for(let i=0;i<45;i++){
      const route='recetas/cache-test-'+i+'/index.html';changes.set(route,{body:fs.readFileSync(path.join(root,'recetas/tortilla-de-patata-tradicional-con-cebolla/index.html'))});
      await page.goto(origin+base+route,{waitUntil:'domcontentloaded'});
    }
    const count=await page.evaluate(async()=>{const c=await caches.open('mirurecetas-pwa-public-v1');let n=0;for(const k of await c.keys())if((await c.match(k)).headers.get('X-Miru-Kind')==='page')n++;return n;});
    assert.equal(count,40);changes.clear();
    assert.equal(await page.evaluate(async()=>Boolean(await(await caches.open('mirurecetas-pwa-public-v1')).match('/expired'))),false);
    assert.ok(await page.evaluate(async()=>Boolean(await(await caches.open('unrelated-app')).match('/other'))));
    await other.close();await page.waitForLoadState('networkidle');
    // Permanent purchase runs inside the existing worker scope without a second app.
    const purchase=await context.newPage();
    await purchase.goto(origin+base+'menus/10-1/compra/');
    assert.ok(await purchase.evaluate(()=>Boolean(navigator.serviceWorker.controller)));
    await purchase.waitForFunction(()=>document.querySelector('#exportar').getAttribute('aria-disabled')==='false');
    await purchase.locator('#porciones').fill('3');
    await purchase.waitForFunction(()=>document.querySelector('#exportar').getAttribute('aria-disabled')==='false'&&document.querySelector('#exportar').textContent.includes(' 3 '));
    assert.equal(await purchase.evaluate(async()=> (await navigator.serviceWorker.getRegistrations()).length),1);
    const purchaseLink=new URL(await purchase.locator('#exportar').getAttribute('href'));
    assert.equal(purchaseLink.searchParams.get('baseQuantity'),'3');
    await context.setOffline(true);
    await purchase.waitForFunction(()=>document.querySelector('#exportar').getAttribute('aria-disabled')==='true');
    assert.equal(await purchase.locator('#lista tr').count(),54);
    await context.setOffline(false);
    await purchase.waitForFunction(()=>document.querySelector('#exportar').getAttribute('aria-disabled')==='false');
    await purchase.close();
    // Real rollback fixture at the original registration URL.
    changes.set('sw.js',{body:fs.readFileSync(path.join(root,'scripts/pwa-rollback.js'),'utf8')});
    await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update();});
    await page.waitForFunction(async()=>!(await navigator.serviceWorker.getRegistration()));
    assert.ok(await page.evaluate(async()=>Boolean(await(await caches.open('unrelated-app')).match('/other'))));
    await page.waitForFunction(async()=>!(await caches.keys()).some(k=>k.startsWith('mirurecetas-pwa-')));
    await page.goto(url); // clears detached controller; web still works
    await page.locator('#portion-plus').click();
    await context.close();
    console.log('PASS PWA: actual Chromium SW, manifest, offline visited/unvisited, cooking, 500 fallback, fresh content/photo, waiting/consented update, multiple tabs, expiry, scoped cleanup, rollback. Physical installation NOT tested.');
  }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exit(1);});
