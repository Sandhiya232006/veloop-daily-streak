import { useEffect, useState, useRef } from 'react';

/**
 * Computes a live countdown to `nextClaimAt` using an offset between
 * server time and local time (captured once when data is fetched).
 * This means changing the device clock has NO effect on the countdown —
 * only the backend's `nextClaimAt` and `serverTime` values matter.
 *
 * When the countdown reaches zero, `onComplete` fires ONCE so the caller
 * can re-fetch fresh status from the backend (never assume claim is allowed
 * just because the visual timer hit zero).
 */
export function useServerCountdown({ nextClaimAt, serverTime, onComplete }) {
  const [remainingMs, setRemainingMs] = useState(null);
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;

    if (!nextClaimAt) {
      setRemainingMs(null);
      return undefined;
    }

    const target = new Date(nextClaimAt).getTime();
    const serverNow = serverTime ? new Date(serverTime).getTime() : Date.now();
    const localNowAtFetch = Date.now();
    const offset = serverNow - localNowAtFetch; // server_time - local_time

    function tick() {
      const estimatedServerNow = Date.now() + offset;
      const diff = target - estimatedServerNow;
      setRemainingMs(Math.max(diff, 0));

      if (diff <= 0 && !firedRef.current) {
        firedRef.current = true;
        onComplete?.();
      }
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [nextClaimAt, serverTime, onComplete]);

  if (remainingMs === null) {
    return { hours: 0, minutes: 0, seconds: 0, totalMs: null, isDone: true };
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds, totalMs: remainingMs, isDone: remainingMs <= 0 };
}
