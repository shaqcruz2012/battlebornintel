import { useMemo } from 'react';
import { PlatformContext, BattleBornIntelligence } from '@bbi/ui-core';
import config from './config.js';
import { COMPANIES } from './data/companies.js';
import { FUNDS } from './data/funds.js';
import { TIMELINE_EVENTS } from './data/timeline.js';
import { GRAPH_FUNDS, PEOPLE, EXTERNALS, ACCELERATORS, ECOSYSTEM_ORGS, LISTINGS, VERIFIED_EDGES } from './data/graph.js';
import { DOCKETS } from './data/dockets.js';
import { PPA_RECORDS } from './data/ppa.js';
import { QUEUE_ENTRIES } from './data/queue.js';
import { STAGE_BENCHMARKS, RISK_MULTIPLIERS } from './data/benchmarks.js';

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
    dockets: DOCKETS,
    ppa: PPA_RECORDS,
    queue: QUEUE_ENTRIES,
    benchmarks: STAGE_BENCHMARKS,
    riskMultipliers: RISK_MULTIPLIERS,
  }), []);

  return (
    <PlatformContext.Provider value={{ config, data }}>
      <BattleBornIntelligence />
    </PlatformContext.Provider>
  );
}
