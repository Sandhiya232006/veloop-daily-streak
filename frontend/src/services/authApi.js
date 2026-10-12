import apiClient from './apiClient';

export async function register({ name, email, password }) {
  const res = await apiClient.post('/auth/register', { name, email, password });
  return res.data;
}

export async function login({ email, password }) {
  const res = await apiClient.post('/auth/login', { email, password });
  return res.data;
}
