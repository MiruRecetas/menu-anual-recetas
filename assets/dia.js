(()=>{'use strict';const root=document.querySelector('#daily-content'),payload=JSON.parse(document.querySelector('#daily-data').textContent),day=payload.dia,site='https://mirurecetas.github.io/menu-anual-recetas';const el=(tag,txt,cls)=>{const node=document.createElement(tag);if(txt!==undefined)node.textContent=txt;if(cls)node.className=cls;return node};const fmt=x=>Number(x).toLocaleString('es-ES',{maximumFractionDigits:1});function macros(x){if(!x)return el('p','Datos pendientes','muted');return el('p',fmt(x.kcal)+' kcal · P '+fmt(x.proteinas_g)+' g · HC '+fmt(x.hidratos_g)+' g · G '+fmt(x.grasas_g)+' g','muted small')}const GOAL_KCAL=1600;const fmtDaily=x=>Number(x).toLocaleString('es-ES',{maximumFractionDigits:0});const MACRO_GOALS={proteinas_g:93,hidratos_g:147,grasas_g:65};
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
 const circle=(cls,color,offset,len)=>{
  const node=document.createElementNS('http://www.w3.org/2000/svg','circle');
  node.setAttribute('cx','60');node.setAttribute('cy','60');node.setAttribute('r','49');
  node.setAttribute('class',cls);
  if(color)node.setAttribute('stroke',color);
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
 const colors=['#789582','#c78465','#9d88a3'];
 let start=0;
 for(let i=0;i<entries.length;i++){
  const arc=circumference*ratio*fractions[i];
  if(arc>0)circle('daily-macro-arc daily-macro-arc-'+entries[i].kind,colors[i],start,arc);
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
function entry(x){const line=el('div',undefined,'ingredient-line'),name=el('span',x.nombre),amount=el('strong',fmt(x.cantidad)+' '+x.unidad);if(x.tipo==='preparacion'&&x.slug){const a=el('a',x.nombre);a.href=site+'/recetas/'+encodeURIComponent(x.slug)+'/';line.append(a,amount);return line}line.append(name,amount);return line}function meal(kind,x){const block=el('section',undefined,'daily-meal');block.append(el('h2',kind));if(x?.estado==='libre'){block.append(el('p','Libre · No incluida en la nutrición registrada.'));return block}block.append(el('h3',x.nombre),macros(x.nutricion));for(const g of [...x.presentacion.grupos].sort((a,b)=>a.orden-b.orden)){const details=el('details',undefined,'culinary-group'),summary=el('summary',g.nombre);if(g.elementos.some(e=>e.tipo==='preparacion') && /^(principal|plato-[0-9]+)$/.test(g.id))details.open=true;details.append(summary);const inside=el('div',undefined,'group-entries');g.elementos.forEach(e=>inside.append(entry(e)));details.append(inside);block.append(details)}for(const e of x.presentacion.elementos_sin_grupo)block.append(entry(e));return block}function simple(kind,x){if(!x)return;const section=el('section',undefined,'daily-meal');section.append(el('h2',kind),entry(x),macros(x.nutricion));root.append(section)}const total=el('section',undefined,'daily-total');total.append(dailyNutrition(day.nutricion));if(payload.nombre_dia==='Viernes')total.append(el('p','Cena libre no incluida.','muted small'));root.append(total);simple('Desayuno',day.desayuno);root.append(meal('Comida',day.comida),meal('Cena',day.cena));simple('Postre',day.postre)})();