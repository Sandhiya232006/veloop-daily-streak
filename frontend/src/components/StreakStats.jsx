import { CalendarDays, CheckCircle2, Star, Flame } from 'lucide-react';
import styles from './StreakStats.module.css';

export default function StreakStats({ currentStreak, totalRewards, checkedIn, nextReward }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.streakBadge}>
        <Flame size={16} className={styles.flameIcon} />
        <span>{currentStreak} Day Streak</span>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <CalendarDays size={16} className={styles.iconPurple} />
          <div>
            <div className={styles.statLabel}>Total Rewards</div>
            <div className={styles.statValue}>{totalRewards}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <CheckCircle2 size={16} className={styles.iconGreen} />
          <div>
            <div className={styles.statLabel}>Checked In</div>
            <div className={styles.statValue}>{checkedIn}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <Star size={16} className={styles.iconGold} />
          <div>
            <div className={styles.statLabel}>Next Reward</div>
            <div className={styles.statValueGold}>
              {nextReward ? `+${nextReward.amount} ${nextReward.currency}` : '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
