//Quản lý đăng nhập
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api'; // Import axios instance

// 1. Tạo Context
const AuthContext = createContext();

// 2. Tạo Provider (Component "bọc" ứng dụng)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // State chứa thông tin user

  // 3. Kiểm tra localStorage khi app mới tải
  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // 4. Hàm Login
  const login = async (email, password) => {
    try {
      // Gọi API login (đã tạo ở Backend Bước 2)
      const { data } = await api.post('/auth/login', { email, password });
      
      // Lưu thông tin user vào state
      setUser(data);
      
      // Lưu vào localStorage để giữ đăng nhập
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      return true; // Trả về true nếu thành công
    } catch (error) {
      console.error('Lỗi đăng nhập:', error.response?.data?.message || error.message);
      return false; // Trả về false nếu thất bại
    }
  };

  // 5. Hàm Logout
  const logout = () => {
    // Xóa state
    setUser(null);
    // Xóa khỏi localStorage
    localStorage.removeItem('userInfo');
  };

  // 6. Cung cấp state và hàm cho các component con
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 7. Tạo hook tùy chỉnh (useAuth) để dễ dàng sử dụng
export const useAuth = () => {
  return useContext(AuthContext);
};