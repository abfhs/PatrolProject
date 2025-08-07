import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  // 환경변수에서 API URL 가져오기, 기본값은 localhost:3000
  const apiUrl = process.env.VITE_API_BASE_URL || 'http://localhost:3000';
  
  return {
    plugins: [react()],
    build: {
      outDir: '../public',
      emptyOutDir: false, // Don't delete existing files in public folder
    },
    server: {
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          // rewrite 제거 - 이제 백엔드가 /api prefix를 처리함
        },
        // 이미지 프록시는 제거 - NestJS 서버가 실행되지 않을 때 에러 발생
      },
    },
    optimizeDeps: {
      exclude: ['@react-devtools/core'],
    },
  }
})