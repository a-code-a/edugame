import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    preview: {
      port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
      host: '0.0.0.0',
      strictPort: true,
      allowedHosts: ['all'], // Allow all hosts for Render deployment
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.OPENROUTER_API_KEY),
      'process.env.OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
