import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { localeFormatter } from './src/plugins/locale-formatter'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    localeFormatter({
      localesDir: 'src/locales',
      spacing: true
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
