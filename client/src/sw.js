import { cleanupOutdatedCaches, precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration'; 
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { openDB } from 'idb';

cleanupOutdatedCaches();
clientsClaim();
self.skipWaiting();

precacheAndRoute(self.__WB_MANIFEST || []);

// --- CẤU HÌNH WORKBOX ---
const bgSyncPlugin = new BackgroundSyncPlugin('offline-mutation-queue', {
  maxRetentionTime: 24 * 60, 
});

registerRoute(
  ({ url, request }) => url.pathname.startsWith('/api') && request.method !== 'GET',
  new NetworkOnly({ plugins: [bgSyncPlugin] })
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/boards'),
  new NetworkFirst({
    cacheName: 'api-boards-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 })
    ]
  })
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/users'),
  new StaleWhileRevalidate({ cacheName: 'api-users-cache' })
);

const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler, {
  denylist: [/^\/api/, /\.[a-z]+$/],
});
registerRoute(navigationRoute);

// --- XỬ LÝ SYNC OFFLINE THỦ CÔNG ---
const processOfflineQueue = async () => {
  const db = await openDB('offline-requests-db', 1);
  const requests = await db.getAll('requests');

  if (requests.length === 0) return;

  console.log(`[SW] Đang xử lý ${requests.length} requests offline...`);

  for (const req of requests) {
    // Check thời gian: Nếu request quá cũ (ví dụ > 24h) thì bỏ qua để tránh lỗi data cũ
    if (Date.now() - req.timestamp > 24 * 60 * 60 * 1000) {
        await db.delete('requests', req.id);
        continue;
    }

    try {
      let body = req.body;
      let headers = req.headers || {};

      // Tái tạo FormData từ Object
      if (req.isFormData) {
        const formData = new FormData();
        for (const key in req.body) {
            formData.append(key, req.body[key]);
        }
        body = formData;
        // Quan trọng: Khi gửi FormData, KHÔNG được set Content-Type thủ công
        // Để trình duyệt tự set boundary (multipart/form-data; boundary=...)
        delete headers['Content-Type'];
      } else if (typeof body === 'object') {
        body = JSON.stringify(body);
      }

      const response = await fetch(req.url, {
        method: req.method,
        headers: headers,
        body: body,
      });

      if (response.ok) {
        await db.delete('requests', req.id);
        console.log(`[SW] Đồng bộ thành công: ${req.url}`);
        
        if (req.url.includes('/upload')) {
             self.registration.showNotification('Tải lên hoàn tất', {
                body: 'File của bạn đã được đồng bộ lên máy chủ.',
                icon: '/icons/icon-192x192.png'
             });
        }
      } else {
        // Nếu lỗi Client (400, 401, 403, 404, 500) -> Xóa để tránh lặp vô tận
        // Chỉ giữ lại nếu lỗi mạng thật sự
        if (response.status >= 400) {
            console.error(`[SW] Server từ chối request ${req.id} (Status: ${response.status})`);
            await db.delete('requests', req.id);
        }
      }
    } catch (error) {
      console.error(`[SW] Lỗi mạng khi sync request ${req.id}, giữ lại trong hàng đợi.`);
    }
  }
};

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-requests') {
    console.log('[SW] Bắt đầu đồng bộ background...');
    event.waitUntil(processOfflineQueue());
  }
});

// --- PUSH NOTIFICATION ---
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Thông báo', body: event.data.text(), url: '/' };
    }
  }
  
  const options = {
    body: data.body || 'Bạn có thông báo mới',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: { url: data.url || '/' } 
  };

  event.waitUntil(self.registration.showNotification(data.title || 'Thông báo', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      const urlToOpen = event.notification.data?.url || '/';
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});