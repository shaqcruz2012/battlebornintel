import { useState, useMemo } from 'react';
import { usePlatform } from '../hooks/usePlatform.js';
import { useW } from '../hooks/useWindowWidth.js';
import { computeScore } from '../engine/scoring.js';
import { fmt } from '../engine/formatters.js';
import { DARK, TEXT, BORDER } from '../styles/tokens.js';
import { css } from '../styles/animations.js';
import Header from './layout/Header.jsx';
import Navigation from './layout/Navigation.jsx';
import DetailPanel from './layout/DetailPanel.jsx';
import CompareBar from './layout/CompareBar.jsx';
import DashboardView from './views/DashboardView.jsx';
import RadarView from './views/RadarView.jsx';
import CompaniesView from './views/CompaniesView.jsx';
import InvestorsView from './views/InvestorsView.jsx';
import SectorsView from './views/SectorsView.jsx';
import WatchlistView from './views/WatchlistView.jsx';
import CompareView from './views/CompareView.jsx';
import GraphView from './views/GraphView.jsx';
import TimelineView from './views/TimelineView.jsx';
import SSBCIView from './views/SSBCIView.jsx';
import MapView from './views/MapView.jsx';
import DocketsView from './views/DocketsView.jsx';
import ForecastView from './views/ForecastView.jsx';
import QueueView from './views/QueueView.jsx';
import PPAView from './views/PPAView.jsx';
import AlertsView from './views/AlertsView.jsx';
import IntelView from './views/IntelView.jsx';
import HorizonView from './views/HorizonView.jsx';
import FeedView from './views/FeedView.jsx';

const VIEW_MAP = {
  dashboard: DashboardView,
  radar: RadarView,
  companies: CompaniesView,
  investors: InvestorsView,
  sectors: SectorsView,
  watchlist: WatchlistView,
  compare: CompareView,
  graph: GraphView,
  timeline: TimelineView,
  ssbci: SSBCIView,
  map: MapView,
  dockets: DocketsView,
  forecast: ForecastView,
  queue: QueueView,
  ppa: PPAView,
  alerts: AlertsView,
  intel: IntelView,
  horizon: HorizonView,
  feed: FeedView,
};

export default function BattleBornIntelligence() {
  const { config, data } = usePlatform();
  const w = useW();
  const isMobile = w < 768;
  const isTablet = w < 1024;

  const [view, setView] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [sortBy, setSortBy] = useState("momentum");
  const [mobileNav, setMobileNav] = useState(false);
  const [mapHover, setMapHover] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [sectorDetail, setSectorDetail] = useState(null);
  const [fundDetail, setFundDetail] = useState(null);

  const filtered = useMemo(() => data.companies.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.sector.join(" ").toLowerCase().includes(search.toLowerCase())) return false;
    if (stageFilter !== "all" && c.stage !== stageFilter) return false;
    if (regionFilter !== "all" && c.region !== regionFilter) return false;
    return true;
  }).sort((a, b) => sortBy === "momentum" ? b.momentum - a.momentum : sortBy === "funding" ? b.funding - a.funding : a.name.localeCompare(b.name)), [data.companies, search, stageFilter, regionFilter, sortBy]);

  const scored = useMemo(() => filtered.map(c => computeScore(c, config.sectorHeat, config)).sort((a, b) => b.irs - a.irs), [filtered, config.sectorHeat, config]);
  const allScored = useMemo(() => data.companies.map(c => computeScore(c, config.sectorHeat, config)), [data.companies, config.sectorHeat, config]);
  const totalFunding = data.companies.reduce((s, c) => s + c.funding, 0);
  const avgMomentum = Math.round(data.companies.reduce((s, c) => s + c.momentum, 0) / data.companies.length);
  const totalEmployees = data.companies.reduce((s, c) => s + c.employees, 0);

  const toggleWatchlist = (id) => setWatchlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);
  const isWatched = (id) => watchlist.includes(id);
  const watchedCompanies = useMemo(() => allScored.filter(c => watchlist.includes(c.id)), [allScored, watchlist]);

  const sectorStats = useMemo(() => {
    const map = {};
    allScored.forEach(c => (c.sector || []).forEach(s => {
      if (!map[s]) map[s] = { name: s, count: 0, totalFunding: 0, totalIRS: 0, companies: [], stages: {} };
      map[s].count++;
      map[s].totalFunding += c.funding;
      map[s].totalIRS += c.irs;
      map[s].companies.push(c);
      map[s].stages[c.stage] = (map[s].stages[c.stage] || 0) + 1;
    }));
    return Object.values(map).map(s => ({
      ...s, avgIRS: Math.round(s.totalIRS / s.count), heat: (config.sectorHeat || {})[s.name] || 50,
      topCompany: s.companies.sort((a, b) => b.irs - a.irs)[0],
    })).sort((a, b) => b.heat - a.heat);
  }, [allScored, config.sectorHeat]);

  const px = isMobile ? 12 : 24;

  const viewProps = {
    config, data, allScored, scored, filtered, isMobile, isTablet,
    search, setSearch, stageFilter, setStageFilter,
    regionFilter, setRegionFilter, sortBy, setSortBy,
    selectedCompany, setSelectedCompany,
    compareList, setCompareList,
    watchlist, toggleWatchlist, isWatched,
    sectorDetail, setSectorDetail, sectorStats,
    fundDetail, setFundDetail,
    setView, totalFunding, avgMomentum, totalEmployees,
    watchedCompanies, mapHover, setMapHover,
  };

  const ActiveView = VIEW_MAP[view];

  return (
    <div style={{ minHeight:"100vh", background:DARK, color:TEXT, fontFamily: config.branding?.fontFamily || "'Libre Franklin','DM Sans',system-ui,sans-serif" }}>
      <style>{css}</style>
      {config.branding?.googleFontsUrl && (
        <link href={config.branding.googleFontsUrl} rel="stylesheet" />
      )}
      <Header config={config} isMobile={isMobile} mobileNav={mobileNav} setMobileNav={setMobileNav} />
      <Navigation views={config.views} view={view} setView={setView} isMobile={isMobile} mobileNav={mobileNav} setMobileNav={setMobileNav} />
      <div style={{ maxWidth:1400, margin:"0 auto" }}>
        {ActiveView && <ActiveView viewProps={viewProps} />}
      </div>
      <DetailPanel
        selectedCompany={selectedCompany}
        setSelectedCompany={setSelectedCompany}
        watchlist={watchlist}
        toggleWatchlist={toggleWatchlist}
        isWatched={isWatched}
        isMobile={isMobile}
        sectorHeat={config.sectorHeat}
        config={config}
      />
      <CompareBar
        compareList={compareList}
        setCompareList={setCompareList}
        setView={setView}
        view={view}
        isMobile={isMobile}
        companies={data.companies}
      />
    </div>
  );
}
