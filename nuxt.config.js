export default defineNuxtConfig({
   compatibilityDate: '2024-04-03',
   devtools: { enabled: false },
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
      preset: 'cloudflare-pages'
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
      public: {
         title: 'Secure Signed',
         tagline: 'Security & CDN Utilities',
         baseURL: '/',
         popup: {
            title: 'Neoxr API',
            description: 'Cheap, fast, and developer-ready Web APIs. Integrate in minutes, scale with ease.',
            link: 'https://api.neoxr.eu'
         }
      }
   }
})