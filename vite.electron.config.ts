import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    outDir: 'dist-electron',
    emptyOutDir: true,
    lib: {
      entry: {
        main: path.resolve(__dirname, 'electron/main.ts'),
        preload: path.resolve(__dirname, 'electron/preload.ts'),
      },
      formats: ['cjs'],
    },
    rollupOptions: {
      external: [
        'electron',
        'path',
        'fs',
        'url',
        'events',
        'os',
        'crypto',
        'http',
        'https',
      ],
      output: {
        entryFileNames: '[name].js',
      },
    },
    target: 'node20',
    minify: false,
  },
});
