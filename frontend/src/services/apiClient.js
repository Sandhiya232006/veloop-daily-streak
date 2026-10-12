import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('veloop_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Never surface raw Axios/Mongo error internals to the UI.
    const message =
      error.response?.data?.message || 'Something went wrong. Please try again.';
    return Promise.reject({ message, code: error.response?.data?.code, status: error.response?.status });
  }
);

export default apiClient;
