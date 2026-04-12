import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
});

export function setBasicAuth(username, password) {
  apiClient.defaults.auth = { username, password };
}

export default apiClient;
