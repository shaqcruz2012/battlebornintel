import { useState, useEffect } from 'react';
import { CARD, BORDER, TEXT, MUTED, GOLD, GREEN, DARK } from '../../styles/tokens.js';

const STORAGE_KEY = 'bbi-onboarding';

/**
 * Get onboarding state from localStorage.
 * Tracks which tooltips/guides have been dismissed.
 */
function getState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function setState(key, value) {
  try {
    const state = getState();
    state[key] = value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

/**
 * First-use tooltip that appears once and can be dismissed.
 * Shows contextual help without being noisy.
 */
export function FirstUseHint({ id, text, position = 'bottom', children }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const state = getState();
    if (!state[`hint_${id}`]) {
      // Delay appearance slightly so it doesn't flash on page load
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [id]);

  const dismiss = () => {
    setVisible(false);
    setState(`hint_${id}`, true);
  };

  if (!visible) return children || null;

  const posStyles = {
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 8 },
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8 },
    right: { top: '50%', left: '100%', transform: 'translateY(-50%)', marginLeft: 8 },
    left: { top: '50%', right: '100%', transform: 'translateY(-50%)', marginRight: 8 },
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {children}
      <div style={{
        position: 'absolute', ...posStyles[position],
        zIndex: 1000, width: 260,
        background: '#2a2520', border: `1px solid ${GOLD}`,
        borderRadius: 8, padding: '10px 14px',
        boxShadow: `0 4px 20px rgba(0,0,0,0.4)`,
        animation: 'fadeIn 0.3s ease',
      }}>
        <div style={{ fontSize: 12, color: TEXT, lineHeight: 1.5 }}>{text}</div>
        <div
          onClick={dismiss}
          style={{
            fontSize: 10, color: GOLD, cursor: 'pointer',
            marginTop: 8, fontWeight: 600, textAlign: 'right',
          }}
        >
          Got it ✓
        </div>
      </div>
    </div>
  );
}

/**
 * Scoring explainer "key" — shows how IRS/RPS scores work.
 * Toggleable inline panel, not a modal. Clean, unobtrusive.
 */
export function ScoreExplainer({ config, style }) {
  const [open, setOpen] = useState(false);
  const isRPS = config?.scoring?.engine === 'rps';
  const label = config?.labels?.scoreLabel || (isRPS ? 'RPS' : 'IRS');
  const longLabel = config?.labels?.scoreLong || (isRPS ? 'REGULATORY PROGRESS SCORE' : 'INVESTMENT READINESS SCORE');

  const dimensions = isRPS
    ? [
        { name: 'Momentum', weight: '20%', desc: 'Recent activity signals, pipeline movement, press coverage', color: GREEN },
        { name: 'Funding Velocity', weight: '15%', desc: 'Capital raised relative to stage and sector norms', color: GOLD },
        { name: 'Market Timing', weight: '20%', desc: 'Sector heat score — policy momentum, capital flow, active pipeline', color: '#5088A8' },
        { name: 'Hiring Signal', weight: '10%', desc: 'Headcount growth relative to stage expectations', color: '#D4864A' },
        { name: 'Data Quality', weight: '10%', desc: 'Completeness and recency of tracked data', color: MUTED },
        { name: 'Network', weight: '15%', desc: 'Graph connectivity — partnerships, regulatory relationships, supply chain', color: '#9B59B6' },
        { name: 'Team', weight: '10%', desc: 'Leadership experience, track record, advisory strength', color: '#5DADE2' },
      ]
    : [
        { name: 'Momentum', weight: '20%', desc: 'Recent funding, growth signals, press, product launches', color: GREEN },
        { name: 'Funding Velocity', weight: '20%', desc: 'Capital raised relative to stage benchmarks', color: GOLD },
        { name: 'Market Timing', weight: '15%', desc: 'Sector heat score — investor interest, deal flow, growth trajectory', color: '#5088A8' },
        { name: 'Hiring Signal', weight: '15%', desc: 'Employee growth rate and team composition', color: '#D4864A' },
        { name: 'Data Quality', weight: '5%', desc: 'Completeness of profile data', color: MUTED },
        { name: 'Network', weight: '15%', desc: 'Investor quality, board strength, partnership depth', color: '#9B59B6' },
        { name: 'Team', weight: '10%', desc: 'Founder track record, team experience, advisory board', color: '#5DADE2' },
      ];

  const grades = [
    { grade: 'A+', range: '90-100', desc: 'Exceptional — top-tier investment/regulatory readiness', color: GREEN },
    { grade: 'A', range: '80-89', desc: 'Strong — well-positioned with clear advantages', color: GREEN },
    { grade: 'B+', range: '70-79', desc: 'Good — solid fundamentals with room to improve', color: GOLD },
    { grade: 'B', range: '60-69', desc: 'Moderate — developing but missing some signals', color: GOLD },
    { grade: 'C', range: '40-59', desc: 'Early — significant gaps in data or traction', color: '#D4864A' },
    { grade: 'D', range: '0-39', desc: 'Pre-traction — limited data or early development', color: '#E74C3C' },
  ];

  return (
    <div style={style}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          cursor: 'pointer', fontSize: 10, color: GOLD,
          background: `${GOLD}15`, padding: '3px 8px', borderRadius: 4,
          border: `1px solid ${GOLD}30`,
          transition: 'all 0.15s',
        }}
      >
        <span style={{ fontSize: 12 }}>?</span>
        <span style={{ fontWeight: 600 }}>How {label} Works</span>
        <span style={{ fontSize: 8, marginLeft: 2 }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{
          background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8,
          padding: 16, marginTop: 8, maxWidth: 500,
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, marginBottom: 4 }}>
            {longLabel} ({label})
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginBottom: 12, lineHeight: 1.5 }}>
            {isRPS
              ? 'A 0-100 composite score measuring each project\'s regulatory progress, market positioning, and development momentum. Higher scores indicate closer to construction/operation with fewer regulatory barriers.'
              : 'A 0-100 composite score measuring each company\'s investment readiness based on traction, team, market timing, and network strength. Higher scores indicate stronger fundraising position.'}
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, color: TEXT, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
            Score Dimensions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
            {dimensions.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: TEXT, fontWeight: 600, width: 100 }}>{d.name}</span>
                <span style={{ fontSize: 10, color: d.color, fontWeight: 700, width: 30 }}>{d.weight}</span>
                <span style={{ fontSize: 10, color: MUTED, flex: 1 }}>{d.desc}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, color: TEXT, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
            Grade Scale
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
            {grades.map(g => (
              <div key={g.grade} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: g.color, width: 24 }}>{g.grade}</span>
                <span style={{ fontSize: 9, color: MUTED }}>{g.range}</span>
              </div>
            ))}
          </div>

          <div
            onClick={() => setOpen(false)}
            style={{ fontSize: 10, color: GOLD, cursor: 'pointer', marginTop: 12, textAlign: 'right', fontWeight: 600 }}
          >
            Close ✕
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Feature spotlight — subtle pulse indicator for new features.
 * Shows once, then disappears after interaction.
 */
export function NewBadge({ id }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const state = getState();
    if (!state[`new_${id}`]) setVisible(true);
  }, [id]);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    setState(`new_${id}`, true);
  };

  return (
    <span
      onClick={dismiss}
      style={{
        fontSize: 8, fontWeight: 700, color: DARK,
        background: GREEN, padding: '1px 4px', borderRadius: 3,
        marginLeft: 4, letterSpacing: 0.5, cursor: 'pointer',
        animation: 'pulse 2s ease-in-out infinite',
      }}
    >
      NEW
    </span>
  );
}
