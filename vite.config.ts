import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { cwd } from 'process';
import path from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, cwd(), ''); // Load .env variables

    if (!env.VITE_JIRA_BASE_URL) {
        console.error('Error: VITE_JIRA_BASE_URL is not defined in .env');
        process.exit(1);
    }

    return {
        define: {
            __APP_ENV__: JSON.stringify(env.APP_ENV),
        },
        build: {
            outDir: 'dist',
            rollupOptions: {
                input: {
                    main: path.resolve(__dirname, 'index.html')
                }
            }
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
                '/api/jira': {
                    target: env.VITE_JIRA_BASE_URL,
                    secure: false,
                    changeOrigin: true,
                    headers: {
                        'X-Atlassian-Token': 'no-check',
                        origin: env.VITE_JIRA_BASE_URL,
                        'User-Agent': 'test',
                    },
                    rewrite: (path) => path.replace(/^\/api\/jira/, ''), // Corrected path rewrite syntax
                },
            },
        },
    };
});
