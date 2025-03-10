// service-worker.js

const CACHE_NAME = 'kbot-mistral-cache-v1'; // Unique cache name for your PWA
const ASSETS_TO_CACHE = [
  '/',                 // Cache the root (index.html)
  '/style.css',        // Cache your CSS file (adjust path if needed)
  '/script.js',       // Cache your JavaScript file (adjust path if needed)
  'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700;1,900&display=swap', // Cache Google Fonts CSS
  'https://raw.githubusercontent.com/siddhbose-kivtechs.github.io/kbot-mistral/style.css', // Specific CSS file URL - double check if needed. If '/style.css' works, this may be redundant
  'https://siddhbose-kivtechs.github.io/kbot-mistral/script.js', // Specific JS file URL - double check if needed. If '/script.js' works, this may be redundant
  'https://raw.githubusercontent.com/siddh-kivtechs/ai_image_gen/refs/heads/main/ai-8330457_1280.avif' // Cache your bot icon (example)
  // Add paths to other static assets you want to cache (images, fonts, etc.)
];

// Install event: Cache assets when the service worker is first installed
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell and assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(err => {
        console.error('Service Worker: Cache addAll failed:', err);
      })
  );
  self.skipWaiting(); // Immediately activate the new service worker
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('kbot-mistral-cache')) { // Clear old caches with similar prefix
            console.log('Service Worker: Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of all clients as soon as activated
});

// Fetch event: Serve cached assets or fetch from network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cacheResponse => {
        // Cache hit - return response from cache
        if (cacheResponse) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return cacheResponse;
        }

        // Not in cache - fetch from network
        console.log('Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request);
      })
  );
});
