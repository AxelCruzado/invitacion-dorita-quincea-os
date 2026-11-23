import { defineConfig } from 'vite'

const publicHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL

export default defineConfig({
  define: {
    'import.meta.env.VITE_SHARE_ORIGIN': JSON.stringify(publicHost ? `https://${publicHost}` : '')
  },
  server: { host: '0.0.0.0' },
  build: { target: 'es2020' }
})
