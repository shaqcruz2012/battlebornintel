import { useState, useMemo } from 'react';
import { useFilters } from '../../hooks/useFilters';
import { MainGrid } from '../layout/AppShell';
import { useGoedSummary } from '../../api/hooks';
import { STAKEHOLDERS, getKnowledgeFundEdges } from '../../data/stakeholders';
import { deriveStakeholderData } from './stakeholder-utils';
import { StakeholderSelector } from './StakeholderSelector';
import { SsbciKpiStrip } from './SsbciKpiStrip';
import { StakeholderPanel } from './StakeholderPanel';
import { KnowledgeFundPanel } from './KnowledgeFundPanel';
import { StakeholderActivityFeed } from './StakeholderActivityFeed';
import styles from './GoedView.module.css';

// Regional thesis data — concise descriptions of each metro's innovation identity
const REGION_PROFILES = {
  las_vegas: {
    name: 'Las Vegas / Southern Nevada',
    thesis:
      'Diversification anchor for a tourism-dependent economy. Growth sectors are tech-enabled hospitality, cleantech tied to data center energy demand, logistics serving the I-15 corridor, and health-tech targeting the LVHN ecosystem.',
    sectors: ['Hospitality Tech', 'Clean Energy', 'Logistics', 'Health Tech', 'Gaming Tech'],
  },
  henderson: {
    name: 'Henderson',
    thesis:
      'Manufacturing and advanced materials hub within Greater Las Vegas. Proximity to Titanium Metals and battery corridor draws defense contractors, aerospace suppliers, and specialty chemicals.',
    sectors: ['Advanced Manufacturing', 'Aerospace', 'Defense', 'Battery Tech'],
  },
  reno: {
    name: 'Reno / Tahoe / Northern Nevada',
    thesis:
      'GOED\'s primary tech relocation target. The Tahoe-Reno Industrial Center anchors EV battery, data center, and advanced manufacturing. UNR\'s engineering programs feed deep-tech startups; proximity to the Bay Area drives out-migration of early-stage companies.',
    sectors: ['EV / Battery', 'Data Centers', 'Advanced Mfg', 'Agri-Tech', 'Mining Tech'],
  },
  carson_city: {
    name: 'Carson City / Capital Region',
    thesis:
      'Policy and regulatory nexus for Nevada\'s innovation programs. State agencies, GOED headquarters, and legislative bodies that govern SSBCI deployment, Knowledge Fund grants, and CVC partnerships are concentrated here.',
    sectors: ['Government', 'Policy', 'Regulatory Tech'],
  },
  north: {
    name: 'Northern Nevada',
    thesis:
      'Resource-rich corridor covering Elko, Winnemucca, and the Battle Mountain mining belt. Critical mineral supply chains — lithium, gold, copper — feed the national EV transition and position Northern Nevada in federal supply chain resilience programs.',
    sectors: ['Mining', 'Critical Minerals', 'Lithium', 'Renewable Energy'],
  },
  south: {
    name: 'Southern Nevada',
    thesis:
      'The broader Greater Las Vegas metro including North Las Vegas and Boulder City. North Las Vegas anchors the Apex Industrial Park — a GOED priority zone for advanced manufacturing. Boulder City hosts Hoover Dam\'s clean power infrastructure.',
    sectors: ['Industrial', 'Clean Power', 'Manufacturing', 'Distribution'],
  },
};

const ALL_NEVADA_PROFILE = {
  name: 'All Nevada',
  thesis:
    'Nevada\'s innovation economy spans two distinct metro clusters — Reno\'s tech relocation corridor in the north and Las Vegas\'s diversification drive in the south — unified by GOED\'s statewide capital deployment programs, knowledge transfer initiatives, and a business-friendly regulatory environment.',
  sectors: ['Tech', 'Clean Energy', 'Advanced Mfg', 'Health Tech', 'Mining', 'Logistics'],
};

function getRegionProfile(region) {
  if (!region || region === 'all') return ALL_NEVADA_PROFILE;
  const key = region.toLowerCase().replace(/\s+/g, '_');
  return REGION_PROFILES[key] || ALL_NEVADA_PROFILE;
}

export function GoedView() {
  const { filters } = useFilters();
  const [activeStakeholder, setActiveStakeholder] = useState('government');
  const { funds, graph, companies, isLoading, error } = useGoedSummary(filters.region);

  const knowledgeFundEdges = useMemo(
    () => getKnowledgeFundEdges(graph.edges),
    [graph.edges]
  );

  const stakeholderData = useMemo(
    () => deriveStakeholderData(activeStakeholder, graph, funds, companies),
    [activeStakeholder, graph, funds, companies]
  );

  const activeConfig = STAKEHOLDERS.find((s) => s.id === activeStakeholder);

  const regionProfile = useMemo(() => getRegionProfile(filters.region), [filters.region]);

  if (isLoading) {
    return (
      <MainGrid>
        <div className={styles.loading}>Loading GOED dashboard...</div>
      </MainGrid>
    );
  }

  if (error) {
    return (
      <MainGrid>
        <div className={styles.errorState}>Failed to load GOED dashboard data. Please try again.</div>
      </MainGrid>
    );
  }

  return (
    <MainGrid>
      {/* ── View header with tagline ─────────────────────── */}
      <div className={styles.viewHeader}>
        <h1 className={styles.viewTitle}>GOED Intelligence Dashboard</h1>
        <p className={styles.viewTagline}>
          Tracking Nevada&rsquo;s innovation economy across risk capital deployment, program
          outcomes, and ecosystem health &mdash; powered by GOED, SSBCI, and Knowledge Fund data
        </p>
      </div>

      {/* ── Stakeholder lens selector ────────────────────── */}
      <StakeholderSelector
        stakeholders={STAKEHOLDERS}
        active={activeStakeholder}
        onChange={setActiveStakeholder}
      />

      {/* ── SSBCI program context ────────────────────────── */}
      <div className={styles.ssbciContext}>
        <span className={styles.ssbciContextIcon}>&#9432;</span>
        <p className={styles.ssbciContextText}>
          <strong>State Small Business Credit Initiative (SSBCI)</strong> &mdash; a U.S. Treasury
          program allocating $10B nationally to strengthen state small-business capital programs.
          Nevada&rsquo;s allocation is channeled through GOED-approved funds targeting seed and
          growth-stage companies that would otherwise face capital gaps.{' '}
          <strong>The leverage ratio</strong> measures how many additional private dollars are
          mobilized for every SSBCI dollar deployed &mdash; a higher ratio signals stronger market
          co-investment confidence.
        </p>
      </div>

      {/* ── SSBCI KPI strip ─────────────────────────────── */}
      <SsbciKpiStrip funds={funds} />

      {/* ── Regional ecosystem analysis ──────────────────── */}
      <div className={styles.regionCallout}>
        <div className={styles.regionCalloutHeader}>
          <h4 className={styles.regionCalloutTitle}>Regional Ecosystem Context</h4>
          <span className={styles.regionCalloutBadge}>
            {filters.region && filters.region !== 'all'
              ? 'Filtered View'
              : 'Statewide View'}
          </span>
        </div>

        <div className={styles.regionCard}>
          <p className={styles.regionName}>{regionProfile.name}</p>
          <p className={styles.regionThesis}>{regionProfile.thesis}</p>
          <div className={styles.regionSectors}>
            {regionProfile.sectors.map((sector) => (
              <span key={sector} className={styles.regionSectorTag}>
                {sector}
              </span>
            ))}
          </div>
        </div>

        {/* Second card: Nevada innovation thesis overview */}
        <div className={styles.regionCard}>
          <p className={styles.regionName}>Nevada Innovation Thesis</p>
          <p className={styles.regionThesis}>
            Nevada competes on cost structure, regulatory speed, and geographic access &mdash; not
            on legacy research density. GOED&rsquo;s strategy pairs aggressive business recruitment
            with homegrown commercialization via the Knowledge Fund, SBIR matching grants, and
            the Nevada CVC network. The bet: anchor early-stage companies before they scale
            elsewhere.
          </p>
          <div className={styles.regionSectors}>
            <span className={styles.regionSectorTag}>No State Income Tax</span>
            <span className={styles.regionSectorTag}>SBIR Match Program</span>
            <span className={styles.regionSectorTag}>Knowledge Fund</span>
            <span className={styles.regionSectorTag}>CVC Network</span>
          </div>
        </div>
      </div>

      {/* ── Stakeholder deep-dive panel ──────────────────── */}
      <StakeholderPanel stakeholder={activeConfig} data={stakeholderData} />

      {/* ── Knowledge Fund programs ──────────────────────── */}
      <KnowledgeFundPanel
        knowledgeFundEdges={knowledgeFundEdges}
        allEdges={graph.edges}
        nodes={graph.nodes}
      />

      {/* ── Live activity feed (Bloomberg-style) ─────────── */}
      <div className={styles.activityFeedWrapper}>
        <StakeholderActivityFeed />
      </div>


      {/* ── Methodology footnote ─────────────────────────── */}
      <div className={styles.methodologyNote}>
        <span className={styles.methodologyIcon}>&#9432;</span>
        <p className={styles.methodologyText}>
          <strong>Data sources:</strong> SBIR.gov (federal award records), Crunchbase (funding
          rounds and investor relationships), GOED annual reports (program metrics, KF grants),
          SEC EDGAR filings (fund disclosures), Nevada SilverFlume business registry, and
          primary research. Entity relationships are derived from public records and may not
          reflect current operational status. Funding figures are reported in USD millions at
          time of round close. Leverage ratios reflect weighted-average private co-investment
          against SSBCI-deployed capital.
        </p>
      </div>
    </MainGrid>
  );
}
