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
    // if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
    //     if (!config.headers['X-Request-Id']) {
    //         config.headers['X-Request-Id'] = uuidv4();
    //     }
    // }
    
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nếu gặp lỗi 401 (Unauthorized) -> Token sai hoặc hết hạn
    if (error.response && error.response.status === 401) {
      // Xóa thông tin user cũ
      localStorage.removeItem('userInfo');
      
      // Chuyển hướng về trang login (Dùng window.location vì đây không phải React Component)
      // Kiểm tra để tránh reload loop nếu đang ở trang login
      if (window.location.pathname !== '/login') {
          alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
export default api;