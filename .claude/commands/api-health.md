# API Health Check

Quick check that the BBI API server is running and serving data correctly.

## Steps
1. Check API health endpoint
2. Verify both verticals are registered
3. Sample data counts for each vertical

```bash
export PATH="/c/Users/shaqc/AppData/Roaming/nvm/v20.18.1:$PATH"
node -e "
fetch('http://localhost:3001/api/health')
  .then(r => r.json())
  .then(d => {
    console.log('API Status:', JSON.stringify(d, null, 2));
    return Promise.all(d.verticals.map(v =>
      fetch('http://localhost:3001/api/' + v + '/data')
        .then(r => r.json())
        .then(data => ({
          vertical: v,
          companies: data.companies.length,
          edges: data.verifiedEdges.length,
          people: data.people.length,
          externals: data.externals.length
        }))
    ));
  })
  .then(stats => console.log('Data:', JSON.stringify(stats, null, 2)))
  .catch(e => console.error('API not running:', e.message));
"
```
