import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


// https://vitejs.dev/config/
export default defineConfig({
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
        target: "https://sightview.atlassian.net/",
        changeOrigin: true,
        secure: false,
        agent: "",
        headers: {
          origin: "https://sightview.atlassian.net",
        }
        // rewrite: (path) => path.replace(/^\/jiraapi/, ""),
      },
    },
  }
});