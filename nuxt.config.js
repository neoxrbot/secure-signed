import fs from 'node:fs'
import path from 'node:path'

function capitalize(str) {
   if (!str) return ''
   return str.charAt(0).toUpperCase() + str.slice(1)
}

function getApiEndpoints() {
   const apiDir = path.resolve('./server/api')
   if (!fs.existsSync(apiDir)) return []

   const endpoints = []
   const endpointsMap = {}

   function scanDir(dir) {
      const files = fs.readdirSync(dir)
      for (const file of files) {
         const fullPath = path.join(dir, file)
         const stat = fs.statSync(fullPath)

         if (stat.isDirectory()) {
            scanDir(fullPath)
         } else if (file.endsWith('.js') || file.endsWith('.ts')) {
            if (file.includes('endpoints')) continue

            const relativePath = path.relative(apiDir, fullPath).replace(/\\/g, '/')
            const content = fs.readFileSync(fullPath, 'utf-8')

            // 1. Ekstrak meta.name (Wajib)
            const nameMatch = content.match(/name\s*:\s*['"`](.*?)['"`]/)
            if (!nameMatch || !nameMatch[1]) continue

            // 2. Ekstrak meta lainnya
            const categoryMatch = content.match(/category\s*:\s*['"`](.*?)['"`]/)
            const descMatch = content.match(/description\s*:\s*['"`](.*?)['"`]/)
            const premiumMatch = content.match(/premium\s*:\s*(true|false)/)
            const errorMatch = content.match(/error\s*:\s*(true|false)/)
            const paramMatch = content.match(/parameter\s*:\s*\[(.*?)\]/s)

            // Parse parameter array (misal: ['url', 'text'])
            let parameterList = []
            if (paramMatch && paramMatch[1]) {
               parameterList = paramMatch[1]
                  .split(',')
                  .map(s => s.replace(/['"`\s]/g, ''))
                  .filter(Boolean)
            }

            // 3. Deteksi Method & Clean Path
            const methodMatch = file.match(/\.(get|post|put|delete|patch)\.(js|ts)$/)
            const method = methodMatch ? methodMatch[1].toUpperCase() : 'ALL'

            const cleanPath = '/api/' + relativePath
               .replace(/\.(get|post|put|delete|patch)\.(js|ts)$/, '')
               .replace(/\.(js|ts)$/, '')

            const segments = relativePath.split('/')
            const defaultCategory = segments.length > 1 ? capitalize(segments[0]) : 'General'

            const endpointData = {
               path: cleanPath,
               method: method,
               name: nameMatch[1],
               category: categoryMatch ? categoryMatch[1] : defaultCategory,
               description: descMatch ? descMatch[1] : '',
               premium: premiumMatch ? premiumMatch[1] === 'true' : false,
               error: errorMatch ? errorMatch[1] === 'true' : false,
               parameter: parameterList
            }

            endpoints.push(endpointData)
            endpointsMap[cleanPath] = endpointData // Map berdasarkan path URL
         }
      }
   }

   scanDir(apiDir)
   return { endpoints, endpointsMap }
}

const { endpoints, endpointsMap } = getApiEndpoints()

export default defineNuxtConfig({
   compatibilityDate: '2024-04-03',
   devtools: { enabled: false },
   routeRules: {
      '/api/**': {
         cors: true,
         headers: {
            'access-control-allow-origin': '*',
            'access-control-allow-methods': 'GET, POST, OPTIONS'
         }
      }
   },
   devServer: {
      host: '0.0.0.0',
      port: 3000
   },
   vite: {
      server: {
         allowedHosts: true,
         hmr: {
            protocol: 'wss',
            host: 'dev.neoxr.eu',
            clientPort: 443
         }
      }
   },
   ssr: false,
   nitro: {
      preset: 'cloudflare-pages',
      cloudflare: {
         nodeCompat: true
      }
   },
   modules: ['@pinia/nuxt'],
   srcDir: '.',
   css: [
      '~/assets/css/style.css'
   ],
   app: {
      head: {
         title: 'Secure Signed - Security & CDN Utilities',
         meta: [
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { name: 'description', content: 'URL Shortener, File Hosting, Web Proxy, and Signed CDN Service' }
         ],
         link: [
            { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css', crossorigin: 'anonymous' }
         ],
         script: [
            { src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js', crossorigin: 'anonymous' },
         ]
      }
   },
   runtimeConfig: {
      endpointsList: endpoints,
      endpointsMap: endpointsMap,
      public: {
         title: 'Secure Signed',
         tagline: 'Security & CDN Utilities',
         baseURL: 'https://secure-signed.pages.dev',
         popup: {
            title: 'Neoxr API',
            description: 'Cheap, fast, and developer-ready Web APIs. Integrate in minutes, scale with ease.',
            link: 'https://api.neoxr.eu'
         }
      }
   }
})