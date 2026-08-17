import { getCloudflareEnv } from '../utils/index.js'
import { recordHit } from '../utils/database.js'

export default defineEventHandler((event) => {
   const url = getRequestURL(event)

   if (url.pathname.startsWith('/_nuxt') || url.pathname.match(/\.(png|jpg|jpeg|gif|svg|css|js|ico|woff2)$/)) {
      return
   }

   const env = getCloudflareEnv(event)
   if (env?.DB) {
      event.waitUntil(recordHit(env.DB))
   }
})