// ============================================================
// BBI Platform Config Template
// Duplicate this app and customize for your industry vertical
// ============================================================

export default {
  // Unique identifier for this vertical
  id: "template",

  // Platform branding
  name: "Industry Intelligence",
  shortName: "II",
  version: "0.1",
  subtitle: "Your Industry Ecosystem",

  branding: {
    primaryColor: "#C49A38",       // Accent color used throughout
    fontFamily: "'Libre Franklin','DM Sans',system-ui,sans-serif",
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;400;500;600;700;800&display=swap",
  },

  // Which views to show and in what order
  // Remove views you don't need (e.g., ssbci is GOED-specific)
  views: [
    { id: "dashboard", label: "Home", icon: "◆" },
    { id: "radar", label: "Radar", icon: "📡" },
    { id: "companies", label: "Companies", icon: "⬡" },
    { id: "investors", label: "Investors", icon: "◈" },
    { id: "sectors", label: "Sectors", icon: "◉" },
    { id: "watchlist", label: "Watchlist", icon: "☆" },
    { id: "compare", label: "Compare", icon: "⟺" },
    { id: "graph", label: "Graph", icon: "🕸" },
    { id: "timeline", label: "Activity", icon: "⏱" },
    { id: "map", label: "Map", icon: "⊕" },
  ],

  // Sector heat scores (0-100) for your industry
  // Higher = more active/promising. Used by the IRS algorithm.
  sectorHeat: {
    "Sub-sector A": 90,
    "Sub-sector B": 80,
    "Sub-sector C": 70,
    "Sub-sector D": 60,
  },

  // Geographic regions for filtering
  regions: [
    { id: "region_1", label: "Region 1" },
    { id: "region_2", label: "Region 2" },
  ],

  // Feature flags
  features: {
    ssbci: false,           // Set true if tracking SSBCI funds
    ontologyGraph: true,    // Knowledge graph view
    irsScoring: true,       // Investment Readiness Score
    watchlist: true,        // Personal watchlist
    compare: true,          // Side-by-side comparison
  },
};
