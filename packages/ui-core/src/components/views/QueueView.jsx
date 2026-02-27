import { useState, useMemo } from 'react';
import { GOLD, CARD, BORDER, TEXT, MUTED, GREEN, BLUE, RED, ORANGE, PURPLE } from '../../styles/tokens.js';

const STATUS_COLORS = {
  feasibility_study: MUTED, system_impact: BLUE, facilities_study: ORANGE,
  ia_executed: GREEN, withdrawn: RED,
};
const STATUS_LABELS = {
  feasibility_study: "Feasibility Study", system_impact: "System Impact Study",
  facilities_study: "Facilities Study", ia_executed: "IA Executed", withdrawn: "Withdrawn",
};

export default function QueueView({ viewProps }) {
  const { config, data, setSelectedCompany } = viewProps;
  const queue = data.queue || [];
  const companies = data.companies || [];

  const [sortBy, setSortBy] = useState("requestMW");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  if (!queue.length) {
    return <div style={{ textAlign: "center", padding: 60, color: MUTED }}>No interconnection queue data available</div>;
  }

  const types = [...new Set(queue.map(q => q.type))].sort();
  const statuses = [...new Set(queue.map(q => q.status))].sort();

  const filtered = useMemo(() => {
    let q = queue;
    if (filterType !== "all") q = q.filter(e => e.type === filterType);
    if (filterStatus !== "all") q = q.filter(e => e.status === filterStatus);
    return q.sort((a, b) => {
      if (sortBy === "requestMW") return b.requestMW - a.requestMW;
      if (sortBy === "date") return new Date(b.applicationDate) - new Date(a.applicationDate);
      if (sortBy === "status") return (statuses.indexOf(a.status) - statuses.indexOf(b.status));
      return 0;
    });
  }, [queue, filterType, filterStatus, sortBy]);

  const totalMW = queue.reduce((s, q) => s + q.requestMW, 0);
  const byStatus = {};
  queue.forEach(q => { byStatus[q.status] = (byStatus[q.status] || 0) + q.requestMW; });
  const byType = {};
  queue.forEach(q => { byType[q.type] = (byType[q.type] || 0) + q.requestMW; });

  // Substation congestion
  const substations = {};
  queue.forEach(q => {
    if (!substations[q.substation]) substations[q.substation] = { name: q.substation, totalMW: 0, count: 0 };
    substations[q.substation].totalMW += q.requestMW;
    substations[q.substation].count++;
  });
  const substationList = Object.values(substations).sort((a, b) => b.totalMW - a.totalMW);

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1 }}>TOTAL IN QUEUE</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: GOLD }}>{queue.length}</div>
          <div style={{ fontSize: 10, color: MUTED }}>{totalMW.toLocaleString()} MW</div>
        </div>
        {Object.entries(byStatus).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([s, mw]) => (
          <div key={s} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1 }}>{(STATUS_LABELS[s] || s).toUpperCase()}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: STATUS_COLORS[s] || MUTED }}>{Math.round(mw).toLocaleString()}</div>
            <div style={{ fontSize: 10, color: MUTED }}>MW</div>
          </div>
        ))}
      </div>

      {/* Substation congestion */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, marginBottom: 10 }}>SUBSTATION CONGESTION</div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
          {substationList.map(s => {
            const hc = s.totalMW >= 500 ? RED : s.totalMW >= 200 ? ORANGE : GOLD;
            return (
              <div key={s.name} style={{ flexShrink: 0, padding: "6px 10px", borderRadius: 6, background: hc + "12", border: `1px solid ${hc}30`, textAlign: "center", minWidth: 90 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: hc }}>{s.totalMW.toLocaleString()}</div>
                <div style={{ fontSize: 8, color: MUTED, marginTop: 1 }}>MW</div>
                <div style={{ fontSize: 8, color: MUTED }}>{s.name}</div>
                <div style={{ fontSize: 8, color: MUTED }}>{s.count} entries</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ background: CARD, border: `1px solid ${BORDER}`, color: TEXT, borderRadius: 6, padding: "4px 8px", fontSize: 10 }}>
          <option value="all">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ background: CARD, border: `1px solid ${BORDER}`, color: TEXT, borderRadius: 6, padding: "4px 8px", fontSize: 10 }}>
          <option value="all">All Status</option>
          {statuses.map(s => <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: CARD, border: `1px solid ${BORDER}`, color: TEXT, borderRadius: 6, padding: "4px 8px", fontSize: 10 }}>
          <option value="requestMW">Sort: MW (High→Low)</option>
          <option value="date">Sort: Date (Recent)</option>
          <option value="status">Sort: Status</option>
        </select>
      </div>

      {/* Queue table */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 100px 80px", gap: 0, padding: "8px 14px", borderBottom: `1px solid ${BORDER}`, fontSize: 9, color: MUTED, letterSpacing: 0.5 }}>
          <span>PROJECT</span><span>MW</span><span>TYPE</span><span>STATUS</span><span>EST COD</span>
        </div>
        {filtered.map(q => {
          const sc = STATUS_COLORS[q.status] || MUTED;
          const linkedCompany = q.projectId ? companies.find(c => c.id === q.projectId) : null;
          return (
            <div key={q.id}
              onClick={() => linkedCompany && setSelectedCompany(linkedCompany)}
              style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 100px 80px", gap: 0, padding: "10px 14px", borderBottom: `1px solid ${BORDER}`, cursor: linkedCompany ? "pointer" : "default", fontSize: 11 }}>
              <div>
                <div style={{ fontWeight: linkedCompany ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {q.projectName}
                  {linkedCompany && <span style={{ fontSize: 8, color: GOLD, marginLeft: 4 }}>●</span>}
                </div>
                <div style={{ fontSize: 9, color: MUTED }}>{q.substation} · {q.county}</div>
              </div>
              <span style={{ fontWeight: 700 }}>{q.requestMW}</span>
              <span style={{ fontSize: 10, color: MUTED }}>{q.type}</span>
              <span style={{ fontSize: 10, color: sc }}>{STATUS_LABELS[q.status] || q.status}</span>
              <span style={{ fontSize: 10, color: MUTED }}>{q.estimatedCOD ? q.estimatedCOD.slice(0, 7) : "—"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
