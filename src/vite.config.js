import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({mode}) => ({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  },
  define: {
    __firebase_config: JSON.stringify(process.env.VITE_FIREBASE_CONFIG || '{}'),
    __app_id: JSON.stringify(process.env.VITE_APP_ID || 'brutus-ai'),
    __initial_auth_token: JSON.stringify(process.env.VITE_INITIAL_AUTH_TOKEN || '')
  }
}))
