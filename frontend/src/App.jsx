import { useState } from 'react';
import { FilterProvider } from './hooks/useFilters';
import { AppShell } from './components/layout/AppShell';
import { Header } from './components/layout/Header';
import { ViewTabs } from './components/layout/ViewTabs';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { WeeklyBriefView } from './components/brief/WeeklyBriefView';
import { GoedView } from './components/goed/GoedView';
import { GraphView } from './components/graph/GraphView';

export default function App() {
  const [view, setView] = useState('executive');

  return (
    <FilterProvider>
      <AppShell>
        <Header activeView={view} onViewChange={setView} />
        <ViewTabs active={view} onChange={setView} />

        <div className="fade-in" key={view}>
          {view === 'executive' && <ExecutiveDashboard />}
          {view === 'brief' && <WeeklyBriefView />}
          {view === 'goed' && <GoedView />}
          {view === 'graph' && <GraphView />}
        </div>
      </AppShell>
    </FilterProvider>
  );
}
