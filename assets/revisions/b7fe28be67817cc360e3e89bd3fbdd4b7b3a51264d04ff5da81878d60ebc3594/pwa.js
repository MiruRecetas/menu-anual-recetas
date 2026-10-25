(() => {
  'use strict';
  const manifest = document.querySelector('link[rel=manifest]');
  if (!manifest) return;
  const base = new URL('./', manifest.href);
  if (!location.pathname.startsWith(base.pathname) || !window.isSecureContext || !('serviceWorker' in navigator)) return;

  // El CTA de bienvenida y el acceso en cabecera usan un único controlador.
  const installButtons = [...document.querySelectorAll('[data-miru-install]')];
  const heroPromotion = document.querySelector('[data-miru-install-hero]');
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const ua = navigator.userAgent || '';
  const ios = /iPad|iPhone|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const safariIOS = ios && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
  let installPrompt = null;
  let appInstalled = standalone();

  // Safari iOS/iPadOS carece de beforeinstallprompt: instrucciones manuales.
  const guide = document.createElement('dialog');
  guide.className = 'pwa-install-guide';
  guide.setAttribute('aria-label', 'Cómo instalar MiruRecetas');
  guide.innerHTML = '<h2>Instalar MiruRecetas</h2><p>En Safari, toca <strong>Compartir</strong> y elige <strong>Añadir a pantalla de inicio</strong>. Confirma con <strong>Añadir</strong> para abrir MiruRecetas como aplicación.</p><button type="button" class="pwa-guide-close">Entendido</button>';
  if (safariIOS) {
    document.body.append(guide);
    guide.querySelector('button').addEventListener('click', () => guide.close());
    guide.addEventListener('click', e => { if (e.target === guide) guide.close(); });
  }
  function refreshInstall() {
    const show = !appInstalled && !standalone() && (Boolean(installPrompt) || safariIOS);
    installButtons.forEach(button => { button.hidden = !show; });
    if (heroPromotion) heroPromotion.hidden = !show;
  }
  async function install() {
    if (appInstalled || standalone()) return;
    if (installPrompt) {
      const current = installPrompt;
      installPrompt = null; // Cada evento solo permite un prompt.
      try {
        await current.prompt();
        const decision = await current.userChoice;
        if (decision?.outcome === 'accepted') appInstalled = true;
      } catch (_) { /* El navegador puede revocar la invitación. */ }
      refreshInstall();
    } else if (safariIOS && guide.isConnected) guide.showModal();
  }
  installButtons.forEach(button => button.addEventListener('click', install));
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    if (appInstalled || standalone()) return;
    installPrompt = event;
    refreshInstall();
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = null; appInstalled = true;
    if (guide.open) guide.close();
    refreshInstall();
  });
  matchMedia('(display-mode: standalone)').addEventListener?.('change', refreshInstall);
  refreshInstall();

  // Conserva intactas las actualizaciones consentidas y el estado offline.
  const area = document.createElement('section');
  area.className = 'pwa-tools'; area.setAttribute('aria-label', 'Actualización de la aplicación');
  const footer = document.querySelector('.footer');
  if (footer) footer.append(area);
  let registration, accepted = false;
  const update = document.createElement('button');
  update.type = 'button';
  update.textContent = 'Hay una nueva versión disponible. Actualizar';
  update.hidden = true;
  area.append(update);
  update.addEventListener('click', async () => {
    if (!registration?.waiting) return;
    if (document.querySelector('#recipe-ui-data') && !window.confirm('La actualización recargará esta ficha y reiniciará raciones, pasos y temporizador. ¿Actualizar ahora?')) return;
    accepted = true; registration.waiting.postMessage({type:'ACCEPT_UPDATE'});
  });
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
