import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import styles from './LoginModal.module.css';

export function LoginModal({ onClose }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <form
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className={styles.title}>Sign In</h2>
        <p className={styles.subtitle}>Battle Born Intelligence Platform</p>

        {error && <div className={styles.error}>{error}</div>}

        <label className={styles.label}>
          Email
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="analyst@example.com"
            autoFocus
            required
          />
        </label>

        <label className={styles.label}>
          Password
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </label>

        <button
          className={styles.button}
          type="submit"
          disabled={loading || !email || !password}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className={styles.note}>
          First time? Contact an admin for access.
        </p>
      </form>
    </div>
  );
}
