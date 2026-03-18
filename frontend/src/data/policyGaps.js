// ─────────────────────────────────────────────────────────────────────
// Battle Born Intelligence — Policy Gap Overlay Data
// Based on MIT stress test analysis + Kauffman/EDA/NSF framework
// Each gap maps to a rectangle on the ResourceMatrix coordinate space
// ─────────────────────────────────────────────────────────────────────

export const POLICY_GAPS = [
  {
    id: 'vod',
    label: 'Valley of Death',
    shortLabel: 'VOD',
    description: 'TRL 4-6 founders exit research but cannot meet FundNV $5K MRR threshold. Zero non-dilutive validation capital exists in this zone. NSF I-Corps addresses this nationally; Nevada has no state equivalent.',
    frameworkSource: 'Kauffman',
    severity: 'critical',
    x1: 7.8, x2: 10.0, y1: 2.2, y2: 5.0,
    color: '#4d9de0', dashPattern: '6,4', fillOpacity: 0.15,
    labelPosition: { top: true, right: false },
  },
  {
    id: 'hgd',
    label: 'Hybrid Growth Desert',
    shortLabel: 'HGD',
    description: 'No growth equity or revenue-based financing for $100K-$1M MRR hybrid companies. Too big for seed VC, no revenue-based alternative. EDA Regional Innovation Strategies addresses this; Nevada has no funded vehicle.',
    frameworkSource: 'EDA',
    severity: 'critical',
    x1: 4.0, x2: 7.8, y1: 6.8, y2: 10.0,
    color: '#f59e0b', dashPattern: '8,4', fillOpacity: 0.15,
    labelPosition: { top: true, right: false },
  },
  {
    id: 'smegap',
    label: 'SME Early-Revenue Gap',
    shortLabel: 'SME-GAP',
    description: '$5K-$100K revenue SMBs have outgrown SCORE and WBC but cannot access IDE-track accelerator programs. SBA "missing middle" problem — too big for microloans, too small or non-scalable for venture.',
    frameworkSource: 'SBA',
    severity: 'moderate',
    x1: 2.0, x2: 4.0, y1: 5.0, y2: 6.9,
    color: '#e84393', dashPattern: '5,4', fillOpacity: 0.15,
    labelPosition: { top: true, right: false },
  },
  {
    id: 'commons',
    label: 'Innovation Commons Gap',
    shortLabel: 'ICG',
    description: 'No hybrid concept-stage program serving all founder types regardless of IDE vs SME track. NSF Engines and EDA Tech Hubs fund pre-competitive collaboration infrastructure; Nevada has none at concept stage.',
    frameworkSource: 'NSF',
    severity: 'moderate',
    x1: 4.0, x2: 6.2, y1: 0.0, y2: 2.1,
    color: '#9b8af7', dashPattern: '5,4', fillOpacity: 0.15,
    labelPosition: { top: false, right: false },
  },
  {
    id: 'seriesb',
    label: 'Series B Cliff',
    shortLabel: 'B+CLIFF',
    description: 'Series A coverage has 7 organizations. Series B+ drops to 2, neither Nevada-focused. Capital continuum breaks at $10M+ ARR. Companies systematically relocate to Bay Area or Austin for Series B capital.',
    frameworkSource: 'Kauffman',
    severity: 'critical',
    x1: 8.5, x2: 10.0, y1: 8.8, y2: 10.0,
    color: '#e05c5c', dashPattern: '4,3', fillOpacity: 0.15,
    labelPosition: { top: true, right: false },
  },
  {
    id: 'rural',
    label: 'Rural IDE Desert',
    shortLabel: 'RID',
    description: 'IDE-track accelerator and venture resources are entirely absent across rural Nevada counties (Elko, White Pine, Lyon, Churchill, Humboldt). USDA and EDA both fund rural innovation programs; Nevada has RNDC only at concept stage.',
    frameworkSource: 'USDA',
    severity: 'watch',
    x1: 0.0, x2: 4.0, y1: 2.2, y2: 5.0,
    color: '#2ecfa0', dashPattern: '4,5', fillOpacity: 0.10,
    labelPosition: { top: true, right: true },
  },
];

export const GAP_IDS = POLICY_GAPS.map(g => g.id);
