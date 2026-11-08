import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const API_URL = process.env.API_URL ?? 'http://localhost:3000'

const proxy = {
  '/api': {
    target: API_URL,
    rewrite: (url: string) => url.replace(/^\/api/, ''),
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: { proxy },
  preview: { proxy },
})
