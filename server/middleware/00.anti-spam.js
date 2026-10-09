import { antiSpam } from '../utils/anti-spam.js'
import { jsonResponse } from '../utils/index.js'
import appConfig from '../utils/app-config.js'

/**
 * Paths under /api that must bypass the anti-spam gate. This ensures the
 * administrator can always authenticate and manage the IP whitelist even if
 * their own IP would otherwise be rate-limited.
 */
const EXEMPT_PREFIXES = [
   '/api/admin',
   '/api/endpoints',
   '/api/ip',
   '/api/backup',
   '/api/cleanup'
]

function isExempt(pathname) {
   return EXEMPT_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?'))
}

export default defineEventHandler(async (event) => {
   const url = getRequestURL(event)
   const pathname = url.pathname.toLowerCase().replace(/\/$/, '')

   if (!pathname.startsWith('/api')) return
   if (isExempt(pathname)) return

   const result = await antiSpam(event)

   if (result) {
      return jsonResponse(event, {
         ...result.body,
         creator: appConfig.watermark.creator
      }, result.status)
   }
})
