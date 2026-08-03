import { cleanDatabase } from '../utils/database.js'

export default defineEventHandler(async (event) => {
   const query = getQuery(event)
   const env = event.context.cloudflare?.env || {}

   if (query.secret !== env.CRON_SECRET) {
      return { status: false, message: 'Unauthorized' }
   }

   const stats = await cleanDatabase(env.DB, 30)
   return { status: true, stats }
})