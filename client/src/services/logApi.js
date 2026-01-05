import axiosClient from './api';

export const getBoardLogs = async (boardId) => {
  try {
    const response = await axiosClient.get(`/logs/${boardId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getMyActivities = async () => {
  try {
    const response = await axiosClient.get('/logs/user/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};