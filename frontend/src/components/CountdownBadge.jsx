import { Clock } from 'lucide-react';
import { useServerCountdown } from '../hooks/useServerCountdown';
import styles from './CountdownBadge.module.css';

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function CountdownBadge({ nextClaimAt, serverTime, onComplete }) {
  const { hours, minutes, seconds } = useServerCountdown({ nextClaimAt, serverTime, onComplete });

  return (
    <div className={styles.badge}>
      <Clock size={13} />
      <span>
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </span>
    </div>
  );
}
