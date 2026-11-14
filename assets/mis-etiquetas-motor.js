"use strict";
/* MiruRecetas / Mis etiquetas: único motor de etiquetas LIBRES.
 * El motor gestiona tipografía, fechas, raster 1 bit, TSPL y activos comunes.
 * Plantillas autónomas registran exclusivamente normalización y composición.
 * No importa ni enlaza motores V0.9 ni versiones productivas MiruRecetas.
 */
(function(root){
 const enc=new TextEncoder(),MAX_BYTES=35000,STRIPE=12;
 const templates=new Map(),views=new Map();
 function register({id,width,height,paper,normalize,draw}){
  if(!/^[a-z][a-z-]*$/.test(id)||templates.has(id)
   ||!Number.isInteger(width)||!Number.isInteger(height)
   ||!/^\d+ mm,\d+ mm$/.test(paper)
   ||typeof normalize!=="function"||typeof draw!=="function")
   throw Error("Plantilla libre no válida o duplicada.");
  templates.set(id,Object.freeze({id,width,height,paper,normalize,draw}));
 }
 function get(id){const item=templates.get(id);if(!item)throw Error("Formato de etiqueta libre desconocido: "+id);return item;}
 function date(s,mandatory=false,message="Indica la fecha de envasado."){
  if(!s){if(mandatory)throw Error(message);return "--/--/--";}
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s))throw Error("Fecha con formato inválido.");
  const y=Number(s.slice(0,4)),m=Number(s.slice(5,7)),d=Number(s.slice(8,10));
  const value=new Date(Date.UTC(y,m-1,d));
  if(!Number.isFinite(value.valueOf())||value.getUTCFullYear()!==y
   ||value.getUTCMonth()+1!==m||value.getUTCDate()!==d)
   throw Error("Fecha de calendario inválida.");
  return s.slice(8,10)+"/"+s.slice(5,7)+"/"+s.slice(2,4);
 }
 function validateOrder(packed,expiry){
  if(packed&&expiry&&expiry<packed)throw Error("El consumo preferente es anterior al envasado.");
 }
 function clean(s,max,label,required=false){
  const value=String(s??"").trim().replace(/\s+/g," ");
  if((required&&!value)||value.length>max||/[<>]/.test(value)||[...value].some(c=>c.charCodeAt(0)<32))
   throw Error(label+" no válido (máximo "+max+" caracteres).");
  return value;
 }
 function numeric(s,label){
  const value=String(s??"").trim().replace(",",".");
  if(!value)return null;
  if(!/^(?:\d{1,4})(?:\.\d{1,2})?$/.test(value)||Number(value)>9999)
   throw Error(label+": introduce un número positivo con hasta dos decimales.");
  return Number(value).toLocaleString("es-ES",{maximumFractionDigits:2,useGrouping:false});
 }
 function fit(ctx,text,{x,y,size,min=size,max,style="400",family='"Geist"',align="left",error}){
  ctx.textAlign=align;
  for(let n=size;n>=min;n--){
   ctx.font=style+" "+n+"px "+family;
   if(ctx.measureText(text).width<=max){ctx.fillText(text,x,y);return n;}
  }
  throw Error(error||"Texto demasiado largo para este formato: "+String(text).slice(0,35));
 }
 function lines(ctx,text,max,limit,style="400",size=22,min=17){
  if(!text)return [];
  const words=text.split(" "),result=[];
  for(const word of words){
   const last=result.pop()||"",next=last?last+" "+word:word;
   ctx.font=style+" "+size+'px "Geist"';
   if(ctx.measureText(next).width<=max){result.push(next);continue;}
   if(last)result.push(last);
   result.push(word);
  }
  if(result.length>limit)throw Error("El texto excede "+limit+" líneas. Acórtalo.");
  for(const line of result){
   let ok=false;
   for(let n=size;n>=min;n--){
    ctx.font=style+" "+n+'px "Geist"';
    if(ctx.measureText(line).width<=max){ok=true;break;}
   }
   if(!ok)throw Error("Una palabra no cabe: "+line);
  }
  return result;
 }
 async function logo(url){
  const img=new Image();img.decoding="async";img.src=url;await img.decode();
  const n=512,cv=document.createElement("canvas");cv.width=cv.height=n;
  const c=cv.getContext("2d",{willReadFrequently:true});c.drawImage(img,0,0,n,n);
  const pixels=c.getImageData(0,0,n,n).data;
  let x0=n,y0=n,x1=-1,y1=-1,count=0;
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
   if(pixels[(y*n+x)*4+3]>24){
    x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);count++;
   }
  }
  if(count<1000||x1<=x0||y1<=y0)throw Error("Isotipo BN no visible.");
  const out=document.createElement("canvas");out.width=x1-x0+1;out.height=y1-y0+1;
  out.getContext("2d").drawImage(cv,x0,y0,out.width,out.height,0,0,out.width,out.height);
  return out;
 }
 function normalize(id,raw,strict=true){return get(id).normalize(raw,strict);}
 function render(id,data,officialLogo){
  if(!officialLogo)throw Error("Falta el isotipo oficial.");
  const t=get(id),canvas=document.createElement("canvas");
  canvas.width=t.width;canvas.height=t.height;
  const c=canvas.getContext("2d",{willReadFrequently:true});
  if(!c)throw Error("Canvas no disponible.");
  c.fillStyle="#fff";c.fillRect(0,0,t.width,t.height);
  c.fillStyle="#000";c.textBaseline="alphabetic";c.textAlign="left";
  t.draw(c,data,officialLogo);
  return canvas;
 }
 // Parcela raster disperso V0.6.2: bandas de 12 filas, sin blancos exteriores.
 // A diferencia de las siete regiones fijas históricas, localiza regiones
 // separadas en bytes de 8 px y decide separarlas solo si ahorran bytes TSPL.
 // A lo sumo 6 rectángulos por banda; sin superposiciones y sin pérdida.
 const MAX_REGIONS_PER_STRIPE=6,EXTRA_COMMAND_COST=12;
 function tileWireBytes(x,y,widthBytes,height){
  // BITMAP + payload 1 bpp + CRLF, igual que build().
  return ("BITMAP "+x+","+y+","+widthBytes+","+height+",0,").length
   +widthBytes*height+2;
 }
 function sparse(id,canvas){
  const t=get(id),W=t.width,H=t.height;
  if(canvas.width!==W||canvas.height!==H)throw Error("Dimensiones de raster incorrectas.");
  const c=canvas.getContext("2d",{willReadFrequently:true});
  const pixels=c.getImageData(0,0,W,H).data,stride=Math.ceil(W/8);
  const bytes=new Uint8Array(stride*H);bytes.fill(255);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
   const j=(y*W+x)*4;
   if((.2126*pixels[j]+.7152*pixels[j+1]+.0722*pixels[j+2])<150)
    bytes[y*stride+(x>>3)]&=~(0x80>>(x&7));
  }
  const blocks=[];
  let baselineRasterBytes=0,baselineTiles=0;
  for(let y=0;y<H;y+=STRIPE){
   const end=Math.min(H,y+STRIPE),active=[];
   // Un byte se considera ocupado si tiene >=1 píxel negro en la banda.
   // Mantener fila superior/inferior por columna permite recortar cada región.
   for(let x=0;x<stride;x++){
    let top=end,bottom=y-1;
    for(let row=y;row<end;row++)if(bytes[row*stride+x]!==255){
     top=Math.min(top,row);bottom=Math.max(bottom,row);
    }
    if(bottom>=y)active.push({col:x,top,bottom});
   }
   if(!active.length)continue;
   const n=active.length;
   const first=active[0],last=active[n-1];
   let baseTop=end,baseBottom=y-1;
   for(const a of active){
    baseTop=Math.min(baseTop,a.top);baseBottom=Math.max(baseBottom,a.bottom);
   }
   baselineRasterBytes+=tileWireBytes(first.col*8,baseTop,last.col-first.col+1,baseBottom-baseTop+1);
   baselineTiles++;

   // Costes exactos de cada región posible (incluyendo cabecera BITMAP).
   // Penalización pequeña de comandos: preferir pocas regiones y proteger
   // el firmware, sin renunciar al ahorro de blancos interiores.
   const costs=Array.from({length:n},()=>new Array(n));
   const tops=Array.from({length:n},()=>new Array(n));
   const bottoms=Array.from({length:n},()=>new Array(n));
   for(let i=0;i<n;i++){
    let top=end,bottom=y-1;
    for(let j=i;j<n;j++){
     top=Math.min(top,active[j].top);bottom=Math.max(bottom,active[j].bottom);
     const widthBytes=active[j].col-active[i].col+1;
     costs[i][j]=tileWireBytes(active[i].col*8,top,widthBytes,bottom-top+1)
      +EXTRA_COMMAND_COST;
     tops[i][j]=top;bottoms[i][j]=bottom;
    }
   }
   const cap=Math.min(MAX_REGIONS_PER_STRIPE,n),inf=Number.POSITIVE_INFINITY;
   const dp=Array.from({length:cap+1},()=>Array(n+1).fill(inf));
   const next=Array.from({length:cap+1},()=>Array(n+1).fill(-1));
   for(let k=0;k<=cap;k++)dp[k][n]=0;
   for(let k=1;k<=cap;k++)for(let i=n-1;i>=0;i--){
    for(let j=i;j<n;j++){
     const candidate=costs[i][j]+dp[k-1][j+1];
     if(candidate<dp[k][i]){
      dp[k][i]=candidate;
      next[k][i]=j;
     }
    }
   }
   let i=0,k=cap;
   while(i<n){
    const j=next[k][i];
    if(j<i||j>=n)throw Error("No se pudo parcelar el raster sin pérdida.");
    const x=active[i].col*8,top=tops[i][j],bottom=bottoms[i][j],
     w=active[j].col-active[i].col+1,h=bottom-top+1;
    const crop=new Uint8Array(w*h);
    for(let row=top;row<=bottom;row++){
     crop.set(bytes.subarray(row*stride+active[i].col,row*stride+active[j].col+1),
      (row-top)*w);
    }
    blocks.push({x,y:top,widthBytes:w,height:h,bytes:crop});
    i=j+1;k--;
   }
  }
  // Metadatos de tamaño anterior a la mejora, sobre el MISMO raster.
  // No se transmiten; permiten comparar pesos en los tres formatos.
  blocks.baselineRasterBytes=baselineRasterBytes;
  blocks.baselineTiles=baselineTiles;
  return blocks;
 }
 function build(id,canvas,copies=1){
  const t=get(id),W=t.width,H=t.height;
  if(!Number.isInteger(copies)||copies<1||copies>20)throw Error("Número de copias fuera del intervalo 1–20.");
  const tiles=sparse(id,canvas),header=enc.encode("SIZE "+t.paper+"\r\nGAP 2 mm,0 mm\r\nDIRECTION 0\r\nCLS\r\n"),
   footer=enc.encode("PRINT 1,"+copies+"\r\n"),parts=[header];
  for(const b of tiles){
   if(b.height>12||b.x<0||b.y<0||b.x+b.widthBytes*8>W+7||b.y+b.height>H)
    throw Error("Banda fuera de los límites del papel.");
   parts.push(enc.encode("BITMAP "+b.x+","+b.y+","+b.widthBytes+","+b.height+",0,"));
   parts.push(b.bytes,enc.encode("\r\n"));
  }
  parts.push(footer);
  const bytes=parts.reduce((sum,part)=>sum+part.length,0),
   baselineBytes=header.length+tiles.baselineRasterBytes+footer.length;
  if(bytes>MAX_BYTES)throw Error("Trabajo demasiado grande ("+bytes+" bytes; antes de optimizar: "+baselineBytes+" bytes).");
  const job=new Uint8Array(bytes);let offset=0;
  for(const part of parts){job.set(part,offset);offset+=part.length;}
  return {job,tiles:tiles.length,bytes,fragments:Math.ceil(bytes/20),copies,
   baselineBytes,baselineTiles:tiles.baselineTiles,savedBytes:baselineBytes-bytes};
 }
 function forFormat(id){
  if(views.has(id))return views.get(id);
  const t=get(id);
  const facade=Object.freeze({
   width:t.width,height:t.height,maxBytes:MAX_BYTES,
   normalize:(raw,strict)=>normalize(id,raw,strict),
   render:(d,logo)=>render(id,d,logo),
   sparse:cv=>sparse(id,cv),
   build:(cv,copies)=>build(id,cv,copies),
   logo
  });
  views.set(id,facade);return facade;
 }
 const api=Object.freeze({register,forFormat,normalize,render,sparse,build,
  logo,date,validateOrder,clean,numeric,fit,lines,maxBytes:MAX_BYTES});
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
 else root.MiruLabelEngine=api;
})(typeof window!=="undefined"?window:globalThis);
