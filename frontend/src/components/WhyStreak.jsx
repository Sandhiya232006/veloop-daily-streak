import { CalendarCheck2, TrendingUp, Gift, AlarmClockCheck } from 'lucide-react';
import styles from './WhyStreak.module.css';

const BENEFITS = [
  { icon: CalendarCheck2, title: 'Stay Active', text: 'Keep your streak alive & earn more!' },
  { icon: TrendingUp, title: 'Bigger Streak', text: 'More consecutive logins, bigger rewards!' },
  { icon: Gift, title: 'Exclusive Rewards', text: 'Get coins, gift cards & special bonuses!' },
  { icon: AlarmClockCheck, title: "Don't Miss Out", text: 'Come back every day & unlock all rewards!' },
];

export default function WhyStreak() {
  return (
    <div className={styles.wrap}>
      <div className={styles.heading}>
        <span className={styles.star}>✦</span> Why Maintain Your Streak?{' '}
        <span className={styles.star}>✦</span>
      </div>
      <div className={styles.grid}>
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <div key={title} className={styles.item}>
            <div className={styles.iconWrap}>
              <Icon size={20} />
            </div>
            <div className={styles.itemTitle}>{title}</div>
            <div className={styles.itemText}>{text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
