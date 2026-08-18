import { getCloudflareEnv, jsonResponse } from '../utils/index.js'
import { getGlobalStats, getWeeklyStats } from '../utils/database.js'
import appConfig from '../utils/app-config.js'

export default defineEventHandler(async (event) => {
   const env = getCloudflareEnv(event)
   const db = env.DB

   try {
      const stats = await getGlobalStats(db)
      const weekly = await getWeeklyStats(db)

      return jsonResponse(event, {
         creator: appConfig.watermark.creator,
         status: true,
         data: {
            ...stats,
            weekly
         }
      })
   } catch (err) {
      return jsonResponse(event, {
         creator: appConfig.watermark.creator,
         status: false,
         msg: err.message
      }, 500)
   }
})