import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//
// In this template the frontend and backend run SEPARATELY:
//   - Vite dev server: http://localhost:5173
//   - NestJS API:      http://localhost:3000/api  (CORS-enabled)
//
// The API base URL is read at runtime from public/config.json (api.base_url),
// so no build-time proxy is required. If you prefer a dev proxy instead of
// cross-origin requests, uncomment the `server.proxy` block below and set
// api.base_url to "" in public/config.json.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // bind 0.0.0.0 so the dev server is reachable from other hosts
    port: 5173,
    allowedHosts: true, // accept requests for any Host header (e.g. a server domain)
    // proxy: {
    //   '/api': { target: 'http://localhost:3000', changeOrigin: true },
    // },
  },
  preview: {
    // `vite preview` serves the production build (used by scripts/server_*).
    host: true,
    port: 4173,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
