import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Neuralforming - Gioco Educativo sull\'IA Etica',
        short_name: 'Neuralforming',
        description: 'App mobile per giocare a Neuralforming - decisioni politiche per un\'IA sostenibile',
        theme_color: '#3b82f6',
        background_color: '#1e1b4b',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/player',
        icons: [
          {
            src: 'icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [{
          urlPattern: /^https:\/\/api\./,
          handler: 'NetworkFirst'
        }]
      }
    })
  ],
})

