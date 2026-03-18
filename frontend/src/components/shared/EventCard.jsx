import { useCallback } from 'react';
import styles from './EventCard.module.css';

// ── Color maps ───────────────────────────────────────────────────────────────

const STAKEHOLDER_TYPE_COLORS = {
  gov: '#5B8DEF',
  gov_policy: '#5B8DEF',
  government: '#5B8DEF',
  university: '#9B72CF',
  corporate: '#F5C76C',
  capital: '#34C9A8',
  risk_capital: '#34C9A8',
  ecosystem: '#45D7C6',
  default: '#45D7C6',
};

const EVENT_TYPE_COLORS = {
  funding: { bg: 'rgba(52, 201, 168, 0.12)', text: '#34C9A8' },
  grant: { bg: 'rgba(91, 141, 239, 0.12)', text: '#5B8DEF' },
  grant_award: { bg: 'rgba(91, 141, 239, 0.12)', text: '#5B8DEF' },
  legislation: { bg: 'rgba(245, 199, 108, 0.12)', text: '#F5C76C' },
  partnership: { bg: 'rgba(155, 114, 207, 0.12)', text: '#9B72CF' },
  milestone: { bg: 'rgba(69, 215, 198, 0.12)', text: '#45D7C6' },
  award: { bg: 'rgba(91, 141, 239, 0.12)', text: '#5B8DEF' },
  expansion: { bg: 'rgba(52, 201, 168, 0.12)', text: '#34C9A8' },
  launch: { bg: 'rgba(69, 215, 198, 0.12)', text: '#45D7C6' },
  hiring: { bg: 'rgba(245, 199, 108, 0.12)', text: '#F5C76C' },
  patent: { bg: 'rgba(245, 199, 108, 0.12)', text: '#F5C76C' },
  default: { bg: 'rgba(139, 146, 165, 0.12)', text: '#8B92A5' },
};

const REGION_BADGE_COLORS = {
  las_vegas: { bg: 'rgba(232, 83, 76, 0.12)', text: '#E8534C' },
  reno: { bg: 'rgba(91, 141, 239, 0.12)', text: '#5B8DEF' },
  henderson: { bg: 'rgba(245, 199, 108, 0.12)', text: '#F5C76C' },
  carson_city: { bg: 'rgba(155, 114, 207, 0.12)', text: '#9B72CF' },
  statewide: { bg: 'rgba(69, 215, 198, 0.12)', text: '#45D7C6' },
  north: { bg: 'rgba(52, 201, 168, 0.12)', text: '#34C9A8' },
  south: { bg: 'rgba(232, 83, 76, 0.10)', text: '#E8534C' },
  default: { bg: 'rgba(139, 146, 165, 0.12)', text: '#8B92A5' },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatFeedDate(dateStr) {
  if (!dateStr) return '';
  const datePart = String(dateStr).split('T')[0];
  const d = new Date(datePart + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).toUpperCase();
}

function getStakeholderBarColor(type) {
  return STAKEHOLDER_TYPE_COLORS[type] || STAKEHOLDER_TYPE_COLORS.default;
}

function getEventTypeBadge(type) {
  const key = (type || '').toLowerCase().replace(/\s+/g, '_');
  return EVENT_TYPE_COLORS[key] || EVENT_TYPE_COLORS.default;
}

function getRegionBadge(location) {
  const key = (location || '').toLowerCase().replace(/\s+/g, '_');
  return REGION_BADGE_COLORS[key] || REGION_BADGE_COLORS.default;
}

// ── DataQualityBadge ─────────────────────────────────────────────────────────

export function DataQualityBadge({ event }) {
  const hasSource = !!event.source_url;
  const isVerified = !!event.verified;
  const confidence = event.confidence;

  let label = 'UNVERIFIED';
  let level = 'low';
  if (isVerified && hasSource) {
    label = 'HIGH CONFIDENCE';
    level = 'high';
  } else if (hasSource || confidence >= 0.7) {
    label = 'SOURCED';
    level = 'medium';
  }

  return (
    <span className={`${styles.dataQualityBadge} ${styles[`dq_${level}`]}`}>
      {label}
    </span>
  );
}

// ── EventCard ────────────────────────────────────────────────────────────────

/**
 * Shared expandable event card used across all event views.
 *
 * @param {Object}   props
 * @param {Object}   props.event       - Event object with: date, type/activity_type,
 *                                        company_name, description, location,
 *                                        stakeholder_type, source_url, source,
 *                                        verified, confidence
 * @param {boolean}  props.isExpanded   - Whether the detail section is visible
 * @param {Function} props.onToggle     - Called with event id when card is clicked
 * @param {boolean}  [props.compact]    - Compact mode for dashboard feeds
 */
export function EventCard({ event, isExpanded, onToggle, compact = false }) {
  // Normalise field names so the card works with both activity-feed and
  // timeline data shapes.
  const activityType = event.activity_type || event.type || '';
  const companyName = event.company_name || event.company || '';
  const description = event.description || event.detail || '';
  const location = event.location || '';
  const stakeholderType = event.stakeholder_type || '';
  const date = event.date || event.event_date || '';
  const id = event.id;

  const barColor = getStakeholderBarColor(stakeholderType);
  const eventBadge = getEventTypeBadge(activityType);
  const regionBadge = getRegionBadge(location);
  const dateLabel = formatFeedDate(date);
  const typeLabel = (event.activity_type_label || activityType || '').toUpperCase();
  const regionLabel = event.location_label || location.toUpperCase();

  const handleCardClick = useCallback(() => {
    if (onToggle) onToggle(id);
  }, [id, onToggle]);

  const cardClass = [
    styles.card,
    isExpanded ? styles.cardExpanded : '',
    compact ? styles.compact : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClass}>
      <div className={styles.cardBar} style={{ backgroundColor: barColor }} />
      <div className={styles.cardBody}>
        <div className={styles.cardClickArea} onClick={handleCardClick} role="button" tabIndex={0}>
          <div className={styles.cardMeta}>
            <div className={styles.cardMetaLeft}>
              <span className={styles.cardLiveIndicator} />
              <time className={styles.cardTimestamp}>{dateLabel}</time>
            </div>
            <div className={styles.cardMetaRight}>
              {regionLabel && (
                <span
                  className={styles.regionBadge}
                  style={{ backgroundColor: regionBadge.bg, color: regionBadge.text }}
                >
                  {regionLabel}
                </span>
              )}
              <span
                className={styles.eventTypeBadge}
                style={{ backgroundColor: eventBadge.bg, color: eventBadge.text }}
              >
                {typeLabel}
              </span>
              <span className={styles.expandChevron}>
                {isExpanded ? '\u25B2' : '\u25BC'}
              </span>
            </div>
          </div>

          <h3 className={styles.cardTitle}>{companyName}</h3>

          <p className={isExpanded ? styles.cardDescriptionFull : styles.cardDescription}>
            {description}
          </p>
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.cardFooterLeft}>
            {event.amount && (
              <span className={styles.cardAmount}>{event.amount}</span>
            )}
            {event.stakeholder_type_label && (
              <span className={styles.cardStakeholder}>{event.stakeholder_type_label}</span>
            )}
            {event.company_count != null && (
              <span className={styles.cardCount}>
                {event.company_count}{' '}
                {event.company_count === 1 ? 'company' : 'companies'}
              </span>
            )}
            {event.verified && (
              <span className={styles.cardVerified} title="Verified source">
                VERIFIED
              </span>
            )}
          </div>
          <div className={styles.cardFooterRight}>
            {event.source_url && (
              <a
                href={event.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.sourceLink}
                title={event.source || 'Source'}
                onClick={(e) => e.stopPropagation()}
              >
                {event.source && !event.source.startsWith('http')
                  ? event.source
                  : 'Source'} &#8599;
              </a>
            )}
            {!event.source_url && event.source && (
              <span className={styles.sourceLabel}>{event.source}</span>
            )}
          </div>
        </div>

        {/* Expandable detail section */}
        {isExpanded && (
          <div className={styles.detailSection}>
            <div className={styles.detailGrid}>
              {event.stakeholder_type_label && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>STAKEHOLDER TYPE</span>
                  <span className={styles.detailValue}>{event.stakeholder_type_label}</span>
                </div>
              )}
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>DATA QUALITY</span>
                <DataQualityBadge event={event} />
              </div>
              {event.source_url && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>SOURCE</span>
                  <a
                    href={event.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.detailSourceLink}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {event.source || 'View Source'} &#8599;
                  </a>
                </div>
              )}
              {companyName && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>COMPANY</span>
                  <span className={styles.detailCompanyLink}>{companyName}</span>
                </div>
              )}
            </div>

            {description && (
              <div className={styles.detailFullDescription}>
                <span className={styles.detailLabel}>FULL DESCRIPTION</span>
                <p className={styles.detailDescriptionText}>{description}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
