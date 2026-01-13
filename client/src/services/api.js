import axios from 'axios';
import { saveOfflineRequest, getAllOfflineRequests } from './offlineStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

// --- REQUEST INTERCEPTOR ---
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('accessToken');
    if (!token) {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          const parsedUser = JSON.parse(userInfo);
          token = parsedUser.accessToken;
        } catch (e) {
          console.error("Lỗi parse userInfo", e);
        }
      }
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config; 
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
      originalRequest._retry = true; 

      try {
        const res = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`, 
            {}, 
            { withCredentials: true }
        );

        if (res.data.accessToken) {
            localStorage.setItem('accessToken', res.data.accessToken);
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                const parsedUser = JSON.parse(userInfo);
                parsedUser.accessToken = res.data.accessToken;
                localStorage.setItem('userInfo', JSON.stringify(parsedUser));
            }

            originalRequest.headers['Authorization'] = `Bearer ${res.data.accessToken}`;
            return api(originalRequest);
        }
      } catch (refreshError) {
        // Nếu lỗi do mạng (offline), không hiển thị alert và không redirect
        if (!navigator.onLine || !refreshError.response) {
          console.warn("Không thể refresh token do offline, sẽ thử lại khi có mạng:", refreshError.message);
          return Promise.reject(refreshError);
        }
        
        console.error("Phiên đăng nhập hết hạn:", refreshError);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('accessToken');
        if (window.location.pathname !== '/login') {
            alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

  if (!error.response && !navigator.onLine) {
    if (['post', 'put', 'delete', 'patch'].includes(originalRequest.method)) {
      try {
        const token = localStorage.getItem('accessToken');

        const fullUrl = originalRequest.url.startsWith('http') 
          ? originalRequest.url 
          : (api.defaults.baseURL + originalRequest.url);

        await saveOfflineRequest(
          fullUrl, 
          originalRequest.method,
          originalRequest.data,
          token
        );

        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          const registration = await navigator.serviceWorker.ready;
          await registration.sync.register('sync-offline-requests');
        }

        // build mockData from request body (string or object)
        let mockData = {};
        if (originalRequest.data) {
          if (originalRequest.data instanceof FormData) {
            const fileEntry = originalRequest.data.get('file'); // Check Key 'file' used in cardApi
            if (fileEntry instanceof File || fileEntry instanceof Blob) {
                mockData = {
                  name: fileEntry.name || 'document',
                  type: fileEntry.type,
                  url: URL.createObjectURL(fileEntry),
                  uploadedAt: new Date().toISOString()
                };
            }
          } else {
            try {
              mockData = typeof originalRequest.data === 'string' ? JSON.parse(originalRequest.data) : originalRequest.data;
            } catch (e) {
              mockData = originalRequest.data || {};
            }
          }
        }

        // If body lacks _id, try to infer from the URL (e.g. /boards/:b/lists/:l/cards/:cardId or /boards/:boardId/cards/:cardId/move)
        let inferredId = mockData._id;
        try {
          const pathname = new URL(fullUrl).pathname;
          const parts = pathname.split('/').filter(Boolean);
          const cardsIdx = parts.findIndex(p => p === 'cards');
          if (!inferredId && cardsIdx !== -1 && parts.length > cardsIdx + 1) {
            inferredId = parts[cardsIdx + 1];
          } else if (!inferredId) {
            // try boards or lists
            const last = parts[parts.length - 1];
            const secondLast = parts[parts.length - 2];
            if (['boards', 'lists'].includes(secondLast)) inferredId = last;
          }
        } catch (e) {
          // ignore, will fallback to generated id
        }

        if (!inferredId) inferredId = `offline-temp-${Date.now()}`;

        if (originalRequest.method === 'post' && originalRequest.url.includes('/lists') && !originalRequest.url.includes('/cards')) {
          mockData.cards = [];
        }

        return Promise.resolve({ 
          data: { 
            success: true, 
            message: 'Đang offline: Dữ liệu đã được lưu.',
            ...mockData, 
            _id: inferredId
          } 
        });
      } catch (saveError) {
        console.error("Lỗi lưu offline request:", saveError);
      }
    }
  }

    // If server returned 404 for a mutation, it may be because the target board was created offline
    // and hasn't been replayed to the server yet. In that case queue this mutation and return a mocked
    // optimistic response so the UI doesn't show an immediate error.
    if (error.response && error.response.status === 404 && !originalRequest._retry) {
      const method = originalRequest.method && originalRequest.method.toLowerCase();
      if (['post', 'put', 'delete', 'patch'].includes(method)) {
        try {
          const token = localStorage.getItem('accessToken');
          const fullUrl = originalRequest.url && originalRequest.url.startsWith('http')
            ? originalRequest.url
            : (api.defaults.baseURL + originalRequest.url);

          // Try to infer boardId from URL
          let boardId = null;
          try {
            const p = new URL(fullUrl).pathname.split('/').filter(Boolean);
            const boardsIdx = p.findIndex(seg => seg === 'boards');
            if (boardsIdx !== -1 && p.length > boardsIdx + 1) boardId = p[boardsIdx + 1];
          } catch (e) {}

          let optimisticExists = false;

          // 1) Check Cache Storage for optimistic board entry
          if ('caches' in window && boardId) {
            try {
              const base = (api && api.defaults && api.defaults.baseURL) ? api.defaults.baseURL : fullUrl;
              const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
              const boardUrl = `${cleanBase}/boards/${boardId}`;
              const cache = await caches.open('api-boards-cache');
              const cached = await cache.match(boardUrl);
              if (cached) optimisticExists = true;
            } catch (e) {
              // ignore
            }
          }

          // 2) Or check if there is a pending create-board request in the offline queue
          if (!optimisticExists) {
            try {
              const pending = await getAllOfflineRequests();
              if (Array.isArray(pending)) {
                optimisticExists = pending.some(r => {
                  try {
                    if (r.method.toLowerCase() === 'post') {
                      const pth = new URL(r.url, window.location.origin).pathname.split('/').filter(Boolean);
                      return pth.length >= 3 && pth[0] === 'api' && pth[1] === 'boards' && r.body && ((typeof r.body === 'object' && r.body._id === boardId) || (typeof r.body === 'string' && JSON.parse(r.body)._id === boardId));
                    }
                  } catch (e) { }
                  return false;
                });
              }
            } catch (e) {}
          }

          if (optimisticExists) {
            // Save current mutation into offline queue and register sync
            await saveOfflineRequest(
              fullUrl,
              originalRequest.method,
              originalRequest.data,
              token
            );

            if ('serviceWorker' in navigator && 'SyncManager' in window) {
              try {
                const registration = await navigator.serviceWorker.ready;
                await registration.sync.register('sync-offline-requests');
              } catch (e) {
                // ignore registration failures
              }
            }

            // Build a mocked response similar to offline branch
            let mockData = {};
            if (originalRequest.data) {
              try {
                mockData = typeof originalRequest.data === 'string' ? JSON.parse(originalRequest.data) : originalRequest.data;
              } catch (e) {
                mockData = originalRequest.data || {};
              }
            }

            let inferredId = mockData._id;
            try {
              const pathname = new URL(fullUrl).pathname;
              const parts = pathname.split('/').filter(Boolean);
              const cardsIdx = parts.findIndex(p => p === 'cards');
              if (!inferredId && cardsIdx !== -1 && parts.length > cardsIdx + 1) inferredId = parts[cardsIdx + 1];
              else if (!inferredId) {
                const last = parts[parts.length - 1];
                const secondLast = parts[parts.length - 2];
                if (['boards', 'lists'].includes(secondLast)) inferredId = last;
              }
            } catch (e) {}
            if (!inferredId) inferredId = `offline-temp-${Date.now()}`;

            return Promise.resolve({
              data: {
                success: true,
                message: 'Đang offline: Dữ liệu đã được lưu và sẽ được đồng bộ.',
                ...mockData,
                _id: inferredId
              }
            });
          }
        } catch (e) {
          // fall through to original reject
        }
      }
    }
    return Promise.reject(error);
  }
);

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file); 

  try {
    const { data } = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.url; 
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export default api;