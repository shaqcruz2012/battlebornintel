import { useMemo } from 'react';
import { Card } from '../shared/Card';
import styles from './KnowledgeFundPanel.module.css';

export function KnowledgeFundPanel({ knowledgeFundEdges, allEdges, nodes }) {
  const programs = useMemo(() => {
    const targetIds = knowledgeFundEdges.map((e) => e.target);
    return targetIds
      .map((id) => {
        const node = nodes.find((n) => n.id === id);
        const edge = knowledgeFundEdges.find((e) => e.target === id);
        return node ? { ...node, fundingNote: edge?.note } : null;
      })
      .filter(Boolean);
  }, [knowledgeFundEdges, nodes]);

  const programDetails = useMemo(
    () =>
      programs.map((prog) => {
        const partners = nodes.filter((n) =>
          allEdges.some(
            (e) =>
              ((e.source === prog.id && e.target === n.id) ||
                (e.target === prog.id && e.source === n.id)) &&
              ['partners_with', 'collaborated_with', 'invested_in'].includes(
                e.rel
              ) &&
              n.id !== prog.id
          )
        );

        const startups = nodes.filter((n) =>
          allEdges.some(
            (e) =>
              ((e.source === n.id && e.target === prog.id) ||
                (e.source === prog.id && e.target === n.id)) &&
              ['accelerated_by', 'incubated_by', 'housed_at'].includes(e.rel)
          )
        );

        return { program: prog, partners, startups };
      }),
    [programs, allEdges, nodes]
  );

  if (programs.length === 0) return null;

  return (
    <div className={styles.panel}>
      <Card>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Knowledge Fund Programs</h3>
          <span className={styles.badge}>GOED via UNLV ARC</span>
        </div>

        {programDetails.map(({ program, partners, startups }) => (
          <div key={program.id} className={styles.program}>
            <div className={styles.programHeader}>
              <span className={styles.programName}>
                {program.name || program.label}
              </span>
              {program.atype && (
                <span className={styles.programType}>{program.atype}</span>
              )}
            </div>
            {program.fundingNote && (
              <div className={styles.programNote}>{program.fundingNote}</div>
            )}
            {program.note && (
              <div className={styles.programDesc}>{program.note}</div>
            )}
            {partners.length > 0 && (
              <div className={styles.connections}>
                <span className={styles.connLabel}>Partners:</span>{' '}
                {partners.map((p) => p.name || p.label).join(', ')}
              </div>
            )}
            {startups.length > 0 && (
              <div className={styles.connections}>
                <span className={styles.connLabel}>Startups:</span>{' '}
                {startups.map((s) => s.name || s.label).join(', ')}
              </div>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}
