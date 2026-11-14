"use strict";
/* Prototipo autónomo de ingredientes para Conserva. No importa el motor de
 * etiquetas de recetas ni escribe en Airtable, inventario o backend. */
(function(){
 const Motor=window.MiruLabelEngine,E=Motor.forFormat("ingredient"),C=Motor.forFormat("component"),A=Motor.forFormat("horizontal"),
  $=id=>document.getElementById(id);
 const SERVICE="49535343-fe7d-4ae5-8fa9-9fafd205e455";
 const WRITE="49535343-8841-43f4-a8d4-ecbe34729bb3";
 const NOTIFY="49535343-1e4d-4bd9-ba61-23c647249616";
 let device=null,channel=null,logo=null,assetsPromise=null,busy=false,ready=false,refreshSeq=0,copies=1,selectedFormat="ingredient",cReady=false,cRefreshSeq=0,aReady=false,aRefreshSeq=0;
 function log(s){
  $("log").textContent+="["+new Date().toLocaleTimeString("es-ES")+"] "+s+"\n";
 }
 function rasterSavings(work){
  const saved=work.savedBytes,percent=work.baselineBytes>0
   ?(100*saved/work.baselineBytes).toFixed(1):"0.0";
  const info="Antes "+work.baselineBytes+" B · ahora "+work.bytes+" B · ahorro "+
   saved+" B ("+percent+" %) · "+work.baselineTiles+"→"+work.tiles+" sub-bandas";
  return info;
 }
 function connected(){return !!(device?.gatt?.connected&&channel);}
 function values(){return {name:$("name").value,grams:$("grams").value,
  packed:$("packed").value,expiry:$("expiry").value,
  mode:["pantry","preserve"].includes($("mode").value)?"other":$("mode").value,
  notesEnabled:$("notes-enabled").checked,note:$("note").value};}
 function compactValues(){return {name:$("c-name").value,mode:$("c-mode").value,
  packed:$("c-packed").value,expiry:$("c-expiry").value,
  showNutrition:$("c-nutrition-enabled").checked,kcal:$("c-kcal").value,
  protein:$("c-protein").value,carbs:$("c-carbs").value,fat:$("c-fat").value,
  showInstruction:$("c-instruction-enabled").checked,instruction:$("c-instruction").value,
  showNote:$("c-note-enabled").checked,note:$("c-note").value};}
 function wideValues(){return {name:$("a-name").value,mode:$("a-mode").value,
  packed:$("a-packed").value,expiry:$("a-expiry").value,
  showNutrition:$("a-nutrition-enabled").checked,kcal:$("a-kcal").value,
  protein:$("a-protein").value,carbs:$("a-carbs").value,fat:$("a-fat").value,
  showInstruction:$("a-instruction-enabled").checked,instruction:$("a-instruction").value,
  showNote:$("a-note-enabled").checked,note:$("a-note").value};}
 function update(){
  let valid=false;
  try{if(selectedFormat==="component")C.normalize(compactValues(),true);
   else if(selectedFormat==="horizontal")A.normalize(wideValues(),true);
   else E.normalize(values(),true);valid=true;}catch(_){}
  $("connect").disabled=busy||connected();
  $("disconnect").disabled=busy||!connected();
  $("print").disabled=busy||!connected()||!(selectedFormat==="horizontal"?aReady:selectedFormat==="component"?cReady:ready)||!valid||!$("confirm-paper").checked;
  $("print").textContent=busy?"Operación en curso…":"Imprimir "+copies+(copies===1?" etiqueta":" etiquetas")+" · "+(selectedFormat==="horizontal"?"50 × 80":selectedFormat==="component"?"50 × 30":"30 × 20")+" mm";
  $("copies").textContent=String(copies);
  $("copies-minus").disabled=busy||copies<=1;
  $("copies-plus").disabled=busy||copies>=20;
  $("confirm-paper").disabled=busy;
  $("connection").textContent=connected()?"CT230B conectada":"Sin conexión CT230B";
  $("connection").dataset.connected=String(connected());
  for(const id of ["name","grams","packed","expiry","mode"])$(id).disabled=busy;
  for(const id of ["c-name","c-mode","c-packed","c-expiry","c-kcal","c-protein","c-carbs","c-fat",
   "c-instruction","c-note","c-nutrition-enabled","c-instruction-enabled","c-note-enabled"])$(id).disabled=busy;
  $("c-nutrition-fields").hidden=!$("c-nutrition-enabled").checked;
  $("c-instruction").disabled=busy||!$("c-instruction-enabled").checked;
  $("c-note").disabled=busy||!$("c-note-enabled").checked;
  for(const id of ["a-name","a-mode","a-packed","a-expiry","a-kcal","a-protein","a-carbs","a-fat",
   "a-instruction","a-note","a-nutrition-enabled","a-instruction-enabled","a-note-enabled"])$(id).disabled=busy;
  $("a-nutrition-fields").hidden=!$("a-nutrition-enabled").checked;
  $("a-instruction").disabled=busy||!$("a-instruction-enabled").checked;
  $("a-note").disabled=busy||!$("a-note-enabled").checked;
  for(const input of document.querySelectorAll("[data-label-format]"))input.disabled=busy;
  $("notes-enabled").disabled=busy;
  $("note").disabled=busy||!$("notes-enabled").checked;
 }
 async function ensureAssets(){
  if(!assetsPromise)assetsPromise=(async()=>{
   const faces=await Promise.all([
    document.fonts.load('700 29px "Bricolage Grotesque"',"Carne Picada"),
    document.fonts.load('700 55px "Bricolage Grotesque"',"500 g"),
    document.fonts.load('400 17px "Geist"',"Envasado y congelación"),
    document.fonts.load('700 17px "Geist"',"30/10/26"),
    document.fonts.load('italic 500 16px "Geist"',"Descongelar en nevera Conservar en nevera"),
    document.fonts.load('700 66px "Bricolage Grotesque"',"Pisto casero"),
    document.fonts.load('700 53px "Bricolage Grotesque"',"164,35"),
    document.fonts.load('700 29px "Geist"',"Consumo preferente"),
    document.fonts.load('400 27px "Geist"',"Envasado y congelación"),
    document.fonts.load('italic 500 24px "Geist"',"La textura puede variar")
   ]);
   if(faces.some(f=>!f.length||f.some(x=>x.status!=="loaded")))
    throw Error("No se cargaron las fuentes oficiales.");
   logo=await E.logo("/menu-anual-recetas/assets/etiquetas-isotipo-bn.svg");
  })();
  return assetsPromise;
 }
 async function wideRefresh(){
  if(selectedFormat!=="horizontal")return;
  const n=++aRefreshSeq;aReady=false;update();
  try{
   await ensureAssets();
   if(n!==aRefreshSeq||selectedFormat!=="horizontal")return;
   const d=A.normalize(wideValues(),false),physical=A.render(d,logo);
   // El raster de impresión se gira a horizontal SOLO para mostrarlo;
   // los píxeles que se envían a CT230B permanecen en 590 × 945.
   const canvas=$("a-preview"),ctx=canvas.getContext("2d");
   ctx.clearRect(0,0,canvas.width,canvas.height);ctx.save();
   ctx.translate(canvas.width,0);ctx.rotate(Math.PI/2);ctx.drawImage(physical,0,0);ctx.restore();
   $("a-status").dataset.error="false";
   $("a-status").textContent="Vista previa disponible.";
   try{
    const strict=A.normalize(wideValues(),true),job=A.build(A.render(strict,logo),copies);
    $("a-metrics").textContent=rasterSavings(job)+" · "+job.fragments+
     " fragmentos BLE · "+copies+(copies===1?" copia":" copias")+".";
    $("a-preview").dataset.baselineBytes=String(job.baselineBytes);
    $("a-preview").dataset.optimizedBytes=String(job.bytes);
    aReady=true;
   }catch(err){$("a-status").dataset.error="true";$("a-status").textContent="Impresión bloqueada: "+err.message;
    $("a-metrics").textContent="Vista previa disponible; impresión bloqueada: "+err.message;}
  }catch(err){if(n===aRefreshSeq){
   $("a-status").dataset.error="true";$("a-status").textContent="No se puede mostrar: "+err.message;
   $("a-metrics").textContent="Corrige los campos o la composición.";
  }}finally{if(n===aRefreshSeq)update();}
 }
 async function compactRefresh(){
  if(selectedFormat!=="component")return;
  const n=++cRefreshSeq;cReady=false;update();
  try{
   await ensureAssets();
   if(n!==cRefreshSeq||selectedFormat!=="component")return;
   const d=C.normalize(compactValues(),false),cv=C.render(d,logo);
   const canvas=$("c-preview");canvas.getContext("2d").clearRect(0,0,C.width,C.height);
   canvas.getContext("2d").drawImage(cv,0,0);
   $("c-status").dataset.error="false";$("c-status").textContent="Vista previa disponible.";
   try{const strict=C.normalize(compactValues(),true),job=C.build(C.render(strict,logo),copies);
    $("c-metrics").textContent=rasterSavings(job)+" · "+job.fragments+
     " fragmentos BLE · "+copies+" copias.";
    $("c-preview").dataset.baselineBytes=String(job.baselineBytes);
    $("c-preview").dataset.optimizedBytes=String(job.bytes);
    cReady=true;
   }catch(err){$("c-status").dataset.error="true";$("c-status").textContent="Impresión bloqueada: "+err.message;
    $("c-metrics").textContent="Impresión bloqueada: "+err.message;}
  }catch(err){if(n===cRefreshSeq){$("c-status").dataset.error="true";$("c-status").textContent="No se puede mostrar: "+err.message;
   $("c-metrics").textContent="Corrige la composición antes de imprimir.";}}
  finally{if(n===cRefreshSeq)update();}
 }
 async function refresh(){
  if(selectedFormat!=="ingredient")return;
  const n=++refreshSeq;
  ready=false;update();
  try{
   await ensureAssets();
   if(n!==refreshSeq)return;
   const d=E.normalize(values(),false),cv=E.render(d,logo);
   const canvas=$("preview");
   canvas.getContext("2d").clearRect(0,0,E.width,E.height);
   canvas.getContext("2d").drawImage(cv,0,0);
   let message="Vista previa con fecha de envasado pendiente; el consumo preferente es opcional.";
   try{
    const strict=E.normalize(values(),true),full=E.build(E.render(strict,logo),copies);
    message=rasterSavings(full)+" · "+full.fragments+
     " fragmentos BLE · "+copies+(copies===1?" copia":" copias")+".";
    $("preview").dataset.baselineBytes=String(full.baselineBytes);
    $("preview").dataset.optimizedBytes=String(full.bytes);
    ready=true;
   }catch(err){message="Sin envío: "+err.message;}
   $("metrics").textContent=message;
   $("design-status").dataset.error=String(!ready);
   $("design-status").textContent=ready?"Vista previa disponible.":message;
  }catch(err){
   if(n===refreshSeq){
    $("design-status").dataset.error="true";$("design-status").textContent="Vista previa bloqueada: "+err.message;
    $("metrics").textContent="No se puede imprimir sin los activos oficiales.";
   }
  }finally{if(n===refreshSeq)update();}
 }
 function disconnect(){
  channel=null;update();
 }
 function progress(done,total,state){
  const box=$("transport"),pct=total?Math.min(100,Math.round(done*100/total)):0;
  box.hidden=false;box.dataset.state=state;
  $("progress-fill").style.width=pct+"%";
  $("progress").setAttribute("aria-valuenow",String(pct));
  $("progress").setAttribute("aria-valuetext",done+" de "+total+" fragmentos transmitidos");
  $("transport-percent").textContent=pct+" %";
  $("transport-count").textContent=done+" enviados · "+Math.max(0,total-done)+" restantes";
  $("transport-title").textContent=state==="sending"?"Enviando "+copies+(copies===1?" etiqueta":" etiquetas"):
   state==="complete"?"Transmisión completa; comprobar impresión física":
   state==="error"?"Transmisión interrumpida: revisar impresora":"Preparando impresión…";
 }
 for(const [id,delta] of [["copies-minus",-1],["copies-plus",1]]){
  $(id).addEventListener("click",()=>{
   if(busy)return;
   copies=Math.max(1,Math.min(20,copies+delta));
   update();void (selectedFormat==="horizontal"?wideRefresh():selectedFormat==="component"?compactRefresh():refresh());
  });
 }
 $("connect").addEventListener("click",async()=>{
  if(!navigator.bluetooth||!window.isSecureContext){
   log("Bluetooth requiere HTTPS y Chrome Android compatible.");return;
  }
  busy=true;update();
  let chosen=false;
  try{
   device=await navigator.bluetooth.requestDevice({
    filters:[{namePrefix:"CT230B"}],optionalServices:[SERVICE]
   });
   chosen=true;
   device.addEventListener("gattserverdisconnected",()=>{
    log("CT230B desconectada.");disconnect();
   });
   const server=await device.gatt.connect(),svc=await server.getPrimaryService(SERVICE);
   const write=await svc.getCharacteristic(WRITE);
   if(!(write.properties.write||write.properties.writeWithoutResponse))
    throw Error("Canal UART no admite WRITE.");
   channel=write;
   try{
    const notifications=await svc.getCharacteristic(NOTIFY);
    await notifications.startNotifications();
   }catch(_){/* Las notificaciones GATT son opcionales para la impresión. */}
   log("CT230B conectada.");
  }catch(err){
   // Cancelar el selector de dispositivos no es un error de impresión.
   if(chosen||err.name!=="NotFoundError")log("No se pudo conectar: "+err.message);
   if(device?.gatt?.connected)device.gatt.disconnect();
   disconnect();
  }finally{busy=false;update();}
 });
 $("disconnect").addEventListener("click",()=>{
  if(device?.gatt?.connected)device.gatt.disconnect();
  disconnect();
 });
 $("print").addEventListener("click",async()=>{
  const wide=selectedFormat==="horizontal",compact=selectedFormat==="component";
  if(busy||!(wide?aReady:compact?cReady:ready)||!connected()||!$("confirm-paper").checked)return;
  let d,work;
  const motor=wide?A:compact?C:E;
  const paper=wide?"50 × 80":compact?"50 × 30":"30 × 20";
  try{
   d=motor.normalize(wide?wideValues():compact?compactValues():values(),true);
   work=motor.build(motor.render(d,logo),copies);
  }catch(err){log("Impresión bloqueada: "+err.message);update();return;}
  if(!window.confirm("Confirmar "+copies+(copies===1?" etiqueta":" etiquetas")+" de "+paper+" mm: "+d.name+
    (wide||compact?" · sin QR (etiqueta libre)":d.grams!==null?" · "+d.grams+" g":" · sin cantidad")+
    " · fecha "+d.packed+" · consumo preferente "+d.expiry+
    ".\\nTrabajo único TSPL PRINT 1,"+copies+
    "; no se reintentará automáticamente. Comprueba el rollo y la alineación; la salida física aún no está acreditada."))return;
  busy=true;document.documentElement.dataset.miruPrintBusy="true";document.dispatchEvent(new Event("miru:print-state"));update();
  let done=0;
  const total=work.fragments;
  progress(0,total,"sending");
  log("Enviando "+copies+(copies===1?" etiqueta":" etiquetas")+" · "+paper+" mm.");
  try{
   for(let i=0;i<work.job.length;i+=20){
    if(!connected())throw Error("Se perdió la conexión BLE durante el envío.");
    const part=work.job.slice(i,i+20);
    if(channel.properties.write&&typeof channel.writeValueWithResponse==="function")
     await channel.writeValueWithResponse(part);
    else if(channel.properties.writeWithoutResponse&&typeof channel.writeValueWithoutResponse==="function")
     await channel.writeValueWithoutResponse(part);
    else throw Error("WRITE no compatible.");
    done++;progress(done,total,"sending");
    await new Promise(resolve=>setTimeout(resolve,75));
   }
   progress(done,total,"complete");
   log("Transmisión completa. Comprueba la impresión en papel.");
  }catch(err){
   progress(done,total,"error");
   log("Error de envío: "+err.message+"; fragmentos enviados "+done+"/"+total+". Revisa la impresora antes de reintentar.");
  }finally{
   busy=false;delete document.documentElement.dataset.miruPrintBusy;document.dispatchEvent(new Event("miru:print-state"));$("confirm-paper").checked=false;update();
  }
 });
 $("copy").addEventListener("click",async()=>{
  try{await navigator.clipboard.writeText($("log").textContent);}
  catch(err){log("No se pudo copiar el diagnóstico: "+err.message);}
 });
 $("clear").addEventListener("click",()=>{$("log").textContent="";});
 for(const id of ["c-name","c-packed","c-expiry","c-kcal","c-protein","c-carbs","c-fat","c-instruction","c-note"])
  for(const evt of ["input","change"])$(id).addEventListener(evt,compactRefresh);
 for(const id of ["c-nutrition-enabled","c-instruction-enabled","c-note-enabled"])
  $(id).addEventListener("change",()=>{update();void compactRefresh();});
 for(const id of ["a-name","a-packed","a-expiry","a-kcal","a-protein","a-carbs","a-fat","a-instruction","a-note"])
  for(const evt of ["input","change"])$(id).addEventListener(evt,wideRefresh);
 for(const id of ["a-nutrition-enabled","a-instruction-enabled","a-note-enabled"])
  $(id).addEventListener("change",()=>{update();void wideRefresh();});
 for(const id of ["name","grams","packed","expiry","note"])
  for(const evt of ["input","change"])$(id).addEventListener(evt,refresh);
 const noteDefaults={fridge:"Conservar en nevera",freeze:"Descongelar en nevera",pantry:"",preserve:"",other:""};
 // Contrato de Pequeña: cada cambio de conservación reemplaza el texto guiado.
 // Compacta lo sitúa en instrucciones y limpia la nota personal previa,
 // evitando instrucciones contradictorias o duplicadas en ambas secciones.
 $("c-mode").addEventListener("change",()=>{
  const mode=$("c-mode").value;
  $("c-instruction").value=noteDefaults[mode];
  $("c-note").value="";
  update();void compactRefresh();
 });
 $("a-mode").addEventListener("change",()=>{
  const mode=$("a-mode").value;
  $("a-instruction").value=noteDefaults[mode];
  $("a-note").value="";
  update();void wideRefresh();
 });
 $("mode").addEventListener("change",()=>{
  $("note").value=noteDefaults[$("mode").value];
  void refresh();
 });
 $("notes-enabled").addEventListener("change",()=>{update();void refresh();});
 // Únicamente los dos pasos 1 y 2 son desplegables. Un paso abierto cierra el otro.
 const steps=[$("data-step"),$("print-step")];
 for(const step of steps)step.addEventListener("toggle",()=>{
  if(step.open)for(const other of steps)if(other!==step)other.open=false;
 });
 const formats={ingredient:true,component:true,horizontal:true};
 function changeFormat(format){
  if(busy||!Object.hasOwn(formats,format))return;
  selectedFormat=format;
  const ingredient=format==="ingredient",compact=format==="component",wide=format==="horizontal",active=ingredient||compact||wide;
  $("paper-dimensions").textContent=wide?"50 × 80 mm":compact?"50 × 30 mm":"30 × 20 mm";
  for(const [id,visible] of [
   ["ingredient-fields",ingredient],["ingredient-preview",ingredient],["compact-fields",compact],
   ["compact-preview",compact],["wide-fields",wide],["wide-preview",wide],["ingredient-print",active]
  ])$(id).hidden=!visible;
  for(const input of document.querySelectorAll("[data-label-format]"))
   input.checked=input.value===format;
  if(!ingredient)++refreshSeq;
  if(!compact)++cRefreshSeq;
  if(!wide)++aRefreshSeq;
  $("transport").hidden=true;
  $("confirm-paper").checked=false;
  update();
  if(ingredient)void refresh();
  if(compact)void compactRefresh();
  if(wide)void wideRefresh();
 }
 for(const input of document.querySelectorAll("[data-label-format]"))
  input.addEventListener("change",()=>{if(input.checked)changeFormat(input.value);});
 $("confirm-paper").addEventListener("change",update);
 const now=new Date();$("packed").value=now.getFullYear()+"-"+
  String(now.getMonth()+1).padStart(2,"0")+"-"+String(now.getDate()).padStart(2,"0");
 $("c-packed").value=$("packed").value;
 $("a-packed").value=$("packed").value;
 if(!E||!C||!A){$("design-status").dataset.error="true";$("design-status").textContent="Falta un motor libre del laboratorio.";return;}
 update();void refresh();
})();
