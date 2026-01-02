import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api'; // Đảm bảo import axios instance đã cấu hình interceptor
import { registerUser } from '../services/authApi'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 1. Khởi tạo State từ LocalStorage
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('userInfo');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Lỗi parse userInfo:", error);
      return null;
    }
  });

  // --- HÀM LOGIN ---
  const login = async (email, password) => {
    try {
      // Backend trả về: { accessToken, user: { _id, fullName... } }
      const { data } = await api.post('/auth/login', { email, password });
      
      // A. Lưu Access Token riêng để Axios Interceptor dùng
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }

      // B. Lưu thông tin User để hiển thị UI
      setUser(data.user);
      localStorage.setItem('userInfo', JSON.stringify(data.user));
      
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      console.error('Lỗi đăng nhập:', msg);
      throw msg; // Ném lỗi ra để Component Login hiển thị alert
    }
  };

  // --- HÀM LOGOUT ---
  const logout = async () => {
    try {
      await api.get('/auth/logout'); // Gọi API để xóa Refresh Token trong Cookie
    } catch (error) {
      console.error('Lỗi logout server:', error);
    } finally {
      // Xóa sạch mọi thứ ở Client
      setUser(null);
      localStorage.removeItem('userInfo');
      localStorage.removeItem('accessToken'); // Quan trọng!
      window.location.href = '/login'; 
    }
  };

  // --- HÀM REGISTER ---
  const register = async (fullName, email, password, age, phone, address) => {
    try {
      // Backend trả về giống Login: { accessToken, user }
      const data = await registerUser(fullName, email, password, age, phone, address); 
      
      // Tự động đăng nhập luôn sau khi đăng ký thành công
      if (data.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
      }
      if (data.user) {
          setUser(data.user);
          localStorage.setItem('userInfo', JSON.stringify(data.user));
      }

      return true; 
    } catch (error) {
      throw error; 
    }
  };

  // --- HÀM UPDATE USER (Quan trọng cho trang Profile) ---
  const updateUser = (updatedData) => {
    // updatedData có thể là: { ...userFields, token: 'new_token' } hoặc chỉ { ...userFields }
    
    // 1. Tách token ra (nếu có)
    const { token, ...userData } = updatedData;

    // 2. Nếu server cấp token mới -> Lưu ngay
    if (token) {
        localStorage.setItem('accessToken', token);
    }

    // 3. Cập nhật State và LocalStorage (Merge với dữ liệu cũ để tránh mất trường)
    setUser((prevUser) => {
        const newUserState = { ...prevUser, ...userData };
        localStorage.setItem('userInfo', JSON.stringify(newUserState));
        return newUserState;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};