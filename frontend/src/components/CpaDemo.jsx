import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import styles from './CpaDemo.module.css';

/**
 * Polished placeholder for the future CPA/ad integration.
 * IMPORTANT: this component does not grant any reward itself. It is purely
 * a visual holding state while the actual claim request is in flight against
 * the backend. The backend's response is what ultimately determines success.
 */
export default function CpaDemo({ onFinished }) {
  const [step, setStep] = useState(0);

  const steps = ['Preparing your reward…', 'Advertisement / Reward Verification', 'Please wait…'];

  useEffect(() => {
    if (step >= steps.length - 1) {
      const timeout = setTimeout(() => onFinished?.(), 900);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setStep((s) => s + 1), 700);
    return () => clearTimeout(timeout);
  }, [step]);

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.spinner} />
        <ShieldCheck size={28} className={styles.shield} />
        <p className={styles.text}>{steps[step]}</p>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
