(()=>{'use strict';const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];const json=q('#recipe-ui-data');if(!json)return;let data;try{data=JSON.parse(json.textContent)}catch{return}const base=data.raciones,fmt=n=>new Intl.NumberFormat('es-ES',{maximumFractionDigits:2}).format(n);let portions=base;const portion=q('#portion-value'),cookPortion=q('#cooking-servings');function renderAmounts(){portion.textContent=portions;cookPortion.textContent=portions+' '+(portions===1?'ración seleccionada':'raciones seleccionadas');qa('[data-qty]').forEach(el=>{const amount=Number(el.dataset.qty)*portions/base;el.textContent=fmt(Math.round(amount*100)/100)+' '+(amount===1?({'dientes':'diente','latas':'lata','raciones':'ración','unidades':'unidad','hojas':'hoja'}[el.dataset.unit]||el.dataset.unit):({'diente':'dientes','lata':'latas','ración':'raciones','unidad':'unidades','hoja':'hojas'}[el.dataset.unit]||el.dataset.unit))});}q('#portion-minus').addEventListener('click',()=>{portions=Math.max(1,portions-1);renderAmounts()});q('#portion-plus').addEventListener('click',()=>{portions=Math.min(100,portions+1);renderAmounts()});renderAmounts();
const front=q('#anverso'),back=q('#reverso'),flip=q('#flip-button');let wakeLock=null;async function releaseWake(){if(wakeLock){try{await wakeLock.release()}catch{}wakeLock=null}}async function requestWake(){if('wakeLock' in navigator && document.visibilityState==='visible'){try{wakeLock=await navigator.wakeLock.request('screen')}catch{}}}function showCook(on){front.classList.toggle('active',!on);back.classList.toggle('active',on);flip.textContent=on?'← Volver a la ficha':'Dar la vuelta · Modo cocina →';if(on)requestWake();else releaseWake();}flip.addEventListener('click',()=>showCook(!back.classList.contains('active')));document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&back.classList.contains('active'))requestWake()});
const boxes=qa('.steps input[type=checkbox]');q('#steps-reset').addEventListener('click',()=>{boxes.forEach(b=>b.checked=false)});
// Cooking timer: one deadline, synchronized inputs/dial, no persistent cooking state.
const MAX_SECONDS = 3 * 3600, HOUR_COLORS = ['#af7251', '#c5a052', '#8c9985'];
let remaining = 600, endsAt = 0, interval = null, sounding = false, soundEnabled = true;
let audio = null, voices = [], alarmInterval = null, alarmTimeout = null, alarmUntil = 0;
const dial = q('#timer-dial'), minutes = q('#timer-minutes'), seconds = q('#timer-seconds'), hours = q('#timer-hours');
const status = q('#timer-status'), start = q('#timer-start'), stop = q('#timer-stop'), center = q('#timer-center');
const ns = 'http://www.w3.org/2000/svg';
function svgNode(tag, attrs, text) {
  const node = document.createElementNS(ns, tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  if (text !== undefined) node.textContent = text;
  return node;
}
function point(angle, radius) { return [150 + Math.sin(angle) * radius, 150 - Math.cos(angle) * radius]; }
for (let m = 0; m < 60; m++) {
  const angle = m * Math.PI / 30, major = m % 5 === 0;
  const a = point(angle, major ? 113 : 118), b = point(angle, 124);
  q('#timer-marks').append(svgNode('line', {x1:a[0], y1:a[1], x2:b[0], y2:b[1], class:major?'major':'minor'}));
  if (major) {
    const p = point(angle, 101);
    q('#timer-marks').append(svgNode('text', {x:p[0], y:p[1], 'text-anchor':'middle', 'dominant-baseline':'central'}, m));
  }
}
function icon(button, name, label) {
  // Recreate only this icon, using the already-local Lucide distribution.
  if (button.dataset.icon !== name) {
    button.dataset.icon = name;
    button.replaceChildren(document.createElement('i'));
    button.firstChild.setAttribute('data-lucide', name);
    button.firstChild.setAttribute('aria-hidden', 'true');
    window.lucide?.createIcons();
  }
  button.setAttribute('aria-label', label); button.title = label;
}
function drawTimer() {
  const h = Math.floor(remaining / 3600), m = Math.floor(remaining % 3600 / 60), s = remaining % 60;
  for (const [input, value] of [[minutes,String(m).padStart(2,'0')],[seconds,String(s).padStart(2,'0')],[hours,String(h)]]) {
    if (document.activeElement !== input) input.value = value;
  }
  const layer = remaining ? Math.ceil(remaining / 3600) - 1 : 0;
  const fraction = remaining ? (remaining - layer * 3600) / 3600 : 0;
  const angle = fraction * 2 * Math.PI, p = point(angle, 127);
  const color = HOUR_COLORS[layer];
  q('#timer-base').style.fill = layer ? HOUR_COLORS[layer-1] : '#faf6ee';
  const sector = q('#timer-sector'); sector.style.fill = color;
  sector.setAttribute('d', fraction === 1 ? 'M150 23 A127 127 0 1 1 150 277 A127 127 0 1 1 150 23 Z' : fraction ? `M150 150 L150 23 A127 127 0 ${fraction>.5?1:0} 1 ${p[0]} ${p[1]} Z` : '');
  const knob = q('#timer-knob'); knob.setAttribute('cx', p[0]); knob.setAttribute('cy', p[1]); knob.style.fill = color;
  dial.setAttribute('aria-valuenow', remaining);
  dial.setAttribute('aria-valuetext', `${h} horas, ${m} minutos y ${s} segundos`);
  dial.dataset.layer = layer; dial.dataset.remaining = remaining;
  icon(start, interval === null ? 'play' : 'pause', interval === null ? 'Iniciar temporizador' : 'Pausar temporizador');
  start.disabled = !remaining || sounding;
  center.hidden = sounding; stop.hidden = !sounding;
  q('.timer').classList.toggle('is-alarming', sounding);
}
function halt() { if (interval !== null) clearInterval(interval); interval = null; }
function stopVoices() { for (const voice of voices) { try { voice.stop(); } catch {} } voices = []; }
function cancelAlarm() {
  sounding = false; clearInterval(alarmInterval); clearTimeout(alarmTimeout); alarmInterval = null; alarmTimeout = null; stopVoices();
  try { navigator.vibrate?.(0); } catch {}
}
function prepareAudio() {
  if (!soundEnabled) return;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    if (!audio) audio = new Audio();
    if (audio.state === 'suspended') audio.resume().catch(() => {});
  } catch { /* Visual alert and supported vibration remain usable. */ }
}
function alarmPulse() {
  if (!sounding) return;
  if (Date.now() >= alarmUntil) { cancelAlarm(); status.textContent = 'Tiempo terminado'; drawTimer(); return; }
  try { if (!document.hidden) navigator.vibrate?.([250,120,250]); } catch {}
  if (!soundEnabled || audio?.state !== 'running') return;
  // Short local tones, scheduled ahead. No remote file, notification permission or backend.
  const now = audio.currentTime;
  for (let i = 0; i < 3; i++) {
    const oscillator = audio.createOscillator(), gain = audio.createGain(), at = now + i * .24;
    oscillator.type = 'sine'; oscillator.frequency.value = i === 1 ? 1046 : 880;
    gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(.18, at+.015);
    gain.gain.exponentialRampToValueAtTime(.001, at+.18);
    oscillator.connect(gain); gain.connect(audio.destination); voices.push(oscillator);
    oscillator.onended = () => { voices = voices.filter(v => v !== oscillator); oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(at); oscillator.stop(at+.2);
  }
}
function finish() {
  halt(); remaining = 0; sounding = true; alarmUntil = Date.now()+30000;
  status.textContent = '¡Tiempo terminado! Detén el aviso en el centro del temporizador.';
  drawTimer(); alarmPulse(); alarmInterval = setInterval(alarmPulse, 1800);
  alarmTimeout = setTimeout(() => { cancelAlarm(); status.textContent = 'Tiempo terminado'; drawTimer(); }, 30000);
}
function tick() {
  if (interval === null) return;
  remaining = Math.max(0, Math.ceil((endsAt-Date.now())/1000));
  if (!remaining) finish(); else drawTimer();
}
function pause() {
  if (interval !== null) { remaining = Math.max(0, Math.ceil((endsAt-Date.now())/1000)); halt(); }
  cancelAlarm(); status.textContent = remaining ? 'En pausa' : ''; drawTimer();
}
function setTime(value) { pause(); remaining = Math.min(MAX_SECONDS,Math.max(0,Math.round(value))); drawTimer(); }
function editTime() {
  const number = input => /^\d+$/.test(input.value) ? Number(input.value) : 0;
  const h = Math.min(3,number(hours)), m = Math.min(59,number(minutes)), s = Math.min(59,number(seconds));
  setTime(h*3600+m*60+s);
}
for (const input of [minutes, seconds, hours]) {
  input.addEventListener('focus', () => { pause(); input.select(); });
  input.addEventListener('input', editTime);
  input.addEventListener('blur', () => { input.value = input===hours ? String(Math.floor(remaining/3600)) : String(input===minutes ? Math.floor(remaining%3600/60) : remaining%60).padStart(2,'0'); });
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') { input.blur(); start.focus(); }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault(); const step = input===hours ? 3600 : input===minutes ? 60 : 1;
      setTime(remaining+(event.key==='ArrowUp'?step:-step));
      input.value = input===hours ? String(Math.floor(remaining/3600)) : String(input===minutes ? Math.floor(remaining%3600/60) : remaining%60).padStart(2,'0');
    }
  });
}
qa('[data-minutes]').forEach(button => button.addEventListener('click', () => setTime(Number(button.dataset.minutes)*60)));
start.addEventListener('click', () => {
  if (interval !== null) { pause(); return; }
  if (!remaining) return;
  prepareAudio(); endsAt = Date.now()+remaining*1000; interval = setInterval(tick,200);
  status.textContent = 'Temporizador en marcha'; drawTimer();
});
q('#timer-reset').addEventListener('click', () => { setTime(0); status.textContent = 'Temporizador a cero'; });
stop.addEventListener('click', () => { cancelAlarm(); drawTimer(); q('#timer-reset').focus(); status.textContent = 'Aviso detenido'; });
q('#timer-sound').addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  if (soundEnabled) prepareAudio(); else stopVoices();
  icon(q('#timer-sound'),soundEnabled?'volume-2':'volume-x',soundEnabled?'Silenciar sonido':'Activar sonido');
  q('#timer-sound').setAttribute('aria-pressed',String(soundEnabled));
});
let drag = null;
function pointerAngle(event) {
  const box = dial.getBoundingClientRect();
  let angle = Math.atan2(event.clientX-box.left-box.width/2, -(event.clientY-box.top-box.height/2));
  return angle<0 ? angle+Math.PI*2 : angle;
}
dial.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0) return;
  event.preventDefault(); dial.focus(); pause();
  const angle = pointerAngle(event);
  const wholeHours = Math.floor(remaining/3600);
  setTime(wholeHours*3600+Math.round(angle/(Math.PI*2)*60)*60);
  drag = {id:event.pointerId,angle,seconds:remaining}; dial.setPointerCapture(event.pointerId);
});
dial.addEventListener('pointermove', event => {
  if (!drag || event.pointerId !== drag.id) return;
  const angle = pointerAngle(event); let delta = angle-drag.angle;
  if (delta>Math.PI) delta-=Math.PI*2; if (delta<-Math.PI) delta+=Math.PI*2;
  drag.seconds = Math.max(0,Math.min(MAX_SECONDS,drag.seconds+delta/(Math.PI*2)*3600)); drag.angle=angle;
  setTime(Math.round(drag.seconds/60)*60);
});
for (const type of ['pointerup','pointercancel','lostpointercapture']) dial.addEventListener(type, () => { drag=null; });
dial.addEventListener('keydown', event => {
  const step = event.shiftKey ? 300 : 60;
  const changes = {ArrowUp:step,ArrowRight:step,ArrowDown:-step,ArrowLeft:-step,PageUp:3600,PageDown:-3600};
  if (event.key in changes || event.key==='Home' || event.key==='End') {
    event.preventDefault(); setTime(event.key==='Home'?0:event.key==='End'?MAX_SECONDS:remaining+changes[event.key]);
  }
});
// Reconcile the absolute deadline after throttling; suspension cannot guarantee an on-time alarm.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) { tick(); if (sounding && Date.now()>=alarmUntil) { cancelAlarm(); drawTimer(); } }
});
window.addEventListener('pagehide', () => { cancelAlarm(); halt(); if(audio)audio.close().catch(()=>{}); audio=null; });
window.addEventListener('pageshow', event => { if(event.persisted) { status.textContent=remaining?'En pausa':''; drawTimer(); } });
drawTimer();
})();
