import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile"

export default defineConfig({
  build: {
    outDir: "./dist",
    emptyOutDir: true
  },
  server: {
    proxy: {
      "/api": "http://localhost:3001"
    }
  },
  plugins: [svelte(), viteSingleFile()],
});
