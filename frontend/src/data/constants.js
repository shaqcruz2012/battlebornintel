// Graph palette
export const GP = {
  bg:"#08080B", surface:"#111117", card:"#18181F", border:"#2A2A35",
  text:"#D4D0C8", muted:"#6B6A72", dim:"#3D3D48", gold:"#C8A55A",
  green:"#4ECDC4", blue:"#5B8DEF", purple:"#9B72CF", orange:"#E8945A",
  red:"#E85D5D", cyan:"#5BC0DE", pink:"#D46B9E", lime:"#8BC34A", teal:"#26A69A"
};

export const NODE_CFG = {
  company:{color:"#D4973A",label:"Companies",icon:"\u2B21"},
  fund:{color:"#A77BDB",label:"Funds",icon:"\u25C8"},
  sector:{color:"#7A8A9E",label:"Sectors",icon:"\u25C9"},
  region:{color:"#6B7D8E",label:"Regions",icon:"\u229E"},
  person:{color:"#D94E4E",label:"People",icon:"\u25CF"},
  external:{color:"#3DBFB0",label:"External",icon:"\u25B3"},
  exchange:{color:"#8E8E6B",label:"Exchanges",icon:"\u25E7"},
  accelerator:{color:"#5AA65E",label:"Accelerators",icon:"\u25B2"},
  ecosystem:{color:"#5160B0",label:"Ecosystem Orgs",icon:"\u2295"},
  program:{color:"#7B9E6B",label:"Programs",icon:"\u25A1"},
};

export const REL_CFG = {
  eligible_for:{color:GP.gold,label:"Eligible For",dash:""},
  operates_in:{color:GP.blue,label:"Operates In",dash:"3,2"},
  headquartered_in:{color:GP.orange,label:"HQ In",dash:"6,3"},
  invested_in:{color:GP.green,label:"Invested In",dash:""},
  loaned_to:{color:GP.green,label:"Loaned To",dash:"4,2"},
  partners_with:{color:GP.cyan,label:"Partners With",dash:""},
  contracts_with:{color:GP.cyan,label:"Contracts With",dash:"4,4"},
  acquired:{color:GP.red,label:"Acquired",dash:""},
  founder_of:{color:GP.purple,label:"Founded",dash:""},
  manages:{color:GP.purple,label:"Manages",dash:"3,2"},
  listed_on:{color:GP.pink,label:"Listed On",dash:"2,2"},
  accelerated_by:{color:GP.lime,label:"Accelerated By",dash:""},
  won_pitch:{color:GP.lime,label:"Won Pitch",dash:""},
  incubated_by:{color:GP.lime,label:"Incubated By",dash:"3,2"},
  program_of:{color:GP.lime,label:"Program Of",dash:"4,3"},
  supports:{color:"#7986CB",label:"Supports",dash:"3,2"},
  housed_at:{color:"#7986CB",label:"Housed At",dash:"4,3"},
  collaborated_with:{color:GP.cyan,label:"Collaborated With",dash:"3,3"},
  funds:{color:GP.gold,label:"Funds",dash:""},
  approved_by:{color:GP.teal,label:"Approved By",dash:"5,3"},
  filed_with:{color:GP.pink,label:"Filed With",dash:"4,4"},
  competes_with:{color:"#FF7043",label:"Competes With",dash:"2,4"},
  grants_to:{color:GP.green,label:"Grants To",dash:"4,2"},
  qualifies_for:{color:"#22C55E",label:"Qualifies For",dash:"6,4"},
  fund_opportunity:{color:"#16A34A",label:"Potential Investor",dash:"6,4"},
  potential_lp:{color:"#818CF8",label:"Potential LP",dash:"6,4"},
};

// Edge category configuration
export const EDGE_CATEGORY_CFG = {
  historical: { label: 'Historical', style: '', opacity: 0.4 },
  opportunity: { label: 'Opportunities', style: '6,4', opacity: 0.6 },
  projected: { label: 'Projected', style: '2,3', opacity: 0.3 },
};

export const GSTAGE_C = {
  pre_seed:GP.dim, seed:GP.blue, series_a:GP.green,
  series_b:GP.orange, series_c_plus:GP.purple, growth:GP.gold
};

export const STAGE_COLORS = {
  pre_seed:"#5B6170", seed:"#5B8DEF", series_a:"#45D7C6",
  series_b:"#F5C76C", series_c_plus:"#9B72CF", growth:"#F5C76C"
};

// Sector heat scores (0-100)
export const SHEAT = {
  AI:95, Cybersecurity:88, Defense:85, Cleantech:82, Mining:78, Aerospace:80,
  Cloud:80, "Data Center":80, Energy:78, Solar:75, Robotics:78, Biotech:72,
  Fintech:70, Gaming:68, Blockchain:50, Drones:75, Construction:65, Logistics:65,
  "Materials Science":70, "Real Estate":50, Computing:70, Water:72, Media:58,
  Payments:68, IoT:65, Manufacturing:60, Semiconductors:82, Hospitality:60,
  Cannabis:45, Analytics:75, Satellite:82, Identity:80, AdTech:65, Education:62,
  Healthcare:70, Consumer:55, Fitness:60, Mobile:58, Banking:55, Retail:52,
  "HR Tech":60, Enterprise:65
};

// Funding benchmarks by stage ($M)
export const STAGE_NORMS = {
  pre_seed:0.5, seed:3, series_a:15, series_b:50,
  series_c_plus:200, growth:500
};

export const TRIGGER_CFG = {
  rapid_funding:  { icon:"fire",     label:"Rapid Funding",  color:"#EF4444" },
  grant_validated:{ icon:"building", label:"Grant Validated", color:"#3B82F6" },
  hiring_surge:   { icon:"trending", label:"Hiring Surge",    color:"#F59E0B" },
  hot_sector:     { icon:"flame",    label:"Hot Sector",      color:"#F97316" },
  ssbci_eligible: { icon:"bank",     label:"SSBCI Match",     color:"#8B5CF6" },
  high_momentum:  { icon:"zap",      label:"High Momentum",   color:"#22C55E" },
};

export const GRADE_COLORS = {
  A:"#4ADE80", "A-":"#86EFAC", "B+":"#FACC15", B:"#FDE047",
  "B-":"#FEF08A", "C+":"#FB923C", C:"#FDBA74", D:"#F87171"
};

// Community detection palette
export const COMM_COLORS = [
  GP.gold, GP.green, GP.blue, GP.purple, GP.orange, GP.red,
  GP.cyan, GP.pink, GP.lime, GP.teal,
  "#E57373","#64B5F6","#FFD54F","#AED581","#BA68C8","#4DD0E1"
];
