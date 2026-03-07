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
    <div className={cls} onClick={onClick} style={style}>
      {children}
    </div>
  );
}
