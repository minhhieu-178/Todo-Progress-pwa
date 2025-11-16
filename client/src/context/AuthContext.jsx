import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api'; //
import { registerUser } from '../services/authApi'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

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

  const register = async (fullName, email, password) => {
    try {
      await registerUser(fullName, email, password); 
      return true; 
    } catch (error) {
      throw error.response?.data?.message || error.message; 
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};