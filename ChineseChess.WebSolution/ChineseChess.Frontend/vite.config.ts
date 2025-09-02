import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // proxy API calls to ASP.NET backend during dev
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/hub': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        ws: true, // very important for SignalR (WebSocket)
      }
    },
  },
});
