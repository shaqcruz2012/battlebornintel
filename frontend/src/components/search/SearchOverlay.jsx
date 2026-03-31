import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useSearchIndex } from './useSearchIndex.js';
import styles from './SearchOverlay.module.css';

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconBuilding() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 15V10h4v5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 7h1M10 7h1M5 10h1M10 10h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 4V2a2 2 0 0 1 4 0v2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconFund() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 5v6M6 7h4M6 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconPerson() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconOrg() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5" y="1" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1" y="11" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10" y="11" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 5v3M4 8h8M4 8v3M12 8v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const CATEGORY_META = {
  companies:     { label: 'Companies',     Icon: IconBuilding, accent: 'teal' },
  funds:         { label: 'Funds',         Icon: IconFund,     accent: 'gold' },
  people:        { label: 'People',        Icon: IconPerson,   accent: 'blue' },
  organizations: { label: 'Organizations', Icon: IconOrg,      accent: 'purple' },
};

const CATEGORY_ORDER = ['companies', 'funds', 'people', 'organizations'];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Flatten grouped results into a single ordered array for keyboard nav.
 */
function flattenResults(grouped) {
  return CATEGORY_ORDER.flatMap((cat) => grouped[cat] ?? []);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ResultItem({ result, isActive, onSelect, onHover }) {
  const { Icon, accent } = CATEGORY_META[result.category] ?? CATEGORY_META.companies;
  const ref = useRef(null);

  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ block: 'nearest' });
    }
  }, [isActive]);

  return (
    <button
      ref={ref}
      type="button"
      className={`${styles.resultItem} ${isActive ? styles.resultItemActive : ''} ${styles[`accent_${accent}`] ?? ''}`}
      onMouseEnter={onHover}
      onClick={onSelect}
      tabIndex={-1}
      aria-selected={isActive}
    >
      <span className={`${styles.iconWrap} ${styles[`iconWrap_${accent}`]}`}>
        <Icon />
      </span>
      <span className={styles.resultText}>
        <span className={styles.resultName}>{result.name}</span>
        {result.subtitle && (
          <span className={styles.resultSubtitle}>{result.subtitle}</span>
        )}
      </span>
      {isActive && (
        <kbd className={styles.enterHint}>
          <span>&#9166;</span>
        </kbd>
      )}
    </button>
  );
}

function CategorySection({ category, results, activeIndex, globalOffset, onSelect, onHover }) {
  const { label } = CATEGORY_META[category];
  if (!results.length) return null;

  return (
    <section className={styles.categorySection}>
      <div className={styles.categoryHeader}>
        <span className={styles.categoryLabel}>{label}</span>
        <span className={styles.categoryCount}>{results.length}</span>
      </div>
      {results.map((result, localIdx) => {
        const globalIdx = globalOffset + localIdx;
        return (
          <ResultItem
            key={result.id}
            result={result}
            isActive={activeIndex === globalIdx}
            onSelect={() => onSelect(result)}
            onHover={() => onHover(globalIdx)}
          />
        );
      })}
    </section>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

/**
 * Global spotlight search overlay.
 *
 * Props:
 *   isOpen        {boolean}    - controlled open state
 *   onClose       {function}   - called when overlay should close
 *   onViewChange  {function}   - called with (viewId, result) when user selects a result
 */
export function SearchOverlay({ isOpen, onClose, onViewChange }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const debouncedSearch = useRef(null);
  const { search } = useSearchIndex();

  // Debounce actual search execution — display query updates immediately
  const handleQueryChange = useCallback((val) => {
    setQuery(val);
    clearTimeout(debouncedSearch.current);
    debouncedSearch.current = setTimeout(() => {
      setDebouncedQuery(val);
    }, 200);
  }, []);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => clearTimeout(debouncedSearch.current);
  }, []);

  // Compute results from the debounced query
  const grouped = useMemo(() => {
    if (!debouncedQuery.trim()) return { companies: [], funds: [], people: [], organizations: [] };
    return search(debouncedQuery);
  }, [debouncedQuery, search]);

  const flat = useMemo(() => flattenResults(grouped), [grouped]);
  const totalResults = flat.length;

  // Reset state when overlay opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setDebouncedQuery('');
      setActiveIndex(0);
      // Small timeout to allow the animation to start before focusing
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Keep active index in bounds
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleSelect = useCallback(
    (result) => {
      onViewChange(result.view, result);
      onClose();
    },
    [onViewChange, onClose]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % Math.max(totalResults, 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + Math.max(totalResults, 1)) % Math.max(totalResults, 1));
        return;
      }
      if (e.key === 'Enter' && totalResults > 0) {
        e.preventDefault();
        handleSelect(flat[activeIndex]);
      }
    },
    [totalResults, activeIndex, flat, handleSelect, onClose]
  );

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!isOpen) return null;

  // Build offset map: how many results precede each category in the flat list
  const offsets = {};
  let cursor = 0;
  for (const cat of CATEGORY_ORDER) {
    offsets[cat] = cursor;
    cursor += (grouped[cat] ?? []).length;
  }

  const isEmpty = totalResults === 0;
  const isTyping = query.trim().length > 0;

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Global search"
    >
      <div className={styles.panel}>
        {/* Search input row */}
        <div className={styles.inputRow}>
          <span className={styles.searchIcon} aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Search companies, investors, people..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck="false"
            aria-label="Search"
            aria-autocomplete="list"
            aria-expanded={!isEmpty}
          />
          <kbd className={styles.escHint} onClick={onClose} title="Close">
            esc
          </kbd>
        </div>

        {/* Results area */}
        <div
          className={styles.results}
          role="listbox"
          aria-label="Search results"
        >
          {!isTyping && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>_</span>
              <span>Type to search companies, investors, people...</span>
              <span className={styles.emptyHint}>
                <kbd>&#8593;</kbd><kbd>&#8595;</kbd> navigate
                &nbsp;&nbsp;
                <kbd>&#9166;</kbd> select
                &nbsp;&nbsp;
                <kbd>esc</kbd> close
              </span>
            </div>
          )}

          {isTyping && isEmpty && (
            <div className={styles.emptyState}>
              <span className={styles.emptyNoResults}>No results for {'\u201C'}{query}{'\u201D'}</span>
              <span className={styles.emptyHint}>Try a different term</span>
            </div>
          )}

          {!isEmpty && CATEGORY_ORDER.map((cat) => (
            <CategorySection
              key={cat}
              category={cat}
              results={grouped[cat] ?? []}
              activeIndex={activeIndex}
              globalOffset={offsets[cat]}
              onSelect={handleSelect}
              onHover={setActiveIndex}
            />
          ))}
        </div>

        {/* Footer */}
        {!isEmpty && (
          <div className={styles.footer}>
            <span>{totalResults} result{totalResults !== 1 ? 's' : ''}</span>
            <span className={styles.footerHints}>
              <kbd>&#8593;</kbd><kbd>&#8595;</kbd>
              <span>navigate</span>
              <kbd>&#9166;</kbd>
              <span>select</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
