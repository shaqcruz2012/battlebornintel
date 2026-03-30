/**
 * Unified error state component for consistent error UX across all views.
 * Shows an error message with an optional retry button.
 */
export function LoadingError({ message = 'Failed to load data', onRetry }) {
  return (
    <div role="alert" style={{
      padding: 24, textAlign: 'center', color: '#9CA3AF',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    }}>
      <span style={{ fontSize: 14 }}>{message}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} style={{
          padding: '6px 16px', borderRadius: 6,
          backgroundColor: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#E5E7EB', cursor: 'pointer', fontSize: 13,
        }}>
          Try again
        </button>
      )}
    </div>
  );
}

export default LoadingError;
