// plugins/nprogress.client.js
import NProgress from 'nprogress'

export default defineNuxtPlugin((nuxtApp) => {
   NProgress.configure({ showSpinner: false })

   // Hook bawaan Nuxt saat SPA navigasi dimulai
   nuxtApp.hook('page:start', () => {
      NProgress.start()
   })

   // Hook bawaan Nuxt saat SPA navigasi selesai
   nuxtApp.hook('page:finish', () => {
      NProgress.done()
   })
})