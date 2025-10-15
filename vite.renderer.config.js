
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  root: '.',
  plugins: [svelte()],
  build: { outDir: 'dist', rollupOptions: { input: '/src/renderer/index.html' } }
});
