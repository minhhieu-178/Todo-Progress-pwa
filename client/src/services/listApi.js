import api from './api';

export const createList = async (title, boardId) => {
  try {
    const { data } = await api.post(`/boards/${boardId}/lists`, { title });
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const updateList = async (boardId, listId, updateData) => {
    try {
        const { data } = await api.put(`/boards/${boardId}/lists/${listId}`, updateData);
        return data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

export const deleteList = async (boardId, listId) => {
  try {
    const { data } = await api.delete(`/boards/${boardId}/lists/${listId}`);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const moveList = async (boardId, listId, newPosition) => {
  try {
    const { data } = await api.put(`/boards/${boardId}/lists/move`, { 
        listId, 
        newPosition 
    });
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};