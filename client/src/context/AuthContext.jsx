import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // ---LOGIN ---
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }

      setUser(data.user);
      localStorage.setItem('userInfo', JSON.stringify(data.user));
      
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      console.error('Lỗi đăng nhập:', msg);
      throw msg; 
    }
  };

  // LOG OUT
  const logout = async () => {
    try {
      await api.get('/auth/logout'); 
    } catch (error) {
      console.error('Lỗi logout server:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('userInfo');
      localStorage.removeItem('accessToken');
      window.location.href = '/login'; 
    }
  };

  // ---  REGISTER ---
  const register = async (fullName, email, password, age, phone, address) => {
    try {

      const data = await registerUser(fullName, email, password, age, phone, address); 
      
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

  const updateUser = (updatedData) => {
    
    const { token, ...userData } = updatedData;

    if (token) {
        localStorage.setItem('accessToken', token);
    }

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