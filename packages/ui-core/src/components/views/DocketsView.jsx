import { useState } from 'react';
import { GOLD, CARD, BORDER, TEXT, MUTED, GREEN, BLUE, RED, PURPLE, ORANGE } from '../../styles/tokens.js';

const STATUS_COLORS = { open: BLUE, comment_period: ORANGE, hearing: PURPLE, decided: GREEN, remanded: RED };
const STATUS_LABELS = { open: "Open", comment_period: "Comment Period", hearing: "Hearing", decided: "Decided", remanded: "Remanded" };
const AGENCY_COLORS = { PUCN: GOLD, BLM: GREEN, FERC: BLUE };

function daysBetween(a, b) {
  if (!a || !b) return null;
  return Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
}

function daysUntil(d) {
  if (!d) return null;
  return daysBetween(new Date().toISOString().slice(0, 10), d);
}

export default function DocketsView({ viewProps }) {
  const { config, data, setSelectedCompany } = viewProps;
  const dockets = data.dockets || [];
  const companies = data.companies || [];

  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  if (!dockets.length) {
    return <div style={{ textAlign: "center", padding: 60, color: MUTED }}>No docket data available</div>;
  }

  const filtered = filter === "all" ? dockets : dockets.filter(d => d.agency === filter);
  const agencies = [...new Set(dockets.map(d => d.agency))];
  const openCount = dockets.filter(d => d.status !== "decided").length;
  const upcomingDeadlines = dockets.filter(d => d.nextDeadline && daysUntil(d.nextDeadline) > 0).sort((a, b) => new Date(a.nextDeadline) - new Date(b.nextDeadline));

  const selectedDocket = selected ? dockets.find(d => d.id === selected) : null;

  if (selectedDocket) {
    const sc = STATUS_COLORS[selectedDocket.status] || MUTED;
    const affectedProjects = companies.filter(c => (selectedDocket.projects || []).includes(c.id));
    const deadline = daysUntil(selectedDocket.nextDeadline);

    return (
      <div style={{ animation: "fadeIn 0.3s ease-out" }}>
        <button onClick={() => setSelected(null)} style={{ background: "none", border: `1px solid ${MUTED}40`, color: MUTED, borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 11, marginBottom: 16 }}>← All Dockets</button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: (AGENCY_COLORS[selectedDocket.agency] || MUTED) + "20", color: AGENCY_COLORS[selectedDocket.agency] || MUTED }}>{selectedDocket.agency}</span>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: sc + "20", color: sc }}>{STATUS_LABELS[selectedDocket.status] || selectedDocket.status}</span>
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>{selectedDocket.title}</h2>
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 16 }}>Docket {selectedDocket.id} · Opened {selectedDocket.openDate}</div>

        {deadline != null && deadline > 0 && (
          <div style={{ background: ORANGE + "12", border: `1px solid ${ORANGE}30`, borderRadius: 8, padding: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: ORANGE, letterSpacing: 1, marginBottom: 2 }}>NEXT DEADLINE</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: deadline <= 30 ? RED : ORANGE }}>{deadline} days</div>
            <div style={{ fontSize: 11, color: MUTED }}>{selectedDocket.nextDeadline}</div>
          </div>
        )}

        <div style={{ fontSize: 12, color: TEXT, lineHeight: 1.6, marginBottom: 16 }}>{selectedDocket.impact}</div>

        {/* Filing timeline */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, marginBottom: 12 }}>FILING TIMELINE</div>
          {(selectedDocket.filings || []).map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, paddingLeft: 12, borderLeft: `2px solid ${i === 0 ? GOLD : BORDER}` }}>
              <div>
                <div style={{ fontSize: 10, color: GOLD, fontWeight: 600 }}>{f.date}</div>
                <div style={{ fontSize: 10, color: MUTED }}>{f.filer} · {f.type}</div>
                <div style={{ fontSize: 11, color: TEXT, marginTop: 2 }}>{f.summary}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Affected projects */}
        {affectedProjects.length > 0 && (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, marginBottom: 10 }}>AFFECTED PROJECTS ({affectedProjects.length})</div>
            {affectedProjects.map(p => (
              <div key={p.id} onClick={() => setSelectedCompany(p)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${BORDER}`, cursor: "pointer" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: MUTED }}>{p.stage} · {p.city}</div>
                </div>
                {p.capacityMW && <span style={{ fontSize: 10, color: MUTED }}>{p.capacityMW}MW</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      {/* Summary bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1 }}>TOTAL DOCKETS</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: GOLD }}>{dockets.length}</div>
        </div>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1 }}>ACTIVE</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: BLUE }}>{openCount}</div>
        </div>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1 }}>NEXT DEADLINE</div>
          {upcomingDeadlines[0] ? (
            <>
              <div style={{ fontSize: 24, fontWeight: 700, color: daysUntil(upcomingDeadlines[0].nextDeadline) <= 30 ? RED : ORANGE }}>{daysUntil(upcomingDeadlines[0].nextDeadline)}d</div>
              <div style={{ fontSize: 9, color: MUTED }}>{upcomingDeadlines[0].title.slice(0, 30)}</div>
            </>
          ) : <div style={{ fontSize: 14, color: MUTED }}>None upcoming</div>}
        </div>
        {agencies.map(a => (
          <div key={a} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1 }}>{a}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: AGENCY_COLORS[a] || MUTED }}>{dockets.filter(d => d.agency === a).length}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        <button onClick={() => setFilter("all")} style={{ background: filter === "all" ? GOLD + "20" : "none", border: `1px solid ${filter === "all" ? GOLD : MUTED}40`, color: filter === "all" ? GOLD : MUTED, borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 10 }}>All</button>
        {agencies.map(a => (
          <button key={a} onClick={() => setFilter(a)} style={{ background: filter === a ? (AGENCY_COLORS[a] || MUTED) + "20" : "none", border: `1px solid ${filter === a ? AGENCY_COLORS[a] || MUTED : MUTED}40`, color: filter === a ? AGENCY_COLORS[a] || MUTED : MUTED, borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 10 }}>{a}</button>
        ))}
      </div>

      {/* Docket list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(d => {
          const sc = STATUS_COLORS[d.status] || MUTED;
          const deadline = daysUntil(d.nextDeadline);
          return (
            <div key={d.id} onClick={() => setSelected(d.id)} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14, cursor: "pointer", transition: "border-color 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: (AGENCY_COLORS[d.agency] || MUTED) + "20", color: AGENCY_COLORS[d.agency] || MUTED }}>{d.agency}</span>
                    <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: sc + "20", color: sc }}>{STATUS_LABELS[d.status] || d.status}</span>
                    <span style={{ fontSize: 9, color: MUTED }}>Dkt {d.id}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{d.title}</div>
                  <div style={{ fontSize: 10, color: MUTED }}>{(d.projects || []).length} projects affected · Last activity {d.lastActivity}</div>
                </div>
                {deadline != null && deadline > 0 && (
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: deadline <= 30 ? RED : deadline <= 90 ? ORANGE : MUTED }}>{deadline}d</div>
                    <div style={{ fontSize: 8, color: MUTED }}>deadline</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
