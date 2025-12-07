import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');

    if (userInfo) {
      const token = JSON.parse(userInfo).token;
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config; 
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file); 

  try {
    const { data } = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.url; 
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export default api;