import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  appType: 'spa',
  // For production builds, ensure all routes fall back to index.html
  build: {
    rollupOptions: {
      output: {
        // This doesn't directly solve the routing issue, 
        // but ensures proper asset handling
      }
    }
  }
})