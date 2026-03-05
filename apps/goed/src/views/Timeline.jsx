import { useState } from "react";
import { useApi } from "../hooks/useApi.js";
import { BORDER, MUTED, GOLD, GREEN, BLUE, ORANGE, PURPLE, TEXT, fadeIn } from "@bbi/ui-core";
import { getConfidenceTier } from "@bbi/ui-core";

export default function Timeline({ isMobile, isTablet, setSelectedCompany, setView, fundParam }) {
  const { data: events } = useApi("/timeline" + fundParam);
  const [expandedSource, setExpandedSource] = useState(null);

  if (!events) return <div style={{ padding: 40, textAlign: "center", color: MUTED }}>Loading timeline...</div>;

  const typeColor = (type) =>
    type === "funding" ? GREEN : type === "grant" ? BLUE : type === "momentum" ? GOLD :
    type === "hiring" ? ORANGE : type === "patent" ? PURPLE : MUTED;

  return (
    <div style={fadeIn}>
      <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>
        Ecosystem Activity Feed
      </div>
      <div style={{ borderLeft: `2px solid ${BORDER}`, marginLeft: isMobile ? 10 : 20, paddingLeft: isMobile ? 16 : 24 }}>
        {events.map((ev, i) => {
          const tier = ev.confidence != null ? getConfidenceTier(ev.confidence) : null;
          const isVerified = ev.verified === 1;
          const isExpanded = expandedSource === i;

          return (
            <div key={ev.id || i} style={{ position: "relative", marginBottom: 18, paddingBottom: 4, ...fadeIn }}>
              <div style={{
                position: "absolute", left: isMobile ? -25 : -33, top: 4,
                width: 16, height: 16, borderRadius: "50%", background: "#111110",
                border: `2px solid ${typeColor(ev.type)}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9,
              }}>{ev.icon}</div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, color: MUTED }}>{ev.date}</span>
                {tier && !isVerified && (
                  <span
                    onClick={() => setExpandedSource(isExpanded ? null : i)}
                    style={{ cursor: "pointer", fontSize: 9, color: tier.color }}
                    title={`${tier.label} confidence (${ev.confidence})`}
                  >
                    {tier.icon}
                  </span>
                )}
                {isVerified && tier && tier.min >= 0.85 && (
                  <span style={{ fontSize: 9, color: "#4E9B60" }} title="Verified">✅</span>
                )}
              </div>

              <div style={{ fontSize: 13, fontWeight: 600 }}>{ev.company}</div>
              <div style={{ fontSize: 12, color: TEXT }}>{ev.detail}</div>

              {ev.amount && (
                <span style={{ fontSize: 10, color: GREEN, fontWeight: 600 }}>
                  ${ev.amount >= 1000 ? `${(ev.amount/1000).toFixed(1)}B` : `${ev.amount}M`}
                  {ev.round_type && ` · ${ev.round_type.replace("_", " ")}`}
                </span>
              )}

              {isExpanded && ev.source_url && (
                <div style={{ marginTop: 4, padding: 8, background: "#111110", borderRadius: 6, border: `1px solid ${BORDER}`, fontSize: 10 }}>
                  <div style={{ color: MUTED, marginBottom: 2 }}>Source:</div>
                  <a href={ev.source_url} target="_blank" rel="noopener noreferrer"
                     style={{ color: BLUE, textDecoration: "none", wordBreak: "break-all" }}>
                    {ev.source_url.length > 60 ? ev.source_url.slice(0, 60) + "..." : ev.source_url}
                  </a>
                  <div style={{ color: MUTED, marginTop: 4 }}>
                    Agent: {ev.agent_id || "seed"} · Confidence: {ev.confidence}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
