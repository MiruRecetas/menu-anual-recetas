(() => {
  'use strict';
  const manifest = document.querySelector('link[rel=manifest]');
  if (!manifest) return;
  const base = new URL('./', manifest.href);
  if (!location.pathname.startsWith(base.pathname) || !window.isSecureContext || !('serviceWorker' in navigator)) return;
  const area = document.createElement('section');
  area.className = 'pwa-tools'; area.setAttribute('aria-label', 'Instalación y actualización');
  document.querySelector('.footer')?.append(area);
  let prompt, registration, accepted = false;
  function button(label, action) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = label;
    b.addEventListener('click', action); area.append(b); return b;
  }
  const install = button('Instalar MiruRecetas', async () => {
    if (!prompt) return;
    await prompt.prompt(); await prompt.userChoice; prompt = null; install.hidden = true;
  }); install.hidden = true;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); prompt = event;
    install.hidden = matchMedia('(display-mode: standalone)').matches;
  });
  window.addEventListener('appinstalled', () => {prompt = null; install.hidden = true;});
  const update = button('Hay una nueva versión disponible. Actualizar', async () => {
    if (!registration?.waiting) return;
    // Deliberate acceptance is the sole reload path. Warn about unsaved cooking state.
    if (document.querySelector('#recipe-ui-data') && !window.confirm('La actualización recargará esta ficha y reiniciará raciones, pasos y temporizador. ¿Actualizar ahora?')) return;
    accepted = true; registration.waiting.postMessage({type:'ACCEPT_UPDATE'});
  }); update.hidden = true;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (accepted) location.reload(); });
  const status = document.createElement('p'); status.setAttribute('role','status'); area.append(status);
  function networkStatus() {
    const stored = document.querySelector('[data-miru-offline]');
    status.textContent = navigator.onLine ? (stored ? 'Conexión recuperada. Reintenta para consultar contenido vigente.' : '') : 'Sin conexión. Solo está disponible el contenido guardado.';
  }
  window.addEventListener('online', networkStatus); window.addEventListener('offline', networkStatus); networkStatus();
  navigator.serviceWorker.register(new URL('sw.js', base), {scope:base.pathname, updateViaCache:'none'}).then(reg => {
    registration = reg;
    const show = () => {update.hidden = !reg.waiting;}; show();
    reg.addEventListener('updatefound', () => reg.installing?.addEventListener('statechange', show));
    const check = () => {if (navigator.onLine) reg.update().catch(()=>{});};
    window.addEventListener('online', check);
    document.addEventListener('visibilitychange', () => {if (!document.hidden) check();});
    check();
  }).catch(() => { /* Normal web remains available without PWA/storage. */ });
})();
