import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Final single Vite config for repo root
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: {
    __firebase_config: JSON.stringify(process.env.VITE_FIREBASE_CONFIG || '{}'),
    __app_id: JSON.stringify(process.env.VITE_APP_ID || 'brutus-ai'),
    __initial_auth_token: JSON.stringify(process.env.VITE_INITIAL_AUTH_TOKEN || '')
  }
  ,
  // Provide an explicit, empty PostCSS config to avoid searching
  // for nearby JSON/.postcssrc files which can cause parse errors.
  css: {
    postcss: {}
  },
}))
