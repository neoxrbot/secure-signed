import { getCloudflareEnv, jsonResponse } from '../../utils/index.js'
import { requireAdmin } from '../../utils/admin-auth.js'
import { addWhitelistIp } from '../../utils/database.js'
import { invalidateWhitelistCache } from '../../utils/anti-spam.js'
import appConfig from '../../utils/app-config.js'

function isValidIp(ip) {
   if (!ip || typeof ip !== 'string') return false
   const value = ip.trim()

   const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/
   if (ipv4.test(value)) {
      return value.split('.').every(part => {
         const n = Number(part)
         return n >= 0 && n <= 255
      })
   }

   // Basic IPv6 check
   if (value.includes(':') && /^[0-9a-fA-F:]+$/.test(value)) return true

   return false
}

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
      const body = await readBody(event)
      const ip = String(body?.ip || '').trim()
      const note = String(body?.note || '').trim()

      if (!ip)
         return jsonResponse(event, {
            creator: appConfig.watermark.creator,
            status: false,
            msg: 'IP parameter is required'
         }, 400)

      if (!isValidIp(ip))
         return jsonResponse(event, {
            creator: appConfig.watermark.creator,
            status: false,
            msg: 'Invalid IP address format'
         }, 400)

      const data = await addWhitelistIp(db, ip, note)
      invalidateWhitelistCache()

      return jsonResponse(event, {
         creator: appConfig.watermark.creator,
         status: true,
         msg: 'IP added to whitelist',
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
