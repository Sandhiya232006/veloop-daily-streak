import { Lock, Check } from 'lucide-react';
import RewardIcon from './RewardIcon';
import CountdownBadge from './CountdownBadge';
import styles from './RewardCard.module.css';

/**
 * Renders purely from the `card` object the backend returned.
 * No local logic decides claimability, lock state, or reward values —
 * those all come from card.status / card.reward as sent by the API.
 */
export default function RewardCard({ card, serverTime, onClaim, claiming, onCountdownComplete }) {
  const { day, status, reward, isToday, nextClaimAt } = card;
  const isUltimate = reward?.isUltimate;

  const currencyLabel =
    reward?.type === 'GIFT_CARD' ? `₹${reward.amount}` : `+${reward.amount}`;

  return (
    <div
      className={[
        styles.card,
        isUltimate ? styles.ultimate : '',
        status === 'TODAY' || status === 'AVAILABLE' ? styles.today : '',
        status === 'CLAIMED' ? styles.claimed : '',
        status === 'LOCKED' ? styles.locked : '',
      ].join(' ')}
    >
      <div className={styles.topRow}>
        <span className={styles.dayLabel}>Day {day}</span>
        {isToday && status === 'AVAILABLE' && <span className={styles.badgeToday}>Today</span>}
        {isUltimate && <span className={styles.badgeVip}>VIP</span>}
      </div>

      <RewardIcon assetType={reward?.assetType} size={isUltimate ? 'lg' : 'md'} />

      <div className={styles.title}>{reward?.title || 'Daily Reward'}</div>
      <div className={styles.amount}>{currencyLabel}</div>
      <div className={styles.subtitle}>{reward?.subtitle}</div>

      {status === 'CLAIMED' && (
        <div className={styles.claimedPill}>
          <Check size={14} /> Claimed
        </div>
      )}

      {status === 'LOCKED' && !isToday && (
        <div className={styles.lockedPill}>
          <Lock size={14} /> Locked
        </div>
      )}

      {status === 'LOCKED' && isToday && nextClaimAt && (
        <CountdownBadge
          nextClaimAt={nextClaimAt}
          serverTime={serverTime}
          onComplete={onCountdownComplete}
        />
      )}

      {status === 'AVAILABLE' && (
        <button className={styles.claimBtn} onClick={onClaim} disabled={claiming}>
          {claiming ? 'Claiming…' : 'Claim Reward'}
        </button>
      )}
    </div>
  );
}
