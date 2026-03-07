import { useState, lazy, Suspense } from 'react';
import { FilterProvider } from './hooks/useFilters';
import { AppShell } from './components/layout/AppShell';
import { Header } from './components/layout/Header';
import { ViewTabs } from './components/layout/ViewTabs';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';

const WeeklyBriefView = lazy(() => import('./components/brief/WeeklyBriefView').then(m => ({ default: m.WeeklyBriefView })));
const GoedView = lazy(() => import('./components/goed/GoedView').then(m => ({ default: m.GoedView })));
const GraphView = lazy(() => import('./components/graph/GraphView').then(m => ({ default: m.GraphView })));

const TabFallback = () => (
  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
    Loading...
  </div>
);

export default function App() {
  const [view, setView] = useState('executive');

  return (
    <FilterProvider>
      <AppShell>
        <Header activeView={view} onViewChange={setView} />
        <ViewTabs active={view} onChange={setView} />

        <div className="fade-in" key={view}>
          {view === 'executive' && <ExecutiveDashboard />}
          <Suspense fallback={<TabFallback />}>
            {view === 'brief' && <WeeklyBriefView />}
            {view === 'goed' && <GoedView />}
            {view === 'graph' && <GraphView />}
          </Suspense>
        </div>
      </AppShell>
    </FilterProvider>
  );
}
