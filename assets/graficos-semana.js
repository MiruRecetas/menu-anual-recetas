/* Resumen semanal: cálculos de presentación separados del dibujo. */
((root)=>{
 'use strict';
 const DAYS=['Lunes','Martes','Miércoles','Jueves','Viernes'];
 const MACROS=[
  {key:'proteinas_g',label:'Proteínas',factor:4,kind:'protein'},
  {key:'hidratos_g',label:'Hidratos',factor:4,kind:'carbs'},
  {key:'grasas_g',label:'Grasas',factor:9,kind:'fat'}
 ];
 const GROUPS={carne:'Carne',huevos:'Huevos',pescado:'Pescado',marisco:'Marisco',
  verduras:'Verduras',legumbres:'Legumbres',lacteos:'Lácteos',frutas:'Frutas',otros:'Sin clasificar'};
 // Clasificación editorial provisional de ingredientes directos ya publicados.
 // No expresa el desglose real del producto ni modifica sus datos de origen.
 const DIRECT_GROUPS={recIa7zpasm2s0mgH:'lacteos',recrQuW0jedsqM35u:'frutas',
  rec4H9nVK34mLywwy:'frutas',recPmxLD5hBc4rvSM:'frutas',
  recSPOXZkbn9PSbHI:'huevos',recJoLfb85Oe5dxXq:'carne'};
 const MEALS={desayuno:'Desayuno',comida:'Comida',cena:'Cena',postre:'Postre'};
 const amount=v=>Number.isFinite(v)&&v>=0?v:0;
 const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
 function mainGroup(meal,recipes){
  const groups=[...(meal.presentacion?.grupos||[])].sort((a,b)=>a.orden-b.orden);
  const main=groups[0]?.elementos?.[0]||meal.presentacion?.elementos_sin_grupo?.[0]||meal;
  if(main.tipo==='ingrediente')return DIRECT_GROUPS[main.referencia_id]||'otros';
  const recipe=main.slug?recipes.find(r=>r.slug===main.slug):recipes.find(r=>normalize(r.nombre)===normalize(main.nombre));
  const tags=recipe?.etiquetas_principales||[];
  return tags.length===1&&GROUPS[tags[0]]?tags[0]:'otros';
 }
 function model(menu,recipes=[]){
  const byMeal=Object.fromEntries(Object.keys(MEALS).map(k=>[k,0]));
  const byGroup=Object.fromEntries(Object.keys(GROUPS).map(k=>[k,0]));
  const bars=DAYS.map((day,i)=>{
   const d=menu.dias[day],kcal=amount(d.nutricion?.kcal);
   const energy=MACROS.map(m=>amount(d.nutricion?.[m.key])*m.factor);
   const total=energy.reduce((a,b)=>a+b,0);
   for(const kind of Object.keys(MEALS)){
    const meal=d[kind];
    if(!meal?.nutricion)continue; // Cena libre e ingestas ausentes no aportan ceros ficticios.
    const value=amount(meal.nutricion.kcal);
    byMeal[kind]+=value;
    byGroup[mainGroup(meal,recipes)]+=value;
   }
   return {day,letter:['L','M','X','J','V'][i],kcal,
    segments:MACROS.map((m,j)=>({...m,share:total?energy[j]/total:0,kcal:total?kcal*energy[j]/total:0}))};
  });
  const entries=(values,labels)=>Object.entries(values).filter(([,v])=>v>0).map(([key,kcal])=>({key,label:labels[key],kcal}));
  return {bars,total:bars.reduce((n,b)=>n+b.kcal,0),
   partial:menu.estado!=='Calculado',variety:{basis:'protagonista',entries:entries(byGroup,GROUPS)},
   meals:entries(byMeal,MEALS)};
 }
 // El renderizador recibe grupos agregados: un futuro exportador puede sustituir
 // variety.entries por kcal reales por ingrediente y basis por 'ingredientes'.
 const cleanup=new WeakMap();
 function render(container,data){
  cleanup.get(container)?.();
  const doc=container.ownerDocument;
  const node=(tag,text,cls)=>{const e=doc.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e};
  const fmt=n=>n.toLocaleString('es-ES',{maximumFractionDigits:0});
  const pct=n=>n.toLocaleString('es-ES',{maximumFractionDigits:1})+' %';
  const svgNode=(tag,attrs={})=>{const e=doc.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));return e};
  const title=(e,text)=>{const t=svgNode('title');t.textContent=text;e.append(t)};
  const makeSvg=(box,label)=>{const e=svgNode('svg',{viewBox:box,role:'img','aria-label':label});return e};
  const legendItem=(label,text,color,tooltip)=>{
   const li=node('li',undefined,'chart-legend-item');
   const dot=node('span',undefined,'chart-swatch');dot.style.background=color;dot.setAttribute('aria-hidden','true');
   li.append(dot,node('span',label,'chart-legend-label'),node('strong',text,'chart-legend-value'));
   if(tooltip){li.title=tooltip;li.setAttribute('aria-label',label+': '+text+' · '+tooltip)}
   return li;
  };
  container.replaceChildren();
  const left=node('figure',undefined,'weekly-bars');
  left.append(node('figcaption','Energía diaria','chart-title'));
  const peak=Math.max(1600,...data.bars.map(b=>b.kcal));
  const step=peak>2800?Math.ceil(peak/5/200)*200:400;
  const limit=Math.ceil((peak+step*.2)/step)*step;
  const plot={x:52,y:25,w:420,h:286},bottom=plot.y+plot.h;
  const y=value=>bottom-plot.h*value/limit;
  const svg=makeSvg('0 0 490 353','Kcal diarias de lunes a viernes. Objetivo: 1600 kcal. '+data.bars.map(b=>b.day+': '+fmt(b.kcal)+' kcal').join('; '));
  svg.classList.add('weekly-bars-svg');
  const label=(text,x,yy,attrs={})=>{const t=svgNode('text',{x,y:yy,...attrs});t.textContent=text;svg.append(t)};
  label('kcal',plot.x-8,12,{'text-anchor':'end',class:'chart-axis-label'});
  for(let tick=0;tick<=limit;tick+=step)label(fmt(tick),plot.x-12,y(tick)+4,{'text-anchor':'end',class:'chart-axis-label'});
  svg.append(svgNode('line',{x1:plot.x,y1:bottom,x2:plot.x+plot.w,y2:bottom,class:'chart-baseline'}));
  data.bars.forEach((bar,i)=>{
   const x=plot.x+(i+.5)*plot.w/5,w=42;
   let start=0;
   const g=svgNode('g',{'data-day':bar.day,'data-kcal':bar.kcal,class:'weekly-bar'});
   for(const seg of bar.segments){
    if(!seg.kcal)continue;
    const rect=svgNode('rect',{x:x-w/2,y:y(start+seg.kcal),width:w,height:plot.h*seg.kcal/limit,
     class:'weekly-bar-segment chart-macro-'+seg.kind,'data-share':seg.share,'data-kcal':seg.kcal});
    title(rect,bar.day+' · '+seg.label+': '+pct(seg.share*100)+' del reparto de macros');
    g.append(rect);start+=seg.kcal;
   }
   // Con macros nulos, conservar las kcal conocidas sin atribuirles un macro.
   if(bar.kcal>0&&!start){g.append(svgNode('rect',{x:x-w/2,y:y(bar.kcal),width:w,height:plot.h*bar.kcal/limit,class:'chart-unclassified'}))}
   title(g,bar.day+': '+fmt(bar.kcal)+' kcal');svg.append(g);
   label(fmt(bar.kcal),x,y(bar.kcal)-8,{'text-anchor':'middle',class:'chart-bar-value'});
   label(bar.letter,x,bottom+25,{'text-anchor':'middle',class:'chart-day-label'});
  });
  const goal=svgNode('line',{x1:plot.x,y1:y(1600),x2:plot.x+plot.w,y2:y(1600),class:'chart-goal','data-kcal':1600});
  svg.append(goal);
  // Etiqueta con superficie de fondo para que la línea no dificulte la lectura.
  svg.append(svgNode('rect',{x:plot.x+plot.w-71,y:y(1600)-21,width:74,height:17,class:'chart-goal-label-bg'}));
  label('1600 kcal',plot.x+plot.w,y(1600)-9,{'text-anchor':'end',class:'chart-goal-label'});
  left.append(svg);
  const macroLegend=node('ul',undefined,'chart-legend chart-macro-legend');
  for(const m of MACROS)macroLegend.append(legendItem(m.label,'','var(--macro-'+m.kind+')'));
  left.append(macroLegend);
  const right=node('div',undefined,'weekly-pies');
  const colors={carne:'#b86f54',huevos:'#d0a36e',pescado:'#708e9b',marisco:'#c38777',
   verduras:'#748d76',legumbres:'#9b9570',lacteos:'#b3a591',frutas:'#a18b9e',otros:'#90968e',
   desayuno:'#b3a591',comida:'#748d76',cena:'#b86f54',postre:'#d0a36e'};
  function pie(name,entries,cls){
   const figure=node('figure',undefined,'weekly-pie '+cls);
   figure.append(node('figcaption',name,'chart-title'));
   const row=node('div',undefined,'weekly-pie-row');
   const total=entries.reduce((n,e)=>n+e.kcal,0);
   const chart=makeSvg('0 0 160 160',name+' · semana. '+entries.map(e=>e.label+': '+pct(total?100*e.kcal/total:0)+', '+fmt(e.kcal)+' kcal').join('; '));
   chart.classList.add('weekly-pie-svg');
   if(!total)chart.append(svgNode('circle',{cx:80,cy:80,r:72,class:'chart-unclassified'}));
   let start=-Math.PI/2;
   const legend=node('ul',undefined,'chart-legend');
   for(const entry of entries){
    const share=entry.kcal/total,end=start+share*Math.PI*2;
    const color=colors[entry.key]||colors.otros;
    const attrs={fill:color,'data-key':entry.key,'data-kcal':entry.kcal,'data-share':share,class:'chart-pie-slice'};
    let slice;
    if(share>=1-1e-10)slice=svgNode('circle',{cx:80,cy:80,r:72,...attrs});
    else slice=svgNode('path',{d:'M 80 80 L '+(80+72*Math.cos(start))+' '+(80+72*Math.sin(start))+' A 72 72 0 '+(share>.5?1:0)+' 1 '+(80+72*Math.cos(end))+' '+(80+72*Math.sin(end))+' Z',...attrs});
    title(slice,entry.label+': '+pct(share*100)+' · '+fmt(entry.kcal)+' kcal');chart.append(slice);
    legend.append(legendItem(entry.label,pct(share*100),color,fmt(entry.kcal)+' kcal'));
    start=end;
   }
   row.append(chart,legend);figure.append(row);return figure;
  }
  right.append(pie('Variedad nutricional',data.variety.entries,'weekly-variety'),pie('Energía por ingesta',data.meals,'weekly-intakes'));
  const card=node('div',undefined,'weekly-chart-card');
  const inner=node('div',undefined,'weekly-chart-inner');
  const toggle=node('button',undefined,'weekly-chart-toggle');
  toggle.type='button';
  const icon=node('i');icon.setAttribute('data-lucide','iteration-cw');icon.setAttribute('aria-hidden','true');
  toggle.append(icon);
  right.id=container.id+'-pies';
  toggle.setAttribute('aria-controls',right.id);
  const backLabel=node('span','Reparto semanal','weekly-chart-back-label');
  backLabel.setAttribute('aria-hidden','true');
  inner.append(left,right);card.append(inner,backLabel,toggle);container.append(card);
  const note=node('p',(data.variety.basis==='protagonista'
   ?'Variedad: aproximación por el ingrediente protagonista de cada plato. '
   :'Variedad: aporte energético por grupos de ingredientes. ')
   +(data.partial?'Totales parciales de las ingestas registradas. ':'Totales de las ingestas registradas. ')
   +'La cena libre del viernes no está incluida.','weekly-charts-note');
  container.append(note);container.hidden=false;
  const compact=root.matchMedia('(max-width: 699px) and (orientation: portrait)');
  let flipped=false;
  const fit=()=>{
   if(compact.matches){
    const height=left.offsetHeight;
    inner.style.height=height+'px';
    // La altura de las barras es el límite también con más categorías o textos largos.
    right.style.setProperty('--weekly-reverse-scale',Math.min(1,Math.max(0,height-56)/Math.max(1,right.offsetHeight)));
   }else{
    inner.style.removeProperty('height');
    right.style.removeProperty('--weekly-reverse-scale');
   }
  };
  const sync=()=>{
   if(!compact.matches)flipped=false;
   card.classList.toggle('is-flipped',flipped);
   left.inert=compact.matches&&flipped;right.inert=compact.matches&&!flipped;
   left.setAttribute('aria-hidden',String(left.inert));right.setAttribute('aria-hidden',String(right.inert));
   toggle.setAttribute('aria-pressed',String(flipped));
   const label=flipped?'Volver a energía diaria':'Ver gráficos circulares semanales';
   toggle.setAttribute('aria-label',label);toggle.title=label;
   fit();
  };
  toggle.addEventListener('click',()=>{flipped=!flipped;sync()});
  compact.addEventListener('change',sync);
  const observer=new root.ResizeObserver(fit);
  observer.observe(left);observer.observe(right);
  cleanup.set(container,()=>{compact.removeEventListener('change',sync);observer.disconnect()});
  sync();
 }
 const api={model,render};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.MiruWeeklyCharts=api;
})(typeof window!=='undefined'?window:globalThis);
