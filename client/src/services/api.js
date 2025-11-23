import axios from 'axios';

<<<<<<< HEAD
=======

>>>>>>> origin/main
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');

    if (userInfo) {
      const token = JSON.parse(userInfo).token;
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config; 
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;