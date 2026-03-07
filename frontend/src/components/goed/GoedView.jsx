import { useState, useMemo } from 'react';
import { MainGrid } from '../layout/AppShell';
import { useGoedSummary } from '../../api/hooks';
import { STAKEHOLDERS, getKnowledgeFundEdges } from '../../data/stakeholders';
import { deriveStakeholderData } from './stakeholder-utils';
import { StakeholderSelector } from './StakeholderSelector';
import { SsbciKpiStrip } from './SsbciKpiStrip';
import { StakeholderPanel } from './StakeholderPanel';
import { KnowledgeFundPanel } from './KnowledgeFundPanel';
import styles from './GoedView.module.css';

export function GoedView() {
  const [activeStakeholder, setActiveStakeholder] = useState('government');
  const { funds, graph, companies, isLoading } = useGoedSummary();

  const knowledgeFundEdges = useMemo(
    () => getKnowledgeFundEdges(graph.edges),
    [graph.edges]
  );

  const stakeholderData = useMemo(
    () => deriveStakeholderData(activeStakeholder, graph, funds, companies),
    [activeStakeholder, graph, funds, companies]
  );

  const activeConfig = STAKEHOLDERS.find((s) => s.id === activeStakeholder);

  if (isLoading) {
    return (
      <MainGrid>
        <div className={styles.loading}>Loading GOED dashboard...</div>
      </MainGrid>
    );
  }

  return (
    <MainGrid>
      <StakeholderSelector
        stakeholders={STAKEHOLDERS}
        active={activeStakeholder}
        onChange={setActiveStakeholder}
      />
      <SsbciKpiStrip funds={funds} />
      <StakeholderPanel stakeholder={activeConfig} data={stakeholderData} />
      <KnowledgeFundPanel
        knowledgeFundEdges={knowledgeFundEdges}
        allEdges={graph.edges}
        nodes={graph.nodes}
      />
    </MainGrid>
  );
}
