import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import styles from './TemporalSlider.module.css';

const START_YEAR = 2015;
const END_YEAR = 2026;
const YEARS = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);
const PLAY_INTERVAL_MS = 1200;

/**
 * TemporalSlider — bottom-left floating time slider for the graph canvas.
 * Allows scrubbing through years and animating playback.
 *
 * @param {Object} props
 * @param {number} props.value - Current year (2015–2026)
 * @param {function} props.onDateChange - Called with ISO date string (YYYY-12-31)
 * @param {number} [props.nodeCount] - Active node count at selected date
 * @param {number} [props.edgeCount] - Active edge count at selected date
 */
export function TemporalSlider({ value, onDateChange, nodeCount, edgeCount }) {
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef(null);
  const currentYearRef = useRef(value);

  // Keep ref in sync with prop
  currentYearRef.current = value;

  const handleSliderChange = useCallback(
    (e) => {
      const year = Number(e.target.value);
      onDateChange(`${year}-12-31`);
    },
    [onDateChange]
  );

  // Stop playback when reaching the end or on unmount
  const stopPlaying = useCallback(() => {
    setPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (playing) {
      stopPlaying();
      return;
    }
    // If already at the end, restart from the beginning
    if (currentYearRef.current >= END_YEAR) {
      onDateChange(`${START_YEAR}-12-31`);
    }
    setPlaying(true);
  }, [playing, stopPlaying, onDateChange]);

  // Animate through years
  useEffect(() => {
    if (!playing) return;

    intervalRef.current = setInterval(() => {
      const next = currentYearRef.current + 1;
      if (next > END_YEAR) {
        stopPlaying();
        return;
      }
      onDateChange(`${next}-12-31`);
    }, PLAY_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [playing, onDateChange, stopPlaying]);

  // Slider fill percentage for custom track styling
  const pct = useMemo(
    () => ((value - START_YEAR) / (END_YEAR - START_YEAR)) * 100,
    [value]
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          className={styles.playBtn}
          onClick={togglePlay}
          title={playing ? 'Pause' : 'Play through years'}
          aria-label={playing ? 'Pause animation' : 'Play animation'}
        >
          {playing ? '\u23F8' : '\u25B6'}
        </button>
        <span className={styles.yearLabel}>{value}</span>
        {(nodeCount !== undefined || edgeCount !== undefined) && (
          <span className={styles.counts}>
            {nodeCount !== undefined && (
              <span className={styles.count}>{nodeCount} nodes</span>
            )}
            {nodeCount !== undefined && edgeCount !== undefined && (
              <span className={styles.sep}>/</span>
            )}
            {edgeCount !== undefined && (
              <span className={styles.count}>{edgeCount} edges</span>
            )}
          </span>
        )}
      </div>

      <div className={styles.sliderRow}>
        <span className={styles.tick}>{START_YEAR}</span>
        <div className={styles.trackWrap}>
          <input
            type="range"
            className={styles.slider}
            min={START_YEAR}
            max={END_YEAR}
            step={1}
            value={value}
            onChange={handleSliderChange}
            style={{
              '--fill-pct': `${pct}%`,
            }}
            aria-label="Select year"
          />
          <div className={styles.tickMarks}>
            {YEARS.map((y) => (
              <span
                key={y}
                className={`${styles.tickDot} ${y === value ? styles.tickDotActive : ''}`}
              />
            ))}
          </div>
        </div>
        <span className={styles.tick}>{END_YEAR}</span>
      </div>
    </div>
  );
}
