//File này cấu hình axios
import axios from 'axios';

// Tạo một instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: 'http://localhost:5001/api', // URL gốc của backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm một "interceptor" (bộ chặn) cho request
// Nó sẽ tự động gắn token vào header Authorization
api.interceptors.request.use(
  (config) => {
    // Lấy thông tin user từ localStorage
    const userInfo = localStorage.getItem('userInfo');

    if (userInfo) {
      // Parse JSON và lấy token
      const token = JSON.parse(userInfo).token;
      if (token) {
        // Gắn token vào header
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config; // Trả về config đã chỉnh sửa
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;