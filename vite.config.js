import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/v2': {
        target: 'https://secure.madhatv.in',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path // Keep the path as-is
      }
    }
  }
})