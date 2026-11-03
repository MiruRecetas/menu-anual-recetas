"use strict";
/* MiruRecetas · CT230B · motor TSPL integrado, diseños V0.6.2/V0.7.3/V0.9.\n * Derivado del motor aprobado y mantenido exclusivamente en la fuente privada canónica. */
// Los datos proceden exclusivamente del JSON canónico incrustado por generar.py.
// No hay carga remota, ni dependencia del laboratorio histórico.
const labelElement=document.getElementById("label-recipe-data");
if(!labelElement)throw Error("Datos de etiquetado de la receta no disponibles.");
const rawRecipe=JSON.parse(labelElement.textContent);
if(!rawRecipe||!/^r[0-9]{3,}$/.test(rawRecipe.qrId)||
 !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rawRecipe.slug)||
 typeof rawRecipe.name!=="string"||!rawRecipe.name.trim()||
 !Number.isInteger(rawRecipe.portions)||rawRecipe.portions<1||
 !["kcal","protein","carbs","fat"].every(key=>Number.isFinite(rawRecipe[key])&&rawRecipe[key]>=0))
 throw Error("Datos canónicos insuficientes o inválidos para imprimir.");
const shortUrl="https://mirurecetas.github.io/#"+rawRecipe.qrId;
const PANEL_RECIPE=Object.freeze({...rawRecipe,
 shortUrl,url:shortUrl,
 canonicalUrl:"https://mirurecetas.github.io/menu-anual-recetas/recetas/"+rawRecipe.slug+"/",
 instructionLines:Object.freeze(Array.isArray(rawRecipe.instructionLines)&&rawRecipe.instructionLines.length===2?rawRecipe.instructionLines:["",""]),
 noteLines:Object.freeze(Array.isArray(rawRecipe.noteLines)?rawRecipe.noteLines:[])
});

let PANEL_RENDER_NAME=rawRecipe.name;
let PANEL_NOTE_LINES=["",""];
function panelWidth(text,font){const c=document.createElement("canvas").getContext("2d");c.font=font;return c.measureText(text).width}
function panelSplitNote(text){
 if(!text)return ["",""];
 const lines=[""],constraints=[['italic 500 20px "Geist"',300],['500 19px "Geist"',386]];
 const fits=t=>constraints.every(([f,w])=>panelWidth(t,f)<=w);
 for(const word of text.trim().split(/\s+/)){
  const candidate=(lines[lines.length-1]?lines[lines.length-1]+" ":"")+word;
  if(fits(candidate))lines[lines.length-1]=candidate;
  else if(lines.length===1&&fits(word))lines.push(word);
  else throw Error("La nota editorial no cabe en el formato aprobado.");
 }
 return [lines[0],lines[1]||""];
}
function panelCompactNameSize(name){
 for(let px=46;px>=25;px--){
  if(panelWidth(name,'700 '+px+'px "Bricolage Grotesque"')<=475)return px;
 }
 return NaN;
}
function panelCheckFormat(format,printing=false){
 if(!Object.hasOwn(PANEL_FORMATS,format))throw Error("Formato desconocido.");
 const limits={vertical:['700 45px "Bricolage Grotesque"',529],horizontal:['700 30px "Bricolage Grotesque"',795],component:['700 46px "Bricolage Grotesque"',475]};
 const [font,max]=limits[format];
 // 50×30 prioriza siempre el nombre corto; si no existe, usa el canónico.
 // El título se ajusta automáticamente entre 46 y 25 px en el dibujado,
 // sin exigir modificar el JSON por una mera necesidad de tamaño tipográfico.
 let name=format==="component"?(PANEL_RECIPE.shortName||PANEL_RECIPE.name):PANEL_RECIPE.name;
 if(format==="component"){
  if(!Number.isFinite(panelCompactNameSize(name)))
   throw Error("No se ha podido componer el título en el espacio aprobado.");
 }else if(panelWidth(name,font)>max){
  const short=PANEL_RECIPE.shortName;
  if(!short||panelWidth(short,font)>max)throw Error("El nombre no cabe: falta abreviación aprobada.");
  name=short;
 }
 PANEL_RENDER_NAME=name;
 const lines=PANEL_RECIPE.instructionLines;
 if(printing&&(lines.length!==2||lines.some(x=>typeof x!=="string"||!x.trim())))throw Error("Faltan instrucciones específicas de esta receta.");
 if(lines.length===2&&lines.some(x=>x)&&format!=="horizontal"){
  const maxLine=format==="component"?386:308,fontLine=format==="component"?'400 23px "Geist"':'500 23px "Geist"';
  if(lines.some(x=>panelWidth(x,fontLine)>maxLine))throw Error("Las instrucciones no caben sin recorte.");
 }
 PANEL_NOTE_LINES=panelSplitNote(PANEL_RECIPE.note);
 return name;
}
function panelAddCivilDays(iso,days){
 if(!Number.isInteger(days)||days<1)throw Error("Plazo de calidad inválido.");
 panelDate(iso,true);
 const [y,m,d]=iso.split("-").map(Number),date=new Date(y,m-1,d,12);
 date.setDate(date.getDate()+days);
 return date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0");
}
function panelQualityDate(iso){
 if(!PANEL_RECIPE.conservationValidated||!Number.isInteger(PANEL_RECIPE.qualityDays)||PANEL_RECIPE.qualityDays<1)return "";
 return panelAddCivilDays(iso,PANEL_RECIPE.qualityDays);
}

const encoder=new TextEncoder();
function joinBuffers(...parts){
 const result=new Uint8Array(parts.reduce((sum,x)=>sum+x.byteLength,0));
 let offset=0;for(const p of parts){result.set(p,offset);offset+=p.byteLength}
 return result;
}
const V5_RECIPE=PANEL_RECIPE;
let v5Logo=null;

function v5Formatted(iso){
 const [year,month,day]=iso.split("-");
 return day+"/"+month+"/"+year.slice(2);
}

function v5Text(ctx,font,text,x,y,maxWidth){
 ctx.font=font;ctx.fillStyle="#000";
 if(maxWidth===undefined)ctx.fillText(text,x,y);else ctx.fillText(text,x,y,maxWidth);
}

function v5ToTsplBitmap(canvas){
 const ctx=canvas.getContext("2d",{willReadFrequently:true});
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
 const widthBytes=Math.ceil(canvas.width/8),bytes=new Uint8Array(widthBytes*canvas.height);
 bytes.fill(255);
 for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
  const off=(y*canvas.width+x)*4;
  // Antialias threshold intentionally avoids bloated strokes on thermal stock.
  const luminance=.2126*pixels[off]+.7152*pixels[off+1]+.0722*pixels[off+2];
  if(luminance<150)bytes[y*widthBytes+(x>>3)] &= ~(0x80>>(x&7));
 }
 return {bytes,widthBytes,height:canvas.height};
}


"use strict";
/* MiruRecetas · laboratorio BLE v0.6 · 50×80 mm vertical.
 * Fuente de diseño: Canva "01 · Ración completa · propuesta v1" (189×302 canvas).
 * Reproduce los bloques y el orden de la composición aprobada como piloto,
 * con corrección del anillo 4/4/9 sin añadir el donut de color superpuesto.
 * Los campos siguen siendo dinámicos; no contiene expiraciones inventadas.
 * Reutiliza la carga de identidad oficial y transporte BLE ya validado en v0.5.
 * Experimental: no implica adhesión en congelador ni aprobacion de producción.
 */
const V6_W=590,V6_H=945,V6_QR={x:352,y:638,module:5};
const V6_BANDS=Object.freeze([
 {x:0,y:0,w:576,h:115,label:"cabecera"},
 {x:0,y:130,w:576,h:275,label:"anillo y macros"},
 {x:0,y:430,w:576,h:92,label:"fechas"},
 {x:0,y:546,w:344,h:300,label:"descongelación"},
 {x:0,y:873,w:576,h:72,label:"marca inferior"}
]);
const V6_EL=id=>document.getElementById(id);
let v6Ready=false,v6Rendering=false;
const V6_MACROS=Object.freeze([
 {key:"protein",abbr:"PR",grams:V5_RECIPE.protein,kcal:V5_RECIPE.protein*4},
 {key:"carbs",abbr:"HC",grams:V5_RECIPE.carbs,kcal:V5_RECIPE.carbs*4},
 {key:"fat",abbr:"GR",grams:V5_RECIPE.fat,kcal:V5_RECIPE.fat*9}
]);
function v6Ratios(){
 const total=V6_MACROS.reduce((s,m)=>s+m.kcal,0);
 return V6_MACROS.map(m=>({...m,ratio:m.kcal/total}));
}
function v6Str(g){return g.toFixed(2).replace(".",",")+" g";}
function v6Dates(){
 const packed=V6_EL("v6Packed").value,expires=V6_EL("v6Expiry").value;
 for(const iso of [packed,expires]){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(iso) || Number.isNaN(Date.parse(iso)) ||
      new Date(iso+"T12:00:00").toISOString().slice(0,10)!==iso)
   throw Error("Selecciona dos fechas de calendario válidas.");
 }
 if(expires<packed)throw Error("Consumo preferente no puede preceder al envasado.");
 return {packed:v5Formatted(packed),expires:v5Formatted(expires)};
}
function v6Text(c,font,text,x,y,maxWidth){
 c.font=font;c.fillStyle="#000";
 if(maxWidth!==undefined)c.fillText(text,x,y,maxWidth);
 else c.fillText(text,x,y);
}
function v6PatternSquare(c,key,x,y){
 const S=24;c.save();c.beginPath();c.rect(x,y,S,S);c.clip();
 if(key==="protein"){c.fillStyle="#000";c.fillRect(x,y,S,S);}
 if(key==="carbs"){
  c.strokeStyle="#000";c.lineWidth=3;
  for(let t=-S;t<=2*S;t+=9){c.beginPath();c.moveTo(x+t,y+S);c.lineTo(x+t+S,y);c.stroke();}
 }
 if(key==="fat"){
  c.fillStyle="#000";
  for(let py=y+3;py<y+S;py+=7)for(let px=x+3;px<x+S;px+=7)
   c.fillRect(px,py,3,3);
 }
 c.restore();c.strokeStyle="#000";c.lineWidth=2;c.strokeRect(x,y,S,S);
}
function v6Ring(c,cx,cy){
 const outer=122,inner=75,arcs=[];
 let angle=-Math.PI/2;
 for(const m of v6Ratios()){
  const end=angle+2*Math.PI*m.ratio;
  c.save();c.beginPath();
  c.arc(cx,cy,outer,angle,end,false);
  c.arc(cx,cy,inner,end,angle,true);
  c.closePath();c.clip();
  if(m.key==="protein"){
   c.fillStyle="#000";c.fillRect(cx-outer,cy-outer,2*outer,2*outer);
  }else if(m.key==="carbs"){
   c.strokeStyle="#000";c.lineWidth=3;
   for(let t=-2*outer;t<2*outer;t+=12){
    c.beginPath();c.moveTo(cx-outer+t,cy+outer);c.lineTo(cx+outer+t,cy-outer);c.stroke();
   }
  }else{
   c.fillStyle="#000";
   for(let yy=cy-outer;yy<=cy+outer;yy+=11)
    for(let xx=cx-outer;xx<=cx+outer;xx+=11){
     c.beginPath();c.arc(xx,yy,2,0,2*Math.PI);c.fill();
    }
  }
  c.restore();arcs.push(angle);angle=end;
 }
 c.strokeStyle="#000";c.lineWidth=3;
 for(const radius of [inner,outer]){c.beginPath();c.arc(cx,cy,radius,0,Math.PI*2);c.stroke();}
 for(const theta of arcs){
  c.beginPath();c.moveTo(cx+inner*Math.cos(theta),cy+inner*Math.sin(theta));
  c.lineTo(cx+outer*Math.cos(theta),cy+outer*Math.sin(theta));c.stroke();
 }
 c.textAlign="center";c.textBaseline="alphabetic";
 v6Text(c,'700 33px "Bricolage Grotesque"',PANEL_RECIPE.kcalDisplay,cx,cy+6,138);
 v6Text(c,'500 22px "Geist"',"kcal",cx,cy+34);
 c.textAlign="left";
}
function v6Render(dates){
 if(!v5Logo)throw Error("No se ha cargado el isotipo oficial BN.");
 const cv=document.createElement("canvas");cv.width=V6_W;cv.height=V6_H;
 const c=cv.getContext("2d",{willReadFrequently:true});if(!c)throw Error("Canvas 2D no disponible.");
 c.fillStyle="#fff";c.fillRect(0,0,cv.width,cv.height);
 c.textBaseline="alphabetic";c.imageSmoothingEnabled=true;
 // Cabecera editorial del Canva: título protagonista, sin nueva marca encima.
 v6Text(c,'700 45px "Bricolage Grotesque"',PANEL_RENDER_NAME,30,81,529);
 // Anillo y leyenda: P 19,14 %, HC 33,06 %, G 47,80 % por energía de macros.
 v6Ring(c,148,265);
 const xs=320,abbrX=361,valueX=564;
 c.textAlign="right";
 for(let i=0;i<V6_MACROS.length;i++){
  const m=V6_MACROS[i],yy=190+i*82;
  v6PatternSquare(c,m.key,xs,yy-25);
  c.textAlign="left";
  v6Text(c,'500 27px "Geist"',m.abbr,abbrX,yy);
  c.textAlign="right";
  v6Text(c,'700 29px "Geist"',v6Str(m.grams),valueX,yy,140);
 }
 c.textAlign="left";
 // Fechas reales elegidas manualmente por la usuaria.
 v6Text(c,'500 23px "Geist"',"Envasado y congelación",28,461,330);
 c.textAlign="right";v6Text(c,'700 25px "Geist"',dates.packed,562,461);c.textAlign="left";
 v6Text(c,'500 23px "Geist"',"Consumo preferente",28,501,330);
 c.textAlign="right";v6Text(c,'700 25px "Geist"',dates.expires,562,501);c.textAlign="left";
 // Zona inferior en la columna izquierda, conservando el espacio nativo para el QR.
 v6Text(c,'700 26px "Bricolage Grotesque"',"DESCONGELACIÓN",28,581,310);
 v6Text(c,'700 26px "Bricolage Grotesque"',"Y CONSUMO",28,616,310);
 v6Text(c,'500 23px "Geist"',PANEL_RECIPE.instructionLines[0],28,686,308);
 v6Text(c,'500 23px "Geist"',PANEL_RECIPE.instructionLines[1],28,715,308);
 if(PANEL_RECIPE.note?.trim()){
  v6Text(c,'700 25px "Bricolage Grotesque"',"NOTA",28,767);
  v6Text(c,'italic 500 20px "Geist"',PANEL_NOTE_LINES[0],28,797,300);
  if(PANEL_NOTE_LINES[1])v6Text(c,'italic 500 20px "Geist"',PANEL_NOTE_LINES[1],28,826,310);
 }
 // Pie de firma aprobado: icono exacto BN + palabra en tipografía oficial.
 c.drawImage(v5Logo,156,888,43,43);
 v6Text(c,'600 37px "Bricolage Grotesque"',"MiruRecetas",216,921,340);
 return cv;
}
function v6Crop(src,band){
 const cv=document.createElement("canvas");cv.width=band.w;cv.height=band.h;
 const c=cv.getContext("2d",{willReadFrequently:true});
 c.drawImage(src,band.x,band.y,band.w,band.h,0,0,band.w,band.h);
 return cv;
}
function v6Qr(){
 return 'QRCODE '+V6_QR.x+','+V6_QR.y+',M,'+V6_QR.module+',A,0,M2,S7,"'+V5_RECIPE.url+'"';
}
function v6Header(){return "SIZE 50 mm,80 mm\r\nGAP 2 mm,0 mm\r\nDIRECTION 0\r\nCLS\r\n";}
function v6Build(dates){
 const canvas=v6Render(dates),buffers=[encoder.encode(v6Header())];
 for(const b of V6_BANDS){
  const raster=v5ToTsplBitmap(v6Crop(canvas,b));
  buffers.push(encoder.encode("BITMAP "+b.x+","+b.y+","+raster.widthBytes+","+raster.height+",0,"));
  buffers.push(raster.bytes);
  buffers.push(encoder.encode("\r\n"));
 }
 // 2–3 dot borders avoid invisible rules seen in the 50x30 test.
 for(const y of [119,415,530,861])buffers.push(encoder.encode("BAR 26,"+y+",531,3\r\n"));
 // QR native TSPL, same actual URL as successful v0.5 trial.
 buffers.push(encoder.encode(v6Qr()+"\r\nPRINT 1,1\r\n"));
 return joinBuffers(...buffers);
}

"use strict";
/* V0.6.2 · ETIQUETA IGUAL A V0.6, RASTER PARCELADO Y DISPERSO.
 * Hipótesis por comprobar: la carga binaria de 53.146 B puede exceder
 * capacidades de recepción/impresión sostenida del equipo.
 * NO se altera el diseño, las fuentes, macros, patrón, densidad ni QR.
 * Las bandas orig. se dividen en 7 regiones no solapadas y cortes de
 * máximo 12 filas. Solo se transmiten columnas/filas con tinta.
 * No es un resultado validado físicamente ni una solución garantizada.
 */
const V62_EL=id=>document.getElementById(id);
const V62_MAX_BYTES=35000;
const V62_STRIPE_ROWS=12;
const V62_REGIONS=Object.freeze([
 {x:0,y:0,w:576,h:115,label:"cabecera"},
 {x:0,y:130,w:304,h:275,label:"anillo"},
 {x:304,y:130,w:272,h:275,label:"macros"},
 {x:0,y:430,w:416,h:92,label:"fecha textos"},
 {x:416,y:430,w:160,h:92,label:"fecha numeros"},
 {x:0,y:546,w:344,h:300,label:"descongelacion"},
 {x:0,y:873,w:576,h:72,label:"firma"}
]);
function v62SparseRegion(src,region){
 const raster=v5ToTsplBitmap(v6Crop(src,region));
 const blocks=[];
 const stride=raster.widthBytes, bytes=raster.bytes;
 for(let y=0;y<raster.height;y+=V62_STRIPE_ROWS){
  const end=Math.min(raster.height,y+V62_STRIPE_ROWS);
  let minCol=stride,maxCol=-1,minRow=end,maxRow=-1;
  for(let iy=y;iy<end;iy++)for(let ix=0;ix<stride;ix++){
   if(bytes[iy*stride+ix]===255)continue;
   minCol=Math.min(minCol,ix);maxCol=Math.max(maxCol,ix);
   minRow=Math.min(minRow,iy);maxRow=Math.max(maxRow,iy);
  }
  if(maxCol<0)continue;
  const w=maxCol-minCol+1,h=maxRow-minRow+1;
  const cropped=new Uint8Array(w*h);
  for(let iy=minRow;iy<=maxRow;iy++){
   cropped.set(bytes.subarray(iy*stride+minCol,iy*stride+maxCol+1),(iy-minRow)*w);
  }
  blocks.push({x:region.x+minCol*8,y:region.y+minRow,widthBytes:w,height:h,bytes:cropped,label:region.label});
 }
 return blocks;
}
function v62Build(dates){
 const canvas=v6Render(dates),all=[];
 for(const region of V62_REGIONS)all.push(...v62SparseRegion(canvas,region));
 const parts=[encoder.encode(v6Header())];
 for(const tile of all){
  parts.push(encoder.encode("BITMAP "+tile.x+","+tile.y+","+tile.widthBytes+","+tile.height+",0,"));
  parts.push(tile.bytes);
  parts.push(encoder.encode("\r\n"));
 }
 for(const y of [119,415,530,861])parts.push(encoder.encode("BAR 26,"+y+",531,3\r\n"));
 parts.push(encoder.encode(v6Qr()+"\r\nPRINT 1,1\r\n"));
 const job=joinBuffers(...parts);
 return {job,blocks:all.length,rasterBytes:all.reduce((s,t)=>s+t.bytes.length,0)};
}

"use strict";
/* V0.7.3 · SVG CANVA ORIGINAL 20261030_200122_0000.svg
 * INDEPENDIENTE de label-p15-horizontal-svg.js y de la reconstrucción del agente.
 * Referencia visual: SVG real aportado por la usuaria (lienzo vertical
 * 141.75 × 226.50 unidades), renderizado e inspeccionado girado 90°.
 * Mapa editorial fiel: 945×590 -> 590×945 a -90° en el rollo de 50×80 mm.
 * Reserva de logo en la esquina derecha del encabezado (activo oficial BN),
 * banda gruesa completa bajo el título, banda fina PARCIAL tras las fechas,
 * instrucciones y nota a la izquierda, kcal/macros/QR a la derecha.
 * Solo QR es nativo. Los separadores se imprimen en bandas raster de 12 filas.
 * No se añade ningún anillo ni se altera el contenido editorial.
 */
const V7_W=590,V7_H=945,V7_LW=945,V7_LH=590;
// V0.7.2 emitió 35.026 B: +26 B sobre el límite preventivo de 35.000.
// Este tope propio de V7 admite margen acotado sin cambiar ni un píxel,
// número de copias, chunk BLE, ritmo, orden de comandos ni QRCODE.
// Otros ensayos conservan sus límites independientes.
const V7_LIMIT=36000,V7_QR=Object.freeze({x:345,y:58,module:5});
// Líneas con cotas exactas del SVG horizontal Canva (945×590); antes de rotar.
const V7_LANDSCAPE_RULES=Object.freeze([
  {x:0,y:109,w:945,h:21},
  {x:0,y:251,w:518,h:7}
]);
const V7_REGIONS=Object.freeze([
  {x:0,y:0,w:109,h:945,label:"título e isotipo"},
  {x:109,y:0,w:21,h:945,label:"línea gruesa raster; geometría SVG"},
  {x:130,y:0,w:121,h:945,label:"fechas y calorías"},
  {x:251,y:0,w:94,h:945,label:"encabezado y macros"},
  {x:345,y:260,w:245,h:685,label:"instrucciones y nota"},
  {x:550,y:0,w:40,h:260,label:"margen junto a QR"}
]);
const V7_RECIPE=Object.freeze({
 name:PANEL_RENDER_NAME,kcal:PANEL_RECIPE.kcalDisplay,
 protein:PANEL_RECIPE.proteinDisplay,carbs:PANEL_RECIPE.carbsDisplay,fat:PANEL_RECIPE.fatDisplay,
 heading:"DESCONGELACIÓN Y CONSUMO",
 instruction:PANEL_RECIPE.instruction,
 noteHeading:"NOTA",note:PANEL_RECIPE.note||"",
 url:PANEL_RECIPE.shortUrl
});
const v7ById=id=>document.getElementById(id);
let v7Ready=false,v7Busy=false,v7TrimmedLogo=null;
// En Chrome, el SVG original sin width/height tiene tamaño intrínseco 150x150.
// Recortar el SVG directamente en drawImage(...) produjo una imagen VACÍA.
// Primero lo rasterizamos completo en un canvas de alta resolución y recortamos
// allí la caja alfa real. Las seis piezas del isotipo permanecen intactas.
function v7GetVisibleLogo(){
  if(v7TrimmedLogo)return v7TrimmedLogo;
  if(!v5Logo)throw Error("Isotipo oficial BN no cargado.");
  const n=512,base=document.createElement("canvas");
  base.width=n;base.height=n;
  const g=base.getContext("2d",{willReadFrequently:true});
  g.clearRect(0,0,n,n);g.drawImage(v5Logo,0,0,n,n);
  const data=g.getImageData(0,0,n,n).data;
  let minX=n,minY=n,maxX=-1,maxY=-1,count=0;
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
    if(data[(y*n+x)*4+3]>24){
      if(x<minX)minX=x;if(x>maxX)maxX=x;
      if(y<minY)minY=y;if(y>maxY)maxY=y;
      count++;
    }
  }
  if(count<1000||maxX<=minX||maxY<=minY)
    throw Error("Isotipo sin píxeles visibles: impresión bloqueada.");
  const tight=document.createElement("canvas");
  tight.width=maxX-minX+1;tight.height=maxY-minY+1;
  tight.getContext("2d").drawImage(base,minX,minY,tight.width,tight.height,
    0,0,tight.width,tight.height);
  v7TrimmedLogo=tight;
  return tight;
}
function v7Date(iso){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(iso)||!Number.isFinite(Date.parse(iso))||
    new Date(iso+"T12:00:00").toISOString().slice(0,10)!==iso)
     throw Error("Fecha de calendario no válida.");
  return v5Formatted(iso);
}
function v7GetData(preview=false){
  const p=v7ById("v7Packed").value,e=v7ById("v7Expiry").value;
  if(!preview&&(!p||!e))throw Error("Indica las dos fechas.");
  if(p&&e&&e<p)throw Error("Consumo preferente anterior al envasado.");
  return {...V7_RECIPE, packed:p?v7Date(p):"__/__/__", expiry:e?v7Date(e):"__/__/__"};
}
// Medidas y cajas originales del SVG, NO escalar letras horizontalmente.
function v7Text(ctx,str,x,y,size,weight="500",family="Geist",max=Infinity,min=13,italic=false){
  let fontSize=size,sty=italic?"italic ":"";
  while(fontSize>=min){
    ctx.font=sty+weight+" "+fontSize+'px "'+family+'"';
    if(ctx.measureText(str).width<=max)break;
    fontSize--;
  }
  if(fontSize<min)throw Error("No cabe la cadena completa en la zona de Canva: "+str);
  ctx.fillStyle="#000";ctx.fillText(str,x,y);
}
function v7Lines(ctx,str,x,y,maxWidth,size,weight="400",maxLines=4,italic=false,minSize=18){
  const words=str.trim().split(/\s+/);
  // Reducir suavemente el tamaño únicamente si el CONTENIDO de la receta
  // requiere más espacio que el texto de muestra del SVG.
  for(let test=size;test>=minSize;test--){
    ctx.font=(italic?"italic ":"")+weight+" "+test+'px "Geist"';
    let lines=[],current="",failed=false;
    for(const word of words){
      if(ctx.measureText(word).width>maxWidth){failed=true;break;}
      const candidate=current?current+" "+word:word;
      if(ctx.measureText(candidate).width<=maxWidth){current=candidate;}
      else{if(current)lines.push(current);current=word;}
    }
    if(current)lines.push(current);
    if(!failed&&lines.length<=maxLines){
      for(let i=0;i<lines.length;i++)
        v7Text(ctx,lines[i],x,y+i*(test+6),test,weight,"Geist",maxWidth,test,italic);
      return lines.length;
    }
  }
  throw Error("Instrucciones completas no caben en el bloque del SVG.");
}
function v7Render(d){
  if(!v5Logo)throw Error("No está cargado el isotipo oficial BN.");
  const landscape=document.createElement("canvas");
  landscape.width=V7_LW;landscape.height=V7_LH;
  const c=landscape.getContext("2d",{willReadFrequently:true});
  if(!c)throw Error("El navegador no permite Canvas 2D.");
  c.fillStyle="#fff";c.fillRect(0,0,V7_LW,V7_LH);
  c.textAlign="left";c.textBaseline="alphabetic";c.imageSmoothingEnabled=true;
  // Bloque superior del SVG: tipografía protagonista + reserva exacta del logo.
  v7Text(c,PANEL_RENDER_NAME,19,87,66,"700","Bricolage Grotesque",795,30);
  // SVG BN oficial: recorte de márgenes ya RASTERIZADO, preservando formas.
  c.drawImage(v7GetVisibleLogo(),838,8,94,80);
  // Fechas a la izquierda del módulo energético; coordenadas del SVG.
  v7Text(c,"Envasado y congelación",26,168,25,"400","Geist",350,20);
  v7Text(c,"Consumo preferente",26,212,25,"400","Geist",350,20);
  v7Text(c,d.packed,396,168,25,"700","Geist",147,20);
  v7Text(c,d.expiry,396,212,25,"700","Geist",147,20);
  // Cifras y columnas PR/HC/GR exactamente en el área DERECHA.
  v7Text(c,d.kcal,668,194,65,"700","Bricolage Grotesque",250,40);
  v7Text(c,"kcal",743,227,27,"400","Geist",100,20);
  for(const [x,number,abbr] of [
    [614,d.protein,"PR"],[729,d.carbs,"HC"],[843,d.fat,"GR"]
  ]){
    v7Text(c,number+" g",x,267,24,"700","Geist",105,17);
    v7Text(c,abbr,x+26,296,20,"400","Geist",64,16);
  }
  // Instrucciones bajo la regla PARCIAL, no reordenadas ni superpuestas al QR.
  v7Text(c,d.heading,26,309,30,"700","Bricolage Grotesque",550,24);
  v7Lines(c,d.instruction,26,350,555,27,"400",4,false,24);
  if(d.note?.trim()){
   v7Text(c,d.noteHeading,26,503,26,"700","Bricolage Grotesque",200,22);
   v7Lines(c,d.note,26,532,325,24,"500",2,true,21);
  }
  // Dibujar las dos líneas en coordenadas CANVA ANTES de girar todo el arte.
  // Evita el bug V7.1 de dibujarlas en un contexto rotado sin restaurarlo.
  c.fillStyle="#000";
  for(const r of V7_LANDSCAPE_RULES)c.fillRect(r.x,r.y,r.w,r.h);
  const physical=document.createElement("canvas");
  physical.width=V7_W;physical.height=V7_H;
  const p=physical.getContext("2d",{willReadFrequently:true});
  p.fillStyle="#fff";p.fillRect(0,0,V7_W,V7_H);
  p.save();p.translate(0,V7_H);p.rotate(-Math.PI/2);
  p.drawImage(landscape,0,0);p.restore();
  // Autotest de píxeles ANTES de habilitar impresión: evita precisamente
  // la desaparición del SVG y las dos reglas desplazadas de la V0.7.1.
  function darkAt(x,y){
    const d=p.getImageData(x,y,1,1).data;
    return d[0]<90&&d[1]<90&&d[2]<90&&d[3]>230;
  }
  let logoDark=0;
  const area=p.getImageData(8,13,80,94).data;
  for(let k=0;k<area.length;k+=4)
    if(area[k]<90&&area[k+1]<90&&area[k+2]<90&&area[k+3]>230)logoDark++;
  if(logoDark<350)throw Error("V0.7.3: isotipo BN invisible; impresión bloqueada.");
  if(!darkAt(119,300)||!darkAt(254,700)||
    darkAt(580,824)||darkAt(580,690))
    throw Error("V0.7.3: líneas mal orientadas; impresión bloqueada.");
  return physical;
}
function v7Build(d){
  const physical=v7Render(d),parts=[
    encoder.encode("SIZE 50 mm,80 mm\r\nGAP 2 mm,0 mm\r\nDIRECTION 0\r\nCLS\r\n")
  ];
  let tiles=[];
  for(const region of V7_REGIONS)tiles.push(...v62SparseRegion(physical,region));
  for(const tile of tiles){
    if(tile.height>12)throw Error("La banda raster supera el límite de 12 filas.");
    parts.push(encoder.encode("BITMAP "+tile.x+","+tile.y+","+
      tile.widthBytes+","+tile.height+",0,"));
    parts.push(tile.bytes,encoder.encode("\r\n"));
  }
  // Las dos líneas ya están dentro de las bandas BITMAP. NO enviar BAR.
  parts.push(encoder.encode("QRCODE "+V7_QR.x+","+V7_QR.y+
    ",M,"+V7_QR.module+',A,0,M2,S7,"'+d.url+'"\r\n'));
  parts.push(encoder.encode("PRINT 1,1\r\n"));
  const job=joinBuffers(...parts);
  if(job.length>V7_LIMIT)throw Error("Trabajo de "+job.length+
    " B > límite de "+V7_LIMIT+" B; no se enviará.");
  return {job,tiles:tiles.length,raster:tiles.reduce((n,t)=>n+t.bytes.length,0)};
}

"use strict";
/* V0.9 · SOLO LABORATORIO · Componente 50 × 30 mm · Ragú a la boloñesa.
 * Autoridad: SVG Canva aportado por usuaria (189 × 113, viewBox 141.75 × 84.75).
 * Transcripción geométrica A 590 × 354 dots; no modifica V0.7.3 ni V0.8.
 * Una ración por bolsa; NO mostrar raciones ni gramaje.
 * Texto / isotipo / barras: Canvas 1-bit, raster disperso v62SparseRegion.
 * QR: TSPL nativo, URL canónica. BLE: transmitDiagnostic intacto (20 B/75 ms).
 */
const V9_ID=id=>document.getElementById(id);
const V9_W=590,V9_H=354,V9_LIMIT=35000;
const V9_QR=Object.freeze({x:420,y:187,module:4,box:148});
/* Solo en panel-v1: opción experimental de QR 5 puntos por módulo.
 * URL #r047: previsiblemente QR V3 29×29 a ECC M.
 * QR grande x425..570 (145 dots), y187..332; quiet zone 4×5 dots:
 * x405..590 e y167..352, sin salir del área 590×354.
 * La variante productiva 50×30 usa siempre cinco puntos y ECC M.
 */
const PANEL_QR_VARIANTS=Object.freeze({
 original:V9_QR,
 large:Object.freeze({x:425,y:187,module:5,box:185})
});
function panelComponentQr(variant="large"){
 if(!Object.hasOwn(PANEL_QR_VARIANTS,variant))
  throw Error("Variante QR desconocida.");
 return PANEL_QR_VARIANTS[variant];
}
const V9_RECIPE=Object.freeze({
 name:PANEL_RECIPE.name,kcal:PANEL_RECIPE.kcalDisplay,
 protein:PANEL_RECIPE.proteinDisplay,carbs:PANEL_RECIPE.carbsDisplay,fat:PANEL_RECIPE.fatDisplay,
 heading:"DESCONGELACIÓN Y CONSUMO",
 instructions:PANEL_RECIPE.instructionLines,
 noteTitle:"NOTA",note:PANEL_NOTE_LINES,
 url:PANEL_RECIPE.shortUrl
});
let v9Ready=false,v9Preparing=false,v9Printing=false,v9NeedsRefresh=false;
function v9Date(iso,required=true){
 if(!iso){if(required)throw Error("Selecciona las dos fechas.");return "__/__/__";}
 if(!/^\d{4}-\d{2}-\d{2}$/.test(iso))throw Error("Formato de fecha inválido.");
 const d=new Date(iso+"T12:00:00");
 if(Number.isNaN(d.valueOf())||d.toISOString().slice(0,10)!==iso)
  throw Error("Fecha de calendario inválida.");
 return iso.slice(8,10)+"/"+iso.slice(5,7)+"/"+iso.slice(2,4);
}
function v9Data(allowDraft=false){
 const p=V9_ID("v9Packed").value,e=V9_ID("v9Expiry").value;
 if(p&&e&&e<p)throw Error("El consumo preferente precede al envasado.");
 return {packed:v9Date(p,!allowDraft),expiry:v9Date(e,!allowDraft)};
}
function v9Label(c,txt,x,y,size,weight,family,maxWidth,minSize=size,align="left",italic=false){
 c.textAlign=align;
 let px=size;
 const prefix=italic?"italic ":"";
 do{
  c.font=prefix+weight+" "+px+'px "'+family+'"';
  if(c.measureText(txt).width<=maxWidth)break;
  px--;
 }while(px>=minSize);
 if(px<minSize||c.measureText(txt).width>maxWidth)
  throw Error("Texto de diseño fuera de su caja: "+txt);
 c.fillText(txt,x,y);
}
function v9Draw(d){
 if(typeof v7GetVisibleLogo!=="function")throw Error("Falta isotipo oficial recortado V0.7.3.");
 const logo=v7GetVisibleLogo();
 const canvas=document.createElement("canvas");canvas.width=V9_W;canvas.height=V9_H;
 const c=canvas.getContext("2d",{willReadFrequently:true});
 if(!c)throw Error("Canvas no disponible.");
 c.fillStyle="#fff";c.fillRect(0,0,V9_W,V9_H);
 c.fillStyle="#000";c.textBaseline="alphabetic";c.textAlign="left";
 // Geometría del SVG Canva: título a la izquierda; isotipo GRANDE a la derecha.
 v9Label(c,PANEL_RENDER_NAME,11,46,46,"700","Bricolage Grotesque",475,25);
 c.drawImage(logo,525,5,53,48);
 // Cabecera: banda gruesa de borde a borde (SVG: y≈60–73).
 c.fillRect(0,60,V9_W,12);
 // Fechas: solo estos dos datos son editables durante el ensayo.
 v9Label(c,"Envasado y congelación",15,100,20,"400","Geist",266,18);
 v9Label(c,"Consumo preferente",15,135,20,"400","Geist",266,18);
 v9Label(c,d.packed,300,100,20,"700","Geist",94,18);
 v9Label(c,d.expiry,300,135,20,"700","Geist",94,18);
 // Única segunda regla: FINA y PARCIAL. Termina antes del área nutricional.
 c.fillRect(0,149,392,4);
 // Columna derecha igual que SVG, kcal sobre sus macros, sin cruzar líneas.
 v9Label(c,V9_RECIPE.kcal,448,109,30,"700","Bricolage Grotesque",119,26);
 v9Label(c,"kcal",481,126,15,"400","Geist",66);
 for(const [x,grams,abbr] of [
  [436,V9_RECIPE.protein,"PR"],[496,V9_RECIPE.carbs,"HC"],[555,V9_RECIPE.fat,"GR"]
 ]){
  v9Label(c,grams+" g",x,148,15,"700","Geist",64,13,"center");
  v9Label(c,abbr,x,164,15,"400","Geist",56,14,"center");
 }
 // Instrucciones intactas del diseño. En V0.9 no se ofrece edición de notas.
 // Revisión editorial del SVG: más cuerpo y anchura útil hasta antes del QR.
 // Los textos se detienen en x=401; reserva TSPL del QR desde x=420.
 const v9TextMaxWidth=401-15;
 v9Label(c,V9_RECIPE.heading,15,189,24,"700","Bricolage Grotesque",v9TextMaxWidth,21);
 v9Label(c,V9_RECIPE.instructions[0],15,230,23,"400","Geist",v9TextMaxWidth,21);
 v9Label(c,V9_RECIPE.instructions[1],15,258,23,"400","Geist",v9TextMaxWidth,21);
 if(PANEL_RECIPE.note?.trim()){
  v9Label(c,V9_RECIPE.noteTitle,15,299,20,"700","Bricolage Grotesque",v9TextMaxWidth,18);
  v9Label(c,PANEL_NOTE_LINES[0],15,322,19,"500","Geist",v9TextMaxWidth,17,"left",true);
  if(PANEL_NOTE_LINES[1])v9Label(c,PANEL_NOTE_LINES[1],15,345,19,"500","Geist",v9TextMaxWidth,17,"left",true);
 }
 // Zona x≥405,y≥174 SIN TINTA para QR real + quiet zone: no fake QR raster.
 return canvas;
}
function v9Build(d,qrVariant="original"){
 const qr=panelComponentQr(qrVariant);
 const canvas=v9Draw(d);
 // Raster partido: segunda zona NO invade QR nativo ni su quiet zone.
 const regions=[
  {x:0,y:0,w:V9_W,h:174,label:"Ragú cabecera fechas nutrición"},
  {x:0,y:174,w:405,h:180,label:"Ragú instrucciones y nota"}
 ];
 const tiles=[];
 for(const region of regions)tiles.push(...v62SparseRegion(canvas,region));
 const parts=[encoder.encode("SIZE 50 mm,30 mm\r\nGAP 2 mm,0 mm\r\nDIRECTION 0\r\nCLS\r\n")];
 for(const tile of tiles){
  if(tile.height>12)throw Error("Banda BITMAP superior a 12 filas.");
  parts.push(encoder.encode("BITMAP "+tile.x+","+tile.y+","+tile.widthBytes+","+tile.height+",0,"));
  parts.push(tile.bytes,encoder.encode("\r\n"));
 }
 parts.push(encoder.encode("QRCODE "+qr.x+","+qr.y+
  ",M,"+qr.module+',A,0,M2,S7,"'+V9_RECIPE.url+'"\r\n'));
 parts.push(encoder.encode("PRINT 1,1\r\n"));
 const job=joinBuffers(...parts);
 if(job.length>V9_LIMIT)throw Error("Trabajo "+job.length+
  " B supera el límite preventivo "+V9_LIMIT+" B; no se enviará.");
 return {job,tiles:tiles.length,raster:tiles.reduce((s,t)=>s+t.bytes.length,0)};
}


const PANEL_FORMATS=Object.freeze({
 vertical:{label:"50 × 80 mm • Vertical",size:"50×80",maxBytes:35000},
 horizontal:{label:"50 × 80 mm • Horizontal",size:"50×80",maxBytes:36000},
 component:{label:"50 × 30 mm • Componente",size:"50×30",maxBytes:35000}
});
function panelDate(iso,required=false){
 if(!iso){if(required)throw Error("Selecciona la fecha de envasado.");return "--/--/--";}
 if(!/^\d{4}-\d{2}-\d{2}$/.test(iso))throw Error("Fecha inválida.");
 const date=new Date(iso+"T12:00:00");
 if(!Number.isFinite(date.valueOf())||date.toISOString().slice(0,10)!==iso)
  throw Error("Fecha de calendario inválida.");
 return iso.slice(8,10)+"/"+iso.slice(5,7)+"/"+iso.slice(2,4);
}
function panelDates(packed,expiry,required=true){
 if(packed&&expiry&&expiry<packed)throw Error("Consumo preferente anterior al envasado.");
 const p=panelDate(packed,required),e=panelDate(expiry,false);
 return {packed:p,expiry:e,expires:e};
}
function panelArgs(dates){
 return {...V7_RECIPE,packed:dates.packed,expiry:dates.expiry};
}
function panelQrPlaceholder(ctx,x,y,w,h){
 ctx.save();ctx.strokeStyle="#b5b9b5";ctx.lineWidth=1;
 ctx.setLineDash([5,5]);ctx.strokeRect(x,y,w,h);ctx.setLineDash([]);
 ctx.fillStyle="#66746a";ctx.textAlign="center";
 ctx.font='600 16px "Geist"';ctx.fillText("QR nativo",x+w/2,y+h/2);
 ctx.restore();
}
function panelPreview(format,dates,qrVariant=format==="component"?"large":"original"){
 if(format!=="component"&&qrVariant!=="original")throw Error("QR de prueba solo para formato componente.");
 panelCheckFormat(format,false);
 if(!v5Logo)throw Error("Identidad visual no cargada.");
 let canvas=document.createElement("canvas"),ctx=canvas.getContext("2d");
 if(format==="vertical"){
  const art=v6Render(dates);
  canvas.width=V6_W;canvas.height=V6_H;
  ctx=canvas.getContext("2d");ctx.drawImage(art,0,0);
  ctx.fillStyle="#000";for(const y of [119,415,530,861])ctx.fillRect(26,y,531,3);
  panelQrPlaceholder(ctx,V6_QR.x,V6_QR.y,204,204);
  return canvas;
 }
 if(format==="horizontal"){
  const physical=v7Render(panelArgs(dates));
  const display=document.createElement("canvas");
  display.width=V7_W;display.height=V7_H;
  const g=display.getContext("2d");g.drawImage(physical,0,0);
  panelQrPlaceholder(g,V7_QR.x,V7_QR.y,205,205);
  canvas.width=945;canvas.height=590;
  ctx=canvas.getContext("2d");ctx.translate(945,0);ctx.rotate(Math.PI/2);
  ctx.drawImage(display,0,0);return canvas;
 }
 if(format==="component"){
  const art=v9Draw(dates);
  canvas.width=V9_W;canvas.height=V9_H;
  ctx=canvas.getContext("2d");ctx.drawImage(art,0,0);
  const qr=panelComponentQr(qrVariant);
  const symbolDots=qrVariant==="large"?29*qr.module:148;
  panelQrPlaceholder(ctx,qr.x,qr.y,symbolDots,symbolDots);
  return canvas;
 }
 throw Error("Formato no reconocido.");
}
function panelBuild(format,dates,copies,qrVariant=format==="component"?"large":"original"){
 if(format!=="component"&&qrVariant!=="original")
  throw Error("QR experimental solo disponible en 50×30.");
 panelComponentQr(qrVariant);
 if(!Object.hasOwn(PANEL_FORMATS,format))throw Error("Formato no reconocido.");
 if(!Number.isInteger(copies)||copies<1||copies>20)throw Error("Elige de 1 a 20 etiquetas.");
 panelCheckFormat(format,true);
 let result;
 if(format==="vertical")result=v62Build(dates);
 else if(format==="horizontal")result=v7Build(panelArgs(dates));
 else result=v9Build(dates,qrVariant);
 const original=result.job;
 // Mantener un único trabajo BLE: raster + QR nativo + PRINT 1,N.
 // El cambio de PRINT 1,1 a PRINT 1,N se evalúa físicamente; es sintaxis TSPL.
 const tail=encoder.encode("PRINT 1,1\r\n");
 if(original.length<=tail.length ||
    !tail.every((byte,i)=>original[original.length-tail.length+i]===byte))
   throw Error("Trabajo TSPL no termina en un único PRINT 1,1.");
 const multiple=encoder.encode("PRINT 1,"+copies+"\r\n");
 const job=joinBuffers(original.subarray(0,original.length-tail.length),multiple);
 if(job.length>PANEL_FORMATS[format].maxBytes)throw Error("Límite de seguridad de tamaño de trabajo excedido.");
 return {job,format,copies,qrVariant,qrModule:format==="component"?panelComponentQr(qrVariant).module:null,bytes:job.length,fragments:Math.ceil(job.length/20),
   tiles:result.blocks??result.tiles??0,rasterBytes:result.rasterBytes??result.raster??0};
}
async function panelLoadIdentity(){
 // Canvas may use a fallback immediately while an unrequested face loads.
 // Await every weight/style used by all three renderers before enabling print.
 // Include all label strings so unicode subsets are loaded as well.
 const sample=[PANEL_RECIPE.name,PANEL_RECIPE.shortName||"",PANEL_RECIPE.instruction,PANEL_RECIPE.note||"",
  "MiruRecetas DESCONGELACIÓN Y CONSUMO NOTA Envasado y congelación Consumo preferente",
  "Proteínas Hidratos Grasas PR HC GR kcal 0123456789 --/--/-- ,."].join(" ");
 const spec=[
  ['700 46px "Bricolage Grotesque"',sample],
  ['600 37px "Bricolage Grotesque"',sample],
  ['400 20px "Geist"',sample],
  ['500 25px "Geist"',sample],
  ['700 25px "Geist"',sample],
  ['italic 500 20px "Geist"',sample]
 ];
 const loaded=await Promise.all(spec.map(([font,example])=>document.fonts.load(font,example)));
 if(loaded.some(group=>!group.length||group.some(face=>face.status!=="loaded")))
  throw Error("Las fuentes oficiales no están listas. Se bloquea impresión con sustitutos.");
 const img=new Image();img.decoding="async";img.src="/menu-anual-recetas/assets/etiquetas-isotipo-bn.svg";
 await img.decode();v5Logo=img;
 v7GetVisibleLogo();
 return true;
}
window.PanelEngine=Object.freeze({
 recipe:PANEL_RECIPE,formats:PANEL_FORMATS,qrVariants:PANEL_QR_VARIANTS,
 dates:panelDates,qualityDate:panelQualityDate,checkFormat:panelCheckFormat,
 preview:panelPreview,build:panelBuild,loadIdentity:panelLoadIdentity
});
