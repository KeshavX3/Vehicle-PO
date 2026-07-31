import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-404-for-github-pages',
      closeBundle() {
        const distPath = path.resolve(__dirname, 'dist');
        const indexPath = path.resolve(distPath, 'index.html');
        const fourOhFourPath = path.resolve(distPath, '404.html');
        if (fs.existsSync(indexPath)) {
          fs.copyFileSync(indexPath, fourOhFourPath);
        }
      },
    },
  ],
  base: process.env.NODE_ENV === 'production' ? '/Vehicle-PO/' : '/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5109',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
});
