import { cleanDatabase } from '../utils/database.js'
import appConfig from '../utils/app-config.js'

export default defineEventHandler(async (event) => {
   const query = getQuery(event)
   const env = event.context.cloudflare?.env || {}

   if (query.secret !== env.CRON_SECRET) {
      return { status: false, msg: 'Unauthorized' }
   }

   const stats = await cleanDatabase(env.DB, 30)
   return jsonResponse(event, {
      creator: appConfig.watermark.creator,
      status: true,
      stats
   })
})