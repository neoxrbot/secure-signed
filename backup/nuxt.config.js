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
      'nprogress/nprogress.css',
      'bootstrap/dist/css/bootstrap.min.css',
      'bootstrap-icons/font/bootstrap-icons.css',
      '~/assets/css/style.css'
   ],
   app: {
      head: {
         title: 'Securly Sign - Security & CDN Utilities',
         meta: [
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { name: 'description', content: 'URL Shortener, File Hosting, Web Proxy, and Signed CDN Service' }
         ]
      }
   }
})