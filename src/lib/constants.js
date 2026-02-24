export const GOLD = "#C49A38", DARK = "#08080A", CARD = "#111110", BORDER = "#1E1D1A";
export const TEXT = "#E2DCD0", MUTED = "#706C64", GREEN = "#4E9B60", RED = "#C25550";
export const BLUE = "#5088A8", PURPLE = "#8868A8", ORANGE = "#D4864A";

export const STAGE_COLORS = { pre_seed: "#706C64", seed: "#5088A8", series_a: "#4E9B60", series_b: ORANGE, series_c_plus: PURPLE, growth: GOLD };

export const GP = { bg:"#08080B",surface:"#111117",card:"#18181F",border:"#2A2A35",text:"#D4D0C8",muted:"#6B6A72",dim:"#3D3D48",gold:"#C8A55A",green:"#4ECDC4",blue:"#5B8DEF",purple:"#9B72CF",orange:"#E8945A",red:"#E85D5D",cyan:"#5BC0DE",pink:"#D46B9E",lime:"#8BC34A",teal:"#26A69A" };

export const NODE_CFG = {
  company:{color:GP.gold,label:"Companies",icon:"⬡"},fund:{color:GP.purple,label:"Funds",icon:"◈"},sector:{color:GP.blue,label:"Sectors",icon:"◉"},region:{color:GP.orange,label:"Regions",icon:"⊞"},
  person:{color:GP.purple,label:"People",icon:"●"},external:{color:GP.cyan,label:"External",icon:"△"},exchange:{color:GP.pink,label:"Exchanges",icon:"◧"},
  accelerator:{color:GP.lime,label:"Accelerators",icon:"▲"},ecosystem:{color:"#7986CB",label:"Ecosystem Orgs",icon:"⊕"},
};

export const REL_CFG = {
  eligible_for:{color:GP.gold,label:"Eligible For",dash:""},operates_in:{color:GP.blue,label:"Operates In",dash:"3,2"},headquartered_in:{color:GP.orange,label:"HQ In",dash:"6,3"},
  invested_in:{color:GP.green,label:"Invested In",dash:""},loaned_to:{color:GP.green,label:"Loaned To",dash:"4,2"},partners_with:{color:GP.cyan,label:"Partners With",dash:""},
  contracts_with:{color:GP.cyan,label:"Contracts With",dash:"4,4"},acquired:{color:GP.red,label:"Acquired",dash:""},founder_of:{color:GP.purple,label:"Founded",dash:""},
  manages:{color:GP.purple,label:"Manages",dash:"3,2"},listed_on:{color:GP.pink,label:"Listed On",dash:"2,2"},accelerated_by:{color:GP.lime,label:"Accelerated By",dash:""},
  won_pitch:{color:GP.lime,label:"Won Pitch",dash:""},incubated_by:{color:GP.lime,label:"Incubated By",dash:"3,2"},program_of:{color:GP.lime,label:"Program Of",dash:"4,3"},
  supports:{color:"#7986CB",label:"Supports",dash:"3,2"},housed_at:{color:"#7986CB",label:"Housed At",dash:"4,3"},collaborated_with:{color:GP.cyan,label:"Collaborated With",dash:"3,3"},
  funds:{color:GP.gold,label:"Funds",dash:""},approved_by:{color:GP.teal,label:"Approved By",dash:"5,3"},filed_with:{color:GP.pink,label:"Filed With",dash:"4,4"},competes_with:{color:"#FF7043",label:"Competes With",dash:"2,4"},grants_to:{color:GP.green,label:"Grants To",dash:"4,2"},
};

export const GSTAGE_C = { pre_seed:GP.dim,seed:GP.blue,series_a:GP.green,series_b:GP.orange,series_c_plus:GP.purple,growth:GP.gold };

export const VIEWS = [
  { id: "dashboard", label: "Home", icon: "◆" },
  { id: "radar", label: "Radar", icon: "📡" },
  { id: "companies", label: "Companies", icon: "⬡" },
  { id: "investors", label: "Funds", icon: "◈" },
  { id: "sectors", label: "Sectors", icon: "◉" },
  { id: "watchlist", label: "Watchlist", icon: "☆" },
  { id: "compare", label: "Compare", icon: "⟺" },
  { id: "graph", label: "Graph", icon: "🕸" },
  { id: "timeline", label: "Activity", icon: "⏱" },
  { id: "ssbci", label: "SSBCI", icon: "★" },
  { id: "map", label: "Map", icon: "⊕" },
];

export const SHEAT = { AI:95, Cybersecurity:88, Defense:85, Cleantech:82, Mining:78, Aerospace:80, Cloud:80, "Data Center":80, Energy:78, Solar:75, Robotics:78, Biotech:72, Fintech:70, Gaming:68, Blockchain:50, Drones:75, Construction:65, Logistics:65, "Materials Science":70, "Real Estate":50, Computing:70, Water:72, Media:58, Payments:68, IoT:65, Manufacturing:60, Semiconductors:82, Hospitality:60, Cannabis:45, Analytics:75, Satellite:82, Identity:80, AdTech:65, Education:62, Healthcare:70, Consumer:55, Fitness:60, Mobile:58, Banking:55, Retail:52 };
export const STAGE_NORMS = { pre_seed:0.5, seed:3, series_a:15, series_b:50, series_c_plus:200, growth:500 };

export const TRIGGER_CFG = {
  rapid_funding:  { i:"🔥", l:"Rapid Funding",  c:"#EF4444" },
  grant_validated:{ i:"🏛️", l:"Grant Validated", c:"#3B82F6" },
  hiring_surge:   { i:"📈", l:"Hiring Surge",    c:"#F59E0B" },
  hot_sector:     { i:"🌡️", l:"Hot Sector",      c:"#F97316" },
  ssbci_eligible: { i:"🏦", l:"SSBCI Match",     c:"#8B5CF6" },
  high_momentum:  { i:"⚡", l:"High Momentum",   c:"#22C55E" },
};

export const GRADE_COLORS = { A:"#4ADE80","A-":"#86EFAC","B+":"#FACC15",B:"#FDE047","B-":"#FEF08A","C+":"#FB923C",C:"#FDBA74",D:"#F87171" };

export const fadeIn = { animation: "fadeIn 0.3s ease-out" };
export const css = `
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
`;
