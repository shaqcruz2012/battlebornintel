/**
 * MIT REAP 5-Stakeholder Model for Nevada Innovation Ecosystem
 * Maps existing graph entities into stakeholder categories.
 */

export const STAKEHOLDERS = [
  {
    id: 'government',
    label: 'Government',
    icon: '\u2302',
    color: 'var(--accent-teal)',
    description: 'State agencies, federal partners, and policy support',
    entityIds: ['e_goed', 'x_ssbci', 'x_doe', 'x_usaf', 'x_fda', 'x_snwa', 'x_nasa', 'x_goed'],
    entityTypes: ['Government'],
    edgeRels: ['manages', 'funds', 'grants_to', 'loaned_to', 'contracts_with', 'approved_by'],
  },
  {
    id: 'universities',
    label: 'Universities',
    icon: '\u2609',
    color: '#9B72CF',
    description: 'Research institutions and Knowledge Fund programs',
    entityIds: ['e_innevation', 'e_unlvtech', 'x_unr'],
    entityTypes: ['University', 'University Hub'],
    knowledgeFundTargets: ['a_zerolabs', 'a_blackfire'],
    edgeRels: ['housed_at', 'partners_with', 'collaborated_with', 'program_of'],
  },
  {
    id: 'corporate',
    label: 'Corporate',
    icon: '\u25A3',
    color: 'var(--accent-gold)',
    description: 'Enterprise partners and strategic investors',
    entityTypes: ['Corporation'],
    edgeRels: ['partners_with', 'invested_in', 'contracts_with'],
  },
  {
    id: 'risk_capital',
    label: 'Risk Capital',
    icon: '\u25C8',
    color: 'var(--status-success)',
    description: 'SSBCI funds, VCs, angel networks, and PE firms',
    ssbciFundIds: ['bbv', 'fundnv', '1864'],
    entityTypes: ['VC Firm', 'PE Firm', 'Angel', 'Investment Co'],
    acceleratorIds: ['a_startupnv', 'a_angelnv'],
    edgeRels: ['invested_in', 'funds', 'program_of', 'eligible_for'],
  },
  {
    id: 'entrepreneurs',
    label: 'Entrepreneurs',
    icon: '\u2736',
    color: 'var(--status-risk)',
    description: 'Startups in the portfolio and their founders',
    edgeRels: ['accelerated_by', 'won_pitch', 'eligible_for', 'founder_of'],
  },
];

export const STAKEHOLDER_MAP = Object.fromEntries(
  STAKEHOLDERS.map((s) => [s.id, s])
);

/**
 * Identifies Knowledge Fund edges from graph data.
 * Knowledge Fund = GOED → accelerator edges where note mentions "Knowledge Fund".
 */
export function getKnowledgeFundEdges(edges) {
  return edges.filter(
    (e) =>
      (e.source === 'e_goed' || e.source === 'x_goed') &&
      e.note &&
      e.note.toLowerCase().includes('knowledge fund')
  );
}
