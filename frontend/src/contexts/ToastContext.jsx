import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div role="alert" aria-live="polite" style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400,
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding: '12px 16px', borderRadius: 8,
          color: '#fff', fontSize: 14, lineHeight: 1.4,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          backgroundColor: t.type === 'error' ? '#DC2626'
            : t.type === 'success' ? '#059669'
            : t.type === 'warning' ? '#D97706'
            : '#1E40AF',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          <span>{t.message}</span>
          <button type="button" aria-label="Dismiss notification" onClick={() => onDismiss(t.id)} style={{
            background: 'none', border: 'none', color: '#fff',
            cursor: 'pointer', marginLeft: 12, fontSize: 16, padding: 0,
          }}>&times;</button>
        </div>
      ))}
    </div>
  );
}
