import { useEffect, useRef, useState, useCallback } from 'react';
import { NODE_CFG } from '../../data/constants';
import styles from './GraphSearchDropdown.module.css';

// Node types that belong to each display section
const SECTION_COMPANIES = new Set(['company']);
const SECTION_FUNDS = new Set(['fund', 'accelerator']);

function getSection(type) {
  if (SECTION_COMPANIES.has(type)) return 'companies';
  if (SECTION_FUNDS.has(type)) return 'funds';
  return 'other';
}

// Section sort order: companies first, funds second, others third
const SECTION_ORDER = { companies: 0, funds: 1, other: 2 };

const SECTION_LABELS = {
  companies: 'Companies',
  funds: 'Funds & Accelerators',
  other: 'People & Other',
};

/**
 * Build a highlighted label with the matched portion wrapped in <mark>.
 * Returns an array of React elements/strings.
 */
function buildHighlightedLabel(label, searchTerm) {
  const lowerLabel = label.toLowerCase();
  const lowerTerm = searchTerm.toLowerCase();
  const idx = lowerLabel.indexOf(lowerTerm);

  if (idx === -1) return [label];

  const before = label.slice(0, idx);
  const match = label.slice(idx, idx + searchTerm.length);
  const after = label.slice(idx + searchTerm.length);

  return [
    before,
    <mark key="match" className={styles.matchHighlight}>{match}</mark>,
    after,
  ];
}

/**
 * Filter and sort nodes matching the search term.
 * Sort priority: exact name-start matches first, then contains.
 * Within same priority tier: companies before funds before others.
 */
function filterAndSortNodes(nodes, searchTerm) {
  const lower = searchTerm.toLowerCase();

  const matches = nodes.filter((n) =>
    n.label && n.label.toLowerCase().includes(lower)
  );

  matches.sort((a, b) => {
    const aStartsWith = a.label.toLowerCase().startsWith(lower);
    const bStartsWith = b.label.toLowerCase().startsWith(lower);

    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;

    // Same tier — sort by section order
    const aSec = SECTION_ORDER[getSection(a.type)];
    const bSec = SECTION_ORDER[getSection(b.type)];
    if (aSec !== bSec) return aSec - bSec;

    // Finally alphabetical
    return a.label.localeCompare(b.label);
  });

  return matches.slice(0, 14);
}

/**
 * Group a flat array of filtered nodes into sections.
 * Returns an array of { sectionKey, label, items } objects, only for non-empty sections.
 */
function groupIntoSections(filteredNodes) {
  const buckets = { companies: [], funds: [], other: [] };

  for (const node of filteredNodes) {
    buckets[getSection(node.type)].push(node);
  }

  return Object.entries(buckets)
    .filter(([, items]) => items.length > 0)
    .map(([key, items]) => ({ sectionKey: key, label: SECTION_LABELS[key], items }));
}

/**
 * GraphSearchDropdown — absolutely-positioned search results panel.
 *
 * Props:
 *   nodes        – array of graph node objects { id, label, type, region, funding, stage }
 *   searchTerm   – current non-empty search string
 *   onSelect(id) – called when user selects a result
 *   onClose()    – called on Escape or click-outside
 */
export function GraphSearchDropdown({ nodes, searchTerm, onSelect, onClose }) {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);

  // Build flat list of results for keyboard navigation indexing
  const filteredNodes = filterAndSortNodes(nodes, searchTerm);
  const sections = groupIntoSections(filteredNodes);

  // Flat ordered list of node ids matching display order for keyboard nav
  const flatItems = sections.flatMap((s) => s.items);

  const [activeIndex, setActiveIndex] = useState(0);

  // Reset active index whenever the search term or results change
  useEffect(() => {
    setActiveIndex(0);
  }, [searchTerm]);

  // Scroll active item into view
  useEffect(() => {
    const el = itemRefs.current[activeIndex];
    if (el) {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // Click-outside to dismiss
  useEffect(() => {
    function handleMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onClose]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (flatItems.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % flatItems.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (flatItems[activeIndex]) {
            onSelect(flatItems[activeIndex].id);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        default:
          break;
      }
    },
    [flatItems, activeIndex, onSelect, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (filteredNodes.length === 0) {
    return (
      <div ref={containerRef} className={styles.dropdown}>
        <div className={styles.emptyState}>No results for &ldquo;{searchTerm}&rdquo;</div>
      </div>
    );
  }

  // Track flat index across sections for keyboard highlighting
  let flatIndex = 0;

  return (
    <div ref={containerRef} className={styles.dropdown} role="listbox" aria-label="Search results">
      {sections.map((section) => (
        <div key={section.sectionKey} className={styles.section}>
          <div className={styles.sectionHeader}>{section.label}</div>

          {section.items.map((node) => {
            const currentIndex = flatIndex;
            flatIndex += 1;

            const cfg = NODE_CFG[node.type] || { color: '#6B6A72', label: node.type };
            const isActive = currentIndex === activeIndex;
            const highlightedLabel = buildHighlightedLabel(node.label, searchTerm);

            return (
              <div
                key={node.id}
                ref={(el) => { itemRefs.current[currentIndex] = el; }}
                className={`${styles.resultRow} ${isActive ? styles.resultRowActive : ''}`}
                role="option"
                aria-selected={isActive}
                onMouseEnter={() => setActiveIndex(currentIndex)}
                onMouseDown={(e) => {
                  // Use mousedown instead of click so we fire before the document mousedown
                  e.preventDefault();
                  onSelect(node.id);
                }}
              >
                {/* Colored dot */}
                <span
                  className={styles.typeDot}
                  style={{ backgroundColor: cfg.color }}
                  aria-hidden="true"
                />

                {/* Name with highlighted match */}
                <span className={styles.nodeName}>{highlightedLabel}</span>

                {/* Type badge */}
                <span
                  className={styles.typeBadge}
                  style={{ color: cfg.color, borderColor: `${cfg.color}33` }}
                >
                  {cfg.label}
                </span>

                {/* Region (companies only) */}
                {node.type === 'company' && node.region && (
                  <span className={styles.regionText}>{node.region}</span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
