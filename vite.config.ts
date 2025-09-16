import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { localeFormatter } from './src/plugins/locale-formatter'
import { buildMetadata } from './src/plugins/build-metadata'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/map-tryouts/' : '/',
  plugins: [
    react(),
    localeFormatter({
      localesDir: 'src/locales',
      spacing: true
    }),
    buildMetadata({
      element: 'root',
      dateFormat: 'iso'
    })
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
  },
})
