// server/api/stats.get.js
import { getCloudflareEnv } from '../utils/cloudflare.js'
import { getGlobalStats } from '../utils/database.js'
import appConfig from '../utils/app-config.js'

export default defineEventHandler(async (event) => {
   const env = getCloudflareEnv(event)
   const db = env.DB

   try {
      const stats = await getGlobalStats(db)
      return {
         creator: appConfig.watermark.creator,
         status: true,
         data: stats
      }
   } catch (err) {
      return { status: false, msg: err.message }
   }
})