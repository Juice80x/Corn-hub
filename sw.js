// Offline support. Online: always fetch the newest files and refresh the saved copy. Offline: fall back to the saved copy.
const CACHE = 'cornhub-v3';
const FILES = ['index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-180.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  const nav = e.request.mode === 'navigate';
  const key = nav ? 'index.html' : e.request;
  if (new URL(e.request.url).pathname.endsWith('version.txt')) return;
  e.respondWith(
    fetch(nav ? new Request(e.request.url, { cache: 'no-store' }) : e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)); }
      return res;
    }).catch(() => caches.match(key).then(hit => hit || Response.error()))
  );
});
