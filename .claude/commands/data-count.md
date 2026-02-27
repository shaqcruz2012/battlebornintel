# Data Count Summary

Quick count of all entities across all verticals from static data files.

## Steps
For each vertical, count companies, funds, edges, people, externals, etc.

```bash
export PATH="/c/Users/shaqc/AppData/Roaming/nvm/v20.18.1:$PATH"
node -e "
async function count(vertical) {
  const path = './apps/' + vertical + '/src/data/';
  try {
    const c = await import(path + 'companies.js');
    const f = await import(path + 'funds.js');
    const g = await import(path + 'graph.js');
    const t = await import(path + 'timeline.js');
    console.log(vertical.toUpperCase() + ':');
    console.log('  Companies:', (c.COMPANIES||c.default||[]).length);
    console.log('  Funds:', (f.FUNDS||f.default||[]).length);
    console.log('  Edges:', (g.VERIFIED_EDGES||[]).length);
    console.log('  People:', (g.PEOPLE||[]).length);
    console.log('  Externals:', (g.EXTERNALS||[]).length);
    console.log('  Accelerators:', (g.ACCELERATORS||[]).length);
    console.log('  EcosystemOrgs:', (g.ECOSYSTEM_ORGS||[]).length);
    console.log('  Timeline:', (t.TIMELINE_EVENTS||t.default||[]).length);
  } catch(e) { console.log(vertical + ': ' + e.message); }
}
count('goed').then(() => count('esint'));
"
```

Use this before and after adding new data to verify counts changed as expected.
