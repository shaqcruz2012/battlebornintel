import { memo } from 'react';
import { Tooltip } from '../shared/Tooltip';
import styles from './DataQualityLegend.module.css';

const QUALITY_LEVELS = [
  {
    level: 'verified',
    badge: '✓',
    title: 'Verified Data',
    description:
      'Data from authoritative sources such as SEC filings, regulatory submissions, fund certifications, or official company disclosures. Represents the most reliable information available.',
    color: 'var(--status-success)',
  },
  {
    level: 'inferred',
    badge: '~',
    title: 'Inferred Data',
    description:
      'Data estimated or derived from partial information, industry benchmarks, or trending analysis. May lag actual values or be directional rather than exact. Use for context, not precision decisions.',
    color: '#d97706',
  },
  {
    level: 'calculated',
    badge: '=',
    title: 'Calculated Data',
    description:
      'Data derived from formulas or aggregations of multiple data points. Transparency note: individual components may have different quality levels (e.g., combining verified and inferred values).',
    color: '#3b82f6',
  },
];

const QualityItem = memo(function QualityItem({ level, badge, title, description, color }) {
  const content = (
    <div className={styles.item}>
      <div className={`${styles.badge} ${styles[`badge-${level}`]}`} style={{ borderColor: color }}>
        {badge}
      </div>
      <div className={styles.content}>
        <h4 className={styles.title}>{title}</h4>
        <p className={styles.shortDesc}>{description.split('.')[0]}.</p>
      </div>
    </div>
  );

  return (
    <Tooltip title={title} text={description} position="above">
      {content}
    </Tooltip>
  );
});

export const DataQualityLegend = memo(function DataQualityLegend() {
  return (
    <div className={styles.legend}>
      <div className={styles.header}>
        <h3 className={styles.title}>Data Quality Levels</h3>
        <p className={styles.subtitle}>
          All KPI values are marked with their data quality level. Hover for details.
        </p>
      </div>
      <div className={styles.items}>
        {QUALITY_LEVELS.map((item) => (
          <QualityItem key={item.level} {...item} />
        ))}
      </div>
      <div className={styles.note}>
        <p>
          <strong>Our Commitment to Truth:</strong> We mark all data with its quality level to ensure
          you know what's verified, what's estimated, and what's calculated. This transparency helps
          you make informed decisions based on data you can trust.
        </p>
      </div>
    </div>
  );
});

export default DataQualityLegend;
