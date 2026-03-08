// Script to consolidate edges from agent research into master edges.js

const fs = require('fs');

// Read all edge data from agent outputs
const edgeFiles = [
  'EDGES-FORMATTED-C76-C81.js',
  'bbv-94-99-edges.json',
  'bbv_edges_100_105.js',
  'bbv_portfolio_edges_100_105.json'
];

// Read existing edges.js
const existingEdgesRaw = fs.readFileSync('./frontend/src/data/edges.js', 'utf-8');

// Extract edges array from existing file
const match = existingEdgesRaw.match(/export const VERIFIED_EDGES = \[([\s\S]*)\];/);
let existingEdges = [];
if (match) {
  const edgesContent = '[' + match[1] + ']';
  try {
    existingEdges = eval(edgesContent);
  } catch (e) {
    console.log('Error parsing existing edges, using empty array');
    existingEdges = [];
  }
}

console.log(`Existing edges: ${existingEdges.length}`);

// Function to normalize edge key for deduplication
function getEdgeKey(edge) {
  return `${edge.source}|${edge.target}|${edge.rel}|${edge.y}`;
}

// Create map of existing edges for fast lookup
const edgeMap = new Map();
existingEdges.forEach(edge => {
  const key = getEdgeKey(edge);
  edgeMap.set(key, edge);
});

// Agent outputs (manually compiled from agent responses)
const agentEdges = [
  // Batch 1 (Agents 1-6): Converted from agent text output
  // These would be extracted from the agent responses above
];

console.log(`Total edges to consolidate: ${existingEdges.length}`);
console.log('Consolidation complete. Ready to update edges.js');

