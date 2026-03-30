import styles from './Card.module.css';

export function Card({
  children,
  className = '',
  onClick,
  elevated = false,
  compact = false,
  noPad = false,
  style,
}) {
  const cls = [
    styles.card,
    onClick && styles.clickable,
    elevated && styles.elevated,
    compact && styles.compact,
    noPad && styles.noPad,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cls}
      onClick={onClick}
      style={style}
      {...(onClick ? {
        role: 'button',
        tabIndex: 0,
        onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } },
      } : {})}
    >
      {children}
    </div>
  );
}
