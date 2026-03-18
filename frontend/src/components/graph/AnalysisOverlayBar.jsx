import { memo } from 'react';
import styles from './AnalysisOverlayBar.module.css';

const OVERLAYS = [
  { key: 'communities',    label: 'Communities',    color: '#9B72CF' },
  { key: 'capitalFlows',   label: 'Capital Flows',  color: '#C8A55A' },
  { key: 'predictedLinks', label: 'Predicted Links', color: '#26A69A' },
  { key: 'bridges',        label: 'Bridges',        color: '#E85D5D' },
];

export const AnalysisOverlayBar = memo(function AnalysisOverlayBar({ overlays, onToggle }) {
  return (
    <div className={styles.bar}>
      <span className={styles.barLabel}>OVERLAYS</span>
      {OVERLAYS.map((o) => {
        const active = overlays[o.key];
        return (
          <button
            key={o.key}
            className={`${styles.toggle} ${active ? styles.active : ''}`}
            style={{
              '--overlay-color': o.color,
              borderColor: active ? o.color + '80' : undefined,
              color: active ? o.color : undefined,
              background: active ? o.color + '14' : undefined,
            }}
            onClick={() => onToggle(o.key)}
            type="button"
            aria-pressed={active}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
});
