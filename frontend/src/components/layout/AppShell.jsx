import styles from './AppShell.module.css';

export function AppShell({ children }) {
  return (
    <div className={styles.shell}>
      {children}
    </div>
  );
}

export function MainGrid({ children, className = '' }) {
  return (
    <main className={`${styles.main} ${className}`}>
      {children}
    </main>
  );
}
