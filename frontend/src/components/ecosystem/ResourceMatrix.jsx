// ─────────────────────────────────────────────────────────────────────
// ResourceMatrix.jsx — Nevada Ecosystem Resource Bubble Chart
//
// Converted from BBI_Ecosystem_Graph.html
// Uses IBM Plex Mono font (add to index.html if not present)
// Requires: no extra deps — pure DOM/SVG rendering
// ─────────────────────────────────────────────────────────────────────

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  coreAll, expandedData,
  COLOR_MAP, STAGE_Y_BANDS, STAGE_NAMES,
} from '../../data/ecosystemOrgs';
import { POLICY_GAPS } from '../../data/policyGaps';
import styles from './ResourceMatrix.module.css';

// ── Component ────────────────────────────────────────────────────────
export default function ResourceMatrix() {
  const areaRef      = useRef(null);
  const tooltipRef   = useRef(null);
  const bodyTipsRef  = useRef([]);

  const [dataset, setDataset]       = useState('core');
  const [activeTrack, setTrack]     = useState('ALL');
  const [activeStage, setStage]     = useState(null);
  const [activeCats, setActiveCats] = useState(new Set(Object.keys(COLOR_MAP)));
  const [labelsOn, setLabels]       = useState(true);
  const [gapVis, setGapVis]         = useState(
    Object.fromEntries(POLICY_GAPS.map(g => [g.id, false]))
  );
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

  // Track container size so chart re-renders when layout is ready or resized
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setDimensions({ w: Math.round(width), h: Math.round(height) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Derived dataset
  const rawData = dataset === 'core'
    ? [...coreAll]
    : [...coreAll, ...expandedData];

  const PAD  = { top: 36, right: 40, bottom: 36, left: 52 };
  const AXIS = 10;

  // ── Visibility helpers ───────────────────────────────────────────
  const isVisible = useCallback((d) => {
    if (!activeCats.has(d.cat)) return false;
    if (activeTrack !== 'ALL' && d.track !== activeTrack) return false;
    return true;
  }, [activeCats, activeTrack]);

  const isStageDim = useCallback((d) => {
    if (activeStage === null) return false;
    return d.stageN !== activeStage;
  }, [activeStage]);

  // ── Main render ──────────────────────────────────────────────────
  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    const W = area.clientWidth;
    const H = area.clientHeight;
    if (!W || !H) return;

    // Clean up previous body-appended tooltips
    bodyTipsRef.current.forEach(el => el.remove());
    bodyTipsRef.current = [];

    const pW = W - PAD.left - PAD.right;
    const pH = H - PAD.top  - PAD.bottom;

    const toX = (v) => PAD.left + (v / AXIS) * pW;
    const toY = (v) => PAD.top  + (1 - v / AXIS) * pH;

    // Clear
    area.innerHTML = '';

    // ── Stage bands ─────────────────────────────────────────────
    for (const b of STAGE_Y_BANDS) {
      const by1 = PAD.top + (1 - b.yMax / AXIS) * pH;
      const by2 = PAD.top + (1 - b.yMin / AXIS) * pH;
      const band = document.createElement('div');
      band.style.cssText = `position:absolute;left:${PAD.left}px;top:${by1}px;width:${pW}px;height:${by2 - by1}px;background:${b.color};pointer-events:none;`;
      area.appendChild(band);
      const bl = document.createElement('div');
      bl.className = styles.bandLabel;
      bl.style.cssText = `position:absolute;left:2px;top:${by1 + (by2 - by1) / 2 - 6}px;width:${PAD.left - 6}px;font-size:7px;letter-spacing:1px;text-align:right;padding-right:4px;color:${b.label.includes('\u2605') || b.label.includes('3') ? 'rgba(0,245,200,0.5)' : 'rgba(140,165,185,0.3)'};`;
      bl.textContent = b.label.split('/')[0].trim();
      area.appendChild(bl);
    }

    // ── Grid ────────────────────────────────────────────────────
    for (let i = 0; i <= AXIS; i++) {
      const f = i / AXIS;
      const hl = document.createElement('div');
      hl.className = styles.gridH;
      hl.style.top = (PAD.top + (1 - f) * pH) + 'px';
      area.appendChild(hl);
      const vl = document.createElement('div');
      vl.className = styles.gridV;
      vl.style.left = (PAD.left + f * pW) + 'px';
      area.appendChild(vl);
      // X tick
      const xt = document.createElement('div');
      xt.className = styles.tickLbl;
      xt.style.cssText = `bottom:${PAD.bottom - 14}px;left:${PAD.left + f * pW - 5}px;`;
      xt.textContent = String(i);
      area.appendChild(xt);
      // Y tick
      const yt = document.createElement('div');
      yt.className = styles.tickLbl;
      yt.style.cssText = `top:${PAD.top + (1 - f) * pH - 7}px;left:${PAD.left - 20}px;`;
      yt.textContent = String(i);
      area.appendChild(yt);
    }

    // ── Force separation ────────────────────────────────────────
    const jit = rawData.map(d => ({ ...d }));
    const rs  = jit.map(d => 12 + d.size * 4.5);
    for (let it = 0; it < 60; it++) {
      for (let i = 0; i < jit.length; i++) {
        for (let j = i + 1; j < jit.length; j++) {
          const px = toX(jit[i].x), py = toY(jit[i].y);
          const qx = toX(jit[j].x), qy = toY(jit[j].y);
          const dx = px - qx, dy = py - qy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
          const minD = rs[i] + rs[j] + 3;
          if (dist < minD) {
            const ov = (minD - dist) / 2, nx = dx / dist, ny = dy / dist;
            jit[i].x = Math.max(0.2, Math.min(9.95, jit[i].x + nx * ov / (pW / AXIS) * 0.5));
            jit[i].y = Math.max(0.2, Math.min(9.95, jit[i].y + ny * ov / (pH / AXIS) * 0.5));
            jit[j].x = Math.max(0.2, Math.min(9.95, jit[j].x - nx * ov / (pW / AXIS) * 0.5));
            jit[j].y = Math.max(0.2, Math.min(9.95, jit[j].y - ny * ov / (pH / AXIS) * 0.5));
          }
        }
      }
    }

    // ── Bubbles + labels ────────────────────────────────────────
    const placed = [];

    jit.forEach((d, i) => {
      const orig  = rawData[i];
      const cx    = toX(d.x), cy = toY(d.y);
      const r     = rs[i];
      const color = COLOR_MAP[orig.cat] || '#888';
      const vis   = isVisible(orig);
      const sdim  = isStageDim(orig);

      const bubble = document.createElement('div');
      bubble.className = styles.bubble + (!vis ? ' ' + styles.dimmed : sdim ? ' ' + styles.stageDim : '');
      bubble.style.cssText = `left:${cx - r}px;top:${cy - r}px;width:${r * 2}px;height:${r * 2}px;background:radial-gradient(circle at 35% 30%,${color}cc,${color}44);box-shadow:0 0 ${r * 0.8}px ${color}33,inset 0 0 ${r * 0.4}px ${color}22;border-color:${color}55;`;

      bubble.addEventListener('mouseenter', (e) => showTooltip(e, orig, color));
      bubble.addEventListener('mousemove',  (e) => moveTooltip(e));
      bubble.addEventListener('mouseleave', hideTooltip);
      area.appendChild(bubble);
      placed.push({ cx, cy, r, abbr: orig.abbr, color, bubble, vis, sdim });
    });

    // ── Smart label placement ────────────────────────────────────
    const LH = 13, gap = 4;
    const labelBoxes = [];
    const lw = (txt) => txt.length * 6 + 10;

    const overlapsB = (lx, ly, lw_, lh) => {
      for (const b of placed) {
        const ncx = Math.max(b.cx - b.r, Math.min(b.cx + b.r, lx + lw_ / 2));
        const ncy = Math.max(b.cy - b.r, Math.min(b.cy + b.r, ly + lh / 2));
        const dx = lx + lw_ / 2 - ncx, dy = ly + lh / 2 - ncy;
        if (Math.sqrt(dx * dx + dy * dy) < b.r * 0.65) return true;
      }
      return false;
    };
    const overlapsL = (lx, ly, lw_, lh) => {
      for (const b of labelBoxes) {
        if (lx < b.x + b.w + 2 && lx + lw_ > b.x - 2 && ly < b.y + b.h + 2 && ly + lh > b.y - 2) return true;
      }
      return false;
    };
    const inBounds = (lx, ly, lw_, lh) =>
      lx >= PAD.left && ly >= PAD.top && lx + lw_ <= W - PAD.right && ly + lh <= H - PAD.bottom;
    const scorePos = (lx, ly, lw_, lh) => {
      if (!inBounds(lx, ly, lw_, lh)) return 9999;
      let s = 0;
      if (overlapsL(lx, ly, lw_, lh)) s += 80;
      if (overlapsB(lx, ly, lw_, lh)) s += 40;
      return s;
    };

    if (labelsOn) {
      for (const item of placed) {
        const { cx, cy, r, abbr, color, bubble, vis, sdim } = item;
        if (!vis) continue;
        const lw_ = lw(abbr);
        const abbrLen = abbr.replace(/[^a-zA-Z0-9.]/g, '').length;

        if (r >= 38 || (r >= 30 && abbrLen <= 8)) {
          const lbl = document.createElement('div');
          lbl.className = styles.bubbleLabel;
          lbl.style.opacity = sdim ? '0.25' : '1';
          lbl.style.fontSize = r >= 42 ? '9px' : r >= 35 ? '8px' : '7.5px';
          lbl.textContent = abbr;
          bubble.appendChild(lbl);
          continue;
        }

        const cands = [
          { lx: cx - lw_ / 2,    ly: cy - r - LH - gap },
          { lx: cx - lw_ / 2,    ly: cy + r + gap },
          { lx: cx - r * 0.6 - lw_, ly: cy - r * 0.8 - LH },
          { lx: cx + r * 0.6,    ly: cy - r * 0.8 - LH },
          { lx: cx - r * 0.6 - lw_, ly: cy + r * 0.8 },
          { lx: cx + r * 0.6,    ly: cy + r * 0.8 },
          { lx: cx - lw_ - gap,  ly: cy - LH / 2 },
          { lx: cx + r + gap,    ly: cy - LH / 2 },
        ];

        let best = cands[0], bs = Infinity;
        for (const c of cands) { const s = scorePos(c.lx, c.ly, lw_, LH); if (s < bs) { bs = s; best = c; } }
        let { lx, ly } = best;
        lx = Math.max(PAD.left + 1, Math.min(W - PAD.right - lw_ - 1, lx));
        ly = Math.max(PAD.top + 1,  Math.min(H - PAD.bottom - LH - 1, ly));

        const lcx = lx + lw_ / 2, lcy = ly + LH / 2;
        const ang = Math.atan2(lcy - cy, lcx - cx);
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;z-index:8;';
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(cx + Math.cos(ang) * (r + 1)));
        line.setAttribute('y1', String(cy + Math.sin(ang) * (r + 1)));
        line.setAttribute('x2', String(lcx));
        line.setAttribute('y2', String(lcy));
        line.setAttribute('stroke', color + '90');
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('stroke-dasharray', '3,2');
        svg.appendChild(line);
        area.appendChild(svg);

        const co = document.createElement('div');
        co.className = styles.bubbleCallout;
        co.textContent = abbr;
        co.style.left    = lx + 'px';
        co.style.top     = ly + 'px';
        co.style.color   = color;
        co.style.borderColor = color + '44';
        co.style.opacity = sdim ? '0.2' : '1';
        area.appendChild(co);
        labelBoxes.push({ x: lx, y: ly, w: lw_, h: LH });
      }
    }

    // ── Policy gap overlays ──────────────────────────────────────
    renderGaps(area, toX, toY);

    // ── Stats ────────────────────────────────────────────────────
    updateStats();

    return () => {
      bodyTipsRef.current.forEach(el => el.remove());
      bodyTipsRef.current = [];
    };
  }, [rawData, activeTrack, activeStage, activeCats, labelsOn, gapVis, isVisible, isStageDim, dimensions]);

  // ── Gap overlay renderer ─────────────────────────────────────────
  function renderGaps(area, toX, toY) {
    POLICY_GAPS.forEach(ov => {
      if (!gapVis[ov.id]) return;
      const x1px = toX(ov.x1), x2px = toX(ov.x2);
      const y1px = toY(ov.y2), y2px = toY(ov.y1);
      const rw = x2px - x1px, rh = y2px - y1px;

      const g = document.createElement('div');
      g.className = styles.policyOverlay;
      g.style.left = x1px + 'px'; g.style.top = y1px + 'px';
      g.style.width = rw + 'px';  g.style.height = rh + 'px';

      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg');
      svg.style.cssText = 'position:absolute;top:0;left:0;overflow:visible;';
      svg.setAttribute('width', String(rw));
      svg.setAttribute('height', String(rh));

      const bg = document.createElementNS(ns, 'rect');
      bg.setAttribute('x','1'); bg.setAttribute('y','1');
      bg.setAttribute('width', String(rw-2)); bg.setAttribute('height', String(rh-2));
      bg.setAttribute('rx','4'); bg.setAttribute('fill', ov.color);
      bg.setAttribute('fill-opacity', String(ov.fillOpacity));
      svg.appendChild(bg);

      const bd = document.createElementNS(ns, 'rect');
      bd.setAttribute('x','1'); bd.setAttribute('y','1');
      bd.setAttribute('width', String(rw-2)); bd.setAttribute('height', String(rh-2));
      bd.setAttribute('rx','4'); bd.setAttribute('fill','none');
      bd.setAttribute('stroke', ov.color); bd.setAttribute('stroke-width','1.5');
      bd.setAttribute('stroke-dasharray', ov.dashPattern);
      bd.setAttribute('stroke-opacity','0.85');
      svg.appendChild(bd);

      const lblW = Math.min(ov.label.length * 6.8 + 16, rw - 12);
      const pillX = ov.labelPosition.right ? rw - lblW - 4 : 4;
      const pillY = ov.labelPosition.top   ? 4 : rh - 20;
      const pill = document.createElementNS(ns, 'rect');
      pill.setAttribute('x', String(pillX)); pill.setAttribute('y', String(pillY));
      pill.setAttribute('width', String(lblW)); pill.setAttribute('height','16');
      pill.setAttribute('rx','2'); pill.setAttribute('fill', ov.color);
      pill.setAttribute('fill-opacity','0.9');
      svg.appendChild(pill);

      const lbl = document.createElementNS(ns, 'text');
      lbl.setAttribute('x', ov.labelPosition.right ? String(rw - 10) : '10');
      lbl.setAttribute('y', ov.labelPosition.top ? '15.5' : String(rh - 6.5));
      lbl.setAttribute('text-anchor', ov.labelPosition.right ? 'end' : 'start');
      lbl.setAttribute('font-family','IBM Plex Mono,monospace');
      lbl.setAttribute('font-size','8'); lbl.setAttribute('font-weight','700');
      lbl.setAttribute('fill','#060a0d');
      lbl.textContent = ov.label;
      svg.appendChild(lbl);
      g.appendChild(svg);

      // Hover tooltip
      const tt = document.createElement('div');
      tt.className = styles.ovTooltip;
      tt.innerHTML = `<div style="color:${ov.color};font-weight:700;margin-bottom:6px;font-size:10px">${ov.label}</div><div style="font-size:9px;color:#8fa3b8;line-height:1.6">${ov.description}</div>`;
      document.body.appendChild(tt);
      bodyTipsRef.current.push(tt);

      g.addEventListener('mouseenter', (e) => {
        tt.style.display = 'block';
        tt.style.left = Math.min(e.clientX + 12, window.innerWidth - 300) + 'px';
        tt.style.top  = Math.min(e.clientY + 12, window.innerHeight - 140) + 'px';
      });
      g.addEventListener('mousemove', (e) => {
        tt.style.left = Math.min(e.clientX + 12, window.innerWidth - 300) + 'px';
        tt.style.top  = Math.min(e.clientY + 12, window.innerHeight - 140) + 'px';
      });
      g.addEventListener('mouseleave', () => { tt.style.display = 'none'; });

      area.appendChild(g);
    });
  }

  // ── Tooltip helpers ──────────────────────────────────────────────
  function showTooltip(e, d, color) {
    const tt = tooltipRef.current;
    if (!tt) return;
    tt.querySelector('#tt-name').textContent = d.name;
    tt.querySelector('#tt-name').style.color = color;
    tt.querySelector('#tt-type').textContent = d.type;
    tt.querySelector('#tt-track').textContent = `${d.track} \u00b7 ${STAGE_NAMES[d.stageN]}`;
    tt.querySelector('#tt-stage').textContent = `${d.stageN} / 3`;
    tt.querySelector('#tt-geo').textContent   = d.geo;
    tt.querySelector('#tt-fund').textContent  = d.funding;
    tt.querySelector('#tt-ind').textContent   = d.industry;
    tt.querySelector('#tt-web').textContent   = d.website;
    tt.querySelector('#tt-web').style.color   = color;
    const fill = tt.querySelector('#tt-stage-fill');
    fill.style.background = color;
    fill.style.width = ((d.stageN / 3) * 100) + '%';
    tt.classList.add(styles.ttVisible);
    moveTooltip(e);
  }
  function moveTooltip(e) {
    const tt = tooltipRef.current;
    if (!tt) return;
    let x = e.clientX + 16, y = e.clientY - 10;
    if (x + 340 > window.innerWidth)  x = e.clientX - 356;
    if (y + 320 > window.innerHeight) y = window.innerHeight - 330;
    tt.style.left = x + 'px'; tt.style.top = y + 'px';
  }
  function hideTooltip() {
    tooltipRef.current?.classList.remove(styles.ttVisible);
  }

  function updateStats() {
    // exposed via data attributes for parent components if needed
  }

  const toggleCat = (cat) => {
    setActiveCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const toggleGap = (id) => {
    setGapVis(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const setAllGaps = (on) => {
    setGapVis(Object.fromEntries(POLICY_GAPS.map(g => [g.id, on])));
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className={styles.wrap}>
      {/* Controls */}
      <div className={styles.controlBar}>
        <div className={styles.ctrlGroup}>
          <span className={styles.ctrlLabel}>DATASET</span>
          {['core', 'expanded'].map(d => (
            <button key={d} className={dataset === d ? styles.btnActive : styles.btn}
              onClick={() => setDataset(d)}>{d.toUpperCase()}</button>
          ))}
        </div>
        <div className={styles.ctrlGroup}>
          <span className={styles.ctrlLabel}>TRACK</span>
          {['ALL', 'IDE', 'SME', 'Hybrid'].map(t => (
            <button key={t} className={activeTrack === t ? styles.btnActive : styles.btn}
              onClick={() => setTrack(t)}>{t}</button>
          ))}
        </div>
        <div className={styles.ctrlGroup}>
          <span className={styles.ctrlLabel}>STAGE</span>
          {[null, 0, 1, 2, 3].map(s => (
            <button key={String(s)} className={activeStage === s ? styles.btnActive : styles.btn}
              onClick={() => setStage(s)}>{s === null ? 'ALL' : String(s)}</button>
          ))}
        </div>
        <button className={labelsOn ? styles.btnActive : styles.btn}
          onClick={() => setLabels(!labelsOn)}>LABELS</button>
      </div>

      {/* Main chart */}
      <div className={styles.plotOuter}>
        <div ref={areaRef} className={styles.chartArea} />
      </div>

      {/* Policy gap toggles */}
      <div className={styles.gapBar}>
        <span className={styles.ctrlLabel}>POLICY GAPS:</span>
        {POLICY_GAPS.map(g => (
          <button key={g.id}
            className={styles.gapBtn}
            style={{ borderColor: gapVis[g.id] ? g.color : g.color + '55',
                     color:       gapVis[g.id] ? g.color : g.color + '77',
                     background:  gapVis[g.id] ? g.color + '20' : 'transparent' }}
            onClick={() => toggleGap(g.id)}
            title={g.description}>{g.label}</button>
        ))}
        <button className={styles.btn} onClick={() => setAllGaps(true)}>+ ALL</button>
        <button className={styles.btn} onClick={() => setAllGaps(false)}>x CLR</button>
      </div>

      {/* Tooltip (fixed positioned) */}
      <div ref={tooltipRef} className={styles.tooltip}>
        <div className={styles.ttHead}>
          <div id="tt-name" className={styles.ttName}></div>
          <div id="tt-type" className={styles.ttType}></div>
          <div className={styles.ttBar}><div id="tt-stage-fill" className={styles.ttFill}></div></div>
        </div>
        <div className={styles.ttBody}>
          <div className={styles.ttRow}><span className={styles.ttK}>Track</span><span id="tt-track" className={styles.ttV}></span></div>
          <div className={styles.ttRow}><span className={styles.ttK}>Stage</span><span id="tt-stage" className={styles.ttV}></span></div>
          <div className={styles.ttRow}><span className={styles.ttK}>Geography</span><span id="tt-geo" className={styles.ttV}></span></div>
          <div className={styles.ttRow}><span className={styles.ttK}>Funding</span><span id="tt-fund" className={styles.ttV}></span></div>
          <div className={styles.ttDivider}></div>
          <div className={styles.ttK} style={{ marginBottom: 4 }}>Industry Focus</div>
          <div id="tt-ind" className={styles.ttInd}></div>
          <div className={styles.ttWeb}><span id="tt-web"></span></div>
        </div>
      </div>
    </div>
  );
}
