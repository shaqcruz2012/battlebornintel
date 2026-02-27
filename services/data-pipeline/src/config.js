/**
 * Data pipeline configuration.
 * URLs, API keys, and output paths for each public data source.
 */

export const SOURCES = {
  pucn: {
    name: "PUCN Docket Search",
    baseUrl: "https://pucn.nv.gov",
    searchUrl: "https://pucn.nv.gov/Dockets/Dockets/",
    description: "Nevada Public Utilities Commission — docket filings, orders, testimony",
  },
  blm: {
    name: "BLM ePlanning",
    baseUrl: "https://eplanning.blm.gov",
    searchUrl: "https://eplanning.blm.gov/eplanning-ui/home",
    description: "Bureau of Land Management — EIS, NEPA, ROW, lease decisions for energy projects",
  },
  oasis: {
    name: "NV Energy OASIS",
    baseUrl: "https://www.oasis.oati.com",
    description: "Open Access Same-Time Information System — interconnection queue, transmission availability",
  },
  eia: {
    name: "EIA API",
    baseUrl: "https://api.eia.gov/v2",
    apiKey: process.env.EIA_API_KEY || null,
    description: "Energy Information Administration — generation, capacity, fuel mix data",
  },
};

export const OUTPUT_DIR = "../../apps/esint/src/data";
