export const GRAPH_FUNDS = [
  { id: "fund_1", name: "Example Fund", type: "VC" },
  { id: "fund_2", name: "Example Angel Group", type: "Angel" },
];

export const PEOPLE = [
  { id: "p_1", name: "Jane Founder", role: "CEO", companyId: 1, note: "Industry veteran" },
];

export const EXTERNALS = [
  { id: "x_partner", name: "Partner Corp", etype: "Corporation", note: "Strategic partner" },
  { id: "x_gov", name: "State Agency", etype: "Government", note: "Grant provider" },
];

export const ACCELERATORS = [];
export const ECOSYSTEM_ORGS = [];
export const LISTINGS = [];

export const VERIFIED_EDGES = [
  { source: "c_1", target: "f_fund_1", rel: "eligible_for", note: "Fund eligible", y: 2024 },
  { source: "c_1", target: "x_partner", rel: "partners_with", note: "Strategic partnership", y: 2025 },
  { source: "c_2", target: "f_fund_2", rel: "eligible_for", note: "Angel funding", y: 2024 },
];
