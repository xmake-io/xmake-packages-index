import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import siteConfig from '../site.config.json'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    __SITE_CONFIG__: JSON.stringify(siteConfig),
  },
  // Static site — served either at root (custom domain) or under /xmake-packages-index/.
  // The base path can be overridden at build time: `VITE_BASE=/foo/ npm run build`.
  base: process.env.VITE_BASE ?? '/',
})
