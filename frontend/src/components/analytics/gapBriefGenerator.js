// ─────────────────────────────────────────────────────────────────────
// Gap Brief Generator — pure function that produces structured brief
// content for each gap type (framework, bridge, island, missing)
// ─────────────────────────────────────────────────────────────────────

const FRAMEWORK_ACTIONS = {
  vod: [
    'Create bridge funding programs for TRL 4-6 founders',
    'Establish a state-level I-Corps equivalent program',
    'Partner with universities to provide non-dilutive validation capital',
  ],
  hgd: [
    'Attract revenue-based financing providers to Nevada',
    'Create a state growth equity vehicle for $100K-$1M MRR companies',
    'Develop EDA-aligned regional innovation strategy',
  ],
  smegap: [
    'Expand accelerator programs to cover the $5K-$100K revenue range',
    'Create mentorship pipelines bridging SCORE/WBC to IDE-track programs',
    'Develop SBA "missing middle" lending partnerships',
  ],
  commons: [
    'Fund a hybrid concept-stage program for all founder types',
    'Apply for NSF Engines or EDA Tech Hub designation',
    'Create pre-competitive collaboration infrastructure at concept stage',
  ],
  seriesb: [
    'Attract growth-stage VCs with Nevada-focused mandates',
    'Create retention incentives for Series B+ companies',
    'Build relationships with Bay Area and Austin growth funds',
  ],
  rural: [
    'Extend IDE-track accelerator resources to rural counties',
    'Leverage USDA and EDA rural innovation program funding',
    'Expand RNDC beyond concept stage into acceleration',
  ],
};

const FRAMEWORK_CHALLENGES = {
  vod: 'securing non-dilutive validation capital between research and first revenue',
  hgd: 'accessing growth equity when they are too large for seed but lack revenue-based alternatives',
  smegap: 'bridging the gap between micro-support programs and scalable venture tracks',
  commons: 'finding pre-competitive collaboration resources at concept stage',
  seriesb: 'raising $10M+ growth rounds without relocating out of Nevada',
  rural: 'accessing any IDE-track accelerator or venture resources in their county',
};

function generateFrameworkBrief(gap) {
  const actions = FRAMEWORK_ACTIONS[gap.id] || [
    'Conduct deeper analysis of this gap',
    'Identify stakeholders who can address the barrier',
    'Develop a funding proposal targeting the gap',
  ];

  const challenge = FRAMEWORK_CHALLENGES[gap.id] || 'navigating this structural barrier';

  return {
    title: gap.label,
    whatItIs: gap.description,
    whyItMatters: `This gap, identified by ${gap.frameworkSource}, represents a ${gap.severity} barrier to Nevada's ecosystem. Companies in this stage face ${challenge}.`,
    suggestedActions: actions,
    relatedEntities: [],
  };
}

function generateBridgeBrief(bridge) {
  const communityLabels = bridge.communities.map(
    (cid, idx) => bridge.communityLabels?.[idx] || `Community ${cid}`
  );

  return {
    title: `${bridge.label} -- Network Bridge`,
    whatItIs: `This ${bridge.type} connects ${bridge.communities.length} distinct communities with a bridge score of ${bridge.bridgeScore.toFixed(1)}. Low constraint (${bridge.constraint.toFixed(2)}) means it acts as a critical connector.`,
    whyItMatters: `Removing this node would isolate ${bridge.communities.length} communities. It is the primary pathway for information and capital flow between these groups.`,
    suggestedActions: [
      'Strengthen this node\'s connections with additional relationships',
      'Identify secondary bridges as backup connectors',
      'Use this node for cross-community introductions',
    ],
    relatedEntities: communityLabels,
  };
}

function generateIslandBrief(island) {
  const hubLabel = island.hubNode?.label || 'unknown';

  return {
    title: `${island.communityName || `Community ${island.communityId}`} -- Isolated Community`,
    whatItIs: `This community of ${island.nodeCount} entities has only ${island.externalEdges} external connections, making it a potential blind spot.`,
    whyItMatters: 'Isolated communities miss cross-pollination opportunities. Without external connections, capital, talent, and knowledge stay trapped.',
    suggestedActions: [
      `Connect hub node (${hubLabel}) to adjacent communities`,
      'Host cross-community events to create new ties',
      'Introduce key members to existing bridge nodes',
    ],
    relatedEntities: island.members
      ? island.members.map((m) => m.label)
      : [],
  };
}

function generateMissingBrief(gap) {
  const bridgeActions = (gap.potentialBridges || []).map(
    (b) => `Connect through ${b.label} (${b.type})`
  );

  const actions = bridgeActions.length > 0
    ? bridgeActions.slice(0, 5)
    : [
      'Identify shared interests between both communities',
      'Host joint events or introductions',
      'Create formal partnership channels',
    ];

  const bridgeEntities = (gap.potentialBridges || []).map(
    (b) => `${b.label} (${b.type})`
  );

  return {
    title: `Gap Between ${gap.communityAName || `C${gap.communityA}`} and ${gap.communityBName || `C${gap.communityB}`}`,
    whatItIs: `These two communities have ${gap.interEdges} inter-community edges despite combined ${(gap.communityASize || 0) + (gap.communityBSize || 0)} nodes. Gap severity: ${gap.gapSeverity.toFixed(1)}/10.`,
    whyItMatters: 'High internal density with low external connectivity means opportunities for collaboration are being missed.',
    suggestedActions: actions,
    relatedEntities: bridgeEntities,
  };
}

export function generateGapBrief(gap, type) {
  switch (type) {
    case 'framework':
      return generateFrameworkBrief(gap);
    case 'bridge':
      return generateBridgeBrief(gap);
    case 'island':
      return generateIslandBrief(gap);
    case 'missing':
      return generateMissingBrief(gap);
    default:
      return {
        title: 'Unknown Gap Type',
        whatItIs: 'No data available for this gap type.',
        whyItMatters: '',
        suggestedActions: [],
        relatedEntities: [],
      };
  }
}
