import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    lib: {
      entry: 'src/main.js',
      name: 'BEXTool',
      fileName: () => 'qa-suite.bundle.js',
      formats: ['iife'], // Se autoejecuta al cargarse
    },
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});