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
    // Raise the inline warning threshold slightly — our worker is intentionally small
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
          // D3 is only imported by graph-related files, but splitting it into
          // its own chunk lets the browser cache it independently and allows
          // the graph lazy chunk to stay small.
          if (id.includes('node_modules/d3') || id.includes('node_modules/d3-')) {
            return 'd3';
          }

          // ── Feature: graph components (lazy-loaded together) ──────────────
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
