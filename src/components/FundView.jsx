import { useState } from "react";
import FUNDS from '../data/funds.json';
import { GOLD, DARK, CARD, BORDER, TEXT, MUTED, GREEN, BLUE, PURPLE, STAGE_COLORS, fadeIn } from "../lib/constants";
import { fmt, stageLabel } from "../lib/formatters";
import { Stat, Grade } from "./shared";

export default function FundView({ allScored, isMobile, setSelectedCompany }) {
  const [fundDetail, setFundDetail] = useState(null);

  if (fundDetail) {
    return (
      <div style={{ ...fadeIn }}>
        <button onClick={() => setFundDetail(null)} style={{ background:"none", border:"none", color:GOLD, fontSize:12, cursor:"pointer", marginBottom:12, padding:0 }}>← All Funds</button>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
          <div style={{ fontSize: isMobile ? 20 : 26, fontWeight:800, color:TEXT }}>{fundDetail.name}</div>
          {fundDetail.type === "SSBCI" && <span style={{ fontSize:10, padding:"3px 10px", borderRadius:20, background:PURPLE+"20", color:PURPLE, fontWeight:700 }}>SSBCI</span>}
        </div>
        {fundDetail.thesis && <div style={{ fontSize:12, color:MUTED, fontStyle:"italic", marginBottom:16 }}>"{fundDetail.thesis}"</div>}
        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap:10, marginBottom:20 }}>
          <Stat label="Portfolio Cos" value={fundDetail.companies} />
          <Stat label="Deployed" value={fmt(fundDetail.deployed)} color={GREEN} />
          {fundDetail.allocated && <Stat label="Utilization" value={`${Math.round(fundDetail.deployed/fundDetail.allocated*100)}%`} color={BLUE} />}
          {fundDetail.leverage && <Stat label="Leverage" value={`${fundDetail.leverage}x`} color={GOLD} />}
        </div>
        <div style={{ fontSize:13, fontWeight:700, color:TEXT, marginBottom:10 }}>Eligible Pipeline</div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {allScored.filter(c => c.eligible.includes(fundDetail.id)).sort((a,b) => b.irs - a.irs).map(c => (
            <div key={c.id} onClick={() => setSelectedCompany(c)} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:8, padding:"10px 14px", display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
              <Grade grade={c.grade} size="sm" />
              <div style={{ flex:1, minWidth:0 }}>
                <span style={{ fontSize:12, fontWeight:700, color:TEXT }}>{c.name}</span>
                <span style={{ fontSize:9, color:MUTED, marginLeft:6 }}>{stageLabel(c.stage)} · {c.sector.slice(0,2).join(", ")}</span>
              </div>
              <span style={{ fontSize:11, color:GREEN }}>{fmt(c.funding)}</span>
              <span style={{ fontSize:14, fontWeight:700, color:GOLD }}>{c.irs}</span>
            </div>
          ))}
          {allScored.filter(c => c.eligible.includes(fundDetail.id)).length === 0 && (
            <div style={{ padding:20, textAlign:"center", color:MUTED, fontSize:12 }}>No companies with {fundDetail.name} eligibility in current dataset</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={fadeIn}>
      <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:16 }}>Fund & Program Performance</div>
      <div style={{ display:"grid", gap:10 }}>
        {FUNDS.map(f => {
          const portCos = allScored.filter(c => c.eligible.includes(f.id));
          const avgIRS = portCos.length ? Math.round(portCos.reduce((s,c) => s+c.irs,0)/portCos.length) : 0;
          return (
          <div key={f.id} onClick={() => setFundDetail(f)} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding: isMobile ? 14 : 20, cursor:"pointer", transition:"border-color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = GOLD+"50"} onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <div>
                <div style={{ fontSize:15, fontWeight:700 }}>{f.name}</div>
                <div style={{ fontSize:11, color:MUTED }}>{f.type} · {f.companies} portfolio cos · Avg IRS {avgIRS}</div>
              </div>
              {f.type === "SSBCI" && <span style={{ fontSize:9, padding:"3px 8px", borderRadius:4, background:PURPLE+"20", color:PURPLE, fontWeight:600 }}>SSBCI</span>}
            </div>
            {f.thesis && <div style={{ fontSize:10, color:MUTED, fontStyle:"italic", marginBottom:10 }}>"{f.thesis}"</div>}
            <div style={{ display:"grid", gridTemplateColumns: f.allocated ? (isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr") : "1fr 1fr", gap: isMobile ? 8 : 16 }}>
              {f.allocated && <>
                <div>
                  <div style={{ fontSize:9, color:MUTED }}>ALLOCATED</div>
                  <div style={{ fontSize:16, fontWeight:700, color:BLUE }}>{fmt(f.allocated)}</div>
                </div>
                <div>
                  <div style={{ fontSize:9, color:MUTED }}>DEPLOYED</div>
                  <div style={{ fontSize:16, fontWeight:700, color:GREEN }}>{fmt(f.deployed)}</div>
                  <div style={{ marginTop:4, height:4, background:"#1E1D1A", borderRadius:2, overflow:"hidden" }}>
                    <div style={{ width:`${(f.deployed/f.allocated)*100}%`, height:"100%", background:GREEN, borderRadius:2 }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize:9, color:MUTED }}>LEVERAGE</div>
                  <div style={{ fontSize:16, fontWeight:700, color:GOLD }}>{f.leverage}x</div>
                </div>
              </>}
              <div>
                <div style={{ fontSize:9, color:MUTED }}>TOTAL DEPLOYED</div>
                <div style={{ fontSize:16, fontWeight:700 }}>{fmt(f.deployed)}</div>
              </div>
              {!f.allocated && <div>
                <div style={{ fontSize:9, color:MUTED }}>PORTFOLIO</div>
                <div style={{ fontSize:16, fontWeight:700 }}>{f.companies}</div>
              </div>}
            </div>
          </div>
          );
        })}
      </div>
      <div style={{ marginTop:20, background:CARD, border:`1px solid ${BORDER}`, borderRadius:10, padding: isMobile ? 14 : 20 }}>
        <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:14 }}>Deal Flow — Highest Signal</div>
        {allScored.filter(c=>c.eligible.length>0).sort((a,b)=>b.irs-a.irs).slice(0,10).map(c => (
          <div key={c.id} onClick={() => setSelectedCompany(c)} style={{ display:"flex", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${BORDER}`, gap: isMobile ? 6 : 12, cursor:"pointer" }}>
            <Grade grade={c.grade} size="sm" />
            <div style={{ flex:1, minWidth:0 }}>
              <span style={{ fontWeight:600, fontSize:13 }}>{c.name}</span>
              <span style={{ fontSize:10, color:MUTED, marginLeft:6 }}>{c.sector[0]}</span>
            </div>
            {!isMobile && <span style={{ fontSize:11, color:STAGE_COLORS[c.stage] }}>{stageLabel(c.stage)}</span>}
            <span style={{ fontSize:12, fontWeight:600, color:GREEN }}>{fmt(c.funding)}</span>
            <span style={{ fontSize:12, fontWeight:700, color:GOLD }}>{c.irs}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
