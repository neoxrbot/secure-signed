export default defineNuxtConfig({
   compatibilityDate: '2026-06-30',
   devtools: { enabled: false },
   nitro: {
      preset: 'cloudflare-pages'
   },
   app: {
      head: {
         title: 'Secure Link Generator',
         htmlAttrs: { lang: 'en' },
         link: [
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
            {
               rel: 'stylesheet',
               href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css'
            },
            {
               rel: 'stylesheet',
               href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap'
            }
         ]
      }
   }
})
