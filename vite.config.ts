import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // pdf.js uses top-level await, which needs ES2022 (Chrome 89+, Safari 15+).
  build: {
    target: 'es2022',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    esbuildOptions: { target: 'es2022' },
  },
});
