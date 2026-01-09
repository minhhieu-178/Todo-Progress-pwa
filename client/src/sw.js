import { cleanupOutdatedCaches, precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration'; 
// Note: We use a custom offline queue stored in IndexedDB (offline-requests-db).
// To avoid conflicting replay strategies we do not use Workbox BackgroundSyncPlugin here.
import { openDB } from 'idb';

cleanupOutdatedCaches();
clientsClaim();
self.skipWaiting();

precacheAndRoute(self.__WB_MANIFEST || []);

// --- CẤU HÌNH WORKBOX ---
// We rely on the application's custom queue + 'sync-offline-requests' tag.
// registerRoute for mutation endpoints is intentionally omitted to avoid duplicate handling.

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
registerRoute(
  ({ url, request }) => url.pathname.startsWith('/api') && request.method === 'GET',
  new NetworkFirst({
    cacheName: 'api-general-cache', 
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 })
    ]
  })
);
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler, {
  denylist: [/^\/api/, /\.[a-z]+$/],
});
registerRoute(navigationRoute);

const processOfflineQueue = async () => {
  const db = await openDB('offline-requests-db', 1);
  const requests = await db.getAll('requests');

  if (requests.length === 0) return;


  console.log(`[SW] Đang xử lý ${requests.length} requests offline...`);

  const MAX_RETRIES = 5;
  const BASE_DELAY_MS = 300; // base delay used for exponential backoff
  const BETWEEN_REQUEST_DELAY_MS = 150; // small gap between each replayed request

  let sawRateLimit = false;

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  for (const req of requests) {
    // expire very old requests
    if (Date.now() - req.timestamp > 24 * 60 * 60 * 1000) {
      await db.delete('requests', req.id);
      continue;
    }

    // If this request requires authentication, ask clients to refresh silently and skip it for now.
    if (req.authRequired) {
      try {
        const allClients = await clients.matchAll({ type: 'window' });
        for (const client of allClients) {
          client.postMessage({ type: 'OFFLINE_SYNC_AUTH_NEEDED', url: req.url, id: req.id });
        }
        // keep the request (do not attempt now) — it will be retried after client refresh/re-registers sync
      } catch (e) {
        console.error('[SW] Không thể thông báo client về yêu cầu auth cho offline request', req.id, e);
      }
      continue;
    }

    try {
      let body = req.body;
      let headers = req.headers || {};

      if (req.isFormData) {
        const formData = new FormData();
        for (const key in req.body) {
          const val = req.body[key];
          // preserve objects as JSON strings except File/Blob which idb can store as-is
          if (val && typeof val === 'object' && !(val instanceof Blob)) {
            formData.append(key, JSON.stringify(val));
          } else {
            formData.append(key, val);
          }
        }
        body = formData;
        delete headers['Content-Type'];
      } else if (typeof body === 'object') {
        body = JSON.stringify(body);
      }

      const response = await fetch(req.url, {
        method: req.method,
        headers: headers,
        body: body,
        credentials: 'include',
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
        // Auth errors: notify clients so they can refresh then re-register sync
        if (response.status === 401 || response.status === 403) {
          try {
            const allClients = await clients.matchAll({ type: 'window' });
            for (const client of allClients) {
              client.postMessage({ type: 'OFFLINE_SYNC_AUTH_REQUIRED', url: req.url, status: response.status });
            }
          } catch (e) {
            console.error('[SW] Lỗi khi gửi message tới clients:', e);
          }
          // keep the request for later
        } else if (response.status === 429 || response.status >= 500) {
          const newRetry = (req.retryCount || 0) + 1;
          try { await db.put({ ...req, retryCount: newRetry }); } catch (e) { console.warn('[SW] Không thể cập nhật retryCount', req.id, e); }

          if (newRetry > MAX_RETRIES) {
            await db.delete('requests', req.id);
            console.error(`[SW] Bỏ request ${req.id} sau ${newRetry} lần thử do lỗi server (Status: ${response.status}).`);
          } else {
            if (!sawRateLimit) {
              sawRateLimit = true;
              console.warn(`[SW] Server trả về ${response.status}. Giữ lại request ${req.id} và thử lại sau (retry=${newRetry}).`);
            }
            // optional: apply exponential backoff by delaying the next processing
            const backoff = BASE_DELAY_MS * Math.pow(2, Math.min(newRetry - 1, 6));
            await delay(backoff);
          }
        } else {
          // client error (other 4xx): assume unrecoverable
          if (response.status >= 400) {
            console.error(`[SW] Server từ chối request ${req.id} (Status: ${response.status}). Xoá khỏi hàng đợi.`);
            await db.delete('requests', req.id);
          }
        }
      }
    } catch (error) {
      const newRetry = (req.retryCount || 0) + 1;
      try { await db.put({ ...req, retryCount: newRetry }); } catch (e) { console.warn('[SW] Không thể cập nhật retryCount sau lỗi mạng', req.id, e); }

      if (newRetry > MAX_RETRIES) {
        await db.delete('requests', req.id);
        console.error(`[SW] Bỏ request ${req.id} sau ${newRetry} lần thử do lỗi mạng.`);
      } else {
        if (!sawRateLimit) console.warn(`[SW] Lỗi mạng khi sync request ${req.id}, giữ lại trong hàng đợi (retry=${newRetry}).`);
      }
    }

    // small delay between requests to reduce chance of hitting rate limits
    try { await delay(BETWEEN_REQUEST_DELAY_MS); } catch (e) { /* ignore */ }
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