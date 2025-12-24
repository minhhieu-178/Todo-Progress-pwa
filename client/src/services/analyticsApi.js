import api from './api';

export const getAnalyticsData = async (boardId = 'all') => {
  const response = await api.get(`/analytics?boardId=${boardId}`);
  return response.data;
};