import { STAKEHOLDER_MAP } from '../../data/stakeholders';

/**
 * Derive entities, relationships, and metrics for a stakeholder category
 * from the graph data, funds, and companies.
 */
export function deriveStakeholderData(stakeholderId, graph, funds, companies) {
  const config = STAKEHOLDER_MAP[stakeholderId];
  if (!config) return { entities: [], relationships: [], metrics: {} };

  const { nodes, edges } = graph;

  switch (stakeholderId) {
    case 'government':
      return deriveGovernmentData(config, nodes, edges);
    case 'universities':
      return deriveUniversityData(config, nodes, edges);
    case 'corporate':
      return deriveCorporateData(config, nodes, edges);
    case 'risk_capital':
      return deriveRiskCapitalData(config, nodes, edges, funds);
    case 'entrepreneurs':
      return deriveEntrepreneurData(config, nodes, edges, companies);
    default:
      return { entities: [], relationships: [], metrics: {} };
  }
}

function deriveGovernmentData(config, nodes, edges) {
  const entities = nodes.filter(
    (n) =>
      (config.entityIds || []).includes(n.id) ||
      (config.entityTypes || []).includes(n.etype)
  );
  const entityIds = new Set(entities.map((n) => n.id));
  const relationships = edges.filter(
    (e) =>
      config.edgeRels.includes(e.rel) &&
      (entityIds.has(e.source) || entityIds.has(e.target))
  );

  return {
    entities,
    relationships,
    metrics: {
      agencies: entities.length,
      relationships: relationships.length,
      programs: relationships.filter((e) => e.rel === 'manages' || e.rel === 'funds').length,
    },
  };
}

function deriveUniversityData(config, nodes, edges) {
  const entities = nodes.filter(
    (n) =>
      (config.entityIds || []).includes(n.id) ||
      (config.entityTypes || []).includes(n.etype) ||
      (config.knowledgeFundTargets || []).includes(n.id)
  );
  const entityIds = new Set(entities.map((n) => n.id));
  const relationships = edges.filter(
    (e) =>
      config.edgeRels.includes(e.rel) &&
      (entityIds.has(e.source) || entityIds.has(e.target))
  );

  const knowledgeFundCount = (config.knowledgeFundTargets || []).filter((id) =>
    nodes.some((n) => n.id === id)
  ).length;

  return {
    entities,
    relationships,
    metrics: {
      institutions: entities.filter((e) =>
        (config.entityTypes || []).includes(e.etype)
      ).length,
      knowledgeFundPrograms: knowledgeFundCount,
      partnerships: relationships.length,
    },
  };
}

function deriveCorporateData(config, nodes, edges) {
  const entities = nodes.filter(
    (n) => (config.entityTypes || []).includes(n.etype)
  );
  const entityIds = new Set(entities.map((n) => n.id));
  const relationships = edges.filter(
    (e) =>
      config.edgeRels.includes(e.rel) &&
      (entityIds.has(e.source) || entityIds.has(e.target))
  );

  return {
    entities: entities.sort((a, b) => {
      const aRels = relationships.filter(
        (e) => e.source === a.id || e.target === a.id
      ).length;
      const bRels = relationships.filter(
        (e) => e.source === b.id || e.target === b.id
      ).length;
      return bRels - aRels;
    }),
    relationships,
    metrics: {
      corporations: entities.length,
      partnerships: relationships.length,
      strategicInvestors: entities.filter((n) =>
        n.note && n.note.toLowerCase().includes('investor')
      ).length,
    },
  };
}

function deriveRiskCapitalData(config, nodes, edges, funds) {
  const ssbci = funds.filter((f) =>
    (config.ssbciFundIds || []).includes(f.id)
  );
  const totalAllocated = ssbci.reduce((s, f) => s + (f.allocated || 0), 0);
  const totalDeployed = ssbci.reduce((s, f) => s + (f.deployed || 0), 0);

  const vcNodes = nodes.filter(
    (n) => (config.entityTypes || []).includes(n.etype)
  );
  const accelNodes = nodes.filter(
    (n) => (config.acceleratorIds || []).includes(n.id)
  );

  const ssbciFundEntities = ssbci.map((f) => ({
    id: `f_${f.id}`,
    name: f.name,
    type: 'fund',
    etype: 'SSBCI',
    note: `$${f.allocated || 0}M allocated, $${f.deployed || 0}M deployed`,
  }));

  const entities = [...ssbciFundEntities, ...accelNodes, ...vcNodes];
  const entityIds = new Set(entities.map((n) => n.id));
  const relationships = edges.filter(
    (e) =>
      config.edgeRels.includes(e.rel) &&
      (entityIds.has(e.source) || entityIds.has(e.target))
  );

  return {
    entities,
    relationships,
    metrics: {
      ssbciAllocated: totalAllocated,
      ssbciDeployed: totalDeployed,
      deploymentRate:
        totalAllocated > 0
          ? Math.round((totalDeployed / totalAllocated) * 100)
          : 0,
      vcFirms: vcNodes.length,
    },
  };
}

function deriveEntrepreneurData(config, nodes, edges, companies) {
  const companyEntities = (companies || []).map((c) => ({
    id: `c_${c.id}`,
    name: c.name,
    type: 'company',
    etype: c.stage,
    note: c.city,
    funding: c.funding,
    momentum: c.momentum,
    grade: c.grade,
  }));

  const founderNodes = nodes.filter((n) => n.type === 'person');

  const relationships = edges.filter(
    (e) => config.edgeRels.includes(e.rel)
  );

  const stages = {};
  for (const c of companies || []) {
    stages[c.stage] = (stages[c.stage] || 0) + 1;
  }

  return {
    entities: companyEntities,
    relationships,
    metrics: {
      companies: (companies || []).length,
      founders: founderNodes.length,
      totalFunding: Math.round(
        (companies || []).reduce((s, c) => s + (c.funding || 0), 0)
      ),
      avgMomentum: Math.round(
        (companies || []).reduce((s, c) => s + (c.momentum || 0), 0) /
          ((companies || []).length || 1)
      ),
    },
  };
}
