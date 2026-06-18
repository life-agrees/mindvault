import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3002',
  withCredentials: true,
});

// Auth token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mv_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // E2EE: always attach derived encryption key from sessionStorage
  const encKey = sessionStorage.getItem('mv_encryption_key');
  if (encKey) config.headers['x-encryption-key'] = encKey;

  return config;
});
