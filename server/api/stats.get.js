import { getCloudflareEnv } from '../utils/cloudflare.js'
import { getGlobalStats, getWeeklyStats } from '../utils/database.js'

export default defineEventHandler(async (event) => {
   const env = getCloudflareEnv(event)
   const db = env?.DB

   if (!db) {
      return { status: false, msg: 'Database connection failed' }
   }

   const globalStats = await getGlobalStats(db)
   const weeklyStats = await getWeeklyStats(db)

   return {
      status: true,
      data: {
         ...globalStats,
         weekly: weeklyStats
      }
   }
})