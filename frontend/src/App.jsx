import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { FilterProvider } from './hooks/useFilters';
import { AuthProvider } from './hooks/useAuth';
import { ErrorBoundary, ErrorBoundaryWithReset } from './components/ErrorBoundary';
import { AppShell } from './components/layout/AppShell';
import { Header } from './components/layout/Header';
import { ViewTabs } from './components/layout/ViewTabs';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { SearchOverlay } from './components/search/SearchOverlay';

const WeeklyBriefView = lazy(() => import('./components/brief/WeeklyBriefView').then(m => ({ default: m.WeeklyBriefView })));
const GoedView = lazy(() => import('./components/goed/GoedView').then(m => ({ default: m.GoedView })));
const GraphView = lazy(() => import('./components/graph/GraphView').then(m => ({ default: m.GraphView })));
const CompaniesView = lazy(() => import('./components/companies/CompaniesView').then(m => ({ default: m.CompaniesView })));
const FundsView = lazy(() => import('./components/funds/FundsView').then(m => ({ default: m.FundsView })));
const InvestorsView = lazy(() => import('./components/investors/InvestorsView').then(m => ({ default: m.InvestorsView })));
const StakeholderFeedView = lazy(() => import('./components/feed/StakeholderFeedView').then(m => ({ default: m.StakeholderFeedView })));
const ResourceMatrix = lazy(() => import('./components/ecosystem/ResourceMatrix'));
const EcosystemGaps = lazy(() => import('./components/analytics/EcosystemGaps').then(m => ({ default: m.EcosystemGaps || m.default })));
const RecommendedConnections = lazy(() => import('./components/analytics/RecommendedConnections').then(m => ({ default: m.RecommendedConnections || m.default })));
const CapitalFlowView = lazy(() => import('./components/analytics/CapitalFlowView').then(m => ({ default: m.CapitalFlowView || m.default })));
const IngestionReview = lazy(() => import('./components/ingestion/IngestionReview').then(m => ({ default: m.IngestionReview || m.default })));
const FrontierIntelligence = lazy(() => import('./components/news/FrontierIntelligence').then(m => ({ default: m.FrontierIntelligence || m.default })));

const TabFallback = () => (
  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
    Loading...
  </div>
);

export default function App() {
  const [view, setView] = useState('executive');
  const [searchOpen, setSearchOpen] = useState(false);

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
              {view === 'executive' && <ExecutiveDashboard onViewChange={setView} />}
              <Suspense fallback={<TabFallback />}>
                {view === 'brief' && <WeeklyBriefView />}
                {view === 'companies' && <CompaniesView />}
                {view === 'funds' && <FundsView />}
                {view === 'investors' && <InvestorsView />}
                {view === 'goed' && <GoedView />}
                {view === 'feed' && <StakeholderFeedView />}
                {view === 'graph' && <GraphView />}
                {view === 'ecosystem' && <ResourceMatrix />}
                {view === 'ecosystemGaps' && <EcosystemGaps />}
                {view === 'capitalFlows' && <CapitalFlowView />}
                {view === 'predictions' && <RecommendedConnections />}
                {view === 'ingestion' && <IngestionReview />}
                {view === 'frontierNews' && <FrontierIntelligence />}
              </Suspense>
            </div>
          </ErrorBoundaryWithReset>
        </AppShell>
      </FilterProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
