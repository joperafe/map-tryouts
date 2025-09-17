import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { localeFormatter } from './src/plugins/locale-formatter'
import { buildMetadata } from './src/plugins/build-metadata'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Simple base path for production deployment
  const basePath = process.env.NODE_ENV === 'production' ? '/map-tryouts/' : '/';

  return {
    base: basePath,
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
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            leaflet: ['leaflet', 'react-leaflet'],
          },
        },
      },
    },
    server: {
      port: 5000,
      open: true,
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.VITE_BASE_PATH': JSON.stringify(basePath),
      'process.env.VITE_ENVIRONMENT': JSON.stringify(process.env.VITE_ENVIRONMENT || 'PROD'),
    },
  };
})
