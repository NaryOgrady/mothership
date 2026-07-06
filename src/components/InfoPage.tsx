import type { PageContent } from '../state/gameState';
import styles from './InfoPage.module.css';

export function InfoPage({ title, body }: PageContent) {
  return (
    <div className={styles.page}>
      <div className={`${styles.title} crt-glow-text`}>{title}</div>
      <div className={styles.body}>{body || '—'}</div>
    </div>
  );
}
