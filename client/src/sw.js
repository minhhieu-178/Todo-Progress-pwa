import { cleanupOutdatedCaches, precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration'; 
import { BackgroundSyncPlugin } from 'workbox-background-sync';

cleanupOutdatedCaches();
clientsClaim();
self.skipWaiting();

precacheAndRoute(self.__WB_MANIFEST || []);

const bgSyncPlugin = new BackgroundSyncPlugin('offline-mutation-queue', {
  maxRetentionTime: 24 * 60, 
});

registerRoute(
  ({ url, request }) => 
    url.pathname.startsWith('/api') && 
    request.method !== 'GET',
  new NetworkOnly({
    plugins: [bgSyncPlugin],
  })
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/boards'),
    new NetworkFirst({
    cacheName: 'api-boards-cache',
    networkTimeoutSeconds: 3,
    plugins: [
        new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 // 1 ngày
        })
    ]
    })
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/users'),
  new StaleWhileRevalidate({
    cacheName: 'api-users-cache',
  })
);

const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler, {
  denylist: [
    /^\/api/,  
    /\.[a-z]+$/ 
  ],
});
registerRoute(navigationRoute);


self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.log('Push data là Text');
      const text = event.data.text();
      data = { title: 'Thông báo', body: text, url: '/' };
    }
  }
  
  const title = data.title || 'Thông báo mới';
  const options = {
    body: data.body || 'Bạn có thông báo từ Pro Manage',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: { url: data.url || '/' } 
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});