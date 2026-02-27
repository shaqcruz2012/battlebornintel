# Validate Data

Validate data files for a BBI vertical against the schema contract.

## Usage
Run validation for the specified vertical (or all if none specified):

```bash
export PATH="/c/Users/shaqc/AppData/Roaming/nvm/v20.18.1:$PATH"
node scripts/validate-data.js apps/$ARGUMENTS
```

If no argument provided, validate all verticals:
```bash
export PATH="/c/Users/shaqc/AppData/Roaming/nvm/v20.18.1:$PATH"
node scripts/validate-data.js apps/goed && node scripts/validate-data.js apps/esint
```

Fix all errors before committing. Warnings are advisory.
