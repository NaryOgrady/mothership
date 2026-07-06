interface CornerCrossProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function CornerCross({ size = 14, className, style }: CornerCrossProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      className={className}
      style={style}
      aria-hidden
    >
      <line x1="7" y1="0" x2="7" y2="14" stroke="currentColor" strokeWidth="1" />
      <line x1="0" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
