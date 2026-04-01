import { useState, useMemo, useCallback } from 'react';
import { MainGrid } from '../layout/AppShell';
import { useCapitalFlows } from '../../api/hooks.js';
import { useFilters } from '../../hooks/useFilters';
import styles from './CapitalFlowView.module.css';

// ── Concept Tooltips ────────────────────────────────────────────────────────

const CONCEPT_TOOLTIPS = {
  pagerank: 'Measures how much capital a fund attracts from the network, weighted by the size and diversity of its connections. Funds connected to other well-connected funds score higher.',
  sourceSink: 'Identifies net capital deployers (sources) vs. net capital attractors (sinks). Sources push more capital into the ecosystem than they pull; sinks attract more than they deploy.',
  capitalMagnet: 'Ranks entities by their ability to attract capital from multiple diverse sources. Higher scores indicate broader network influence, not just larger dollar amounts.',
  sankey: 'Shows how capital flows from funds through sectors to individual companies. Wider bands represent larger capital amounts. Follow a band to trace where a fund\'s capital ends up.',
  stageDistribution: 'Breakdown of capital by company funding stage. Shows where in the lifecycle (Seed, Series A, B, etc.) Nevada\'s capital is being deployed.',
  sectorDistribution: 'Capital allocation across industry sectors. Shows which sectors attract the most investment in the Nevada ecosystem.',
};

function ConceptHelp({ concept }) {
  return (
    <span className={styles.conceptHelp} title={CONCEPT_TOOLTIPS[concept]}>?</span>
  );
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

// ── Sankey Node Detail Popup ─────────────────────────────────────────────────

function SankeyNodePopup({ node, flows, width, height, onClose }) {
  const details = useMemo(() => {
    if (!flows || !node) return null;
    const { column, label, value } = node;

    if (column === 'fund') {
      const fundFlows = flows.filter(f => f.type === 'fund_to_sector' && f.source === label);
      const sectors = [...new Set(fundFlows.map(f => f.target))];
      const companyFlows = flows.filter(
        f => f.type === 'sector_to_company' && sectors.includes(f.source)
      );
      const uniqueCompanies = [...new Set(companyFlows.map(f => f.target))];
      return {
        title: label,
        lines: [
          `Capital deployed: ${fmtM(value)}`,
          `Portfolio companies: ${uniqueCompanies.length}`,
          `Top sectors: ${sectors.slice(0, 3).join(', ') || 'N/A'}`,
        ],
      };
    }

    if (column === 'company') {
      const companyFlows = flows.filter(f => f.type === 'sector_to_company' && f.target === label);
      const sectors = [...new Set(companyFlows.map(f => f.source))];
      const fundFlows = flows.filter(f => f.type === 'fund_to_sector' && sectors.includes(f.target));
      const investors = [...new Set(fundFlows.map(f => f.source))];
      return {
        title: label,
        lines: [
          `Total funding: ${fmtM(value)}`,
          `Sectors: ${sectors.join(', ') || 'N/A'}`,
          `Key investors: ${investors.slice(0, 3).join(', ') || 'N/A'}`,
        ],
      };
    }

    return null;
  }, [flows, node]);

  if (!details) return null;

  const popupW = 280;
  const popupH = 120;
  const px = Math.min(Math.max(20, width / 2 - popupW / 2), width - popupW - 20);
  const py = Math.min(height / 2 - popupH / 2, height - popupH - 20);

  return (
    <g>
      <rect
        x={0} y={0} width={width} height={height}
        fill="rgba(0,0,0,0.3)" onClick={onClose}
        style={{ cursor: 'pointer' }}
      />
      <rect
        x={px} y={py} width={popupW} height={popupH}
        rx={6} fill="var(--bg-elevated, #1a1a2e)"
        stroke="var(--accent-teal, #2dd4bf)" strokeWidth={1.5}
      />
      <text x={px + 12} y={py + 22} className={styles.popupTitle}>
        {truncateLabel(details.title, 32)}
      </text>
      {details.lines.map((line, i) => (
        <text
          key={i}
          x={px + 12}
          y={py + 44 + i * 22}
          className={styles.popupLine}
        >
          {line}
        </text>
      ))}
      <text
        x={px + popupW - 12} y={py + 18}
        textAnchor="end" className={styles.popupClose}
        onClick={onClose} style={{ cursor: 'pointer' }}
      >
        [x]
      </text>
    </g>
  );
}

// ── Capital Magnet Methodology Popup ────────────────────────────────────────

function MagnetMethodologyPopup({ magnet, onClose }) {
  if (!magnet) return null;

  return (
    <div className={styles.popupOverlay} onClick={onClose}>
      <div className={styles.popupPanel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.popupHeader}>
          <span className={styles.popupHeaderTitle}>{magnet.name}</span>
          <button type="button" className={styles.popupCloseBtn} onClick={onClose}>[x]</button>
        </div>
        <div className={styles.popupBody}>
          <div className={styles.popupRow}>
            <span className={styles.popupLabel}>PageRank Score</span>
            <span className={styles.popupValue}>{magnet.score}</span>
          </div>
          <div className={styles.popupRow}>
            <span className={styles.popupLabel}>Total Capital Attracted</span>
            <span className={styles.popupValue}>{fmtM(magnet.totalAttracted)}</span>
          </div>
          <div className={styles.popupRow}>
            <span className={styles.popupLabel}>Sectors</span>
            <span className={styles.popupValue}>{magnet.sectors?.join(', ') || 'N/A'}</span>
          </div>
          <div className={styles.popupRow}>
            <span className={styles.popupLabel}>Region</span>
            <span className={styles.popupValue}>{REGION_LABELS[magnet.region] || magnet.region || 'N/A'}</span>
          </div>
          <div className={styles.popupMethodology}>
            <span className={styles.popupMethodLabel}>METHODOLOGY</span>
            <p className={styles.popupMethodText}>
              PageRank measures how much capital this entity attracts from the broader network,
              weighted by the diversity and connectedness of its sources. Entities connected to
              other well-connected entities score higher. This score of {magnet.score} ranks
              this entity among the top capital magnets in the Nevada ecosystem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sankey Diagram ───────────────────────────────────────────────────────────

function truncateLabel(text, maxChars) {
  if (!text || text.length <= maxChars) return text;
  return text.slice(0, maxChars - 1) + '\u2026';
}

function SankeyDiagram({ flows, width = 900 }) {
  const [hovered, setHovered] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // Compute dynamic height based on the number of nodes in each column
  const height = useMemo(() => {
    if (!flows || flows.length === 0) return 520;
    const sourceSet = new Set();
    const sectorSet = new Set();
    const companySet = new Set();
    for (const f of flows) {
      if (f.type === 'fund_to_sector') {
        sourceSet.add(f.source);
        sectorSet.add(f.target);
      } else if (f.type === 'sector_to_company') {
        companySet.add(f.target);
      }
    }
    const maxNodes = Math.max(sourceSet.size, sectorSet.size, companySet.size);
    // 22px per node with a minimum of 520
    return Math.max(520, maxNodes * 22);
  }, [flows]);

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

    // For sector->company flows, targets are companies
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

    const sidePad = 160;
    const topPad = 40;
    const nodeWidth = 18;
    const colX = [sidePad, width / 2 - nodeWidth / 2, width - sidePad - nodeWidth];
    const vertPad = 6;

    function layoutColumn(items, totals, x) {
      const totalValue = items.reduce((s, i) => s + (totals[i] || 0), 0) || 1;
      const availH = height - topPad * 2 - vertPad * (items.length - 1);
      const nodes = {};
      let y = topPad;
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
              aria-hidden="true"
              onMouseEnter={() => handleMouseEnter(link.source)}
              onMouseLeave={handleMouseLeave}
            />
          );
        })}
      </g>

      {/* Link value labels — only for flows > $1M */}
      <g className={styles.sankeyLinkLabels}>
        {links
          .filter((link) => link.value > 1)
          .map((link) => {
            // Compute midpoint of the cubic bezier at t=0.5
            const cx0 = link.x0 + (link.x1 - link.x0) * 0.4;
            const cx1 = link.x0 + (link.x1 - link.x0) * 0.6;
            const t = 0.5;
            const mt = 1 - t;
            const mx = mt * mt * mt * link.x0 + 3 * mt * mt * t * cx0 + 3 * mt * t * t * cx1 + t * t * t * link.x1;
            const my = (link.y0 + link.y1) / 2;
            const isHovered = hovered === link.source || hovered === link.target;
            return (
              <text
                key={`label-${link.id}`}
                x={mx}
                y={my}
                textAnchor="middle"
                dominantBaseline="central"
                className={styles.sankeyLinkValue}
                opacity={hovered ? (isHovered ? 0.85 : 0.05) : 0.55}
              >
                {fmtM(link.value)}
              </text>
            );
          })}
      </g>

      {/* Source nodes (funds) */}
      {srcNodes.map((n) => (
        <g
          key={`src-${n.label}`}
          onMouseEnter={() => handleMouseEnter(n.label)}
          onMouseLeave={handleMouseLeave}
          onClick={() => setSelectedNode({ column: 'fund', label: n.label, value: n.value })}
          className={styles.sankeyNode}
        >
          <title>{n.label}: {fmtM(n.value)}</title>
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
            {truncateLabel(n.label, 22)}
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
          <title>{n.label}: {fmtM(n.value)}</title>
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
          onClick={() => setSelectedNode({ column: 'company', label: n.label, value: n.value })}
          className={styles.sankeyNode}
        >
          <title>{n.label}: {fmtM(n.value)}</title>
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
            {truncateLabel(n.label, 22)}
          </text>
        </g>
      ))}

      {/* Column headers */}
      <text x={160} y={18} textAnchor="middle" className={styles.sankeyColumnHeader}>FUNDS</text>
      <text x={width / 2} y={18} textAnchor="middle" className={styles.sankeyColumnHeader}>SECTORS</text>
      <text x={width - 160} y={18} textAnchor="middle" className={styles.sankeyColumnHeader}>COMPANIES</text>

      {/* Node detail popup (rendered as foreignObject inside SVG) */}
      {selectedNode && (
        <SankeyNodePopup
          node={selectedNode}
          flows={flows}
          width={width}
          height={height}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </svg>
  );
}

// ── Capital Magnet Leaderboard ────────────────────────────────────────────────

function MagnetLeaderboard({ magnets }) {
  const [selectedMagnet, setSelectedMagnet] = useState(null);

  if (!magnets || magnets.length === 0) return null;
  const top = magnets.slice(0, 10);
  const maxScore = top[0]?.score || 1;

  return (
    <div className={styles.leaderboard}>
      <h3 className={styles.sectionTitle}>Capital Magnet Ranking <ConceptHelp concept="capitalMagnet" /></h3>
      <p className={styles.sectionSubtitle}>Ranking funds by network capital attraction</p>
      <div className={styles.leaderboardList}>
        {top.map((m, i) => (
          <div
            key={m.id}
            className={styles.leaderboardRow}
            onClick={() => setSelectedMagnet({ ...m, _rank: i + 1 })}
            style={{ cursor: 'pointer' }}
          >
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
      {selectedMagnet && (
        <MagnetMethodologyPopup
          magnet={selectedMagnet}
          onClose={() => setSelectedMagnet(null)}
        />
      )}
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
      <h3 className={styles.sectionTitle}>Source-Sink Analysis <ConceptHelp concept="sourceSink" /></h3>
      <p className={styles.sectionSubtitle}>Who deploys vs. who attracts capital</p>
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
      <h3 className={styles.sectionTitle}>Capital by Sector <ConceptHelp concept="sectorDistribution" /></h3>
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
      <h3 className={styles.sectionTitle}>Capital by Stage <ConceptHelp concept="stageDistribution" /></h3>
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
  const { filters } = useFilters();
  const { data, isLoading, isError, error } = useCapitalFlows({ region: filters.region });

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
            How capital moves through Nevada&apos;s innovation ecosystem <ConceptHelp concept="pagerank" />
          </p>
        </div>

        <KpiStrip data={data} />

        <div className={styles.sankeyContainer}>
          <h3 className={styles.sectionTitle}>Fund-to-Sector-to-Company Flow <ConceptHelp concept="sankey" /></h3>
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
