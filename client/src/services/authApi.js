import api from './api';

export const logoutUser = async () => {
  try {
    const { data } = await api.get('/auth/logout');
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};
export const registerUser = async (fullName, email, password, age, phone, address) => {
  try {
    const { data } = await api.post('/auth/register', { fullName, email, password, age, phone, address});
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

export const updateProfile = async (userData) => {
  try {
    const { data } = await api.put('/users/profile', userData );
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

export const deleteAccount = async (password) => {
  try {
    const { data } = await api.delete('/users/profile', { 
      data: { password } 
    });
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const requestChangePassword = async (currentPassword) => {
  try {
    const { data } = await api.post('/auth/change-password-request', { currentPassword });
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const confirmChangePassword = async (otp, newPassword) => {
  try {
    const { data } = await api.post('/auth/change-password-confirm', { otp, newPassword });
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};