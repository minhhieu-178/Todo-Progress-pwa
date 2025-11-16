
import api from './api';

export const createCard = async (title, boardId, listId) => {
  try {
    const { data } = await api.post(`/boards/${boardId}/lists/${listId}/cards`, { title });
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const updateCard = async (boardId, listId, cardId, updateData) => {
  try {
    const { data } = await api.put(`/boards/${boardId}/lists/${listId}/cards/${cardId}`, updateData);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

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
    const { data } = await api.put(`/cards/${cardId}/move`, moveData);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};