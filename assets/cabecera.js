/* Navegación compartida. Solo enlaza rutas existentes: sin sesiones ni destinos ficticios. */
(() => {
  'use strict';
  const header = document.querySelector('[data-miru-header]');
  if (!header) return;
  const items = [...header.querySelectorAll('[data-miru-nav-item]')];
  let opened = null;
  let byHover = false;
  let leaveTimer;
  const fine = () => matchMedia('(hover:hover) and (pointer:fine)').matches;
  const close = (returnFocus = false) => {
    clearTimeout(leaveTimer);
    if (!opened) return;
    const button = opened.querySelector('.miru-trigger');
    opened.querySelector('.miru-panel').hidden = true;
    button.setAttribute('aria-expanded', 'false');
    opened = null;
    byHover = false;
    if (returnFocus) button.focus();
  };
  const position = (item) => {
    const panel = item.querySelector('.miru-panel');
    panel.style.transform = '';
    const r = panel.getBoundingClientRect();
    const pad = 12;
    const shift = Math.max(pad - r.left, Math.min(0, innerWidth - pad - r.right));
    if (shift) panel.style.transform = `translateX(${shift}px)`;
  };
  const open = (item, hovered = false) => {
    if (opened && opened !== item) close();
    opened = item;
    byHover = hovered;
    item.querySelector('.miru-panel').hidden = false;
    item.querySelector('.miru-trigger').setAttribute('aria-expanded', 'true');
    position(item);
  };
  items.forEach(item => {
    const trigger = item.querySelector('.miru-trigger');
    const panel = item.querySelector('.miru-panel');
    trigger.addEventListener('click', () => {
      if (opened === item) {
        if (byHover) byHover = false;
        else close();
      } else open(item);
    });
    trigger.addEventListener('keydown', event => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      event.preventDefault(); event.stopPropagation();
      open(item);
      const links = panel.querySelectorAll('a[href]');
      const dest = event.key === 'ArrowUp' ? links[links.length - 1] : links[0];
      dest?.focus();
    });
    item.addEventListener('pointerenter', event => {
      clearTimeout(leaveTimer);
      if (fine() && event.pointerType === 'mouse' && opened !== item) open(item, true);
    });
    item.addEventListener('pointerleave', event => {
      if (fine() && event.pointerType === 'mouse' && opened === item)
        leaveTimer = setTimeout(() => { if (!item.matches(':hover')) close(); }, 130);
    });
    item.addEventListener('focusout', () => {
      queueMicrotask(() => {
        if (opened === item && !item.contains(document.activeElement)) close();
      });
    });
    panel.addEventListener('click', event => { if (event.target.closest('a[href]')) close(); });
  });
  document.addEventListener('pointerdown', event => {
    if (opened && !opened.contains(event.target)) close();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !opened) return;
    event.preventDefault(); event.stopPropagation(); close(true);
  }, true);
  window.addEventListener('resize', () => { if (opened) position(opened); }, {passive:true});
  window.addEventListener('orientationchange', () => { if (opened) close(); }, {passive:true});
})();
