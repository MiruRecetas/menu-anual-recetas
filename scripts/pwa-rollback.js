// Emergency template: publish these bytes at the EXISTING sw.js URL.
// No fetch handler: new navigations use the network. Emergency activation is intentional.
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const key of await caches.keys()) if (key.startsWith('mirurecetas-pwa-')) await caches.delete(key);
  await self.registration.unregister();
})()));
