# Migrate Data to SQLite

Import static JS data files into the SQLite database for a vertical.

## Usage
```bash
export PATH="/c/Users/shaqc/AppData/Roaming/nvm/v20.18.1:$PATH"
node services/api/src/migrate.js --vertical $ARGUMENTS --path apps/$ARGUMENTS
```

Example: `/migrate goed` runs:
```bash
node services/api/src/migrate.js --vertical goed --path apps/goed
```

Migration is idempotent — clears existing data for the vertical and re-inserts.
Always run after modifying any data files in `apps/{vertical}/src/data/`.
