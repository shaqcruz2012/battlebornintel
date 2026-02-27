import { useState, useEffect } from 'react';
import { GOLD, CARD, BORDER, TEXT, MUTED, GREEN, BLUE, RED, ORANGE } from '../../styles/tokens.js';

const ALERT_TYPES = [
  { id: "docket_activity", label: "Docket Activity", description: "New filings on tracked dockets", icon: "⚖", color: GOLD },
  { id: "stage_change", label: "Stage Change", description: "Project advances to next stage", icon: "📊", color: GREEN },
  { id: "deadline_warning", label: "Deadline Warning", description: "Approaching docket deadlines", icon: "⏰", color: ORANGE },
  { id: "price_alert", label: "Price Alert", description: "PPA pricing outside threshold", icon: "💰", color: BLUE },
  { id: "queue_movement", label: "Queue Movement", description: "Interconnection queue status change", icon: "🔌", color: "#06B6D4" },
  { id: "risk_change", label: "Risk Change", description: "Project risk score changes significantly", icon: "⚠", color: RED },
];

const STORAGE_KEY = "bbi-esint-alerts";

function loadAlerts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { rules: [], log: [] };
  } catch { return { rules: [], log: [] }; }
}

function saveAlerts(alerts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

export default function AlertsView({ viewProps }) {
  const { config, data } = viewProps;
  const [alerts, setAlerts] = useState(loadAlerts);
  const [showCreate, setShowCreate] = useState(false);
  const [newType, setNewType] = useState("docket_activity");
  const [newThreshold, setNewThreshold] = useState("");
  const [newProjects, setNewProjects] = useState("all");
  const [tab, setTab] = useState("rules");

  useEffect(() => { saveAlerts(alerts); }, [alerts]);

  const companies = data.companies || [];
  const dockets = data.dockets || [];

  // Generate simulated alert log based on current data
  const generatedLog = [];
  // Upcoming deadlines
  dockets.forEach(d => {
    if (d.nextDeadline) {
      const days = Math.round((new Date(d.nextDeadline) - new Date()) / (1000 * 60 * 60 * 24));
      if (days > 0 && days <= 90) {
        generatedLog.push({
          type: "deadline_warning",
          message: `${d.title} — deadline in ${days} days (${d.nextDeadline})`,
          date: new Date().toISOString().slice(0, 10),
          severity: days <= 14 ? "high" : days <= 30 ? "medium" : "low",
        });
      }
    }
  });
  // Recent docket filings (last 90 days)
  dockets.forEach(d => {
    (d.filings || []).forEach(f => {
      const days = Math.round((new Date() - new Date(f.date)) / (1000 * 60 * 60 * 24));
      if (days >= 0 && days <= 90) {
        generatedLog.push({
          type: "docket_activity",
          message: `${d.title} — ${f.filer}: ${f.type} (${f.date})`,
          date: f.date,
          severity: "low",
        });
      }
    });
  });
  // High-risk projects
  companies.forEach(c => {
    if ((c.riskFactors || []).length >= 3) {
      generatedLog.push({
        type: "risk_change",
        message: `${c.name} has ${c.riskFactors.length} active risk factors`,
        date: new Date().toISOString().slice(0, 10),
        severity: "high",
      });
    }
  });

  const allLog = [...generatedLog, ...(alerts.log || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

  function addRule() {
    const rule = {
      id: Date.now().toString(),
      type: newType,
      threshold: newThreshold || null,
      projects: newProjects,
      createdAt: new Date().toISOString().slice(0, 10),
      enabled: true,
    };
    setAlerts(a => ({ ...a, rules: [...a.rules, rule] }));
    setShowCreate(false);
    setNewType("docket_activity");
    setNewThreshold("");
    setNewProjects("all");
  }

  function removeRule(id) {
    setAlerts(a => ({ ...a, rules: a.rules.filter(r => r.id !== id) }));
  }

  function toggleRule(id) {
    setAlerts(a => ({
      ...a,
      rules: a.rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r),
    }));
  }

  const SEVERITY_COLORS = { high: RED, medium: ORANGE, low: MUTED };

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1 }}>ACTIVE RULES</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: GOLD }}>{alerts.rules.filter(r => r.enabled).length}</div>
        </div>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1 }}>HIGH SEVERITY</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: RED }}>{allLog.filter(l => l.severity === "high").length}</div>
        </div>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1 }}>RECENT ALERTS</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: BLUE }}>{allLog.length}</div>
          <div style={{ fontSize: 9, color: MUTED }}>last 90 days</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        <button onClick={() => setTab("rules")} style={{ background: tab === "rules" ? GOLD + "20" : "none", border: `1px solid ${tab === "rules" ? GOLD : MUTED}40`, color: tab === "rules" ? GOLD : MUTED, borderRadius: 6, padding: "6px 16px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>Alert Rules</button>
        <button onClick={() => setTab("log")} style={{ background: tab === "log" ? GOLD + "20" : "none", border: `1px solid ${tab === "log" ? GOLD : MUTED}40`, color: tab === "log" ? GOLD : MUTED, borderRadius: 6, padding: "6px 16px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>Alert Log ({allLog.length})</button>
      </div>

      {tab === "rules" && (
        <div>
          <button onClick={() => setShowCreate(!showCreate)} style={{ background: GOLD + "15", border: `1px solid ${GOLD}40`, color: GOLD, borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 11, fontWeight: 600, marginBottom: 16 }}>
            + New Alert Rule
          </button>

          {showCreate && (
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, marginBottom: 10 }}>CREATE ALERT RULE</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <select value={newType} onChange={e => setNewType(e.target.value)} style={{ background: "#0E0E0C", border: `1px solid ${BORDER}`, color: TEXT, borderRadius: 6, padding: "6px 10px", fontSize: 11, flex: 1 }}>
                  {ALERT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label} — {t.description}</option>)}
                </select>
              </div>
              {(newType === "price_alert") && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 10, color: MUTED }}>Threshold ($/MWh)</label>
                  <input value={newThreshold} onChange={e => setNewThreshold(e.target.value)} placeholder="e.g., 40" style={{ display: "block", width: "100%", marginTop: 4, background: "#0E0E0C", border: `1px solid ${BORDER}`, color: TEXT, borderRadius: 6, padding: "6px 10px", fontSize: 11 }} />
                </div>
              )}
              {(newType === "deadline_warning") && (
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 10, color: MUTED }}>Days before deadline</label>
                  <input value={newThreshold} onChange={e => setNewThreshold(e.target.value)} placeholder="e.g., 30" style={{ display: "block", width: "100%", marginTop: 4, background: "#0E0E0C", border: `1px solid ${BORDER}`, color: TEXT, borderRadius: 6, padding: "6px 10px", fontSize: 11 }} />
                </div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={addRule} style={{ background: GREEN + "20", border: `1px solid ${GREEN}40`, color: GREEN, borderRadius: 6, padding: "6px 16px", cursor: "pointer", fontSize: 11 }}>Create Rule</button>
                <button onClick={() => setShowCreate(false)} style={{ background: "none", border: `1px solid ${MUTED}40`, color: MUTED, borderRadius: 6, padding: "6px 16px", cursor: "pointer", fontSize: 11 }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Alert type cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8, marginBottom: 16 }}>
            {ALERT_TYPES.map(t => {
              const count = alerts.rules.filter(r => r.type === t.id && r.enabled).length;
              return (
                <div key={t.id} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14 }}>{t.icon}</span>
                    <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: count > 0 ? t.color + "20" : "transparent", color: count > 0 ? t.color : MUTED }}>{count} active</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>{t.label}</div>
                  <div style={{ fontSize: 10, color: MUTED }}>{t.description}</div>
                </div>
              );
            })}
          </div>

          {/* Rules list */}
          {alerts.rules.length > 0 && (
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, marginBottom: 10 }}>YOUR RULES</div>
              {alerts.rules.map(r => {
                const typeInfo = ALERT_TYPES.find(t => t.id === r.type) || {};
                return (
                  <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${BORDER}` }}>
                    <div>
                      <span style={{ fontSize: 12, marginRight: 6 }}>{typeInfo.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, opacity: r.enabled ? 1 : 0.4 }}>{typeInfo.label}</span>
                      {r.threshold && <span style={{ fontSize: 10, color: MUTED, marginLeft: 6 }}>threshold: {r.threshold}</span>}
                      <div style={{ fontSize: 9, color: MUTED }}>Created {r.createdAt}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => toggleRule(r.id)} style={{ background: "none", border: `1px solid ${r.enabled ? GREEN : MUTED}40`, color: r.enabled ? GREEN : MUTED, borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontSize: 9 }}>
                        {r.enabled ? "ON" : "OFF"}
                      </button>
                      <button onClick={() => removeRule(r.id)} style={{ background: "none", border: `1px solid ${RED}40`, color: RED, borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontSize: 9 }}>×</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "log" && (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, marginBottom: 10 }}>ALERT LOG</div>
          {allLog.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: MUTED }}>No alerts triggered</div>
          ) : (
            allLog.slice(0, 50).map((l, i) => {
              const typeInfo = ALERT_TYPES.find(t => t.id === l.type) || {};
              return (
                <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: SEVERITY_COLORS[l.severity] || MUTED, marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 11, color: TEXT }}>{l.message}</div>
                    <div style={{ fontSize: 9, color: MUTED }}>{typeInfo.icon} {typeInfo.label} · {l.date}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
