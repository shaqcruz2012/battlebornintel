import { useMemo } from 'react';
import { GOLD, CARD, BORDER, TEXT, MUTED, GREEN, BLUE, RED, ORANGE } from '../../styles/tokens.js';
import { computeForecast, computeRiskScore } from '../../engine/forecast.js';
import { getStageColors, getStageLabel } from '../../engine/formatters.js';
import { Gantt } from '../shared/Gantt.jsx';

const STAGE_ORDER = ["proposed", "queue", "nepa_review", "approved", "under_construction", "operational"];

function riskColor(score) {
  if (score >= 60) return RED;
  if (score >= 40) return ORANGE;
  if (score >= 20) return GOLD;
  return GREEN;
}

export default function ForecastView({ viewProps }) {
  const { config, data, setSelectedCompany } = viewProps;
  const companies = data.companies || [];
  const benchmarks = data.benchmarks;
  const sc = getStageColors(config);
  const sl = getStageLabel(config);

  const forecasts = useMemo(() => {
    if (!benchmarks) return [];
    return companies
      .filter(c => c.stage !== "operational" && c.stage !== "retired")
      .map(c => ({ company: c, forecast: computeForecast(c, benchmarks) }))
      .filter(f => f.forecast)
      .sort((a, b) => a.forecast.riskScore - b.forecast.riskScore);
  }, [companies, benchmarks]);

  // Stage funnel data
  const stageCounts = useMemo(() => {
    return STAGE_ORDER.map(s => {
      const inStage = companies.filter(c => c.stage === s);
      const totalMW = inStage.reduce((sum, c) => sum + (c.capacityMW || 0), 0);
      return { stage: s, count: inStage.length, totalMW };
    });
  }, [companies]);

  // Gantt rows
  const ganttRows = useMemo(() => {
    if (!benchmarks) return [];
    const now = new Date().toISOString().slice(0, 10);
    return forecasts.map(({ company: c, forecast: f }) => {
      const segments = [];
      // Current stage (completed portion)
      segments.push({
        start: `${c.founded}-01-01`,
        end: now,
        color: sc[c.stage] || MUTED,
        tooltip: sl(c.stage),
        opacity: 0.9,
      });
      // Projected stages
      (f.projectedTimeline || []).forEach(step => {
        segments.push({
          start: step.estStart,
          end: step.estEnd,
          color: sc[step.stage] || GOLD,
          tooltip: sl(step.stage),
          opacity: step.confidence > 60 ? 0.7 : 0.4,
        });
      });
      return { label: c.name, segments, company: c };
    });
  }, [forecasts, benchmarks, sc, sl]);

  if (!benchmarks) {
    return <div style={{ textAlign: "center", padding: 60, color: MUTED }}>No forecast benchmarks available</div>;
  }

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      {/* Stage funnel */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, marginBottom: 12 }}>PIPELINE FUNNEL</div>
        <div style={{ display: "flex", gap: 4, alignItems: "flex-end" }}>
          {stageCounts.map(s => {
            const maxCount = Math.max(...stageCounts.map(x => x.count), 1);
            const h = Math.max(s.count / maxCount * 80, 4);
            return (
              <div key={s.stage} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: sc[s.stage] || MUTED }}>{s.count}</div>
                <div style={{ height: h, background: (sc[s.stage] || MUTED) + "40", borderRadius: 3, margin: "4px auto", width: "80%" }} />
                <div style={{ fontSize: 8, color: MUTED, marginTop: 2 }}>{sl(s.stage)}</div>
                {s.totalMW > 0 && <div style={{ fontSize: 8, color: MUTED }}>{s.totalMW.toLocaleString()}MW</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Gantt timeline */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, marginBottom: 12 }}>PROJECTED TIMELINES</div>
        <div style={{ fontSize: 9, color: MUTED, marginBottom: 8 }}>
          Solid = completed · Translucent = projected · Dashed line = today
        </div>
        <Gantt
          rows={ganttRows}
          rowHeight={26}
          labelWidth={160}
          onRowClick={(row) => row.company && setSelectedCompany(row.company)}
        />
      </div>

      {/* Risk heatmap */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, marginBottom: 12 }}>RISK ASSESSMENT</div>
        {forecasts.map(({ company: c, forecast: f }) => (
          <div key={c.id} onClick={() => setSelectedCompany(c)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${BORDER}`, cursor: "pointer" }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: riskColor(f.riskScore) + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: riskColor(f.riskScore) }}>
              {f.riskScore}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
              <div style={{ fontSize: 10, color: MUTED }}>{sl(c.stage)} · {c.capacityMW ? c.capacityMW + "MW" : ""} · {f.stagesRemaining} stages remaining</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              {f.estimatedCOD && typeof f.estimatedCOD.median === "string" && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 600, color: TEXT }}>{f.estimatedCOD.median.slice(0, 7)}</div>
                  <div style={{ fontSize: 8, color: MUTED }}>est. COD</div>
                </>
              )}
            </div>
            {f.bottlenecks.length > 0 && (
              <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                {f.bottlenecks.slice(0, 2).map((b, i) => (
                  <span key={i} style={{ fontSize: 8, padding: "1px 5px", borderRadius: 3, background: RED + "15", color: RED }} title={b}>⚠</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* COD Calendar */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, marginBottom: 12 }}>ESTIMATED COD CALENDAR</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
          {forecasts
            .filter(({ forecast: f }) => f.estimatedCOD && typeof f.estimatedCOD.median === "string")
            .sort((a, b) => new Date(a.forecast.estimatedCOD.median) - new Date(b.forecast.estimatedCOD.median))
            .map(({ company: c, forecast: f }) => (
              <div key={c.id} onClick={() => setSelectedCompany(c)} style={{ background: "#0E0E0C", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 10, cursor: "pointer" }}>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9 }}>
                  <span style={{ color: GREEN }}>Best: {f.estimatedCOD.optimistic.slice(0, 7)}</span>
                  <span style={{ color: GOLD, fontWeight: 700 }}>{f.estimatedCOD.median.slice(0, 7)}</span>
                  <span style={{ color: RED }}>Worst: {f.estimatedCOD.pessimistic.slice(0, 7)}</span>
                </div>
                <div style={{ height: 4, background: "#1E1D1A", borderRadius: 2, marginTop: 4, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: "15%", right: "15%", top: 0, bottom: 0, background: GOLD + "40", borderRadius: 2 }} />
                  <div style={{ position: "absolute", left: "45%", width: 2, top: 0, bottom: 0, background: GOLD }} />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
