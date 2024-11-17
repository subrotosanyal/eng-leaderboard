import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { cwd } from 'process';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), '')
  return {
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      host: true,
      port: 5173,
      watch: {
        usePolling: true,
      },
      proxy: {
        "/rest": {
          target: env.VITE_JIRA_BASE_URL,
          changeOrigin: true,
          secure: false,
          headers: {
            origin: env.VITE_JIRA_BASE_URL,
          }
        },
      },
    }
  }
})