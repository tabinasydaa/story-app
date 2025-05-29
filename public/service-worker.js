const CACHE_NAME = 'story-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/style.css',
  '/src/main.js',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap',
  'https://unpkg.com/leaflet/dist/leaflet.css',
  '/icons/vite.svg',  // Gunakan vite.svg sebagai ikon
  '/icons/b9dc4954-33a3-4457-8e6a-6d3810c905d9.png',  // Gunakan gambar baru sebagai badge
];

// Cache saat install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Intersepsi fetch
self.addEventListener('fetch', (event) => {
  const requestURL = new URL(event.request.url);

  // Jangan intercept request untuk localhost (untuk server lokal)
  if (event.request.url.includes('localhost:3001')) return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Jika ada respons cache, langsung gunakan
        if (cachedResponse) {
          console.log('Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // Fetch dari jaringan jika tidak ada cache
        return fetch(event.request)
          .then((networkResponse) => {
            // Jika tidak ada respons atau ada kesalahan, kembalikan respons error
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
              return networkResponse;
            }

            // Clone response sebelum menggunakannya
            const clonedResponse = networkResponse.clone();

            // Identifikasi apakah URL ini adalah gambar eksternal
            const isExternalImage = requestURL.hostname !== self.location.hostname;

            // Hanya cache jika gambar berasal dari server yang sama (local server)
            if (!isExternalImage) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clonedResponse);
              });
            }

            // Kembalikan respons jaringan
            return networkResponse;
          })
          .catch((error) => {
            console.error('Failed to fetch:', event.request.url);
            return new Response('', { status: 503, statusText: 'Service Unavailable' });
          });
      })
  );
});

// Push Notification
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);

  event.waitUntil(
    (async () => {
      let notificationData = {};
      try {
        notificationData = event.data.json();
        console.log('Notification data:', notificationData);
      } catch (e) {
        const fallbackText = await event.data.text();
        notificationData = {
          title: 'Notifikasi',
          body: fallbackText || 'Pesan tidak tersedia',
        };
      }

      const title = notificationData.title || 'Notifikasi';
      const options = {
        body: notificationData.body || 'Ada notifikasi baru!',
        icon: '/vite.svg',  // Gunakan ikon yang ada
        badge: '/badge.jpg',  // Gambar badge untuk notifikasi
      };

      self.registration.showNotification(title, options);
    })()
  );
});


