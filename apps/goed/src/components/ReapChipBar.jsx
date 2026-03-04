import { REAP_PILLARS } from "@bbi/ui-core/reap";
import { BORDER, MUTED } from "@bbi/ui-core";

const ReapChipBar = ({ reapFilter, setReapFilter }) => (
  <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
    {REAP_PILLARS.map(p => (
      <button key={p.id} onClick={() => setReapFilter(p.id)}
        style={{
          padding:"5px 12px", borderRadius:20, fontSize:10, fontWeight:600, cursor:"pointer",
          border:`1px solid ${reapFilter === p.id ? p.color+"60" : BORDER}`,
          background: reapFilter === p.id ? p.color+"18" : "transparent",
          color: reapFilter === p.id ? p.color : MUTED,
          transition:"all 0.15s"
        }}>
        {p.icon} {p.label}
      </button>
    ))}
  </div>
);

export default ReapChipBar;
