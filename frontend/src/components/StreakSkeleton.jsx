import styles from './StreakSkeleton.module.css';

export default function StreakSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={`${styles.block} ${styles.circle}`} />
        <div className={`${styles.block} ${styles.title}`} />
        <div className={`${styles.block} ${styles.pill}`} />
      </div>

      <div className={`${styles.block} ${styles.hero}`} />

      <div className={styles.statsRow}>
        <div className={`${styles.block} ${styles.stat}`} />
        <div className={`${styles.block} ${styles.stat}`} />
        <div className={`${styles.block} ${styles.stat}`} />
      </div>

      <div className={`${styles.block} ${styles.ultimate}`} />

      <div className={styles.grid}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={`${styles.block} ${styles.card}`} />
        ))}
      </div>
    </div>
  );
}
