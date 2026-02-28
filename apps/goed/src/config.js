export default {
  id: "goed",
  name: "Battle Born Intelligence",
  shortName: "BBI",
  version: "5.0",
  subtitle: "Nevada Startup Ecosystem",

  branding: {
    primaryColor: "#C49A38",
    fontFamily: "'Libre Franklin','DM Sans',system-ui,sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;400;500;600;700;800&display=swap",
  },

  tooltips: {
    entityCount: "Active startups and growth-stage companies in the Nevada ecosystem. Grade A = highest investment readiness.",
    funding: "Combined private funding raised and SSBCI allocations across all tracked companies.",
    momentum: "Investment Readiness Score (0-100). Weighted composite of funding velocity, team strength, market traction, and sector heat.",
    employees: "Total employees across all tracked ecosystem companies.",
    ssbci: "State Small Business Credit Initiative funds deployed to Nevada startups, with private capital leverage ratio.",
    watchlist: "Companies you're monitoring. Add any company to your watchlist from its detail panel.",
    sectorHeat: "Market activity score (0-100) reflecting investor interest, deal flow, and growth trajectory for each sector.",
  },

  views: [
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
    { id: "intel", label: "Intel Briefs", icon: "📋" },
    { id: "horizon", label: "Horizon", icon: "🔭" },
    { id: "feed", label: "NV Feed", icon: "📰" },
  ],

  sectorHeat: {
    AI: 95, Cybersecurity: 88, Defense: 85, Cleantech: 82, Mining: 78,
    Aerospace: 80, Cloud: 80, "Data Center": 80, Energy: 78, Solar: 75,
    Robotics: 78, Biotech: 72, Fintech: 70, Gaming: 68, Blockchain: 50,
    Drones: 75, Construction: 65, Logistics: 65, "Materials Science": 70,
    "Real Estate": 50, Computing: 70, Water: 72, Media: 58, Payments: 68,
    IoT: 65, Manufacturing: 60, Semiconductors: 82, Hospitality: 60,
    Cannabis: 45, Analytics: 75, Satellite: 82, Identity: 80, AdTech: 65,
    Education: 62, Healthcare: 70, Consumer: 55, Fitness: 60, Mobile: 58,
    Banking: 55, Retail: 52, "HR Tech": 62, Enterprise: 65,
    SaaS: 68, PropTech: 55, Autonomous: 78, Mobility: 72, EdTech: 62,
    Esports: 58, EV: 75, Communications: 60, AgTech: 65,
  },

  regions: [
    { id: "las_vegas", label: "Las Vegas" },
    { id: "henderson", label: "Henderson" },
    { id: "reno", label: "Reno" },
    { id: "rural", label: "Rural" },
  ],

  features: {
    ssbci: true,
    ontologyGraph: true,
    irsScoring: true,
    watchlist: true,
    compare: true,
    intel: true,
    horizon: true,
    feed: true,
  },
};
