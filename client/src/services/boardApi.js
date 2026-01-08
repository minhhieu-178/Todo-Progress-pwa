import api from './api'; 
import { mergeBoardDataWithOffline, mergeBoardsListWithOffline } from './offlineMerger'; 

// Hàm tiện ích để lấy base URL (chắc chắn khớp với axios config)
const getBaseUrl = () => {
    // Nếu api.defaults.baseURL có giá trị, dùng nó. Nếu không, giả định là relative path hoặc localhost
    return api.defaults.baseURL || 'http://localhost:5001/api';
};

export const getMyBoards = async () => {
  try {
    const { data } = await api.get('/boards');
    return await mergeBoardsListWithOffline(data);
  } catch (error) {
    // Nếu lỗi mạng hoàn toàn và cache rỗng, trả về mảng rỗng rồi merge với offline
    if(error.message && error.message.includes('no-response')) {
        return await mergeBoardsListWithOffline([]);
    }
    throw error.response?.data?.message || error.message;
  }
};

export const createBoard = async (title, boardId, defaultLists = []) => {
  // 1. Tạo object dữ liệu giả lập (Optimistic UI)
  const optimisticBoard = {
      _id: boardId,
      title: title,
      lists: defaultLists, // 3 list mặc định client tạo
      members: [], 
      ownerId: 'me', // Placeholder
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
  };

  // 2. THỦ THUẬT: Inject trực tiếp vào Cache Storage của Service Worker
  // Bước này giúp khi redirect sang trang Detail, SW sẽ tìm thấy dữ liệu này
  if ('caches' in window) {
      try {
          // Tên cache phải KHỚP CHÍNH XÁC với trong sw.js
          const cache = await caches.open('api-boards-cache');
          
          // Tạo URL key chính xác mà getBoardById sẽ gọi
          // Lưu ý: Nếu axios baseURL không có trailing slash, cẩn thận nối chuỗi
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
    const { data } = await api.post('/boards', { 
        title, 
        _id: boardId,
        lists: defaultLists 
    });
    return data;
  } catch (error) {
    // Nếu offline, trả về dữ liệu giả lập để UI không bị crash
    console.warn("Đang offline, trả về optimistic data.");
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

// ... Các hàm khác (updateBoard, deleteBoard...) giữ nguyên code cũ
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