
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

export const moveCard = async (cardId, moveData) => {
  try {
    const { boardId } = moveData; 
    const { data } = await api.put(`/boards/${boardId}/cards/${cardId}/move`, moveData);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const addMemberToCard = async (boardId, listId, cardId, userId) => {
  try {
    const { data } = await api.post(`/boards/${boardId}/lists/${listId}/cards/${cardId}/members`, { userId });
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const removeMemberFromCard = async (boardId, listId, cardId, userId) => {
  try {
    const { data } = await api.delete(`/boards/${boardId}/lists/${listId}/cards/${cardId}/members`, { 
      data: { userId } 
    });
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const uploadCardAttachment = async (boardId, listId, cardId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file); 

    const { data } = await api.post(
      `/boards/${boardId}/lists/${listId}/cards/${cardId}/attachments`, 
      formData, 
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};