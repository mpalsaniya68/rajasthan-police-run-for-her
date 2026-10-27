import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { apiDevPlugin } from './server/viteDevPlugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDevPlugin()],
})
