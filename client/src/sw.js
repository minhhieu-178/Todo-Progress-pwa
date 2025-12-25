import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';

cleanupOutdatedCaches();
clientsClaim();
self.skipWaiting();

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/boards'),
  new NetworkFirst({
    cacheName: 'api-boards-cache',
    networkTimeoutSeconds: 3, 
  })
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/users'),
  new StaleWhileRevalidate({
    cacheName: 'api-users-cache',
  })
);

// 3. Xử lý PUSH NOTIFICATION (Web Push API)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
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

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-new-cards') {
    event.waitUntil(syncCards());
  }
});

async function syncCards() {
  console.log('Background Sync đang chạy: sync-new-cards');
}