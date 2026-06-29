/* Chamber apps service worker — enables offline use after first load.
   Cache-first for the app shell; network falls back to cache. */
const CACHE = "chamber-cache-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (e) => {
  // Only handle GET requests
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(e.request).then((cached) => {
        const network = fetch(e.request)
          .then((res) => {
            // cache a copy of successful same-origin responses
            if (res && res.status === 200 && res.type === "basic") {
              cache.put(e.request, res.clone());
            }
            return res;
          })
          .catch(() => cached);
        // serve cached immediately if present, else wait for network
        return cached || network;
      })
    )
  );
});
