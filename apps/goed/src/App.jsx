import { useMemo } from 'react';
import { PlatformContext, BattleBornIntelligence, useData } from '@bbi/ui-core';
import localConfig from './config.js';
// Static data imports (fallback when API unavailable)
import { COMPANIES } from './data/companies.js';
import { FUNDS } from './data/funds.js';
import { TIMELINE_EVENTS } from './data/timeline.js';
import { GRAPH_FUNDS, PEOPLE, EXTERNALS, ACCELERATORS, ECOSYSTEM_ORGS, LISTINGS, VERIFIED_EDGES } from './data/graph.js';

const STATIC_DATA = {
  companies: COMPANIES, funds: FUNDS, timeline: TIMELINE_EVENTS,
  graphFunds: GRAPH_FUNDS, people: PEOPLE, externals: EXTERNALS,
  accelerators: ACCELERATORS, ecosystemOrgs: ECOSYSTEM_ORGS,
  listings: LISTINGS, verifiedEdges: VERIFIED_EDGES,
};

export default function App() {
  const { data: apiData, config: apiConfig, loading, error } = useData('goed');

  // Use API data if available, fall back to static imports
  const data = apiData || STATIC_DATA;
  const config = apiConfig || localConfig;

  if (loading && !apiData) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0a0a12',color:'#706C64',fontFamily:'system-ui'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:32,marginBottom:12}}>◆</div>
          <div style={{fontSize:12,letterSpacing:2}}>LOADING</div>
        </div>
      </div>
    );
  }

  return (
    <PlatformContext.Provider value={{ config, data }}>
      <BattleBornIntelligence />
    </PlatformContext.Provider>
  );
}
