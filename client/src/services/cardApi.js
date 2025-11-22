import api from './api';

// API tạo thẻ mới
export const createCard = async (title, boardId, listId) => {
  try {
    const { data } = await api.post(`/boards/${boardId}/lists/${listId}/cards`, { title });
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// API cập nhật thẻ
export const updateCard = async (boardId, listId, cardId, updateData) => {
  try {
    const { data } = await api.put(`/boards/${boardId}/lists/${listId}/cards/${cardId}`, updateData);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// API xóa thẻ
export const deleteCard = async (boardId, listId, cardId) => {
  try {
    const { data } = await api.delete(`/boards/${boardId}/lists/${listId}/cards/${cardId}`);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

// --- SỬA LỖI Ở ĐÂY ---
// Cập nhật đúng đường dẫn API để khớp với Backend
export const moveCard = async (cardId, moveData) => {
  try {
    // Lấy boardId từ moveData để điền vào URL
    const { boardId } = moveData; 
    const { data } = await api.put(`/boards/${boardId}/cards/${cardId}/move`, moveData);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};