import { getCloudflareEnv } from '../utils/index.js'
import { recordHit } from '../utils/database.js'
import { isValidVisitor } from '../utils/anti-spam.js'

export default defineEventHandler(async (event) => {
   const url = getRequestURL(event)

   if (url.pathname.startsWith('/_nuxt') || url.pathname.match(/\.(png|jpg|jpeg|gif|svg|css|js|ico|woff2)$/)) {
      return
   }

   const env = getCloudflareEnv(event)
   if (!env?.DB) return

   // Only count real visitors. Flood requests are dropped from the stats table.
   if (!(await isValidVisitor(event))) return

   event.waitUntil(recordHit(env.DB))
})