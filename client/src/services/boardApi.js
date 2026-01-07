import api from './api'; 

export const getMyBoards = async () => {
  try {
    const { data } = await api.get('/boards');
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const createBoard = async (title, boardId) => {
  try {
    const { data } = await api.post('/boards', { title, _id:boardId });
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getBoardById = async (boardId) => {
  try {
    const { data } = await api.get(`/boards/${boardId}`);
    return data;
  } catch (error) {
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
  const { data } = await api.get('/boards/stats');
  return data;
};