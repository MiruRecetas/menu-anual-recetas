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
function summary(kind,meal){const box=el('div',undefined,'quick-meal');box.append(el('strong',kind));if(meal?.estado==='libre'){box.append(el('p','Libre'));return box}
box.append(el('p',meal?.nombre||'Sin asignar'));
if(meal?.presentacion){for(const group of meal.presentacion.grupos)box.append(el('p',group.nombre,'muted small'));for(const x of meal.presentacion.elementos_sin_grupo)box.append(el('p',x.nombre,'muted small'))}return box}
function dismiss(){modal.hidden=true;document.body.classList.remove('modal-open');origin?.focus()}
function open(day,menu,button){origin=button;content.replaceChildren();content.append(el('span',months[menu.mes]+' · Menú '+menu.menu,'eyebrow'),el('h2',day));const d=menu.dias[day];const nut=d.nutricion;content.append(el('p',fmt(nut.kcal)+' kcal · P '+fmt(nut.proteinas_g)+' g · HC '+fmt(nut.hidratos_g)+' g · G '+fmt(nut.grasas_g)+' g','muted'));content.append(summary('Desayuno',d.desayuno),summary('Comida',d.comida),summary('Cena',d.cena));if(d.postre)content.append(summary('Postre',d.postre));if(day==='Viernes')content.append(el('p','La cena libre no se incluye en el total.','muted small'));const link=el('a','Ver día completo →','action day-cta');link.href=site+'/menus/'+String(menu.mes).padStart(2,'0')+'-'+menu.menu+'/'+day.toLowerCase()+'/';content.append(link);modal.hidden=false;document.body.classList.add('modal-open');close.focus()}
close.addEventListener('click',dismiss);
modal.addEventListener('click',e=>{if(e.target===modal)dismiss()});
document.addEventListener('keydown',e=>{if(modal.hidden)return;if(e.key==='Escape')dismiss();if(e.key==='Tab'){const focusable=[...dialog.querySelectorAll('button:not([disabled]),a[href]')];const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
const GOAL_KCAL=1600;
function compactName(kind,item,day){
 if(item?.estado==='libre')return ['Libre'];
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
 const label=el('span',kind,'week-meal-label');
 const names=el('span',undefined,'week-meal-names');
 for(const name of compactName(kind,item,day))names.append(el('span',name,'week-meal-name'));
 row.append(label,names);
 return row;
}
function recipeLink(slug){const match=recipes.find(r=>r.slug===slug),a=el('a',match?.nombre||slug);a.href=site+'/recetas/'+slug+'/';return a}
function week(){const mes=Number(select.value),num=Number($('#menu-number').value),m=menus.find(x=>x.mes===mes&&x.menu===num),w=$('#week'),b=$('#batch');try{localStorage.setItem('miru-menu',JSON.stringify({mes,menu:num}))}catch{}w.replaceChildren();b.replaceChildren();
if(!m){w.append(el('p','Este menú aún no está publicado.','empty-state'));b.textContent='No hay preparaciones publicadas.';return}
if(m.schema_version!==2){w.append(el('p','Este menú utiliza un formato antiguo y necesita actualización.','empty-state'));b.textContent='Pendiente de actualización.';return}
for(const day of days){const d=m.dias[day],button=el('button',undefined,'day day-button week-card');button.type='button';button.setAttribute('aria-label','Ver resumen de '+day);const head=el('span',undefined,'week-card-head');head.append(el('span',day,'week-card-title'),calorieRing(d.nutricion.kcal));button.append(head);for(const [kind,item] of [['Desayuno',d.desayuno],['Comida',d.comida],['Cena',d.cena],['Postre',d.postre]]){if(!item)continue;button.append(mealRow(kind,item,day))}button.addEventListener('click',()=>open(day,m,button));w.append(button)}
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
if(!counts.size)b.textContent='No hay preparaciones identificadas con etiqueta batchcooking.';
else for(const [slug,n] of counts){
 const p=el('p');
 p.append(recipeLink(slug),el('span',' · '+n+' '+(n===1?'comida':'comidas')));
 b.append(p)
}
}
select.addEventListener('change',week);$('#menu-number').addEventListener('change',week);week();
})();