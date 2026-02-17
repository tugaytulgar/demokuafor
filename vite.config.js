import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages proje sayfası: https://kullanici.github.io/repo-adi/ → base: '/repo-adi/'
  // CI'da VITE_BASE_URL ile ayarlanır; yerelde varsayılan '/' (kök)
  base: process.env.VITE_BASE_URL || '/',
})
