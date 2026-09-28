import { defineConfig } from 'vite'

// Relative base so the build works from any subfolder (GitHub Pages serves it at /<repo>/versao-2/).
export default defineConfig({
  base: './',
})
