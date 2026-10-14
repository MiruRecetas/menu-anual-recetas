'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const input = $('porciones'), minus = $('menos'), plus = $('mas'), link = $('exportar'), status = $('estado');
  let views, sequence = 0, current = null;
  const parse = value => /^\d+$/.test(String(value)) && Number(value) >= 1 && Number(value) <= 20 ? Number(value) : null;
  function block(message, retry = false) {
    link.removeAttribute('href'); link.setAttribute('aria-disabled', 'true');
    status.textContent = message; $('reintentar').hidden = !retry;
  }
  async function update(value) {
    const request = ++sequence, n = parse(value); current = n;
    block('Comprobando la exportación…');
    if (n === null) { block('Introduce un número entero entre 1 y 20.'); return; }
    const view = views.find(v => v.porciones === n);
    if (!view) { block('Estas porciones no están disponibles. Recarga la página.', true); return; }
    input.value = String(n); minus.disabled = n === 1; plus.disabled = n === 20;
    $('lista').replaceChildren();
    for (const row of view.ingredientes) {
      const tr = document.createElement('tr'), name = document.createElement('td');
      name.textContent = row.nombre;
      if (row.descripcion) { const detail = document.createElement('span'); detail.className = 'purchase-variant'; detail.textContent = row.descripcion; name.append(detail); }
      tr.append(name);
      for (const text of [row.necesidad, row.exportada]) { const td = document.createElement('td'); td.textContent = text; tr.append(td); }
      const td = document.createElement('td'); const label = document.createElement('span'); label.textContent = row.stock ? 'Despensa' : 'Compra';
      if (row.stock) label.className = 'purchase-stock'; td.append(label); tr.append(td); $('lista').append(tr);
    }
    $('condimentos').replaceChildren();
    for (const name of view.condimentos) { const li = document.createElement('li'); li.textContent = name; $('condimentos').append(li); }
    $('titulo-lista').textContent = `Cantidades para ${n} ${n === 1 ? 'porción' : 'porciones'}`;
    const url = new URL(location.href); url.searchParams.set('porciones', n); history.replaceState(null, '', url);
    if (!navigator.onLine) { block('Sin conexión. Puedes consultar la lista; conecta para importar a Bring!.', true); return; }
    try {
      const response = await fetch(`exports/${n}.json`, {cache:'no-store'});
      if (!response.ok || !response.headers.get('content-type')?.includes('json')) throw new Error('Exportación no disponible');
      const payload = await response.json();
      if (payload.yield !== String(n) || payload.items?.length !== view.ingredientes.length + view.condimentos.filter(name => !payload.items.some(x => x.itemId === name && x.spec && x.stock)).length || !payload.imageUrl) throw new Error('Exportación incompleta');
      if (request !== sequence) return;
      link.href = view.enlace; link.setAttribute('aria-disabled', 'false');
      link.textContent = `Exportar ${n} ${n === 1 ? 'porción' : 'porciones'} a Bring!`;
      status.textContent = 'Compra lista para importar. Requiere conexión.'; $('reintentar').hidden = true;
    } catch {
      if (request === sequence) block('No se ha podido cargar la exportación. Reintenta con conexión antes de importar.', true);
    }
  }
  link.addEventListener('click', event => {
    if (link.getAttribute('aria-disabled') === 'true' || !navigator.onLine) { event.preventDefault(); block('Conecta a internet antes de importar a Bring!.', true); }
  });
  try {
    views = JSON.parse($('purchase-data').textContent);
    if (!Array.isArray(views) || views.length !== 20) throw new Error('Datos incompletos');
    minus.addEventListener('click', () => update(Math.max(1, (parse(input.value) || 1) - 1)));
    plus.addEventListener('click', () => update(Math.min(20, (parse(input.value) || 1) + 1)));
    input.addEventListener('input', () => update(input.value));
    $('reintentar').addEventListener('click', () => update(input.value));
    window.addEventListener('online', () => update(input.value));
    window.addEventListener('offline', () => { ++sequence; block('Sin conexión. Puedes consultar la lista; conecta para importar a Bring!.', true); });
    const query = new URLSearchParams(location.search);
    update(query.has('porciones') ? query.get('porciones') : 1);
  } catch { block('No se han podido preparar las cantidades. Recarga la página.'); input.disabled = minus.disabled = plus.disabled = true; }
})();
