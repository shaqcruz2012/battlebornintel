export const GP = { bg:"#08080B",surface:"#111117",card:"#18181F",border:"#2A2A35",text:"#D4D0C8",muted:"#6B6A72",dim:"#3D3D48",gold:"#C8A55A",green:"#4ECDC4",blue:"#5B8DEF",purple:"#9B72CF",orange:"#E8945A",red:"#E85D5D",cyan:"#5BC0DE",pink:"#D46B9E",lime:"#8BC34A",teal:"#26A69A" };
export const NODE_CFG = {
  company:{color:GP.gold,label:"Companies",icon:"\u2B21"},fund:{color:GP.purple,label:"Funds",icon:"\u25C8"},sector:{color:GP.blue,label:"Sectors",icon:"\u25C9"},region:{color:GP.orange,label:"Regions",icon:"\u229E"},
  person:{color:GP.purple,label:"People",icon:"\u25CF"},external:{color:GP.cyan,label:"External",icon:"\u25B3"},exchange:{color:GP.pink,label:"Exchanges",icon:"\u25E7"},
  accelerator:{color:GP.lime,label:"Accelerators",icon:"\u25B2"},ecosystem:{color:"#7986CB",label:"Ecosystem Orgs",icon:"\u2295"},
  utility:{color:GP.gold,label:"Utilities",icon:"\u26A1"},docket:{color:GP.cyan,label:"Dockets",icon:"\u2261"},substation:{color:GP.orange,label:"Substations",icon:"\u25CE"},transmission:{color:GP.teal,label:"Transmission",icon:"\u2192"},
};
export const REL_CFG = {
  eligible_for:{color:GP.gold,label:"Eligible For",dash:""},operates_in:{color:GP.blue,label:"Operates In",dash:"3,2"},headquartered_in:{color:GP.orange,label:"HQ In",dash:"6,3"},
  invested_in:{color:GP.green,label:"Invested In",dash:""},loaned_to:{color:GP.green,label:"Loaned To",dash:"4,2"},partners_with:{color:GP.cyan,label:"Partners With",dash:""},
  contracts_with:{color:GP.cyan,label:"Contracts With",dash:"4,4"},acquired:{color:GP.red,label:"Acquired",dash:""},founder_of:{color:GP.purple,label:"Founded",dash:""},
  manages:{color:GP.purple,label:"Manages",dash:"3,2"},listed_on:{color:GP.pink,label:"Listed On",dash:"2,2"},accelerated_by:{color:GP.lime,label:"Accelerated By",dash:""},
  won_pitch:{color:GP.lime,label:"Won Pitch",dash:""},incubated_by:{color:GP.lime,label:"Incubated By",dash:"3,2"},program_of:{color:GP.lime,label:"Program Of",dash:"4,3"},
  supports:{color:"#7986CB",label:"Supports",dash:"3,2"},housed_at:{color:"#7986CB",label:"Housed At",dash:"4,3"},collaborated_with:{color:GP.cyan,label:"Collaborated With",dash:"3,3"},
  funds:{color:GP.gold,label:"Funds",dash:""},approved_by:{color:GP.teal,label:"Approved By",dash:"5,3"},filed_with:{color:GP.pink,label:"Filed With",dash:"4,4"},competes_with:{color:"#FF7043",label:"Competes With",dash:"2,4"},grants_to:{color:GP.green,label:"Grants To",dash:"4,2"},
  developed_by:{color:GP.green,label:"Developed By",dash:""},ppa_with:{color:GP.gold,label:"PPA With",dash:""},subject_of:{color:GP.cyan,label:"Subject Of",dash:"4,3"},on_blm_land:{color:GP.lime,label:"On BLM Land",dash:"3,2"},connects_to:{color:GP.orange,label:"Connects To",dash:""},enables:{color:GP.teal,label:"Enables",dash:"4,2"},backed_by:{color:GP.purple,label:"Backed By",dash:""},
};
const DEFAULT_GSTAGE_C = { pre_seed:GP.dim,seed:GP.blue,series_a:GP.green,series_b:GP.orange,series_c_plus:GP.purple,growth:GP.gold };
export const GSTAGE_C = DEFAULT_GSTAGE_C;
export const getGStageColors = (config) => config?.stages?.graphColors || DEFAULT_GSTAGE_C;
