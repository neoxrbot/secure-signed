import { getCloudflareEnv, jsonResponse } from '../../utils/index.js'
import { requireAdmin } from '../../utils/admin-auth.js'
import { removeWhitelistIp } from '../../utils/database.js'
import { invalidateWhitelistCache } from '../../utils/anti-spam.js'
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
      const query = getQuery(event)
      const ip = String(query?.ip || '').trim()

      if (!ip)
         return jsonResponse(event, {
            creator: appConfig.watermark.creator,
            status: false,
            msg: 'IP query parameter is required'
         }, 400)

      await removeWhitelistIp(db, ip)
      invalidateWhitelistCache()

      return jsonResponse(event, {
         creator: appConfig.watermark.creator,
         status: true,
         msg: 'IP removed from whitelist',
         data: { ip }
      })
   } catch (err) {
      return jsonResponse(event, {
         creator: appConfig.watermark.creator,
         status: false,
         msg: err.message
      }, 500)
   }
})
