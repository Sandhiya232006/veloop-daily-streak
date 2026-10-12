import apiClient from './apiClient';

export async function getStreak() {
  const res = await apiClient.get('/daily-streak/status');
  return res.data;
}

export async function claimStreak() {
  // Intentionally sends no business data (no day/reward/amount).
  // The backend derives everything from the authenticated user's state.
  const res = await apiClient.post('/daily-streak/claim', {});
  return res.data;
}

export async function getHistory() {
  const res = await apiClient.get('/daily-streak/history');
  return res.data;
}

export async function getWallet() {
  const res = await apiClient.get('/daily-streak/wallet');
  return res.data;
}
