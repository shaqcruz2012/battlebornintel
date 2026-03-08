const VARIANTS = {
  success: {
    bg: 'rgba(52, 201, 168, 0.08)',
    color: 'var(--status-success)',
    border: 'rgba(52, 201, 168, 0.2)',
  },
  warning: {
    bg: 'rgba(229, 182, 84, 0.08)',
    color: 'var(--status-warning)',
    border: 'rgba(229, 182, 84, 0.2)',
  },
  risk: {
    bg: 'rgba(232, 83, 76, 0.08)',
    color: 'var(--status-risk)',
    border: 'rgba(232, 83, 76, 0.2)',
  },
  neutral: {
    bg: 'rgba(139, 146, 165, 0.06)',
    color: 'var(--text-secondary)',
    border: 'rgba(139, 146, 165, 0.12)',
  },
  info: {
    bg: 'rgba(91, 141, 239, 0.08)',
    color: 'var(--accent-blue)',
    border: 'rgba(91, 141, 239, 0.2)',
  },
};

export function StatusBadge({ variant = 'neutral', children }) {
  const v = VARIANTS[variant] || VARIANTS.neutral;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        padding: '2px 8px',
        borderRadius: 'var(--radius-xs)',
        fontSize: 'var(--text-micro)',
        fontFamily: 'var(--font-body)',
        fontWeight: 'var(--weight-semibold)',
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        whiteSpace: 'nowrap',
        lineHeight: '1.4',
      }}
    >
      {children}
    </span>
  );
}
