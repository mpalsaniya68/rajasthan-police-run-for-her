import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { apiDevPlugin } from './server/viteDevPlugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDevPlugin()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('html5-qrcode') || id.includes('qrcode')) {
              return 'scanner-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            if (id.includes('motion') || id.includes('canvas-confetti')) {
              return 'animation-vendor';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
          }
        }
      }
    }
  }
})
