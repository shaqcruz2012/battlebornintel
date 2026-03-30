/**
 * Unified loading skeleton for consistent UX across all views.
 * Supports different layout variants.
 */
export function LoadingSkeleton({ variant = 'card', rows = 3, className = '' }) {
  const baseStyle = {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    animation: 'pulse 1.5s ease-in-out infinite',
  };

  if (variant === 'text') {
    return (
      <div className={className} role="status" aria-busy="true" aria-label="Loading content" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} style={{
            ...baseStyle,
            height: 16,
            width: i === rows - 1 ? '60%' : '100%',
          }} />
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={className} role="status" aria-busy="true" aria-label="Loading content" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} style={{ ...baseStyle, height: 40 }} />
        ))}
      </div>
    );
  }

  // Default: card
  return (
    <div className={className} role="status" aria-busy="true" aria-label="Loading content" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} style={{ ...baseStyle, height: 80, padding: 16 }} />
      ))}
    </div>
  );
}

// Inline keyframes (avoids needing a CSS file)
if (typeof document !== 'undefined' && !document.getElementById('bbi-skeleton-styles')) {
  const style = document.createElement('style');
  style.id = 'bbi-skeleton-styles';
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `;
  document.head.appendChild(style);
}

export default LoadingSkeleton;
