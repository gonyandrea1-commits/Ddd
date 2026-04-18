const CACHE_NAME = "tech-calc-ocr-v29";
const APP_ASSETS = [
  "./",
  "index.html",
  "styles.css?v=20260416-9",
  "app.js?v=20260418-1",
  "baza.xml?v=20260418-1",
  "manifest.json",
  "icons/icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const isNavigationRequest = event.request.mode === "navigate";

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const cloned = response.clone();
        if (event.request.url.startsWith(self.location.origin)) {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then(cached => {
          if (cached) return cached;
          if (isNavigationRequest) return caches.match("index.html");
          return Response.error();
        })
      )
  );
});
