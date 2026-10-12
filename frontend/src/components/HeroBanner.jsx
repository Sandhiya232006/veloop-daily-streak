import { CalendarCheck } from 'lucide-react';
import styles from './HeroBanner.module.css';

export default function HeroBanner() {
  return (
    <div className={styles.hero}>
      <div className={styles.iconWrap}>
        <CalendarCheck size={40} />
      </div>
      <div>
        <h2 className={styles.heading}>
          Login Daily &amp; Earn <span className={styles.highlight}>Bigger Rewards!</span>
        </h2>
        <p className={styles.subtext}>
          Maintain your streak and unlock <span className={styles.link}>exciting rewards</span> every day.
        </p>
      </div>
    </div>
  );
}
