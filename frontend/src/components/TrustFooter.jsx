import { ShieldCheck, ChevronRight } from 'lucide-react';
import styles from './TrustFooter.module.css';

export default function TrustFooter() {
  return (
    <div className={styles.wrap}>
      <ShieldCheck size={18} className={styles.icon} />
      <span className={styles.text}>
        Official rewards only on <b>VeloopRewards.in</b> · Stay active, stay rewarded!
      </span>
      <ChevronRight size={16} className={styles.chevron} />
    </div>
  );
}
