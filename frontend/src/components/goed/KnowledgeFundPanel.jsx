import { useMemo } from 'react';
import { Card } from '../shared/Card';
import styles from './KnowledgeFundPanel.module.css';

/**
 * Extract dollar amounts from an edge note string, e.g. "$2.5M" or "$5M".
 */
function extractAmount(note) {
  if (!note) return null;
  const match = note.match(/\$[\d,.]+\s*[BMK]?/i);
  return match ? match[0] : null;
}

export function KnowledgeFundPanel({ knowledgeFundEdges, allEdges, nodes }) {
  // Build a list of Knowledge Fund recipients from edges.
  // Recipients can be accelerators, universities, ecosystem orgs, or companies.
  const recipients = useMemo(() => {
    return knowledgeFundEdges
      .map((edge) => {
        const node = nodes.find((n) => n.id === edge.target);
        return node
          ? {
              ...node,
              fundingNote: edge.note,
              grantAmount: extractAmount(edge.note),
              grantYear: edge.y,
              grantRel: edge.rel,
            }
          : null;
      })
      .filter(Boolean);
  }, [knowledgeFundEdges, nodes]);

  // For each recipient, find partners, startups, and downstream connections
  const recipientDetails = useMemo(
    () =>
      recipients.map((recipient) => {
        const partners = nodes.filter((n) =>
          allEdges.some(
            (e) =>
              ((e.source === recipient.id && e.target === n.id) ||
                (e.target === recipient.id && e.source === n.id)) &&
              ['partners_with', 'collaborated_with', 'invested_in'].includes(
                e.rel
              ) &&
              n.id !== recipient.id
          )
        );

        const startups = nodes.filter((n) =>
          allEdges.some(
            (e) =>
              ((e.source === n.id && e.target === recipient.id) ||
                (e.source === recipient.id && e.target === n.id)) &&
              ['accelerated_by', 'incubated_by', 'housed_at'].includes(e.rel)
          )
        );

        // Also find companies that received grants_to from this recipient
        const grantees = nodes.filter((n) =>
          allEdges.some(
            (e) =>
              e.source === recipient.id &&
              e.target === n.id &&
              ['grants_to', 'funds'].includes(e.rel) &&
              n.id !== recipient.id
          )
        );

        return { recipient, partners, startups, grantees };
      }),
    [recipients, allEdges, nodes]
  );

  if (recipients.length === 0) return null;

  return (
    <div className={styles.panel}>
      <Card>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Knowledge Fund Programs</h3>
          <span className={styles.badge}>GOED via UNLV / UNR / DRI</span>
        </div>
        <p className={styles.sectionDesc}>
          The Nevada Knowledge Fund channels state grants to university research
          commercialization programs, bridging applied research and private-sector
          innovation.
        </p>

        {recipientDetails.map(({ recipient, partners, startups, grantees }) => (
          <div key={recipient.id} className={styles.program}>
            <div className={styles.programHeader}>
              <span className={styles.programName}>
                {recipient.name || recipient.label}
              </span>
              {recipient.atype && (
                <span className={styles.programType}>{recipient.atype}</span>
              )}
              {recipient.etype && (
                <span className={styles.programType}>{recipient.etype}</span>
              )}
              {recipient.type && recipient.type !== 'unknown' && !recipient.atype && !recipient.etype && (
                <span className={styles.programType}>{recipient.type}</span>
              )}
            </div>
            {recipient.grantAmount && (
              <div className={styles.grantAmount}>
                {recipient.grantAmount} Knowledge Fund grant
                {recipient.grantYear ? ` (${recipient.grantYear})` : ''}
              </div>
            )}
            {recipient.fundingNote && (
              <div className={styles.programNote}>{recipient.fundingNote}</div>
            )}
            {recipient.note && (
              <div className={styles.programDesc}>{recipient.note}</div>
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
            {grantees.length > 0 && (
              <div className={styles.connections}>
                <span className={styles.connLabel}>Grant Recipients:</span>{' '}
                {grantees.map((g) => g.name || g.label).join(', ')}
              </div>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}
