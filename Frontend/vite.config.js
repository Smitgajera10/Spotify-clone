import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(),react()],
  build: {
    target: "modules",
    minify: "esbuild",
    chunkSizeWarningLimit: 1000
    }
})
