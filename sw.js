const CACHE_NAME = "naijacare-lite-v2";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/tips.json",
  "/offline.html"
];

// ✅ Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// ✅ Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ✅ Fetch
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          // Only cache same-origin files
          if (event.request.url.startsWith(self.location.origin)) {
            caches.open(CACHE_NAME).then((cache) =>
              cache.put(event.request, response.clone())
            );
          }
          return response;
        })
        .catch(() => caches.match("/offline.html")); // Fallback if offline
    })
  );
});
