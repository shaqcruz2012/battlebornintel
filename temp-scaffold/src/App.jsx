import { useState } from 'react';
import { FilterProvider } from './hooks/useFilters';
import { AppShell } from './components/layout/AppShell';
import { Header } from './components/layout/Header';
import { ViewTabs } from './components/layout/ViewTabs';

export default function App() {
  const [view, setView] = useState('executive');

  return (
    <FilterProvider>
      <AppShell>
        <Header activeView={view} onViewChange={setView} />
        <ViewTabs active={view} onChange={setView} />

        {view === 'executive' && (
          <div style={{ color: 'var(--text-secondary)', padding: 'var(--space-xl)' }}>
            Executive Dashboard — loading...
          </div>
        )}

        {view === 'graph' && (
          <div style={{ color: 'var(--text-secondary)', padding: 'var(--space-xl)' }}>
            Graph Intelligence — loading...
          </div>
        )}
      </AppShell>
    </FilterProvider>
  );
}
