import styles from './Tooltip.module.css';

export function Tooltip({ children, title, text, position = 'above' }) {
  if (!text) return children;

  return (
    <div className={styles.wrapper}>
      {children}
      <div className={`${styles.bubble} ${position === 'below' ? styles.below : ''}`}>
        {title && <span className={styles.title}>{title}</span>}
        {text}
      </div>
    </div>
  );
}
