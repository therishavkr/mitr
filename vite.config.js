import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Tailwind is loaded via CDN script, not compiled — no PostCSS is needed
  // for this project. Setting this inline (even empty) stops Vite/PostCSS
  // from walking up the filesystem and picking up an unrelated
  // postcss.config.js elsewhere on this machine.
  css: {
    postcss: {},
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        emergency: resolve(__dirname, 'emergency.html'),
        directory: resolve(__dirname, 'directory.html'),
        yearbook: resolve(__dirname, 'yearbook.html'),
        faculty: resolve(__dirname, 'pages/faculty-directory.html'),
      },
    },
  },
});
