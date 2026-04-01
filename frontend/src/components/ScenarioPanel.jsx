import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useScenarios, useScenario } from '../api/hooks';
import { GP } from '../data/constants';
import * as d3 from 'd3';
import styles from './ScenarioPanel.module.css';

const STATUS_COLORS = {
  completed: 'var(--accent-green, #4ade80)',
  running: 'var(--accent-gold, #fbbf24)',
  pending: 'var(--text-disabled)',
  failed: 'var(--accent-red, #f87171)',
};

function formatDate(dateStr) {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function formatNumber(val) {
  if (val == null) return '--';
  if (typeof val === 'number') {
    return val.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
  return String(val);
}

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || 'var(--text-disabled)';
  return (
    <span
      className={styles.statusBadge}
      style={{ color, background: `${color}1a` }}
    >
      {status}
    </span>
  );
}

/**
 * D3 bar chart comparing baseline vs scenario predicted values.
 * Each metric gets a pair of bars: baseline (muted) and predicted (accent).
 */
function ComparisonChart({ forecasts }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Measure container
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setDimensions({ width, height: Math.max(220, forecasts.length * 50 + 60) });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [forecasts.length]);

  // Normalize forecast data
  const chartData = useMemo(() => {
    return forecasts
      .map((f) => {
        const baseline = f.current_value ?? f.current ?? f.baseline;
        const predicted = f.predicted_value ?? f.predicted ?? f.forecast;
        const ciLow = f.ci_low ?? f.confidence_low ?? f.lower ?? null;
        const ciHigh = f.ci_high ?? f.confidence_high ?? f.upper ?? null;
        const label = f.metric || f.name || f.label || 'Unknown';
        return { label, baseline, predicted, ciLow, ciHigh };
      })
      .filter((d) => d.baseline != null && d.predicted != null);
  }, [forecasts]);

  // Draw chart
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || chartData.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 20, left: 140 };
    const w = dimensions.width - margin.left - margin.right;
    const h = dimensions.height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const y0 = d3.scaleBand()
      .domain(chartData.map((d) => d.label))
      .range([0, h])
      .padding(0.3);

    const y1 = d3.scaleBand()
      .domain(['baseline', 'predicted'])
      .range([0, y0.bandwidth()])
      .padding(0.08);

    const maxVal = d3.max(chartData, (d) =>
      Math.max(d.baseline, d.predicted, d.ciHigh ?? 0)
    );

    const x = d3.scaleLinear()
      .domain([0, maxVal * 1.15])
      .range([0, w]);

    // Gridlines
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(x.ticks(5))
      .enter()
      .append('line')
      .attr('x1', (d) => x(d))
      .attr('x2', (d) => x(d))
      .attr('y1', 0)
      .attr('y2', h)
      .attr('stroke', 'var(--border-subtle, rgba(255,255,255,0.06))')
      .attr('stroke-dasharray', '2,3');

    // Y axis labels
    g.append('g')
      .selectAll('text')
      .data(chartData)
      .enter()
      .append('text')
      .attr('x', -8)
      .attr('y', (d) => y0(d.label) + y0.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', 'var(--text-secondary, #999)')
      .attr('font-size', '11px')
      .attr('font-family', 'var(--font-body)')
      .text((d) => d.label.length > 18 ? d.label.slice(0, 16) + '...' : d.label);

    // Baseline bars
    g.selectAll('.bar-baseline')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d) => y0(d.label) + y1('baseline'))
      .attr('width', (d) => Math.max(0, x(d.baseline)))
      .attr('height', y1.bandwidth())
      .attr('rx', 2)
      .attr('fill', 'var(--text-disabled, #555)')
      .attr('opacity', 0.5);

    // Predicted bars
    g.selectAll('.bar-predicted')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d) => y0(d.label) + y1('predicted'))
      .attr('width', (d) => Math.max(0, x(d.predicted)))
      .attr('height', y1.bandwidth())
      .attr('rx', 2)
      .attr('fill', GP.green);

    // Confidence interval whiskers
    chartData.forEach((d) => {
      if (d.ciLow != null && d.ciHigh != null) {
        const cy = y0(d.label) + y1('predicted') + y1.bandwidth() / 2;
        g.append('line')
          .attr('x1', x(d.ciLow))
          .attr('x2', x(d.ciHigh))
          .attr('y1', cy)
          .attr('y2', cy)
          .attr('stroke', GP.green)
          .attr('stroke-width', 1.5)
          .attr('opacity', 0.6);

        // Whisker caps
        [d.ciLow, d.ciHigh].forEach((val) => {
          g.append('line')
            .attr('x1', x(val))
            .attr('x2', x(val))
            .attr('y1', cy - 4)
            .attr('y2', cy + 4)
            .attr('stroke', GP.green)
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.6);
        });
      }
    });

    // Value labels
    g.selectAll('.val-baseline')
      .data(chartData)
      .enter()
      .append('text')
      .attr('x', (d) => x(d.baseline) + 4)
      .attr('y', (d) => y0(d.label) + y1('baseline') + y1.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('fill', 'var(--text-disabled, #777)')
      .attr('font-size', '10px')
      .attr('font-family', 'var(--font-mono)')
      .text((d) => formatNumber(d.baseline));

    g.selectAll('.val-predicted')
      .data(chartData)
      .enter()
      .append('text')
      .attr('x', (d) => x(d.predicted) + 4)
      .attr('y', (d) => y0(d.label) + y1('predicted') + y1.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('fill', GP.green)
      .attr('font-size', '10px')
      .attr('font-family', 'var(--font-mono)')
      .text((d) => formatNumber(d.predicted));

  }, [chartData, dimensions]);

  if (chartData.length === 0) {
    return <div className={styles.emptyChart}>No comparable metrics to chart</div>;
  }

  return (
    <div ref={containerRef} className={styles.chartContainer}>
      <div className={styles.chartLegend}>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ background: 'var(--text-disabled, #555)', opacity: 0.5 }} />
          Baseline
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ background: GP.green }} />
          Predicted
        </span>
      </div>
      <svg ref={svgRef} />
    </div>
  );
}

function ScenarioDetailPanel({ scenarioId }) {
  const { data: scenario, isLoading, isError, error } = useScenario(scenarioId);

  if (isLoading) {
    return <div className={styles.detailPanel}><div className={styles.emptyState}>Loading scenario...</div></div>;
  }
  if (isError) {
    return <div className={styles.detailPanel}><div className={styles.emptyState}>Error: {error?.message}</div></div>;
  }
  if (!scenario) {
    return <div className={styles.detailPanel}><div className={styles.emptyState}>Scenario not found</div></div>;
  }

  const forecasts = scenario.results || scenario.forecasts || scenario.entities || [];

  return (
    <div className={styles.detailPanel}>
      <div className={styles.detailHeader}>
        <h3 className={styles.detailTitle}>{scenario.name || scenario.title}</h3>
        {scenario.status && <StatusBadge status={scenario.status} />}
      </div>

      {scenario.description && (
        <p className={styles.detailDesc}>{scenario.description}</p>
      )}

      <div className={styles.detailMeta}>
        {(scenario.created_at || scenario.date) && (
          <span className={styles.metaItem}>Created {formatDate(scenario.created_at || scenario.date)}</span>
        )}
        {scenario.base_period && (
          <span className={styles.metaItem}>Base period: {formatDate(scenario.base_period)}</span>
        )}
        {scenario.assumptions && (
          <span className={styles.metaItem}>
            {Object.keys(scenario.assumptions).length} assumption(s)
          </span>
        )}
      </div>

      {/* Comparison chart */}
      {forecasts.length > 0 && (
        <div className={styles.chartSection}>
          <h4 className={styles.sectionHeading}>Baseline vs Predicted</h4>
          <ComparisonChart forecasts={forecasts} />
        </div>
      )}

      {/* Metrics table */}
      {forecasts.length > 0 && (
        <div className={styles.tableSection}>
          <h4 className={styles.sectionHeading}>Predicted Metrics</h4>
          <table className={styles.metricsTable}>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Baseline</th>
                <th>Predicted</th>
                <th title="Confidence interval lower bound — range where the true value likely falls">CI Low</th>
                <th title="Confidence interval upper bound — range where the true value likely falls">CI High</th>
              </tr>
            </thead>
            <tbody>
              {forecasts.map((f, idx) => {
                const baseline = f.current_value ?? f.current ?? f.baseline;
                const predicted = f.predicted_value ?? f.predicted ?? f.forecast;
                const ciLow = f.ci_low ?? f.confidence_low ?? f.lower;
                const ciHigh = f.ci_high ?? f.confidence_high ?? f.upper;
                const delta = baseline != null && predicted != null ? predicted - baseline : null;
                const isPositive = delta != null && delta > 0;
                const isNegative = delta != null && delta < 0;

                return (
                  <tr key={f.metric || f.name || idx}>
                    <td className={styles.metricName}>{f.metric || f.name || f.label || `Metric ${idx + 1}`}</td>
                    <td className={styles.numCell}>{formatNumber(baseline)}</td>
                    <td className={`${styles.numCell} ${isPositive ? styles.positive : ''} ${isNegative ? styles.negative : ''}`}>
                      {formatNumber(predicted)}
                      {delta != null && (
                        <span className={styles.delta}>
                          {delta > 0 ? '+' : ''}{formatNumber(delta)}
                        </span>
                      )}
                    </td>
                    <td className={styles.numCell}>{formatNumber(ciLow)}</td>
                    <td className={styles.numCell}>{formatNumber(ciHigh)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {forecasts.length === 0 && (
        <div className={styles.emptyState}>No forecast results available for this scenario</div>
      )}
    </div>
  );
}

/**
 * ScenarioPanel — scenario comparison panel.
 * Fetches available scenarios, allows selection, and shows predicted metrics
 * with confidence intervals plus a D3 bar chart comparing baseline vs scenario.
 */
export function ScenarioPanel() {
  const { data: scenariosData, isLoading, isError, error } = useScenarios();
  const [selectedId, setSelectedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const scenarios = useMemo(() => {
    const raw = Array.isArray(scenariosData)
      ? scenariosData
      : scenariosData?.data || scenariosData?.scenarios || [];
    if (statusFilter === 'all') return raw;
    return raw.filter((s) => s.status === statusFilter);
  }, [scenariosData, statusFilter]);

  const statuses = useMemo(() => {
    const raw = Array.isArray(scenariosData)
      ? scenariosData
      : scenariosData?.data || scenariosData?.scenarios || [];
    const set = new Set(raw.map((s) => s.status).filter(Boolean));
    return ['all', ...set];
  }, [scenariosData]);

  const handleSelect = useCallback((id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  if (isLoading) {
    return (
      <div className={styles.panel}>
        <div className={styles.skeletonList}>
          {[1, 2, 3].map((i) => <div key={i} className={`skeleton ${styles.skeletonItem}`} />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.panel}>
        <div className={styles.emptyState}>Failed to load scenarios: {error?.message}</div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Scenario Comparison</h2>
        <div className={styles.filterRow}>
          {statuses.map((s) => (
            <button
              key={s}
              className={`${styles.filterBtn} ${statusFilter === s ? styles.filterBtnActive : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {scenarios.length === 0 ? (
        <div className={styles.emptyState}>No scenarios available</div>
      ) : (
        <div className={styles.layout}>
          {/* Scenario list */}
          <div className={styles.scenarioList}>
            {scenarios.map((s) => {
              const id = s.id || s.scenario_id;
              const isActive = selectedId === id;
              return (
                <div
                  key={id}
                  className={`${styles.scenarioItem} ${isActive ? styles.scenarioItemActive : ''}`}
                  onClick={() => handleSelect(id)}
                >
                  <div className={styles.itemHeader}>
                    <span className={styles.itemName}>{s.name || s.title || `Scenario ${id}`}</span>
                    {s.status && <StatusBadge status={s.status} />}
                  </div>
                  {(s.created_at || s.date) && (
                    <span className={styles.itemDate}>{formatDate(s.created_at || s.date)}</span>
                  )}
                  {s.description && (
                    <p className={styles.itemDesc}>{s.description}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Detail / chart area */}
          <div className={styles.detailArea}>
            {selectedId ? (
              <ScenarioDetailPanel scenarioId={selectedId} />
            ) : (
              <div className={styles.placeholder}>
                Select a scenario to view predicted metrics and comparison chart
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
