import { ChevronLeft, Gem, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './StreakHeader.module.css';

export default function StreakHeader({ currentStreak = 0, gemBalance = 0 }) {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Go back">
        <ChevronLeft size={20} />
      </button>

      <div className={styles.titleWrap}>
        <span className={styles.title}>Daily Streak</span>
        <Flame size={18} className={styles.flame} />
      </div>

      <div className={styles.gemBadge}>
        <Gem size={16} className={styles.gemIcon} />
        <span>{gemBalance}</span>
      </div>
    </header>
  );
}
