import api from './api'; 


export const getMyBoards = async () => {
  try {
    const { data } = await api.get('/boards');
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const createBoard = async (title) => {
  try {
    const { data } = await api.post('/boards', { title });
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};