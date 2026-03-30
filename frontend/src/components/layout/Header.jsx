import { useState } from 'react';
import { useFilters } from '../../hooks/useFilters';
import { useAuth } from '../../hooks/useAuth';
import { FilterChip } from '../shared/FilterChip';
import { LoginModal } from '../auth/LoginModal';
import styles from './Header.module.css';

const REGIONS = [
  { value: 'all', label: 'All Nevada' },
  { value: 'las_vegas', label: 'Las Vegas' },
  { value: 'reno', label: 'Reno-Sparks' },
  { value: 'henderson', label: 'Henderson' },
];

const STAGES = [
  { value: 'all', label: 'All Stages' },
  { value: 'seed', label: 'Seed' },
  { value: 'early', label: 'Early' },
  { value: 'growth', label: 'Growth' },
];

export function Header() {
  const { filters, setRegion, setStage, setSearch } = useFilters();
  const { user, logout, isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.brand}>
          <h1 className={styles.title}>ATLAS</h1>
          <span className={styles.subtitle}>Nevada Innovation Ecosystem</span>
        </div>

        <div className={styles.controls}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search companies..."
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className={styles.divider} />
          {REGIONS.map((r) => (
            <FilterChip
              key={r.value}
              label={r.label}
              active={filters.region === r.value}
              onClick={() => setRegion(r.value)}
            />
          ))}
          <span className={styles.divider} />
          {STAGES.map((s) => (
            <FilterChip
              key={s.value}
              label={s.label}
              active={filters.stage === s.value}
              onClick={() => setStage(s.value)}
            />
          ))}
          <span className={styles.divider} />
          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <button
                className={styles.userButton}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className={styles.avatar}>{user.name?.[0]?.toUpperCase() || '?'}</span>
                <span className={styles.userName}>{user.name}</span>
              </button>
              {showUserMenu && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownName}>{user.name}</span>
                    <span className={styles.dropdownRole}>{user.role}</span>
                  </div>
                  <button className={styles.dropdownItem} onClick={() => { logout(); setShowUserMenu(false); }}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className={styles.signInButton} onClick={() => setShowLogin(true)}>
              Sign In
            </button>
          )}
        </div>
      </header>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
