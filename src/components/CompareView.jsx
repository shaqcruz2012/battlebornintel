import COMPANIES from '../data/companies.json';
import VERIFIED_EDGES from '../data/edges.json';
import EXTERNALS from '../data/externals.json';
import ACCELERATORS from '../data/accelerators.json';
import ECOSYSTEM_ORGS from '../data/ecosystem.json';
import PEOPLE from '../data/people.json';
import { GOLD, DARK, CARD, BORDER, TEXT, MUTED, GREEN, fadeIn } from "../lib/constants";
import { fmt, stageLabel } from "../lib/formatters";
import computeIRS from "../lib/computeIRS";
import { Grade } from "./shared";

export default function CompareView({ compareList, isMobile }) {
  return (
    <div style={fadeIn}>
      <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:16 }}>Side-by-Side Comparison</div>
      {compareList.length < 2 ? (
        <div style={{ textAlign:"center", padding:60, color:MUTED }}>
          <div style={{ fontSize:32, marginBottom:12 }}>⟺</div>
          <div style={{ fontSize:14 }}>Select 2-4 companies from the Companies tab</div>
          <div style={{ fontSize:12, marginTop:8 }}>Tap the ⟺ button on any company card</div>
        </div>
      ) : (
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr>
                <th style={{ textAlign:"left", padding:10, borderBottom:`1px solid ${BORDER}`, color:MUTED, fontSize:10, position:"sticky", left:0, background:DARK }}>Metric</th>
                {compareList.map(id => { const c = COMPANIES.find(x=>x.id===id); return <th key={id} style={{ textAlign:"center", padding:10, borderBottom:`1px solid ${BORDER}`, minWidth:120 }}>{c?.name}</th>; })}
              </tr>
            </thead>
            <tbody>
              {[
                { l:"Stage", fn:c=>stageLabel(c.stage) },
                { l:"Funding", fn:c=>fmt(c.funding), num:c=>c.funding },
                { l:"Momentum", fn:c=>c.momentum, num:c=>c.momentum },
                { l:"Employees", fn:c=>c.employees, num:c=>c.employees },
                { l:"Founded", fn:c=>c.founded },
                { l:"IRS Grade", fn:c=>computeIRS(c).grade },
                { l:"IRS Score", fn:c=>computeIRS(c).irs, num:c=>computeIRS(c).irs },
                { l:"Triggers", fn:c=>computeIRS(c).triggers.length, num:c=>computeIRS(c).triggers.length },
                { l:"SSBCI Programs", fn:c=>c.eligible.filter(e=>["bbv","fundnv","1864"].includes(e)).length, num:c=>c.eligible.filter(e=>["bbv","fundnv","1864"].includes(e)).length },
                { l:"Sectors", fn:c=>c.sector.join(", ") },
              ].map(row => {
                const vals = compareList.map(id => COMPANIES.find(x=>x.id===id)).filter(Boolean);
                const maxVal = row.num ? Math.max(...vals.map(c=>row.num(c))) : null;
                return (
                  <tr key={row.l}>
                    <td style={{ padding:10, borderBottom:`1px solid ${BORDER}`, color:MUTED, fontSize:11, fontWeight:600, position:"sticky", left:0, background:DARK }}>{row.l}</td>
                    {vals.map(c => {
                      const isMax = row.num && row.num(c) === maxVal && vals.filter(v=>row.num(v)===maxVal).length === 1;
                      return <td key={c.id} style={{ padding:10, borderBottom:`1px solid ${BORDER}`, textAlign:"center", color:isMax ? GREEN : TEXT, fontWeight:isMax ? 700 : 400 }}>{row.fn(c)}</td>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
        {(() => {
          const cIds = compareList.map(id => `c_${id}`);
          const investorMap = {};
          VERIFIED_EDGES.forEach(e => {
            cIds.forEach(cid => {
              const match = (e.source === cid || e.target === cid);
              if (!match) return;
              const otherId = e.source === cid ? e.target : e.source;
              if (cIds.includes(otherId)) return;
              if (!investorMap[otherId]) investorMap[otherId] = {id:otherId, companies:[], edges:[]};
              investorMap[otherId].companies.push(cid);
              investorMap[otherId].edges.push({...e, companyId:cid});
            });
          });
          const shared = Object.values(investorMap).filter(v => v.companies.length >= 2).sort((a,b) => b.companies.length - a.companies.length);
          const allInvestors = Object.values(investorMap).sort((a,b) => b.companies.length - a.companies.length);
          const allNodes = [...EXTERNALS,...ACCELERATORS,...ECOSYSTEM_ORGS,...PEOPLE];
          const findName = id => allNodes.find(n => n.id === id)?.name || id;
          return (<>
            {shared.length > 0 && (<div style={{marginTop:20}}>
              <div style={{fontSize:10,color:GOLD,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Shared Connections ({shared.length})</div>
              {shared.map(s => (
                <div key={s.id} style={{padding:"8px 12px",background:CARD,border:`1px solid ${BORDER}`,borderRadius:6,marginBottom:6,borderLeft:`3px solid ${GREEN}`}}>
                  <div style={{fontWeight:600,fontSize:12,color:TEXT}}>{findName(s.id)}</div>
                  <div style={{fontSize:10,color:MUTED,marginTop:2}}>
                    {s.edges.map((e,i) => {
                      const cName = COMPANIES.find(c => `c_${c.id}` === e.companyId)?.name || e.companyId;
                      return <span key={i}>{i>0?" · ":""}{e.rel.replace(/_/g," ")} → {cName}{e.note?` (${e.note})`:""}</span>;
                    })}
                  </div>
                </div>
              ))}
            </div>)}
            {allInvestors.length > 0 && (<div style={{marginTop:16}}>
              <div style={{fontSize:10,color:MUTED,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>All Verified Relationships</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {allInvestors.slice(0,20).map(inv => (
                  <span key={inv.id} style={{fontSize:9,padding:"3px 8px",borderRadius:4,background:inv.companies.length>=2?GREEN+"15":CARD,border:`1px solid ${inv.companies.length>=2?GREEN+"40":BORDER}`,color:inv.companies.length>=2?GREEN:MUTED}}>
                    {findName(inv.id)} ({inv.companies.length})
                  </span>
                ))}
              </div>
            </div>)}
          </>);
        })()}
    </div>
  );
}
