import { GOLD, GREEN, BLUE, PURPLE, RED } from "./constants.js";

export const REAP_PILLARS = [
  { id: "all", label: "All", icon: "◎", color: GOLD },
  { id: "risk_capital", label: "Risk Capital", icon: "◈", color: GREEN },
  { id: "corporations", label: "Corporations", icon: "△", color: BLUE },
  { id: "entrepreneurs", label: "Entrepreneurs", icon: "⬡", color: GOLD },
  { id: "universities", label: "Universities", icon: "▣", color: PURPLE },
  { id: "government", label: "Government", icon: "⊕", color: RED },
];

export function getReapPillar(entity) {
  if (!entity) return null;
  if (entity.type === "SSBCI" || entity.type === "Angel" || entity.type === "Deep Tech VC" || entity.type === "Growth VC" || entity.type === "Accelerator") return "risk_capital";
  if (entity.etype === "VC Firm" || entity.etype === "PE Firm" || entity.etype === "Investment Co" || entity.etype === "SPAC") return "risk_capital";
  if (entity.etype === "Corporation") return "corporations";
  if (entity.etype === "University" || entity.etype === "University Hub") return "universities";
  if (entity.etype === "Government" || entity.etype === "Economic Development") return "government";
  if (entity.etype === "Foundation") return "government";
  if (entity.stage || entity.momentum !== undefined) return "entrepreneurs";
  if (entity.atype) return "risk_capital";
  return null;
}

export function getCompanyReapConnections(companyId, edges, entities, funds) {
  const connected = new Set();
  edges.forEach(e => {
    const cId = `c_${companyId}`;
    if (e.source === cId || e.target === cId) {
      const otherId = e.source === cId ? e.target : e.source;
      const entity = entities.find(x => x.id === otherId);
      if (entity) {
        const pillar = getReapPillar(entity);
        if (pillar) connected.add(pillar);
      }
      const fundMatch = otherId.startsWith("f_") ? funds.find(f => f.id === otherId.replace("f_","")) : null;
      if (fundMatch) connected.add("risk_capital");
    }
  });
  return connected;
}
