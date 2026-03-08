import { memo } from 'react';

/**
 * ActivityTypeIcon component
 * Renders SVG icon for activity types
 */
export const ActivityTypeIcon = memo(function ActivityTypeIcon({ icon, color = '#45D7C6', size = 20 }) {
  const iconMap = {
    dollar: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 1v22m4-5h2.5a2.5 2.5 0 0 0 0-5H10m-6 0h2.5a2.5 2.5 0 0 1 0 5H6" />
      </svg>
    ),
    handshake: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 12H5m6 0l3.5 3.5M18 12h-3m3 0l-3.5 3.5m3.5-3.5l1 6H7l1-6" />
        <path d="M7 18h10" />
      </svg>
    ),
    trophy: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9c0-1 1-2 3-2h6c2 0 3 1 3 2M6 9v2c0 2-1 4-3 4h18c-2 0-3-2-3-4V9m0 0l1-5h-2l-1-2h-6l-1 2h-2l1 5" />
        <path d="M12 15v4" />
        <path d="M9 19h6" />
      </svg>
    ),
    trending: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 17" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    users: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    government: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    rocket: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
      </svg>
    ),
    patent: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 15h6" />
        <path d="M9 11h6" />
      </svg>
    ),
    circle: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  };

  const svg = iconMap[icon] || iconMap.circle;

  return (
    <div
      style={{
        width: size,
        height: size,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {svg}
    </div>
  );
});
