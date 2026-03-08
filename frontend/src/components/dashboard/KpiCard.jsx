import { memo, useMemo } from 'react';
import { CountUp } from '../shared/CountUp';
import { Sparkline } from '../shared/Sparkline';
import { Tooltip } from '../shared/Tooltip';
import styles from './KpiCard.module.css';

// Data quality visual constants (Bloomberg-style source indicators)
const QUALITY_BADGE = {
  verified: 'V',
  inferred: '~',
  calculated: 'C',
};

const QUALITY_LABEL = {
  verified: 'Verified',
  inferred: 'Inferred',
  calculated: 'Calculated',
};

const CardContent = memo(function CardContent({
  label,
  value,
  prefix,
  suffix,
  decimals,
  secondary,
  sparkData,
  sparkColor,
  active,
  onClick,
  quality,
  dataQualityNote,
}) {
  const qualityBadge = quality ? QUALITY_BADGE[quality] : null;
  const qualityLabel = quality ? QUALITY_LABEL[quality] : null;

  return (
    <div
      className={`${styles.kpiCard} ${active ? styles.active : ''} ${quality ? styles[`quality-${quality}`] : ''}`}
      onClick={onClick}
    >
      <div className={styles.labelRow}>
        <span className={styles.label}>{label}</span>
        {qualityBadge && (
          <span
            className={`${styles.qualityBadge} ${styles[`quality-${quality}`]}`}
            title={dataQualityNote || qualityLabel}
          >
            {qualityBadge}
          </span>
        )}
      </div>
      <div className={styles.valueRow}>
        <CountUp
          className={styles.value}
          value={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
        />
        {sparkData && (
          <Sparkline
            data={sparkData}
            width={64}
            height={22}
            color={sparkColor || 'var(--accent-teal)'}
            strokeWidth={1.5}
          />
        )}
      </div>
      {secondary && <span className={styles.secondary}>{secondary}</span>}
      {dataQualityNote && (
        <span className={styles.dataQualityNote}>{dataQualityNote}</span>
      )}
    </div>
  );
});

export const KpiCard = memo(function KpiCard({
  label,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  secondary,
  sparkData,
  sparkColor,
  active = false,
  onClick,
  tooltip,
  quality,
  dataQualityNote,
}) {
  // Memoize sparkline color to avoid unnecessary re-renders
  const memoSparkColor = useMemo(
    () => sparkColor || 'var(--accent-teal)',
    [sparkColor]
  );

  // Combine tooltip with data quality note
  const combinedTooltip = useMemo(() => {
    if (!tooltip && !dataQualityNote) return null;
    if (tooltip && dataQualityNote) {
      return `${tooltip}\n\nData Quality: ${dataQualityNote}`;
    }
    return tooltip || dataQualityNote;
  }, [tooltip, dataQualityNote]);

  const card = (
    <CardContent
      label={label}
      value={value}
      prefix={prefix}
      suffix={suffix}
      decimals={decimals}
      secondary={secondary}
      sparkData={sparkData}
      sparkColor={memoSparkColor}
      active={active}
      onClick={onClick}
      quality={quality}
      dataQualityNote={dataQualityNote}
    />
  );

  if (!combinedTooltip) return card;

  return (
    <Tooltip title={label} text={combinedTooltip} position="below">
      {card}
    </Tooltip>
  );
});
