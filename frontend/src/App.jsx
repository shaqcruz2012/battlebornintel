import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { FilterProvider } from './hooks/useFilters';
import { AuthProvider } from './hooks/useAuth';
import { ErrorBoundary, ErrorBoundaryWithReset } from './components/ErrorBoundary';
import { AppShell } from './components/layout/AppShell';
import { Header } from './components/layout/Header';
import { ViewTabs } from './components/layout/ViewTabs';
import { SearchOverlay } from './components/search/SearchOverlay';

const ExecutiveDashboard = lazy(() => import('./components/dashboard/ExecutiveDashboard').then(m => ({ default: m.ExecutiveDashboard })));

const WeeklyBriefView = lazy(() => import('./components/brief/WeeklyBriefView').then(m => ({ default: m.WeeklyBriefView })));
const GoedView = lazy(() => import('./components/goed/GoedView').then(m => ({ default: m.GoedView })));
const GraphView = lazy(() => import('./components/graph/GraphView').then(m => ({ default: m.GraphView })));
const CompaniesView = lazy(() => import('./components/companies/CompaniesView').then(m => ({ default: m.CompaniesView })));
const InvestorsView = lazy(() => import('./components/investors/InvestorsView').then(m => ({ default: m.InvestorsView })));
const StakeholderFeedView = lazy(() => import('./components/feed/StakeholderFeedView').then(m => ({ default: m.StakeholderFeedView })));
const ResourceMatrix = lazy(() => import('./components/ecosystem/ResourceMatrix'));
const EcosystemGaps = lazy(() => import('./components/analytics/EcosystemGaps').then(m => ({ default: m.EcosystemGaps || m.default })));
const RecommendedConnections = lazy(() => import('./components/analytics/RecommendedConnections').then(m => ({ default: m.RecommendedConnections || m.default })));
const CapitalFlowView = lazy(() => import('./components/analytics/CapitalFlowView').then(m => ({ default: m.CapitalFlowView || m.default })));
const IngestionReview = lazy(() => import('./components/ingestion/IngestionReview').then(m => ({ default: m.IngestionReview || m.default })));
const FrontierIntelligence = lazy(() => import('./components/news/FrontierIntelligence').then(m => ({ default: m.FrontierIntelligence || m.default })));
const GalaxyView = lazy(() => import('./components/graph/GalaxyView').then(m => ({ default: m.GalaxyView })));
const EconomicsView = lazy(() => import('./components/economics/EconomicsView').then(m => ({ default: m.EconomicsView || m.default })));

const TabFallback = () => (
  <div style={{ padding: '1.5rem 2rem' }}>
    {/* Skeleton header bar */}
    <div style={{
      height: 14, width: '30%', borderRadius: 3, marginBottom: 16,
      background: 'linear-gradient(90deg, rgba(28,39,51,0.5) 0%, rgba(255,255,255,0.03) 50%, rgba(28,39,51,0.5) 100%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.6s ease-in-out infinite',
    }} />
    {/* Skeleton KPI strip */}
    <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{
          flex: 1, height: 56, borderRadius: 4,
          background: 'linear-gradient(90deg, rgba(28,39,51,0.5) 0%, rgba(255,255,255,0.03) 50%, rgba(28,39,51,0.5) 100%)',
          backgroundSize: '200% 100%', animation: 'shimmer 1.6s ease-in-out infinite',
        }} />
      ))}
    </div>
    {/* Skeleton content rows */}
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} style={{
        height: 28, borderRadius: 3, marginBottom: 8,
        width: `${85 - i * 8}%`,
        background: 'linear-gradient(90deg, rgba(28,39,51,0.5) 0%, rgba(255,255,255,0.03) 50%, rgba(28,39,51,0.5) 100%)',
        backgroundSize: '200% 100%', animation: 'shimmer 1.6s ease-in-out infinite',
      }} />
    ))}
  </div>
);

export default function App() {
  const [view, setView] = useState('graph');
  const [searchOpen, setSearchOpen] = useState(false);

  // Prefetch the most likely next views during idle time
  useEffect(() => {
    const prefetch = () => {
      import('./components/dashboard/ExecutiveDashboard');
      import('./components/companies/CompaniesView');
      import('./components/brief/WeeklyBriefView');
    };
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(prefetch, { timeout: 4000 });
      return () => cancelIdleCallback(id);
    }
    const timer = setTimeout(prefetch, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Global Cmd+K / Ctrl+K listener — opens the overlay
  useEffect(() => {
    function handleKeydown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  const handleSearchViewChange = useCallback((viewId) => {
    setView(viewId);
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
      <FilterProvider>
        <AppShell>
          <Header activeView={view} onViewChange={setView} />
          <ViewTabs active={view} onChange={setView} />
          <SearchOverlay
            isOpen={searchOpen}
            onClose={() => setSearchOpen(false)}
            onViewChange={handleSearchViewChange}
          />

          <ErrorBoundaryWithReset key={view}>
            <div className="fade-in">
              <Suspense fallback={<TabFallback />}>
                {view === 'executive' && <ExecutiveDashboard onViewChange={setView} />}
              </Suspense>
              <Suspense fallback={<TabFallback />}>
                {view === 'brief' && <WeeklyBriefView />}
                {view === 'companies' && <CompaniesView />}
                {view === 'investors' && <InvestorsView />}
                {view === 'goed' && <GoedView />}
                {view === 'feed' && <StakeholderFeedView />}
                {view === 'graph' && <GraphView />}
                {view === 'galaxy' && <GalaxyView />}
                {view === 'ecosystem' && <ResourceMatrix />}
                {view === 'ecosystemGaps' && <EcosystemGaps />}
                {view === 'capitalFlows' && <CapitalFlowView />}
                {view === 'predictions' && <RecommendedConnections />}
                {view === 'ingestion' && <IngestionReview />}
                {view === 'frontierNews' && <FrontierIntelligence />}
                {view === 'economics' && <EconomicsView />}
              </Suspense>
            </div>
          </ErrorBoundaryWithReset>
        </AppShell>
      </FilterProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
