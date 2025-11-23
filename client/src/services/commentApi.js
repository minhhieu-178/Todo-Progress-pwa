import api from './api';

export const getComments = async (boardId, cardId) => {
  try {
    const { data } = await api.get(`/comments?boardId=${boardId}&cardId=${cardId}`);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const createComment = async (content, boardId, cardId) => {
  try {
    const { data } = await api.post('/comments', { content, boardId, cardId });
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};