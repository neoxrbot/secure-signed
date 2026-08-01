import { ofetch } from 'ofetch'

export default defineNuxtPlugin(() => {
   const config = useRuntimeConfig()

   const api = ofetch.create({
      baseURL: config.public.baseURL as string,
      headers: {
         Accept: 'application/json'
      },
      onRequest({ options }) {}
   })

   return {
      provide: { api }
   }
})