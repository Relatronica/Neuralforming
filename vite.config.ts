import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { processContactRequest, type ContactEnv } from './src/lib/sendContactEmail'
import { seoPlugin } from './vite.seo'

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function contactApiPlugin(env: ContactEnv): Plugin {
  const handle = async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'method_not_allowed' }))
      return
    }

    try {
      const raw = await readBody(req)
      let payload: unknown = {}
      try {
        payload = raw ? JSON.parse(raw) : {}
      } catch {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'invalid_json' }))
        return
      }

      const result = await processContactRequest(payload, env)
      res.statusCode = result.status
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(result.json))
    } catch (err) {
      console.error('[contact] vite middleware', err)
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'send_failed' }))
    }
  }

  return {
    name: 'contact-api',
    configureServer(server) {
      server.middlewares.use('/api/contact', (req, res) => {
        void handle(req, res)
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/contact', (req, res) => {
        void handle(req, res)
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      contactApiPlugin({
        RESEND_API_KEY: env.RESEND_API_KEY,
        CONTACT_TO_EMAIL: env.CONTACT_TO_EMAIL,
        CONTACT_FROM_EMAIL: env.CONTACT_FROM_EMAIL,
      }),
      react(),
      seoPlugin(env.VITE_SITE_URL),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'og.png', 'icon-192.svg', 'icon-512.svg'],
        manifest: {
          name: 'Neuralforming - Gioco Educativo sull\'IA Etica',
          short_name: 'Neuralforming',
          description: 'Parlamento in miniatura per governare l\'IA. Gioco educativo multiplayer, 2–5 giocatori.',
          theme_color: '#0b0f19',
          background_color: '#0b0f19',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/player',
          lang: 'it',
          icons: [
            {
              src: 'icon-192.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
              purpose: 'any'
            },
            {
              src: 'icon-512.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any'
            },
            {
              src: 'apple-touch-icon.png',
              sizes: '180x180',
              type: 'image/png',
              purpose: 'any'
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
  }
})
