const VARIANTS = {
  success: {
    bg: 'rgba(69, 215, 198, 0.12)',
    color: 'var(--status-success)',
    border: 'rgba(69, 215, 198, 0.3)',
  },
  warning: {
    bg: 'rgba(245, 199, 108, 0.12)',
    color: 'var(--status-warning)',
    border: 'rgba(245, 199, 108, 0.3)',
  },
  risk: {
    bg: 'rgba(248, 97, 90, 0.12)',
    color: 'var(--status-risk)',
    border: 'rgba(248, 97, 90, 0.3)',
  },
  neutral: {
    bg: 'rgba(155, 161, 179, 0.08)',
    color: 'var(--text-secondary)',
    border: 'rgba(155, 161, 179, 0.2)',
  },
};

export function StatusBadge({ variant = 'neutral', children }) {
  const v = VARIANTS[variant] || VARIANTS.neutral;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 10px',
        borderRadius: '12px',
        fontSize: 'var(--text-caption-sm)',
        fontWeight: 'var(--weight-medium)',
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}
