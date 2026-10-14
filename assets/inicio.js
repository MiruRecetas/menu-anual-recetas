(()=>{'use strict';
const site='https://mirurecetas.github.io/menu-anual-recetas';
const months={1:'Enero',2:'Febrero',3:'Marzo',4:'Abril',5:'Mayo',6:'Junio',9:'Septiembre',10:'Octubre',11:'Noviembre',12:'Diciembre'};
const days=['Lunes','Martes','Miércoles','Jueves','Viernes'];
const data=JSON.parse(document.querySelector('#site-data').textContent);
const menus=data.menus||[],recipes=data.recetas||[];
const $=s=>document.querySelector(s);
const el=(tag,txt,cls)=>{const x=document.createElement(tag);if(txt!==undefined)x.textContent=txt;if(cls)x.className=cls;return x};
const fmt=n=>Number(n).toLocaleString('es-ES',{maximumFractionDigits:0});
const select=$('#month');
for(const month of [9,10,11,12,1,2,3,4,5,6]){const o=el('option',months[month]);o.value=month;select.append(o)}
const available=menus.find(m=>m.schema_version===2);
select.value=available?.mes||10;
if(available)$('#menu-number').value=available.menu;
try{const stored=JSON.parse(localStorage.getItem('miru-menu'));if(stored&&months[stored.mes]&&stored.menu>=1&&stored.menu<=4&&menus.some(x=>x.mes===Number(stored.mes)&&x.menu===Number(stored.menu))){select.value=stored.mes;$('#menu-number').value=stored.menu}}catch{}
const menuQuery=new URLSearchParams(location.search);const requested=menus.find(x=>x.mes===Number(menuQuery.get('mes'))&&x.menu===Number(menuQuery.get('menu')));if(requested){select.value=requested.mes;$('#menu-number').value=requested.menu;}
const modal=$('#day-modal'),dialog=$('#day-dialog'),close=$('#close-day'),content=$('#quick-content');let origin=null;
const dessertComponents=x=>x?.componentes||(x?[x]:[]);
const MEAL_ICONS={Desayuno:'coffee',Comida:'utensils',Cena:'moon',Fruta:'apple',Postre:'dessert'};
const mealIcon=(kind,item)=>kind==='Postre'&&item?.tipo==='preparacion'?'dessert':MEAL_ICONS[kind];
// Nombres de presentación para frutas directas de los menús; fuente nutricional intacta.
const FRUIT_NAMES={recrQuW0jedsqM35u:'Uvas',rec4H9nVK34mLywwy:'Ciruelas',recPmxLD5hBc4rvSM:'Higos'};
const ingredientName=item=>item?.tipo==='ingrediente'?(FRUIT_NAMES[item.referencia_id]||item.nombre||''):(item?.nombre||'');
// Solo se enlazan recetas publicadas y relacionadas mediante las referencias del menú.
const cleanRecipeName=name=>String(name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es').replace(/\s+/g,' ').trim();
function relatedRecipes(meal){
 if(!meal||meal.estado==='libre')return [];
 const refs=[];
 if(meal.tipo==='preparacion')refs.push(meal);
 const presentation=meal.presentacion;
 for(const group of presentation?.grupos||[])refs.push(...(group.elementos||[]));
 refs.push(...(presentation?.elementos_sin_grupo||[]));
 const found=new Map();
 for(const ref of refs){
  if(ref.tipo!=='preparacion')continue;
  // Si falta slug en el menú, solo se admite coincidencia exacta con la ficha pública.
  const recipe=ref.slug
   ?recipes.find(r=>r.slug===ref.slug)
   :recipes.find(r=>cleanRecipeName(r.nombre)===cleanRecipeName(ref.nombre));
  if(recipe)found.set(recipe.slug,recipe);
 }
 return [...found.values()];
}
function matchSummaryRecipe(name,names,available){
 if(!available.length)return null;
 if(names.length===1&&available.length===1)return available[0];
 const short=cleanRecipeName(name);
 const matches=available.filter(r=>cleanRecipeName(r.nombre).startsWith(short));
 return matches.length===1?matches[0]:null;
}
function compactRecipeRow(name,recipe){
 const wrap=el('div',undefined,'quick-group');
 wrap.append(el('span',name,'quick-meal-name'));
 if(recipe){
  const link=el('a','↗','quick-group-recipe');
  link.href=site+'/recetas/'+encodeURIComponent(recipe.slug)+'/';
  link.setAttribute('aria-label','Abrir receta: '+recipe.nombre);
  link.title='Abrir receta: '+recipe.nombre;
  wrap.append(link);
 }
 return wrap;
}
function displayGroup(g){
 const prepItems=g.elementos.filter(item=>item.tipo==='preparacion');
 const prep=prepItems.length===1?prepItems[0]:null;
 const recipe=prep?(recipes.find(r=>r.slug===prep.slug)||recipes.find(r=>cleanRecipeName(r.nombre)===cleanRecipeName(prep.nombre))):null;
 return compactRecipeRow(g.nombre,recipe);
}
function summary(kind,meal,day){
 const box=el('section',undefined,'quick-meal');
 const heading=el('h3',undefined,'quick-meal-heading');
 const symbol=el('i');
 symbol.setAttribute('data-lucide',mealIcon(kind,meal));
 symbol.setAttribute('aria-hidden','true');
 heading.append(symbol);
 heading.append(el('span',kind));
 const namesContainer=el('div',undefined,'quick-meal-names');
 if(kind==='Fruta'||kind==='Postre'){
  const recipe=meal?.tipo==='preparacion'?recipes.find(r=>r.slug===meal.slug):null;
  namesContainer.append(compactRecipeRow(ingredientName(meal),recipe));
 }else if(meal?.presentacion&&(meal.presentacion.grupos.length||meal.presentacion.elementos_sin_grupo.length)){
  for(const g of [...meal.presentacion.grupos].sort((a,b)=>a.orden-b.orden))namesContainer.append(displayGroup(g));
  for(const item of meal.presentacion.elementos_sin_grupo)namesContainer.append(displayGroup({nombre:ingredientName(item),elementos:[item]}));
 }else{
  const names=meal?compactName(kind,meal,day):['Sin asignar'];
  const available=relatedRecipes(meal);
  for(const name of names)namesContainer.append(compactRecipeRow(name,matchSummaryRecipe(name,names,available)));
 }
 if(kind==='Cena'&&meal?.estado==='libre'){box.classList.add('quick-meal-free');namesContainer.classList.add('free-night-band')}
 box.append(heading,namesContainer);return box;
}
function dismiss(){modal.hidden=true;document.body.classList.remove('modal-open');origin?.focus()}
// Mismos objetivos, segmentos de energía y porcentajes que la ficha diaria ampliada.
const MACRO_GOALS={proteinas_g:93,hidratos_g:147,grasas_g:65};
function dailyNutrition(nut){
 const group=el('section',undefined,'daily-nutrition');
 group.setAttribute('aria-label','Resumen nutricional del día');
 const kcal=Math.max(0,Number(nut.kcal)||0);
 const ratio=Math.min(1,kcal/GOAL_KCAL);
 const entries=[
  {label:'Proteínas',key:'proteinas_g',factor:4,goal:MACRO_GOALS.proteinas_g,kind:'protein'},
  {label:'Hidratos',key:'hidratos_g',factor:4,goal:MACRO_GOALS.hidratos_g,kind:'carbs'},
  {label:'Grasas',key:'grasas_g',factor:9,goal:MACRO_GOALS.grasas_g,kind:'fat'}
 ];
 const energyByMacro=entries.map(item=>Math.max(0,Number(nut[item.key])||0)*item.factor);
 const totalEnergy=energyByMacro.reduce((a,b)=>a+b,0);
 const circumference=2*Math.PI*49;
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 120 120');svg.setAttribute('aria-hidden','true');
 const circle=(cls,offset,len)=>{
  const node=document.createElementNS('http://www.w3.org/2000/svg','circle');
  node.setAttribute('cx','60');node.setAttribute('cy','60');node.setAttribute('r','49');
  node.setAttribute('class',cls);
  if(len!==undefined){
   node.setAttribute('stroke-dasharray',len+' '+circumference);
   node.setAttribute('stroke-dashoffset',String(-offset));
  }
  svg.append(node);
 };
 circle('daily-energy-track');
 const energy=el('div',undefined,'daily-energy');
 const ring=el('div',undefined,'daily-energy-ring daily-macro-ring');
 ring.setAttribute('aria-label',fmt(kcal)+' kcal de '+GOAL_KCAL+' kcal, con reparto energético en proteínas, hidratos y grasas');
 const fractions=energyByMacro.map(v=>totalEnergy>0?v/totalEnergy:0);
 let start=0;
 for(let i=0;i<entries.length;i++){
  const arc=circumference*ratio*fractions[i];
  if(arc>0)circle('daily-macro-arc daily-macro-arc-'+entries[i].kind,start,arc);
  start+=arc;
 }
 ring.append(svg);
 const center=el('span',undefined,'daily-energy-center');
 center.append(el('strong',fmt(kcal)),el('span','kcal'),el('small','de '+GOAL_KCAL));
 ring.append(center);energy.append(ring);
 const macros=el('div',undefined,'daily-macros');
 for(const item of entries){
  const grams=Math.max(0,Number(nut[item.key])||0);
  const fulfillment=100*grams/item.goal;
  const row=el('div',undefined,'daily-macro daily-macro-'+item.kind);
  row.setAttribute('aria-label',item.label+': '+fmt(grams)+' de '+item.goal+' gramos, '+Math.round(fulfillment)+' por ciento del objetivo diario');
  const top=el('div',undefined,'daily-macro-head');
  const label=el('span',item.label,'daily-macro-name');
  const values=el('span',undefined,'daily-macro-values');
  values.append(el('strong',fmt(grams)+' g'),el('small',Math.round(fulfillment)+'%'));
  top.append(label,values);
  const track=el('div',undefined,'daily-macro-track');
  const bar=el('div',undefined,'daily-macro-fill');
  bar.style.width=Math.min(100,fulfillment)+'%';
  track.append(bar);row.append(top,track);macros.append(row);
 }
 macros.append(el('p','Barras: % del objetivo diario · PR 93 g · HC 147 g · GR 65 g','daily-macro-note'));
 group.append(energy,macros);return group;
}
function open(day,menu,button){origin=button;content.replaceChildren();const heading=el('span',undefined,'eyebrow day-context');heading.append(document.createTextNode(months[menu.mes]+' · Menú '+menu.menu+' · '),el('strong',day,'day-context-name'));content.append(heading);const d=menu.dias[day];const nut=d.nutricion;content.append(dailyNutrition(nut));if(d.comida?.estado==='pendiente'||d.cena?.estado==='pendiente')content.append(el('p','Total parcial: faltan ingestas por registrar.','muted small'));content.append(summary('Desayuno',d.desayuno,day),summary('Comida',d.comida,day),summary('Cena',d.cena,day));for(const component of dessertComponents(d.postre))content.append(summary(component.tipo==='ingrediente'?'Fruta':'Postre',component,day));if(day==='Viernes')content.append(el('p','La cena libre no se incluye en el total.','muted small'));$('#expand-day').href=site+'/menus/'+String(menu.mes).padStart(2,'0')+'-'+menu.menu+'/'+day.toLowerCase()+'/';if(window.lucide?.createIcons)window.lucide.createIcons();modal.hidden=false;document.body.classList.add('modal-open');close.focus()}
close.addEventListener('click',dismiss);
modal.addEventListener('click',e=>{if(e.target===modal)dismiss()});
document.addEventListener('keydown',e=>{if(modal.hidden)return;if(e.key==='Escape')dismiss();if(e.key==='Tab'){const focusable=[...dialog.querySelectorAll('button:not([disabled]),a[href]')];const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
const GOAL_KCAL=1600;
function compactName(kind,item,day){
 if(item?.estado==='libre')return ['Noche libre'];
 if(item?.estado==='pendiente')return ['Pendiente de asignar'];
 const original=ingredientName(item);
 if(kind==='Desayuno'&&/^Café con leche/i.test(original))return ['Café con leche'];
 if(kind==='Cena'){
  if(day==='Lunes'&&original==='Carpaccio y puerros con mayonesa')return ['Carpaccio','Puerros con mayonesa'];
  if(day==='Lunes'&&/Bowl de yogur, carpaccio y puerros con mayonesa/i.test(original))
   return ['Carpaccio','Puerros con mayonesa','Bowl de yogur'];
  if(day==='Martes'&&/Mini wraps de falafel con boquerones aliñados/i.test(original))
   return ['Mini wraps de falafel','Boquerones aliñados'];
  if(day==='Miércoles')return [original.replace(/\s*\(2 raciones\)\s*$/i,'')];
 }
 return [original];
}
function calorieRing(kcal){
 const val=Math.round(kcal),ratio=Math.max(0,Math.min(1,kcal/GOAL_KCAL)),r=26,circ=2*Math.PI*r;
 const ring=el('span',undefined,'week-kcal-ring');
 ring.setAttribute('aria-label',val+' kcal registradas de '+GOAL_KCAL+' kcal objetivo');
 ring.title=val+' de '+GOAL_KCAL+' kcal';
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 64 64');svg.setAttribute('aria-hidden','true');
 for(const [cls,offset] of [['ring-track',0],['ring-progress',circ*(1-ratio)]]){
  const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
  c.setAttribute('class',cls);c.setAttribute('cx','32');c.setAttribute('cy','32');c.setAttribute('r',String(r));
  if(cls==='ring-progress'){c.setAttribute('stroke-dasharray',String(circ));c.setAttribute('stroke-dashoffset',String(offset))}
  svg.append(c);
 }
 const center=el('span',undefined,'ring-center-text');
 center.append(el('strong',String(val)),el('small','kcal'));ring.append(svg,center);
 return ring;
}
function mealRow(kind,item,day){
 const row=el('div',undefined,'week-meal-row');
 const label=el('span',undefined,'week-meal-label');const symbol=el('i');symbol.setAttribute('data-lucide',mealIcon(kind,item));symbol.setAttribute('aria-hidden','true');label.append(symbol);label.setAttribute('aria-label',kind);label.title=kind;
 const names=el('span',undefined,'week-meal-names');
 for(const name of compactName(kind,item,day))names.append(el('span',name,'week-meal-name'));
 row.classList.add('week-meal-slot-'+kind.toLowerCase(),kind==='Comida'||kind==='Cena'?'week-meal-main':'week-meal-secondary');if(item?.estado==='libre')row.classList.add('week-meal-free');row.append(label,names);
 return row;
}
function recipeLink(slug){const match=recipes.find(r=>r.slug===slug),a=el('a',match?.nombre||slug);a.href=site+'/recetas/'+slug+'/';return a}
const nutritionToggle=$('#toggle-weekly-nutrition');
let nutritionVisible=false;
function syncNutritionVisibility(){
 const charts=$('#weekly-charts');
 const available=charts.childElementCount>0;
 charts.hidden=!available||!nutritionVisible;
 nutritionToggle.disabled=!available;
 nutritionToggle.setAttribute('aria-expanded',String(!charts.hidden));
 nutritionToggle.textContent=charts.hidden?'Ver información nutricional':'Ocultar información nutricional';
}
nutritionToggle.addEventListener('click',()=>{nutritionVisible=!nutritionVisible;syncNutritionVisibility()});
const verticalCards=window.matchMedia('(max-width:700px) and (orientation:portrait)');
let weekObserver;
function equalizeWeekCards(){
 const week=$('#week');
 if(!verticalCards.matches){week.style.removeProperty('--week-card-height');return}
 const heights=[...week.querySelectorAll('.week-card')].map(card=>{
  const style=getComputedStyle(card);
  const padding=parseFloat(style.paddingTop)+parseFloat(style.paddingBottom)+parseFloat(style.borderTopWidth)+parseFloat(style.borderBottomWidth);
  return Math.max(104,card.querySelector('.week-card-meals').offsetHeight)+padding;
 });
 if(heights.length)week.style.setProperty('--week-card-height',Math.ceil(Math.max(...heights))+'px');
}
function syncWeekCards(week){
 weekObserver?.disconnect();
 weekObserver=new ResizeObserver(equalizeWeekCards);
 for(const meals of week.querySelectorAll('.week-card-meals'))weekObserver.observe(meals);
 equalizeWeekCards();
}
verticalCards.addEventListener('change',equalizeWeekCards);
function week(){const mes=Number(select.value),num=Number($('#menu-number').value),m=menus.find(x=>x.mes===mes&&x.menu===num),w=$('#week'),b=$('#batch');try{localStorage.setItem('miru-menu',JSON.stringify({mes,menu:num}))}catch{}w.replaceChildren();b.replaceChildren();const purchase=$('#menu-shopping');if(purchase){const key=String(mes).padStart(2,'0')+'-'+num;const url=data.compras?.[key];purchase.hidden=!url;if(url)purchase.href=url;else purchase.removeAttribute('href');}const charts=$('#weekly-charts');charts.replaceChildren();syncNutritionVisibility();
if(!m){w.append(el('p','Este menú aún no está publicado.','empty-state'));b.textContent='No hay preparaciones publicadas.';return}
if(m.schema_version!==2){w.append(el('p','Este menú utiliza un formato antiguo y necesita actualización.','empty-state'));b.textContent='Pendiente de actualización.';return}
if(window.MiruWeeklyCharts)window.MiruWeeklyCharts.render(charts,window.MiruWeeklyCharts.model(m,recipes));
syncNutritionVisibility();
for(const day of days){const d=m.dias[day],button=el('button',undefined,'day day-button week-card');button.type='button';button.setAttribute('aria-label','Ver resumen de '+day);const head=el('span',undefined,'week-card-head');head.append(el('span',day,'week-card-title'),calorieRing(d.nutricion.kcal));button.append(head);const meals=el('span',undefined,'week-card-meals');if(day==='Viernes')button.classList.add('week-card-friday');for(const [kind,item] of [['Desayuno',d.desayuno],['Comida',d.comida],['Cena',d.cena],['Postre',d.postre]]){if(!item)continue;if(kind==='Postre'){const slot=el('span',undefined,'week-desserts week-meal-slot-postre');for(const component of dessertComponents(item)){const row=mealRow(component.tipo==='ingrediente'?'Fruta':'Postre',component,day);row.classList.remove('week-meal-slot-postre');slot.append(row)}meals.append(slot)}else meals.append(mealRow(kind,item,day))}const opener=el('span',undefined,'week-card-open');opener.setAttribute('aria-hidden','true');const openIcon=el('i');openIcon.setAttribute('data-lucide','panel-bottom-open');opener.append(openIcon);button.append(meals,opener);button.addEventListener('click',()=>open(day,m,button));w.append(button)}if(window.lucide?.createIcons)window.lucide.createIcons();
syncWeekCards(w);
const prepMap=new Map((data.preparaciones||[]).map(p=>[p.slug,p]));
const counts=new Map();
function traverse(slug,visited){
 if(visited.has(slug))return;
 visited.add(slug);
 const prep=prepMap.get(slug);
 if(!prep)return;
 if(prep.batchcooking)counts.set(slug,(counts.get(slug)||0)+1);
 for(const dependency of prep.dependencias||[])traverse(dependency,visited)
}
for(const day of days){
 for(const kind of ['comida','cena','postre']){
  const meal=m.dias[day][kind];
  if(!meal)continue;
  const inMeal=new Set();
  for(const component of kind==='postre'?dessertComponents(meal):[meal])
   if(component.tipo==='preparacion'&&component.slug)traverse(component.slug,inMeal);
  if(!meal.presentacion)continue;
  for(const group of meal.presentacion.grupos)
   for(const item of group.elementos)
    if(item.tipo==='preparacion'&&item.slug)traverse(item.slug,inMeal);
  for(const item of meal.presentacion.elementos_sin_grupo)
   if(item.tipo==='preparacion'&&item.slug)traverse(item.slug,inMeal);
 }
}
if(!counts.size){b.append(el('p','No hay preparaciones de batch cooking identificadas para este menú.','muted small'))}
else{
 const gallery=el('div',undefined,'batch-gallery');
 const n=counts.size;const cols=n===1?1:(n%3===0||n%5===0||n%2!==0)?3:2;
 gallery.classList.add('batch-cols-'+cols);
 for(const [slug,n] of counts){
  const r=recipes.find(x=>x.slug===slug);
  const tile=el('a',undefined,'batch-tile');tile.href=site+'/recetas/'+slug+'/';
  tile.setAttribute('aria-label',(r?.nombre||slug)+' · receta de batch cooking');
  const imageBox=el('span',undefined,'batch-thumb');
  const fallback=el('span',undefined,'batch-thumb-placeholder');
  const glyph=el('i');glyph.setAttribute('data-lucide','cooking-pot');glyph.setAttribute('aria-hidden','true');
  fallback.append(glyph);imageBox.append(fallback);
  if(r?.imagen){
   const img=el('img');img.alt='';img.loading='eager';img.decoding='async';
   img.addEventListener('load',()=>imageBox.classList.add('has-photo'));
   img.addEventListener('error',()=>img.remove(),{once:true});
   img.src=r.imagen;imageBox.append(img);
  }
  const caption=el('span',r?.nombre||slug,'batch-tile-title');
  imageBox.append(caption);
  tile.append(imageBox);
  tile.addEventListener('click',event=>{
   if(!window.matchMedia('(hover: none), (pointer: coarse)').matches)return;
   if(tile.classList.contains('batch-revealed'))return;
   event.preventDefault();
   gallery.querySelectorAll('.batch-revealed').forEach(node=>node.classList.remove('batch-revealed'));
   tile.classList.add('batch-revealed');
  });
  gallery.append(tile)
 }
 gallery.addEventListener('pointerdown',event=>{if(!event.target.closest('.batch-tile'))gallery.querySelectorAll('.batch-revealed').forEach(node=>node.classList.remove('batch-revealed'))});
 b.append(gallery);if(window.lucide?.createIcons)window.lucide.createIcons()
}
}
select.addEventListener('change',week);$('#menu-number').addEventListener('change',week);week();
})();