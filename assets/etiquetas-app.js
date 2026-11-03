"use strict";
/* MiruRecetas · CT230B · interfaz autónoma de etiquetas para fichas reales.
 * Sin Airtable ni servidor, sin telemetría y sin reintentos automáticos. */
(()=>{
 const $=id=>document.getElementById(id);
 const engine=window.PanelEngine;
 if(!engine)throw Error("No se cargó el motor aprobado del panel.");
 const SERVICE="49535343-fe7d-4ae5-8fa9-9fafd205e455";
 const WRITABLE="49535343-8841-43f4-a8d4-ecbe34729bb3";
 const NOTIFY="49535343-1e4d-4bd9-ba61-23c647249616";
 const overlay=$("p1-overlay"),dialog=$("p1-dialog"),close=$("p1-close"),
       opened=$("p1-open"),cookingOpened=$("p1-open-cooking"),format=$("p1-format"),packed=$("p1-packed"),
       expiry=$("p1-expiry"),copies=$("p1-copies"),connect=$("p1-connect"),
       disconnect=$("p1-disconnect"),print=$("p1-print"),preview=$("p1-preview"),
       status=$("p1-status"),error=$("p1-error"),metrics=$("p1-metrics"),
       logElement=$("p1-log"),bleProgress=$("p1-ble-progress"),bleProgressFill=$("p1-ble-progress-fill");
 let origin=null,device=null,writeChannel=null,notifyChannel=null,busy=false,ready=false;
 let labelCopies=1,manualExpiry=false;
 function log(message){
  logElement.textContent+="["+new Date().toLocaleTimeString("es-ES")+"] "+message+"\n";
  logElement.scrollTop=logElement.scrollHeight;
 }
 function showError(message){
  error.hidden=!message;error.textContent=message||"";
  if(message)log("AVISO: "+message);
 }
 function connected(){return !!(device&&device.gatt&&device.gatt.connected&&writeChannel);}
 // Contrato final aprobado: componente 50×30 SIEMPRE QR 5 puntos/ECC M;
 // los dos formatos 50×80 conservan su QR existente sin variantes.
 function qrMode(){return format.value==="component"?"large":"original";}
 function copiesValue(){
  if(!Number.isInteger(labelCopies)||labelCopies<1||labelCopies>20)
   throw Error("El número de etiquetas debe estar entre 1 y 20.");
  return labelCopies;
 }
 function updateCopyStepper(){
  copies.textContent=String(labelCopies);
  $("p1-copies-minus").disabled=busy||labelCopies<=1;
  $("p1-copies-plus").disabled=busy||labelCopies>=20;
 }
 function computeExpiry(){
  if(manualExpiry)return;
  try{expiry.value=packed.value?engine.qualityDate(packed.value):"";}catch(e){expiry.value="";showError(e.message);}
  const restore=$("p1-auto-expiry");
  restore.hidden=!engine.recipe.qualityDays;
  restore.disabled=!engine.recipe.qualityDays;
 }
 function dataForPrint(required=true){
  const dates=engine.dates(packed.value,expiry.value,required);
  const count=copiesValue();
  if(!Object.hasOwn(engine.formats,format.value))throw Error("Formato desconocido.");
  if(!Object.hasOwn(engine.qrVariants,qrMode()))
   throw Error("Variante QR desconocida.");
  engine.checkFormat(format.value,true);
  return {dates,count};
 }
 function update(){
  const online=connected();
  const label=busy?(online?"Enviando o preparando…":"Conectando…"):(online?"CLABEL CT230B conectada":"Impresora desconectada");
  status.textContent=label;
  $("p1-state-dot").classList.toggle("is-connected",online);
  connect.disabled=busy||online;
  disconnect.disabled=busy||!online;
  let valid=false;
  try{dataForPrint(true);valid=true;}catch(_){}
  print.disabled=busy||!ready||!online||!valid;
  updateCopyStepper();
  const n=labelCopies;
  print.textContent="Imprimir "+(n===1?"1 etiqueta":n+" etiquetas");
 }
 function refreshPreview(){
  if(!ready)return;
  try{
   const dates=engine.dates(packed.value,expiry.value,false);
   const art=engine.preview(format.value,dates,qrMode());
   preview.width=art.width;preview.height=art.height;
   preview.className="p1-preview"+(format.value==="horizontal"?" p1-horizontal":format.value==="component"?" p1-component":"");
   preview.getContext("2d").drawImage(art,0,0);
   const n=labelCopies;
   metrics.textContent=engine.formats[format.value].label+
    " · "+engine.recipe.name+" · "+n+" "+(n===1?"etiqueta":"etiquetas")+
    " · "+(qrMode()==="large"?"QR 5 puntos / ECC M (aprobado)":"QR aprobado / formato 50×80")+" · envasado "+dates.packed+" · consumo "+dates.expiry;
   if(!error.hidden)showError("");
  }catch(e){
   metrics.textContent="Error de vista previa: "+e.message;
   showError(e.message);
  }finally{update();}
 }
 function openDialog(){
  origin=document.activeElement;
  overlay.hidden=false;document.body.classList.add("p1-modal-open");
  close.focus();refreshPreview();update();
 }
 function dismiss(){
  if(busy){log("No se cierra el panel durante la transmisión.");return;}
  overlay.hidden=true;document.body.classList.remove("p1-modal-open");
  origin?.focus();
 }
 for(const trigger of [opened,cookingOpened])trigger.addEventListener("click",openDialog);
 close.addEventListener("click",dismiss);
 overlay.addEventListener("click",event=>{if(event.target===overlay)dismiss();});
 document.addEventListener("keydown",event=>{
  if(overlay.hidden)return;
  if(event.key==="Escape"){event.preventDefault();dismiss();return;}
  if(event.key!=="Tab")return;
  const focusable=[...dialog.querySelectorAll("button:not([disabled]),a[href],select:not([disabled]),input:not([disabled])")]
   .filter(el=>el.getClientRects().length);
  if(!focusable.length)return;
  const first=focusable[0],last=focusable[focusable.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 });
 for(const event of ["input","change"]){
  format.addEventListener(event,refreshPreview);
  packed.addEventListener(event,()=>{computeExpiry();refreshPreview();});
  expiry.addEventListener(event,()=>{manualExpiry=true;refreshPreview();});
 }
 $("p1-auto-expiry").addEventListener("click",()=>{manualExpiry=false;computeExpiry();refreshPreview();});
 $("p1-copies-minus").addEventListener("click",()=>{
  if(busy)return;
  labelCopies=Math.max(1,labelCopies-1);
  refreshPreview();
 });
 $("p1-copies-plus").addEventListener("click",()=>{
  if(busy)return;
  labelCopies=Math.min(20,labelCopies+1);
  refreshPreview();
 });
 function clearConnection(){
  writeChannel=null;notifyChannel=null;update();
 }
 function disconnected(){
  log("Impresora desconectada.");clearConnection();
 }
 function notification(event){
  const value=event.target.value;
  const bytes=new Uint8Array(value.buffer,value.byteOffset,value.byteLength);
  log("Notificación CLABEL ["+bytes.length+" B]: "+Array.from(bytes).map(x=>x.toString(16).padStart(2,"0")).join(" "));
 }
 connect.addEventListener("click",async()=>{
  if(busy||connected())return;
  if(!navigator.bluetooth){showError("Web Bluetooth no disponible. Abre esta página por HTTPS en Chrome Android.");return;}
  busy=true;showError("");update();log("Solicitando dispositivo CT230B mediante Web Bluetooth…");
  try{
   device=await navigator.bluetooth.requestDevice({filters:[{namePrefix:"CT230B"}],optionalServices:[SERVICE]});
   device.addEventListener("gattserverdisconnected",disconnected);
   log("CT230B seleccionada. Solicitando conexión GATT…");
   const server=await device.gatt.connect(),service=await server.getPrimaryService(SERVICE);
   const channel=await service.getCharacteristic(WRITABLE);
   if(!channel.properties.write&&!channel.properties.writeWithoutResponse)
    throw Error("Característica BLE sin permiso WRITE.");
   writeChannel=channel;
   log("UART conectado; WRITE="+Boolean(channel.properties.write)+
       "; WRITE_NO_RESPONSE="+Boolean(channel.properties.writeWithoutResponse));
   try{
    notifyChannel=await service.getCharacteristic(NOTIFY);
    notifyChannel.addEventListener("characteristicvaluechanged",notification);
    await notifyChannel.startNotifications();
    log("Notificaciones habilitadas.");
   }catch(e){log("Notificaciones no disponibles: "+e.message);}
   log("Impresora conectada. No se ha enviado ningún comando de impresión.");
  }catch(e){
   log("ERROR DE CONEXIÓN: "+e.name+": "+e.message);
   try{if(device?.gatt?.connected)device.gatt.disconnect();}catch(_){}
   clearConnection();showError("No ha sido posible conectar la CLABEL.");
  }finally{busy=false;update();}
 });
 disconnect.addEventListener("click",()=>{
  if(busy)return;
  try{if(device?.gatt?.connected)device.gatt.disconnect();}catch(e){log("Desconexión: "+e.message);}
  clearConnection();log("Desconexión solicitada.");
 });
 const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 // Barra estrictamente de transporte BLE: no representa tiempo ni impresión física.
 function showTransmissionProgress(total){
  bleProgress.hidden=false;
  bleProgressFill.style.width="0%";
  bleProgress.setAttribute("aria-valuenow","0");
  bleProgress.setAttribute("aria-valuetext","0 de "+total+" fragmentos enviados");
 }
 function advanceTransmissionProgress(completed,total){
  const percent=Math.min(100,Math.floor(100*completed/total));
  if(bleProgress.getAttribute("aria-valuenow")!==String(percent)||completed===total){
   bleProgressFill.style.width=percent+"%";
   bleProgress.setAttribute("aria-valuenow",String(percent));
   bleProgress.setAttribute("aria-valuetext",completed+" de "+total+" fragmentos enviados");
  }
 }
 function hideTransmissionProgress(){
  bleProgress.hidden=true;
  bleProgressFill.style.width="0%";
  bleProgress.setAttribute("aria-valuenow","0");
  bleProgress.setAttribute("aria-valuetext","0 de 0 fragmentos enviados");
 }
 async function transmit(bytes,label){
  // Contrato físico original: 20 bytes/fragmento, 75 ms entre escrituras,
  // preferir WRITE con respuesta, sin reintentos ni canales alternativos.
  const chunkSize=20,total=Math.ceil(bytes.length/chunkSize);
  log("Iniciando "+label+": "+bytes.length+" bytes, "+total+" fragmentos BLE.");
  showTransmissionProgress(total);
  for(let start=0;start<bytes.length;start+=chunkSize){
   if(!connected())throw Error("Conexión BLE perdida durante el transporte.");
   const chunk=bytes.slice(start,start+chunkSize);
   if(writeChannel.properties.write&&typeof writeChannel.writeValueWithResponse==="function")
    await writeChannel.writeValueWithResponse(chunk);
   else if(writeChannel.properties.writeWithoutResponse&&
           typeof writeChannel.writeValueWithoutResponse==="function")
    await writeChannel.writeValueWithoutResponse(chunk);
   else throw Error("No hay método WRITE compatible.");
   await pause(75);
   const completed=Math.min(total,Math.ceil((start+chunk.length)/chunkSize));
   advanceTransmissionProgress(completed,total);
   if(completed%100===0||completed===total){
    status.textContent="Enviando "+completed+" / "+total+" fragmentos";
    if(completed===total)log("Envío de fragmentos BLE: "+completed+"/"+total+".");
   }
  }
  log("Datos de "+label+" enviados. El firmware debe procesar las copias; comprobar físicamente la salida y el QR.");
 }
 print.addEventListener("click",async()=>{
  if(busy||!ready||!connected())return;
  let job,dates,count;
  try{
   const data=dataForPrint(true);dates=data.dates;count=data.count;
   job=engine.build(format.value,dates,count,qrMode());
  }catch(e){showError(e.message);return;}
  log("Trabajo preparado: "+job.format+" · "+count+" "+
     (count===1?"copia":"copias")+" · "+job.bytes+" bytes · "+
     job.fragments+" fragmentos · "+job.tiles+" bandas raster · QR "+(job.qrModule||"estándar")+" puntos"+(job.qrVariant==="large"?" (5/M APROBADO)":"")+".");
  const text="¿Enviar UN trabajo BLE a la CLABEL para imprimir "+
   count+" "+(count===1?"etiqueta":"etiquetas")+" de "+engine.recipe.name+" ("+
   engine.formats[format.value].label+")?\n"+
   "Envasado: "+dates.packed+" · Consumo preferente: "+dates.expiry+
   "\nQR corto #"+engine.recipe.qrId+" · QR "+(job.qrModule||"original")+" puntos"+(job.qrVariant==="large"?" 5/M APROBADO":"")+" · PRINT 1,"+count+".\n"+
   "Sin reintentos. PRINT 1,2 probado físicamente; desalineación intermitente en el ensayo de diez copias (#49).";
  if(!window.confirm(text)){log("Impresión cancelada antes del envío.");return;}
  busy=true;update();showError("");
  try{await transmit(job.job,"PANEL V1 "+job.format+" · QR "+(job.qrModule||"normal")+" puntos · PRINT 1,"+count);}
  catch(e){log("ERROR DE TRANSPORTE: "+e.name+": "+e.message+
   ". Puede existir impresión parcial; NO repetir automáticamente.");showError("Transmisión interrumpida: revisar impresora antes de repetir.");}
  finally{hideTransmissionProgress();busy=false;update();}
 });
 $("p1-copy").addEventListener("click",async()=>{
  const data=logElement.textContent;
  try{
   if(!navigator.clipboard?.writeText)throw Error("API portapapeles no disponible");
   await navigator.clipboard.writeText(data);
   log("Registro copiado al portapapeles.");
  }catch(e){
   log("No se pudo copiar automáticamente: "+e.message+"; seleccionar texto del registro.");
  }
 });
 $("p1-clear").addEventListener("click",()=>{
  if(busy){log("No se puede limpiar el registro mientras se está enviando.");return;}
  logElement.textContent="";
  log("Registro limpiado.");
 });
 async function initialize(){
  // Fecha local del teléfono, no UTC: evita adelantar o retrasar un día cerca de medianoche.
  const now=new Date();
  const todayLocal=now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,"0")+"-"+
   String(now.getDate()).padStart(2,"0");
  if(!packed.value)packed.value=todayLocal;
  computeExpiry();
  log("Envasado preseleccionado: "+todayLocal+" (fecha local del dispositivo; editable).");
  log("Panel V1 preparado: HTTPS="+Boolean(window.isSecureContext)+
      "; Web Bluetooth disponible="+Boolean(navigator.bluetooth)+".");
  log("Ficha real "+engine.recipe.name+": "+engine.recipe.portions+" raciones de cocina; etiqueta siempre 1 ración, datos oficiales "+engine.recipe.kcalDisplay+" kcal.");
  log("Diseños: V0.6.2 50×80 vertical, V0.7.3 50×80 horizontal, V0.9 50×30 componente; QR 5/M fijo para componente.");
  log("QR corto: "+engine.recipe.shortUrl+"; resolvedor validado. PRINT 1,2 probado físicamente; desalineación intermitente en el ensayo de diez copias (#49).");
  try{
   await engine.loadIdentity();
   ready=true;
   refreshPreview();
   log("Fuentes oficiales e isotipo BN cargados. Vista previa generada; imprimir requiere fecha y conexión GATT.");
  }catch(e){
   ready=false;showError("No se puede preparar la impresión: "+e.message);
   metrics.textContent="Error al cargar fuentes o isotipo BN.";
  }finally{update();}
 }
 update();
 void initialize();
})();
