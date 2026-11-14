"use strict";
/* Compacta LIBRE 50 × 30: cabecera y fuentes V0.9 intactas como referencia visual.
 * Motor exclusivo de etiquetas libres. Sin QR, motores de recetas ni inventario.
 * Variantes aprobadas 08/11: macros opcionales y fechas a dos columnas sin macros.
 */
(function(root){
 const M=typeof module!=="undefined"&&module.exports?require("./mis-etiquetas-motor.js"):root.MiruLabelEngine;
 const W=590,H=354;
 function normalize(raw,strict=true){
  const name=M.clean(raw.name,70,"Nombre",true),packed=String(raw.packed||""),expiry=String(raw.expiry||"");
  if(packed&&expiry&&expiry<packed)throw Error("Consumo preferente anterior al envasado.");
  const mode=String(raw.mode||"freeze");
  if(!["fridge","freeze","other"].includes(mode))throw Error("Conservación desconocida.");
  const showNutrition=raw.showNutrition!==false;
  const showInstruction=raw.showInstruction!==false,showNote=raw.showNote!==false;
  return {
   name,packed:M.date(packed,strict,"La fecha de envasado es obligatoria."),
   expiry:M.date(expiry,false),mode,showNutrition,
   kcal:showNutrition?M.numeric(raw.kcal,"Kcal"):null,
   protein:showNutrition?M.numeric(raw.protein,"Proteínas"):null,
   carbs:showNutrition?M.numeric(raw.carbs,"Hidratos"):null,
   fat:showNutrition?M.numeric(raw.fat,"Grasas"):null,
   showInstruction,instruction:showInstruction?M.clean(raw.instruction,90,"Instrucciones"):"",
   showNote,note:showNote?M.clean(raw.note,90,"Nota"):""
  };
 }
 function fit(c,text,x,y,size,min,max,style="400",family='"Geist"',align="left"){
  return M.fit(c,text,{x,y,size,min,max,style,family,align,
   error:"Texto demasiado largo para Compacta 50 × 30: "+String(text).slice(0,35)});
 }
 function rounded(c,x,y,w,h,r){
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
 function section(c,label,x,y,width){
  c.fillStyle="#000";
  rounded(c,x,y,width,27,6);
  c.fillStyle="#fff";
  fit(c,label,x+12,y+21,20,17,width-24,"700",'"Bricolage Grotesque"');
  c.fillStyle="#000";
  // La línea acompaña al encabezado: no añade otro separador superior.
  c.fillRect(x+width+11,y+13,W-x-width-25,2);
 }
 function draw(c,data,logo){
  // Cabecera IDÉNTICA a la geometría aprobada V0.9:
  // ni reducir el isotipo, ni añadir la palabra «MiruRecetas» debajo.
  fit(c,data.name,11,46,46,23,475,"700",'"Bricolage Grotesque"');
  c.drawImage(logo,525,5,53,48);
  c.fillRect(0,60,W,12);

  // Mismos nombres por tipo que Pequeña V0.8. Consumo preferente siempre visible.
  const first=data.mode==="freeze"?"Envasado y congelación":
   data.mode==="other"?"Conservación":"Envasado";
  if(data.showNutrition){
   // Fechas en dos filas. Texto y fecha centrados verticalmente en cada fila,
   // sin rayas separadoras entre conceptos y cifras.
   fit(c,first,15,115,20,18,265,"400");
   fit(c,"Consumo preferente",15,156,20,18,265,"400");
   fit(c,data.packed,300,115,20,18,95,"700");
   fit(c,data.expiry,300,156,20,18,95,"700");

   // Bloque nutricional más aireado: kcal arriba, tres macros debajo.
   // El inverso de kcal usa esquinas redondeadas reales, nunca fillRect.
   if(data.kcal!==null){
    c.fillStyle="#000";
    rounded(c,420,82,148,49,10);
    c.fillStyle="#fff";
    fit(c,data.kcal,494,112,28,19,136,"700",'"Bricolage Grotesque"',"center");
    fit(c,"kcal",494,127,14,13,88,"700",'"Geist"',"center");
    c.fillStyle="#000";
   }
   for(const [x,value,abbr] of [
    [435,data.protein,"PR"],[500,data.carbs,"HC"],[565,data.fat,"GR"]
   ]){
    if(value===null)continue;
    fit(c,value+" g",x,154,14,11,58,"700",'"Geist"',"center");
    fit(c,abbr,x,170,14,12,51,"400",'"Geist"',"center");
   }
  }else{
   // Ocultar macros no deja huecos: 2 columnas sin separador, ejes centrados.
   // Título y fecha conservan su hueco vertical fijo.
   fit(c,first,148,117,22,17,270,"700",'"Geist"',"center");
   fit(c,"Consumo preferente",442,117,22,17,270,"700",'"Geist"',"center");
   fit(c,data.packed,148,160,29,22,270,"700",'"Geist"',"center");
   fit(c,data.expiry,442,160,29,22,270,"700",'"Geist"',"center");
  }
  // Sin raya horizontal separadora delante de conservación y consumo.
  // Encabezados inferiores y huecos de texto siempre presentes.
  section(c,"CONSERVACIÓN Y CONSUMO",12,191,316);
  if(data.showInstruction&&data.instruction){
   const parts=M.lines(c,data.instruction,560,2,"400",21,16);
   parts.forEach((part,i)=>fit(c,part,15,243+i*23,21,16,560));
  }
  section(c,"NOTA",12,274,86);
  if(data.showNote&&data.note){
   const parts=M.lines(c,data.note,560,2,"italic 500",20,15);
   parts.forEach((part,i)=>fit(c,part,15,324+i*22,20,15,560,"italic 500"));
  }
 }
 M.register({id:"component",width:W,height:H,paper:"50 mm,30 mm",normalize,draw});
 if(typeof module!=="undefined"&&module.exports)module.exports={id:"component"};
})(typeof window!=="undefined"?window:globalThis);
