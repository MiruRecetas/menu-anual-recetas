const { chromium } = require('playwright');
const fs = require('fs');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({headless:true});
  // Entrada por la raíz: redirección, parámetros y alternativa sin JavaScript.
  const rootHtml=fs.readFileSync('hosting/github-pages-root/index.html','utf8').replaceAll('https://mirurecetas.github.io/menu-anual-recetas/','http://127.0.0.1:8765/');
  for(const javaScriptEnabled of [true,false]){
    const context=await browser.newContext({javaScriptEnabled});
    const page=await context.newPage();
    await page.route('**/__root-entry/**',route=>route.fulfill({contentType:'text/html',body:rootHtml}));
    const entered='http://127.0.0.1:8765/__root-entry/?origen=raiz#menus';
    const target=javaScriptEnabled?'http://127.0.0.1:8765/?origen=raiz#menus':'http://127.0.0.1:8765/';
    await page.goto(entered);
    await page.waitForURL(javaScriptEnabled?target:url=>url.origin==='http://127.0.0.1:8765'&&url.pathname==='/');
    assert.equal(await page.locator('h1').innerText(),'¿Qué cocinamos esta semana?','Raíz abre la web');
    await context.close();
  }
  const issues=[];
  const out='qa-screenshots';fs.mkdirSync(out,{recursive:true});
  for(const test of [{name:'desktop',width:1440,height:900},{name:'tablet',width:820,height:1100},{name:'mobile',width:390,height:844},{name:'tablet-horizontal',width:1100,height:820},{name:'mobile-horizontal',width:844,height:390},{name:'mobile-small-horizontal',width:667,height:375},{name:'tablet-compact-horizontal',width:1024,height:768}]){
    const page=await browser.newPage({viewport:{width:test.width,height:test.height},deviceScaleFactor:1});
    page.on('pageerror',e=>issues.push(test.name+': error JS: '+e.message));
    await page.goto('http://127.0.0.1:8765/',{waitUntil:'load'});
    // Fijar el menú de regresión: el sitio ya dispone de otros menús calculados
    // y el orden/última selección no implica que Octubre · Menú 1 esté activo.
    await page.locator('#month').selectOption('10');
    await page.locator('#menu-number').selectOption('1');
    await page.locator('#week .day-button').first().waitFor();
    assert.equal(await page.locator('#week .day-button').count(),5,test.name+': días');
    assert.equal(await page.locator('#week .week-kcal-ring').count(),5,'Cinco anillos');
    const expectedRows=await page.locator('#site-data').evaluate(e=>{const m=JSON.parse(e.textContent).menus.find(m=>m.mes===10&&m.menu===1);return Object.values(m.dias).reduce((n,d)=>n+3+(d.postre?.componentes?.length||(d.postre?1:0)),0)});
    assert.equal(await page.locator('#week .week-meal-row').count(),expectedRows,'Ingestas existentes');
    const verticalDayCards=test.width<=700&&test.height>test.width;
    if(verticalDayCards)await page.waitForFunction(()=>{const hs=[...document.querySelectorAll('#week .week-card')].map(e=>e.getBoundingClientRect().height);return Math.max(...hs)-Math.min(...hs)<1});
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
    assert.ok(weeklyLayout.every(x=>x.cardDisplay===(verticalDayCards?'grid':'flex')&&x.cardJustify==='flex-start'),
      'Todo el contenido semanal se alinea arriba');
    assert.ok(weeklyLayout.every(x=>x.titleWhiteSpace==='nowrap'&&
      x.titleScroll<=x.titleClient+1),'Todos los días caben en una sola línea, incluido Miércoles');
    assert.deepEqual(weeklyLayout.map(x=>x.titleText),['Lunes','Martes','Miércoles','Jueves','Viernes']);
    assert.ok(weeklyLayout.every(x=>x.progress==='rgb(69, 75, 75)'),
      'Anillos semanales en gris carbón, distintos de la paleta de macros');
    assert.ok(weeklyLayout.every(x=>x.track==='rgb(220, 221, 218)'),
      'Pista neutra en los cinco anillos');
    const fiveColumns=test.width>=1091||(test.width>=600&&test.width>test.height);
    if(fiveColumns){
      const close=(values,tolerance=1)=>Math.max(...values)-Math.min(...values)<=tolerance;
      assert.ok(close(weeklyLayout.map(x=>x.card.top)),test.name+': cinco tarjetas empiezan a la misma altura');
      assert.ok(close(weeklyLayout.map(x=>x.card.height)),test.name+': cinco tarjetas mantienen igual altura');
      assert.ok(close(weeklyLayout.map(x=>x.card.width)),test.name+': cinco tarjetas mantienen igual anchura');
      assert.equal(await page.locator('#week').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),5,'Cinco columnas reales');
      assert.equal(await page.locator('#week').evaluate(e=>e.scrollWidth>e.clientWidth+1),false,'Semana completa sin desplazamiento horizontal');
      assert.equal(await page.locator('#week .week-meal-name').evaluateAll(names=>names.some(e=>e.scrollWidth>e.clientWidth+1)),false,'Nombres completos sin desbordamiento');
      assert.ok(close(weeklyLayout.map(x=>x.head.top)),test.name+': encabezados alineados arriba');
      assert.ok(close(weeklyLayout.map(x=>x.head.height)),test.name+': encabezados de altura idéntica');
      assert.ok(close(weeklyLayout.map(x=>x.first.top)),test.name+': primeras comidas alineadas arriba');
      assert.ok(weeklyLayout.every(x=>x.head.top-x.card.top<30),test.name+': encabezados pegados a la zona superior');
      assert.ok(weeklyLayout.every(x=>x.first.top>=x.head.bottom),test.name+': comidas después del encabezado');
    }

    if(test.width>=600&&test.width<=1090&&test.width>test.height){
      const size=await page.locator('#week .week-kcal-ring strong').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize));
      assert.ok(size>=10&&size<11,'Kcal ligeramente menores en anillos horizontales');
    }
    if(verticalDayCards){
      const geometry=await page.locator('#week .week-card').evaluateAll(cards=>cards.map(card=>{
        const box=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,height:r.height}};
        const title=card.querySelector('.week-card-title'),meals=card.querySelector('.week-card-meals'),ring=card.querySelector('.week-kcal-ring'),opener=card.querySelector('.week-card-open');
        return {card:box(card),title:box(title),meals:box(meals),ring:box(ring),opener:box(opener),
          writing:getComputedStyle(title).writingMode,separator:getComputedStyle(card,'::before').backgroundColor,
          rows:getComputedStyle(meals).gridTemplateRows.split(' ').length,
          overflow:[...card.querySelectorAll('.week-meal-name')].some(e=>e.scrollWidth>e.clientWidth+1)};
      }));
      assert.ok(Math.max(...geometry.map(g=>g.card.height))-Math.min(...geometry.map(g=>g.card.height))<1,'Cinco tarjetas verticales de igual altura');
      assert.ok(geometry.every(g=>g.card.height<320),'Tarjetas mucho más compactas que el diseño anterior');
      assert.ok(geometry.every(g=>g.writing==='vertical-rl'&&g.separator==='rgb(185, 108, 74)'),'Día vertical con separador terracota');
      assert.ok(geometry.every(g=>g.title.right<g.meals.left&&g.meals.right<g.ring.left),'Tres columnas sin solapamientos');
      assert.ok(geometry.every(g=>g.rows===4&&!g.overflow),'Cuatro posiciones de ingestas sin cortar nombres');
      assert.ok(geometry.every(g=>Math.abs((g.meals.top+g.meals.bottom)-(g.card.top+g.card.bottom))<2),'Comidas centradas verticalmente');
      assert.ok(geometry.every(g=>g.opener.top>=g.ring.bottom&&g.card.bottom-g.opener.bottom<15),'Icono bajo anillo en esquina inferior derecha');
      await page.locator('#week .week-card-open svg.lucide-panel-bottom-open').first().waitFor();
      await page.locator('#week .week-card-open').first().click();
      assert.equal(await page.locator('#day-modal').isVisible(),true,'Icono abre ficha individual');
      assert.equal(await page.locator('#day-dialog').evaluate(e=>getComputedStyle(e).animationName),'daily-sheet-up','Animación de apertura desde abajo');
      await page.waitForTimeout(320);
      const sheet=await page.locator('#day-dialog').boundingBox();
      assert.ok(Math.abs(sheet.y+sheet.height-test.height)<1,'Ficha desplegada desde el borde inferior');
      await page.keyboard.press('Escape');
    }else assert.equal(await page.locator('#week .week-card-open').first().isVisible(),false,'Sin nuevo control fuera del móvil vertical');
    const charts=page.locator('#weekly-charts');
    assert.equal(await charts.isVisible(),true,'Gráficos visibles para el menú');
    assert.equal(await charts.locator('figure').count(),3,'Tres gráficos');
    assert.equal(await charts.locator('.weekly-bar').count(),5,'Cinco barras');
    assert.deepEqual(await charts.locator('.chart-day-label').allTextContents(),['L','M','X','J','V']);
    const compact=test.width<700&&test.height>test.width;
    const flip=charts.locator('.weekly-chart-toggle');
    if(compact){
      assert.equal(await flip.isVisible(),true,'Control de giro en móvil vertical');
      await flip.locator('svg.lucide-iteration-cw').waitFor();
      assert.equal(await charts.locator('.weekly-pies').getAttribute('aria-hidden'),'true');
      assert.equal(await charts.locator('.weekly-pies').evaluate(e=>e.inert),true);
      const front=await charts.locator('.weekly-chart-card').boundingBox();
      assert.ok(front.height<310,'Anverso compacto sin reservar altura para los círculos');
      assert.ok(Math.abs(front.width-(await charts.boundingBox()).width)<2,'Tarjeta a todo el ancho disponible');
      await flip.focus();await page.keyboard.press('Enter');
      await page.waitForTimeout(550);
      assert.equal(await flip.getAttribute('aria-pressed'),'true');
      assert.equal(await charts.locator('.weekly-bars').evaluate(e=>e.inert),true);
      assert.equal(await charts.locator('.weekly-pies').getAttribute('aria-hidden'),'false');
      const reverse=await charts.locator('.weekly-chart-card').boundingBox();
      assert.ok(Math.abs(reverse.height-front.height)<1,'La altura no aumenta al girar a los círculos');
      const pies=await charts.locator('.weekly-pies').boundingBox();
      assert.ok(pies.y>=reverse.y&&pies.y+pies.height<=reverse.y+reverse.height+2,'Reverso completo sin recortes');
      const texts=await charts.locator('.weekly-pies .chart-legend-item').evaluateAll(items=>items.map(e=>{
       const r=e.getBoundingClientRect(),card=e.closest('.weekly-chart-card').getBoundingClientRect();
       return r.bottom<=card.bottom&&r.top>=card.top&&r.left>=card.left&&r.right<=card.right;
      }));
      assert.ok(texts.every(Boolean),'Todas las leyendas del reverso caben en la tarjeta');
      assert.equal(await charts.locator('.weekly-pies .chart-legend-item').evaluateAll(items=>{
       const b=document.querySelector('.weekly-chart-toggle').getBoundingClientRect();
       return items.some(e=>{const r=e.getBoundingClientRect();return r.left<b.right&&r.right>b.left&&r.top<b.bottom&&r.bottom>b.top});
      }),false,'El botón no tapa ninguna leyenda ni porcentaje');
      await page.screenshot({path:out+'/graficos-reverso-'+test.name+'.png',fullPage:true});
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.setViewportSize({width:320,height:740});
      await page.waitForTimeout(100);
      const narrow=await charts.locator('.weekly-chart-card').boundingBox();
      const narrowPies=await charts.locator('.weekly-pies').boundingBox();
      assert.ok(narrowPies.height<=narrow.height,'Círculos completos también en 320 px');
      await flip.click();
      const narrowFront=await charts.locator('.weekly-chart-card').boundingBox();
      assert.ok(Math.abs(narrow.height-narrowFront.height)<1,'Altura fija también en móvil pequeño');
      await page.setViewportSize({width:test.width,height:test.height});
      await page.emulateMedia({reducedMotion:'reduce'});
      assert.equal(await charts.locator('.weekly-chart-inner').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
      await page.setViewportSize({width:844,height:390});
      assert.equal(await flip.isVisible(),false,'Horizontal recupera la disposición original');
      assert.equal(await charts.locator('.weekly-pies').evaluate(e=>e.inert),false);
      await page.setViewportSize({width:test.width,height:test.height});
      assert.equal(await flip.getAttribute('aria-pressed'),'false','Regreso a vertical empieza por barras');
      await page.screenshot({path:out+'/graficos-anverso-'+test.name+'.png',fullPage:true});
    }else assert.equal(await flip.isVisible(),false,'Sin control de giro fuera de móvil vertical');
    if(compact)await flip.click();
    const geometry=await charts.evaluate(container=>{
      const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
      const bar=container.querySelector('.weekly-bars');
      const pies=[...container.querySelectorAll('.weekly-pie')];
      return {bar:rect(bar),pies:pies.map(rect),legends:pies.map(e=>rect(e.querySelector('.chart-legend'))),
        circles:pies.map(e=>rect(e.querySelector('svg'))),
        tools:rect(document.querySelector('.page-tools')),week:rect(document.querySelector('#week'))};
    });
    assert.ok(geometry.bar.y>=geometry.tools.bottom,'Gráficos debajo de selectores');
    assert.ok(geometry.pies[1].bottom<geometry.week.y,'Gráficos antes de días');
    if(test.width>=700){
      assert.ok(geometry.pies[0].x>geometry.bar.right,'Barras izquierda y pies derecha');
      assert.ok(Math.abs(geometry.bar.y-geometry.pies[0].y)<2,'Columnas alineadas arriba');
    }else if(compact){
      assert.ok(geometry.pies[0].y<geometry.bar.bottom,'Círculos ocupan el reverso, no debajo de barras');
    }else assert.ok(geometry.pies[0].y>=geometry.bar.bottom,'Pantalla estrecha horizontal apilada');
    if(compact){
      assert.ok(Math.abs(geometry.pies[0].y-geometry.pies[1].y)<1,'Dos círculos alineados en paralelo');
      assert.ok(geometry.pies[1].x>geometry.pies[0].right,'Círculos uno al lado del otro');
      assert.ok(geometry.legends.every((r,i)=>r.y>=geometry.circles[i].bottom),'Leyenda debajo de su círculo');
      const aligned=await charts.locator('.weekly-pie').evaluateAll(figures=>figures.every(f=>{
        const rows=[...f.querySelectorAll('.chart-legend-item')];
        const names=rows.map(r=>r.querySelector('.chart-legend-label').getBoundingClientRect().left);
        const percentages=rows.map(r=>r.querySelector('.chart-legend-value').getBoundingClientRect().right);
        return Math.max(...names)-Math.min(...names)<1&&Math.max(...percentages)-Math.min(...percentages)<1;
      }));
      assert.ok(aligned,'Nombres y porcentajes alineados en dos columnas por leyenda');
    }else{
      assert.ok(geometry.pies[1].y>geometry.pies[0].bottom,'Dos pies apilados');
      assert.ok(geometry.legends.every((r,i)=>r.x>=geometry.circles[i].right),'Leyendas a la derecha de cada pie');
    }
    const chartValues=await charts.evaluate(container=>{
      const source=JSON.parse(document.querySelector('#site-data').textContent).menus.find(m=>m.mes===10&&m.menu===1);
      const bars=[...container.querySelectorAll('.weekly-bar')].map(g=>({
        kcal:Number(g.dataset.kcal),heights:[...g.querySelectorAll('.weekly-bar-segment')].map(r=>Number(r.getAttribute('height'))),
        values:[...g.querySelectorAll('.weekly-bar-segment')].map(r=>Number(r.dataset.kcal)),
        colors:[...g.querySelectorAll('.weekly-bar-segment')].map(r=>getComputedStyle(r).fill)
      }));
      const goal=container.querySelector('.chart-goal');
      return {bars,expected:Object.values(source.dias).map(d=>d.nutricion.kcal),
        goal:{value:goal.dataset.kcal,dash:getComputedStyle(goal).strokeDasharray,width:getComputedStyle(goal).strokeWidth},
        pies:[...container.querySelectorAll('.weekly-pie')].map(p=>[...p.querySelectorAll('.chart-pie-slice')].reduce((n,s)=>n+Number(s.dataset.kcal),0)),
        total:source.nutricion_semana.kcal};
    });
    assert.deepEqual(chartValues.bars.map(b=>b.kcal),chartValues.expected,'Alturas basadas en kcal oficiales');
    for(const b of chartValues.bars){
      assert.ok(Math.abs(b.values.reduce((a,v)=>a+v,0)-b.kcal)<1e-7,'Apilado suma kcal oficiales');
      assert.deepEqual(b.colors,['rgb(116, 141, 118)','rgb(184, 111, 84)','rgb(208, 163, 110)'],'Colores renderizados de macros');
    }
    const references=await charts.locator('.weekly-bar-reference').evaluateAll(nodes=>nodes.map(n=>({day:n.parentNode.dataset.day,kcal:Number(n.dataset.remainingKcal),color:getComputedStyle(n).fill,title:n.querySelector('title').textContent})));
    assert.equal(references.length,1,'Solo viernes con tramo de referencia');
    assert.equal(references[0].day,'Viernes');
    assert.ok(Math.abs(references[0].kcal-(1600-chartValues.expected[4]))<1e-7,'Diferencia hasta 1600');
    assert.equal(references[0].color,'rgb(228, 222, 216)','Gris de pista diaria');
    assert.match(references[0].title,/kcal restantes hasta la referencia de 1.600 kcal/);
    assert.equal(await charts.locator('.chart-goal-label,.chart-goal-label-bg').count(),0,'Referencia sin etiqueta ni fondo');
    const labels=await charts.locator('.weekly-bar').evaluateAll(bars=>bars.map(g=>{
      const real=[...g.querySelectorAll('.weekly-bar-segment')],gray=g.querySelector('.weekly-bar-reference');
      const box=nodes=>({left:Math.min(...nodes.map(n=>n.getBBox().x)),right:Math.max(...nodes.map(n=>n.getBBox().x+n.getBBox().width)),top:Math.min(...nodes.map(n=>n.getBBox().y)),bottom:Math.max(...nodes.map(n=>n.getBBox().y+n.getBBox().height))});
      return [...g.querySelectorAll('.chart-bar-value')].map(t=>{const r=t.getBBox(),b=box(t.classList.contains('chart-reference-value')?[gray]:real);return r.x>=b.left-1&&r.x+r.width<=b.right+1&&r.y>=b.top-1&&r.y+r.height<=b.bottom+1});
    }));
    assert.ok(labels.every(items=>items.every(Boolean)),'Cifras dentro de sus tramos, sin desbordar');
    assert.deepEqual(labels.map(x=>x.length),[1,1,1,1,2],'Sin duplicar etiquetas encima');
    assert.equal(chartValues.goal.value,'1600');
    assert.notEqual(chartValues.goal.dash,'none','Objetivo discontinuo');
    assert.equal(chartValues.goal.width,'1px','Línea fina');
    assert.ok(chartValues.pies.every(v=>Math.abs(v-chartValues.total)<1e-7),'Cada circular abarca toda la semana');
    if(compact){await flip.click();assert.equal(await flip.getAttribute('aria-pressed'),'false')}
    assert.equal(await charts.locator('.weekly-charts-note').count(),0,'Sin nota bajo los gráficos');
    await page.locator('#menu-number').selectOption('2');
    assert.equal(await charts.locator('.weekly-intakes .chart-pie-slice').count(),1,'Solo desayuno registrado en menú pendiente');
    await page.locator('#month').selectOption('9');
    await page.locator('#menu-number').selectOption('4');
    const septemberTotal=await charts.locator('.weekly-intakes .chart-pie-slice').evaluateAll(slices=>slices.reduce((n,s)=>n+Number(s.dataset.kcal),0));
    assert.ok(Math.abs(septemberTotal-5643.711531804741)<1e-7,'Cambio de menú actualiza gráficos');
    await page.locator('#month').selectOption('10');
    await page.locator('#menu-number').selectOption('1');

    if(test.name==='desktop'||test.name==='mobile-horizontal'){
      const fruits=await page.locator('#site-data').evaluate(e=>{
        const short={recrQuW0jedsqM35u:'Uvas',rec4H9nVK34mLywwy:'Ciruelas',recPmxLD5hBc4rvSM:'Higos'};
        return JSON.parse(e.textContent).menus.flatMap(m=>Object.entries(m.dias).flatMap(([day,d])=>{
          return (d.postre?.componentes||(d.postre?[d.postre]:[])).flatMap(p=>p.tipo==='ingrediente'&&short[p.referencia_id]?[{month:m.mes,menu:m.menu,day,name:short[p.referencia_id],original:p.nombre}]:[]);
        }));
      });
      assert.ok(fruits.some(f=>f.name==='Uvas'),'Se prueban uvas reales de menús publicados');
      for(const fruit of fruits){
        await page.locator('#month').selectOption(String(fruit.month));
        await page.locator('#menu-number').selectOption(String(fruit.menu));
        const day=page.getByRole('button',{name:'Ver resumen de '+fruit.day,exact:true});
        const dessert=day.locator('.week-meal-row').filter({has:page.locator('.week-meal-label[aria-label="Fruta"]')});
        assert.deepEqual(await dessert.locator('.week-meal-name').allTextContents(),[fruit.name],'Fruta breve en semana');
        await day.click();
        assert.deepEqual(await page.locator('#quick-content .quick-meal').filter({has:page.getByRole('heading',{name:'Fruta',exact:true})}).locator('.quick-meal-name').allTextContents(),[fruit.name],'Fruta breve en resumen compacto');
        await page.keyboard.press('Escape');
      }
      await page.locator('#month').selectOption('10');await page.locator('#menu-number').selectOption('1');
    }
    const monday=page.locator('#week .day-button').first();
    assert.match(await monday.innerText(),/Café con leche/);
    const textMonday=await monday.innerText();assert.ok(textMonday.indexOf('Carpaccio')<textMonday.indexOf('Puerros con mayonesa')&&textMonday.indexOf('Puerros con mayonesa')<textMonday.indexOf('Bowl de yogur'),'Orden de cena');
    assert.match(await monday.innerText(),/Ciruelas/);
    assert.ok(!(await monday.innerText()).includes('Incapto'),'Nombre de café simplificado');
    assert.ok(!(await monday.innerText()).includes('Cena lunes'),'Cena sin prefijo técnico');
    assert.equal(await monday.locator('.week-kcal-ring strong').innerText(),'1488');
    assert.equal(await monday.locator('.week-kcal-ring').getAttribute('aria-label'),'1488 kcal registradas de 1600 kcal objetivo');
    assert.equal(await monday.locator('.week-meal-label').count(),5,'iconos de cinco secciones');
    assert.equal(await monday.locator('.week-meal-main').count(),2,'comida y cena con jerarquía igual');
    assert.equal(await monday.locator('.week-meal-secondary').count(),3,'desayuno, fruta y postre secundarios');
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
    if(verticalDayCards){
      for(const count of [1,2,4,6]){
        const layout=await gallery.evaluate((el,count)=>{
          const originals=[...el.children],oldClass=el.className;
          const sample=originals[0];el.replaceChildren();
          for(let i=0;i<count;i++)el.append(sample.cloneNode(true));
          el.className='batch-gallery batch-cols-'+(count===1?1:count===4?2:3);
          const style=getComputedStyle(el),width=el.getBoundingClientRect().width;
          const sizes=[...el.children].map(e=>e.getBoundingClientRect().width);
          const result={columns:style.gridTemplateColumns.split(' ').length,overflow:el.scrollWidth>el.clientWidth+1,sizes,width};
          el.replaceChildren(...originals);el.className=oldClass;return result;
        },count);
        assert.equal(layout.columns,3,'Tres columnas incluso con '+count+' miniaturas');
        assert.equal(layout.overflow,false,'Sin desbordamiento en galería vertical');
        assert.ok(layout.sizes.every(w=>w<layout.width/3+1),'Miniaturas respetan tres posiciones');
      }
    }
    assert.ok(await gallery.evaluate(el=>el.classList.contains('batch-cols-'+(el.children.length===1?1:(el.children.length%3===0||el.children.length%5===0||el.children.length%2!==0)?3:2))),'Columnas de galería correctas');
    await page.screenshot({path:out+'/semana-'+test.name+'.png',fullPage:true});
    await page.getByRole('button',{name:'Ver resumen de Lunes'}).click();
    assert.equal(await page.locator('#day-modal').isVisible(),true);
    assert.match(await page.locator('#quick-content').innerText(),/Bacalao a la vizcaína/);
    const dailyMeals=page.locator('#quick-content .quick-meal');
    assert.equal(await dailyMeals.count(),5,'Las cinco secciones del lunes');
    assert.deepEqual(await dailyMeals.locator('.quick-meal-heading').allInnerTexts(),['Desayuno','Comida','Cena','Fruta','Postre'],'Etiquetas de las ingestas');
    for(const icon of ['coffee','utensils','moon','apple','dessert'])
      assert.equal(await dailyMeals.locator('svg.lucide-'+icon).count(),1,'Icono de '+icon+' igual que en semanal');
    assert.deepEqual(await dailyMeals.nth(0).locator('.quick-meal-name').allInnerTexts(),['Café con leche'],'Desayuno simplificado');
    assert.deepEqual(await dailyMeals.nth(1).locator('.quick-group .quick-meal-name').allInnerTexts(),['Bacalao a la vizcaína','Patatas panadera'],'Solo nombres del almuerzo');
    assert.deepEqual(await dailyMeals.nth(2).locator('.quick-group .quick-meal-name').allInnerTexts(),['Carpaccio con parmesano y AOVE','Puerros con mayonesa'],'Nombres y orden de cena Airtable');
    assert.equal(await dailyMeals.locator('details,summary,.quick-group-ingredient').count(),0,'Sin desplegables ni componentes en ventana rápida');
    assert.deepEqual(await dailyMeals.nth(3).locator('.quick-meal-name').allInnerTexts(),['Ciruelas'],'Fruta sigue independiente');
    assert.deepEqual(await dailyMeals.locator('a.quick-group-recipe').evaluateAll(els=>els.map(el=>new URL(el.href).pathname)),[
      '/recetas/bacalao-a-la-vizcaina/',
      '/recetas/bowl-de-yogur-con-miel-y-granola/'
    ],'Recetas de lunes enlazadas desde grupos');
    assert.equal(await dailyMeals.nth(0).locator('a').count(),0,'Café sin enlace');
    assert.equal(await dailyMeals.nth(3).locator('a').count(),0,'Ciruelas sin enlace');
    assert.equal(await dailyMeals.nth(4).locator('a.quick-group-recipe').count(),1,'Bowl enlazado desde Postre');
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
    const thursday=page.getByRole('button',{name:'Ver resumen de Jueves'});
    assert.deepEqual(await thursday.locator('.week-meal-slot-cena .week-meal-name').allTextContents(),['Tostas de hummus y sardinillas'],'Tostas como una única receta semanal');
    await page.getByRole('button',{name:'Ver resumen de Jueves'}).click();
    assert.deepEqual(await page.locator('#quick-content a.quick-group-recipe').evaluateAll(els=>els.map(el=>new URL(el.href).pathname)),[
      '/recetas/canelones-de-carrilleras/',
      '/recetas/tostas-de-hummus-y-sardinillas/'
    ],'Jueves: preparaciones enlazadas');
    await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'Ver resumen de Viernes'}).click();
    assert.equal(await page.locator('#quick-content .quick-meal').count(),3,'Viernes sin postre');
    assert.deepEqual(await page.locator('#quick-content .quick-meal').last().locator('.quick-meal-name').allInnerTexts(),['Noche libre'],'Cena libre');
    assert.equal(await page.locator('#quick-content .quick-meal-free .free-night-band').evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(229, 235, 225)','Banda salvia compacta');
    await page.screenshot({path:out+'/noche-libre-compacta-'+test.name+'.png'});
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
    assert.match(await page.locator('#daily-content').innerText(),/Carrilleras de cerdo al vino/);
    assert.match(await page.locator('#daily-content').innerText(),/Boniato al horno/);
    assert.ok(!(await page.locator('#daily-content').innerText()).includes('Carrilleras al vino con boniato al horno'),'Sin título completo redundante');
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
        const principal=page.locator('.daily-component').filter({hasText:'Carrilleras de cerdo al vino'}).first();
    assert.equal(await principal.locator('details').count(),0,'Preparación única sin desplegable');
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
        const dinnerGroups=page.locator('.daily-meal').filter({has:page.locator('.daily-meal-title > span:text-is("Cena")')}).locator('.culinary-group');
    assert.deepEqual(await dinnerGroups.locator('summary > .component-name').allInnerTexts(),[
      'Puerros con mayonesa'
    ],'Página completa respeta orden definitivo del lunes');
    await dinnerGroups.first().locator('summary').click();
    assert.equal(await dinnerGroups.first().locator('.ingredient-line').count(),2,'Despliegue de puerros y mayonesa');
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
    const searchAlignment=await page.locator('#search').evaluate(input=>{const a=input.getBoundingClientRect(),b=document.querySelector('#recipe-catalog').getBoundingClientRect();return {left:Math.abs(a.left-b.left),right:Math.abs(a.right-b.right),overflow:document.documentElement.scrollWidth>innerWidth+2}});
    assert.ok(searchAlignment.left<2&&searchAlignment.right<2,test.name+': buscador alineado con ambos bordes del recetario');
    assert.equal(searchAlignment.overflow,false,'Buscador sin desbordamiento');
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

  // Preparación publicada sin slug en el JSON: resolver enlace exacto en presentación.
  for(const width of [390,1440]){
    const page=await browser.newPage({viewport:{width,height:900}});
    page.on('pageerror',e=>issues.push('tostas: '+e.message));
    await page.goto('http://127.0.0.1:8765/menus/10-1/jueves/');
    const dinner=page.locator('.daily-meal').filter({has:page.locator('.daily-meal-title > span:text-is("Cena")')});
    assert.equal(await dinner.locator('.daily-component').count(),1,'Cena con una sola receta');
    const link=dinner.getByRole('link',{name:'Tostas de hummus y sardinillas',exact:true});
    assert.match(await link.getAttribute('href'),/recetas\/tostas-de-hummus-y-sardinillas\/$/);
    assert.equal(await dinner.locator('details').count(),0,'Receta única sin desplegable');
    assert.equal(await dinner.locator('.component-amount').innerText(),'1 ración');
    await link.click();
    assert.equal(await page.locator('h1[itemprop="name"]').innerText(),'Tostas de hummus y sardinillas','Enlace abre ficha publicada');
    await page.close();
  }

  // Cena libre: tratamiento exclusivo de las vistas diarias y referencia sin negativos.
  for(const width of [390,820,1440]){
    const page=await browser.newPage({viewport:{width,height:950}});
    page.on('pageerror',e=>issues.push('noche libre: '+e.message));
    await page.goto('http://127.0.0.1:8765/menus/10-1/viernes/');
    const free=page.locator('.daily-meal-free');
    await free.locator('svg.lucide-moon-star').waitFor();
    assert.equal(await free.locator('.daily-meal-title > span').innerText(),'Cena');
    assert.equal(await free.locator('.free-night-title').innerText(),'Noche libre');
    assert.equal(await free.locator('.free-night-note').innerText(),'Sin planificación nutricional');
    assert.equal(await free.locator('.daily-meal-kcal,.component-nutrition,.component-amount').count(),0,'Cena libre sin valores inventados');
    assert.equal(await free.locator('.free-night-band').evaluate(n=>getComputedStyle(n).backgroundColor),'rgb(229, 235, 225)');
    const heights=await page.locator('.daily-meal').evaluateAll(nodes=>nodes.map(n=>({free:n.classList.contains('daily-meal-free'),height:n.getBoundingClientRect().height})));
    assert.ok(heights.find(n=>n.free).height<heights.find(n=>!n.free).height,'Cena libre más baja');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Cena libre sin desbordamiento');
    await page.screenshot({path:out+'/noche-libre-ampliada-'+width+'.png',fullPage:true});
    await page.goto('http://127.0.0.1:8765/');
    await page.locator('#weekly-charts .weekly-bar').first().waitFor();
    const checks=await page.evaluate(()=>{
      const container=document.querySelector('#weekly-charts');
      const source=JSON.parse(document.querySelector('#site-data').textContent).menus.find(m=>m.mes===10&&m.menu===1);
      return [1600,1800].map(kcal=>{
        const variant=structuredClone(source);variant.dias.Viernes.nutricion.kcal=kcal;
        const data=MiruWeeklyCharts.model(variant,[]);MiruWeeklyCharts.render(container,data);
        return {gray:container.querySelectorAll('.weekly-bar-reference').length,real:Number(container.querySelector('[data-day="Viernes"]').dataset.kcal)};
      });
    });
    assert.deepEqual(checks,[{gray:0,real:1600},{gray:0,real:1800}],'Viernes de 1600 o más sin tramo gris');
    await page.close();
  }

  // Caso de aceptación aportado por la usuaria: principal enlazado + dos guarniciones.
  for(const width of [1440,390]){
    const page=await browser.newPage({viewport:{width,height:900}});
    page.on('pageerror',e=>issues.push('componentes: '+e.message));
    await page.goto('http://127.0.0.1:8765/menus/09-3/lunes/');
    const payload=await page.locator('#daily-data').evaluate(node=>JSON.parse(node.textContent));
    const meal=page.locator('.daily-meal').filter({has:page.locator('.daily-meal-title > span:text-is("Comida")')});
    assert.equal(await meal.locator('h3').count(),0,'Sin nombre compuesto redundante');
    assert.ok(!(await meal.innerText()).includes(payload.dia.comida.nombre),'Título completo eliminado');
    const components=meal.locator('.daily-component');
    assert.equal(await components.count(),3,'Tres componentes culinarios');
    assert.equal(await components.first().locator('details').count(),0,'Albóndigas sin desplegable');
    assert.equal(await components.first().locator('.component-name').innerText(),'Albóndigas en salsa rubia');
    assert.equal(await components.first().locator('.component-amount').innerText(),'1 ración');
    assert.match(await components.first().locator('a').getAttribute('href'),/recetas\/albondigas-en-salsa-rubia\/$/);
    assert.deepEqual(await meal.locator('summary > .component-name').allTextContents(),['Patatas panadera','Ensalada de tomate y cebolla']);
    const values=await meal.locator('.component-nutrition').evaluateAll(nodes=>nodes.map(node=>Number(node.dataset.kcal)));
    assert.equal(values.length,3,'Nutrición debajo de cada componente');
    assert.ok(Math.abs(values.reduce((a,b)=>a+b,0)-payload.dia.comida.nutricion.kcal)<.11,'Aportaciones suman el total oficial');
    const renderedColors=await meal.locator('.component-nutrition').first().evaluate(node=>[...node.querySelectorAll('.component-macro')].map(x=>getComputedStyle(x).color));
    assert.deepEqual(renderedColors,['rgb(116, 141, 118)','rgb(184, 111, 84)','rgb(208, 163, 110)'],'Cantidades en los colores oficiales de macros');
    assert.ok(await meal.locator('.component-kcal').evaluateAll(nodes=>nodes.every(n=>Number(getComputedStyle(n).fontWeight)>=600)),'Kcal de componentes en negrita');
    for(const section of await page.locator('.daily-meal').all()){
      const title=section.locator('.daily-meal-title');
      if(await title.locator('.daily-meal-kcal').count()){
        const geometry=await title.evaluate(node=>{const a=node.firstChild.getBoundingClientRect(),b=node.lastChild.getBoundingClientRect(),r=node.getBoundingClientRect();return {bottom:Math.abs(a.bottom-r.bottom),top:Math.abs(b.top-r.top),separated:b.bottom<a.top,styles:[...node.children].map(x=>getComputedStyle(x).writingMode),border:getComputedStyle(node).borderRightWidth}});
        assert.ok(geometry.bottom<2&&geometry.top<2&&geometry.separated,'Nombre abajo y kcal arriba del lateral');
        assert.deepEqual(geometry.styles,['vertical-rl','vertical-rl'],'Etiqueta y kcal giradas');
        assert.equal(geometry.border,'2px','Separador lateral');
        const hierarchy=await title.evaluate(n=>{const a=getComputedStyle(n.firstChild),b=getComputedStyle(n.lastChild);return {size:parseFloat(b.fontSize)/parseFloat(a.fontSize),titleWeight:Number(a.fontWeight),kcalWeight:Number(b.fontWeight)}});
        assert.ok(hierarchy.size<=.8&&hierarchy.kcalWeight===400&&hierarchy.titleWeight>hierarchy.kcalWeight,'Kcal laterales más pequeñas y ligeras que el título');
      }
    }
    assert.match(await page.locator('.daily-meal').first().locator('.component-name').innerText(),/^Café con leche$/,'Café abreviado');
    assert.equal(await page.locator('.daily-meal h2 svg').count(),0,'Ingestas sin iconos en ampliada');
    await meal.locator('summary').first().click();
    assert.equal(await components.nth(1).locator('.ingredient-line').count(),2,'Patata y AOVE desplegables');
    await meal.locator('summary').last().click();
    assert.equal(await components.nth(2).locator('.ingredient-line').count(),3,'Ensalada muestra sus tres ingredientes');
    assert.ok(await page.locator('.daily-page-main .ingredient-line').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).borderBottomWidth==='0px')),'Sin líneas divisorias en ingredientes');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Sin desbordamiento');
    const dinner=page.locator('.daily-meal').filter({has:page.locator('.daily-meal-title > span:text-is("Cena")')});
    await dinner.locator('summary').click();
    assert.ok((await dinner.innerText()).includes('Huevos'), 'Huevos con nombre breve');
    assert.ok((await dinner.innerText()).includes('2 unidades'), 'Dos huevos en unidades');
    assert.ok((await dinner.innerText()).includes('Pan de molde'), 'Pan genérico');
    assert.ok((await dinner.innerText()).includes('1 rebanada'), 'Cantidad culinaria original');
    assert.ok(!/Oroweat|Nuestra Alacena|Dia Láctea|entero crudo/.test(await dinner.innerText()), 'Sin marcas ni nombres técnicos');
    const hierarchy=await components.first().evaluate(n=>({name:parseFloat(getComputedStyle(n.querySelector('.component-name')).fontSize),nutrition:parseFloat(getComputedStyle(n.querySelector('.component-nutrition')).fontSize)}));
    assert.ok(hierarchy.nutrition<hierarchy.name*.8,'Nutrición subordinada al nombre');
    await page.screenshot({path:out+'/dia-componentes-'+width+'.png',fullPage:true});
    await page.close();
  }

  // Respuestas aisladas: las cuatro combinaciones y compatibilidad con postres únicos v2.
  for(const width of [1440,390]){
    for(const variant of [
      {ingredient:true,legacy:true},{prep:true,legacy:true,linked:true,raciones:1},
      {ingredient:true},{prep:true,linked:true,raciones:0.5},
      {prep:true,linked:false,raciones:2},{ingredient:true,prep:true,linked:true,raciones:1},{}
    ]){
      const page=await browser.newPage({viewport:{width,height:900}});
      page.on('pageerror',e=>issues.push('postres: '+e.message));
      const expectedCount=Number(Boolean(variant.ingredient))+Number(Boolean(variant.prep));
      const expectedIcons=[...(variant.ingredient?['apple']:[]),...(variant.prep?['dessert']:[])];
      const makePost=original=>{
        const ingredient=original?.componentes?.find(x=>x.tipo==='ingrediente')||original;
        const components=[];
        if(variant.ingredient)components.push(ingredient);
        if(variant.prep)components.push({
          tipo:'preparacion',referencia_id:'rec-postre-qa',
          nombre:variant.linked?'Bowl de yogur con miel y granola':'Postre sin ficha pública',
          raciones:variant.raciones,estado:'Calculado',nutricion:ingredient.nutricion,
          ...(variant.linked?{slug:'bowl-de-yogur-con-miel-y-granola'}:{})
        });
        return components.length?(variant.legacy?components[0]:{componentes:components}):null;
      };
      await page.route('http://127.0.0.1:8765/',async route=>{
        const response=await route.fetch();let html=await response.text();
        html=html.replace(/(<script type="application\/json" id="site-data">)([\s\S]*?)(<\/script>)/,(all,a,json,b)=>{
          const data=JSON.parse(json),menu=data.menus.find(m=>m.mes===10&&m.menu===1);
          menu.dias.Lunes.postre=makePost(menu.dias.Lunes.postre);
          for(const day of Object.values(menu.dias)){
            for(const kind of ['comida','cena']){
              const pres=day[kind].presentacion;if(!pres)continue;
              pres.grupos=pres.grupos.filter(g=>!g.elementos.some(e=>e.slug==='bowl-de-yogur-con-miel-y-granola'));
              pres.elementos_sin_grupo=pres.elementos_sin_grupo.filter(e=>e.slug!=='bowl-de-yogur-con-miel-y-granola');
            }
          }
          data.preparaciones.find(p=>p.slug==='bowl-de-yogur-con-miel-y-granola').batchcooking=true;
          return a+JSON.stringify(data).replace(/</g,'\\u003c')+b;
        });
        await route.fulfill({response,body:html});
      });
      await page.goto('http://127.0.0.1:8765/');
      await page.locator('#month').selectOption('10');await page.locator('#menu-number').selectOption('1');
      const monday=page.locator('#week .day-button').first();
      const rows=monday.locator('.week-desserts .week-meal-row');
      assert.equal(await rows.count(),expectedCount,'Un componente semanal por postre');
      for(const icon of expectedIcons)await rows.locator('svg.lucide-'+icon).waitFor({state:'visible'});
      assert.equal(await rows.locator('svg').count(),expectedCount,'Sin iconos duplicados');
      assert.equal(await rows.locator('.week-meal-label[aria-label="Fruta"]').count(),variant.ingredient?1:0,'Fruta semanal independiente');
      assert.equal(await rows.locator('.week-meal-label[aria-label="Postre"]').count(),variant.prep?1:0,'Postre semanal independiente');
      if(expectedCount===2){const first=await rows.first().boundingBox(),second=await rows.last().boundingBox();assert.ok(first.y+first.height<=second.y+1,'Los dos postres no se superponen');}
      const batchDessert=page.locator('#batch a[href$="/recetas/bowl-de-yogur-con-miel-y-granola/"]');
      assert.equal(await batchDessert.count(),variant.linked?1:0,'Batch cooking incluye una vez el postre de preparación');
      await monday.click();
      const fruit=page.locator('#quick-content .quick-meal').filter({has:page.getByRole('heading',{name:'Fruta',exact:true})});
      const post=page.locator('#quick-content .quick-meal').filter({has:page.getByRole('heading',{name:'Postre',exact:true})});
      assert.equal(await fruit.count(),variant.ingredient?1:0,'Fruta compacta solo para ingrediente');
      assert.equal(await post.count(),variant.prep?1:0,'Postre compacto solo para preparación');
      if(variant.ingredient){
        await fruit.locator('.quick-meal-heading svg.lucide-apple').waitFor({state:'visible'});
        assert.equal(await fruit.locator('.quick-meal-name').count(),1,'Solo la fruta en su sección');
        assert.equal(await fruit.locator('a').count(),0,'Fruta sin enlace de receta');
      }
      if(variant.prep){
        await post.locator('.quick-meal-heading svg.lucide-dessert').waitFor({state:'visible'});
        assert.equal(await post.locator('.quick-meal-name').count(),1,'Solo la preparación en Postre');
      }
      assert.equal(await post.locator('a').count(),variant.linked?1:0,'Solo preparación publicada enlazada');
      assert.equal(await post.locator('details').count(),0,'Compacta sin desplegables');
      if(variant.linked)assert.match(await post.locator('a').getAttribute('href'),/recetas\/bowl-de-yogur-con-miel-y-granola\/$/);
      await page.route('http://127.0.0.1:8765/menus/10-1/lunes/',async route=>{
        const response=await route.fetch();let html=await response.text();
        html=html.replace(/(<script type="application\/json" id="daily-data">)([\s\S]*?)(<\/script>)/,(all,a,json,b)=>{
          const data=JSON.parse(json);data.dia.postre=makePost(data.dia.postre);
          return a+JSON.stringify(data).replace(/</g,'\\u003c')+b;
        });
        await route.fulfill({response,body:html});
      });
      await page.goto('http://127.0.0.1:8765/menus/10-1/lunes/');
      const dailyFruit=page.locator('.daily-meal').filter({has:page.locator('.daily-meal-title > span:text-is("Fruta")')});
      const dailyPost=page.locator('.daily-meal').filter({has:page.locator('.daily-meal-title > span:text-is("Postre")')});
      assert.equal(await dailyFruit.count(),variant.ingredient?1:0,'Fruta ampliada solo para ingrediente');
      assert.equal(await dailyPost.count(),variant.prep?1:0,'Postre ampliado solo para preparación');
      if(variant.ingredient){
        assert.equal(await dailyFruit.locator('h2 svg').count(),0,'Fruta ampliada sin icono');
        assert.equal(await dailyFruit.locator('.ingredient-line').count(),1,'Fruta independiente');
        assert.equal(await dailyFruit.locator('a').count(),0,'Fruta sin receta');
      }
      if(variant.prep){
        assert.equal(await dailyPost.locator('h2 svg').count(),0,'Postre ampliado sin icono');
        assert.equal(await dailyPost.locator('.ingredient-line').count(),1,'Postre independiente');
        assert.equal(await dailyPost.locator('.ingredient-line strong').innerText(),
          (variant.raciones===0.5?'0,5':String(variant.raciones))+' '+(variant.raciones===1?'ración':'raciones'));
        assert.ok(!(await dailyPost.innerText()).includes('NaN'),'Raciones válidas');
      }
      assert.equal(await dailyPost.locator('a').count(),variant.linked?1:0,'Enlace de receta independiente');
      if(variant.ingredient&&variant.prep){
        const first=await dailyFruit.boundingBox(),second=await dailyPost.boundingBox();
        assert.ok(first.y+first.height<second.y,'Dos secciones visualmente separadas');
        await page.screenshot({path:out+'/fruta-postre-'+width+'.png',fullPage:true});
      }
      await page.close();
    }
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
