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
    const weeklyLayout=await page.locator('#week .week-card').evaluateAll(cards=>cards.map(card=>{
      const rect=node=>{const r=node.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height,width:r.width}};
      const head=card.querySelector('.week-card-head');
      const title=card.querySelector('.week-card-title');
      const ring=card.querySelector('.week-kcal-ring');
      const first=card.querySelector('.week-meal-row');
      return {
        card:rect(card),head:rect(head),title:rect(title),ring:rect(ring),first:rect(first),
        titleText:title.textContent,titleScroll:title.scrollWidth,titleClient:title.clientWidth,
        titleWhiteSpace:getComputedStyle(title).whiteSpace,
        cardDisplay:getComputedStyle(card).display,
        cardJustify:getComputedStyle(card).justifyContent,
        progress:getComputedStyle(ring.querySelector('.ring-progress')).stroke,
        track:getComputedStyle(ring.querySelector('.ring-track')).stroke,
        label:getComputedStyle(ring.querySelector('small')).color
      };
    }));
    assert.equal(weeklyLayout.length,5,'Cinco tarjetas semanales evaluadas');
    assert.ok(weeklyLayout.every(x=>x.cardDisplay==='flex'&&x.cardJustify==='flex-start'),
      'Todo el contenido semanal se alinea arriba');
    assert.ok(weeklyLayout.every(x=>x.titleWhiteSpace==='nowrap'&&
      x.titleScroll<=x.titleClient+1),'Todos los días caben en una sola línea, incluido Miércoles');
    assert.deepEqual(weeklyLayout.map(x=>x.titleText),['Lunes','Martes','Miércoles','Jueves','Viernes']);
    assert.ok(weeklyLayout.every(x=>x.progress==='rgb(69, 75, 75)'),
      'Anillos semanales en gris carbón, distintos de la paleta de macros');
    assert.ok(weeklyLayout.every(x=>x.track==='rgb(220, 221, 218)'),
      'Pista neutra en los cinco anillos');
    if(test.width>=1091){
      const close=(values,tolerance=1)=>Math.max(...values)-Math.min(...values)<=tolerance;
      assert.ok(close(weeklyLayout.map(x=>x.card.top)),test.name+': cinco tarjetas empiezan a la misma altura');
      assert.ok(close(weeklyLayout.map(x=>x.card.height)),test.name+': cinco tarjetas mantienen igual altura');
      assert.ok(close(weeklyLayout.map(x=>x.card.width)),test.name+': cinco tarjetas mantienen igual anchura');
      assert.ok(close(weeklyLayout.map(x=>x.head.top)),test.name+': encabezados alineados arriba');
      assert.ok(close(weeklyLayout.map(x=>x.head.height)),test.name+': encabezados de altura idéntica');
      assert.ok(close(weeklyLayout.map(x=>x.first.top)),test.name+': primeras comidas alineadas arriba');
      assert.ok(weeklyLayout.every(x=>x.head.top-x.card.top<30),test.name+': encabezados pegados a la zona superior');
      assert.ok(weeklyLayout.every(x=>x.first.top>=x.head.bottom),test.name+': comidas después del encabezado');
    }

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
    assert.match(await page.locator('#quick-content').innerText(),/Bacalao a la vizcaína/);
    const dailyMeals=page.locator('#quick-content .quick-meal');
    assert.equal(await dailyMeals.count(),4,'Las cuatro ingestas del lunes');
    assert.deepEqual(await dailyMeals.locator('.quick-meal-heading').allInnerTexts(),['Desayuno','Comida','Cena','Postre'],'Etiquetas de las ingestas');
    for(const icon of ['coffee','utensils','moon','apple'])
      assert.equal(await dailyMeals.locator('.quick-meal-heading svg.lucide-'+icon).count(),1,'Icono de '+icon+' igual que en semanal');
    assert.deepEqual(await dailyMeals.nth(0).locator('.quick-meal-name').allInnerTexts(),['Café con leche'],'Desayuno simplificado');
    assert.deepEqual(await dailyMeals.nth(1).locator('.quick-group .quick-meal-name').allInnerTexts(),['Bacalao a la vizcaína','Patatas panadera'],'Solo nombres del almuerzo');
    assert.deepEqual(await dailyMeals.nth(2).locator('.quick-group .quick-meal-name').allInnerTexts(),['Carpaccio con parmesano y AOVE','Puerros con mayonesa','Bowl de yogur con miel y granola'],'Nombres y orden de cena Airtable');
    assert.equal(await dailyMeals.locator('details,summary,.quick-group-ingredient').count(),0,'Sin desplegables ni componentes en ventana rápida');
    assert.deepEqual(await dailyMeals.nth(3).locator('.quick-meal-name').allInnerTexts(),['Ciruelas'],'Postre sigue independiente');
    assert.deepEqual(await dailyMeals.locator('a.quick-group-recipe').evaluateAll(els=>els.map(el=>new URL(el.href).pathname)),[
      '/recetas/bacalao-a-la-vizcaina/',
      '/recetas/bowl-de-yogur-con-miel-y-granola/'
    ],'Recetas de lunes enlazadas desde grupos');
    assert.equal(await dailyMeals.nth(0).locator('a').count(),0,'Café sin enlace');
    assert.equal(await dailyMeals.nth(3).locator('a').count(),0,'Ciruelas sin enlace');
    assert.equal(await dailyMeals.nth(2).locator('a.quick-group-recipe').count(),1,'Solo bowl es receta enlazada');
    assert.equal(await dailyMeals.nth(2).locator('.quick-group').nth(1).locator('a').count(),0,'Puerros solo texto');
    assert.equal(await dailyMeals.locator('.muted.small').count(),0,'Sin detalles redundantes');
    assert.ok(await dailyMeals.evaluateAll(els=>els.every(el=>getComputedStyle(el).borderTopWidth==='0px')),'Sin líneas separadoras entre ingestas');
    assert.ok(await dailyMeals.evaluateAll(els=>els.every(el=>el.scrollWidth<=el.clientWidth+2)),'Sin desbordamiento en nombres');

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
    assert.deepEqual(macroValues.map(v=>v.percentage),['106%','71%','107%'],'Cumplimiento diario: PR 93 g, HC 147 g, GR 65 g');
    assert.deepEqual(macroValues.map(v=>Math.round(v.width)),[100,71,100],'Anchura relativa al objetivo y limitada a 100%');
    assert.match(await nutrition.locator('.daily-macro-note').innerText(),/objetivo diario/,'Leyenda de objetivos diarios');
    assert.equal(await nutrition.locator('.daily-macro-ring .daily-energy-progress').count(),0,'Sin arco terracota único');
    assert.equal(await nutrition.locator('.daily-macro-ring .daily-macro-arc').count(),3,'Anillo tricolor en tarjeta compacta');
    const palette=await page.evaluate(()=>{
      const css=getComputedStyle(document.documentElement);
      return ['--macro-protein','--macro-carbs','--macro-fat'].map(prop=>css.getPropertyValue(prop).trim());
    });
    assert.deepEqual(palette,['#748d76','#b86f54','#d0a36e'],'Paleta global: verde proteínas, terracota HC, mostaza grasas');
    const targetRgb=['rgb(116, 141, 118)','rgb(184, 111, 84)','rgb(208, 163, 110)'];
    const quickColors=await nutrition.evaluate(node=>({
      bars:[...node.querySelectorAll('.daily-macro-fill')].map(el=>getComputedStyle(el).backgroundColor),
      arcs:[...node.querySelectorAll('.daily-macro-arc')].map(el=>getComputedStyle(el).stroke)
    }));
    assert.deepEqual(quickColors.bars,targetRgb,'Barras compactas con paleta única');
    assert.deepEqual(quickColors.arcs,targetRgb,'Anillo compacto con paleta única');

    const compactNutritionSignature=await nutrition.evaluate(node=>{
      const arcs=[...node.querySelectorAll('.daily-macro-arc')];
      return {
        kcal:node.querySelector('.daily-energy-center strong').textContent,
        reference:node.querySelector('.daily-energy-center small').textContent,
        macros:[...node.querySelectorAll('.daily-macro')].map(row=>({
          label:row.querySelector('.daily-macro-name').textContent,
          value:row.querySelector('.daily-macro-values strong').textContent,
          percent:row.querySelector('.daily-macro-values small').textContent,
          width:row.querySelector('.daily-macro-fill').style.width
        })),
        ring:arcs.map(arc=>({
          className:arc.getAttribute('class'),
          length:Number(arc.getAttribute('stroke-dasharray').split(' ')[0]),
          offset:Number(arc.getAttribute('stroke-dashoffset')),
          color:getComputedStyle(arc).stroke
        })),
        ringLabel:node.querySelector('.daily-macro-ring').getAttribute('aria-label')
      };
    });
    const paintedCompact=compactNutritionSignature.ring.reduce((sum,arc)=>sum+arc.length,0);
    const circ=2*Math.PI*49;
    assert.ok(Math.abs(paintedCompact/circ-1488.4/1600)<.002,'Energía visible del anillo compacto = 93% del objetivo');
    const macroKcal=99*4+105*4+70*9;
    for(const [i,energyKcal] of [99*4,105*4,70*9].entries())
      assert.ok(Math.abs(compactNutritionSignature.ring[i].length/paintedCompact-energyKcal/macroKcal)<.002,
        'Proporción energética del arco compacto '+i);
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
    await page.getByRole('button',{name:'Ver resumen de Miércoles'}).click();
    assert.deepEqual(await page.locator('#quick-content a.quick-group-recipe').evaluateAll(els=>els.map(el=>new URL(el.href).pathname)),[
      '/recetas/bacalao-a-la-vizcaina/',
      '/recetas/quiche-de-puerro-champinones-y-pavo/'
    ],'Miércoles: grupos de bacalao y quiche');
    await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'Ver resumen de Jueves'}).click();
    assert.deepEqual(await page.locator('#quick-content a.quick-group-recipe').evaluateAll(els=>els.map(el=>new URL(el.href).pathname)),[
      '/recetas/canelones-de-carrilleras/',
      '/recetas/tostas-de-hummus-y-sardinillas/'
    ],'Jueves: preparaciones enlazadas');
    await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'Ver resumen de Viernes'}).click();
    assert.equal(await page.locator('#quick-content .quick-meal').count(),3,'Viernes sin postre');
    assert.deepEqual(await page.locator('#quick-content .quick-meal').last().locator('.quick-meal-name').allInnerTexts(),['Noche libre'],'Cena libre');
    assert.deepEqual(await page.locator('#quick-content a.quick-group-recipe').evaluateAll(els=>els.map(el=>new URL(el.href).pathname)),[
      '/recetas/wok-de-gambones-y-pisto/'
    ],'Viernes: wok enlazado');
    await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'Ver resumen de Martes'}).click();
    assert.deepEqual(await page.locator('#quick-content .quick-meal').nth(2).locator('.quick-group .quick-meal-name').allInnerTexts(),['Mini wraps de falafel','Boquerones aliñados'],'Cena del martes agrupada');
    assert.deepEqual(await page.locator('#quick-content a.quick-group-recipe').evaluateAll(els=>els.map(el=>new URL(el.href).pathname)),[
      '/recetas/carrilleras-de-cerdo-al-vino/',
      '/recetas/mini-wraps-de-falafel/'
    ],'Martes: recetas reales enlazadas');
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
    assert.equal(await page.locator('.daily-page-heading .eyebrow').innerText(),'OCTUBRE · MENÚ 1','Mes y menú visibles');
    assert.equal(await page.locator('.daily-page-heading h1').innerText(),'Martes','Día a la derecha');
    assert.equal(await page.getByText('Valores correspondientes a las ingestas planificadas registradas').count(),0,'Texto redundante retirado');
    const headingGeometry=await page.locator('.daily-page-heading').evaluate(node=>{
      const month=node.querySelector('.eyebrow').getBoundingClientRect();
      const day=node.querySelector('h1').getBoundingClientRect();
      return {monthX:month.x,dayX:day.x,monthY:month.y+month.height/2,dayY:day.y+day.height/2};
    });
    assert.ok(headingGeometry.dayX>headingGeometry.monthX,'Día alineado a la derecha');
    assert.ok(Math.abs(headingGeometry.dayY-headingGeometry.monthY)<35,'Día y menú en la misma línea');
    const dailyVisual=page.locator('.daily-total .daily-nutrition');
    assert.equal(await dailyVisual.count(),1,'Tarjeta nutricional compartida');
    assert.equal(await dailyVisual.locator('.daily-energy-center strong').count(),1,'Anillo de calorías visible');
    assert.equal(await dailyVisual.locator('.daily-macro').count(),3,'Tres barras de macronutrientes');
    assert.equal(await dailyVisual.locator('.daily-macro-ring .daily-macro-arc').count(),3,'Tres segmentos en el anillo del martes');
    assert.match(await dailyVisual.locator('.daily-macro-note').innerText(),/objetivo diario/,'Barras referidas a objetivos, no a distribución energética');
    assert.equal(await dailyVisual.locator('.daily-macro-ring .daily-energy-progress').count(),0,'No queda progreso terracota antiguo');
    assert.equal(await page.locator('.daily-total h2').count(),0,'Sin encabezado antiguo de nutrición');
    assert.ok(await dailyVisual.evaluate(node=>node.scrollWidth<=node.clientWidth+2),'Tarjeta nutricional sin desbordamiento');
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
    await page.goto('http://127.0.0.1:8765/menus/10-1/lunes/');
    assert.equal(await page.locator('.daily-total .daily-energy-center strong').innerText(),'1488','Mismas kcal que el resumen rápido del lunes');
    assert.deepEqual(await page.locator('.daily-total .daily-macro-values strong').allInnerTexts(),['99 g','105 g','70 g'],'Mismos macros que en ficha rápida');
    assert.deepEqual(await page.locator('.daily-total .daily-macro-values small').allInnerTexts(),['106%','71%','107%'],'Cumplimiento diario: PR 93 HC 147 GR 65');
    const expandedNutritionSignature=await page.locator('.daily-total .daily-nutrition').evaluate(node=>({
      kcal:node.querySelector('.daily-energy-center strong').textContent,
      reference:node.querySelector('.daily-energy-center small').textContent,
      macros:[...node.querySelectorAll('.daily-macro')].map(row=>({
        label:row.querySelector('.daily-macro-name').textContent,
        value:row.querySelector('.daily-macro-values strong').textContent,
        percent:row.querySelector('.daily-macro-values small').textContent,
        width:row.querySelector('.daily-macro-fill').style.width
      })),
      ring:[...node.querySelectorAll('.daily-macro-arc')].map(arc=>({
        className:arc.getAttribute('class'),
        length:Number(arc.getAttribute('stroke-dasharray').split(' ')[0]),
        offset:Number(arc.getAttribute('stroke-dashoffset')),
        color:getComputedStyle(arc).stroke
      })),
      ringLabel:node.querySelector('.daily-macro-ring').getAttribute('aria-label')
    }));
    assert.deepEqual(expandedNutritionSignature,compactNutritionSignature,'Ficha rápida y ampliada representan idéntica energía, colores y objetivos');
    const fullBarColors=await page.locator('.daily-total .daily-macro-fill').evaluateAll(nodes=>nodes.map(n=>getComputedStyle(n).backgroundColor));
    assert.deepEqual(fullBarColors,targetRgb,'Barras ampliadas: verde proteínas, terracota HC, mostaza grasas');

    const ringValues=await page.locator('.daily-total .daily-macro-ring').evaluate(ring=>{
      const arcs=[...ring.querySelectorAll('.daily-macro-arc')];
      const track=ring.querySelector('.daily-energy-track');
      const circumference=2*Math.PI*Number(track.getAttribute('r'));
      return {parts:arcs.map(a=>({
        name:a.getAttribute('class'),
        length:Number(a.getAttribute('stroke-dasharray').split(' ')[0]),
        start:-Number(a.getAttribute('stroke-dashoffset'))
      })),circumference}
    });
    assert.deepEqual(ringValues.parts.map(x=>x.name.split(' ').at(-1)),['daily-macro-arc-protein','daily-macro-arc-carbs','daily-macro-arc-fat'],'Orden fijo de segmentos de color');
    const painted=ringValues.parts.reduce((sum,part)=>sum+part.length,0);
    assert.ok(Math.abs(painted/ringValues.circumference-1488.4/1600)<.002,'Anillo refleja 93% del objetivo calórico');
    const totalMacroKcal=99*4+105*4+70*9;
    assert.ok(Math.abs(ringValues.parts[0].length/painted-99*4/totalMacroKcal)<.002,'Proteínas aportan 27% del arco');
    assert.ok(Math.abs(ringValues.parts[1].length/painted-105*4/totalMacroKcal)<.002,'HC aportan 29% del arco');
    assert.ok(Math.abs(ringValues.parts[2].length/painted-70*9/totalMacroKcal)<.002,'Grasas aportan 44% del arco');
    const goalWidths=await page.locator('.daily-total .daily-macro-fill').evaluateAll(nodes=>nodes.map(node=>Number(node.style.width.replace('%',''))));
    assert.deepEqual(goalWidths.map(Math.round),[100,71,100],'Barras capadas a 100% aunque el objetivo se supere');
        const dinnerGroups=page.locator('.daily-meal').filter({has:page.locator('h2:text-is("Cena")')}).locator('.culinary-group');
    assert.deepEqual(await dinnerGroups.locator('summary').allInnerTexts(),[
      'Carpaccio con parmesano y AOVE','Puerros con mayonesa','Bowl de yogur con miel y granola'
    ],'Página completa respeta orden definitivo del lunes');
    await dinnerGroups.nth(1).locator('summary').click();
    assert.equal(await dinnerGroups.nth(1).locator('.ingredient-line').count(),2,'Despliegue de puerros y mayonesa');
    await page.goto('http://127.0.0.1:8765/recetario/');
    await page.locator('#recipe-catalog').waitFor();
    const expectedFooter='MiruRecetas · Menús estacionales, siempre reutilizables';
    assert.equal(await page.locator('footer.footer').innerText(),expectedFooter,
      'Recetario usa el pie de página aprobado');

    const catalogNav=page.locator('header.topbar nav.nav');
    assert.equal(await catalogNav.locator('a').count(),2,'El recetario conserva las dos opciones del menú');
    await catalogNav.locator('svg.lucide-calendar-days').waitFor({state:'visible'});
    await catalogNav.locator('svg.lucide-book-open').waitFor({state:'visible'});
    assert.equal(await catalogNav.locator('a').nth(0).innerText(),'Mis menús','Etiqueta Mis menús junto al calendario');
    assert.equal(await catalogNav.locator('a').nth(1).innerText(),'Recetario','Etiqueta Recetario junto al libro');
    assert.equal(await catalogNav.locator('a').nth(1).getAttribute('aria-current'),'page','Página activa accesible');
    const navIconLayout=await catalogNav.locator('svg').evaluateAll(nodes=>nodes.map(node=>{
      const rect=node.getBoundingClientRect();
      return {width:rect.width,height:rect.height,display:getComputedStyle(node).display};
    }));
    assert.equal(navIconLayout.length,2,'Ambos iconos Lucide renderizados');
    assert.ok(navIconLayout.every(icon=>icon.width>0&&icon.height>0),
      'Iconos de navegación no ocultos ni colapsados');

    assert.ok(await page.locator('#recipe-catalog .recipe-tile').count()>=10,'10 recetas iniciales');
    await page.screenshot({path:out+'/recetario-'+test.name+'.png',fullPage:true});
    await page.goto('http://127.0.0.1:8765/');
    assert.equal(await page.locator('footer.footer').innerText(),expectedFooter,
      'Portada y recetario mantienen el mismo pie');
    await page.getByRole('button',{name:'Ver resumen de Lunes'}).click();
    await page.locator('#quick-content a.quick-group-recipe').last().click();
    await page.waitForURL(/\/recetas\/bowl-de-yogur-con-miel-y-granola\//);
    assert.match(await page.locator('h1').first().innerText(),/Bowl de yogur con miel y granola/,'Clic desde el modal abre la receta');
    const recipeColors=await page.locator('.nutrition').evaluate(node=>({
      dots:[...node.querySelectorAll('.macros .dot')].map(dot=>getComputedStyle(dot).backgroundColor),
      ring:getComputedStyle(node.querySelector('.ring')).backgroundImage
    }));
    assert.deepEqual(recipeColors.dots,targetRgb,'Leyenda de receta: verde proteína, terracota hidratos, mostaza grasas');
    for(const color of targetRgb)
      assert.ok(recipeColors.ring.includes(color),'Anillo de receta usa el color '+color);


    await page.close();
  }

  // Gestos táctiles reales en Chromium: límites, todos los días, scroll vertical
  // y compatibilidad con controles de ingredientes y navegación de teclado.
  const context=await browser.newContext({
    viewport:{width:390,height:844},deviceScaleFactor:1,hasTouch:true,isMobile:true
  });
  const touchPage=await context.newPage();
  touchPage.on('pageerror',error=>issues.push('gestos: '+error.message));
  const names=['lunes','martes','mi%C3%A9rcoles','jueves','viernes'];
  // Los href de producción apuntan a Pages; solo durante QA apuntan al servidor local.
  async function localizeDayLinks(){
    await touchPage.locator('.daily-navigation a').evaluateAll(links=>{
      for(const a of links){
        const url=new URL(a.href);
        a.href='http://127.0.0.1:8765/'+url.pathname.replace(/^\/menu-anual-recetas\//,'').replace(/^\/+/, '');
      }
    });
  }
  async function swipe(direction,vertical=false){
    await localizeDayLinks();
    const size=touchPage.viewportSize();
    const heading=await touchPage.locator('.daily-page-heading').boundingBox();
    const y=Math.round(heading.y+heading.height/2);
    const startX=Math.round(size.width*(direction==='left'?.82:.18));
    const endX=vertical?startX+12:Math.round(size.width*(direction==='left'?.18:.82));
    const endY=vertical?y+250:y+8;
    const cdp=await context.newCDPSession(touchPage);
    await cdp.send('Input.dispatchTouchEvent',{
      type:'touchStart',touchPoints:[{x:startX,y,id:1}]
    });
    for(let i=1;i<=6;i++){
      await cdp.send('Input.dispatchTouchEvent',{
        type:'touchMove',
        touchPoints:[{x:Math.round(startX+(endX-startX)*i/6),
                       y:Math.round(y+(endY-y)*i/6),id:1}]
      });
    }
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await cdp.detach().catch(()=>{});
  }
  await touchPage.goto('http://127.0.0.1:8765/menus/10-1/lunes/');
  assert.equal(await touchPage.locator('.daily-nav-prev').count(),0,'Lunes no tiene anterior');
  assert.equal(await touchPage.locator('.daily-nav-next').count(),1,'Lunes tiene siguiente');
  assert.equal(await touchPage.locator('.daily-nav-next').getAttribute('aria-label'),'Ir al día siguiente: Martes','Siguiente accesible');
  await swipe('right');
  await touchPage.waitForTimeout(180);
  assert.match(touchPage.url(),/\/lunes\/$/,'No se permite retroceder de lunes');
  for(let i=1;i<names.length;i++){
    await swipe('left');
    await touchPage.waitForURL(new RegExp('/'+names[i]+'/$'),{timeout:5000});
    assert.equal(await touchPage.locator('.daily-page-heading h1').innerText(),
                 ['Lunes','Martes','Miércoles','Jueves','Viernes'][i],
                 'Deslizamiento izquierda avanza al día '+i);
  }
  assert.equal(await touchPage.locator('.daily-nav-next').count(),0,'Viernes no tiene siguiente');
  assert.equal(await touchPage.locator('.daily-nav-prev').getAttribute('aria-label'),'Ir al día anterior: Jueves','Anterior accesible');
  await swipe('left');
  await touchPage.waitForTimeout(180);
  assert.match(touchPage.url(),/\/viernes\/$/,'No se permite avanzar después de viernes');
  for(let i=names.length-2;i>=0;i--){
    await swipe('right');
    await touchPage.waitForURL(new RegExp('/'+names[i]+'/$'),{timeout:5000});
  }
  await swipe('left',true);
  await touchPage.waitForTimeout(180);
  assert.match(touchPage.url(),/\/lunes\/$/,'El scroll vertical no cambia de día');
  const ingredientGroup=touchPage.locator('.culinary-group').first();
  const prior=await ingredientGroup.getAttribute('open');
  await ingredientGroup.locator('summary').click();
  assert.notEqual(await ingredientGroup.getAttribute('open'),prior,'Desplegables siguen respondiendo al toque');
  await localizeDayLinks();
  await touchPage.locator('.daily-nav-next').focus();
  await touchPage.keyboard.press('Enter');
  await touchPage.waitForURL(/\/martes\/$/);
  assert.equal(await touchPage.locator('.daily-page-heading h1').innerText(),'Martes','Navegación inferior accesible por teclado');
  await context.close();

  await browser.close();
  if(issues.length)throw new Error(issues.join('\n'));
  console.log('PASS: Navegación y estructura en desktop/tablet/mobile; 12 capturas creadas.');
})().catch(e=>{console.error(e);process.exit(1)});
