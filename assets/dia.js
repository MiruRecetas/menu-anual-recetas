(()=>{'use strict';const root=document.querySelector('#daily-content'),payload=JSON.parse(document.querySelector('#daily-data').textContent),day=payload.dia,site='https://mirurecetas.github.io/menu-anual-recetas';const el=(tag,txt,cls)=>{const node=document.createElement(tag);if(txt!==undefined)node.textContent=txt;if(cls)node.className=cls;return node};const fmt=x=>Number(x).toLocaleString('es-ES',{maximumFractionDigits:1});function macros(x){if(!x)return el('p','Datos pendientes','muted');return el('p',fmt(x.kcal)+' kcal · P '+fmt(x.proteinas_g)+' g · HC '+fmt(x.hidratos_g)+' g · G '+fmt(x.grasas_g)+' g','muted small')}const GOAL_KCAL=1600;const fmtDaily=x=>Number(x).toLocaleString('es-ES',{maximumFractionDigits:0});function dailyNutrition(nut){

 const group=el('section',undefined,'daily-nutrition');
 group.setAttribute('aria-label','Resumen nutricional del día');
 const kcal=Number(nut.kcal)||0;
 const ratio=Math.max(0,Math.min(1,kcal/GOAL_KCAL));
 const energy=el('div',undefined,'daily-energy');
 const circle=el('div',undefined,'daily-energy-ring');
 circle.setAttribute('aria-label',fmtDaily(kcal)+' kilocalorías de '+GOAL_KCAL+' kilocalorías de referencia');
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
 center.append(el('strong',fmtDaily(kcal)),el('span','kcal'),el('small','de '+GOAL_KCAL));
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
  row.setAttribute('aria-label',item.label+': '+fmtDaily(grams)+' gramos, '+Math.round(percent)+' por ciento de la energía calculada a partir de macronutrientes');
  const top=el('div',undefined,'daily-macro-head');
  const label=el('span',item.label,'daily-macro-name');
  const values=el('span',undefined,'daily-macro-values');
  values.append(el('strong',fmtDaily(grams)+' g'),el('small',Math.round(percent)+'%'));
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

function entry(x){const line=el('div',undefined,'ingredient-line'),name=el('span',x.nombre),amount=el('strong',fmt(x.cantidad)+' '+x.unidad);if(x.tipo==='preparacion'&&x.slug){const a=el('a',x.nombre);a.href=site+'/recetas/'+encodeURIComponent(x.slug)+'/';line.append(a,amount);return line}line.append(name,amount);return line}function meal(kind,x){const block=el('section',undefined,'daily-meal');block.append(el('h2',kind));if(x?.estado==='libre'){block.append(el('p','Libre · No incluida en la nutrición registrada.'));return block}block.append(el('h3',x.nombre),macros(x.nutricion));for(const g of [...x.presentacion.grupos].sort((a,b)=>a.orden-b.orden)){const details=el('details',undefined,'culinary-group'),summary=el('summary',g.nombre);if(g.elementos.some(e=>e.tipo==='preparacion') && /^(principal|plato-[0-9]+)$/.test(g.id))details.open=true;details.append(summary);const inside=el('div',undefined,'group-entries');g.elementos.forEach(e=>inside.append(entry(e)));details.append(inside);block.append(details)}for(const e of x.presentacion.elementos_sin_grupo)block.append(entry(e));return block}function simple(kind,x){if(!x)return;const section=el('section',undefined,'daily-meal');section.append(el('h2',kind),entry(x),macros(x.nutricion));root.append(section)}const total=el('section',undefined,'daily-total');total.append(dailyNutrition(day.nutricion));if(payload.nombre_dia==='Viernes')total.append(el('p','Cena libre no incluida.','muted small'));root.append(total);simple('Desayuno',day.desayuno);root.append(meal('Comida',day.comida),meal('Cena',day.cena));simple('Postre',day.postre)})();