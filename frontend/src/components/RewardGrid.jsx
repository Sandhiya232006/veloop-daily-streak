import RewardCard from './RewardCard';
import styles from './RewardGrid.module.css';

export default function RewardGrid({ rewards, serverTime, onClaim, claimingDay, onCountdownComplete }) {
  return (
    <div className={styles.grid}>
      {rewards.map((card) => (
        <RewardCard
          key={card.day}
          card={card}
          serverTime={serverTime}
          claiming={claimingDay === card.day}
          onClaim={() => onClaim(card.day)}
          onCountdownComplete={onCountdownComplete}
        />
      ))}
    </div>
  );
}
