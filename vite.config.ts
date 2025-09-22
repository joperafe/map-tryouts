import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { localeFormatter } from './src/plugins/locale-formatter'
import { buildMetadata } from './src/plugins/build-metadata'

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  // Detect deployment target
  const isVercel = process.env.VITE_DEPLOYMENT_TARGET === 'vercel' || process.env.VERCEL === '1';
  const isGitHubPages = process.env.VITE_DEPLOYMENT_TARGET === 'github-pages';
  const isProduction = mode === 'production' || command === 'build';
  
  // Set base path based on deployment target
  let basePath = '/';
  if (isProduction) {
    if (isVercel) {
      basePath = '/'; // Vercel uses root path
    } else if (isGitHubPages || (!isVercel && !process.env.VITE_DEPLOYMENT_TARGET)) {
      basePath = '/map-tryouts/'; // Default to GitHub Pages for backward compatibility
    }
  }

  console.log(`🔧 Vite config: mode=${mode}, command=${command}, isProduction=${isProduction}, isVercel=${isVercel}, isGitHubPages=${isGitHubPages}, basePath=${basePath}`);

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
      proxy: {
        '/api/fiware': {
          target: 'https://broker.fiware.urbanplatform.portodigital.pt',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/fiware/, ''),
          secure: false, // Disable SSL verification for development
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (_proxyReq, req) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        },
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.VITE_BASE_PATH': JSON.stringify(basePath),
      'process.env.VITE_ENVIRONMENT': JSON.stringify(process.env.VITE_ENVIRONMENT || 'PROD'),
    },
  };
})
