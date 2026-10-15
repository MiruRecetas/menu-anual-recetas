(()=>{'use strict';const root=document.querySelector('#daily-content'),payload=JSON.parse(document.querySelector('#daily-data').textContent),day=payload.dia,site='https://mirurecetas.github.io/menu-anual-recetas';const el=(tag,txt,cls)=>{const node=document.createElement(tag);if(txt!==undefined)node.textContent=txt;if(cls)node.className=cls;return node};const fmt=x=>Number(x).toLocaleString('es-ES',{maximumFractionDigits:1});function macros(x,tag='p'){
 const line=el(tag,undefined,'component-nutrition');
 if(!x){line.textContent='Desglose nutricional pendiente';return line}
 line.dataset.kcal=String(x.kcal);
 line.append(el('strong',fmt(x.kcal)+' kcal','component-kcal'));
 for(const [label,key,kind] of [['PR','proteinas_g','protein'],['HC','hidratos_g','carbs'],['GR','grasas_g','fat']]){
  const part=el('span',undefined,'component-macro component-macro-'+kind);
  part.append(document.createTextNode(label+' '),el('strong',fmt(x[key])+' g'));line.append(part);
 }
 return line;
}const GOAL_KCAL=1600;const fmtDaily=x=>Number(x).toLocaleString('es-ES',{maximumFractionDigits:0});const MACRO_GOALS={proteinas_g:93,hidratos_g:147,grasas_g:65};
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
 ring.setAttribute('aria-label',fmtDaily(kcal)+' kcal de '+GOAL_KCAL+' kcal, con reparto energético en proteínas, hidratos y grasas');
 const fractions=energyByMacro.map(v=>totalEnergy>0?v/totalEnergy:0);
 let start=0;
 for(let i=0;i<entries.length;i++){
  const arc=circumference*ratio*fractions[i];
  if(arc>0)circle('daily-macro-arc daily-macro-arc-'+entries[i].kind,start,arc);
  start+=arc;
 }
 ring.append(svg);
 const center=el('span',undefined,'daily-energy-center');
 center.append(el('strong',fmtDaily(kcal)),el('span','kcal'),el('small','de '+GOAL_KCAL));
 ring.append(center);energy.append(ring);
 const macros=el('div',undefined,'daily-macros');
 for(const item of entries){
  const grams=Math.max(0,Number(nut[item.key])||0);
  const fulfillment=100*grams/item.goal;
  const row=el('div',undefined,'daily-macro daily-macro-'+item.kind);
  row.setAttribute('aria-label',item.label+': '+fmtDaily(grams)+' de '+item.goal+' gramos, '+Math.round(fulfillment)+' por ciento del objetivo diario');
  const top=el('div',undefined,'daily-macro-head');
  const label=el('span',item.label,'daily-macro-name');
  const values=el('span',undefined,'daily-macro-values');
  values.append(el('strong',fmtDaily(grams)+' g'),el('small',Math.round(fulfillment)+'%'));
  top.append(label,values);
  const track=el('div',undefined,'daily-macro-track');
  const bar=el('div',undefined,'daily-macro-fill');
  bar.style.width=Math.min(100,fulfillment)+'%';
  track.append(bar);row.append(top,track);macros.append(row);
 }
 macros.append(el('p','Barras: % del objetivo diario · PR 93 g · HC 147 g · GR 65 g','daily-macro-note'));
 group.append(energy,macros);return group;
}
const shortNames={recIa7zpasm2s0mgH:'Café con leche',recrQuW0jedsqM35u:'Uvas',rec4H9nVK34mLywwy:'Ciruelas',recPmxLD5hBc4rvSM:'Higos'};
const foodNames={recSPOXZkbn9PSbHI:'Huevos',recG7EOA99Wt7MiRC:'Mozzarella rallada',recVfgOdXad3Ns6po:'Pechuga de pollo loncheada',rec4QWbZX5KJIhQyW:'Aceite de oliva virgen extra',recjq8IrRWXTVjRKg:'Tomate',recrGNY88zOIOcRom:'Cebolla',recSE81b9WjkURbXi:'Patata',recZ6WhTcrZDhRgKI:'Pan de molde',recpHKx8XrOpBd8zW:'Salmón',reccZQ0blNFQ0THdM:'Arroz blanco cocido',recJq3z3foutu1hOx:'Queso curado de oveja',recJoLfb85Oe5dxXq:'Carpaccio con parmesano y AOVE',rec3RHqUWRFk0FIJ1:'Puerros al natural',recEtJBidxvvxhoAg:'Mayonesa con cebolla caramelizada y ajo',recgTA0LAJrz7rD8B:'Boniato',recHiBRS3Ikrzb1mt:'Boquerones aliñados'};
// Equivalencias de presentación verificadas: no modifican cantidad ni nutrición de origen.
function displayAmount(x){
 if(x.tipo==='ingrediente'&&x.unidad==='g'){
  if(x.referencia_id==='recZ6WhTcrZDhRgKI'&&x.cantidad===36.5)return '1 rebanada';
  if(x.referencia_id==='recSPOXZkbn9PSbHI'&&x.cantidad===100)return '2 unidades';
 }
 const amount=x.raciones??x.cantidad;
 const unit=x.tipo==='preparacion'?(amount===1?'ración':'raciones'):x.unidad;
 return Number(amount).toLocaleString('es-ES',{maximumFractionDigits:3})+' '+unit;
}
const displayName=x=>foodNames[x.referencia_id]||shortNames[x.referencia_id]||(/^Café con leche/i.test(x.nombre)?'Café con leche':x.nombre);
function entry(x,name=displayName(x)){
 const line=el('div',undefined,'ingredient-line');
 const title=el(x.tipo==='preparacion'&&x.slug?'a':'span',name,'component-name');
 if(title.tagName==='A')title.href=site+'/recetas/'+encodeURIComponent(x.slug)+'/';
 line.append(title,el('strong',displayAmount(x),'component-amount'));return line;
}
function heading(kind,nut){
 const h=el('h2',undefined,'daily-meal-title');h.append(el('span',kind));
 if(nut)h.append(el('strong',fmt(nut.kcal)+' kcal','daily-meal-kcal'));
 return h;
}
function component(x,nut=x.nutricion,name=displayName(x)){
 const box=el('div',undefined,'daily-component');box.append(entry(x,name),macros(nut));return box;
}
function group(g){
 if(g.elementos.length===1)return component(g.elementos[0],g.nutricion||g.elementos[0].nutricion,g.nombre==='Pan Oroweat'?'Pan de molde':g.nombre);
 const details=el('details',undefined,'culinary-group daily-component');
 const summary=el('summary');summary.append(el('span',g.nombre,'component-name'),macros(g.nutricion,'span'));
 const inside=el('div',undefined,'group-entries');
 for(const item of g.elementos)inside.append(entry(item));
 details.append(summary,inside);return details;
}
function meal(kind,x){
 const section=el('section',undefined,'daily-meal');section.append(heading(kind,kind==='Cena'&&x.estado==='libre'?null:x.nutricion));
 const body=el('div',undefined,'daily-meal-body');section.append(body);
 if(kind==='Cena'&&x.estado==='libre'){
  section.classList.add('daily-meal-free');
  const band=el('div',undefined,'free-night-band');
  const title=el('div',undefined,'free-night-title'),icon=el('i');
  icon.setAttribute('data-lucide','moon-star');icon.setAttribute('aria-hidden','true');
  title.append(icon,el('strong','Noche libre'));
  band.append(title,el('p','Sin planificación nutricional','free-night-note'));body.append(band);return section;
 }
 if(x.estado==='libre'){body.append(el('p','Libre · No incluida en la nutrición registrada.'));return section}
 if(x.estado==='pendiente'){body.append(el('p','Pendiente de asignar.','muted'));return section}
 for(const g of [...x.presentacion.grupos].sort((a,b)=>a.orden-b.orden))body.append(group(g));
 for(const item of x.presentacion.elementos_sin_grupo)body.append(component(item));
 return section;
}
function simple(kind,x){
 if(!x)return;const section=el('section',undefined,'daily-meal');
 const body=el('div',undefined,'daily-meal-body');body.append(component(x));
 section.append(heading(kind,x.nutricion),body);root.append(section);
}
const total=el('section',undefined,'daily-total');total.append(dailyNutrition(day.nutricion));
if(day.comida?.estado==='pendiente'||day.cena?.estado==='pendiente')total.append(el('p','Total parcial: faltan ingestas por registrar.','muted small'));
if(payload.nombre_dia==='Viernes')total.append(el('p','Cena libre no incluida.','muted small'));
root.append(total);simple('Desayuno',day.desayuno);root.append(meal('Comida',day.comida),meal('Cena',day.cena));
for(const item of day.postre?.componentes||(day.postre?[day.postre]:[]))simple(item.tipo==='ingrediente'&&item.referencia_id!=='recw8aSxhSx0aSH93'?'Fruta':'Postre',item);
if(day.cena?.estado==='libre'&&window.lucide?.createIcons)window.lucide.createIcons();
function enableSwipeNavigation(){
 const main=document.querySelector('main.main');
 const navigation=document.querySelector('.daily-navigation');
 if(!main||!navigation)return;
 let gesture=null;
 const ignoreTarget=target=>target instanceof Element&&Boolean(target.closest('a,button,input,select,textarea,summary,[role="button"],[contenteditable="true"]'));
 main.addEventListener('touchstart',event=>{
  gesture=null;
  if(event.touches.length!==1||ignoreTarget(event.target))return;
  const finger=event.touches[0];
  gesture={x:finger.clientX,y:finger.clientY,identifier:finger.identifier};
 },{passive:true});
 main.addEventListener('touchmove',event=>{
  if(event.touches.length!==1)gesture=null;
 },{passive:true});
 main.addEventListener('touchcancel',()=>{gesture=null},{passive:true});
 main.addEventListener('touchend',event=>{
  const start=gesture;
  gesture=null;
  if(!start||event.touches.length||event.changedTouches.length!==1)return;
  const finger=event.changedTouches[0];
  if(finger.identifier!==start.identifier)return;
  const dx=finger.clientX-start.x,dy=finger.clientY-start.y;
  // Solo gestos inequívocamente horizontales; el scroll vertical sigue nativo.
  const distance=Math.max(65,Math.min(window.innerWidth*.16,110));
  if(Math.abs(dx)<distance||Math.abs(dx)<Math.abs(dy)*1.5)return;
  if(window.getSelection()?.toString())return;
  const link=navigation.querySelector(dx<0?'.daily-nav-next':'.daily-nav-prev');
  // Los extremos carecen del enlace correspondiente: jamás se hace wrap.
  if(link)window.location.assign(link.href);
 },{passive:true});
}
enableSwipeNavigation();})();
