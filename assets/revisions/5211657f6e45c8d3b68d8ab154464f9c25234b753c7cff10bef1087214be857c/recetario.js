(()=>{'use strict';
const site='https://mirurecetas.github.io/menu-anual-recetas';
const recipes=JSON.parse(document.querySelector('#recipes-data').textContent);
const $=id=>document.getElementById(id);
const input=$('search'),list=$('recipe-catalog'),count=$('recipe-count'),more=$('show-more');
const opener=$('catalog-filter-open'),openerLabel=$('catalog-filter-toggle-label');
const overlay=$('catalog-filter-overlay'),dialog=$('catalog-filter-dialog'),close=$('catalog-filter-close');
const done=$('catalog-filter-done'),groupsNode=$('catalog-filter-groups');
const activeNode=$('catalog-active-filters'),clear=$('catalog-filter-clear');
const panelCount=$('catalog-filter-panel-count');
const sections=[
 {key:'principales_filtro',label:'Ingrediente principal'},
 {key:'categoria_filtro',label:'Categoría'},
 {key:'practicas_filtro',label:'Etiquetas'}
];
// Each facet has one of three states: absent (neutral), include, exclude.
const chosen=new Map(sections.map(s=>[s.key,new Map()]));
const states=Object.freeze({neutral:'neutral',include:'include',exclude:'exclude'});
function nextState(state){return state===states.neutral?states.include:state===states.include?states.exclude:states.neutral;}
function setState(key,value,next){
 const selection=chosen.get(key);
 if(next===states.neutral)selection.delete(value);
 else selection.set(value,next);
}
function getState(key,value){return chosen.get(key).get(value)||states.neutral;}
function facetMatches(valuesForRecipe,selection){
 const includes=[...selection].filter(([,state])=>state===states.include).map(([value])=>value);
 const excludes=[...selection].filter(([,state])=>state===states.exclude).map(([value])=>value);
 return (!includes.length||includes.some(value=>valuesForRecipe.includes(value)))&&
        excludes.every(value=>!valuesForRecipe.includes(value));
}
const normalize=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es');
const values=(r,key)=>key==='categoria_filtro'?(r[key]?[r[key]]:[]):Array.isArray(r[key])?r[key]:[];
let limit=10,origin=null,found=0;
function icon(name){const i=document.createElement('i');i.setAttribute('data-lucide',name);i.setAttribute('aria-hidden','true');return i;}
function refreshIcons(){if(window.lucide?.createIcons)window.lucide.createIcons();}
function tile(r){
 const a=document.createElement('a');a.className='recipe-tile';a.href=site+'/recetas/'+encodeURIComponent(r.slug)+'/';
 if(r.imagen){const img=document.createElement('img');img.src=r.imagen;img.alt='';img.loading='lazy';img.width=96;img.height=96;a.append(img);}
 const body=document.createElement('div');body.className='tile-text';
 const h=document.createElement('h3');h.textContent=r.nombre;
 const p=document.createElement('p');p.className='muted small';p.textContent=r.descripcion||'Consultar receta';
 body.append(h,p);a.append(body);return a;
}
function matches(r,term){
 if(!normalize([r.nombre,r.descripcion,...(r.etiquetas||[])].join(' ')).includes(term))return false;
 return sections.every(s=>facetMatches(values(r,s.key),chosen.get(s.key)));
}
function selectedCount(){return [...chosen.values()].reduce((sum,set)=>sum+set.size,0);}
function buildSummary(){
 activeNode.replaceChildren();
 for(const section of sections){
  for(const [value,state] of chosen.get(section.key)){
   const chip=document.createElement('button');chip.type='button';chip.className='catalog-filter-chip';
   chip.setAttribute('aria-label','Quitar filtro '+(state===states.exclude?'excluido ':'incluido ')+value+' de '+section.label);
   chip.classList.toggle('is-excluded',state===states.exclude);
   const text=document.createElement('span');text.textContent=value;
   chip.append(icon(state===states.exclude?'minus':'check'),text,icon('x'));
   chip.addEventListener('click',()=>{setState(section.key,value,states.neutral);limit=10;render();opener.focus();});
   activeNode.append(chip);
  }
 }
 const n=selectedCount();openerLabel.textContent='Filtros ('+n+')';clear.hidden=n===0;
}
function syncPanel(){
 for(const section of sections){
  const node=groupsNode.querySelector('[data-filter-group="'+section.key+'"]');
  if(!node)continue;
  const selected=chosen.get(section.key);
  node.querySelector('[data-filter-count]').textContent=selected.size?' ('+selected.size+')':'';
  for(const option of node.querySelectorAll('[data-filter-value]')){
   const state=selected.get(option.dataset.filterValue)||states.neutral;
   option.setAttribute('aria-pressed',state===states.exclude?'mixed':String(state===states.include));
   option.classList.toggle('is-excluded',state===states.exclude);
   option.setAttribute('aria-label',(state===states.include?'Incluido: ':state===states.exclude?'Excluido: ':'Sin filtro: ')+option.dataset.filterValue+'. Pulsar para '+(state===states.neutral?'incluir':state===states.include?'excluir':'quitar el filtro'));
   const stateIcon=option.querySelector('.catalog-filter-option-state');
   stateIcon.replaceChildren();
   if(state!==states.neutral)stateIcon.append(icon(state===states.exclude?'minus':'check'));
  }
 }
 panelCount.textContent=found+' '+(found===1?'receta encontrada':'recetas encontradas');
}
function render(){
 const term=normalize(input.value.trim()),filtered=recipes.filter(r=>matches(r,term));found=filtered.length;
 list.replaceChildren(...filtered.slice(0,limit).map(tile));
 if(!filtered.length){const p=document.createElement('p');p.className='empty-state';p.textContent=recipes.length?'No hay recetas que coincidan con la búsqueda y los filtros.':'Todavía no hay recetas publicadas.';list.append(p);}
 count.textContent=found+' '+(found===1?'receta encontrada':'recetas encontradas');
 more.hidden=found<=limit;more.textContent='Mostrar 10 más';
 buildSummary();syncPanel();refreshIcons();
}
function constructPanel(){
 for(const section of sections){
  const options=[...new Set(recipes.flatMap(r=>values(r,section.key)))].sort((a,b)=>a.localeCompare(b,'es'));
  if(!options.length)continue;
  const group=document.createElement('section');group.className='catalog-filter-group';group.dataset.filterGroup=section.key;
  const id='catalog-options-'+section.key;
  const toggle=document.createElement('button');toggle.type='button';toggle.className='catalog-filter-section-toggle';
  toggle.setAttribute('aria-expanded',String(section.key!=='categoria_filtro'));toggle.setAttribute('aria-controls',id);
  const heading=document.createElement('span');heading.textContent=section.label;
  const tally=document.createElement('span');tally.dataset.filterCount='';heading.append(tally);
  toggle.append(heading,icon('chevron-down'));
  const optionsNode=document.createElement('div');optionsNode.className='catalog-filter-options';optionsNode.id=id;
  optionsNode.hidden=section.key==='categoria_filtro';
  toggle.addEventListener('click',()=>{const expanded=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!expanded));optionsNode.hidden=expanded;});
  for(const value of options){
   const button=document.createElement('button');button.type='button';button.className='catalog-filter-option';button.dataset.filterValue=value;button.setAttribute('aria-pressed','false');
   const stateIcon=document.createElement('span');stateIcon.className='catalog-filter-option-state';stateIcon.setAttribute('aria-hidden','true');
   const label=document.createElement('span');label.textContent=value;button.append(stateIcon,label);
   button.addEventListener('click',()=>{
    setState(section.key,value,nextState(getState(section.key,value)));
    limit=10;render();button.focus();
   });
   optionsNode.append(button);
  }
  group.append(toggle,optionsNode);groupsNode.append(group);
 }
 refreshIcons();
}
function openPanel(){origin=document.activeElement;overlay.hidden=false;document.body.classList.add('catalog-filters-open');close.focus();}
function closePanel(){overlay.hidden=true;document.body.classList.remove('catalog-filters-open');(origin&&origin.isConnected?origin:opener).focus();}
opener.addEventListener('click',openPanel);
close.addEventListener('click',closePanel);
done.addEventListener('click',closePanel);
overlay.addEventListener('click',e=>{if(e.target===overlay)closePanel();});
clear.addEventListener('click',()=>{for(const selection of chosen.values())selection.clear();limit=10;render();opener.focus();});
document.addEventListener('keydown',e=>{
 if(overlay.hidden)return;
 if(e.key==='Escape'){e.preventDefault();closePanel();return;}
 if(e.key!=='Tab')return;
 const focusables=[...dialog.querySelectorAll('button:not([disabled]):not([hidden]),[href],input:not([disabled])')].filter(el=>el.getClientRects().length);
 if(!focusables.length){e.preventDefault();dialog.focus();return;}
 const first=focusables[0],last=focusables[focusables.length-1];
 if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
 else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
});
input.addEventListener('input',()=>{limit=10;render();});
more.addEventListener('click',()=>{limit+=10;render();});
constructPanel();render();
})();