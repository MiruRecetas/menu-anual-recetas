// Browser checks use the public projection only; no canonical IDs or ingredient prices.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=(process.env.MIRU_PUBLIC_BASE||'http://127.0.0.1:8765').replace(/\/$/,'');
const real=Boolean(process.env.MIRU_PUBLIC_BASE);
const data=JSON.parse(fs.readFileSync('presentacion/costes-recetas.json','utf8')).recipes;
function label(c){const n=BigInt(c),whole=(n/100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.');return '≈ '+whole+','+(n%100n).toString().padStart(2,'0')+' €/ración';}
async function main(){
 const browser=await chromium.launch({headless:true}),errors=[],result={recipes:0,responsive:[],public_origin:real,physical_device_tested:false};
 try{
  const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();
  await context.route(/https:\/\/(fonts.googleapis.com|fonts.gstatic.com)\//,r=>r.abort());
  page.on('pageerror',e=>errors.push(e.message));
  for(const [slug,row] of Object.entries(data)){
   const response=await page.goto(base+'/recetas/'+slug+'/',{waitUntil:'networkidle'});
   assert.equal(response.status(),200);
   assert.equal(await page.locator('h1[itemprop="name"]').innerText(),row.web_name);
   assert.equal(await page.locator('.recipe-cost').innerText(),label(row.cents));
   assert.equal(await page.locator('.recipe-cost svg').count(),1);
   assert.equal(await page.locator('.footer a').nth(0).getAttribute('href'),'https://github.com/ruvelro/opencesta');
   assert.equal(await page.locator('.footer a').nth(1).getAttribute('href'),'https://opendatacommons.org/licenses/odbl/1-0/');
   result.recipes++;
  }
  for(const slug of ['tortilla-de-patata-tradicional-con-cebolla','salteado-de-pollo-y-verduras','wok-de-gambones-y-pisto']){
   for(const [width,height] of [[320,700],[390,844],[844,390],[820,1100],[1100,820],[1440,900]]){
    await page.setViewportSize({width,height});
    await page.goto(base+'/recetas/'+slug+'/',{waitUntil:'networkidle'});
    const price=await page.locator('.recipe-cost').innerText();
    const schema=await page.locator('script[type="application/ld+json"]').textContent();
    const qty=await page.locator('.qty[data-qty]').first().innerText();
    await page.locator('#portion-plus').click();
    assert.notEqual(await page.locator('.qty[data-qty]').first().innerText(),qty);
    assert.equal(await page.locator('.recipe-cost').innerText(),price);
    assert.equal(await page.locator('script[type="application/ld+json"]').textContent(),schema);
    const rect=await page.locator('.recipe-cost').evaluate(e=>{const r=e.getBoundingClientRect(),p=e.closest('.photo-panel').getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,pl:p.left,pr:p.right,pt:p.top,pb:p.bottom};});
    assert.ok(rect.left>=rect.pl&&rect.right<=rect.pr+1&&rect.top>=rect.pt&&rect.bottom<=rect.pb+1);
    result.responsive.push({slug,width,height});
   }
  }
  assert.deepEqual(errors,[]);
  await context.close();
  if(real){
   const ctx=await browser.newContext(),app=await ctx.newPage(),slug='wok-de-gambones-y-pisto';
   await app.goto(base+'/recetas/'+slug+'/',{waitUntil:'networkidle'});
   await app.evaluate(()=>navigator.serviceWorker.ready);
   await app.reload();
   await app.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
   await app.waitForLoadState('networkidle');
   const cdp=await ctx.newCDPSession(app),install=await cdp.send('Page.getInstallabilityErrors');
   assert.deepEqual(install.installabilityErrors,[]);
   const price=await app.locator('.recipe-cost').innerText();
   await ctx.setOffline(true);await app.reload();
   assert.equal(await app.locator('.recipe-cost').innerText(),price);
   assert.ok((await app.locator('.footer').innerText()).includes('Estimaciones de MiruRecetas elaboradas con datos de OpenCesta'));
   await app.locator('#portion-plus').click();
   assert.equal(await app.locator('.recipe-cost').innerText(),price);
   await app.setViewportSize({width:844,height:390});
   assert.equal(await app.locator('.recipe-cost').innerText(),price);
   await ctx.setOffline(false);await app.reload();
   assert.equal(await app.locator('.recipe-cost').innerText(),price);
   result.real_service_worker=true;result.offline_price_attribution_selector=true;result.installability=install;
   await ctx.close();
  }
  console.log(JSON.stringify(result));
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exit(1)});
