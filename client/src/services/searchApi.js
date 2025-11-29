import api from './api';

// Gọi API: /api/search/users?q=...
export const searchUsersApi = async (keyword) => {
  try {
    const { data } = await api.get(`/search/users?q=${keyword}`);
    return data;
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
};