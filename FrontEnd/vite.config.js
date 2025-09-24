import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, './ssl/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, './ssl/cert.pem')),
    },
    host: '0.0.0.0', // Permet l'accès depuis l'IP locale et Docker
    port: 5173,
  },
})