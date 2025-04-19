import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/crime-analysis-system/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  root: '.', // ensures root is client folder
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
