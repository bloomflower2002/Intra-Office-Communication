import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxies /api/* to the local backend during development so the frontend
    // works out of the box without needing VITE_API_BASE_URL set. Override
    // the target with VITE_API_BASE_URL / a .env file if the backend runs
    // somewhere else.
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
