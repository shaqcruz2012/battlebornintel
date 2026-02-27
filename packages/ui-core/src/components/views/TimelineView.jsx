import { useState, useMemo } from 'react';
import { CARD, BORDER, TEXT, MUTED, GREEN, BLUE, GOLD, ORANGE, PURPLE, RED } from '../../styles/tokens.js';
import { getStageLabel } from '../../engine/formatters.js';

const TYPE_META = {
  funding:      { label: 'Funding',      color: GREEN,   icon: '💰' },
  grant:        { label: 'Grant',        color: BLUE,    icon: '🏛️' },
  partnership:  { label: 'Partnership',  color: GOLD,    icon: '🤝' },
  hiring:       { label: 'Hiring',       color: ORANGE,  icon: '👥' },
  launch:       { label: 'Launch',       color: '#22D3EE', icon: '🚀' },
  momentum:     { label: 'Momentum',     color: GOLD,    icon: '📈' },
  patent:       { label: 'Patent',       color: PURPLE,  icon: '📜' },
  award:        { label: 'Award',        color: GOLD,    icon: '🏆' },
  // ESINT types
  filing:       { label: 'Filing',       color: BLUE,    icon: '📋' },
  approval:     { label: 'Approval',     color: GREEN,   icon: '✅' },
  construction: { label: 'Construction', color: ORANGE,  icon: '🏗' },
  operational:  { label: 'Operational',  color: GREEN,   icon: '⚡' },
  rfp:          { label: 'RFP',          color: '#06B6D4', icon: '📢' },
  docket:       { label: 'Docket',       color: PURPLE,  icon: '⚖' },
  blm:          { label: 'BLM/Federal',  color: '#D4864A', icon: '🏜' },
};

function getMonthYear(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getRelativeDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const days = Math.round((now - d) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.round(days / 7)} weeks ago`;
  if (days < 365) return `${Math.round(days / 30)} months ago`;
  return `${Math.round(days / 365)}yr ago`;
}

export default function TimelineView({ viewProps }) {
  const { config, data, isMobile, setSelectedCompany, allScored } = viewProps;
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const L = config?.labels || {};

  const TIMELINE_EVENTS = data.timeline || [];
  const sl = getStageLabel(config);

  // Get unique types from the data
  const eventTypes = useMemo(() => {
    const types = [...new Set(TIMELINE_EVENTS.map(e => e.type))];
    return types.sort();
  }, [TIMELINE_EVENTS]);

  // Filter and group events
  const grouped = useMemo(() => {
    let events = TIMELINE_EVENTS;
    if (filterType !== 'all') events = events.filter(e => e.type === filterType);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      events = events.filter(e =>
        e.company.toLowerCase().includes(q) ||
        e.detail.toLowerCase().includes(q)
      );
    }
    // Sort by date descending
    events = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));
    // Group by month
    const groups = {};
    events.forEach(e => {
      const key = getMonthYear(e.date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return groups;
  }, [TIMELINE_EVENTS, filterType, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    const counts = {};
    TIMELINE_EVENTS.forEach(e => {
      counts[e.type] = (counts[e.type] || 0) + 1;
    });
    return counts;
  }, [TIMELINE_EVENTS]);

  const handleCompanyClick = (companyName) => {
    if (!allScored) return;
    const match = allScored.find(c =>
      c.name.toLowerCase() === companyName.toLowerCase() ||
      c.name.toLowerCase().includes(companyName.toLowerCase())
    );
    if (match) setSelectedCompany(match);
  };

  const groupKeys = Object.keys(grouped);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: TEXT }}>
            {L.entitySingular ? `${L.entitySingular} Activity` : 'Ecosystem Activity'}
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
            {TIMELINE_EVENTS.length} events tracked
          </div>
        </div>
      </div>

      {/* Type Filter Chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        <button
          onClick={() => setFilterType('all')}
          style={{
            background: filterType === 'all' ? `${GOLD}25` : 'transparent',
            border: `1px solid ${filterType === 'all' ? GOLD : BORDER}`,
            color: filterType === 'all' ? GOLD : MUTED,
            borderRadius: 16, padding: '4px 12px', fontSize: 10, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          All ({TIMELINE_EVENTS.length})
        </button>
        {eventTypes.map(t => {
          const meta = TYPE_META[t] || { label: t, color: MUTED };
          return (
            <button
              key={t}
              onClick={() => setFilterType(filterType === t ? 'all' : t)}
              style={{
                background: filterType === t ? `${meta.color}25` : 'transparent',
                border: `1px solid ${filterType === t ? meta.color : BORDER}`,
                color: filterType === t ? meta.color : MUTED,
                borderRadius: 16, padding: '4px 12px', fontSize: 10, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {meta.label} ({stats[t] || 0})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder={`Search ${L.entityPlural?.toLowerCase() || 'companies'}, events...`}
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{
          width: '100%', maxWidth: 360, padding: '6px 12px', fontSize: 11,
          background: CARD, border: `1px solid ${BORDER}`, borderRadius: 6,
          color: TEXT, marginBottom: 20, fontFamily: 'inherit',
          outline: 'none',
        }}
      />

      {/* Timeline */}
      {groupKeys.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: MUTED }}>
          No events match your filters
        </div>
      )}

      {groupKeys.map(month => (
        <div key={month} style={{ marginBottom: 24 }}>
          {/* Month header */}
          <div style={{
            fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: 1,
            textTransform: 'uppercase', marginBottom: 10,
            paddingBottom: 4, borderBottom: `1px solid ${BORDER}`,
          }}>
            {month}
          </div>

          <div style={{
            borderLeft: `2px solid ${BORDER}`,
            marginLeft: isMobile ? 10 : 20,
            paddingLeft: isMobile ? 16 : 24,
          }}>
            {grouped[month].map((ev, i) => {
              const meta = TYPE_META[ev.type] || { label: ev.type, color: MUTED, icon: '•' };
              return (
                <div key={`${ev.date}-${i}`} style={{
                  position: 'relative', marginBottom: 14, paddingBottom: 4,
                  animation: 'fadeIn 0.3s ease-out',
                }}>
                  {/* Timeline dot */}
                  <div style={{
                    position: 'absolute',
                    left: isMobile ? -25 : -33,
                    top: 4, width: 16, height: 16,
                    borderRadius: '50%',
                    background: CARD,
                    border: `2px solid ${meta.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9,
                  }}>
                    {ev.icon || meta.icon}
                  </div>

                  {/* Event card */}
                  <div style={{
                    background: CARD, border: `1px solid ${BORDER}`,
                    borderRadius: 8, padding: '10px 14px',
                    borderLeft: `3px solid ${meta.color}`,
                    transition: 'border-color 0.2s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          onClick={() => handleCompanyClick(ev.company)}
                          style={{
                            fontSize: 13, fontWeight: 600, color: TEXT,
                            cursor: 'pointer',
                          }}
                        >
                          {ev.company}
                        </span>
                        <span style={{
                          fontSize: 8, fontWeight: 700, color: meta.color,
                          background: `${meta.color}15`, padding: '1px 6px',
                          borderRadius: 3, letterSpacing: 0.5,
                          textTransform: 'uppercase',
                        }}>
                          {meta.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, color: MUTED }}>{ev.date}</span>
                        <span style={{ fontSize: 9, color: MUTED + '80' }}>{getRelativeDate(ev.date)}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: TEXT, lineHeight: 1.5 }}>{ev.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
