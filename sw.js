'use strict';
// Public same-origin resources only. No third-party interception or credentials.
const BASE = new URL('./', self.location.href);
const PREFIX = 'mirurecetas-pwa-';
const CORE = PREFIX + 'core-dd69f20b4f1b0772a8c9';
const RUNTIME = PREFIX + 'public-v1';
const MAX_AGE = 30 * 86400000;
const LIMITS = {page: 40, asset: 64, image: 40, json: 2};
const PRECACHE = ["offline.html", "manifest.webmanifest", "assets/pwa/icon-192.png?v=10d60cfd076eaecb80e41808746dfbab2641670b10098a515df102bc1691cba6", "assets/pwa/icon-512.png?v=ebca609236d2bcbd70bda84fff12f35df218c40ef6e5c260e3ddcef2f33805a4", "assets/pwa/maskable-512.png?v=78eb7dea61bde883bd8ced1df8301c1472ddd92c0a9178dd0fdc5f90b577426d"];
self.addEventListener('install', event => event.waitUntil((async () => {
  const cache = await caches.open(CORE);
  for (const path of PRECACHE) {
    const url = new URL(path, BASE);
    const response = await fetch(url, {cache: 'no-store', credentials: 'omit'});
    if (!response.ok || response.redirected) throw new Error('Invalid precache');
    await cache.put(url, response);
  }
})()));
// Waiting is intentional: no skipWaiting/claim during a cooking session.
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const key of await caches.keys()) {
    if (key.startsWith(PREFIX + 'core-') && key !== CORE) await caches.delete(key);
  }
  await prune();
})()));
// Explicit acceptance only; reload is confined to the accepting tab.
self.addEventListener('message', event => {
  if (event.data?.type === 'ACCEPT_UPDATE') event.waitUntil(self.skipWaiting());
});
function kind(url, request) {
  const path = url.pathname.slice(BASE.pathname.length);
  if (request.mode === 'navigate' && !url.search &&
      (path === '' || path === 'index.html' || path === 'recetario/' || path === 'recetario/index.html' ||
       /^recetas\/[a-z0-9-]+\/(?:index\.html)?$/.test(path) ||
       /^menus\/\d{2}-[1-4]\/[^/]+\/(?:index\.html)?$/.test(path))) return 'page';
  if (/^assets\/(?:revisions\/[a-f0-9]{64}\/)?[a-zA-Z0-9_.-]+\.(css|js)$/.test(path) && /^[a-f0-9]{64}$/.test(url.searchParams.get('v') || '') && [...url.searchParams.keys()].every(k => k === 'v')) return 'asset';
  if (/^imagenes\/[^/]+\.(webp|png|jpe?g)$/i.test(path) && !url.search) return 'image';
  if (path === 'indice-recetas.json' && !url.search) return 'json';
  return null;
}
async function valid(response, type, url) {
  if (!response.ok || response.status !== 200 || response.redirected || response.type === 'opaque' || response.headers.has('Vary') && response.headers.get('Vary').includes('*')) return false;
  const mime = response.headers.get('Content-Type') || '';
  if (Number(response.headers.get('Content-Length')) > (type === 'image' ? 2097152 : 1048576)) return false;
  if (type === 'page') {
    const text = await response.clone().text();
    return mime.includes('text/html') && text.includes('MiruRecetas') && /<\/html>\s*$/i.test(text);
  }
  if (type === 'json') {
    if (!mime.includes('json')) return false;
    try { const d = await response.clone().json(); return Array.isArray(d.recetas) && d.total_recetas === d.recetas.length && typeof d.source_commit_sha === 'string'; } catch { return false; }
  }
  if (type === 'asset') {
    if (!(mime.includes('javascript') || mime.includes('text/css'))) return false;
    const bytes = await response.clone().arrayBuffer();
    const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(b => b.toString(16).padStart(2,'0')).join('');
    return hash === url.searchParams.get('v');
  }
  const bytes = new Uint8Array(await response.clone().arrayBuffer());
  if (bytes.length > 2097152) return false;
  if (mime.includes('webp')) return String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP';
  if (mime.includes('png')) return bytes[0] === 137 && String.fromCharCode(...bytes.slice(1,4)) === 'PNG';
  if (mime.includes('jpeg')) return bytes[0] === 255 && bytes[1] === 216 && bytes[bytes.length-2] === 255 && bytes[bytes.length-1] === 217;
  return false;
}
// Serialize writes/pruning to enforce bounds even with concurrent image requests.
let writes = Promise.resolve();
function store(url, response, type) {
  const job = writes.catch(() => {}).then(async () => {
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > (type === 'image' ? 2097152 : 1048576)) return;
    const headers = new Headers(response.headers);
    headers.delete('Content-Encoding'); headers.delete('Content-Length');
    headers.set('X-Miru-Saved', String(Date.now())); headers.set('X-Miru-Kind', type);
    const cache = await caches.open(RUNTIME);
    await cache.delete(url); // insertion order is the eviction order
    await cache.put(url, new Response(bytes, {status: 200, headers}));
    await prune();
  });
  writes = job;
  return job;
}
async function prune() {
  const cache = await caches.open(RUNTIME), groups = {};
  for (const key of await cache.keys()) {
    const response = await cache.match(key), type = response.headers.get('X-Miru-Kind');
    if (!LIMITS[type] || Date.now() - Number(response.headers.get('X-Miru-Saved')) > MAX_AGE) { await cache.delete(key); continue; }
    (groups[type] ||= []).push(key);
  }
  for (const [type, keys] of Object.entries(groups)) for (const key of keys.slice(0, Math.max(0, keys.length - LIMITS[type]))) await cache.delete(key);
}
async function saved(url) {
  const cache = await caches.open(RUNTIME), response = await cache.match(url);
  if (!response) return null;
  if (Date.now() - Number(response.headers.get('X-Miru-Saved')) > MAX_AGE) { await cache.delete(url); return null; }
  return response;
}
async function dependencies(response) {
  const html = await response.clone().text();
  const urls = [...html.matchAll(/(?:src|href)="([^"<>]+\/assets\/(?:revisions\/[a-f0-9]{64}\/)?[a-zA-Z0-9_.-]+\.(?:js|css)\?v=[a-f0-9]{64})"/g)].map(m => new URL(m[1], BASE));
  if (!urls.length) return false;
  for (const url of urls) {
    if (url.origin !== BASE.origin || !url.pathname.startsWith(BASE.pathname)) return false;
    if (await saved(url)) continue;
    const asset = await fetch(url, {cache:'no-store', credentials:'omit'});
    if (!await valid(asset, 'asset', url)) return false;
    await store(url, asset, 'asset');
  }
  return true;
}
async function offlinePage(url) {
  const response = await saved(url);
  if (response) {
    const html = await response.text();
    // Pages whose matching assets were evicted are no longer usable offline.
    const urls = [...html.matchAll(/(?:src|href)="([^"<>]+\/assets\/(?:revisions\/[a-f0-9]{64}\/)?[a-zA-Z0-9_.-]+\.(?:js|css)\?v=[a-f0-9]{64})"/g)].map(m=>m[1]);
    if (urls.length && (await Promise.all(urls.map(u=>saved(u)))).every(Boolean)) {
      const notice = '<p role="status" data-miru-offline style="margin:0;padding:12px;background:#f5eadd;color:#29352e;text-align:center">Contenido guardado; puede no estar actualizado. <a href="'+url.href+'">Reintentar</a></p>';
      return new Response(html.replace(/<body([^>]*)>/i, '<body$1>'+notice), {headers:{'Content-Type':'text/html; charset=utf-8'}});
    }
  }
  return (await caches.open(CORE)).match(new URL('offline.html', BASE));
}
async function respond(request, url, type) {
  try {
    const controller = new AbortController(), timeout = setTimeout(()=>controller.abort(), 8000);
    let response;
    try { response = await fetch(request, {cache:'no-store', credentials:'omit', signal:controller.signal}); }
    finally { clearTimeout(timeout); }
    if (!await valid(response, type, url)) throw new Error('Invalid response');
    // Storage failure must never make a valid online response inaccessible.
    try {
      if (type !== 'page' || await dependencies(response)) await store(url, response.clone(), type);
    } catch {}
    return response;
  } catch {
    if (type === 'page') return await offlinePage(url) || Response.error();
    return await saved(url) || Response.error();
  }
}
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== BASE.origin || !url.pathname.startsWith(BASE.pathname) || request.headers.has('Authorization')) return;
  const type = kind(url, request);
  if (type) event.respondWith(respond(request, url, type));
  else if (PRECACHE.includes(url.pathname.slice(BASE.pathname.length) + url.search)) {
    event.respondWith((async () => {
      try { const response = await fetch(request, {cache:'no-store', credentials:'omit'}); if (response.ok && !response.redirected) return response; } catch {}
      return await (await caches.open(CORE)).match(url) || Response.error();
    })());
  }
});
