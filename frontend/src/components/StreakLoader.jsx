import { Flame } from 'lucide-react';
import styles from './StreakLoader.module.css';

export default function StreakLoader() {
  return (
    <div className={styles.wrap}>
      <div className={styles.logoRing}>
        <Flame size={32} className={styles.flame} />
      </div>
      <p className={styles.text}>Loading your streak…</p>
    </div>
  );
}
