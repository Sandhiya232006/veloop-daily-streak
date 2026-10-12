import { Lock } from 'lucide-react';
import RewardIcon from './RewardIcon';
import styles from './UltimateReward.module.css';

export default function UltimateReward({ reward, unlocked }) {
  if (!reward) return null;

  return (
    <div className={styles.wrap}>
      <RewardIcon assetType="crown" size="lg" />
      <div className={styles.info}>
        <span className={styles.label}>Ultimate Reward</span>
        <span className={styles.amount}>₹{reward.amount}</span>
        <span className={styles.subtitle}>{reward.subtitle}</span>
      </div>
      <div className={styles.unlockWrap}>
        {unlocked ? (
          <span className={styles.unlockedText}>Unlocked!</span>
        ) : (
          <>
            <div className={styles.lockIcon}>
              <Lock size={16} />
            </div>
            <span className={styles.unlockText}>
              Unlock on <b>Day {reward.day}</b>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
