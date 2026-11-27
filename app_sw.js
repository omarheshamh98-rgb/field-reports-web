// Field Reports — offline copy of the app.
// Online: always fetch the newest files (and keep a copy).
// Offline: serve the saved copy. Supabase and other sites are never cached.
const CACHE = 'field-reports-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await fetch(req, { cache: 'no-cache' });
      if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
      return res;
    } catch (err) {
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      if (req.mode === 'navigate') {
        const page = (await cache.match('./')) || (await cache.match('index.html'));
        if (page) return page;
      }
      throw err;
    }
  })());
});
