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

// Custom plugin to prevent caching board responses when there are pending offline changes
class SkipCacheIfOfflineChangesPlugin {
  async cacheWillUpdate({ response, request }) {
    if (!response || !response.ok) return null;
    
    // Only check for board GET requests
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/boards') || request.method !== 'GET') {
      return response;
    }
    
    // Check if there are pending offline requests for this board
    try {
      const db = await openDB('offline-requests-db', 1);
      const requests = await db.getAll('requests');
      
      // Extract boardId from URL (e.g., /api/boards/:boardId)
      const pathParts = url.pathname.split('/').filter(Boolean);
      const boardId = pathParts[2]; // ['api', 'boards', '<boardId>', ...]
      
      if (boardId && requests.length > 0) {
        // Check if any pending request relates to this board
        const hasPendingChanges = requests.some(req => {
          try {
            const reqUrl = new URL(req.url, self.location.origin);
            return reqUrl.pathname.includes(`/boards/${boardId}`);
          } catch (e) {
            return false;
          }
        });
        
        if (hasPendingChanges) {
          console.log(`[SW] Skip caching board ${boardId} - có pending offline changes`);
          return null; // Don't cache this response
        }
      }
    } catch (e) {
      console.warn('[SW] Error checking offline changes:', e);
    }
    
    return response;
  }
}

// --- CẤU HÌNH WORKBOX ---
// We rely on the application's custom queue + 'sync-offline-requests' tag.
// registerRoute for mutation endpoints is intentionally omitted to avoid duplicate handling.

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/boards'),
  new NetworkFirst({
    cacheName: 'api-boards-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new SkipCacheIfOfflineChangesPlugin(),
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
registerRoute(
  ({ url }) => url.pathname.includes('/images/background/'),
  new StaleWhileRevalidate({
    cacheName: 'background-images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler, {
  denylist: [/^\/api/, /\.[a-z]+$/],
});
registerRoute(navigationRoute);

const processOfflineQueue = async () => {
  // Kiểm tra xem có thực sự online không trước khi xử lý
  // Service Worker không có navigator.onLine, nên thử fetch nhỏ để kiểm tra
  try {
    const testResponse = await fetch(self.location.origin, { method: 'HEAD', mode: 'no-cors' });
  } catch (e) {
    console.log('[SW] Không thể kết nối mạng, bỏ qua xử lý offline queue.');
    return;
  }

  const db = await openDB('offline-requests-db', 1);
  const requests = await db.getAll('requests');

  if (requests.length === 0) return;

  console.log(`[SW] Đang xử lý ${requests.length} requests offline...`);

  const MAX_RETRIES = 5;
  const BASE_DELAY_MS = 100;
  const BATCH_SIZE = 3; // Xử lý 3 requests song song

  let sawRateLimit = false;

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  
  // Cache token để tránh lấy lại nhiều lần
  let cachedToken = null;
  let tokenFetchTime = 0;
  const TOKEN_CACHE_DURATION = 5000; // Cache token trong 5s
  
  // Helper để lấy token
  const getToken = async () => {
    if (cachedToken && (Date.now() - tokenFetchTime) < TOKEN_CACHE_DURATION) {
      return cachedToken;
    }
    
    try {
      const allClients = await clients.matchAll({ type: 'window' });
      if (allClients.length === 0) return null;
      
      const client = allClients[0];
      const token = await new Promise((resolve) => {
        const messageHandler = (event) => {
          if (event.data && event.data.type === 'TOKEN_RESPONSE') {
            resolve(event.data.token);
            self.removeEventListener('message', messageHandler);
          }
        };
        self.addEventListener('message', messageHandler);
        setTimeout(() => {
          self.removeEventListener('message', messageHandler);
          resolve(null);
        }, 500);
        client.postMessage({ type: 'GET_TOKEN' });
      });
      
      if (token) {
        cachedToken = token;
        tokenFetchTime = Date.now();
      }
      return token;
    } catch (e) {
      console.error('[SW] Lỗi khi lấy token từ client', e);
      return null;
    }
  };

  // Xử lý requests theo batch để tăng tốc độ
  const processRequest = async (req) => {
    // expire very old requests
    if (Date.now() - req.timestamp > 24 * 60 * 60 * 1000) {
      await db.delete('requests', req.id);
      return { success: false, skipped: true };
    }

    // Get token if needed
    let token = null;
    if (req.authRequired) {
      token = await getToken();
      if (!token) {
        console.warn('[SW] Không lấy được token cho request', req.id);
        return { success: false, retry: true };
      }
    }

    try {
      let body = req.body;
      let headers = req.headers || {};

      // Add authentication token if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Ensure X-Offline-Replay header is present
      if (!headers['X-Offline-Replay']) {
        headers['X-Offline-Replay'] = 'true';
      }

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
        return { success: true };
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
          return { success: false, retry: true };
        } else if (response.status === 429 || response.status >= 500) {
          const newRetry = (req.retryCount || 0) + 1;
          try { 
            await db.put('requests', { ...req, retryCount: newRetry });
          } catch (e) { 
            console.warn('[SW] Không thể cập nhật retryCount', req.id, e); 
          }

          if (newRetry > MAX_RETRIES) {
            await db.delete('requests', req.id);
            console.error(`[SW] Bỏ request ${req.id} sau ${newRetry} lần thử do lỗi server (Status: ${response.status}).`);
            return { success: false };
          } else {
            sawRateLimit = true;
            console.warn(`[SW] Server trả về ${response.status}. Giữ lại request ${req.id} và thử lại sau (retry=${newRetry}).`);
            return { success: false, retry: true, backoff: BASE_DELAY_MS * Math.pow(1.5, Math.min(newRetry - 1, 4)) };
          }
        } else {
          // client error (other 4xx): assume unrecoverable
          if (response.status >= 400) {
            console.error(`[SW] Server từ chối request ${req.id} (Status: ${response.status}). Xoá khỏi hàng đợi.`);
            await db.delete('requests', req.id);
          }
          return { success: false };
        }
      }
    } catch (error) {
      const newRetry = (req.retryCount || 0) + 1;
      try { 
        await db.put('requests', { ...req, retryCount: newRetry }); 
      } catch (e) { 
        console.warn('[SW] Không thể cập nhật retryCount sau lỗi mạng', req.id, e); 
      }

      if (newRetry > MAX_RETRIES) {
        await db.delete('requests', req.id);
        console.error(`[SW] Bỏ request ${req.id} sau ${newRetry} lần thử do lỗi mạng.`);
        return { success: false };
      } else {
        console.warn(`[SW] Lỗi mạng khi sync request ${req.id}, giữ lại trong hàng đợi (retry=${newRetry}).`);
        return { success: false, retry: true };
      }
    }
  };
  
  // Xử lý requests theo batch
  for (let i = 0; i < requests.length; i += BATCH_SIZE) {
    const batch = requests.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(req => processRequest(req)));
    
    // Kiểm tra nếu có request cần backoff
    const needBackoff = results.find(r => r.backoff);
    if (needBackoff) {
      await delay(needBackoff.backoff);
    }
  }
  
  console.log('[SW] Hoàn thành xử lý offline queue.');
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