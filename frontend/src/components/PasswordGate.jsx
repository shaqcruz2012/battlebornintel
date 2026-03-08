import { useState } from 'react';
import styles from './PasswordGate.module.css';

const CORRECT = import.meta.env.VITE_APP_PASSWORD ?? 'battleborn2026';

export function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem('bbi_auth') === CORRECT
  );
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  if (unlocked) return children;

  const submit = (e) => {
    e.preventDefault();
    if (input === CORRECT) {
      sessionStorage.setItem('bbi_auth', CORRECT);
      setUnlocked(true);
    } else {
      setError(true);
      setShake(true);
      setInput('');
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={`${styles.card} ${shake ? styles.shake : ''}`}>
        <div className={styles.logo}>
          <span className={styles.logoAccent}>Battle</span>Born<span className={styles.logoAccent}>Intel</span>
        </div>
        <p className={styles.subtitle}>Nevada Innovation Intelligence Platform</p>
        <form onSubmit={submit} className={styles.form}>
          <input
            type="password"
            value={input}
            onChange={e => { setInput(e.target.value); setError(false); }}
            placeholder="Enter access password"
            autoFocus
            autoComplete="current-password"
            className={`${styles.input} ${error ? styles.inputError : ''}`}
          />
          {error && <p className={styles.errorMsg}>Incorrect password — try again</p>}
          <button type="submit" className={styles.btn}>Enter Platform</button>
        </form>
      </div>
    </div>
  );
}
