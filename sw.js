// FunTunes Service Worker — enables PWA install
var CACHE_NAME = "funtunes-v82";
var urlsToCache = [
  "./",
  "css/app.css",
  "js/config.js",
  "js/api.js",
  "js/components.jsx",
  "js/app.jsx",
  "manifest.json"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", function(event) {
  // Always fetch API calls from network (never cache)
  if (event.request.url.includes("script.google.com") || event.request.url.includes("supabase")) {
    return event.respondWith(fetch(event.request));
  }
  // For app files, try network first, fall back to cache
  event.respondWith(
    fetch(event.request).then(function(response) {
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
      return response;
    }).catch(function() {
      return caches.match(event.request);
    })
  );
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) { return name !== CACHE_NAME; })
             .map(function(name) { return caches.delete(name); })
      );
    })
  );
});
