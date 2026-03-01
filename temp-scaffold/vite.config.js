import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: __dirname,
  server: {
    port: parseInt(process.env.PORT) || 5173,
    strictPort: true,
    host: '127.0.0.1',
  },
})
