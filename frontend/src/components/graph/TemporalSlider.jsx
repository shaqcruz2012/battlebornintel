import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styles from './TemporalSlider.module.css';

const PLAY_INTERVAL_MS = 1000; // advance 1 year per second

/**
 * TemporalSlider — horizontal time scrubber at the bottom of the graph canvas.
 *
 * Props:
 *   min          - first year (e.g. 2015)
 *   max          - last year (e.g. 2026)
 *   value        - current yearMax
 *   onChange      - (year: number) => void — called on slider change (debounced externally)
 *   visibleEdges - number of edges currently shown
 *   totalEdges   - total edges before temporal filter
 */
export function TemporalSlider({ min, max, value, onChange, visibleEdges, totalEdges }) {
  const [playing, setPlaying] = useState(false);

  // Generate tick years — show every year from min to max
  const years = useMemo(() => {
    const arr = [];
    for (let y = min; y <= max; y++) arr.push(y);
    return arr;
  }, [min, max]);

  // Keep a ref to the current value so the interval always reads the latest
  const valueRef = useRef(value);
  valueRef.current = value;

  // Auto-play: advance 1 year per second using ref-based approach
  useEffect(() => {
    if (!playing) return;

    const id = setInterval(() => {
      const next = valueRef.current + 1;
      if (next > max) {
        setPlaying(false);
        return;
      }
      onChange(next);
    }, PLAY_INTERVAL_MS);

    return () => clearInterval(id);
  }, [playing, max, onChange]);

  const handlePlay = useCallback(() => {
    setPlaying((p) => {
      if (!p && valueRef.current >= max) {
        // Reset to min before playing
        onChange(min);
      }
      return !p;
    });
  }, [max, min, onChange]);

  const handleSliderChange = useCallback(
    (e) => {
      const year = Number(e.target.value);
      setPlaying(false);
      onChange(year);
    },
    [onChange]
  );

  // Compute the filled percentage for the track gradient
  const pct = ((value - min) / (max - min)) * 100;
  const trackBg = `linear-gradient(to right, rgba(69,215,198,0.5) 0%, rgba(69,215,198,0.5) ${pct}%, rgba(255,255,255,0.08) ${pct}%, rgba(255,255,255,0.08) 100%)`;

  return (
    <div className={styles.wrapper}>
      {/* Play / Pause */}
      <button
        className={`${styles.playBtn} ${playing ? styles.active : ''}`}
        onClick={handlePlay}
        title={playing ? 'Pause' : 'Play timeline'}
        aria-label={playing ? 'Pause timeline animation' : 'Play timeline animation'}
      >
        {playing ? '\u275A\u275A' : '\u25B6'}
      </button>

      {/* Current year */}
      <span className={styles.yearLabel}>{value}</span>

      {/* Slider track */}
      <div className={styles.sliderContainer}>
        <input
          type="range"
          className={styles.slider}
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={handleSliderChange}
          style={{ background: trackBg }}
          aria-label="Temporal filter year"
        />
        <div className={styles.ticks}>
          {years.map((y) => (
            <span
              key={y}
              className={`${styles.tick} ${y <= value ? styles.activeTick : ''}`}
            >
              {y % 5 === 0 || y === min || y === max ? y : '\u00B7'}
            </span>
          ))}
        </div>
      </div>

      {/* Edge count */}
      {totalEdges > 0 && (
        <span className={styles.edgeCount}>
          <strong>{visibleEdges}</strong>/{totalEdges} edges
        </span>
      )}
    </div>
  );
}
