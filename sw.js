importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDsG05Ps-qmlCs3INEdgHQNTkp5uIVrYMU",
  authDomain: "ledger-app-565d2.firebaseapp.com",
  projectId: "ledger-app-565d2",
  storageBucket: "ledger-app-565d2.firebasestorage.app",
  messagingSenderId: "400710691366",
  appId: "1:400710691366:web:0dd3a1b0269b9cc5efd4e7"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'Ledger App';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new update.',
    icon: '/logo.png', // path to icon
    badge: '/logo.png', // path to badge/icon
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

const CACHE_NAME = 'expense-tracker-v49';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,300,0,0&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).then(() => self.skipWaiting());
    }).catch(err => console.log('SW cache error', err))
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;
  // Ignore firebase requests from caching
  if (event.request.url.includes('firestore.googleapis.com')) return;
  if (event.request.url.includes('firebaseio.com')) return;
  if (event.request.url.includes('googleapis.com/identitytoolkit')) return;

  const url = new URL(event.request.url);

  // Keep HTML/navigation fresh so deployed UI updates immediately after publish.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // NETWORK-FIRST for app code and styles (so updates show immediately)
  const isAppAsset = /\/(app\.js|style\.css|manifest\.json|sw\.js)(\?|$)/.test(url.pathname + url.search);
  if (isAppAsset) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // CACHE-FIRST for everything else (fonts, icons, etc.)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    }).catch(() => {
      // Fallback
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
