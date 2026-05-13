self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheKeys = await caches.keys();
    await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', () => {
  // Intentionally empty. This release disables stale runtime caching.
});
