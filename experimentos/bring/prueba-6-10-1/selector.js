'use strict';
(async () => {
  const input = document.getElementById('porciones');
  const minus = document.getElementById('menos');
  const plus = document.getElementById('mas');
  const link = document.getElementById('exportar');
  const status = document.getElementById('estado');
  const table = document.getElementById('lista');
  function parse(value) {
    const n = Number(value);
    return Number.isInteger(n) && n >= 1 && n <= 20 ? n : null;
  }
  try {
    const response = await fetch('vista.json');
    if (!response.ok) throw new Error('No se han cargado las cantidades');
    const views = await response.json();
    function update(value) {
      const n = parse(value);
      if (n === null) {
        link.removeAttribute('href');
        link.setAttribute('aria-disabled', 'true');
        status.textContent = 'Introduce un número entero entre 1 y 20.';
        return;
      }
      const view = views.find(v => v.porciones === n);
      if (!view) throw new Error('Porciones no disponibles');
      input.value = String(n);
      table.replaceChildren();
      for (const row of view.ingredientes) {
        const tr = document.createElement('tr');
        for (const value of [row.nombre, row.cantidad_real, row.spec, row.stock ? 'Despensa' : 'Compra']) {
          const td = document.createElement('td');
          td.textContent = value;
          tr.append(td);
        }
        table.append(tr);
      }
      link.href = view.enlace;
      link.setAttribute('aria-disabled', 'false');
      link.textContent = `Exportar ${n} ${n === 1 ? 'porción' : 'porciones'} a Bring!`;
      document.getElementById('titulo-lista').textContent = `Cantidades para ${n} ${n === 1 ? 'porción' : 'porciones'}`;
      status.textContent = 'Cantidad real escalada y compra redondeada listas para exportar.';
      minus.disabled = n === 1;
      plus.disabled = n === 20;
    }
    minus.addEventListener('click', () => update(Math.max(1, (parse(input.value) || 1) - 1)));
    plus.addEventListener('click', () => update(Math.min(20, (parse(input.value) || 1) + 1)));
    input.addEventListener('input', () => update(input.value));
    update(parse(new URLSearchParams(window.location.search).get('porciones')) || 1);
  } catch (error) {
    link.removeAttribute('href');
    link.setAttribute('aria-disabled', 'true');
    minus.disabled = plus.disabled = input.disabled = true;
    status.textContent = 'No se han podido cargar las cantidades. Recarga la página antes de exportar.';
  }
})();
