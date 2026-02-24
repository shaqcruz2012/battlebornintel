/**
 * Layout algorithm configurations for Cytoscape.js
 * 6 algorithms: force, hierarchical, radial, grid, circle, breadthfirst
 * All layouts use fit:true and boundingBox is applied dynamically in CytoscapeGraph
 * for geometric layouts (circle, grid, concentric, breadthfirst).
 */

export const LAYOUTS = {
  force: {
    label: 'Force',
    icon: '⊛',
    config: {
      name: 'cose',
      animate: 'end',
      animationDuration: 600,
      nodeRepulsion: function () { return 8000; },
      idealEdgeLength: function (edge) {
        const rel = edge.data('rel');
        if (rel === 'operates_in' || rel === 'headquartered_in') return 60;
        if (rel === 'eligible_for') return 80;
        if (rel === 'program_of' || rel === 'housed_at') return 70;
        if (rel === 'accelerated_by' || rel === 'won_pitch') return 90;
        return 100;
      },
      edgeElasticity: function () { return 45; },
      randomize: true,
      nodeOverlap: 20,
      gravity: 0.25,
      numIter: 1000,
      initialTemp: 300,
      coolingFactor: 0.95,
      minTemp: 1.0,
      fit: true,
      padding: 30,
    },
  },

  hierarchical: {
    label: 'Hierarchy',
    icon: '⊟',
    config: {
      name: 'dagre',
      animate: true,
      animationDuration: 600,
      rankDir: 'TB',
      nodeSep: 25,
      rankSep: 50,
      edgeSep: 10,
      fit: true,
      padding: 30,
    },
  },

  radial: {
    label: 'Radial',
    icon: '◎',
    config: {
      name: 'concentric',
      animate: true,
      animationDuration: 600,
      concentric: function (node) {
        return node.scratch('_pr') || node.degree();
      },
      levelWidth: function () {
        return 3;
      },
      minNodeSpacing: 8,
      fit: true,
      padding: 20,
    },
  },

  grid: {
    label: 'Grid',
    icon: '⊞',
    config: {
      name: 'grid',
      animate: true,
      animationDuration: 600,
      fit: true,
      padding: 20,
      avoidOverlap: true,
      avoidOverlapPadding: 5,
      condense: true,
      sort: function (a, b) {
        const order = {
          fund: 0,
          accelerator: 1,
          ecosystem: 2,
          company: 3,
          external: 4,
          person: 5,
          sector: 6,
          region: 7,
          exchange: 8,
        };
        const ta = order[a.data('type')] ?? 9;
        const tb = order[b.data('type')] ?? 9;
        if (ta !== tb) return ta - tb;
        return (b.data('funding') || 0) - (a.data('funding') || 0);
      },
    },
  },

  circle: {
    label: 'Circle',
    icon: '◯',
    config: {
      name: 'circle',
      animate: true,
      animationDuration: 600,
      fit: true,
      padding: 20,
      avoidOverlap: true,
      spacingFactor: 0.6,
      sort: function (a, b) {
        return (a.data('type') || '').localeCompare(b.data('type') || '');
      },
    },
  },

  breadthfirst: {
    label: 'Tree',
    icon: '⊤',
    config: {
      name: 'breadthfirst',
      animate: true,
      animationDuration: 600,
      directed: true,
      spacingFactor: 0.8,
      fit: true,
      padding: 20,
      circle: false,
    },
  },
};

export const LAYOUT_ORDER = [
  'force',
  'hierarchical',
  'radial',
  'grid',
  'circle',
  'breadthfirst',
];
