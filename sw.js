const prefix = 'cuaderno-u3-' + self.registration.scope;
const cacheName = prefix + '-v1';
const files = ['index.html','style.css','app.js','componentes.js','servicio.js','vue.esm-browser.prod.js','manifest.webmanifest','icon-192.png','icon-512.png'];
const url = file => new URL(file, self.registration.scope).href;
const assets = new Set(files.map(url));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll([...assets])));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith(prefix + '-') && key !== cacheName) await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const address = new URL(req.url);
  address.hash = '';
  address.search = '';
  const home = req.mode === 'navigate' && [url('./'),url('index.html')].includes(address.href);
  if (!home && !assets.has(req.url)) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    return (await cache.match(home ? url('index.html') : req.url)) || fetch(req);
  })());
});
