# Build Vertical

Production build for a BBI vertical app.

## Usage
```bash
export PATH="/c/Users/shaqc/AppData/Roaming/nvm/v20.18.1:$PATH"
npx pnpm@8 --filter $ARGUMENTS build
```

Example: `/build goed` or `/build esint`

Build output goes to `apps/{vertical}/dist/`. Check for:
- Build errors (missing imports, syntax)
- Bundle size warnings (>500KB triggers Vite warning)
- Successful gzip size (target: <250KB gzipped)
