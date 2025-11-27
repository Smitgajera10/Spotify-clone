import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(),react()],
  build: {
    target: "esnext",
    minify: "terser",
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
        output: {
            manualChunks: {
                react: ['react', 'react-dom'],
                player: ['./src/contexts/songContext.js'],
            }
        }
    }
}
})
