import { getCloudflareEnv, jsonResponse } from '../../utils/index.js'
import { requireAdmin } from '../../utils/admin-auth.js'
import { getWhitelist } from '../../utils/database.js'
import appConfig from '../../utils/app-config.js'

export default defineEventHandler(async (event) => {
   try {
      await requireAdmin(event)
   } catch {
      return jsonResponse(event, {
         creator: appConfig.watermark.creator,
         status: false,
         msg: 'Admin login required'
      }, 401)
   }

   const env = getCloudflareEnv(event)
   const db = env?.DB

   if (!db)
      return jsonResponse(event, {
         creator: appConfig.watermark.creator,
         status: false,
         msg: 'Database D1 binding not found'
      }, 500)

   try {
      const data = await getWhitelist(db)
      return jsonResponse(event, {
         creator: appConfig.watermark.creator,
         status: true,
         data
      })
   } catch (err) {
      return jsonResponse(event, {
         creator: appConfig.watermark.creator,
         status: false,
         msg: err.message
      }, 500)
   }
})
