import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  build: {
    // Modern syntax — smaller output, no legacy polyfills
    target: 'es2020',
    // esbuild minification (default in Vite 6) is faster than terser
    // and produces comparable output sizes
    minify: 'esbuild',
    cssMinify: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // ── Vendor: React runtime ──────────────────────────────────────────
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor';
          }

          // ── Vendor: TanStack Query ─────────────────────────────────────────
          if (id.includes('node_modules/@tanstack/')) {
            return 'query';
          }

          // ── Vendor: D3 (only loaded when graph tab is opened) ─────────────
          if (id.includes('node_modules/d3') || id.includes('node_modules/d3-')) {
            return 'd3';
          }

          // ── Vendor: Three.js + 3d-force-graph (only for GalaxyView) ──────
          // three.js is ~1MB+ minified; bundling it with 3d-force-graph
          // keeps them together (they share imports) and out of the 2D
          // graph chunk. Only loaded when the Galaxy 3D view is opened.
          if (
            id.includes('node_modules/three/') ||
            id.includes('node_modules/three-') ||
            id.includes('node_modules/3d-force-graph') ||
            id.includes('node_modules/three-spritetext') ||
            id.includes('node_modules/accessor-fn') ||
            id.includes('node_modules/kapsule')
          ) {
            return 'three-vendor';
          }

          // ── Feature: Galaxy 3D view (separate from 2D graph) ──────────────
          if (
            id.includes('/components/graph/GalaxyView') ||
            id.includes('/components/graph/GalaxyHud')
          ) {
            return 'galaxy';
          }

          // ── Feature: 2D graph components (lazy-loaded together) ───────────
          if (
            id.includes('/components/graph/') ||
            id.includes('/hooks/useGraphLayout') ||
            id.includes('/workers/d3-layout.worker')
          ) {
            return 'graph';
          }
        },
      },
    },
  },
})
