import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MainGrid } from '../layout/AppShell';
import styles from './CapitalFlowView.module.css';

// ── API fetcher ──────────────────────────────────────────────────────────────

async function fetchCapitalFlows() {
  const res = await fetch('/api/analytics/capital-flows');
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = await res.json();
  return json.data;
}

function useCapitalFlows() {
  return useQuery({
    queryKey: ['analytics', 'capital-flows'],
    queryFn: fetchCapitalFlows,
    staleTime: 300_000,
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtM(v) {
  if (v == null || v === 0) return '$0';
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}B`;
  if (v >= 1) return `$${v.toFixed(1)}M`;
  return `$${(v * 1000).toFixed(0)}K`;
}

const REGION_LABELS = {
  las_vegas: 'Las Vegas',
  reno: 'Reno',
  rural: 'Rural NV',
  unknown: 'Unknown',
};

const STAGE_LABELS = {
  seed: 'Seed',
  pre_seed: 'Pre-Seed',
  series_a: 'Series A',
  series_b: 'Series B',
  series_c_plus: 'Series C+',
  growth: 'Growth',
  unknown: 'Unknown',
};

// ── Sankey Diagram ───────────────────────────────────────────────────────────

function SankeyDiagram({ flows, width = 900, height = 520 }) {
  const [hovered, setHovered] = useState(null);

  const layout = useMemo(() => {
    if (!flows || flows.length === 0) return null;

    // Collect unique sources and targets
    const sourceSet = new Set();
    const targetSet = new Set();
    for (const f of flows) {
      if (f.type === 'fund_to_sector') {
        sourceSet.add(f.source);
        targetSet.add(f.target);
      }
    }

    // For sector→company flows, targets are companies
    const companySet = new Set();
    for (const f of flows) {
      if (f.type === 'sector_to_company') {
        companySet.add(f.target);
      }
    }

    const sources = [...sourceSet].sort();
    const middles = [...targetSet].sort();
    const targets = [...companySet].sort();

    // Compute totals for sizing
    const sourceTotal = {};
    const middleInTotal = {};
    const middleOutTotal = {};
    const targetTotal = {};

    for (const f of flows) {
      if (f.type === 'fund_to_sector') {
        sourceTotal[f.source] = (sourceTotal[f.source] || 0) + f.value;
        middleInTotal[f.target] = (middleInTotal[f.target] || 0) + f.value;
      } else if (f.type === 'sector_to_company') {
        middleOutTotal[f.source] = (middleOutTotal[f.source] || 0) + f.value;
        targetTotal[f.target] = (targetTotal[f.target] || 0) + f.value;
      }
    }

    // Use the max of in/out for middle node sizing
    const middleTotal = {};
    for (const m of middles) {
      middleTotal[m] = Math.max(middleInTotal[m] || 0, middleOutTotal[m] || 0);
    }

    const pad = 40;
    const nodeWidth = 18;
    const colX = [pad, width / 2 - nodeWidth / 2, width - pad - nodeWidth];
    const vertPad = 6;

    function layoutColumn(items, totals, x) {
      const totalValue = items.reduce((s, i) => s + (totals[i] || 0), 0) || 1;
      const availH = height - pad * 2 - vertPad * (items.length - 1);
      const nodes = {};
      let y = pad;
      for (const item of items) {
        const h = Math.max(8, (((totals[item] || 0) / totalValue) * availH));
        nodes[item] = { x, y, w: nodeWidth, h, label: item, value: totals[item] || 0 };
        y += h + vertPad;
      }
      return nodes;
    }

    const srcNodes = layoutColumn(sources, sourceTotal, colX[0]);
    const midNodes = layoutColumn(middles, middleTotal, colX[1]);
    const tgtNodes = layoutColumn(targets, targetTotal, colX[2]);

    // Build link paths
    // Track vertical offsets for stacking links within each node
    const srcOutOffset = {};
    const midInOffset = {};
    const midOutOffset = {};
    const tgtInOffset = {};

    for (const s of sources) srcOutOffset[s] = 0;
    for (const m of middles) { midInOffset[m] = 0; midOutOffset[m] = 0; }
    for (const t of targets) tgtInOffset[t] = 0;

    const links = [];

    // Fund → Sector links
    const fundSectorFlows = flows
      .filter(f => f.type === 'fund_to_sector')
      .sort((a, b) => b.value - a.value);

    for (const f of fundSectorFlows) {
      const sn = srcNodes[f.source];
      const mn = midNodes[f.target];
      if (!sn || !mn) continue;

      const srcNodeTotal = sourceTotal[f.source] || 1;
      const midNodeTotal = middleTotal[f.target] || 1;
      const thickness = Math.max(2, (f.value / srcNodeTotal) * sn.h);
      const targetThickness = Math.max(2, (f.value / midNodeTotal) * mn.h);

      const y0 = sn.y + srcOutOffset[f.source];
      const y1 = mn.y + midInOffset[f.target];
      srcOutOffset[f.source] += thickness;
      midInOffset[f.target] += targetThickness;

      links.push({
        id: `${f.source}-${f.target}`,
        x0: sn.x + sn.w,
        y0: y0 + thickness / 2,
        x1: mn.x,
        y1: y1 + targetThickness / 2,
        thickness,
        value: f.value,
        source: f.source,
        target: f.target,
        layer: 0,
      });
    }

    // Sector → Company links
    const sectorCompanyFlows = flows
      .filter(f => f.type === 'sector_to_company')
      .sort((a, b) => b.value - a.value);

    for (const f of sectorCompanyFlows) {
      const mn = midNodes[f.source];
      const tn = tgtNodes[f.target];
      if (!mn || !tn) continue;

      const midNodeTotal = middleTotal[f.source] || 1;
      const tgtNodeTotal = targetTotal[f.target] || 1;
      const thickness = Math.max(2, (f.value / midNodeTotal) * mn.h);
      const targetThickness = Math.max(2, (f.value / tgtNodeTotal) * tn.h);

      const y0 = mn.y + midOutOffset[f.source];
      const y1 = tn.y + tgtInOffset[f.target];
      midOutOffset[f.source] += thickness;
      tgtInOffset[f.target] += targetThickness;

      links.push({
        id: `${f.source}-${f.target}`,
        x0: mn.x + mn.w,
        y0: y0 + thickness / 2,
        x1: tn.x,
        y1: y1 + targetThickness / 2,
        thickness,
        value: f.value,
        source: f.source,
        target: f.target,
        layer: 1,
      });
    }

    return {
      srcNodes: Object.values(srcNodes),
      midNodes: Object.values(midNodes),
      tgtNodes: Object.values(tgtNodes),
      links,
    };
  }, [flows, width, height]);

  const handleMouseEnter = useCallback((id) => setHovered(id), []);
  const handleMouseLeave = useCallback(() => setHovered(null), []);

  if (!layout) {
    return <div className={styles.emptyState}>No capital flow data available</div>;
  }

  const { srcNodes, midNodes, tgtNodes, links } = layout;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={styles.sankeySvg}
      role="img"
      aria-label="Capital flow Sankey diagram showing fund-to-sector-to-company flows"
    >
      {/* Links */}
      <g className={styles.sankeyLinks}>
        {links.map((link) => {
          const cx0 = link.x0 + (link.x1 - link.x0) * 0.4;
          const cx1 = link.x0 + (link.x1 - link.x0) * 0.6;
          const d = `M${link.x0},${link.y0} C${cx0},${link.y0} ${cx1},${link.y1} ${link.x1},${link.y1}`;
          const isHovered = hovered === link.source || hovered === link.target;
          return (
            <path
              key={link.id}
              d={d}
              fill="none"
              stroke={isHovered ? 'var(--accent-amber, #f0b429)' : 'var(--accent-teal, #2dd4bf)'}
              strokeWidth={Math.max(1.5, link.thickness)}
              strokeOpacity={hovered ? (isHovered ? 0.7 : 0.08) : 0.35}
              onMouseEnter={() => handleMouseEnter(link.source)}
              onMouseLeave={handleMouseLeave}
            />
          );
        })}
      </g>

      {/* Source nodes (funds) */}
      {srcNodes.map((n) => (
        <g
          key={`src-${n.label}`}
          onMouseEnter={() => handleMouseEnter(n.label)}
          onMouseLeave={handleMouseLeave}
          className={styles.sankeyNode}
        >
          <rect
            x={n.x}
            y={n.y}
            width={n.w}
            height={n.h}
            rx={3}
            fill={hovered === n.label ? 'var(--accent-amber, #f0b429)' : 'var(--accent-teal, #2dd4bf)'}
            opacity={hovered ? (hovered === n.label ? 1 : 0.3) : 0.85}
          />
          <text
            x={n.x - 6}
            y={n.y + n.h / 2}
            textAnchor="end"
            dominantBaseline="central"
            className={styles.sankeyLabel}
            opacity={hovered ? (hovered === n.label ? 1 : 0.4) : 1}
          >
            {n.label}
          </text>
        </g>
      ))}

      {/* Middle nodes (sectors) */}
      {midNodes.map((n) => (
        <g
          key={`mid-${n.label}`}
          onMouseEnter={() => handleMouseEnter(n.label)}
          onMouseLeave={handleMouseLeave}
          className={styles.sankeyNode}
        >
          <rect
            x={n.x}
            y={n.y}
            width={n.w}
            height={n.h}
            rx={3}
            fill="var(--text-disabled, #6b7280)"
            opacity={hovered ? (hovered === n.label ? 0.9 : 0.25) : 0.65}
          />
          <text
            x={n.x + n.w / 2}
            y={n.y - 6}
            textAnchor="middle"
            className={styles.sankeySectorLabel}
            opacity={hovered ? (hovered === n.label ? 1 : 0.4) : 1}
          >
            {n.label}
          </text>
        </g>
      ))}

      {/* Target nodes (companies) */}
      {tgtNodes.map((n) => (
        <g
          key={`tgt-${n.label}`}
          onMouseEnter={() => handleMouseEnter(n.label)}
          onMouseLeave={handleMouseLeave}
          className={styles.sankeyNode}
        >
          <rect
            x={n.x}
            y={n.y}
            width={n.w}
            height={n.h}
            rx={3}
            fill={hovered === n.label ? 'var(--accent-amber, #f0b429)' : 'var(--accent-teal, #2dd4bf)'}
            opacity={hovered ? (hovered === n.label ? 1 : 0.3) : 0.85}
          />
          <text
            x={n.x + n.w + 6}
            y={n.y + n.h / 2}
            textAnchor="start"
            dominantBaseline="central"
            className={styles.sankeyLabel}
            opacity={hovered ? (hovered === n.label ? 1 : 0.4) : 1}
          >
            {n.label}
          </text>
        </g>
      ))}

      {/* Column headers */}
      <text x={38} y={18} className={styles.sankeyColumnHeader}>FUNDS</text>
      <text x={width / 2} y={18} textAnchor="middle" className={styles.sankeyColumnHeader}>SECTORS</text>
      <text x={width - 38} y={18} textAnchor="end" className={styles.sankeyColumnHeader}>COMPANIES</text>
    </svg>
  );
}

// ── Capital Magnet Leaderboard ────────────────────────────────────────────────

function MagnetLeaderboard({ magnets }) {
  if (!magnets || magnets.length === 0) return null;
  const top = magnets.slice(0, 10);
  const maxScore = top[0]?.score || 1;

  return (
    <div className={styles.leaderboard}>
      <h3 className={styles.sectionTitle}>Capital Magnet Ranking</h3>
      <p className={styles.sectionSubtitle}>Weighted PageRank on funding subgraph</p>
      <div className={styles.leaderboardList}>
        {top.map((m, i) => (
          <div key={m.id} className={styles.leaderboardRow}>
            <span className={styles.leaderboardRank}>#{i + 1}</span>
            <div className={styles.leaderboardInfo}>
              <span className={styles.leaderboardName}>{m.name}</span>
              <span className={styles.leaderboardMeta}>
                {m.sectors.slice(0, 2).join(', ')} | {REGION_LABELS[m.region] || m.region}
              </span>
            </div>
            <div className={styles.leaderboardBarWrap}>
              <div
                className={styles.leaderboardBar}
                style={{ width: `${(m.score / maxScore) * 100}%` }}
              />
            </div>
            <span className={styles.leaderboardScore}>{m.score}</span>
            <span className={styles.leaderboardAmount}>{fmtM(m.totalAttracted)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Source-Sink Summary Cards ─────────────────────────────────────────────────

function SourceSinkCards({ sourceSink }) {
  if (!sourceSink || sourceSink.length === 0) return null;

  const deployers = sourceSink
    .filter(s => s.category === 'net_deployer')
    .sort((a, b) => b.deployed - a.deployed)
    .slice(0, 8);

  return (
    <div className={styles.sourceSinkSection}>
      <h3 className={styles.sectionTitle}>Source-Sink Analysis</h3>
      <p className={styles.sectionSubtitle}>Net capital flow by institution</p>
      <div className={styles.sourceSinkGrid}>
        {deployers.map((s) => (
          <div key={s.id} className={styles.sourceSinkCard}>
            <div className={styles.sourceSinkHeader}>
              <span className={styles.sourceSinkName}>{s.name}</span>
              <span className={`${styles.sourceSinkBadge} ${styles[s.category]}`}>
                {s.category === 'net_deployer' ? 'DEPLOYER' : 'ATTRACTOR'}
              </span>
            </div>
            <div className={styles.sourceSinkMetrics}>
              <div className={styles.sourceSinkMetric}>
                <span className={styles.metricLabel}>Deployed</span>
                <span className={styles.metricValue}>{fmtM(s.deployed)}</span>
              </div>
              <div className={styles.sourceSinkMetric}>
                <span className={styles.metricLabel}>Attracted</span>
                <span className={styles.metricValue}>{fmtM(s.attracted)}</span>
              </div>
              <div className={styles.sourceSinkMetric}>
                <span className={styles.metricLabel}>Net Flow</span>
                <span className={`${styles.metricValue} ${s.netFlow > 0 ? styles.positive : styles.negative}`}>
                  {s.netFlow > 0 ? '+' : ''}{fmtM(s.netFlow)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Regional Distribution Bar Chart ──────────────────────────────────────────

function RegionalChart({ byRegion }) {
  if (!byRegion) return null;

  const entries = Object.entries(byRegion)
    .map(([k, v]) => ({ region: k, value: v, label: REGION_LABELS[k] || k }))
    .filter(e => e.value > 0)
    .sort((a, b) => b.value - a.value);

  if (entries.length === 0) return null;
  const max = entries[0].value || 1;

  return (
    <div className={styles.regionChart}>
      <h3 className={styles.sectionTitle}>Regional Capital Distribution</h3>
      <div className={styles.regionBars}>
        {entries.map((e) => (
          <div key={e.region} className={styles.regionBarRow}>
            <span className={styles.regionLabel}>{e.label}</span>
            <div className={styles.regionBarTrack}>
              <div
                className={styles.regionBarFill}
                style={{ width: `${(e.value / max) * 100}%` }}
              />
            </div>
            <span className={styles.regionBarValue}>{fmtM(e.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sector Distribution ──────────────────────────────────────────────────────

function SectorChart({ bySector }) {
  if (!bySector) return null;

  const entries = Object.entries(bySector)
    .map(([k, v]) => ({ sector: k, value: v }))
    .filter(e => e.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 12);

  if (entries.length === 0) return null;
  const max = entries[0].value || 1;

  return (
    <div className={styles.sectorChart}>
      <h3 className={styles.sectionTitle}>Capital by Sector</h3>
      <div className={styles.regionBars}>
        {entries.map((e) => (
          <div key={e.sector} className={styles.regionBarRow}>
            <span className={styles.regionLabel}>{e.sector}</span>
            <div className={styles.regionBarTrack}>
              <div
                className={styles.sectorBarFill}
                style={{ width: `${(e.value / max) * 100}%` }}
              />
            </div>
            <span className={styles.regionBarValue}>{fmtM(e.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stage Distribution ───────────────────────────────────────────────────────

function StageChart({ byStage }) {
  if (!byStage) return null;

  const entries = Object.entries(byStage)
    .map(([k, v]) => ({ stage: k, value: v, label: STAGE_LABELS[k] || k }))
    .filter(e => e.value > 0)
    .sort((a, b) => b.value - a.value);

  if (entries.length === 0) return null;
  const max = entries[0].value || 1;

  return (
    <div className={styles.stageChart}>
      <h3 className={styles.sectionTitle}>Capital by Stage</h3>
      <div className={styles.regionBars}>
        {entries.map((e) => (
          <div key={e.stage} className={styles.regionBarRow}>
            <span className={styles.regionLabel}>{e.label}</span>
            <div className={styles.regionBarTrack}>
              <div
                className={styles.stageBarFill}
                style={{ width: `${(e.value / max) * 100}%` }}
              />
            </div>
            <span className={styles.regionBarValue}>{fmtM(e.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── KPI Strip ────────────────────────────────────────────────────────────────

function KpiStrip({ data }) {
  const totalCapital = useMemo(() => {
    if (!data?.rawFlows) return 0;
    return data.rawFlows.reduce((s, f) => s + f.value, 0);
  }, [data]);

  const uniqueFunds = useMemo(() => {
    if (!data?.rawFlows) return 0;
    return new Set(data.rawFlows.map(f => f.source)).size;
  }, [data]);

  const uniqueCompanies = useMemo(() => {
    if (!data?.rawFlows) return 0;
    return new Set(data.rawFlows.map(f => f.target)).size;
  }, [data]);

  const topMagnet = data?.capitalMagnets?.[0];

  return (
    <div className={styles.kpiStrip}>
      <div className={styles.kpiCell}>
        <span className={styles.kpiValue}>{fmtM(totalCapital)}</span>
        <span className={styles.kpiLabel}>Total Capital Tracked</span>
      </div>
      <div className={styles.kpiCell}>
        <span className={styles.kpiValue}>{uniqueFunds}</span>
        <span className={styles.kpiLabel}>Active Funds</span>
      </div>
      <div className={styles.kpiCell}>
        <span className={styles.kpiValue}>{uniqueCompanies}</span>
        <span className={styles.kpiLabel}>Portfolio Companies</span>
      </div>
      <div className={styles.kpiCell}>
        <span className={styles.kpiValue}>{topMagnet?.name || '--'}</span>
        <span className={styles.kpiLabel}>Top Capital Magnet</span>
      </div>
    </div>
  );
}

// ── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <MainGrid>
      <div className={styles.wrapper}>
        <div className={styles.kpiStrip}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`${styles.kpiCell} skeleton`}>
              <span className={styles.kpiValue}>&nbsp;</span>
              <span className={styles.kpiLabel}>&nbsp;</span>
            </div>
          ))}
        </div>
        <div className={`${styles.sankeyContainer} skeleton`} style={{ height: 520 }} />
      </div>
    </MainGrid>
  );
}

// ── Main View ────────────────────────────────────────────────────────────────

export function CapitalFlowView() {
  const { data, isLoading, isError, error } = useCapitalFlows();

  if (isLoading) return <LoadingSkeleton />;

  if (isError) {
    return (
      <MainGrid>
        <div className={styles.wrapper}>
          <div className={styles.errorState}>
            <h3>Failed to load capital flow data</h3>
            <p>{error?.message || 'Unknown error'}</p>
          </div>
        </div>
      </MainGrid>
    );
  }

  return (
    <MainGrid>
      <div className={styles.wrapper}>
        <div className={styles.viewHeader}>
          <h2 className={styles.viewTitle}>Capital Flow Analytics</h2>
          <p className={styles.viewSubtitle}>
            Directed funding graph analysis with weighted PageRank scoring
          </p>
        </div>

        <KpiStrip data={data} />

        <div className={styles.sankeyContainer}>
          <h3 className={styles.sectionTitle}>Fund-to-Sector-to-Company Flow</h3>
          <SankeyDiagram flows={data?.flows} />
        </div>

        <div className={styles.analyticsGrid}>
          <MagnetLeaderboard magnets={data?.capitalMagnets} />

          <div className={styles.chartsColumn}>
            <RegionalChart byRegion={data?.byRegion} />
            <SectorChart bySector={data?.bySector} />
            <StageChart byStage={data?.byStage} />
          </div>
        </div>

        <SourceSinkCards sourceSink={data?.sourceSink} />
      </div>
    </MainGrid>
  );
}

export default CapitalFlowView;
