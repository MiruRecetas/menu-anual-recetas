
/* Hero de producción: secuencias independientes 9:16 y 16:9, 361 fotogramas WebP cada una.
   El progreso del gesto es canónico; anclas semánticas preservan el hito al rotar.
   No se cambia la imagen visible hasta decodificar la nueva orientación. */
const HERO_SETTINGS=JSON.parse(document.getElementById('hero-settings').textContent);
const FRAMES=HERO_SETTINGS.frames,FPS=HERO_SETTINGS.fps;
const LABEL_RANGES=HERO_SETTINGS.ranges;
const ANCHORS=HERO_SETTINGS.anchors;
const MATCHES=HERO_SETTINGS.matches;
function alignedFrame(frame,mode){
  if(mode==='vertical')return Math.round(frame);
  for(let i=1;i<MATCHES.length;i++){
    const [x1,y1]=MATCHES[i],[x0,y0]=MATCHES[i-1];
    if(frame<=x1)return Math.round(y0+(y1-y0)*Math.max(0,(frame-x0)/(x1-x0)));
  }return 360;
}
const HERO_BASE=document.documentElement.dataset.heroBase;
const frameUrl=(mode,i)=>`${HERO_BASE}/${mode}/${String(i+1).padStart(3,'0')}.webp`;
const ambientCanvas=document.getElementById('ambient'),ambientCtx=ambientCanvas.getContext('2d',{alpha:false,desynchronized:true});
ambientCanvas.width=96;ambientCanvas.height=171;
const canvases={vertical:document.getElementById('film-vertical'),horizontal:document.getElementById('film-horizontal')};
const contexts={};
for(const mode of ['vertical','horizontal']){
 const c=canvases[mode],ctx=c.getContext('2d',{alpha:false,desynchronized:true});
 contexts[mode]=ctx;ctx.imageSmoothingEnabled=true;
}
const gesture=document.getElementById('gesture-layer');
const scenes=[...document.querySelectorAll('.scene')];
const nav=[...document.querySelectorAll('.nav button')];
const progress=document.getElementById('progress');
const placeholder=document.getElementById('placeholder');
const decoded={vertical:new Map(),horizontal:new Map()};
const failed={vertical:new Set(),horizontal:new Set()};
const pending={vertical:new Set(),horizontal:new Set()};
const shown={vertical:-1,horizontal:-1};
const maxDecoded={vertical:22,horizontal:16};
let desired=innerWidth>innerHeight?'horizontal':'vertical',displayed='vertical';
let frozenHeight=innerHeight;
let goal=0,lastGoal=0,active=-1,running=0,offset=0,navAnimation=0,touchY=null,mouseY=null;
let sourceGeneration=0;
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function setLockedHeight(){frozenHeight=innerHeight;document.documentElement.style.setProperty('--hero-height',`${frozenHeight}px`)}
setLockedHeight();document.body.classList.toggle('is-landscape',desired==='horizontal');
const maxTravel=()=>Math.max(1,frozenHeight*HERO_SETTINGS.scrollMultiplier);
function setOffset(next){offset=clamp(next,0,maxTravel());update()}
function sceneAt(i,mode){const f=i+1;const groups=LABEL_RANGES[mode];for(const [j,name] of ['welcome','cocina','disfruta','conserva'].entries()){const [a,b]=groups[name];if(f>=a&&f<=b)return j}return -1}
function applyScene(index,mode){const s=sceneAt(index,mode);if(active===s)return;active=s;
 scenes.forEach((el,i)=>{el.classList.toggle('active',i===s);el.setAttribute('aria-hidden',i===s?'false':'true')});
 nav.forEach((el,i)=>{el.classList.toggle('current',i===s);el.setAttribute('aria-current',i===s?'step':'false')});
}
function closeBitmap(b){if(b&&typeof b.close==='function')b.close()}
function trimCache(mode){const cache=decoded[mode];const lim=mode===desired?maxDecoded[mode]:2;
 while(cache.size>lim){let victim=null,dist=-1;for(const k of cache.keys()){
   if(k===shown[mode]||k===goal&&mode===desired)continue;
   let d=Math.abs(k-goal);if(d>dist){dist=d;victim=k}
 }if(victim===null)break;closeBitmap(cache.get(victim));cache.delete(victim)}
}
function store(mode,i,b){const cache=decoded[mode];if(cache.has(i))closeBitmap(cache.get(i));cache.set(i,b);trimCache(mode)}
function paint(mode,i){const b=decoded[mode].get(i);if(!b)return false;
 if(shown[mode]!==i){contexts[mode].drawImage(b,0,0,canvases[mode].width,canvases[mode].height);shown[mode]=i}
 if(mode===desired){
  if(displayed!==mode){canvases[mode].classList.add('visible');canvases[displayed].classList.remove('visible');displayed=mode;trimCache(mode==='vertical'?'horizontal':'vertical')}
  ambientCtx.drawImage(b,0,0,96,171);placeholder.hidden=true;placeholder.style.display='none';applyScene(i,mode);
 }
 return true;
}
function nearest(mode){if(decoded[mode].has(goal))return goal;let b=-1,d=Infinity;
 for(const i of decoded[mode].keys()){const x=Math.abs(i-goal);if(x<d){d=x;b=i}}return b;
}
function render(){const i=nearest(desired);if(i<0)return;
 // During rotation never show a stale cached frame from a different scene.
 if(displayed!==desired && Math.abs(i-goal)>2)return;
 if(displayed===desired&&shown[desired]>=0&&!decoded[desired].has(goal)&&Math.abs(i-goal)>=Math.abs(shown[desired]-goal))return;
 paint(desired,i);
}
async function decodeFrame(mode,i){const img=new Image();img.decoding='async';img.src=frameUrl(mode,i);await img.decode();
 if('createImageBitmap' in window){const b=await createImageBitmap(img);img.src='';return b}return img;
}
function candidates(){const arr=[goal],sign=goal>=lastGoal?1:-1;
 for(let d=1;arr.length<maxDecoded[desired]-2;d++)arr.push(goal+d*sign,goal-d*sign);
 return [...new Set(arr)].filter(i=>i>=0&&i<FRAMES&&!decoded[desired].has(i)&&!pending[desired].has(i)&&!failed[desired].has(i));
}
function pump(){while(running<3){const i=candidates()[0];if(i===undefined)break;
 const mode=desired;running++;pending[mode].add(i);
 decodeFrame(mode,i).then(b=>{
  if(mode!==desired || Math.abs(i-goal)>16&&shown[mode]>=0)closeBitmap(b);
  else{store(mode,i,b);render()}
 }).catch(e=>{failed[mode].add(i);console.warn('Hero frame error',mode,i+1,e);if(shown[mode]<0&&i===goal&&mode===desired)placeholder.textContent='No se ha podido cargar la cocina.'})
 .finally(()=>{pending[mode].delete(i);running--;pump()});
}}
window.addEventListener('online',()=>{failed.vertical.clear();failed.horizontal.clear();pump()});
function update(){const p=clamp(offset/maxTravel(),0,1);const virtualFrame=Math.round(p*360);
 lastGoal=goal;goal=alignedFrame(virtualFrame,desired);
 progress.style.width=`${(p*100).toFixed(2)}%`;render();pump();
 gesture.setAttribute('aria-valuenow',String(Math.round(p*100)));
 gesture.setAttribute('aria-valuetext',`${Math.round(p*100)} % del recorrido`);
}
function switchIfNecessary(){const next=innerWidth>innerHeight?'horizontal':'vertical';
 if(next===desired)return;cancelNav();touchActive=false;touchY=null;mouseY=null;
 const p=clamp(offset/maxTravel(),0,1);
 desired=next;document.body.classList.toggle('is-landscape',next==='horizontal');
 if(next==='horizontal')fullscreenAttemptedLandscape=false;
 // Al volver a vertical, no se fuerza a permanecer en pantalla completa.
 if(next==='vertical' && document.fullscreenElement && document.exitFullscreen){document.exitFullscreen().catch(()=>{});}
 setLockedHeight();offset=p*maxTravel();sourceGeneration++;
 update(); if(typeof applyFraming==='function')applyFraming();
}
// El colapso de la barra de Chrome no cambia la orientación; no reajusta la altura.
window.addEventListener('resize',switchIfNecessary,{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(switchIfNecessary,180),{passive:true});
const orientationMedia=window.matchMedia?window.matchMedia('(orientation: landscape)'):null;
if(orientationMedia&&orientationMedia.addEventListener)orientationMedia.addEventListener('change',()=>setTimeout(switchIfNecessary,90));
function cancelNav(){if(navAnimation){cancelAnimationFrame(navAnimation);navAnimation=0}}
function navigateTo(frame){cancelNav();const start=offset,target=(frame-1)/360*maxTravel();const duration=520,begin=performance.now();
 function step(now){const t=clamp((now-begin)/duration,0,1),e=t*t*(3-2*t);
 setOffset(start+(target-start)*e);if(t<1)navAnimation=requestAnimationFrame(step);else navAnimation=0;}
 navAnimation=requestAnimationFrame(step);
}
let touchActive=false;
gesture.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;cancelNav();touchY=e.touches[0].clientY;touchActive=true},{passive:true});
gesture.addEventListener('touchmove',e=>{if(!touchActive||e.touches.length!==1)return;e.preventDefault();const y=e.touches[0].clientY;if(touchY!==null)setOffset(offset+touchY-y);touchY=y},{passive:false});
gesture.addEventListener('touchend',()=>{
 touchActive=false;touchY=null;
 // Chrome exige activación de usuario: touchend es un gesto válido, girar el dispositivo NO.
 // La solicitud se dispara SIN await ni setTimeout, durante el propio gesto.
 tryEnterLandscapeFullscreen();
},{passive:true});
gesture.addEventListener('touchcancel',()=>{touchActive=false;touchY=null},{passive:true});
window.addEventListener('wheel',e=>{if(e.ctrlKey)return;e.preventDefault();cancelNav();const d=e.deltaMode===1?e.deltaY*18:e.deltaMode===2?e.deltaY*frozenHeight:e.deltaY;setOffset(offset+d)},{passive:false});
gesture.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0){cancelNav();mouseY=e.clientY;gesture.setPointerCapture(e.pointerId)}});
gesture.addEventListener('pointermove',e=>{if(mouseY!==null&&e.pointerType==='mouse'&&e.buttons===1){setOffset(offset+mouseY-e.clientY);mouseY=e.clientY}});
gesture.addEventListener('pointerup',()=>{mouseY=null});gesture.addEventListener('pointercancel',()=>{mouseY=null});
window.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||e.target.closest('a,button,input'))return;
 let d=0;if(e.key==='ArrowDown')d=frozenHeight*.16;if(e.key==='ArrowUp')d=-frozenHeight*.16;
 if(e.key==='PageDown'||e.key===' ')d=frozenHeight*.70;if(e.key==='PageUp')d=-frozenHeight*.70;
 if(e.key==='Home'||e.key==='End'){e.preventDefault();cancelNav();setOffset(e.key==='Home'?0:maxTravel());return}
 if(d){e.preventDefault();cancelNav();setOffset(offset+d)}});
nav.forEach((b,i)=>b.addEventListener('click',()=>navigateTo(ANCHORS[i])));
// Diagnostic API for responsive validation; no permanent debug UI in approved vertical design.
window.MiruRecetasHeroResponsive={
 getStatus(){return{desired,displayed,verticalFrame:shown.vertical+1,horizontalFrame:shown.horizontal+1,goalFrame:goal+1,section:active,decoded:{vertical:decoded.vertical.size,horizontal:decoded.horizontal.size},pending:running,failed:{vertical:failed.vertical.size,horizontal:failed.horizontal.size},progress:Math.round(offset/maxTravel()*1000)/10}},
 seekFrame(frame){setOffset(clamp(frame-1,0,360)/360*maxTravel())},
 switchIfNecessary
};
/* Los menús se controlan mediante la cabecera compartida. */
update();

// Demo 13: siempre cubrir el área horizontal (sin selector ni recorte de los WebP).
// La API de pantalla completa exige una interacción real del usuario. El giro por sí solo no basta.
let fullscreenAttemptedLandscape=false;
const isTouchLandscape=()=>desired==='horizontal' && window.matchMedia('(pointer: coarse)').matches;
function framingZoom(){
 if(desired!=='horizontal')return 1;
 const ratio=innerWidth/Math.max(1,frozenHeight);
 return Math.max(ratio/(16/9),(16/9)/ratio);
}
function applyFraming(){
 document.documentElement.style.setProperty('--horizontal-zoom',framingZoom().toFixed(5));
}
function tryEnterLandscapeFullscreen(){
 if(!isTouchLandscape() || fullscreenAttemptedLandscape || document.fullscreenElement || !document.documentElement.requestFullscreen)return;
 fullscreenAttemptedLandscape=true;
 // No mostrar avisos ni bloquear el gesto: si Chrome lo rechaza, se mantiene 'Llenar'.
 try{
  const request=document.documentElement.requestFullscreen({navigationUI:'hide'});
  if(request?.catch)request.catch(()=>{});
 }catch(_){/* HTML content:// y navegadores con restricciones pueden denegarlo. */}
}
function refreshActualViewport(){
 const p=clamp(offset/maxTravel(),0,1);
 setLockedHeight();offset=p*maxTravel();
 applyFraming();update();
}
document.addEventListener('fullscreenchange',()=>{
 requestAnimationFrame(()=>requestAnimationFrame(refreshActualViewport));
});
// Ignorar la ocultación de barras de Chrome mientras no cambia la orientación.
window.addEventListener('orientationchange',()=>setTimeout(applyFraming,240),{passive:true});
window.addEventListener('resize',()=>{
 if((innerWidth>innerHeight?'horizontal':'vertical')===desired){
  if(document.fullscreenElement || !window.matchMedia('(pointer: coarse)').matches)requestAnimationFrame(refreshActualViewport);
  // Se recalcula el factor de llenado si se modifica el ancho, sin recargar escenas.
  else requestAnimationFrame(applyFraming);
 }else requestAnimationFrame(applyFraming);
},{passive:true});
applyFraming();
window.MiruRecetasHeroResponsive.getFramingStatus=()=>({mode:'fill',zoom:framingZoom(),fullscreen:!!document.fullscreenElement,attempted:fullscreenAttemptedLandscape,viewport:[innerWidth,innerHeight],lockedHeight:frozenHeight});