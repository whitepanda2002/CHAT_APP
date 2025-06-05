import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Alias for cleaner imports
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000, // Specify a port (optional)
    open: true, // Automatically open the browser
  },
  build: {
    outDir: 'dist', // Output directory
    sourcemap: true, // Enable source maps for debugging
  },
});
