import axios from 'axios';
import { saveOfflineRequest } from './offlineStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Chỉ khai báo 1 lần
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

// --- REQUEST INTERCEPTOR ---
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

// --- RESPONSE INTERCEPTOR (Duy nhất 1 cái) ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Xử lý Token hết hạn (Refresh Token)
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
            // Cập nhật cả userInfo để đồng bộ
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

    // 2. Xử lý Offline (Mất mạng)
    if (!error.response && !navigator.onLine) {
        // Chỉ lưu các request thay đổi dữ liệu
        if (['post', 'put', 'delete', 'patch'].includes(originalRequest.method)) {
            try {
                const token = localStorage.getItem('accessToken');
                
                // QUAN TRỌNG: Phải lưu Full URL để Service Worker gọi đúng server
                // Nếu config.url đã chứa http thì dùng luôn, nếu không thì nối với baseURL
                const fullUrl = originalRequest.url.startsWith('http') 
                    ? originalRequest.url 
                    : (api.defaults.baseURL + originalRequest.url);

                await saveOfflineRequest(
                    fullUrl, // Đã sửa thành Full URL
                    originalRequest.method,
                    originalRequest.data,
                    token
                );

                if ('serviceWorker' in navigator && 'SyncManager' in window) {
                    const registration = await navigator.serviceWorker.ready;
                    await registration.sync.register('sync-offline-requests');
                }

                return Promise.resolve({ 
                    data: { 
                        success: true, 
                        message: 'Đang offline: Dữ liệu đã được lưu và sẽ tự động gửi khi có mạng.' 
                    } 
                });

            } catch (saveError) {
                console.error("Lỗi lưu offline request:", saveError);
            }
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