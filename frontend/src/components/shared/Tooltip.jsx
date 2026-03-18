import styles from './Tooltip.module.css';

export function Tooltip({ children, title, text, content, position = 'above' }) {
  const displayText = text || content;
  if (!displayText) return children;

  return (
    <div className={styles.wrapper}>
      {children}
      <div className={`${styles.bubble} ${position === 'below' ? styles.below : ''}`}>
        {title && <span className={styles.title}>{title}</span>}
        {displayText}
      </div>
    </div>
  );
}
