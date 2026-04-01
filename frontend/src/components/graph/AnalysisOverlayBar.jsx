import { memo } from 'react';
import styles from './AnalysisOverlayBar.module.css';

const OVERLAYS = [
  { key: 'communities',    label: 'Clusters',        tooltip: 'Show tightly-connected groups detected in the network' },
  { key: 'capitalFlows',   label: 'Capital Flows',   tooltip: 'Show directed investment paths between funds and companies' },
  { key: 'predictedLinks', label: 'Predicted Links',  tooltip: 'Show likely future connections based on shared contacts and sector overlap' },
  { key: 'bridges',        label: 'Bridges',          tooltip: 'Highlight entities that connect otherwise separate communities' },
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
            onClick={() => onToggle(o.key)}
            type="button"
            aria-pressed={active}
            title={o.tooltip}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
});
