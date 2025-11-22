import api from './api';


export const registerUser = async (fullName, email, password) => {
  try {
    const { data } = await api.post('/auth/register', { fullName, email, password });
    return data; 
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const loginUser = async (email, password) => {
  try {
    const { data } = await api.post('/auth/login', { email, password });
    return data; 
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const updateProfile = async (fullName) => {
  try {
    const { data } = await api.put('/auth/profile', { fullName });
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const forgotPassword = async (email) => {
  try {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};