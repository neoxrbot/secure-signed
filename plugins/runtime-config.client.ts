export default defineNuxtPlugin(() => {
   const config = useRuntimeConfig()
   if (process.client) {
      config.public.baseURL = config.public.baseURL || window.location.origin
   }
})