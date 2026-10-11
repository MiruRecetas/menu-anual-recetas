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
const modal=$('#day-modal'),dialog=$('#day-dialog'),close=$('#close-day'),content=$('#quick-content');let origin=null;
const MEAL_ICONS={Desayuno:'coffee',Comida:'utensils',Cena:'moon',Postre:'apple'};
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
function displayGroup(g){
 const wrap=el('div',undefined,'quick-group');
 const details=el('details',undefined,'quick-group-details');
 const head=el('summary',g.nombre,'quick-meal-name');
 details.append(head);
 const ingredients=el('div',undefined,'quick-group-ingredients');
 for(const item of g.elementos){
  const itemRow=el('div',undefined,'quick-group-ingredient');
  itemRow.append(el('span',item.nombre),el('strong',Number(item.cantidad).toLocaleString('es-ES',{maximumFractionDigits:2})+' '+item.unidad));
  ingredients.append(itemRow);
 }
 details.append(ingredients);
 wrap.append(details);
 const prepItems=g.elementos.filter(item=>item.tipo==='preparacion');
 if(prepItems.length===1){
  const prep=prepItems[0];
  const recipe=recipes.find(r=>r.slug===prep.slug)||recipes.find(r=>cleanRecipeName(r.nombre)===cleanRecipeName(prep.nombre));
  if(recipe){
   const link=el('a','↗','quick-group-recipe');
   link.href=site+'/recetas/'+encodeURIComponent(recipe.slug)+'/';
   link.setAttribute('aria-label','Abrir receta: '+recipe.nombre);
   link.title='Abrir receta: '+recipe.nombre;
   wrap.append(link);
  }
 }
 return wrap;
}
function summary(kind,meal,day){
 const box=el('section',undefined,'quick-meal');
 const heading=el('h3',undefined,'quick-meal-heading');
 const symbol=el('i');
 symbol.setAttribute('data-lucide',MEAL_ICONS[kind]);
 symbol.setAttribute('aria-hidden','true');
 heading.append(symbol,el('span',kind));
 const namesContainer=el('div',undefined,'quick-meal-names');
 if(meal?.presentacion?.grupos?.length){
  for(const g of [...meal.presentacion.grupos].sort((a,b)=>a.orden-b.orden))namesContainer.append(displayGroup(g));
  for(const item of meal.presentacion.elementos_sin_grupo||[]){
   const line=el('span',item.nombre,'quick-meal-name');namesContainer.append(line);
  }
 }else{
  const names=meal?compactName(kind,meal,day):['Sin asignar'];
  const available=relatedRecipes(meal);
  for(const name of names){
   const recipe=matchSummaryRecipe(name,names,available);
   const node=recipe?el('a',name,'quick-meal-name quick-meal-link'):el('span',name,'quick-meal-name');
   if(recipe){
    node.href=site+'/recetas/'+encodeURIComponent(recipe.slug)+'/';
    node.title='Abrir receta: '+recipe.nombre;
    node.setAttribute('aria-label',name+' · Abrir receta: '+recipe.nombre);
   }
   namesContainer.append(node);
  }
 }
 if(meal?.estado==='libre')box.classList.add('quick-meal-free');
 box.append(heading,namesContainer);return box;
}
function dismiss(){modal.hidden=true;document.body.classList.remove('modal-open');origin?.focus()}
// Los porcentajes de las barras corresponden al reparto energético de macros,
 // no a metas nutricionales individuales: proteínas 4, hidratos 4 y grasas 9 kcal/g.
function dailyNutrition(nut){
 const group=el('section',undefined,'daily-nutrition');
 group.setAttribute('aria-label','Resumen nutricional del día');
 const kcal=Number(nut.kcal)||0;
 const ratio=Math.max(0,Math.min(1,kcal/GOAL_KCAL));
 const energy=el('div',undefined,'daily-energy');
 const circle=el('div',undefined,'daily-energy-ring');
 circle.setAttribute('aria-label',fmt(kcal)+' kilocalorías de '+GOAL_KCAL+' kilocalorías de referencia');
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 120 120');svg.setAttribute('aria-hidden','true');
 const circumference=2*Math.PI*49;
 for(const [cls,offset] of [['daily-energy-track',0],['daily-energy-progress',circumference*(1-ratio)]]){
  const node=document.createElementNS('http://www.w3.org/2000/svg','circle');
  node.setAttribute('class',cls);node.setAttribute('cx','60');node.setAttribute('cy','60');node.setAttribute('r','49');
  if(cls==='daily-energy-progress'){
   node.setAttribute('stroke-dasharray',String(circumference));
   node.setAttribute('stroke-dashoffset',String(offset));
  }
  svg.append(node);
 }
 circle.append(svg);
 const center=el('span',undefined,'daily-energy-center');
 center.append(el('strong',fmt(kcal)),el('span','kcal'),el('small','de '+GOAL_KCAL));
 circle.append(center);energy.append(circle);
 const entries=[
  {label:'Proteínas',short:'P',key:'proteinas_g',energy:4,kind:'protein'},
  {label:'Hidratos',short:'HC',key:'hidratos_g',energy:4,kind:'carbs'},
  {label:'Grasas',short:'G',key:'grasas_g',energy:9,kind:'fat'}
 ];
 const total=entries.reduce((sum,item)=>sum+Math.max(0,Number(nut[item.key])||0)*item.energy,0);
 const macros=el('div',undefined,'daily-macros');
 for(const item of entries){
  const grams=Math.max(0,Number(nut[item.key])||0);
  const percent=total>0?100*grams*item.energy/total:0;
  const row=el('div',undefined,'daily-macro daily-macro-'+item.kind);
  row.setAttribute('aria-label',item.label+': '+fmt(grams)+' gramos, '+Math.round(percent)+' por ciento de la energía calculada a partir de macronutrientes');
  const top=el('div',undefined,'daily-macro-head');
  const label=el('span',item.label,'daily-macro-name');
  const values=el('span',undefined,'daily-macro-values');
  values.append(el('strong',fmt(grams)+' g'),el('small',Math.round(percent)+'%'));
  top.append(label,values);
  const track=el('div',undefined,'daily-macro-track');
  const bar=el('div',undefined,'daily-macro-fill');
  bar.style.width=Math.max(0,Math.min(100,percent))+'%';
  track.append(bar);row.append(top,track);macros.append(row);
 }
 const note=el('p','Barras: % de energía de cada macronutriente','daily-macro-note');
 macros.append(note);group.append(energy,macros);
 return group;
}
function open(day,menu,button){origin=button;content.replaceChildren();const heading=el('span',undefined,'eyebrow day-context');heading.append(document.createTextNode(months[menu.mes]+' · Menú '+menu.menu+' · '),el('strong',day,'day-context-name'));content.append(heading);const d=menu.dias[day];const nut=d.nutricion;content.append(dailyNutrition(nut));content.append(summary('Desayuno',d.desayuno,day),summary('Comida',d.comida,day),summary('Cena',d.cena,day));if(d.postre)content.append(summary('Postre',d.postre,day));if(day==='Viernes')content.append(el('p','La cena libre no se incluye en el total.','muted small'));$('#expand-day').href=site+'/menus/'+String(menu.mes).padStart(2,'0')+'-'+menu.menu+'/'+day.toLowerCase()+'/';if(window.lucide?.createIcons)window.lucide.createIcons();modal.hidden=false;document.body.classList.add('modal-open');close.focus()}
close.addEventListener('click',dismiss);
modal.addEventListener('click',e=>{if(e.target===modal)dismiss()});
document.addEventListener('keydown',e=>{if(modal.hidden)return;if(e.key==='Escape')dismiss();if(e.key==='Tab'){const focusable=[...dialog.querySelectorAll('button:not([disabled]),a[href]')];const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
const GOAL_KCAL=1600;
function compactName(kind,item,day){
 if(item?.estado==='libre')return ['Noche libre'];
 const original=item?.nombre||'';
 if(kind==='Desayuno'&&/^Café con leche/i.test(original))return ['Café con leche'];
 if(kind==='Postre'){
  if(/ciruela/i.test(original))return ['Ciruelas'];
  if(/higo/i.test(original))return ['Higos'];
 }
 if(kind==='Cena'){
  if(day==='Lunes'&&/Bowl de yogur, carpaccio y puerros con mayonesa/i.test(original))
   return ['Carpaccio','Puerros con mayonesa','Bowl de yogur'];
  if(day==='Martes'&&/Mini wraps de falafel con boquerones aliñados/i.test(original))
   return ['Mini wraps de falafel','Boquerones aliñados'];
  if(day==='Miércoles')return [original.replace(/\s*\(2 raciones\)\s*$/i,'')];
  if(day==='Jueves'&&original==='Tostas de hummus y sardinillas')
   return ['Tostas de hummus','Sardinillas'];
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
 const label=el('span',undefined,'week-meal-label');const symbol=el('i');symbol.setAttribute('data-lucide',MEAL_ICONS[kind]);symbol.setAttribute('aria-hidden','true');label.append(symbol);label.setAttribute('aria-label',kind);label.title=kind;
 const names=el('span',undefined,'week-meal-names');
 for(const name of compactName(kind,item,day))names.append(el('span',name,'week-meal-name'));
 row.classList.add(kind==='Comida'||kind==='Cena'?'week-meal-main':'week-meal-secondary');if(item?.estado==='libre')row.classList.add('week-meal-free');row.append(label,names);
 return row;
}
function recipeLink(slug){const match=recipes.find(r=>r.slug===slug),a=el('a',match?.nombre||slug);a.href=site+'/recetas/'+slug+'/';return a}
function week(){const mes=Number(select.value),num=Number($('#menu-number').value),m=menus.find(x=>x.mes===mes&&x.menu===num),w=$('#week'),b=$('#batch');try{localStorage.setItem('miru-menu',JSON.stringify({mes,menu:num}))}catch{}w.replaceChildren();b.replaceChildren();
if(!m){w.append(el('p','Este menú aún no está publicado.','empty-state'));b.textContent='No hay preparaciones publicadas.';return}
if(m.schema_version!==2){w.append(el('p','Este menú utiliza un formato antiguo y necesita actualización.','empty-state'));b.textContent='Pendiente de actualización.';return}
for(const day of days){const d=m.dias[day],button=el('button',undefined,'day day-button week-card');button.type='button';button.setAttribute('aria-label','Ver resumen de '+day);const head=el('span',undefined,'week-card-head');head.append(el('span',day,'week-card-title'),calorieRing(d.nutricion.kcal));button.append(head);if(day==='Viernes')button.classList.add('week-card-friday');for(const [kind,item] of [['Desayuno',d.desayuno],['Comida',d.comida],['Cena',d.cena],['Postre',d.postre]]){if(!item)continue;button.append(mealRow(kind,item,day))}button.addEventListener('click',()=>open(day,m,button));w.append(button)}if(window.lucide?.createIcons)window.lucide.createIcons();
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
 for(const kind of ['comida','cena']){
  const meal=m.dias[day][kind];
  if(!meal?.presentacion)continue;
  const inMeal=new Set();
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