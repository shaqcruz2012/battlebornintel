import { useState, useMemo } from 'react';
import { ScoreExplainer } from '../shared/Onboarding.jsx';
import { GOLD, CARD, BORDER, TEXT, MUTED, GREEN, BLUE, RED, ORANGE, PURPLE } from '../../styles/tokens.js';
import { fmt } from '../../engine/formatters.js';

const TECH_COLORS = {
  "Solar+BESS": GOLD, "Solar": ORANGE, "BESS": BLUE,
  "Geothermal": GREEN, "Transmission": PURPLE, "Wind": "#06B6D4",
};

export default function PPAView({ viewProps }) {
  const { config, data, setSelectedCompany } = viewProps;
  const ppa = data.ppa || [];
  const companies = data.companies || [];

  const [sortBy, setSortBy] = useState("date");
  const [filterTech, setFilterTech] = useState("all");

  if (!ppa.length) {
    return <div style={{ textAlign: "center", padding: 60, color: MUTED }}>No PPA data available</div>;
  }

  const techs = [...new Set(ppa.map(p => p.technology))].sort();

  const filtered = useMemo(() => {
    let p = ppa;
    if (filterTech !== "all") p = p.filter(r => r.technology === filterTech);
    return p.sort((a, b) => {
      if (sortBy === "date") return new Date(b.executionDate || 0) - new Date(a.executionDate || 0);
      if (sortBy === "price") return (b.pricePerMWh || 0) - (a.pricePerMWh || 0);
      if (sortBy === "capacity") return (b.capacityMW || 0) - (a.capacityMW || 0);
      return 0;
    });
  }, [ppa, filterTech, sortBy]);

  const withPrice = ppa.filter(p => p.pricePerMWh);
  const avgPrice = withPrice.length ? Math.round(withPrice.reduce((s, p) => s + p.pricePerMWh, 0) / withPrice.length * 100) / 100 : null;
  const totalCapacity = ppa.reduce((s, p) => s + (p.capacityMW || 0), 0);

  // Buyer breakdown
  const buyers = {};
  ppa.forEach(p => {
    if (!buyers[p.buyer]) buyers[p.buyer] = { name: p.buyer, count: 0, totalMW: 0 };
    buyers[p.buyer].count++;
    buyers[p.buyer].totalMW += p.capacityMW || 0;
  });
  const buyerList = Object.values(buyers).sort((a, b) => b.totalMW - a.totalMW);

  // Tech breakdown
  const techStats = {};
  ppa.forEach(p => {
    if (!techStats[p.technology]) techStats[p.technology] = { name: p.technology, count: 0, totalMW: 0, prices: [] };
    techStats[p.technology].count++;
    techStats[p.technology].totalMW += p.capacityMW || 0;
    if (p.pricePerMWh) techStats[p.technology].prices.push(p.pricePerMWh);
  });

  // Price scatter data (simple bar representation since we're SVG)
  const priceData = withPrice
    .filter(p => p.executionDate)
    .sort((a, b) => new Date(a.executionDate) - new Date(b.executionDate));

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      {/* Header with Score Key */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: TEXT }}>PPA Benchmarks</div>
        <ScoreExplainer config={config} />
      </div>
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1 }}>TOTAL PPAS</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: GOLD }}>{ppa.length}</div>
        </div>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1 }}>CONTRACTED MW</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: GREEN }}>{totalCapacity.toLocaleString()}</div>
        </div>
        {avgPrice && (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1 }}>AVG $/MWh</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: BLUE }}>${avgPrice}</div>
            <div style={{ fontSize: 9, color: MUTED }}>{withPrice.length} disclosed</div>
          </div>
        )}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1 }}>BUYERS</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: PURPLE }}>{buyerList.length}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* Buyer breakdown */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, marginBottom: 10 }}>BUYER BREAKDOWN</div>
          {buyerList.map(b => {
            const pct = totalCapacity > 0 ? Math.round(b.totalMW / totalCapacity * 100) : 0;
            return (
              <div key={b.name} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                  <span>{b.name}</span>
                  <span style={{ color: GOLD }}>{b.totalMW.toLocaleString()} MW · {b.count} PPAs</span>
                </div>
                <div style={{ height: 4, background: "#1E1D1A", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: GOLD, borderRadius: 2 }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Technology breakdown */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, marginBottom: 10 }}>TECHNOLOGY MIX</div>
          {Object.values(techStats).sort((a, b) => b.totalMW - a.totalMW).map(t => {
            const pct = totalCapacity > 0 ? Math.round(t.totalMW / totalCapacity * 100) : 0;
            const avgP = t.prices.length ? Math.round(t.prices.reduce((s, p) => s + p, 0) / t.prices.length * 100) / 100 : null;
            const tc = TECH_COLORS[t.name] || MUTED;
            return (
              <div key={t.name} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                  <span style={{ color: tc }}>{t.name}</span>
                  <span style={{ color: MUTED }}>{t.totalMW.toLocaleString()} MW{avgP ? ` · $${avgP}/MWh` : ""}</span>
                </div>
                <div style={{ height: 4, background: "#1E1D1A", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: tc, borderRadius: 2 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Price chart (bar chart of disclosed prices) */}
      {priceData.length > 0 && (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, marginBottom: 10 }}>DISCLOSED PPA PRICING ($/MWh)</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
            {priceData.map(p => {
              const maxP = Math.max(...priceData.map(x => x.pricePerMWh));
              const h = (p.pricePerMWh / maxP) * 80;
              const tc = TECH_COLORS[p.technology] || GOLD;
              return (
                <div key={p.id} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: tc, marginBottom: 2 }}>${p.pricePerMWh}</div>
                  <div style={{ height: h, background: tc + "60", borderRadius: 3, margin: "0 auto", width: "70%" }} />
                  <div style={{ fontSize: 7, color: MUTED, marginTop: 2 }}>{p.project.split(" ")[0]}</div>
                  <div style={{ fontSize: 7, color: MUTED }}>{(p.executionDate || "").slice(0, 7)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters + table */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <select value={filterTech} onChange={e => setFilterTech(e.target.value)} style={{ background: CARD, border: `1px solid ${BORDER}`, color: TEXT, borderRadius: 6, padding: "4px 8px", fontSize: 10 }}>
          <option value="all">All Technologies</option>
          {techs.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: CARD, border: `1px solid ${BORDER}`, color: TEXT, borderRadius: 6, padding: "4px 8px", fontSize: 10 }}>
          <option value="date">Sort: Date</option>
          <option value="price">Sort: Price</option>
          <option value="capacity">Sort: Capacity</option>
        </select>
      </div>

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 70px 70px 70px", gap: 0, padding: "8px 14px", borderBottom: `1px solid ${BORDER}`, fontSize: 9, color: MUTED, letterSpacing: 0.5 }}>
          <span>PROJECT</span><span>BUYER</span><span>TECH</span><span>MW</span><span>$/MWh</span><span>TERM</span>
        </div>
        {filtered.map(p => {
          const linkedCompany = p.projectId ? companies.find(c => c.id === p.projectId) : null;
          const tc = TECH_COLORS[p.technology] || MUTED;
          return (
            <div key={p.id}
              onClick={() => linkedCompany && setSelectedCompany(linkedCompany)}
              style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 70px 70px 70px", gap: 0, padding: "10px 14px", borderBottom: `1px solid ${BORDER}`, cursor: linkedCompany ? "pointer" : "default", fontSize: 11 }}>
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: linkedCompany ? 600 : 400 }}>{p.project}</div>
              <span style={{ fontSize: 10, color: MUTED }}>{p.buyer}</span>
              <span style={{ fontSize: 10, color: tc }}>{p.technology}</span>
              <span style={{ fontWeight: 600 }}>{p.capacityMW || "—"}</span>
              <span style={{ color: p.pricePerMWh ? GREEN : MUTED }}>{p.pricePerMWh ? `$${p.pricePerMWh}` : "Conf."}</span>
              <span style={{ color: MUTED }}>{p.termYears ? `${p.termYears}yr` : "—"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
