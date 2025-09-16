import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { localeFormatter } from './src/plugins/locale-formatter'
import { buildMetadata } from './src/plugins/build-metadata'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const environment = process.env.VITE_ENVIRONMENT;
  
  // Determine base path based on environment
  let basePath = '/';
  
  if (process.env.NODE_ENV === 'production') {
    if (environment === 'DEV') {
      // release branch → staging environment
      basePath = '/map-tryouts/staging/';
    } else if (environment === 'PROD') {
      // main branch → production environment  
      basePath = '/map-tryouts/';
    } else {
      // fallback for production builds
      basePath = '/map-tryouts/';
    }
  }

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
      port: 3000,
      open: true,
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.VITE_BASE_PATH': JSON.stringify(basePath),
      'process.env.VITE_ENVIRONMENT': JSON.stringify(environment),
    },
  };
})
