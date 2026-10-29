import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// base: './' keeps asset URLs relative, so `dist/` works both at a domain root
// and in a GitHub Pages sub-path (e.g. /water-cycle-explorer/).
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    // Thread pool keeps tests runnable in restricted sandboxes as well as locally.
    pool: 'threads',
    setupFiles: ['src/test/setup.ts'],
    css: false,
  },
});
