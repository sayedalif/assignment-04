import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://libary-management-backend.vercel.app',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log(
              '🔄 Proxying request:',
              req.method,
              req.url,
              '→',
              'https://libary-management-backend.vercel.app' + req.url
            );
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log(
              '✅ Proxy response:',
              req.method,
              req.url,
              '→',
              proxyRes.statusCode
            );
          });
        },
      },
    },
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
