import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api', // Backend base URL
});

// Request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('splitSmartUser'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
