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

    let token = localStorage.getItem('accessToken');
    if (!token) {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          const parsedUser = JSON.parse(userInfo);
          token = parsedUser.accessToken;
        } catch (e) {
          console.error("Lỗi parse userInfo", e);
        }
      }
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config; 
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;


    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; 

      try {


        const res = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`, 
            {}, 
            { withCredentials: true }
        );

        if (res.data.accessToken) {
            localStorage.setItem('accessToken', res.data.accessToken);

            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                const parsedUser = JSON.parse(userInfo);
                parsedUser.accessToken = res.data.accessToken;
                localStorage.setItem('userInfo', JSON.stringify(parsedUser));
            }

            originalRequest.headers['Authorization'] = `Bearer ${res.data.accessToken}`;

            return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Phiên đăng nhập hết hạn:", refreshError);
        
        localStorage.removeItem('userInfo');
        localStorage.removeItem('accessToken');
        
        if (window.location.pathname !== '/login') {
            alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

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