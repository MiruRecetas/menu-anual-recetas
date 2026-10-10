const { chromium } = require('playwright');
const fs = require('fs');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({headless:true});
  const issues=[];
  const out='qa-screenshots';fs.mkdirSync(out,{recursive:true});
  for(const test of [{name:'desktop',width:1440,height:900},{name:'tablet',width:820,height:1100},{name:'mobile',width:390,height:844},{name:'tablet-horizontal',width:1100,height:820},{name:'mobile-horizontal',width:844,height:390}]){
    const page=await browser.newPage({viewport:{width:test.width,height:test.height},deviceScaleFactor:1});
    page.on('pageerror',e=>issues.push(test.name+': error JS: '+e.message));
    await page.goto('http://127.0.0.1:8765/',{waitUntil:'load'});
    await page.locator('#week .day-button').first().waitFor();
    assert.equal(await page.locator('#week .day-button').count(),5,test.name+': días');
    assert.equal(await page.locator('#week .week-kcal-ring').count(),5,'Cinco anillos');
    assert.equal(await page.locator('#week .week-meal-row').count(),17,'Ingestas existentes');
    const monday=page.locator('#week .day-button').first();
    assert.match(await monday.innerText(),/Café con leche/);
    const textMonday=await monday.innerText();assert.ok(textMonday.indexOf('Carpaccio')<textMonday.indexOf('Puerros con mayonesa')&&textMonday.indexOf('Puerros con mayonesa')<textMonday.indexOf('Bowl de yogur'),'Orden de cena');
    assert.match(await monday.innerText(),/Ciruelas/);
    assert.ok(!(await monday.innerText()).includes('Incapto'),'Nombre de café simplificado');
    assert.ok(!(await monday.innerText()).includes('Cena lunes'),'Cena sin prefijo técnico');
    assert.equal(await monday.locator('.week-kcal-ring strong').innerText(),'1488');
    assert.equal(await monday.locator('.week-kcal-ring').getAttribute('aria-label'),'1488 kcal registradas de 1600 kcal objetivo');
    assert.equal(await monday.locator('.week-meal-label').count(),4,'iconos de cuatro ingestas');
    assert.equal(await monday.locator('.week-meal-main').count(),2,'comida y cena con jerarquía igual');
    assert.equal(await monday.locator('.week-meal-secondary').count(),2,'desayuno y postre secundarios');
    const friday=page.locator('#week .day-button').last();
    assert.equal(await friday.locator('.week-meal-free').count(),1,'viernes noche libre destacada');
    assert.match(await friday.innerText(),/Noche libre/);
    assert.equal(await friday.locator('.week-meal-row').count(),3,'sin postre oculto');


    assert.equal(await page.locator('#month').inputValue(),'10',test.name+': mes');
    assert.match(await page.locator('#week').innerText(),/Bacalao a la vizcaína con patatas panadera/);
    const scroll=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert.ok(scroll<=2,test.name+': desbordamiento horizontal '+scroll);
    const gallery=page.locator('#batch .batch-gallery');
    assert.equal(await gallery.count(),1,'Batch cooking como galería');
    assert.ok(await gallery.locator('.batch-tile').count()>=2,'Bacalao y otras preparaciones');
    assert.equal(await gallery.locator('a[href$="/recetas/bacalao-a-la-vizcaina/"]').count(),1,'Bacalao aparece en batch cooking');
    assert.ok(await page.locator('#batch .batch-gallery img').count()<=await gallery.locator('.batch-tile').count(),'Imagen principal si existe, marcador si falta');
    const images=await gallery.locator('img').evaluateAll(els=>els.map(el=>el.getAttribute('src')));
    assert.ok(images.every(src=>src.includes('/imagenes/')&&!src.includes('/imagenes/batchcooking/')),'Una imagen principal común');
    const tileCount=await gallery.locator('.batch-tile').count();
    const nameStyle=await gallery.locator('.batch-tile-title').first().evaluate(el=>({align:getComputedStyle(el).textAlign,font:getComputedStyle(el).fontFamily}));
    assert.equal(nameStyle.align,'center','Nombres centrados');
    assert.ok(nameStyle.font.includes('Geist'),'Tipografía Geist');
    assert.equal(await gallery.locator('.batch-tile > .batch-tile-title').count(),0,'Sin títulos debajo de la imagen');
    assert.equal(await gallery.locator('.batch-thumb > .batch-tile-title').count(),tileCount,'Títulos encima de imágenes');
    const firstTile=gallery.locator('.batch-tile').first();
    assert.equal(await firstTile.locator('.batch-tile-title').evaluate(el=>getComputedStyle(el).opacity),'0','Nombre oculto inicialmente');
    if(test.name==='desktop'){
      await firstTile.hover();
      await page.waitForFunction(()=>getComputedStyle(document.querySelector('#batch .batch-tile-title')).visibility==='visible',{timeout:2500});
    }
    if((test.width===1440||test.name.endsWith('horizontal')) && tileCount>=2){
      const cardWidths=await gallery.locator('.batch-tile').evaluateAll(els=>els.map(el=>el.getBoundingClientRect().width));
      assert.ok(cardWidths.every(w=>w<=191),'Miniaturas acotadas en horizontal');
      const rows=await gallery.locator('.batch-tile').evaluateAll(els=>els.map(el=>Math.round(el.getBoundingClientRect().top)));
      assert.ok(new Set(rows.slice(0,Math.min(5,rows.length))).size===1,'Hasta cinco miniaturas en primera fila');
    }
    assert.ok(await gallery.evaluate(el=>el.classList.contains('batch-cols-'+(el.children.length===1?1:(el.children.length%3===0||el.children.length%5===0||el.children.length%2!==0)?3:2))),'Columnas de galería correctas');
    await page.screenshot({path:out+'/semana-'+test.name+'.png',fullPage:true});
    await page.getByRole('button',{name:'Ver resumen de Lunes'}).click();
    assert.equal(await page.locator('#day-modal').isVisible(),true);
    assert.match(await page.locator('#quick-content').innerText(),/Patatas panadera/);
    const nutrition=page.locator('#quick-content .daily-nutrition');
    assert.equal(await nutrition.count(),1,'Nuevo resumen nutricional');
    assert.equal(await nutrition.locator('.daily-energy-center strong').innerText(),'1488','Kcal del día');
    assert.equal(await nutrition.locator('.daily-energy-center small').innerText(),'de 1600','Referencia kcal');
    assert.equal(await nutrition.locator('.daily-macro').count(),3,'Tres barras de macros');
    assert.equal(await nutrition.locator('.daily-macro-name').allInnerTexts().then(a=>a.join(',')),'Proteínas,Hidratos,Grasas','Orden de macros');
    const macroValues=await nutrition.locator('.daily-macro').evaluateAll(els=>els.map(el=>({
      grams:el.querySelector('.daily-macro-values strong').textContent,
      percentage:el.querySelector('.daily-macro-values small').textContent,
      width:parseFloat(el.querySelector('.daily-macro-fill').style.width)
    })));
    assert.deepEqual(macroValues.map(v=>v.grams),['99 g','105 g','70 g'],'Gramos registrados');
    assert.deepEqual(macroValues.map(v=>v.percentage),['27%','29%','44%'],'Distribución 4-4-9 normalizada');
    assert.ok(macroValues.every(v=>v.width>=0&&v.width<=100),'Anchura segura para barras');
    assert.ok(Math.abs(macroValues.reduce((sum,v)=>sum+v.width,0)-100)<.01,'Las barras representan porcentajes del total energético calculado');
    assert.match(await nutrition.locator('.daily-macro-note').innerText(),/% de energía/,'Interpretación inequívoca');
    const nutritionDimensions=await nutrition.evaluate(el=>{
      const box=el.getBoundingClientRect(),dialog=el.closest('.day-dialog').getBoundingClientRect();
      return {left:box.left,right:box.right,dlgLeft:dialog.left,dlgRight:dialog.right,overflow:el.scrollWidth-el.clientWidth}
    });
    assert.ok(nutritionDimensions.left>=nutritionDimensions.dlgLeft-1&&nutritionDimensions.right<=nutritionDimensions.dlgRight+1,'Panel de nutrición cabe en el modal');
    assert.ok(nutritionDimensions.overflow<=2,'El módulo nutricional no desborda en '+test.name);

    // Los estilos deben aplicarse realmente (no basta con comprobar clases).
    const actionLayout=await page.locator('#day-dialog').evaluate(dialog=>{
      const close=dialog.querySelector('#close-day'),expand=dialog.querySelector('#expand-day');
      const a=expand.getBoundingClientRect(),b=close.getBoundingClientRect(),container=dialog.getBoundingClientRect();
      const name=dialog.querySelector('.day-context-name');
      return {
        a:{x:a.x,y:a.y,width:a.width,height:a.height},
        b:{x:b.x,y:b.y,width:b.width,height:b.height},
        right:container.right,color:getComputedStyle(name).color,
        weight:Number.parseInt(getComputedStyle(name).fontWeight,10),
        expandParent:expand.parentElement===close.parentElement
      };
    });
    assert.ok(actionLayout.expandParent,'Ampliar y cerrar comparten contenedor');
    assert.ok(Math.abs(actionLayout.a.y-actionLayout.b.y)<=2,'Botones de ampliar y cerrar a la misma altura');
    assert.ok(actionLayout.a.x<actionLayout.b.x && actionLayout.b.x-actionLayout.a.x<=60,'Ampliar inmediatamente a la izquierda de X');
    assert.ok(actionLayout.right-actionLayout.b.x<85,'Acciones en extremo superior derecho');
    assert.ok(Math.abs(actionLayout.a.width-actionLayout.b.width)<=1 && actionLayout.a.width>=43,'Botones del mismo tamaño circular');
    assert.equal(actionLayout.color,'rgb(81, 111, 93)','Nombre del día en verde de MiruRecetas');
    assert.ok(actionLayout.weight>=700,'Nombre del día en negrita');
    const expandIcon=page.locator('#expand-day svg.lucide-maximize-2');
    assert.equal(await expandIcon.count(),1,'Icono maximize-2 renderizado');
    const actionColors=await page.locator('#day-dialog').evaluate(dialog=>({
      expand:getComputedStyle(dialog.querySelector('#expand-day')).color,
      close:getComputedStyle(dialog.querySelector('#close-day')).color,
      icon:getComputedStyle(dialog.querySelector('#expand-day svg')).color
    }));
    assert.equal(actionColors.expand,actionColors.close,'Ampliar y cerrar usan el mismo color');
    assert.equal(actionColors.icon,actionColors.close,'SVG hereda el mismo color');

    const dialog=await page.locator('#day-dialog').boundingBox();
    assert.ok(dialog.x>=-1&&dialog.x+dialog.width<=test.width+1,test.name+': panel fuera de ventana');
    await page.screenshot({path:out+'/panel-'+test.name+'.png'});
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#day-modal').isVisible(),false,'Escape');
    await page.getByRole('button',{name:'Ver resumen de Martes'}).click();
    assert.match(await page.locator('#quick-content').innerText(),/Boniato al horno/);
    assert.equal(await page.locator('#quick-content .daily-nutrition').count(),1,'Nutrición visual también el martes');
    assert.equal(await page.locator('#quick-content .day-context').textContent(),'Octubre · Menú 1 · Martes','Encabezado contextual');
    assert.equal(await page.locator('#quick-content .day-context-name').textContent(),'Martes','Día destacado');
    assert.equal(await page.locator('#expand-day').getAttribute('aria-label'),'Ver día completo','Icono accesible');
    assert.equal(await page.locator('#quick-content .day-cta').count(),0,'Sin botón inferior');
    assert.equal(await page.locator('#day-dialog-actions').count(),0,'Sin acciones duplicadas');
    await page.locator('#expand-day').click();
    await page.waitForURL(/\/menus\/10-1\/martes\//);
    await page.locator('.daily-meal').first().waitFor();
    assert.match(await page.locator('body').innerText(),/Carrilleras al vino con boniato al horno/);
    const principal=page.locator('.culinary-group').filter({hasText:'Carrilleras de cerdo al vino'}).first();
    assert.equal(await principal.getAttribute('open'),'','Preparación principal inicialmente visible');
    assert.ok(await principal.locator('a[href*="/recetas/"]').count()>0,'Ficha de receta enlazada');
    const group=page.locator('.culinary-group').filter({hasText:'Boniato al horno'}).first();
    await group.locator('summary').click();
    assert.equal(await group.getAttribute('open'),'');
    assert.match(await group.innerText(),/Boniato/);
    const dailyOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert.ok(dailyOverflow<=2,test.name+': página diaria desborda '+dailyOverflow);
    await page.screenshot({path:out+'/dia-'+test.name+'.png',fullPage:true});
    await page.goto('http://127.0.0.1:8765/recetario/');
    await page.locator('#recipe-catalog').waitFor();
    assert.ok(await page.locator('#recipe-catalog .recipe-tile').count()>=10,'10 recetas iniciales');
    await page.screenshot({path:out+'/recetario-'+test.name+'.png',fullPage:true});
    await page.close();
  }
  await browser.close();
  if(issues.length)throw new Error(issues.join('\n'));
  console.log('PASS: Navegación y estructura en desktop/tablet/mobile; 12 capturas creadas.');
})().catch(e=>{console.error(e);process.exit(1)});
