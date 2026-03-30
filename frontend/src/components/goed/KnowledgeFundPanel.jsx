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

  // Pre-build adjacency maps to avoid O(n*m) filtering per recipient
  const { edgesBySource, edgesByTarget } = useMemo(() => {
    const bySource = new Map();
    const byTarget = new Map();
    allEdges.forEach((e) => {
      const src = e.source?.id || e.source;
      const tgt = e.target?.id || e.target;
      if (!bySource.has(src)) bySource.set(src, []);
      bySource.get(src).push(e);
      if (!byTarget.has(tgt)) byTarget.set(tgt, []);
      byTarget.get(tgt).push(e);
    });
    return { edgesBySource: bySource, edgesByTarget: byTarget };
  }, [allEdges]);

  // For each recipient, find partners, startups, and downstream connections
  const recipientDetails = useMemo(
    () =>
      recipients.map((recipient) => {
        const outEdges = edgesBySource.get(recipient.id) || [];
        const inEdges = edgesByTarget.get(recipient.id) || [];
        const allRecipientEdges = [...outEdges, ...inEdges];

        const partnerRels = new Set(['partners_with', 'collaborated_with', 'invested_in']);
        const partnerIds = new Set();
        allRecipientEdges.forEach((e) => {
          if (partnerRels.has(e.rel)) {
            const otherId = (e.source?.id || e.source) === recipient.id
              ? (e.target?.id || e.target)
              : (e.source?.id || e.source);
            if (otherId !== recipient.id) partnerIds.add(otherId);
          }
        });
        const partners = nodes.filter((n) => partnerIds.has(n.id));

        const startupRels = new Set(['accelerated_by', 'incubated_by', 'housed_at']);
        const startupIds = new Set();
        allRecipientEdges.forEach((e) => {
          if (startupRels.has(e.rel)) {
            const otherId = (e.source?.id || e.source) === recipient.id
              ? (e.target?.id || e.target)
              : (e.source?.id || e.source);
            startupIds.add(otherId);
          }
        });
        const startups = nodes.filter((n) => startupIds.has(n.id));

        // Also find companies that received grants_to from this recipient
        const granteeRels = new Set(['grants_to', 'funds']);
        const granteeIds = new Set();
        outEdges.forEach((e) => {
          const tgt = e.target?.id || e.target;
          if (granteeRels.has(e.rel) && tgt !== recipient.id) {
            granteeIds.add(tgt);
          }
        });
        const grantees = nodes.filter((n) => granteeIds.has(n.id));

        return { recipient, partners, startups, grantees };
      }),
    [recipients, edgesBySource, edgesByTarget, nodes]
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
