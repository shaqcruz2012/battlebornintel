import { GP, NODE_CFG, GSTAGE_C } from "@bbi/ui-core/constants";
import { stageLabel, fmt, getConfidenceTier } from "@bbi/ui-core";

export default function GraphHoverPanel({ node, position, isMobile, onPin }) {
  if (!node) return null;

  const { type } = node;
  const tier = node.confidence != null ? getConfidenceTier(node.confidence) : null;

  const panelStyle = isMobile
    ? {
        marginTop: 8, padding: 14, background: GP.surface,
        borderRadius: 10, border: `1px solid ${GP.border}`,
        animation: "fadeIn 0.15s ease-out",
      }
    : {
        position: "absolute",
        left: Math.min(position.x + 16, 360),
        top: Math.max(position.y - 20, 10),
        width: 280, padding: 14, background: GP.surface,
        borderRadius: 10, border: `1px solid ${GP.border}`,
        boxShadow: `0 8px 32px ${GP.bg}CC`,
        zIndex: 100, pointerEvents: "auto",
        animation: "fadeIn 0.15s ease-out",
      };

  return (
    <div style={panelStyle} onClick={onPin}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 16 }}>{NODE_CFG[type]?.icon || "\u25CE"}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: GP.text }}>{node.label}</div>
          <div style={{ fontSize: 9, color: NODE_CFG[type]?.color || GP.muted, textTransform: "uppercase", letterSpacing: 1 }}>
            {NODE_CFG[type]?.label || type}
            {tier && <span style={{ marginLeft: 6, color: tier.color }}>{tier.icon}</span>}
          </div>
        </div>
      </div>

      {/* Company details */}
      {type === "company" && (
        <>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {node.stage && (
              <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: (GSTAGE_C[node.stage] || GP.muted) + "20", color: GSTAGE_C[node.stage] || GP.muted, border: `1px solid ${(GSTAGE_C[node.stage] || GP.muted)}30` }}>
                {stageLabel(node.stage)}
              </span>
            )}
            {node.city && <span style={{ fontSize: 9, color: GP.muted }}>{node.city}</span>}
            {node.founded && <span style={{ fontSize: 9, color: GP.muted }}>Est. {node.founded}</span>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
            <Metric label="Funding" value={node.funding ? fmt(node.funding) : "\u2014"} color={GP.green} />
            <Metric label="Momentum" value={node.momentum || "\u2014"} color={node.momentum > 75 ? GP.green : GP.gold} />
            <Metric label="People" value={node.employees || "\u2014"} color={GP.blue} />
          </div>
          {node.sector && node.sector.length > 0 && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
              {(Array.isArray(node.sector) ? node.sector : []).slice(0, 3).map(s => (
                <span key={s} style={{ fontSize: 8, padding: "1px 6px", borderRadius: 3, background: GP.blue + "15", color: GP.blue }}>{s}</span>
              ))}
            </div>
          )}
          {node.eligible && node.eligible.length > 0 && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {(Array.isArray(node.eligible) ? node.eligible : []).map(e => (
                <span key={e} style={{ fontSize: 8, padding: "1px 6px", borderRadius: 3, background: GP.green + "15", color: GP.green }}>{"\u2713"} {e.toUpperCase()}</span>
              ))}
            </div>
          )}
        </>
      )}

      {/* Fund details */}
      {type === "fund" && (
        <>
          {node.etype && <div style={{ fontSize: 10, color: GP.muted, marginBottom: 6 }}>{node.etype}</div>}
          {node.note && <div style={{ fontSize: 10, color: GP.text, lineHeight: 1.4, marginBottom: 6 }}>{node.note}</div>}
        </>
      )}

      {/* Entity details (everything else) */}
      {type !== "company" && type !== "fund" && (
        <>
          {node.etype && <div style={{ fontSize: 10, color: GP.muted, marginBottom: 4 }}>{node.etype}</div>}
          {node.role && <div style={{ fontSize: 10, color: GP.text, marginBottom: 4 }}>{node.role}</div>}
          {node.city && <div style={{ fontSize: 9, color: GP.muted, marginBottom: 4 }}>{node.city}</div>}
          {node.note && <div style={{ fontSize: 10, color: GP.text, lineHeight: 1.4 }}>{node.note}</div>}
        </>
      )}

      {!isMobile && (
        <div style={{ fontSize: 8, color: GP.dim, marginTop: 8, textAlign: "center" }}>Click to pin</div>
      )}
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 8, color: GP.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
