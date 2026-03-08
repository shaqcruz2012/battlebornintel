import { Card } from '../shared/Card';
import styles from './StakeholderPanel.module.css';

const METRIC_LABELS = {
  agencies: 'Agencies',
  relationships: 'Relationships',
  programs: 'Programs',
  institutions: 'Institutions',
  knowledgeFundPrograms: 'KF Programs',
  partnerships: 'Partnerships',
  corporations: 'Corporations',
  strategicInvestors: 'Strategic Investors',
  ssbciAllocated: 'SSBCI Allocated',
  ssbciDeployed: 'SSBCI Deployed',
  deploymentRate: 'Deployment %',
  vcFirms: 'VC/PE Firms',
  companies: 'Companies',
  founders: 'Founders',
  totalFunding: 'Total Funding',
  avgMomentum: 'Avg Momentum',
};

function formatMetricValue(key, val) {
  if (key === 'ssbciAllocated' || key === 'ssbciDeployed') return `$${val}M`;
  if (key === 'totalFunding') return `$${val}M`;
  if (key === 'deploymentRate') return `${val}%`;
  return String(val);
}

export function StakeholderPanel({ stakeholder, data }) {
  if (!stakeholder || !data) return null;

  const { entities, relationships, metrics } = data;

  return (
    <div className={styles.panel}>
      <Card>
        <div className={styles.header}>
          <span className={styles.icon} style={{ color: stakeholder.color }}>
            {stakeholder.icon}
          </span>
          <div>
            <h2 className={styles.title}>{stakeholder.label}</h2>
            <p className={styles.desc}>{stakeholder.description}</p>
          </div>
        </div>

        <div className={styles.metricsRow}>
          {Object.entries(metrics).map(([key, val]) => (
            <div key={key} className={styles.metric}>
              <span className={styles.metricValue}>
                {formatMetricValue(key, val)}
              </span>
              <span className={styles.metricLabel}>
                {METRIC_LABELS[key] || key}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.entityList}>
          <div className={styles.entityHeader}>
            <span>Entity</span>
            <span>Type</span>
            <span>Detail</span>
          </div>
          {entities.slice(0, 25).map((e, i) => (
            <div key={e.id || i} className={styles.entityRow}>
              <span className={styles.entityName}>
                {e.name || e.label}
              </span>
              <span className={styles.entityType}>
                {e.etype || e.type || ''}
              </span>
              <span className={styles.entityNote}>
                {e.grade
                  ? `${e.grade} / $${e.funding || 0}M`
                  : e.note
                    ? e.note.length > 60
                      ? e.note.slice(0, 60) + '...'
                      : e.note
                    : ''}
              </span>
            </div>
          ))}
          {entities.length > 25 && (
            <div className={styles.moreCount}>
              +{entities.length - 25} more
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {entities.length} entities &middot; {relationships.length} relationships
        </div>
      </Card>
    </div>
  );
}
