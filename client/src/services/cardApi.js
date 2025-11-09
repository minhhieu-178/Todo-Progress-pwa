import api from './api';

export const createCard = async (title, boardId, listId) => {
  try {
    const { data } = await api.post('/cards', { title, boardId, listId });
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