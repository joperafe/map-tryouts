import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MapMicroservice',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'leaflet',
        'react-leaflet',
        'leaflet-draw',
        '@react-leaflet/core',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          leaflet: 'L',
          'react-leaflet': 'ReactLeaflet',
          'leaflet-draw': 'LeafletDraw',
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
