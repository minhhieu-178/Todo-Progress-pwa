import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';
import { registerUser } from '../services/authApi'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('userInfo');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Lỗi parse userInfo:", error);
      return null;
    }
  });


  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      return true;
    } catch (error) {
      console.error('Lỗi đăng nhập:', error.response?.data?.message || error.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.get('/auth/logout'); 
    } catch (error) {
      console.error('Lỗi logout server:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('userInfo');
      window.location.href = '/login'; 
    }
  };

  const register = async (fullName, email, password, age, phone, address) => {
    try {
      await registerUser(fullName, email, password, age, phone, address); 
      return true; 
    } catch (error) {
      throw error.response?.data?.message || error.message; 
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('userInfo', JSON.stringify(updatedUserData));
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