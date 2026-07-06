import styles from './ModeButton.module.css';

interface ModeButtonProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function ModeButton({ label, active, onClick }: ModeButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.button} ${active ? styles.active : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
