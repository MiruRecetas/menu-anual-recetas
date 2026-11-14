"use strict";
/* Mis etiquetas · Amplia libre 50×80 horizontal, propuesta B (08/11/2026).
 * Plantilla del motor-libre compartido. Sin QR, anillo, recetas ni inventarios.
 * El arte es 945×590 horizontal; se gira -90° a raster físico 590×945
 * para el rollo 50×80. La vista previa web lo devuelve a lectura horizontal.
 */
(function(root){
 const M=typeof module!=="undefined"&&module.exports?require("./mis-etiquetas-motor.js"):root.MiruLabelEngine;
 const W=590,H=945,LW=945,LH=590;
 // Conserva los Enter del textarea. El limpiador común aplana espacios por
 // diseño y sigue intacto para Pequeña y Compacta.
 function multiline(raw,max,label){
  const value=String(raw??"").replace(/\r\n?/g,"\n").split("\n")
   .map(line=>line.trim().replace(/\s+/g," ")).join("\n").trim();
  if(value.length>max||/[<>]/.test(value)||
   [...value].some(ch=>ch.charCodeAt(0)<32&&ch!=="\n"))
   throw Error(label+" no válido (máximo "+max+" caracteres).");
  return value;
 }
 function normalize(raw,strict=true){
  const name=M.clean(raw.name,90,"Nombre",true);
  const mode=String(raw.mode||"freeze"),p=String(raw.packed||""),e=String(raw.expiry||"");
  if(!["fridge","freeze","other"].includes(mode))throw Error("Conservación desconocida.");
  M.validateOrder(p,e);
  const showNutrition=raw.showNutrition!==false,showInstruction=raw.showInstruction!==false,
   showNote=raw.showNote!==false;
  return {
   name,mode,packed:M.date(p,strict,"La fecha de envasado es obligatoria."),
   expiry:M.date(e,false),showNutrition,
   kcal:showNutrition?M.numeric(raw.kcal,"Kcal"):null,
   protein:showNutrition?M.numeric(raw.protein,"Proteínas"):null,
   carbs:showNutrition?M.numeric(raw.carbs,"Hidratos"):null,
   fat:showNutrition?M.numeric(raw.fat,"Grasas"):null,
   showInstruction,instruction:showInstruction?multiline(raw.instruction,180,"Instrucciones"):"",
   showNote,note:showNote?multiline(raw.note,140,"Nota"):""
  };
 }
 function fit(c,str,x,y,size,min,max,style="400",family='"Geist"',align="left"){
  return M.fit(c,str,{x,y,size,min,max,style,family,align,
   error:"Texto demasiado largo para Amplia 50 × 80: "+String(str).slice(0,42)});
 }
 function round(c,x,y,w,h,r){
  c.beginPath();
  if(typeof c.roundRect==="function")c.roundRect(x,y,w,h,r);
  else{
   c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);
   c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
   c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);
   c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);
   c.closePath();
  }
  c.fill();
 }
 function body(c,str,x,y,max,size,min,maxLines,style="400"){
  if(!str)return;
  // Cada Enter termina una línea obligatoriamente; dentro de ella, palabras
  // largas se envuelven por anchura. Nunca reordenar párrafos del formulario.
  const paragraphs=str.split("\n");
  for(let px=size;px>=min;px--){
   c.font=style+" "+px+'px "Geist"';
   const lines=[];let overflow=false;
   for(const paragraph of paragraphs){
    if(!paragraph){lines.push("");continue;}
    let line="";
    for(const word of paragraph.split(" ")){
     if(c.measureText(word).width>max){overflow=true;break;}
     const candidate=line?line+" "+word:word;
     if(c.measureText(candidate).width<=max)line=candidate;
     else{if(line)lines.push(line);line=word;}
    }
    if(overflow)break;
    if(line)lines.push(line);
   }
   if(overflow||lines.length>maxLines)continue;
   const leading=px+7;
   for(let i=0;i<lines.length;i++)
    if(lines[i])fit(c,lines[i],x,y+i*leading,px,px,max,style);
   return;
  }
  throw Error("El texto excede el espacio disponible de Amplia; acórtalo.");
 }
 function label(c,title,x,y,w){
  c.fillStyle="#000";round(c,x,y,w,38,9);
  c.fillStyle="#fff";
  fit(c,title,x+14,y+27,24,19,w-28,"700",'"Bricolage Grotesque"');
  c.fillStyle="#000";
 }
 function draw(c,d,officialLogo){
  c.save();c.translate(0,H);c.rotate(-Math.PI/2);
  c.fillStyle="#000";
  // Referencia V0.7.3: cabecera, isotipo y banda superior fieles.
  fit(c,d.name,19,87,66,30,795,"700",'"Bricolage Grotesque"');
  c.drawImage(officialLogo,838,8,94,80);
  c.fillRect(0,109,LW,21);
  const first=d.mode==="freeze"?"Envasado y congelación":
   d.mode==="fridge"?"Envasado":"Conservación";
  if(d.showNutrition){
   // Cuatro filas independientes: primer rótulo, fecha, segundo rótulo, fecha.
   fit(c,first,26,169,27,21,540,"400");
   fit(c,d.packed,26,207,36,27,530,"700");
   fit(c,"Consumo preferente",26,258,27,21,540,"400");
   fit(c,d.expiry,26,301,36,27,530,"700");
   // Kilocalorías en caja inversa redondeada, como Compacta.
   if(d.kcal!==null){
    c.fillStyle="#000";round(c,624,146,287,91,15);
    c.fillStyle="#fff";
    fit(c,d.kcal,768,201,53,32,258,"700",'"Bricolage Grotesque"',"center");
    fit(c,"kcal",768,227,22,18,130,"700",'"Geist"',"center");
    c.fillStyle="#000";
   }
   // Macros debajo de kcal: tres columnas amplias sin divisores adicionales.
   for(const [x,value,abbr] of [
    [657,d.protein,"PR"],[766,d.carbs,"HC"],[875,d.fat,"GR"]
   ]){
    if(value===null)continue;
    fit(c,value+" g",x,281,22,17,105,"700",'"Geist"',"center");
    fit(c,abbr,x,311,22,18,90,"400",'"Geist"',"center");
   }
  }else{
   // Propuesta B aprobada: 2 columnas de fechas centradas, ancho completo.
   fit(c,first,237,217,29,22,426,"700",'"Geist"',"center");
   fit(c,"Consumo preferente",708,217,29,22,426,"700",'"Geist"',"center");
   fit(c,d.packed,237,279,40,30,400,"700",'"Geist"',"center");
   fit(c,d.expiry,708,279,40,30,400,"700",'"Geist"',"center");
  }
  // Secciones paralelas de la propuesta B, con el lenguaje gráfico de Compacta.
  // Una línea conecta los dos rótulos y alcanza ambos bordes de la etiqueta.
  c.fillStyle="#000";c.fillRect(0,370,15,3);
  label(c,"CONSERVACIÓN Y CONSUMO",24,351,390);
  c.fillRect(424,370,186,3);
  label(c,"NOTA",620,351,127);
  c.fillRect(757,370,LW-757,3);
  // El espacio vacío permanece incluso sin contenido; no hay reflujo.
  if(d.showInstruction&&d.instruction)
   body(c,d.instruction,26,431,565,27,19,5);
  if(d.showNote&&d.note)
   body(c,d.note,622,431,295,24,16,6,"italic 500");
  c.restore();
 }
 M.register({id:"horizontal",width:W,height:H,paper:"50 mm,80 mm",normalize,draw});
 if(typeof module!=="undefined"&&module.exports)module.exports={id:"horizontal"};
})(typeof window!=="undefined"?window:globalThis);
