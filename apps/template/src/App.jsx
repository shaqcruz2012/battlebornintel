import { useMemo } from 'react';
import { PlatformContext, BattleBornIntelligence } from '@bbi/ui-core';
import config from './config.js';
import { COMPANIES } from './data/companies.js';
import { FUNDS } from './data/funds.js';
import { TIMELINE_EVENTS } from './data/timeline.js';
import { GRAPH_FUNDS, PEOPLE, EXTERNALS, ACCELERATORS, ECOSYSTEM_ORGS, LISTINGS, VERIFIED_EDGES } from './data/graph.js';

export default function App() {
  const data = useMemo(() => ({
    companies: COMPANIES,
    funds: FUNDS,
    timeline: TIMELINE_EVENTS,
    graphFunds: GRAPH_FUNDS,
    people: PEOPLE,
    externals: EXTERNALS,
    accelerators: ACCELERATORS,
    ecosystemOrgs: ECOSYSTEM_ORGS,
    listings: LISTINGS,
    verifiedEdges: VERIFIED_EDGES,
  }), []);

  return (
    <PlatformContext.Provider value={{ config, data }}>
      <BattleBornIntelligence />
    </PlatformContext.Provider>
  );
}
