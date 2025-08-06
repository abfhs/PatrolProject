import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../public',
    emptyOutDir: false, // Don't delete existing files in public folder
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // rewrite 제거 - 이제 백엔드가 /api prefix를 처리함
      },
    },
  },
  optimizeDeps: {
    exclude: ['@react-devtools/core'],
  },
})