import { useState } from 'react';
import { FilterProvider } from './hooks/useFilters';
import { AppShell } from './components/layout/AppShell';
import { Header } from './components/layout/Header';
import { ViewTabs } from './components/layout/ViewTabs';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { GraphView } from './components/graph/GraphView';

export default function App() {
  const [view, setView] = useState('executive');

  return (
    <FilterProvider>
      <AppShell>
        <Header activeView={view} onViewChange={setView} />
        <ViewTabs active={view} onChange={setView} />

        {view === 'executive' && <ExecutiveDashboard />}
        {view === 'graph' && <GraphView />}
      </AppShell>
    </FilterProvider>
  );
}
