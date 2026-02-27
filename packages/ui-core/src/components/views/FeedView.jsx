import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { CARD, BORDER, TEXT, MUTED, GOLD, GREEN, RED, ORANGE, BLUE, PURPLE, DARK } from '../../styles/tokens.js';

const SOURCE_CONFIG = {
  hn: { name: 'Hacker News', color: '#FF6600', icon: 'Y', bg: '#FF660020' },
  yc: { name: 'Y Combinator', color: '#F26522', icon: 'YC', bg: '#F2652220' },
  carta: { name: 'Carta', color: '#00B67A', icon: 'C', bg: '#00B67A20' },
  crunchbase: { name: 'Crunchbase', color: '#0288D1', icon: 'CB', bg: '#0288D120' },
  techcrunch: { name: 'TechCrunch', color: '#0A9E01', icon: 'TC', bg: '#0A9E0120' },
  pitchbook: { name: 'PitchBook', color: '#003B5C', icon: 'PB', bg: '#003B5C20' },
};

const CATEGORIES = ['All', 'Funding', 'Exits', 'Policy', 'Hiring', 'Product', 'Analysis'];

/**
 * Generate Nevada-relevant feed items from ecosystem data.
 * In production, this would be an API call to aggregated RSS/webhook feeds.
 */
function generateFeedItems(data, config) {
  const items = [];
  const hasEnterprise = (data.dockets || []).length > 0;

  // From timeline events
  (data.timeline || []).forEach((e, i) => {
    const source = e.type === 'funding' ? 'crunchbase' : e.type === 'partnership' ? 'techcrunch' : e.type === 'grant' ? 'pitchbook' : 'hn';
    const category = e.type === 'funding' ? 'Funding' : e.type === 'hiring' ? 'Hiring' : e.type === 'launch' ? 'Product' : e.type === 'partnership' ? 'Product' : e.type === 'grant' ? 'Policy' : 'Analysis';
    items.push({
      id: `tl_${i}`,
      title: `${e.company}: ${e.detail}`,
      source,
      category,
      date: e.date,
      relevance: 95,
      icon: e.icon,
      matched: e.company,
    });
  });

  // Simulated external feed items
  const syntheticItems = [
    { title: "Nevada ranks #3 in US for clean energy job growth in 2025", source: 'hn', category: 'Analysis', date: '2025-02-25', relevance: 88 },
    { title: "Y Combinator W25 batch includes 2 Nevada-based startups", source: 'yc', category: 'Funding', date: '2025-02-20', relevance: 92 },
    { title: "Carta: Nevada startup equity transactions up 40% YoY", source: 'carta', category: 'Analysis', date: '2025-02-18', relevance: 90 },
    { title: "Ask HN: Anyone building in Reno/Vegas tech scene?", source: 'hn', category: 'Analysis', date: '2025-02-15', relevance: 75 },
    { title: "GOED approves $2.1M in new tech company tax abatements", source: 'pitchbook', category: 'Policy', date: '2025-02-12', relevance: 85 },
    { title: "Carta 409A valuations: Nevada companies average 3.2x revenue multiple", source: 'carta', category: 'Analysis', date: '2025-02-10', relevance: 82 },
    { title: "PitchBook: Las Vegas VC deal count reaches record in Q4 2024", source: 'pitchbook', category: 'Funding', date: '2025-02-08', relevance: 88 },
    { title: "Show HN: Open-source battery management system (Reno startup)", source: 'hn', category: 'Product', date: '2025-02-05', relevance: 70 },
    { title: "Nevada Legislature considers new R&D tax credit for AI companies", source: 'techcrunch', category: 'Policy', date: '2025-02-03', relevance: 85 },
    { title: "YC Demo Day: Nevada AI startup raises $3M at $30M valuation", source: 'yc', category: 'Funding', date: '2025-01-30', relevance: 90 },
    { title: "Crunchbase: Top 10 fastest-growing Nevada startups by headcount", source: 'crunchbase', category: 'Hiring', date: '2025-01-28', relevance: 87 },
    { title: "Carta equity report: Nevada employee stock option exercises +25%", source: 'carta', category: 'Exits', date: '2025-01-25', relevance: 80 },
    { title: "Nevada Innovation Zone Act: What founders need to know", source: 'hn', category: 'Policy', date: '2025-01-20', relevance: 78 },
    { title: "Reno-Tahoe named top emerging tech hub by Forbes", source: 'techcrunch', category: 'Analysis', date: '2025-01-18', relevance: 85 },
    { title: "Carta cap table report: Nevada median valuation at Series A hits $32M", source: 'carta', category: 'Analysis', date: '2025-01-15', relevance: 83 },
    { title: "Nevada semiconductor tax incentive draws 4 new chip firms", source: 'pitchbook', category: 'Policy', date: '2025-01-12', relevance: 86 },
    { title: "Show HN: Building autonomous mining inspection drones in NV", source: 'hn', category: 'Product', date: '2025-01-10', relevance: 72 },
    { title: "YC Request: Nevada-based defense and aerospace startups for S25", source: 'yc', category: 'Funding', date: '2025-01-08', relevance: 80 },
    { title: "PitchBook Q4: Nevada attracts $890M in VC investment", source: 'pitchbook', category: 'Funding', date: '2025-01-05', relevance: 92 },
    { title: "Crunchbase: 12 Nevada exits in 2024 — total $3.2B value", source: 'crunchbase', category: 'Exits', date: '2025-01-03', relevance: 89 },
    { title: "Nevada Water Authority announces $10M water-tech innovation fund", source: 'pitchbook', category: 'Funding', date: '2024-12-28', relevance: 84 },
    { title: "Ask HN: Best accelerators for hardware startups in the Southwest?", source: 'hn', category: 'Analysis', date: '2024-12-22', relevance: 65 },
    { title: "Carta year-end: Nevada startup formation up 18% in 2024", source: 'carta', category: 'Analysis', date: '2024-12-20', relevance: 88 },
    { title: "TechCrunch: The Nevada startup quietly building battery recycling at scale", source: 'techcrunch', category: 'Product', date: '2024-12-18', relevance: 91 },
    { title: "YC Startup School: Watch the Nevada founders panel discussion", source: 'yc', category: 'Analysis', date: '2024-12-15', relevance: 73 },
    { title: "PitchBook: Solar+storage PPA pricing trends in the West — Nevada leads", source: 'pitchbook', category: 'Analysis', date: '2024-12-12', relevance: 86 },
    { title: "Nevada gaming tech companies see 35% revenue growth", source: 'crunchbase', category: 'Analysis', date: '2024-12-10', relevance: 82 },
    { title: "Carta: Nevada QSBS election rates highest in Mountain West", source: 'carta', category: 'Policy', date: '2024-12-05', relevance: 77 },
  ];

  if (hasEnterprise) {
    syntheticItems.push(
      { title: "PUCN approves new interconnection queue management reforms", source: 'pitchbook', category: 'Policy', date: '2025-02-22', relevance: 92 },
      { title: "BLM fast-tracks 3 Nevada solar projects under new IRA provisions", source: 'techcrunch', category: 'Policy', date: '2025-02-17', relevance: 90 },
      { title: "Nevada utility-scale solar LCOE drops below $25/MWh — national record", source: 'hn', category: 'Analysis', date: '2025-02-13', relevance: 88 },
      { title: "NV Energy RFP attracts 8GW of bids — 4x oversubscribed", source: 'crunchbase', category: 'Funding', date: '2025-02-07', relevance: 95 },
      { title: "DOE announces $500M for western grid resilience — Nevada eligible", source: 'pitchbook', category: 'Policy', date: '2025-01-22', relevance: 93 },
      { title: "FERC order on interconnection reform impacts Nevada queue", source: 'techcrunch', category: 'Policy', date: '2025-01-15', relevance: 87 },
      { title: "Geothermal breakthrough: Nevada pilot hits 400\u00B0C at 3km depth", source: 'hn', category: 'Product', date: '2025-01-09', relevance: 91 },
      { title: "Data center demand drives 2GW of new Nevada energy projects", source: 'crunchbase', category: 'Analysis', date: '2024-12-28', relevance: 89 },
    );
  }

  syntheticItems.forEach((s, i) => {
    items.push({ id: `syn_${i}`, ...s, matched: null });
  });

  return items.sort((a, b) => b.date.localeCompare(a.date));
}

function SourceBadge({ source }) {
  const cfg = SOURCE_CONFIG[source] || { name: source, color: MUTED, icon: '?', bg: `${MUTED}20` };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 9, fontWeight: 700, color: cfg.color,
      background: cfg.bg, padding: '2px 6px', borderRadius: 3,
      letterSpacing: 0.5,
    }}>
      <span style={{ fontWeight: 900 }}>{cfg.icon}</span> {cfg.name}
    </span>
  );
}

function RelevanceDot({ score }) {
  const color = score >= 90 ? GREEN : score >= 75 ? GOLD : score >= 60 ? ORANGE : MUTED;
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {score}%
    </span>
  );
}

function getRelativeDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const days = Math.round((now - d) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}yr ago`;
}

function FeedCard({ item, style }) {
  const relDate = getRelativeDate(item.date);
  return (
    <div style={{
      background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8,
      padding: '12px 16px', cursor: 'default',
      borderLeft: `3px solid ${(SOURCE_CONFIG[item.source] || {}).color || MUTED}`,
      transition: 'transform 0.15s, border-color 0.15s',
      ...style,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.5, fontWeight: 500 }}>
            {item.icon && <span style={{ marginRight: 6 }}>{item.icon}</span>}
            {item.title}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
            <SourceBadge source={item.source} />
            <span style={{ fontSize: 10, color: MUTED }}>{relDate}</span>
            <span style={{ fontSize: 9, color: MUTED + '80' }}>{item.date}</span>
            {item.matched && (
              <span style={{ fontSize: 10, color: GOLD, fontWeight: 600 }}>
                {item.matched}
              </span>
            )}
            <span style={{
              fontSize: 8, fontWeight: 700, color: MUTED,
              background: `${MUTED}15`, padding: '1px 5px', borderRadius: 3,
              textTransform: 'uppercase', letterSpacing: 0.5,
            }}>
              {item.category}
            </span>
          </div>
        </div>
        <RelevanceDot score={item.relevance} />
      </div>
    </div>
  );
}

const ITEMS_PER_PAGE = 15;

export default function FeedView({ viewProps }) {
  const { config, data, isMobile } = viewProps;
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSources, setActiveSources] = useState(Object.keys(SOURCE_CONFIG));
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const sentinelRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const allItems = useMemo(() => generateFeedItems(data, config), [data, config]);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      if (activeCategory !== 'All' && item.category !== activeCategory) return false;
      if (!activeSources.includes(item.source)) return false;
      return true;
    });
  }, [allItems, activeCategory, activeSources]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [activeCategory, activeSources]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredItems.length) {
          setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredItems.length));
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, filteredItems.length]);

  const categoryCounts = useMemo(() => {
    const counts = { All: allItems.length };
    allItems.forEach(item => { counts[item.category] = (counts[item.category] || 0) + 1; });
    return counts;
  }, [allItems]);

  const toggleSource = (s) => {
    setActiveSources(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  return (
    <div ref={scrollContainerRef} style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: TEXT }}>Nevada Feed</div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
            {filteredItems.length} items from {activeSources.length} sources
          </div>
        </div>
      </div>

      {/* Source toggles — compact row */}
      <div style={{
        display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12,
        padding: '8px 12px', background: CARD, border: `1px solid ${BORDER}`,
        borderRadius: 8,
      }}>
        {Object.entries(SOURCE_CONFIG).map(([key, cfg]) => (
          <div
            key={key}
            onClick={() => toggleSource(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 8px', borderRadius: 4, cursor: 'pointer',
              background: activeSources.includes(key) ? cfg.bg : 'transparent',
              border: `1px solid ${activeSources.includes(key) ? cfg.color + '50' : BORDER}`,
              opacity: activeSources.includes(key) ? 1 : 0.35,
              transition: 'all 0.15s',
              userSelect: 'none',
            }}
          >
            <span style={{ fontWeight: 900, fontSize: 10, color: cfg.color }}>{cfg.icon}</span>
            <span style={{ fontSize: 10, color: activeSources.includes(key) ? cfg.color : MUTED }}>{cfg.name}</span>
          </div>
        ))}
      </div>

      {/* Category filter — horizontal scroll on mobile */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'nowrap',
        overflowX: 'auto', paddingBottom: 4,
        WebkitOverflowScrolling: 'touch',
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              background: activeCategory === cat ? GOLD : 'transparent',
              color: activeCategory === cat ? DARK : MUTED,
              border: `1px solid ${activeCategory === cat ? GOLD : BORDER}`,
              borderRadius: 16, padding: '4px 12px', cursor: 'pointer',
              fontSize: 10, fontWeight: 600, fontFamily: 'inherit',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            {cat} {categoryCounts[cat] ? `(${categoryCounts[cat]})` : ''}
          </button>
        ))}
      </div>

      {/* Continuous scroll feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {visibleItems.map((item, i) => (
          <FeedCard
            key={item.id}
            item={item}
            style={{
              animation: `fadeIn 0.25s ease-out ${Math.min(i * 0.02, 0.3)}s both`,
            }}
          />
        ))}

        {filteredItems.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: MUTED, fontSize: 12 }}>
            No feed items match your current filters. Try enabling more sources or a different category.
          </div>
        )}

        {/* Infinite scroll sentinel */}
        {hasMore && (
          <div ref={sentinelRef} style={{ padding: 20, textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 10, color: MUTED,
            }}>
              <span style={{
                width: 16, height: 16, border: `2px solid ${GOLD}40`,
                borderTop: `2px solid ${GOLD}`, borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                display: 'inline-block',
              }} />
              Loading more...
            </div>
          </div>
        )}

        {!hasMore && filteredItems.length > 0 && (
          <div style={{ padding: 20, textAlign: 'center', color: MUTED, fontSize: 10 }}>
            End of feed · {filteredItems.length} items shown
          </div>
        )}
      </div>

      {/* Integration note */}
      <div style={{
        background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8,
        padding: 12, marginTop: 16, textAlign: 'center',
      }}>
        <div style={{ fontSize: 10, color: MUTED, lineHeight: 1.5 }}>
          Feed data sourced from ecosystem activity and simulated external sources.
          In production, integrates with Carta API, Y Combinator RSS, Hacker News Algolia API, Crunchbase, and PitchBook feeds.
        </div>
      </div>

      {/* Spin animation for loader */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
