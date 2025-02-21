const version = 1;
const appCache = 'appFiles_' + version;
const imgCache = 'movieImages_' + version;
const searchCache = 'searchResults_' + version;
const cartCache = 'cartItems_' + version;
const rentedCache = 'rentedMovies_' + version;

const appFiles = [
  './',
  './index.html',
  './styles.css',
  './main.js',
  './sw.js',
  './manifest.json',
  './placeholder.mp4',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(appCache).then((cache) => {
      return cache.addAll(appFiles);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheList) => {
      return Promise.all(
        cacheList
          .filter((cache) => ![appCache, imgCache, searchCache, cartCache, rentedCache].includes(cache))
          .map((cache) => caches.delete(cache))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isImage = url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif)$/);
  const isTMDB = url.hostname.includes('api.themoviedb.org');

  if (isImage) {
    event.respondWith(staleWhileRevalidate(event, imgCache));
  } else if (isTMDB) {
    event.respondWith(staleWhileRevalidate(event, searchCache));
  } else {
    event.respondWith(networkFirst(event, appCache));
  }
});

function staleWhileRevalidate(event, cacheName) {
  return caches.match(event.request).then((cacheResponse) => {
    const fetchResponse = fetch(event.request).then((response) => {
      return caches.open(cacheName).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    });
    return cacheResponse || fetchResponse;
  });
}

function networkFirst(event, cacheName) {
  return fetch(event.request)
    .then((response) => {
      return caches.open(cacheName).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    })
    .catch(() => caches.match(event.request));
}
