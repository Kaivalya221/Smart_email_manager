import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:8080',
      '/gmail-callback': 'http://localhost:8080',
      '/emails': 'http://localhost:8080',
    }
  },
  build: {
    outDir: 'dist',
  }
})
