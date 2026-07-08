import styles from './InfoPage.module.css';

interface InfoPageProps {
  title: string;
  body: string;
}

export function InfoPage({ title, body }: InfoPageProps) {
  return (
    <div className={styles.page}>
      <div className={`${styles.title} crt-glow-text`}>{title}</div>
      <div className={styles.body}>{body || '—'}</div>
    </div>
  );
}
