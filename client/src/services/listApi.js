import api from './api';

export const createList = async (title, boardId) => {
  try {
    const { data } = await api.post('/lists', { title, boardId });
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};