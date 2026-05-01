import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
});

export function setBasicAuth(username, password) {
  if (username && password) {
    localStorage.setItem('basicAuthUser', username);
    localStorage.setItem('basicAuthPass', password);
  }
  apiClient.defaults.auth = username && password ? { username, password } : undefined;
}

// Auto-apply credentials on every request: Bearer token first, Basic auth as fallback
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    const username = localStorage.getItem('basicAuthUser');
    const password = localStorage.getItem('basicAuthPass');
    if (username && password) {
      config.auth = { username, password };
    }
  }
  return config;
});

export default apiClient;
