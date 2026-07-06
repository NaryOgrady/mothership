import type { ReactNode } from 'react';
import styles from './Panel.module.css';

interface PanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Panel({ title, children, className, style }: PanelProps) {
  return (
    <div className={`${styles.panel} ${className ?? ''}`} style={style}>
      {title && <span className={`${styles.title} crt-glow-text`}>{title}</span>}
      {children}
    </div>
  );
}
