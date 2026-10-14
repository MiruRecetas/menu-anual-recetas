const {chromium}=require('playwright');
const assert=require('node:assert/strict'), fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  fs.mkdirSync('qa-screenshots',{recursive:true});
  for(const width of [320,390,820,1440]){
   const context=await browser.newContext({serviceWorkers:'block',viewport:{width,height:1100}});
   await context.route(/https:\/\/(fonts.googleapis.com|fonts.gstatic.com)\//,r=>r.abort());
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto('http://127.0.0.1:8765/?mes=10&menu=1');
   await page.locator('#menu-shopping').waitFor({state:'visible'});
   await page.locator('#menu-shopping').click();
   const link=page.locator('#exportar'),input=page.locator('#porciones');
   await page.waitForFunction(()=>document.querySelector('#exportar').getAttribute('aria-disabled')==='false');
   assert.ok(await page.locator('.purchase-intro img').evaluate(x=>x.complete&&x.naturalWidth===1254));
   assert.equal(await page.locator('#lista tr').count(),54);
   for(const n of [3,20,1]){
    await input.fill(String(n));
    await page.waitForFunction(n=>document.querySelector('#exportar').getAttribute('aria-disabled')==='false'&&document.querySelector('#exportar').textContent.includes(` ${n} `),n);
    const url=new URL(await link.getAttribute('href'));
    assert.equal(url.searchParams.get('baseQuantity'),String(n));assert.equal(url.searchParams.get('requestedQuantity'),String(n));assert.ok(url.searchParams.get('url').endsWith(`/exports/${n}.json`));
    assert.ok(page.url().endsWith(`porciones=${n}`));
   }
   assert.ok(await page.locator('#menos').isDisabled());
   await input.fill('0');assert.equal(await link.getAttribute('aria-disabled'),'true');assert.equal(await link.getAttribute('href'),null);
   await input.fill('1.5');assert.equal(await link.getAttribute('href'),null);
   await input.fill('3');await page.waitForFunction(()=>document.querySelector('#exportar').getAttribute('aria-disabled')==='false');
   await page.route('**/exports/4.json',r=>r.fulfill({status:500,body:'error'}));
   await input.fill('4');await page.locator('#reintentar').waitFor({state:'visible'});assert.equal(await link.getAttribute('href'),null);
   await page.unroute('**/exports/4.json');await page.locator('#reintentar').click();await page.waitForFunction(()=>document.querySelector('#exportar').getAttribute('aria-disabled')==='false');
   await context.setOffline(true);await page.waitForFunction(()=>document.querySelector('#exportar').getAttribute('aria-disabled')==='true');assert.equal(await page.locator('#lista tr').count(),54);
   await context.setOffline(false);await page.waitForFunction(()=>document.querySelector('#exportar').getAttribute('aria-disabled')==='false');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Sin desbordamiento de página');
   await page.screenshot({path:`qa-screenshots/compra-${width}.png`,fullPage:true});
   await page.getByRole('link',{name:'← Volver a Octubre · Menú 1'}).click();
   await page.waitForFunction(()=>document.querySelector('#month').value==='10'&&document.querySelector('#menu-number').value==='1');
   assert.equal(await page.locator('#month').inputValue(),'10');assert.equal(await page.locator('#menu-number').inputValue(),'1');
   await page.locator('#month').selectOption('9');assert.equal(await page.locator('#menu-shopping').isVisible(),false);
   assert.deepEqual(errors,[]);await context.close();
  }
  for(const width of [390,820,1440]){
   const context=await browser.newContext({serviceWorkers:'block',viewport:{width,height:1100}});
   await context.route(/https:\/\/(fonts.googleapis.com|fonts.gstatic.com)\//,r=>r.abort());
   const page=await context.newPage();
   await page.goto('http://127.0.0.1:8765/?mes=9&menu=4');
   await page.locator('#menu-shopping').waitFor({state:'visible'});
   await page.locator('#menu-shopping').click();
   await page.waitForFunction(()=>document.querySelector('#exportar')?.getAttribute('aria-disabled')==='false');
   assert.ok(await page.locator('.purchase-intro img').evaluate(x=>x.complete&&x.naturalWidth===1024));
   assert.equal(await page.locator('#lista tr').count(),35);
   await page.locator('#porciones').fill('3');
   await page.waitForFunction(()=>document.querySelector('#exportar').getAttribute('aria-disabled')==='false'&&document.querySelector('#exportar').textContent.includes(' 3 '));
   const link=new URL(await page.locator('#exportar').getAttribute('href'));
   assert.ok(link.searchParams.get('url').endsWith('/menus/09-4/compra/exports/3.json'));
   assert.ok((await page.locator('#lista').innerText()).includes('3 latas'));
   await page.screenshot({path:`qa-screenshots/compra-septiembre4-${width}.png`,fullPage:true});
   await page.getByRole('link',{name:'← Volver a Septiembre · Menú 4'}).click();
   await page.waitForFunction(()=>document.querySelector('#month').value==='9'&&document.querySelector('#menu-number').value==='4');
   await context.close();
  }
  console.log('Compra: móvil/tablet/escritorio, selector, errores, red, imagen y acceso contextual OK');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
