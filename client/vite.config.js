import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/crime-analysis-system/',
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
