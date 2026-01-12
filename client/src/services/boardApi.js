import api from './api'; 
import axios from 'axios';
import { mergeBoardDataWithOffline, mergeBoardsListWithOffline } from './offlineMerger'; 
import { getAllOfflineRequests, deleteOfflineRequest } from './offlineStore';

const getBaseUrl = () => {
    return api.defaults.baseURL || 'http://localhost:5001/api';
};

export const getMyBoards = async () => {
  try {
    const { data } = await api.get('/boards');
    return await mergeBoardsListWithOffline(data);
  } catch (error) {
    if(error.message && error.message.includes('no-response')) {
        return await mergeBoardsListWithOffline([]);
    }
    throw error.response?.data?.message || error.message;
  }
};

export const createBoard = async (boardData) => {
  const { title, _id: boardId, lists = [], background = '#f3f4f6' } = boardData;

  // 1. Tạo object dữ liệu giả lập (Optimistic UI) 
  // Thêm trường background để UI hiển thị đúng màu ngay cả khi offline
  const optimisticBoard = {
      _id: boardId,
      title: title,
      lists: lists, 
      background: background,
      members: [], 
      ownerId: 'me', 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
  };

  // 2. Inject trực tiếp vào Cache Storage của Service Worker (Hỗ trợ Offline-first)
  if ('caches' in window) {
      try {
      const cache = await caches.open('api-boards-cache');
      // Build the full URL using the axios instance baseURL to match what SW will request
      const base = (api && api.defaults && api.defaults.baseURL) ? api.defaults.baseURL : getBaseUrl();
      const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
      const fullUrl = `${cleanBase}/boards/${boardId}`;

      const response = new Response(JSON.stringify(optimisticBoard), {
        headers: { 'Content-Type': 'application/json' }
      });

      await cache.put(fullUrl, response);
      console.log(`[Offline] Đã inject cache cho board: ${boardId} -> ${fullUrl}`);
      } catch (err) {
          console.error("Lỗi cache thủ công:", err);
      }
  }

  // 3. Gửi request thực tế (Background Sync sẽ bắt nếu offline)
  try {
    const { data } = await api.post('/boards', boardData);
    
    // 4. Update cache danh sách boards sau khi online success
    if ('caches' in window) {
      try {
        const cache = await caches.open('api-boards-cache');
        const base = (api && api.defaults && api.defaults.baseURL) ? api.defaults.baseURL : getBaseUrl();
        const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
        const boardsListUrl = `${cleanBase}/boards`;
        
        const cachedResponse = await cache.match(boardsListUrl);
        if (cachedResponse) {
          const cachedBoards = await cachedResponse.json();
          // Avoid duplicate
          const exists = cachedBoards.find(b => b._id === data._id);
          if (!exists) {
            const updatedBoards = [data, ...cachedBoards];
            await cache.put(boardsListUrl, new Response(JSON.stringify(updatedBoards), {
              headers: { 'Content-Type': 'application/json' }
            }));
            console.log(`[Offline] Updated boards list cache with new board: ${data._id}`);
          }
        }
      } catch (err) {
        console.error("Lỗi cập nhật cache danh sách boards:", err);
      }
    }

    return data;
  } catch (error) {
    console.warn("[Offline] Đang offline, trả về optimistic data.");
    return optimisticBoard;
  }
};

export const getBoardById = async (boardId) => {
  try {
    const { data } = await api.get(`/boards/${boardId}`);
    return await mergeBoardDataWithOffline(data);
  } catch (error) {
    // Nếu gặp lỗi no-response (do cache injection thất bại hoặc bị xóa)
    // If no-response (network failure / SW cache miss), try merging empty fallback
    if (error.message && error.message.includes('no-response')) {
        console.warn("Board không tìm thấy trong cache, thử tìm trong hàng đợi offline...");
        const fallbackBoard = { _id: boardId, title: 'Đang đồng bộ...', lists: [] };
        return await mergeBoardDataWithOffline(fallbackBoard);
    }

    // If server returned 404 but we have an optimistic cached board (created while offline), return that
    if (error.response && error.response.status === 404) {
        // First: try to see if there's a pending create-board in the offline queue for this id.
        try {
          const pending = await getAllOfflineRequests();
          if (Array.isArray(pending)) {
            const createReq = pending.find(r => {
              try {
                if (r.method && r.method.toLowerCase() === 'post') {
                  const pth = new URL(r.url, window.location.origin).pathname.split('/').filter(Boolean);
                  // expect path like: ['api', 'boards'] or ['api','boards','<id>']
                  if (pth.length >= 2 && pth[0] === 'api' && pth[1] === 'boards') {
                    const body = typeof r.body === 'string' ? JSON.parse(r.body) : r.body;
                    return body && (body._id === boardId || body.id === boardId);
                  }
                }
              } catch (e) {
                return false;
              }
              return false;
            });

            if (createReq) {
              console.log('[offline-replay] Found pending create-board for', boardId, ' — attempting silent refresh + replay');

              // Attempt silent refresh using axios (so cookies are included)
              try {
                const refreshUrl = `${(api && api.defaults && api.defaults.baseURL) ? api.defaults.baseURL : getBaseUrl()}/auth/refresh-token`;
                const refreshRes = await axios.post(refreshUrl, {}, { withCredentials: true });
                if (refreshRes?.data?.accessToken) {
                  localStorage.setItem('accessToken', refreshRes.data.accessToken);
                  const userInfo = localStorage.getItem('userInfo');
                  if (userInfo) {
                    try {
                      const parsed = JSON.parse(userInfo);
                      parsed.accessToken = refreshRes.data.accessToken;
                      localStorage.setItem('userInfo', JSON.stringify(parsed));
                    } catch (e) { /* ignore parse errors */ }
                  }
                }

                // Replay the create-board using the api axios instance so interceptors are used
                const replayBody = typeof createReq.body === 'string' ? JSON.parse(createReq.body) : createReq.body;
                try {
                  const { data: created } = await api.post('/boards', replayBody);
                  console.log('[offline-replay] Replay create-board succeeded for', boardId, created);
                  // remove the queued request
                  try { await deleteOfflineRequest(createReq.id); } catch (e) { console.warn('[offline-replay] Could not delete queued request', e); }

                  // After successful replay, retry fetching the board from server
                  const { data: fresh } = await api.get(`/boards/${boardId}`);
                  return await mergeBoardDataWithOffline(fresh);
                } catch (replayErr) {
                  console.warn('[offline-replay] Replay failed:', replayErr?.response?.status || replayErr.message);
                  // fall-through to cache fallback below
                }
              } catch (refreshErr) {
                console.warn('[offline-replay] Silent refresh failed:', refreshErr?.response?.status || refreshErr.message);
                // fall-through to cache fallback below
              }
            }
          }
        } catch (e) {
          console.warn('[offline-replay] Error while checking offline queue:', e);
        }

        // If we didn't replay or replay failed, fallback to optimistic cache if present
        if ('caches' in window) {
          try {
            const base = (api && api.defaults && api.defaults.baseURL) ? api.defaults.baseURL : getBaseUrl();
            const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
            const fullUrl = `${cleanBase}/boards/${boardId}`;
            const cache = await caches.open('api-boards-cache');
            const cachedResponse = await cache.match(fullUrl);
            if (cachedResponse) {
              const text = await cachedResponse.text();
              const cachedData = JSON.parse(text);
              return await mergeBoardDataWithOffline(cachedData);
            }
          } catch (e) {
            console.warn('Lỗi khi đọc cache optimistic board:', e);
          }
        }
    }

    throw error.response?.data?.message || error.message;
  }
};

import { updateBoardInCache, updateBoardsListCache } from './cacheService';

export const updateBoard = async (boardId, updateData) => {
    // Optimistically update cache
    const updateCache = async () => {
         // 1. Update Detail
         await updateBoardInCache(boardId, (board) => ({ ...board, ...updateData }));
         
         // 2. Update List (if title/bg changed)
         await updateBoardsListCache((list) => {
             const index = list.findIndex(b => b._id === boardId);
             if (index !== -1) {
                 list[index] = { ...list[index], ...updateData };
             }
             return list;
         });
    };
    
    updateCache();

    try {
        const { data } = await api.put(`/boards/${boardId}`, updateData);
        return data;
    } catch (error) {
        // If offline, return optimistic update
        if (!navigator.onLine || error.message?.includes('no-response')) {
            console.warn("[Offline] Đang offline, trả về optimistic update.");
            return { ...updateData, _id: boardId };
        }
        throw error.response?.data?.message || error.message;
    }
};

export const deleteBoard = async (boardId) => {
    // Optimistic cache deletion
    const deleteCache = async () => {
        // 1. Delete Detail - actually we can't delete using updateBoardInCache easily, so we might keep the manual delete logic or add deleteBoardCache to service.
        // But for now, let's just stick to the manual implementation for deleteDetail in the service or just inline it? 
        // Inline is fine for delete as it's unique.
        // Wait, I can't delete a file using the helper I made.
        if ('caches' in window) {
             const cache = await caches.open('api-boards-cache');
             const cleanBase = (api.defaults.baseURL || '').replace(/\/$/, "");
             await cache.delete(`${cleanBase}/boards/${boardId}`);
        }

        // 2. Remove from List
        await updateBoardsListCache((list) => list.filter(b => b._id !== boardId));
    };

    deleteCache();

    try {
        const { data } = await api.delete(`/boards/${boardId}`);
        return data;
    } catch (error) {
        if (!navigator.onLine || error.message?.includes('no-response')) {
            return { message: 'Deleted offline' };
        }
        throw error.response?.data?.message || error.message;
    }
};

export const addMemberToBoard = async (boardId, email) => {
  try {
    const { data } = await api.put(`/boards/${boardId}/members`, { email });
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const removeMemberFromBoard = async (boardId, userId) => {
  try {
    const { data } = await api.delete(`/boards/${boardId}/members/${userId}`);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getDashboardStats = async () => {
  // Stats thường không cache hoặc cache ngắn, tùy bạn
  const { data } = await api.get('/boards/stats');
  return data;
};

export const uploadBoardBackground = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const { data } = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.url; // Server trả về { url: ... }
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getBoardTemplates = async () => {
  const cacheKey = 'boardTemplates_v1';
  try {
    const response = await api.get('/boards/templates');
    const templates = response.data;
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), templates }));
    } catch (e) {
      // ignore localStorage errors
    }
    return templates;
  } catch (error) {
    console.warn("Lỗi API Templates, dùng cache nếu có:", error?.message || error);
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.templates || [];
      }
    } catch (e) {
      // ignore parse errors
    }
    return [];
  }
};