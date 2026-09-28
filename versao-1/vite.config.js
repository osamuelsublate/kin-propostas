import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the build works from any subfolder (GitHub Pages serves it at /<repo>/versao-1/).
export default defineConfig({
  base: './',
  plugins: [react()],
})
