import { useState } from "react";
import { useApi } from "../hooks/useApi.js";
import { BORDER, MUTED, GOLD, TEXT, DARK, STAGE_COLORS, fadeIn, fmt, stageLabel } from "@bbi/ui-core";

export default function Map({ isMobile, isTablet, setSelectedCompany, setView }) {
  const { data: companies } = useApi("/companies");
  const [mapHover, setMapHover] = useState(null);

  if (!companies) return <div style={{ padding:40, textAlign:"center", color:MUTED }}>Loading map...</div>;

  return (
    <div style={fadeIn}>
      <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:12 }}>Nevada Startup Map</div>
      <svg viewBox="0 0 800 650" style={{ width:"100%", background:"#111110", borderRadius:10, border:`1px solid ${BORDER}` }}>
        <path d="M220,30 L560,30 L560,45 L610,580 L180,580 Z" fill={BORDER+"25"} stroke={BORDER} strokeWidth={1} />
        <text x={380} y={105} textAnchor="middle" fill={MUTED+"70"} fontSize={13} fontWeight={600}>RENO / SPARKS</text>
        <text x={420} y={430} textAnchor="middle" fill={MUTED+"70"} fontSize={13} fontWeight={600}>LAS VEGAS METRO</text>
        <text x={500} y={200} textAnchor="middle" fill={MUTED+"40"} fontSize={9}>Elko</text>
        <text x={310} y={210} textAnchor="middle" fill={MUTED+"40"} fontSize={9}>Carson City</text>
        <circle cx={500} cy={190} r={3} fill={MUTED+"30"} /><circle cx={310} cy={200} r={3} fill={MUTED+"30"} />
        {companies.map(c => {
          const isR = c.region==="reno";
          const isRural = c.region==="rural";
          const x = isRural ? 500+(c.lng+115.76)*200 : isR ? 370+(c.lng+119.82)*400 : 400+(c.lng+115.17)*350;
          const y = isRural ? 170+(40.83-c.lat)*200 : isR ? 100+(39.56-c.lat)*300 : 420+(36.20-c.lat)*300;
          const r = 4+(c.momentum/100)*8;
          const isH = mapHover===c.id;
          return (
            <g key={c.id} style={{ cursor:"pointer" }} onMouseEnter={()=>setMapHover(c.id)} onMouseLeave={()=>setMapHover(null)} onClick={()=>setSelectedCompany(c)}>
              <circle cx={x} cy={y} r={r+4} fill="transparent" />
              <circle cx={x} cy={y} r={r} fill={(STAGE_COLORS[c.stage]||MUTED)+(isH?"90":"50")} stroke={isH?TEXT:(STAGE_COLORS[c.stage]||MUTED)} strokeWidth={isH?2:0.5} style={{ transition:"all 0.15s" }} />
              {isH && <>
                <rect x={x+r+6} y={y-14} width={Math.max(c.name.length*5.5+30,80)} height={24} rx={4} fill={DARK} stroke={BORDER} strokeWidth={1} />
                <text x={x+r+10} y={y+2} fill={TEXT} fontSize={9} fontWeight={600}>{c.name} · {fmt(c.funding)}</text>
              </>}
            </g>
          );
        })}
        {Object.entries(STAGE_COLORS).map(([s,cl],i) => (
          <g key={s}><circle cx={30} cy={580+i*14} r={4} fill={cl+"60"} stroke={cl}/><text x={42} y={583+i*14} fill={MUTED} fontSize={8}>{stageLabel(s)}</text></g>
        ))}
      </svg>
    </div>
  );
}
