import { useState, useCallback, useEffect } from 'react';
import * as streakApi from '../services/streakApi';

export function useStreakData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const result = await streakApi.getStreak();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Unable to load your streak.');
      throw err;
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    refresh().catch(() => {}).finally(() => setLoading(false));
  }, [refresh]);

  return { data, loading, error, refresh };
}
