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
    host: true,
    port: 5173,
    // proxy: {
    //   '/api': { target: 'http://localhost:3000', changeOrigin: true },
    // },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
