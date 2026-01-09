import api from './api'; 
import { mergeBoardDataWithOffline, mergeBoardsListWithOffline } from './offlineMerger'; 

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
          const baseUrl = getBaseUrl();
          const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
          const url = `${cleanBaseUrl}/boards/${boardId}`;
          
          const response = new Response(JSON.stringify(optimisticBoard), {
              headers: { 'Content-Type': 'application/json' }
          });
          
          await cache.put(url, response);
          console.log(`[Offline] Đã inject cache cho board: ${boardId}`);
      } catch (err) {
          console.error("Lỗi cache thủ công:", err);
      }
  }

  // 3. Gửi request thực tế (Background Sync sẽ bắt nếu offline)
  try {
    const { data } = await api.post('/boards', boardData);
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
    if (error.message && error.message.includes('no-response')) {
        console.warn("Board không tìm thấy trong cache, thử tìm trong hàng đợi offline...");
        // Fallback: Thử tạo một board rỗng và merge data từ queue (trường hợp hiếm)
        const fallbackBoard = { _id: boardId, title: 'Đang đồng bộ...', lists: [] };
        return await mergeBoardDataWithOffline(fallbackBoard);
    }
    throw error.response?.data?.message || error.message;
  }
};

export const updateBoard = async (boardId, updateData) => {
    try {
        const { data } = await api.put(`/boards/${boardId}`, updateData);
        return data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

export const deleteBoard = async (boardId) => {
    try {
        const { data } = await api.delete(`/boards/${boardId}`);
        return data;
    } catch (error) {
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
    try {
        const response = await api.get('/boards/templates');
        return response.data; 
    } catch (error) {
        console.error("Lỗi API Templates:", error);
        return []; 
    }
};