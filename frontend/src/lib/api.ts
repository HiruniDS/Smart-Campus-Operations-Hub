import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for token injection
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        // Redirct to login on 401 Unauthorized
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
      } else if (status === 403) {
        // Redirect to unauthorized page on 403 Forbidden
        window.location.href = '/unauthorized';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
