import { jsonResponse } from '../utils/index.js'
import { cleanDatabase } from '../utils/database.js'
import appConfig from '../utils/app-config.js'

export default defineEventHandler(async (event) => {
   try {
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
   } catch (err) {
      return jsonResponse(event, {
         creator: appConfig.watermark.creator,
         status: false,
         msg: err.message
      }, 500)
   }
})