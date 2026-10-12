import { Crown, Gift, Coins, CreditCard } from 'lucide-react';
import styles from './RewardIcon.module.css';

const ICONS = {
  coin: Coins,
  gift: Gift,
  'gift-card': CreditCard,
  crown: Crown,
};

export default function RewardIcon({ assetType = 'coin', size = 'md' }) {
  const Icon = ICONS[assetType] || Coins;
  return (
    <div className={`${styles.iconWrap} ${styles[size]} ${styles[assetType]}`}>
      <Icon className={styles.icon} strokeWidth={1.8} />
    </div>
  );
}
