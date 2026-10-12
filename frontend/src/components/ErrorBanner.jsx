import { AlertTriangle, X } from 'lucide-react';
import styles from './ErrorBanner.module.css';

export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className={styles.wrap}>
      <AlertTriangle size={16} />
      <span className={styles.text}>{message}</span>
      {onDismiss && (
        <button className={styles.closeBtn} onClick={onDismiss} aria-label="Dismiss">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
