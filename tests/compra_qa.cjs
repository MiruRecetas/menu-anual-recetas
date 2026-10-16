const {chromium}=require('playwright');
const assert=require('node:assert/strict'), fs=require('node:fs');
async function checkCoverLayout(page){
 const layout=await page.locator('.purchase-intro').evaluate(intro=>{
  const figure=intro.querySelector('figure').getBoundingClientRect();
  const box=intro.getBoundingClientRect();
  const text=intro.querySelector(':scope > div').getBoundingClientRect();
  return {portrait:matchMedia('(max-width:540px) and (orientation:portrait)').matches,
   columns:innerWidth>540,centerDifference:Math.abs(figure.x+figure.width/2-box.x-box.width/2),
   figureLeft:figure.left,textRight:text.right};
 });
 if(layout.portrait) assert.ok(layout.centerDifference<=1,'Portada centrada en móvil vertical');
 else if(layout.columns) assert.ok(layout.figureLeft>=layout.textRight,'Portada a la derecha en horizontal y escritorio');
}

(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  fs.mkdirSync('qa-screenshots',{recursive:true});
  for(const {width,height} of [{width:320,height:900},{width:390,height:1100},{width:540,height:960},{width:820,height:390},{width:1440,height:1100}]){
   const context=await browser.newContext({serviceWorkers:'block',viewport:{width,height}});
   await context.route(/https:\/\/(fonts.googleapis.com|fonts.gstatic.com)\//,r=>r.abort());
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto('http://127.0.0.1:8765/?mes=10&menu=1');
   await page.locator('#menu-shopping').waitFor({state:'visible'});
   await page.locator('#menu-shopping').click();
   const link=page.locator('#exportar'),input=page.locator('#porciones');
   await page.waitForFunction(()=>document.querySelector('#exportar').getAttribute('aria-disabled')==='false');
   assert.ok(await page.locator('.purchase-intro img').evaluate(x=>x.complete&&x.naturalWidth===1254));
   await checkCoverLayout(page);
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
   await page.locator('#month').selectOption('11');assert.equal(await page.locator('#menu-shopping').isVisible(),false);
   assert.deepEqual(errors,[]);await context.close();
  }
  for(const menu of [4,3,1,2]) for(const {width,height} of [{width:390,height:1100},{width:820,height:390},{width:1440,height:1100}]){
   const context=await browser.newContext({serviceWorkers:'block',viewport:{width,height}});
   await context.route(/https:\/\/(fonts.googleapis.com|fonts.gstatic.com)\//,r=>r.abort());
   const page=await context.newPage();
   await page.goto(`http://127.0.0.1:8765/?mes=9&menu=${menu}`);
   await page.locator('#menu-shopping').waitFor({state:'visible'});
   await page.locator('#menu-shopping').click();
   await page.waitForFunction(()=>document.querySelector('#exportar')?.getAttribute('aria-disabled')==='false');
   assert.ok(await page.locator('.purchase-intro img').evaluate(x=>x.complete&&x.naturalWidth===1024));
   await checkCoverLayout(page);
   assert.equal(await page.locator('#lista tr').count(),({4:35,3:33,1:41,2:45})[menu]);
   await page.locator('#porciones').fill('3');
   await page.waitForFunction(()=>document.querySelector('#exportar').getAttribute('aria-disabled')==='false'&&document.querySelector('#exportar').textContent.includes(' 3 '));
   const link=new URL(await page.locator('#exportar').getAttribute('href'));
   assert.ok(link.searchParams.get('url').endsWith(`/menus/09-${menu}/compra/exports/3.json`));
   assert.ok((await page.locator('#lista').innerText()).includes(({4:'3 latas',3:'3 vasitos',1:'6 latas',2:'3 doradas'})[menu]));
   await page.screenshot({path:`qa-screenshots/compra-septiembre${menu}-${width}.png`,fullPage:true});
   await page.getByRole('link',{name:`← Volver a Septiembre · Menú ${menu}`}).click();
   await page.waitForFunction(n=>document.querySelector('#month').value==='9'&&document.querySelector('#menu-number').value===String(n),menu);
   await context.close();
  }
  console.log('Compra: móvil/tablet/escritorio, selector, errores, red, imagen y acceso contextual OK');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
