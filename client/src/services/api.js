import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        if (parsedUser.accessToken) {
            config.headers['Authorization'] = `Bearer ${parsedUser.accessToken}`;
        }
      } catch (e) {
        console.error("Lỗi parse userInfo", e);
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