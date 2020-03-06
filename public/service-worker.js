const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.webmanifest',
    '/style.css',
    '/index.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
  ];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// install
self.addEventListener("install", function(event) {
    event.waitUntil(caches.open(CACHE_NAME).then( cache => {
        return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// activate
self.addEventListener("activate", function(event) {
    event.waitUntil(caches.keys().then(keyList => {
        return Promise.all( 
            keyList.map( key => {
            if ( key !== CACHE_NAME && key!== DATA_CACHE_NAME ) {
                console.log('Removing old key: ', key);
                return caches.delete(key);
            };
        }));
    }));
    self.clients.claim();
});

// fetch
self.addEventListener("fetch", function(event) {
    if ( event.request.url.includes('/api') ) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(event.request)
                .then(response => {
                    if (response.status === 200) {
                        cache.put(event.response.url, response.clone());
                    }
                    return response;
                })
            })
        );
    };
});