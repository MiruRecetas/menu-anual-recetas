// Browser interactions and actual Web Audio scheduling, not physical sound/vibration evidence.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),base='/menu-anual-recetas/';let origin;
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(!url.pathname.startsWith(base)){res.writeHead(404);return res.end();}
  let relative=decodeURIComponent(url.pathname.slice(base.length));if(!relative||relative.endsWith('/'))relative+='index.html';
  const file=path.resolve(root,relative);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  try{let body=fs.readFileSync(file);if(relative.endsWith('.html'))body=body.toString().replaceAll('https://mirurecetas.github.io/menu-anual-recetas',origin+base.slice(0,-1));
    res.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.webmanifest':'application/manifest+json'}[path.extname(file)]||'application/octet-stream'});res.end(body);
  }catch{res.writeHead(404);res.end();}
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true});
 try{
 const context=await browser.newContext({serviceWorkers:'block'});
 await context.route(/https:\/\/fonts\./,r=>r.abort());
 await context.addInitScript(()=>{
  window.timerEvidence={tones:0,vibrations:[]};
  Object.defineProperty(navigator,'vibrate',{value:p=>{window.timerEvidence.vibrations.push(p);return true;},configurable:true});
  const original=AudioContext.prototype.createOscillator;
  AudioContext.prototype.createOscillator=function(...args){window.timerEvidence.tones++;return original.apply(this,args);};
 });
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+base+'recetas/tortilla-de-patata-tradicional-con-cebolla/');
 await page.locator('#flip-button').click();
 const dial=page.locator('#timer-dial'),min=page.locator('#timer-minutes'),sec=page.locator('#timer-seconds'),hours=page.locator('#timer-hours'),start=page.locator('#timer-start');
 const remaining=async()=>Number(await dial.getAttribute('aria-valuenow'));
 async function edit(m,s,h=0){await hours.fill(String(h));await min.fill(String(m));await sec.fill(String(s));await sec.press('Tab');}
 await edit(25,12,2);assert.equal(await remaining(),8712);assert.equal(await dial.getAttribute('data-layer'),'2');
 assert.equal(await page.locator('#timer-base').evaluate(e=>e.style.fill),'rgb(197, 160, 82)');
 await hours.fill('1');await hours.press('Tab');assert.equal(await remaining(),5112);
 assert.equal(await page.locator('#timer-base').evaluate(e=>e.style.fill),'rgb(175, 114, 81)');
 await edit(0,0,1);assert.equal(await remaining(),3600);assert.equal(await dial.getAttribute('data-layer'),'0','Exact hour is a full terracotta disk');
 await edit(59,59,3);assert.equal(await remaining(),10800,'Three-hour maximum enforced');assert.equal(await min.inputValue(),'00');
 await page.locator('#timer-reset').click();assert.equal(await remaining(),0);assert.equal(await start.isDisabled(),true);
 await page.locator('[data-minutes="15"]').click();assert.equal(await remaining(),900);assert.match(await start.getAttribute('aria-label'),/Iniciar/);
 await dial.focus();await page.keyboard.press('ArrowRight');assert.equal(await remaining(),960);
 await page.keyboard.press('PageUp');assert.equal(await remaining(),4560);
 await page.keyboard.press('Home');assert.equal(await remaining(),0);
 // Real pointer gesture through the top boundary: one revolution plus fifteen minutes.
 const box=await dial.boundingBox();const cx=box.x+box.width/2,cy=box.y+box.height/2,rad=box.width*.42;
 await page.mouse.move(cx,cy-rad);await page.mouse.down();
 for(let angle=10;angle<=450;angle+=10)await page.mouse.move(cx+Math.sin(angle*Math.PI/180)*rad,cy-Math.cos(angle*Math.PI/180)*rad);
 await page.mouse.up();assert.equal(await remaining(),4500);assert.equal(await min.inputValue(),'15');assert.equal(await hours.inputValue(),'1');
 // Clicking a minute mark preserves the selected whole hours.
 await page.mouse.click(cx+rad,cy);assert.equal(await remaining(),4500);
 await page.clock.install();
 await start.click();assert.match(await start.getAttribute('aria-label'),/Pausar/);
 await page.clock.fastForward(2200);assert.equal(await remaining(),4498);
 await start.click();const paused=await remaining();await page.clock.fastForward(5000);assert.equal(await remaining(),paused);
 await start.click();await min.focus();assert.match(await start.getAttribute('aria-label'),/Iniciar/,'Editing pauses');
 await edit(0,2);await start.click();
 await page.waitForFunction(()=>window.timerEvidence.tones===0);
 await page.clock.fastForward(2200);assert.equal(await page.locator('#timer-stop').isVisible(),true);assert.equal(await page.locator('#timer-center').isVisible(),false);
 assert.ok(await page.evaluate(()=>window.timerEvidence.tones>=3),'Real oscillator creation requested');
 assert.ok(await page.evaluate(()=>window.timerEvidence.vibrations.some(Array.isArray)),'Vibration API requested');
 await page.locator('#timer-stop').click();assert.equal(await page.locator('#timer-center').isVisible(),true);assert.equal(await min.inputValue(),'00');assert.equal(await sec.inputValue(),'00');
 await page.locator('#timer-sound').click();assert.equal(await page.locator('#timer-sound').getAttribute('aria-pressed'),'false');
 const oldTones=await page.evaluate(()=>window.timerEvidence.tones);
 await edit(0,1);await start.click();await page.clock.fastForward(1200);assert.equal(await page.locator('#timer-stop').isVisible(),true);
 assert.equal(await page.evaluate(()=>window.timerEvidence.tones),oldTones,'Muted alarm creates no tones');
 await page.clock.fastForward(31000);assert.equal(await page.locator('#timer-stop').isVisible(),false,'Alarm stops within 30 seconds');
 await edit(0,1);await start.click();await page.clock.fastForward(1200);await page.locator('#timer-reset').click();assert.equal(await remaining(),0);assert.equal(await page.locator('#timer-stop').isVisible(),false);
 await edit(0,5);await start.click();await page.locator('[data-minutes="30"]').click();assert.equal(await remaining(),1800);assert.match(await start.getAttribute('aria-label'),/Iniciar/);
 assert.deepEqual(errors,[]);
 await context.close();
 // Layout and touch targets at agreed orientations. Capture actual rendered UI.
 fs.mkdirSync('qa-screenshots',{recursive:true});
 for(const [width,height] of [[1440,900],[1100,820],[820,1100],[844,390],[390,844],[320,700],[667,375]]){
  const c=await browser.newContext({serviceWorkers:'block',viewport:{width,height},hasTouch:true});
  await c.route(/https:\/\/fonts\./,r=>r.abort());
  const p=await c.newPage();await p.goto(origin+base+'recetas/tortilla-de-patata-tradicional-con-cebolla/');await p.locator('#flip-button').click();
  if(width>=390)assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`No overflow ${width}`);
  const fits=await p.locator('.timer').evaluate(el=>[...el.querySelectorAll('input,button,svg#timer-dial')].filter(e=>!e.hidden).every(e=>{const r=e.getBoundingClientRect(),b=el.getBoundingClientRect();return r.left>=b.left-1&&r.right<=b.right+1;}));assert.ok(fits,`Controls fit ${width}`);
  for(const e of await p.locator('.timer-actions button').all()){const r=await e.boundingBox();assert.ok(r.width>=44&&r.height>=44);}
  await p.locator('.timer').screenshot({path:`qa-screenshots/timer-${width}x${height}.png`});
  // Touch tap on the 15-minute mark (single primary pointer).
  const b=await p.locator('#timer-dial').boundingBox();await p.touchscreen.tap(b.x+b.width*.92,b.y+b.height/2);
  assert.equal(await p.locator('#timer-dial').getAttribute('aria-valuenow'),'900');
  await p.locator('#timer-start').click();
  assert.match(await p.locator('#timer-start').getAttribute('aria-label'),/Pausar/);
  await p.locator('#timer-reset').click();assert.equal(await p.locator('#timer-dial').getAttribute('aria-valuenow'),'0');
  await p.locator('#timer-sound').click();assert.equal(await p.locator('#timer-sound').getAttribute('aria-pressed'),'false');
  await p.locator('.timer-actions').screenshot({path:`qa-screenshots/timer-controls-${width}x${height}.png`});
  await c.close();
 }
 console.log('PASS timer: bidirectional edit, hour layers/boundaries, pointer turns, touch, keyboard, deadline, pause/reset, tone scheduling, mute/vibration requests, central stop, 30s cutoff, responsive. Physical sound/vibration NOT tested.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
